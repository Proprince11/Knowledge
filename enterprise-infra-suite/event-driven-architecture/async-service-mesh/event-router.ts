/**
 * Async Service Mesh — Event Routing Engine
 * -----------------------------------------
 * An in-process, transport-agnostic event router that autonomously distributes
 * background tasks to registered handlers. Designed to sit on top of any broker
 * (the AMQP consumer in ../message-broker, Kafka, SQS, etc.) or run standalone.
 *
 * Features:
 *   - Pattern-based subscriptions (exact + wildcard segments, e.g. "order.*")
 *   - Bounded concurrency with an internal work queue (backpressure-safe)
 *   - Per-task retry with exponential backoff + jitter
 *   - Middleware pipeline (logging, tracing, validation, auth context)
 *   - Dead-letter sink for tasks that exhaust their retry budget
 *   - Strong typing for event payloads via a generic event map
 *   - Graceful drain that waits for in-flight tasks to settle
 *
 * No external dependencies — compiles with `tsc` and runs under ts-node/Node.
 */

export type EventPayloadMap = Record<string, unknown>;

export interface EventEnvelope<T = unknown> {
  /** Routing topic, dot-delimited, e.g. "order.created". */
  readonly type: string;
  /** Strongly-typed payload. */
  readonly payload: T;
  /** Correlation id propagated across the mesh for tracing. */
  readonly correlationId: string;
  /** Unix epoch millis when the event entered the mesh. */
  readonly timestamp: number;
  /** Arbitrary transport/application metadata. */
  readonly headers: Record<string, string | number | boolean>;
  /** Internal: current delivery attempt (0-based). */
  attempt: number;
}

export type EventHandler<T = unknown> = (
  event: EventEnvelope<T>,
) => Promise<void> | void;

export type Middleware = (
  event: EventEnvelope,
  next: () => Promise<void>,
) => Promise<void>;

export interface RouterOptions {
  /** Maximum tasks executing concurrently. Default: 16. */
  concurrency?: number;
  /** Maximum queued tasks before `dispatch` rejects. Default: 10_000. */
  maxQueueDepth?: number;
  /** Max delivery attempts before dead-lettering. Default: 5. */
  maxAttempts?: number;
  /** Base backoff in ms. Default: 200. */
  retryBaseMs?: number;
  /** Backoff cap in ms. Default: 30_000. */
  retryCapMs?: number;
}

export interface DeadLetter {
  event: EventEnvelope;
  error: Error;
  attempts: number;
  failedAt: number;
}

interface Subscription {
  pattern: string;
  segments: string[];
  handler: EventHandler;
  id: number;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function backoffWithJitter(attempt: number, baseMs: number, capMs: number): number {
  const exponential = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.floor(Math.random() * exponential);
}

/** Minimal typed event emitter for router lifecycle/observability events. */
type RouterLifecycle =
  | 'task:started'
  | 'task:completed'
  | 'task:retry'
  | 'task:dead-lettered'
  | 'queue:full'
  | 'drained';

export class EventRouter<TEvents extends EventPayloadMap = EventPayloadMap> {
  private readonly concurrency: number;
  private readonly maxQueueDepth: number;
  private readonly maxAttempts: number;
  private readonly retryBaseMs: number;
  private readonly retryCapMs: number;

  private readonly subscriptions: Subscription[] = [];
  private readonly middlewares: Middleware[] = [];
  private readonly queue: EventEnvelope[] = [];
  private readonly deadLetters: DeadLetter[] = [];
  private readonly listeners = new Map<RouterLifecycle, Set<(info: unknown) => void>>();

  private active = 0;
  private subSeq = 0;
  private draining = false;
  private idleResolvers: Array<() => void> = [];

  constructor(options: RouterOptions = {}) {
    this.concurrency = options.concurrency ?? 16;
    this.maxQueueDepth = options.maxQueueDepth ?? 10_000;
    this.maxAttempts = options.maxAttempts ?? 5;
    this.retryBaseMs = options.retryBaseMs ?? 200;
    this.retryCapMs = options.retryCapMs ?? 30_000;
  }

  /** Register an observability listener. */
  on(event: RouterLifecycle, listener: (info: unknown) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return this;
  }

