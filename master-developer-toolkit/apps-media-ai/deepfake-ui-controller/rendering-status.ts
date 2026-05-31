/**
 * rendering-status.ts
 * ---------------------------------------------------------------------------
 * Strongly-typed finite-state machine + reactive store for render jobs driven
 * by `websocket-pipeline.js`. Lives on the client; mirrors server-authoritative
 * state while enforcing legal client-side transitions and computing derived
 * UI values (ETA, throughput, percentage).
 * ---------------------------------------------------------------------------
 */

export type JobState =
  | 'queued'
  | 'preparing'
  | 'processing'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Allowed transitions. Any transition not listed is rejected. */
const TRANSITIONS: Readonly<Record<JobState, ReadonlyArray<JobState>>> = {
  queued: ['preparing', 'processing', 'cancelled', 'failed'],
  preparing: ['processing', 'cancelled', 'failed'],
  processing: ['finalizing', 'completed', 'cancelled', 'failed'],
  finalizing: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

export interface FrameStats {
  total: number;
  done: number;
}

export interface JobSnapshot {
  id: string;
  kind: string;
  state: JobState;
  progress: number; // 0..1
  frames: FrameStats;
  createdAt: number;
  error: string | null;
}

export interface DerivedStatus {
  percent: number; // 0..100, rounded
  fps: number; // frames/sec over the recent window
  etaMs: number | null; // null when not computable
  elapsedMs: number;
  isTerminal: boolean;
}

type Subscriber = (snapshot: JobSnapshot, derived: DerivedStatus) => void;

export class RenderStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderStatusError';
  }
}

export function isTerminal(state: JobState): boolean {
  return state === 'completed' || state === 'failed' || state === 'cancelled';
}

export function canTransition(from: JobState, to: JobState): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

/** Tracks a single job, including a sliding window for throughput/ETA. */
export class RenderStatus {
  private snapshot: JobSnapshot;
  private readonly subscribers = new Set<Subscriber>();
  private readonly samples: Array<{ ts: number; done: number }> = [];
  private readonly windowMs: number;

  constructor(initial: JobSnapshot, windowMs = 5000) {
    this.snapshot = { ...initial, frames: { ...initial.frames } };
    this.windowMs = windowMs;
    this.samples.push({ ts: Date.now(), done: initial.frames.done });
  }

  get id(): string {
    return this.snapshot.id;
  }

  get state(): JobState {
    return this.snapshot.state;
  }

  getSnapshot(): JobSnapshot {
    return { ...this.snapshot, frames: { ...this.snapshot.frames } };
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.getSnapshot(), this.derive());
    return () => this.subscribers.delete(fn);
  }

  /**
   * Applies a server-authoritative update. Validates the FSM transition and
   * recomputes derived stats. Server is source of truth, but illegal jumps are
   * surfaced as errors so desync bugs are caught early.
   */
  apply(update: Partial<JobSnapshot> & { state?: JobState }): void {
    if (update.state && !canTransition(this.snapshot.state, update.state)) {
      throw new RenderStatusError(
        `illegal transition ${this.snapshot.state} → ${update.state} for job ${this.snapshot.id}`,
      );
    }

    if (update.frames) {
      this.snapshot.frames = { ...this.snapshot.frames, ...update.frames };
      this.pushSample(this.snapshot.frames.done);
    }
    if (typeof update.progress === 'number') {
      this.snapshot.progress = clamp01(update.progress);
    } else if (this.snapshot.frames.total > 0) {
      this.snapshot.progress = clamp01(this.snapshot.frames.done / this.snapshot.frames.total);
    }
    if (update.state) this.snapshot.state = update.state;
    if (update.error !== undefined) this.snapshot.error = update.error;
    if (update.kind) this.snapshot.kind = update.kind;

    if (this.snapshot.state === 'completed') this.snapshot.progress = 1;

    this.notify();
  }

  private pushSample(done: number): void {
    const now = Date.now();
    this.samples.push({ ts: now, done });
    const cutoff = now - this.windowMs;
    while (this.samples.length > 2 && this.samples[0].ts < cutoff) this.samples.shift();
  }

  /** Computes percent, recent fps, and ETA from the sliding window. */
  derive(): DerivedStatus {
    const now = Date.now();
    const elapsedMs = now - this.snapshot.createdAt;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];

    let fps = 0;
    if (first && last && last.ts > first.ts) {
      fps = ((last.done - first.done) * 1000) / (last.ts - first.ts);
    }

    let etaMs: number | null = null;
    const { total, done } = this.snapshot.frames;
    if (!isTerminal(this.snapshot.state) && total > 0 && fps > 0) {
      etaMs = ((total - done) / fps) * 1000;
    }

    return {
      percent: Math.round(this.snapshot.progress * 100),
      fps: Number.isFinite(fps) ? Math.max(0, fps) : 0,
      etaMs,
      elapsedMs,
      isTerminal: isTerminal(this.snapshot.state),
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    const derived = this.derive();
    for (const fn of this.subscribers) {
      try { fn(snap, derived); } catch { /* isolate subscriber failures */ }
    }
  }
}

/** Aggregates many jobs and surfaces a single reactive collection for the UI. */
export class RenderStatusStore {
  private readonly jobs = new Map<string, RenderStatus>();
  private readonly listeners = new Set<(jobs: JobSnapshot[]) => void>();

  upsert(snapshot: JobSnapshot): RenderStatus {
    const existing = this.jobs.get(snapshot.id);
    if (existing) {
      existing.apply(snapshot);
      this.broadcast();
      return existing;
    }
    const status = new RenderStatus(snapshot);
    this.jobs.set(snapshot.id, status);
    this.broadcast();
    return status;
  }

  get(id: string): RenderStatus | undefined {
    return this.jobs.get(id);
  }

  remove(id: string): void {
    if (this.jobs.delete(id)) this.broadcast();
  }

  /** Removes all terminal jobs; returns the count purged. */
  pruneTerminal(): number {
    let n = 0;
    for (const [id, s] of this.jobs) {
      if (isTerminal(s.state)) { this.jobs.delete(id); n++; }
    }
    if (n) this.broadcast();
    return n;
  }

  list(): JobSnapshot[] {
    return [...this.jobs.values()].map((s) => s.getSnapshot());
  }

  onChange(fn: (jobs: JobSnapshot[]) => void): () => void {
    this.listeners.add(fn);
    fn(this.list());
    return () => this.listeners.delete(fn);
  }

  private broadcast(): void {
    const list = this.list();
    for (const fn of this.listeners) {
      try { fn(list); } catch { /* isolate */ }
    }
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
