/**
 * Circuit Breaker + Resilience Assertion Framework
 * ------------------------------------------------
 * Two things in one module:
 *
 *  1. `CircuitBreaker` — a production-grade circuit breaker implementing the
 *     classic three-state machine (CLOSED -> OPEN -> HALF_OPEN) with rolling
 *     failure-rate windows, request timeouts, fallbacks, and bounded
 *     half-open probing. It prevents a failing dependency from cascading.
 *
 *  2. `BreakerEvaluator` — a structural assertion framework that drives a
 *     breaker (or any guarded subsystem) through failure scenarios and asserts
 *     that the application fails GRACEFULLY: the breaker trips, fallbacks
 *     engage, the system recovers, and no unhandled rejection escapes.
 *
 * Zero external dependencies — only standard timers and Promises.
 */

// ---- Circuit breaker -------------------------------------------------------

export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface BreakerOptions {
  /** Rolling window length in ms for failure-rate computation. Default 10_000. */
  rollingWindowMs?: number;
  /** Minimum requests in the window before the rate can trip. Default 10. */
  volumeThreshold?: number;
  /** Failure rate (0..1) that trips the breaker. Default 0.5. */
  errorThreshold?: number;
  /** Time the breaker stays OPEN before probing. Default 5_000. */
  openStateMs?: number;
  /** Per-call timeout in ms. Default 3_000. */
  timeoutMs?: number;
  /** Successful probes required in HALF_OPEN to close. Default 3. */
  halfOpenSuccessThreshold?: number;
  /** Concurrent probes allowed in HALF_OPEN. Default 1. */
  halfOpenMaxConcurrent?: number;
}

export interface BreakerMetrics {
  state: BreakerState;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  totalTimeouts: number;
  totalShortCircuited: number;
  totalFallbacks: number;
  rollingErrorRate: number;
  lastOpenedAt: number | null;
}

type Outcome = { ts: number; ok: boolean };

