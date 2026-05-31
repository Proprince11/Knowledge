'use strict';

/**
 * analytics-pipeline.js
 * ---------------------------------------------------------------------------
 * High-performance in-process analytics aggregation pipeline.
 *
 * Ingests a high-volume event stream and maintains pre-aggregated, time-bucketed
 * rollups using flat Maps (no per-event object retention). Supports:
 *   - Tumbling time windows (e.g., 1m / 5m / 1h buckets).
 *   - Counters, sums, uniques (HyperLogLog), and streaming quantiles (P²).
 *   - Dimensional breakdowns (group-by) with cardinality guards.
 *   - O(1) amortized ingest; queries are range scans over compact buckets.
 *
 * Pure Node.js. Designed to sit behind an HTTP ingest endpoint and a dashboard
 * query API. A flush hook lets you persist sealed buckets to a column store.
 * ---------------------------------------------------------------------------
 */

/* ----------------------- HyperLogLog (uniques) -------------------------- */

/**
 * Compact HyperLogLog for approximate unique counts. p=14 → 16384 registers,
 * ~0.81% standard error, 16 KB per estimator. Far cheaper than a Set for
 * high-cardinality dimensions like userId.
 */
class HyperLogLog {
  constructor(p = 14) {
    this.p = p;
    this.m = 1 << p;
    this.registers = new Uint8Array(this.m);
    this.alpha = this.m === 16 ? 0.673 : this.m === 32 ? 0.697 : this.m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / this.m);
  }

  static _hash(str) {
    // 32-bit FNV-1a; sufficient mixing for HLL bucketing.
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  add(value) {
    const x = HyperLogLog._hash(String(value));
    const idx = x >>> (32 - this.p);
    const w = (x << this.p) | (1 << (this.p - 1)); // guard bit so rank is bounded
    const rank = Math.clz32(w) + 1;
    if (rank > this.registers[idx]) this.registers[idx] = rank;
  }

  count() {
    let sum = 0;
    let zeros = 0;
    for (let i = 0; i < this.m; i++) {
      sum += 1 / (1 << this.registers[i]);
      if (this.registers[i] === 0) zeros++;
    }
    let est = (this.alpha * this.m * this.m) / sum;
    // Small-range correction (linear counting).
    if (est <= 2.5 * this.m && zeros > 0) est = this.m * Math.log(this.m / zeros);
    return Math.round(est);
  }

  merge(other) {
    for (let i = 0; i < this.m; i++) {
      if (other.registers[i] > this.registers[i]) this.registers[i] = other.registers[i];
    }
  }
}

/* --------------------- P² streaming quantiles --------------------------- */

/**
 * The P² algorithm estimates a quantile in O(1) memory without storing samples.
 * Used for latency percentiles (p50/p95/p99) on a metric stream.
 */
class P2Quantile {
  constructor(q) {
    this.q = q;
    this.n = [];     // marker positions
    this.np = [];     // desired positions
    this.dn = [];     // increments
    this.heights = [];
    this.count = 0;
  }

  add(x) {
    if (this.count < 5) {
      this.heights.push(x);
      this.count++;
      if (this.count === 5) {
        this.heights.sort((a, b) => a - b);
        this.n = [0, 1, 2, 3, 4];
        this.np = [0, 2 * this.q, 4 * this.q, 2 + 2 * this.q, 4];
        this.dn = [0, this.q / 2, this.q, (1 + this.q) / 2, 1];
      }
      return;
    }
    let k;
    if (x < this.heights[0]) { this.heights[0] = x; k = 0; }
    else if (x >= this.heights[4]) { this.heights[4] = x; k = 3; }
    else { k = 0; while (x >= this.heights[k + 1]) k++; }

    for (let i = k + 1; i < 5; i++) this.n[i]++;
    for (let i = 0; i < 5; i++) this.np[i] += this.dn[i];

    for (let i = 1; i <= 3; i++) {
      const d = this.np[i] - this.n[i];
      if ((d >= 1 && this.n[i + 1] - this.n[i] > 1) || (d <= -1 && this.n[i - 1] - this.n[i] < -1)) {
        const sign = Math.sign(d);
        const parab = this._parabolic(i, sign);
        this.heights[i] =
          this.heights[i - 1] < parab && parab < this.heights[i + 1]
            ? parab
            : this._linear(i, sign);
        this.n[i] += sign;
      }
    }
    this.count++;
  }

  _parabolic(i, d) {
    const h = this.heights, n = this.n;
    return (
      h[i] +
      (d / (n[i + 1] - n[i - 1])) *
        ((n[i] - n[i - 1] + d) * (h[i + 1] - h[i]) / (n[i + 1] - n[i]) +
          (n[i + 1] - n[i] - d) * (h[i] - h[i - 1]) / (n[i] - n[i - 1]))
    );
  }

  _linear(i, d) {
    const h = this.heights, n = this.n;
    return h[i] + d * (h[i + d] - h[i]) / (n[i + d] - n[i]);
  }

  value() {
    if (this.count === 0) return null;
    if (this.count < 5) {
      const sorted = [...this.heights].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(this.q * sorted.length))];
    }
    return this.heights[2];
  }
}

/* -------------------------- Bucket + Pipeline --------------------------- */

class Bucket {
  constructor(startMs) {
    this.startMs = startMs;
    this.counters = new Map(); // metric -> count
    this.sums = new Map();      // metric -> sum
    this.uniques = new Map();   // metric -> HyperLogLog
    this.quantiles = new Map(); // metric -> { p50, p95, p99 }
    this.dimensions = new Map(); // metric|dim=val -> count
  }
}

