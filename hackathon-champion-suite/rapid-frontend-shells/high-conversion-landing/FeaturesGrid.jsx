import React from "react";

const FEATURES = [
  { icon: "⚡", title: "Blazing Fast", desc: "Sub-second interactions and instant feedback on every action." },
  { icon: "🤖", title: "AI-Powered", desc: "Real-time intelligence that adapts to each user automatically." },
  { icon: "🔒", title: "Secure by Default", desc: "Encryption and least-privilege access from line one." },
  { icon: "📊", title: "Live Analytics", desc: "Watch metrics update in real time via WebSockets." },
  { icon: "🌐", title: "Deploy Anywhere", desc: "One-click static hosting to Vercel or Netlify." },
  { icon: "🎯", title: "Built to Win", desc: "Polished UI and micro-interactions judges remember." },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to <span className="text-indigo-400">win</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            A complete toolkit engineered for the 24-hour sprint.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-3xl transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
