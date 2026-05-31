/**
 * Live system health daemon. Samples CPU%, heap, RSS, event-loop lag, and
 * network latency on an interval and emits threshold breaches.
 *
 *   const mon = new HealthMonitor({ intervalMs: 2000 });
 *   mon.on("sample", s => console.log(s));
 *   mon.on("alert", a => console.warn("ALERT", a));
 *   mon.start();
 */
import os from "os";
import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import { connect } from "net";

export interface HealthSample {
  ts: string;
  cpuPercent: number;
  loadAvg1: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  eventLoopLagMs: number;
  networkLatencyMs: number | null;
  uptimeSec: number;
}

export interface Thresholds {
  cpuPercent: number;
  heapUsedMB: number;
  eventLoopLagMs: number;
  networkLatencyMs: number;
}

export interface MonitorOptions {
  intervalMs?: number;
  thresholds?: Partial<Thresholds>;
  pingHost?: string;
  pingPort?: number;
}

export interface Alert {
  metric: keyof Thresholds;
  value: number;
  threshold: number;
  ts: string;
}

export class HealthMonitor extends EventEmitter {
  private readonly intervalMs: number;
  private readonly thresholds: Thresholds;
  private readonly pingHost: string;
  private readonly pingPort: number;
  private timer: NodeJS.Timeout | null = null;
  private lastCpu: os.CpuInfo["times"] | null = null;
  private lastLoopCheck = performance.now();
  private loopLag = 0;
  private loopTimer: NodeJS.Timeout | null = null;

  constructor(opts: MonitorOptions = {}) {
    super();
    this.intervalMs = opts.intervalMs ?? 5000;
    this.thresholds = {
      cpuPercent: opts.thresholds?.cpuPercent ?? 85,
      heapUsedMB: opts.thresholds?.heapUsedMB ?? 512,
      eventLoopLagMs: opts.thresholds?.eventLoopLagMs ?? 100,
      networkLatencyMs: opts.thresholds?.networkLatencyMs ?? 300,
    };
    this.pingHost = opts.pingHost ?? "1.1.1.1";
    this.pingPort = opts.pingPort ?? 443;
  }

  /** Aggregate CPU usage across all cores since the last call. */
  private cpuPercent(): number {
    const cpus = os.cpus();
    const agg = cpus.reduce(
      (acc, c) => {
        for (const k of Object.keys(c.times) as (keyof os.CpuInfo["times"])[]) acc[k] += c.times[k];
        return acc;
      },
      { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
    );
    if (!this.lastCpu) {
      this.lastCpu = agg;
      return 0;
    }
    const idleDelta = agg.idle - this.lastCpu.idle;
    const totalDelta =
      (Object.keys(agg) as (keyof os.CpuInfo["times"])[]).reduce(
        (s, k) => s + (agg[k] - this.lastCpu![k]),
        0
      );
    this.lastCpu = agg;
    if (totalDelta <= 0) return 0;
    return Math.min(100, Math.max(0, (1 - idleDelta / totalDelta) * 100));
  }

  /** TCP-connect latency to a host:port (non-blocking, resource-cleaned). */
  private measureLatency(): Promise<number | null> {
    return new Promise((resolve) => {
      const start = performance.now();
      const socket = connect({ host: this.pingHost, port: this.pingPort });
      let settled = false;
      const done = (val: number | null) => {
        if (settled) return;
        settled = true;
        socket.destroy(); // strict cleanup
        resolve(val);
      };
      socket.setTimeout(this.thresholds.networkLatencyMs * 3);
      socket.once("connect", () => done(+(performance.now() - start).toFixed(2)));
      socket.once("timeout", () => done(null));
      socket.once("error", () => done(null));
    });
  }

  private async sample(): Promise<void> {
    const mem = process.memoryUsage();
    const latency = await this.measureLatency();
    const s: HealthSample = {
      ts: new Date().toISOString(),
      cpuPercent: +this.cpuPercent().toFixed(2),
      loadAvg1: +os.loadavg()[0].toFixed(2),
      heapUsedMB: +(mem.heapUsed / 1048576).toFixed(2),
      heapTotalMB: +(mem.heapTotal / 1048576).toFixed(2),
      rssMB: +(mem.rss / 1048576).toFixed(2),
      eventLoopLagMs: +this.loopLag.toFixed(2),
      networkLatencyMs: latency,
      uptimeSec: +process.uptime().toFixed(0),
    };
    this.emit("sample", s);
    this.check(s);
  }

  private check(s: HealthSample): void {
    const breaches: Array<[keyof Thresholds, number]> = [
      ["cpuPercent", s.cpuPercent],
      ["heapUsedMB", s.heapUsedMB],
      ["eventLoopLagMs", s.eventLoopLagMs],
    ];
    if (s.networkLatencyMs !== null) breaches.push(["networkLatencyMs", s.networkLatencyMs]);
    for (const [metric, value] of breaches) {
      const threshold = this.thresholds[metric];
      if (value > threshold) {
        this.emit("alert", { metric, value, threshold, ts: s.ts } as Alert);
      }
    }
  }

  start(): this {
    if (this.timer) return this;
    // Event-loop lag probe: expected 50ms tick; extra delay = lag.
    this.lastLoopCheck = performance.now();
    this.loopTimer = setInterval(() => {
      const now = performance.now();
      this.loopLag = Math.max(0, now - this.lastLoopCheck - 50);
      this.lastLoopCheck = now;
    }, 50);
    if (typeof this.loopTimer.unref === "function") this.loopTimer.unref();

    this.timer = setInterval(() => void this.sample(), this.intervalMs);
    void this.sample();
    return this;
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
    this.removeAllListeners();
  }
}

// Run standalone:  ts-node health-monitor.ts   (or compile to JS)
if (require.main === module) {
  const mon = new HealthMonitor({ intervalMs: 2000 });
  mon.on("sample", (s: HealthSample) => process.stdout.write(JSON.stringify(s) + "\n"));
  mon.on("alert", (a: Alert) =>
    process.stderr.write(`ALERT ${a.metric}=${a.value} > ${a.threshold} @ ${a.ts}\n`)
  );
  mon.start();
  process.once("SIGINT", () => { mon.stop(); process.exit(0); });
}
