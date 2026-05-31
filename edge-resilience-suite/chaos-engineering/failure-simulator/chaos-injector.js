'use strict';

/**
 * Chaos Injector — Controlled Failure Simulation
 * ----------------------------------------------
 * A chaos-engineering automation tool that deliberately degrades a service to
 * validate resilience: high network latency, memory pressure ("leaks"),
 * intermittent service dropouts, error injection, and CPU stalls.
 *
 * SAFETY MODEL (fail-closed, defense-in-depth)
 * --------------------------------------------
 * Chaos can cause real damage, so this tool is GUARDED BY MULTIPLE INDEPENDENT
 * TOGGLES and refuses to arm unless ALL of them agree. It can NEVER run by
 * accident in production:
 *
 *   1. Environment denylist  — if NODE_ENV / APP_ENV looks like production
 *                              (production|prod|live|canary), chaos is hard-OFF.
 *   2. Explicit opt-in flag  — env `CHAOS_ENABLED` must equal the literal
 *                              string "true" (any other value = OFF).
 *   3. Acknowledgement token — env `CHAOS_ACK` must equal the literal
 *                              "I_UNDERSTAND_THIS_IS_NOT_PRODUCTION".
 *   4. Constructor switch    — `armed: true` must be passed explicitly in code.
 *
 * If any check fails, the injector becomes an inert NO-OP: every method returns
 * immediately without side effects, and `isArmed()` reports false. This makes
 * it safe to leave wired into application code permanently.
 *
 * Pure Node (only `process` + timers); no external dependencies.
 */

const PRODUCTION_MARKERS = ['production', 'prod', 'live', 'canary'];
const REQUIRED_ACK = 'I_UNDERSTAND_THIS_IS_NOT_PRODUCTION';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Evaluate every safety gate. Returns a structured decision (fail-closed). */
function evaluateSafety(options, env) {
  const reasons = [];

  const rawEnv = String(env.NODE_ENV || env.APP_ENV || '').toLowerCase();
  const looksProd = PRODUCTION_MARKERS.some((m) => rawEnv === m || rawEnv.includes(m));
  if (looksProd) reasons.push(`environment "${rawEnv}" is production-like`);

  // Gate 2: explicit env opt-in (unless caller fully bypasses via options.env).
  const enabledFlag = String(env.CHAOS_ENABLED || '').trim();
  if (enabledFlag !== 'true') reasons.push('CHAOS_ENABLED is not exactly "true"');

  // Gate 3: acknowledgement token.
  const ack = String(env.CHAOS_ACK || '').trim();
  if (ack !== REQUIRED_ACK) reasons.push('CHAOS_ACK acknowledgement token missing/incorrect');

  // Gate 4: explicit constructor switch.
  if (options.armed !== true) reasons.push('constructor `armed: true` not provided');

  return { armed: reasons.length === 0, reasons };
}

class ChaosInjector {
  /**
   * @param {object} [options]
   * @param {boolean} [options.armed] explicit code-level switch (must be true)
   * @param {NodeJS.ProcessEnv} [options.env] override environment (for tests)
   * @param {(event: object) => void} [options.onEvent] observability hook
   */
  constructor(options = {}) {
    this.env = options.env || process.env;
    this.onEvent = typeof options.onEvent === 'function' ? options.onEvent : () => {};

    const decision = evaluateSafety(options, this.env);
    this._armed = decision.armed;
    this._safetyReasons = decision.reasons;

    // Active experiment registry so everything can be reverted cleanly.
    this._leakBuffers = [];
    this._leakTimer = null;
    this._activeExperiments = new Set();

    this._emit('init', { armed: this._armed, reasons: this._safetyReasons });
  }

  _emit(type, detail) {
    try {
      this.onEvent({ type, detail, ts: Date.now() });
    } catch {
      /* observability must never break the app */
    }
  }

  /** @returns {boolean} whether chaos is actually enabled. */
  isArmed() {
    return this._armed;
  }

  /** @returns {string[]} human-readable reasons chaos is disarmed (if any). */
  getSafetyReasons() {
    return [...this._safetyReasons];
  }