export class CircuitBreakerOpenError extends Error {
  constructor(name: string) {
    super(`circuit breaker "${name}" is OPEN — request short-circuited`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreakerTimeoutError extends Error {
  constructor(name: string, ms: number) {
    super(`circuit breaker "${name}" call exceeded ${ms}ms timeout`);
    this.name = 'CircuitBreakerTimeoutError';
  }
}

type StateListener = (from: BreakerState, to: BreakerState, name: string) => void;

export class CircuitBreaker<TArgs extends unknown[] = unknown[], TResult = unknown> {
  readonly name: string;
  private readonly opts: Required<BreakerOptions>;
  private readonly action: (...args: TArgs) => Promise<TResult>;
  private readonly fallback?: (...args: TArgs) => Promise<TResult> | TResult;

  private state: BreakerState = 'CLOSED';
  private outcomes: Outcome[] = [];
  private halfOpenSuccesses = 0;
  private halfOpenInFlight = 0;
  private openedAt: number | null = null;
  private stateListeners = new Set<StateListener>();

  private readonly m = {
    totalCalls: 0,
    totalFailures: 0,
    totalSuccesses: 0,
    totalTimeouts: 0,
    totalShortCircuited: 0,
    totalFallbacks: 0,
  };

  constructor(
    action: (...args: TArgs) => Promise<TResult>,
    options: BreakerOptions & {
      name?: string;
      fallback?: (...args: TArgs) => Promise<TResult> | TResult;
    } = {},
  ) {
    this.action = action;
    this.fallback = options.fallback;
    this.name = options.name ?? 'breaker';
    this.opts = {
      rollingWindowMs: options.rollingWindowMs ?? 10_000,
      volumeThreshold: options.volumeThreshold ?? 10,
      errorThreshold: options.errorThreshold ?? 0.5,
      openStateMs: options.openStateMs ?? 5_000,
      timeoutMs: options.timeoutMs ?? 3_000,
      halfOpenSuccessThreshold: options.halfOpenSuccessThreshold ?? 3,
      halfOpenMaxConcurrent: options.halfOpenMaxConcurrent ?? 1,
    };
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private transition(to: BreakerState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    if (to === 'OPEN') this.openedAt = Date.now();
    if (to === 'CLOSED') {
      this.outcomes = [];
      this.halfOpenSuccesses = 0;
    }
    if (to === 'HALF_OPEN') {
      this.halfOpenSuccesses = 0;
      this.halfOpenInFlight = 0;
    }
    for (const l of this.stateListeners) {
      try {
        l(from, to, this.name);
      } catch {
        /* listener isolation */
      }
    }
  }

  private prune(now: number): void {
    const cutoff = now - this.opts.rollingWindowMs;
    // outcomes is append-only & time-ordered; drop the stale prefix.
    let i = 0;
    while (i < this.outcomes.length && this.outcomes[i].ts < cutoff) i += 1;
    if (i > 0) this.outcomes = this.outcomes.slice(i);
  }

  private errorRate(now: number): { rate: number; volume: number } {
    this.prune(now);
    const volume = this.outcomes.length;
    if (volume === 0) return { rate: 0, volume };
    const failures = this.outcomes.reduce((acc, o) => acc + (o.ok ? 0 : 1), 0);
    return { rate: failures / volume, volume };
  }

  private record(ok: boolean): void {
    const now = Date.now();
    this.outcomes.push({ ts: now, ok });
    if (ok) this.m.totalSuccesses += 1;
    else this.m.totalFailures += 1;

    if (this.state === 'CLOSED') {
      const { rate, volume } = this.errorRate(now);
      if (volume >= this.opts.volumeThreshold && rate >= this.opts.errorThreshold) {
        this.transition('OPEN');
      }
    }
  }

  private async runWithTimeout(args: TArgs): Promise<TResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        this.action(...args),
        new Promise<TResult>((_, reject) => {
          timer = setTimeout(() => {
            this.m.totalTimeouts += 1;
            reject(new CircuitBreakerTimeoutError(this.name, this.opts.timeoutMs));
          }, this.opts.timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private async useFallbackOrThrow(args: TArgs, cause: Error): Promise<TResult> {
    if (this.fallback) {
      this.m.totalFallbacks += 1;
      return this.fallback(...args);
    }
    throw cause;
  }

  /** Execute the guarded action, honoring the breaker state machine. */
  async execute(...args: TArgs): Promise<TResult> {
    this.m.totalCalls += 1;
    const now = Date.now();

    // OPEN: short-circuit until the cool-down elapses, then probe.
    if (this.state === 'OPEN') {
      if (this.openedAt !== null && now - this.openedAt >= this.opts.openStateMs) {
        this.transition('HALF_OPEN');
      } else {
        this.m.totalShortCircuited += 1;
        return this.useFallbackOrThrow(args, new CircuitBreakerOpenError(this.name));
      }
    }

    // HALF_OPEN: allow a bounded number of probes; reject extras to fallback.
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInFlight >= this.opts.halfOpenMaxConcurrent) {
        this.m.totalShortCircuited += 1;
        return this.useFallbackOrThrow(args, new CircuitBreakerOpenError(this.name));
      }
      this.halfOpenInFlight += 1;
      try {
        const result = await this.runWithTimeout(args);
        this.record(true);
        this.halfOpenSuccesses += 1;
        if (this.halfOpenSuccesses >= this.opts.halfOpenSuccessThreshold) {
          this.transition('CLOSED');
        }
        return result;
      } catch (err) {
        this.record(false);
        this.transition('OPEN'); // any probe failure re-opens immediately
        return this.useFallbackOrThrow(args, err as Error);
      } finally {
        this.halfOpenInFlight -= 1;
      }
    }

    // CLOSED: normal operation with failure accounting.
    try {
      const result = await this.runWithTimeout(args);
      this.record(true);
      return result;
    } catch (err) {
      this.record(false);
      return this.useFallbackOrThrow(args, err as Error);
    }
  }

  getState(): BreakerState {
    return this.state;
  }

  /** Force a state (testing / operational override). */
  forceState(state: BreakerState): void {
    this.transition(state);
  }

  getMetrics(): BreakerMetrics {
    const { rate } = this.errorRate(Date.now());
    return {
      state: this.state,
      totalCalls: this.m.totalCalls,
      totalFailures: this.m.totalFailures,
      totalSuccesses: this.m.totalSuccesses,
      totalTimeouts: this.m.totalTimeouts,
      totalShortCircuited: this.m.totalShortCircuited,
      totalFallbacks: this.m.totalFallbacks,
      rollingErrorRate: rate,
      lastOpenedAt: this.openedAt,
    };
  }
}

// ---- Resilience assertion framework ----------------------------------------

export interface AssertionResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface ScenarioResult {
  scenario: string;
  passed: boolean;
  assertions: AssertionResult[];
  metrics: BreakerMetrics;
  durationMs: number;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Drives breakers through failure scenarios and asserts graceful degradation.
 * Designed to run in CI as a structural resilience gate.
 */
export class BreakerEvaluator {
  private readonly results: ScenarioResult[] = [];

  /**
   * Run a scenario: a builder produces a breaker + an async workload that
   * exercises it; `assert` callbacks then verify post-conditions.
   */
  async runScenario(
    scenario: string,
    setup: () => {
      breaker: CircuitBreaker<never[], unknown>;
      drive: () => Promise<void>;
    },
    assertions: Array<{
      name: string;
      check: (breaker: CircuitBreaker<never[], unknown>) => boolean;
      detail?: (breaker: CircuitBreaker<never[], unknown>) => string;
    }>,
  ): Promise<ScenarioResult> {
    const start = Date.now();
    const { breaker, drive } = setup();

    let driveError: Error | null = null;
    try {
      await drive();
    } catch (err) {
      // A scenario driver should itself never throw unhandled — record it.
      driveError = err as Error;
    }

    const assertionResults: AssertionResult[] = assertions.map((a) => {
      let passed = false;
      let detail = '';
      try {
        passed = a.check(breaker);
        detail = a.detail ? a.detail(breaker) : '';
      } catch (err) {
        passed = false;
        detail = `assertion threw: ${(err as Error).message}`;
      }
      return { name: a.name, passed, detail };
    });

    if (driveError) {
      assertionResults.push({
        name: 'driver did not leak an unhandled error',
        passed: false,
        detail: `driver threw: ${driveError.message}`,
      });
    }

    const result: ScenarioResult = {
      scenario,
      passed: assertionResults.every((r) => r.passed),
      assertions: assertionResults,
      metrics: breaker.getMetrics(),
      durationMs: Date.now() - start,
    };
    this.results.push(result);
    return result;
  }

  getResults(): readonly ScenarioResult[] {
    return [...this.results];
  }

  /** Aggregate pass/fail summary suitable for a CI exit code. */
  summary(): { total: number; passed: number; failed: number; ok: boolean } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    return { total, passed, failed: total - passed, ok: passed === total };
  }

  /** Render a human-readable report. */
  report(): string {
    const lines: string[] = [];
    for (const r of this.results) {
      lines.push(`${r.passed ? 'PASS' : 'FAIL'}  ${r.scenario}  (${r.durationMs}ms)`);
      for (const a of r.assertions) {
        lines.push(`   ${a.passed ? '✓' : '✗'} ${a.name}${a.detail ? ` — ${a.detail}` : ''}`);
      }
      lines.push(
        `   metrics: state=${r.metrics.state} calls=${r.metrics.totalCalls} ` +
          `fail=${r.metrics.totalFailures} fb=${r.metrics.totalFallbacks} ` +
          `short=${r.metrics.totalShortCircuited} rate=${r.metrics.rollingErrorRate.toFixed(2)}`,
      );
    }
    const s = this.summary();
    lines.push(`\n${s.passed}/${s.total} scenarios passed`);
    return lines.join('\n');
  }
}

export default BreakerEvaluator;

// ---- Built-in self-verifying scenario suite (run with ts-node) -------------
declare const require: NodeJS.Require | undefined;
declare const module: NodeJS.Module | undefined;
declare const process: NodeJS.Process;

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  (async () => {
    const evaluator = new BreakerEvaluator();

    // Scenario 1: a hard-down dependency must trip the breaker and use fallback.
    await evaluator.runScenario(
      'dependency fully down trips breaker and serves fallback',
      () => {
        const breaker = new CircuitBreaker<never[], string>(
          async () => {
            throw new Error('dependency unavailable');
          },
          {
            name: 'down-dep',
            volumeThreshold: 5,
            errorThreshold: 0.5,
            openStateMs: 200,
            timeoutMs: 100,
            fallback: () => 'FALLBACK',
          },
        );
        const drive = async () => {
          for (let i = 0; i < 12; i += 1) {
            const out = await breaker.execute();
            // Every call must resolve to the fallback, never reject.
            if (out !== 'FALLBACK') throw new Error('expected fallback value');
          }
        };
        return { breaker: breaker as unknown as CircuitBreaker<never[], unknown>, drive };
      },
      [
        { name: 'breaker is OPEN', check: (b) => b.getState() === 'OPEN' },
        {
          name: 'some calls were short-circuited',
          check: (b) => b.getMetrics().totalShortCircuited > 0,
          detail: (b) => `short=${b.getMetrics().totalShortCircuited}`,
        },
        {
          name: 'all failures absorbed by fallback',
          check: (b) => b.getMetrics().totalFallbacks === b.getMetrics().totalCalls,
        },
      ],
    );

    // Scenario 2: a recovering dependency must close the breaker again.
    await evaluator.runScenario(
      'breaker recovers (HALF_OPEN -> CLOSED) after dependency heals',
      () => {
        let healthy = false;
        const breaker = new CircuitBreaker<never[], string>(
          async () => {
            if (!healthy) throw new Error('still down');
            return 'OK';
          },
          {
            name: 'recovering-dep',
            volumeThreshold: 5,
            errorThreshold: 0.5,
            openStateMs: 150,
            timeoutMs: 100,
            halfOpenSuccessThreshold: 3,
            fallback: () => 'FALLBACK',
          },
        );
        const drive = async () => {
          for (let i = 0; i < 10; i += 1) await breaker.execute(); // trip it
          healthy = true; // dependency heals
          await sleep(180); // wait out the OPEN cool-down
          for (let i = 0; i < 5; i += 1) await breaker.execute(); // probe to close
        };
        return { breaker: breaker as unknown as CircuitBreaker<never[], unknown>, drive };
      },
      [
        { name: 'breaker returned to CLOSED', check: (b) => b.getState() === 'CLOSED' },
        {
          name: 'recorded successful recoveries',
          check: (b) => b.getMetrics().totalSuccesses >= 3,
          detail: (b) => `successes=${b.getMetrics().totalSuccesses}`,
        },
      ],
    );

    // Scenario 3: slow dependency must be cut off by the per-call timeout.
    await evaluator.runScenario(
      'slow dependency is bounded by call timeout',
      () => {
        const breaker = new CircuitBreaker<never[], string>(
          async () => {
            await sleep(500); // exceeds the 100ms timeout
            return 'TOO LATE';
          },
          {
            name: 'slow-dep',
            volumeThreshold: 3,
            errorThreshold: 0.5,
            openStateMs: 200,
            timeoutMs: 100,
            fallback: () => 'FALLBACK',
          },
        );
        const drive = async () => {
          for (let i = 0; i < 6; i += 1) await breaker.execute();
        };
        return { breaker: breaker as unknown as CircuitBreaker<never[], unknown>, drive };
      },
      [
        {
          name: 'timeouts were recorded',
          check: (b) => b.getMetrics().totalTimeouts > 0,
          detail: (b) => `timeouts=${b.getMetrics().totalTimeouts}`,
        },
        { name: 'breaker tripped OPEN from timeouts', check: (b) => b.getState() === 'OPEN' },
      ],
    );

    // eslint-disable-next-line no-console
    console.log(evaluator.report());
    if (!evaluator.summary().ok) process.exitCode = 1;
  })();
}