  private emit(event: RouterLifecycle, info: unknown): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      try {
        listener(info);
      } catch {
        /* listener errors must never break routing */
      }
    }
  }

  /** Append a middleware to the processing pipeline (executed in order). */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Subscribe a handler to a routing pattern.
   * Patterns are dot-delimited; `*` matches exactly one segment and `#`
   * (only valid as the final segment) matches one or more segments.
   *   "order.created"  -> exact
   *   "order.*"        -> order.created, order.cancelled (one segment)
   *   "order.#"        -> order.created, order.line.added (one or more)
   *
   * @returns an unsubscribe function.
   */
  subscribe<K extends keyof TEvents & string>(
    pattern: K | string,
    handler: EventHandler<K extends keyof TEvents ? TEvents[K] : unknown>,
  ): () => void {
    const id = ++this.subSeq;
    const sub: Subscription = {
      pattern,
      segments: pattern.split('.'),
      handler: handler as EventHandler,
      id,
    };
    this.subscriptions.push(sub);
    return () => {
      const idx = this.subscriptions.findIndex((s) => s.id === id);
      if (idx >= 0) this.subscriptions.splice(idx, 1);
    };
  }

  /** Match a concrete topic against a subscription pattern. */
  private matches(patternSegments: string[], topicSegments: string[]): boolean {
    let p = 0;
    let t = 0;
    while (p < patternSegments.length && t < topicSegments.length) {
      const seg = patternSegments[p];
      if (seg === '#') return true; // matches the remainder
      if (seg !== '*' && seg !== topicSegments[t]) return false;
      p += 1;
      t += 1;
    }
    return p === patternSegments.length && t === topicSegments.length;
  }

  /**
   * Submit an event for asynchronous routing. Resolves immediately once the
   * task is enqueued (or throws if the queue is saturated — backpressure).
   */
  dispatch<K extends keyof TEvents & string>(
    type: K | string,
    payload: K extends keyof TEvents ? TEvents[K] : unknown,
    meta: Partial<Pick<EventEnvelope, 'correlationId' | 'headers'>> = {},
  ): void {
    if (this.queue.length >= this.maxQueueDepth) {
      this.emit('queue:full', { depth: this.queue.length });
      throw new Error(
        `EventRouter queue saturated at ${this.maxQueueDepth}; rejecting "${type}"`,
      );
    }
    const envelope: EventEnvelope = {
      type,
      payload,
      correlationId: meta.correlationId ?? cryptoRandomId(),
      timestamp: Date.now(),
      headers: meta.headers ?? {},
      attempt: 0,
    };
    this.queue.push(envelope);
    this.pump();
  }

  /** Drive the work queue up to the configured concurrency. */
  private pump(): void {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const event = this.queue.shift()!;
      this.active += 1;
      void this.process(event).finally(() => {
        this.active -= 1;
        if (this.active === 0 && this.queue.length === 0) {
          this.emit('drained', { deadLetters: this.deadLetters.length });
          const resolvers = this.idleResolvers;
          this.idleResolvers = [];
          resolvers.forEach((r) => r());
        }
        this.pump();
      });
    }
  }

  /** Run the middleware pipeline + matched handlers for a single event. */
  private async process(event: EventEnvelope): Promise<void> {
    this.emit('task:started', { type: event.type, attempt: event.attempt });
    try {
      const matched = this.subscriptions.filter((s) =>
        this.matches(s.segments, event.type.split('.')),
      );

      const runHandlers = async (): Promise<void> => {
        // Fan out to all matched handlers; a failure in any triggers retry.
        await Promise.all(matched.map((s) => Promise.resolve(s.handler(event))));
      };

      // Compose middleware around the handler invocation.
      const composed = this.middlewares.reduceRight<() => Promise<void>>(
        (next, mw) => () => Promise.resolve(mw(event, next)),
        runHandlers,
      );

      await composed();
      this.emit('task:completed', { type: event.type, attempt: event.attempt });
    } catch (err) {
      await this.handleFailure(event, err as Error);
    }
  }

  private async handleFailure(event: EventEnvelope, error: Error): Promise<void> {
    const nextAttempt = event.attempt + 1;
    if (nextAttempt >= this.maxAttempts) {
      const dl: DeadLetter = {
        event,
        error,
        attempts: nextAttempt,
        failedAt: Date.now(),
      };
      this.deadLetters.push(dl);
      this.emit('task:dead-lettered', dl);
      return;
    }
    const delay = backoffWithJitter(nextAttempt, this.retryBaseMs, this.retryCapMs);
    this.emit('task:retry', { type: event.type, attempt: nextAttempt, delay });
    await sleep(delay);
    // Re-enqueue with an incremented attempt counter.
    const retried: EventEnvelope = { ...event, attempt: nextAttempt };
    this.queue.push(retried);
    this.pump();
  }

  /** Snapshot of dead-lettered tasks for inspection / replay. */
  getDeadLetters(): readonly DeadLetter[] {
    return [...this.deadLetters];
  }

  /** Re-dispatch a previously dead-lettered event (manual recovery). */
  replayDeadLetter(index: number): boolean {
    const dl = this.deadLetters[index];
    if (!dl) return false;
    this.deadLetters.splice(index, 1);
    this.dispatch(dl.event.type, dl.event.payload as never, {
      correlationId: dl.event.correlationId,
      headers: dl.event.headers,
    });
    return true;
  }

  /** Current queue depth + in-flight count (for metrics/health checks). */
  stats(): { queued: number; active: number; deadLetters: number } {
    return {
      queued: this.queue.length,
      active: this.active,
      deadLetters: this.deadLetters.length,
    };
  }

  /**
   * Wait until the queue is empty and no tasks are in flight.
   * Use during graceful shutdown after the upstream source stops dispatching.
   */
  async drain(timeoutMs = 30_000): Promise<boolean> {
    this.draining = true;
    if (this.active === 0 && this.queue.length === 0) return true;
    return Promise.race([
      new Promise<boolean>((resolve) => this.idleResolvers.push(() => resolve(true))),
      sleep(timeoutMs).then(() => false),
    ]);
  }

  isDraining(): boolean {
    return this.draining;
  }
}

/** Generate a URL-safe random id without external deps. */
function cryptoRandomId(): string {
  // Works in Node (globalThis.crypto) and modern runtimes.
  const g = globalThis as unknown as { crypto?: Crypto };
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  // Fallback: timestamp + random.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default EventRouter;
