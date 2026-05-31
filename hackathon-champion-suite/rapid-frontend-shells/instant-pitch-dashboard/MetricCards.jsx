import React from "react";

const fmt = (n) => n.toLocaleString("en-US");

export default function MetricCards({ metrics }) {
  const cards = [
    { label: "Revenue", value: `$${fmt(metrics.revenue)}`, trend: "+12.4%", up: true },
    { label: "Active Users", value: fmt(metrics.users), trend: "+5.1%", up: true },
    { label: "Conversion", value: `${metrics.conversion}%`, trend: "+0.3%", up: true },
    { label: "Latency", value: `${metrics.latency}ms`, trend: "-8ms", up: false, good: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40"
        >
          <p className="text-sm text-slate-400">{c.label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{c.value}</p>
          <span
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              c.up || c.good ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {c.up ? "▲" : "▼"} {c.trend}
          </span>
        </div>
      ))}
    </div>
  );
}
