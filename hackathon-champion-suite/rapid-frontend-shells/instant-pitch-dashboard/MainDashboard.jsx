import React, { useEffect, useState } from "react";
import MetricCards from "./MetricCards";

/**
 * MainDashboard - self-contained dashboard with simulated real-time state.
 * No backend required: metrics tick on an interval. Optionally connect to the
 * websocket simulator at ws://localhost:8080 (auto-detected, falls back to sim).
 */
export default function MainDashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 48230, users: 1284, conversion: 3.7, latency: 42,
  });
  const [series, setSeries] = useState(Array.from({ length: 24 }, (_, i) => 30 + Math.round(Math.sin(i / 3) * 18 + i)));
  const [live, setLive] = useState(false);

  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket("ws://localhost:8080");
      ws.onopen = () => setLive(true);
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.metrics) setMetrics((m) => ({ ...m, ...d.metrics }));
      };
      ws.onerror = () => setLive(false);
    } catch { setLive(false); }
    return () => ws && ws.close();
  }, []);

  // Local simulation fallback so the demo is never blank.
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((m) => ({
        revenue: m.revenue + Math.round(Math.random() * 400),
        users: m.users + Math.round(Math.random() * 12),
        conversion: +(3 + Math.random() * 2).toFixed(2),
        latency: 30 + Math.round(Math.random() * 40),
      }));
      setSeries((s) => [...s.slice(1), 30 + Math.round(Math.random() * 80)]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const max = Math.max(...series, 1);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Command Center</h1>
          <p className="text-sm text-slate-400">Real-time product metrics</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${live ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
          <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 animate-ping" : "bg-amber-400 animate-pulse"}`} />
          {live ? "LIVE - websocket" : "SIMULATED"}
        </span>
      </header>

      <div className="mx-auto max-w-6xl">
        <MetricCards metrics={metrics} />

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Traffic (last 24 intervals)</h2>
            <span className="text-xs text-slate-400">auto-updating</span>
          </div>
          <div className="flex h-48 items-end gap-1.5">
            {series.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-fuchsia-500 transition-all duration-500"
                style={{ height: `${(v / max) * 100}%` }}
                title={`${v}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
