'use strict';

/**
 * High-Performance Redis Cache Layer
 * ----------------------------------
 * Multi-pattern caching manager built on `ioredis` implementing:
 *   - Cache-Aside (lazy loading) with single-flight stampede protection
 *   - Write-Through (synchronous cache + datastore writes)
 *   - Write-Behind helper (fire-and-forget async persistence)
 *   - Namespaced keys + versioned invalidation (logical "cache busting")
 *   - TTL with jitter to prevent synchronized expiry (cache avalanche)
 *   - Distributed locks (SET NX PX) for coordinated rebuilds
 *   - Transparent JSON (de)serialization
 *   - Connection resilience via ioredis retryStrategy with exponential backoff
 *
 * The data isolation strategy keeps every tenant/domain under a key prefix so
 * a single Redis cluster can host many logically separated caches safely.
 *
 * Environment variables:
 *   REDIS_URL (e.g. redis://:pass@host:6379/0), CACHE_NAMESPACE, CACHE_DEFAULT_TTL
 */

const Redis = require('ioredis');
const crypto = require('crypto');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CacheManager {
  /**
   * @param {object} [options]
   * @param {string} [options.url] Redis connection URL
   * @param {import('ioredis').Redis} [options.client] pre-built ioredis client
   * @param {string} [options.namespace] key prefix for data isolation
   * @param {number} [options.defaultTtlSeconds]
   * @param {number} [options.ttlJitterRatio] 0..1 random TTL spread (default 0.1)
   */
  constructor(options = {}) {
    this.namespace = options.namespace || process.env.CACHE_NAMESPACE || 'app';
    this.defaultTtl =
      options.defaultTtlSeconds || Number(process.env.CACHE_DEFAULT_TTL || 300);
    this.ttlJitterRatio = options.ttlJitterRatio ?? 0.1;
    this.version = options.version || 'v1';

    this.client =
      options.client ||
      new Redis(options.url || process.env.REDIS_URL || 'redis://localhost:6379', {
        lazyConnect: false,
        maxRetriesPerRequest: 3,
        enableAutoPipelining: true,
        // Exponential backoff (capped) for reconnects.
        retryStrategy(times) {
          const delay = Math.min(2000, 50 * 2 ** times);
          return delay + Math.floor(Math.random() * 100); // + jitter
        },
        reconnectOnError(err) {
          // Reconnect on READONLY errors (failover to a new primary).
          return /READONLY/.test(err.message);
        },
      });

    // In-process single-flight registry: collapses concurrent misses for the
    // same key into one loader invocation (per Node process).
    this._inflight = new Map();

    this.metrics = { hits: 0, misses: 0, errors: 0, writes: 0 };
  }

  /** Build a fully-qualified, version-namespaced key. */
  key(logicalKey) {
    return `${this.namespace}:${this.version}:${logicalKey}`;
  }

  _ttlWithJitter(ttlSeconds) {
    const ttl = ttlSeconds ?? this.defaultTtl;
    if (!this.ttlJitterRatio) return ttl;
    const spread = ttl * this.ttlJitterRatio;
    return Math.max(1, Math.round(ttl - spread / 2 + Math.random() * spread));
  }

  _serialize(value) {
    return JSON.stringify({ v: value });
  }

  _deserialize(raw) {
    if (raw == null) return undefined;
    try {
      return JSON.parse(raw).v;
    } catch {
      return undefined;
    }
  }

  /**
   * Raw GET (deserialized). Returns `undefined` on miss.
   * @param {string} logicalKey
   */
  async get(logicalKey) {
    try {
      const raw = await this.client.get(this.key(logicalKey));
      if (raw == null) {
        this.metrics.misses += 1;
        return undefined;
      }
      this.metrics.hits += 1;
      return this._deserialize(raw);
    } catch (err) {
      this.metrics.errors += 1;
      throw err;
    }
  }

  /**
   * Raw SET with TTL + jitter.
   * @param {string} logicalKey
   * @param {*} value
   * @param {number} [ttlSeconds]
   */
  async set(logicalKey, value, ttlSeconds) {
    const ttl = this._ttlWithJitter(ttlSeconds);
    await this.client.set(this.key(logicalKey), this._serialize(value), 'EX', ttl);
    this.metrics.writes += 1;
    return true;
  }

  async del(logicalKey) {
    return this.client.del(this.key(logicalKey));
  }

  /**
   * CACHE-ASIDE (lazy loading).
   * Returns the cached value if present; otherwise invokes `loader`, caches the
   * result, and returns it. Concurrent misses for the same key are coalesced so
   * the backing store is hit at most once (per process) — and a distributed
   * lock guards against cross-process stampedes on expensive rebuilds.
   *
   * @template T
   * @param {string} logicalKey
   * @param {() => Promise<T>} loader function that fetches from the source of truth
   * @param {object} [opts]
   * @param {number} [opts.ttlSeconds]
   * @param {boolean} [opts.useDistributedLock] default true
   * @returns {Promise<T>}
   */
  async getOrSet(logicalKey, loader, opts = {}) {
    const cached = await this.get(logicalKey);
    if (cached !== undefined) return cached;

    // In-process single-flight.
    if (this._inflight.has(logicalKey)) {
      return this._inflight.get(logicalKey);
    }

    const promise = (async () => {
      const useLock = opts.useDistributedLock !== false;
      let lock = null;
      try {
        if (useLock) {
          lock = await this._acquireLock(logicalKey, 10000);
          if (!lock) {
            // Another node is rebuilding; briefly poll the cache.
            const polled = await this._pollForValue(logicalKey, 5, 100);
            if (polled !== undefined) return polled;
          }
        }
        // Double-check after acquiring the lock (value may now exist).
        const recheck = await this.get(logicalKey);
        if (recheck !== undefined) return recheck;

        const value = await loader();
        await this.set(logicalKey, value, opts.ttlSeconds);
        return value;
      } finally {
        if (lock) await this._releaseLock(logicalKey, lock);
        this._inflight.delete(logicalKey);
      }
    })();

    this._inflight.set(logicalKey, promise);
    return promise;
  }

  /**
   * WRITE-THROUGH.
   * Writes to the backing store and the cache as a single logical operation.
   * The datastore write is the source of truth; if it fails, the cache is not
   * updated and the error propagates. After a successful store write the cache
   * is refreshed so subsequent reads are warm.
   *
   * @template T
   * @param {string} logicalKey
   * @param {T} value
   * @param {(value: T) => Promise<T|void>} persist persists to source of truth
   * @param {object} [opts]
   * @param {number} [opts.ttlSeconds]
   * @returns {Promise<T>}
   */
  async writeThrough(logicalKey, value, persist, opts = {}) {
    if (typeof persist !== 'function') {
      throw new TypeError('persist must be a function(value) => Promise');
    }
    // 1) Persist to the source of truth first (authoritative).
    const persisted = await persist(value);
    const finalValue = persisted === undefined ? value : persisted;
    // 2) Update cache so reads are immediately consistent.
    await this.set(logicalKey, finalValue, opts.ttlSeconds);
    return finalValue;
  }

  /**
   * WRITE-BEHIND (write-back).
   * Updates the cache immediately and schedules the datastore write
   * asynchronously with retry. Lower write latency at the cost of a small
   * durability window. Failures are surfaced via the returned promise and the
   * optional onError callback.
   *
   * @template T
   * @param {string} logicalKey
   * @param {T} value
   * @param {(value: T) => Promise<void>} persist
   * @param {object} [opts]
   */
  writeBehind(logicalKey, value, persist, opts = {}) {
    const maxAttempts = opts.maxAttempts || 5;
    const baseMs = opts.baseMs || 200;
    const capMs = opts.capMs || 10000;

    // Cache update is synchronous-ish (awaited by caller if desired).
    const cacheWrite = this.set(logicalKey, value, opts.ttlSeconds);

    const persistWithRetry = (async () => {
      await cacheWrite;
      let attempt = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          await persist(value);
          return;
        } catch (err) {
          attempt += 1;
          if (attempt >= maxAttempts) {
            if (typeof opts.onError === 'function') opts.onError(err, value);
            throw err;
          }
          const delay = Math.min(capMs, baseMs * 2 ** attempt);
          await sleep(delay + Math.floor(Math.random() * 100));
        }
      }
    })();

    return { cacheWrite, persisted: persistWithRetry };
  }

  /**
   * Invalidate a key (cache-busting). Optionally bump the global version to
   * logically invalidate the entire namespace in O(1).
   */
  async invalidate(logicalKey) {
    return this.del(logicalKey);
  }

  /** Logically invalidate the whole namespace by rotating the version tag. */
  bumpVersion(newVersion) {
    this.version = newVersion || `v${Date.now()}`;
    return this.version;
  }

  // ---- Distributed lock (Redlock-lite, single-node) ----------------------

  async _acquireLock(logicalKey, ttlMs) {
    const token = crypto.randomUUID();
    const lockKey = `${this.key(logicalKey)}:lock`;
    const ok = await this.client.set(lockKey, token, 'PX', ttlMs, 'NX');
    return ok ? token : null;
  }

  async _releaseLock(logicalKey, token) {
    const lockKey = `${this.key(logicalKey)}:lock`;
    // Release only if we still own the lock (atomic compare-and-delete).
    const lua =
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
    try {
      await this.client.eval(lua, 1, lockKey, token);
    } catch {
      /* best-effort release */
    }
  }

  async _pollForValue(logicalKey, attempts, intervalMs) {
    for (let i = 0; i < attempts; i += 1) {
      await sleep(intervalMs);
      const v = await this.get(logicalKey);
      if (v !== undefined) return v;
    }
    return undefined;
  }

  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total === 0 ? 0 : this.metrics.hits / total,
    };
  }

  async close() {
    await this.client.quit();
  }
}

module.exports = { CacheManager };

// Quick self-test:  node cache-manager.js
if (require.main === module) {
  (async () => {
    const cache = new CacheManager({ namespace: 'demo', defaultTtlSeconds: 60 });
    let dbHits = 0;
    const loadUser = async () => {
      dbHits += 1;
      await sleep(50);
      return { id: 7, name: 'Ada Lovelace' };
    };

    const a = await cache.getOrSet('user:7', loadUser);
    const b = await cache.getOrSet('user:7', loadUser); // should be a cache hit
    console.log('[cache] value:', a, '| db hits:', dbHits, '| same:', JSON.stringify(a) === JSON.stringify(b));
    console.log('[cache] metrics:', cache.getMetrics());
    await cache.close();
  })().catch((err) => {
    console.error('[cache] error:', err.message);
    process.exit(1);
  });
}
