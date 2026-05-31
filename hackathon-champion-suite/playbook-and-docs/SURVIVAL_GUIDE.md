# 🏆 The 24-Hour Hackathon Survival Guide

> By a multi-time champion. Optimized for **judges' scorecards**, not perfection.

## 0. The Meta-Truth
Judges score **Demo + Story + Wow**, rarely your code quality. Build a *believable, polished
slice* of a big vision. A working 10% that demos flawlessly beats a broken 80%.

## 1. Hours 0–2 — Ideation (lock fast, never thrash)
- **Pick a track + sponsor prize.** Sponsor-prize submissions have far less competition.
- **Idea filter (score each 1–5, ship the highest):** Wow factor · Demoability · Feasibility in 24h · Story/impact.
- **One sentence:** "We help **[user]** do **[task]** by **[unique mechanism]**." If you can't say it, don't build it.
- **Scope ruthlessly:** one golden-path user journey. Everything else is fake/mocked.

## 2. Hours 2–4 — Architecture & Roles
- **Stack for speed (this repo's default):** React + Tailwind (frontend), Express/WS mock backend, deploy to Vercel/Netlify. Use mocks — never wait on a real backend.
- **Roles:** 1 Frontend/UI, 1 Backend/Integrations, 1 Pitch/Slides+Demo video. No idle hands.
- **De-risk early:** build the *demo path* first; if the AI/API is flaky, pre-record or seed mock data.

## 3. Hours 4–18 — Build the Golden Path
- **Vertical slice:** one feature, end to end, looking gorgeous.
- **Polish multiplier:** micro-interactions, gradients, smooth transitions, a hero section. Visual polish wins more points per hour than backend depth.
- **Commit every hour.** A working checkpoint you can revert to is your safety net.
- **Mock aggressively:** the included `mock-server.js` + `simulation-hub.js` fake real-time/AI instantly.

## 4. Hours 18–22 — Freeze, Deploy, Rehearse
- **Feature freeze at hour 18.** After this: only bug-fixes and polish.
- **Deploy NOW** (Vercel/Netlify). A live URL beats "it works on my laptop."
- **Record a 60–90s backup demo video.** Live demos fail; the video saves you.
- **Rehearse the pitch 3× out loud.** Time it.

## 5. The Pitch (see slide-framework.md)
- **Hook → Problem → Demo → Tech → Ask**, in 3 minutes.
- **Lead with the live demo**, not slides. Show, don't tell.
- **Name the hard tech** (judges reward technical depth they can *see*).

## 6. Judge Psychology — where points hide
- **Completeness signal:** a clean README + live link + video = "this team finished."
- **Story:** a relatable user and a real problem beat raw tech.
- **Confidence:** rehearsed, calm delivery reads as competence.

## 7. Anti-patterns that kill teams
Scope creep · rebuilding auth from scratch (use a provider/mock) · no deploy · no rehearsal ·
one person hoarding the repo · debugging at hour 23 instead of polishing.