  /** Internal guard used by every experiment. */
  _guard(name) {
    if (this._armed) return true;
    this._emit('blocked', { experiment: name, reasons: this._safetyReasons });
    return false;
  }

  // ---- Experiment: network latency ----------------------------------------

  /**
   * Wrap an async function so it is delayed by a randomized latency before
   * (and optionally after) execution — simulating slow networks/dependencies.
   * When disarmed, returns the function unchanged (zero overhead).
   *
   * @template {(...args: any[]) => Promise<any>} F
   * @param {F} fn
   * @param {object} [opts]
   * @param {number} [opts.minMs] default 100
   * @param {number} [opts.maxMs] default 1500
   * @param {number} [opts.probability] 0..1 chance to inject per call (default 1)
   * @returns {F}
   */
  withLatency(fn, opts = {}) {
    if (!this._guard('latency')) return fn;
    const minMs = opts.minMs ?? 100;
    const maxMs = opts.maxMs ?? 1500;
    const probability = opts.probability ?? 1;
    const self = this;
    return /** @type {any} */ (async function chaosLatencyWrapper(...args) {
      if (Math.random() < probability) {
        const delay = Math.floor(minMs + Math.random() * Math.max(0, maxMs - minMs));
        self._emit('latency:injected', { delay });
        await sleep(delay);
      }
      return fn.apply(this, args);
    });
  }

  // ---- Experiment: service dropout / fault injection ----------------------

  /**
   * Wrap an async function so it intermittently throws, simulating a flaky or
   * dropped downstream dependency.
   *
   * @template {(...args: any[]) => Promise<any>} F
   * @param {F} fn
   * @param {object} [opts]
   * @param {number} [opts.failureRate] 0..1 (default 0.25)
   * @param {Error} [opts.error] error to throw (default ECONNRESET-like)
   * @returns {F}
   */
  withDropout(fn, opts = {}) {
    if (!this._guard('dropout')) return fn;
    const failureRate = opts.failureRate ?? 0.25;
    const self = this;
    return /** @type {any} */ (async function chaosDropoutWrapper(...args) {
      if (Math.random() < failureRate) {
        self._emit('dropout:injected', { failureRate });
        const err = opts.error || new Error('CHAOS: simulated service dropout (ECONNRESET)');
        /** @type {any} */ (err).code = /** @type {any} */ (err).code || 'ECONNRESET';
        /** @type {any} */ (err).chaos = true;
        throw err;
      }
      return fn.apply(this, args);
    });
  }

  // ---- Experiment: memory pressure ("leak") --------------------------------

  /**
   * Allocate retained memory at a fixed cadence to simulate a leak and validate
   * that memory guards / autoscaling / OOM handling behave correctly.
   * Bounded by `maxTotalMb` so the test host itself stays controllable.
   *
   * @param {object} [opts]
   * @param {number} [opts.chunkMb] per-tick allocation (default 5)
   * @param {number} [opts.intervalMs] allocation cadence (default 1000)
   * @param {number} [opts.maxTotalMb] hard ceiling (default 200)
   * @returns {() => void} a stop+release function
   */
  startMemoryLeak(opts = {}) {
    if (!this._guard('memory-leak')) return () => {};
    const chunkMb = opts.chunkMb ?? 5;
    const intervalMs = opts.intervalMs ?? 1000;
    const maxTotalMb = opts.maxTotalMb ?? 200;

    this._activeExperiments.add('memory-leak');
    this._emit('memory-leak:start', { chunkMb, intervalMs, maxTotalMb });

    this._leakTimer = setInterval(() => {
      const currentMb = this._leakBuffers.length * chunkMb;
      if (currentMb >= maxTotalMb) {
        this._emit('memory-leak:ceiling', { currentMb });
        return; // hold at ceiling; do not OOM the host
      }
      // Fill the buffer so the allocation is real (not lazily paged).
      const buf = Buffer.alloc(chunkMb * 1024 * 1024, 0x5a);
      this._leakBuffers.push(buf);
      this._emit('memory-leak:tick', { retainedMb: this._leakBuffers.length * chunkMb });
    }, intervalMs);
    if (this._leakTimer.unref) this._leakTimer.unref();

    return () => this.stopMemoryLeak();
  }

