import React, { useEffect, useState } from "react";

/**
 * LandingHero - animated, conversion-focused hero section.
 * Tailwind required. Drop into any React app: <LandingHero />
 */
export default function LandingHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <span
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-indigo-200 backdrop-blur transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          Live at the hackathon - built in 24h
        </span>

        <h1
          className={`max-w-4xl bg-gradient-to-br from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent transition-all duration-700 [animation-delay:120ms] sm:text-7xl ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Ship the future,
          <br /> before the clock runs out.
        </h1>

        <p
          className={`mt-6 max-w-2xl text-lg text-slate-300 transition-all duration-700 [animation-delay:240ms] ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          The all-in-one platform that turns your boldest idea into a polished,
          demo-ready product - with real-time intelligence baked in.
        </p>

        <div
          className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-700 [animation-delay:360ms] ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <a
            href="#get-started"
            className="group relative inline-flex items-center justify-center rounded-xl bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0"
          >
            Get Started Free
            <span className="ml-2 transition-transform group-hover:translate-x-1">-&gt;</span>
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            Watch 90s Demo
          </a>
        </div>

        <div
          className={`mt-12 flex items-center gap-8 text-sm text-slate-400 transition-all duration-700 [animation-delay:480ms] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <div><span className="block text-2xl font-bold text-white">24h</span>to build</div>
          <div className="h-8 w-px bg-white/10" />
          <div><span className="block text-2xl font-bold text-white">&#8734;</span>possibilities</div>
          <div className="h-8 w-px bg-white/10" />
          <div><span className="block text-2xl font-bold text-white">#1</span>the goal</div>
        </div>
      </div>
    </section>
  );
}