class AnalyticsPipeline {
  /**
   * @param {object} opts
   * @param {number} [opts.bucketMs=60000] tumbling window size.
   * @param {number} [opts.retentionBuckets=1440] sealed buckets to retain (24h@1m).
   * @param {number} [opts.maxDimCardinality=1000] guard against group-by blowups.
   * @param {(bucket:object)=>void} [opts.onSeal] hook to persist sealed buckets.
   */
  constructor(opts = {}) {
    this.bucketMs = opts.bucketMs ?? 60_000;
    this.retention = opts.retentionBuckets ?? 1440;
    this.maxDimCardinality = opts.maxDimCardinality ?? 1000;
    this.onSeal = opts.onSeal ?? null;
    this.buckets = new Map(); // startMs -> Bucket
    this.dimCardinality = new Map(); // metric -> Set of seen dim keys (bounded)
  }

  _bucketStart(ts) {
    return ts - (ts % this.bucketMs);
  }

  _getBucket(ts) {
    const start = this._bucketStart(ts);
    let b = this.buckets.get(start);
    if (!b) {
      b = new Bucket(start);
      this.buckets.set(start, b);
      this._sealOld();
    }
    return b;
  }

  /**
   * Ingest one event.
   * @param {object} ev
   * @param {string} ev.metric metric name (e.g. 'page_view', 'api_latency_ms').
   * @param {number} [ev.value=1] numeric value for sum/quantile metrics.
   * @param {string} [ev.unique] identity to count uniquely (e.g. userId).
   * @param {Object<string,string>} [ev.dims] dimensions to break down by.
   * @param {number} [ev.ts=Date.now()]
   * @param {boolean} [ev.quantile] track latency quantiles for this metric.
   */
  ingest(ev) {
    const ts = ev.ts ?? Date.now();
    const b = this._getBucket(ts);
    const metric = ev.metric;
    if (!metric) throw new Error('event.metric required');

    b.counters.set(metric, (b.counters.get(metric) ?? 0) + 1);

    if (typeof ev.value === 'number') {
      b.sums.set(metric, (b.sums.get(metric) ?? 0) + ev.value);
      if (ev.quantile) {
        let q = b.quantiles.get(metric);
        if (!q) { q = { p50: new P2Quantile(0.5), p95: new P2Quantile(0.95), p99: new P2Quantile(0.99) }; b.quantiles.set(metric, q); }
        q.p50.add(ev.value); q.p95.add(ev.value); q.p99.add(ev.value);
      }
    }

    if (ev.unique != null) {
      let hll = b.uniques.get(metric);
      if (!hll) { hll = new HyperLogLog(14); b.uniques.set(metric, hll); }
      hll.add(ev.unique);
    }

    if (ev.dims) {
      const seen = this.dimCardinality.get(metric) ?? new Set();
      for (const [dim, val] of Object.entries(ev.dims)) {
        const key = `${metric}|${dim}=${val}`;
        if (!seen.has(key) && seen.size >= this.maxDimCardinality) continue; // guard
        seen.add(key);
        b.dimensions.set(key, (b.dimensions.get(key) ?? 0) + 1);
      }
      this.dimCardinality.set(metric, seen);
    }
  }

  /** Seals + evicts buckets beyond retention, invoking the persist hook. */
  _sealOld() {
    if (this.buckets.size <= this.retention) return;
    const starts = [...this.buckets.keys()].sort((a, b) => a - b);
    while (starts.length > this.retention) {
      const oldest = starts.shift();
      const bucket = this.buckets.get(oldest);
      this.buckets.delete(oldest);
      if (this.onSeal) {
        try { this.onSeal(this._materialize(bucket)); } catch { /* persistence is best-effort */ }
      }
    }
  }

  _materialize(b) {
    const quantiles = {};
    for (const [m, q] of b.quantiles) quantiles[m] = { p50: q.p50.value(), p95: q.p95.value(), p99: q.p99.value() };
    const uniques = {};
    for (const [m, hll] of b.uniques) uniques[m] = hll.count();
    return {
      startMs: b.startMs,
      endMs: b.startMs + this.bucketMs,
      counters: Object.fromEntries(b.counters),
      sums: Object.fromEntries(b.sums),
      uniques,
      quantiles,
      dimensions: Object.fromEntries(b.dimensions),
    };
  }

  /**
   * Range query over [fromMs, toMs). Returns materialized buckets plus an
   * aggregate roll-up across the range.
   */
  query({ fromMs, toMs = Date.now(), metric } = {}) {
    const from = this._bucketStart(fromMs ?? toMs - this.bucketMs * 60);
    const series = [];
    const totals = { count: 0, sum: 0 };
    const mergedHLL = new HyperLogLog(14);

    for (const [start, bucket] of [...this.buckets.entries()].sort((a, b) => a[0] - b[0])) {
      if (start < from || start >= toMs) continue;
      const mat = this._materialize(bucket);
      if (metric) {
        series.push({
          startMs: mat.startMs,
          count: mat.counters[metric] ?? 0,
          sum: mat.sums[metric] ?? 0,
          unique: mat.uniques[metric] ?? 0,
          quantiles: mat.quantiles[metric] ?? null,
        });
        totals.count += mat.counters[metric] ?? 0;
        totals.sum += mat.sums[metric] ?? 0;
        const hll = bucket.uniques.get(metric);
        if (hll) mergedHLL.merge(hll);
      } else {
        series.push(mat);
      }
    }

    return {
      fromMs: from,
      toMs,
      bucketMs: this.bucketMs,
      series,
      totals: metric ? { ...totals, unique: mergedHLL.count() } : null,
    };
  }
}

module.exports = { AnalyticsPipeline, HyperLogLog, P2Quantile, Bucket };