  /** Stop the leak and release all retained buffers for GC. */
  stopMemoryLeak() {
    if (this._leakTimer) {
      clearInterval(this._leakTimer);
      this._leakTimer = null;
    }
    const releasedMb = this._leakBuffers.length * 5;
    this._leakBuffers.length = 0; // drop references -> eligible for GC
    this._activeExperiments.delete('memory-leak');
    this._emit('memory-leak:stop', { releasedMb });
  }

  // ---- Experiment: CPU stall ----------------------------------------------

  /**
   * Busy-wait to simulate a CPU-bound stall / event-loop block for `durationMs`.
   * Use sparingly — this intentionally blocks the loop to test timeouts.
   * @param {number} durationMs
   */
  burnCpu(durationMs = 250) {
    if (!this._guard('cpu-stall')) return;
    this._emit('cpu-stall:injected', { durationMs });
    const end = Date.now() + durationMs;
    // eslint-disable-next-line no-empty
    while (Date.now() < end) { /* deliberate busy loop */ }
  }

  // ---- Experiment: Express/Connect middleware ------------------------------

  /**
   * Produce middleware that injects latency + dropouts into an HTTP pipeline.
   * Inert (calls `next()` immediately) when disarmed.
   * @param {object} [opts] same shape as withLatency/withDropout combined
   * @returns {(req: any, res: any, next: Function) => void}
   */
  middleware(opts = {}) {
    if (!this._armed) {
      return (req, res, next) => next();
    }
    const latencyMin = opts.minMs ?? 50;
    const latencyMax = opts.maxMs ?? 800;
    const failureRate = opts.failureRate ?? 0.1;
    const self = this;

    return async (req, res, next) => {
      try {
        if (Math.random() < (opts.latencyProbability ?? 0.5)) {
          const delay = Math.floor(latencyMin + Math.random() * (latencyMax - latencyMin));
          self._emit('http:latency', { delay, path: req.url });
          await sleep(delay);
        }
        if (Math.random() < failureRate) {
          self._emit('http:fault', { path: req.url });
          res.statusCode = 503;
          res.setHeader('X-Chaos', 'dropout');
          res.end(JSON.stringify({ error: 'chaos_simulated_unavailable' }));
          return;
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  /** Revert every active experiment and disarm side effects. */
  reset() {
    this.stopMemoryLeak();
    this._activeExperiments.clear();
    this._emit('reset', {});
  }

  /** Snapshot of current experiment state for dashboards/tests. */
  status() {
    return {
      armed: this._armed,
      safetyReasons: this._safetyReasons,
      activeExperiments: [...this._activeExperiments],
      retainedLeakBuffers: this._leakBuffers.length,
    };
  }
}

module.exports = { ChaosInjector, evaluateSafety, REQUIRED_ACK, PRODUCTION_MARKERS };

// Demo:  CHAOS_ENABLED=true CHAOS_ACK=I_UNDERSTAND_THIS_IS_NOT_PRODUCTION NODE_ENV=development node chaos-injector.js
if (require.main === module) {
  (async () => {
    const chaos = new ChaosInjector({ armed: true, onEvent: (e) => console.log('[chaos]', e.type, e.detail) });
    console.log('[chaos] status:', chaos.status());

    if (!chaos.isArmed()) {
      console.log('[chaos] DISARMED — refusing to run. Reasons:', chaos.getSafetyReasons());
      console.log('[chaos] To arm (NON-PROD ONLY): set CHAOS_ENABLED=true and CHAOS_ACK=' + REQUIRED_ACK);
      return;
    }

    const flakyCall = chaos.withDropout(
      chaos.withLatency(async () => 'origin-response', { minMs: 50, maxMs: 200 }),
      { failureRate: 0.5 },
    );

    for (let i = 0; i < 4; i += 1) {
      try {
        const out = await flakyCall();
        console.log(`[chaos] call #${i} ok ->`, out);
      } catch (err) {
        console.log(`[chaos] call #${i} failed ->`, err.message);
      }
    }
    chaos.reset();
  })();
}
