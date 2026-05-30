---
title: Game Theory
domain: 09 — Humanities & Master Skills
status: done
depth: graduate
prerequisites: [basic probability, logic]
last_updated: 2026-05-29
---

# Game Theory

Game theory is the **mathematics of strategic interaction** — how rational agents should act when
their outcomes depend on others' choices. It provides a rigorous vocabulary (equilibrium,
dominance, signaling) for everything from negotiation and pricing to evolution and international
relations. The core insight: *optimal individual choices can produce collectively bad outcomes* —
and understanding the structure lets you change the game.

## 1. Technical Mechanisms
- **The elements of a game:** players, **strategies** (available actions/plans), **payoffs**
  (preferences over outcomes), and information (who knows what, when). Games are simultaneous or
  sequential, one-shot or repeated, zero-sum or non-zero-sum, cooperative or non-cooperative.
- **Dominant strategies:** a strategy best regardless of others' choices. Rational players play
  dominant strategies; eliminate dominated ones.
- **Nash equilibrium:** a strategy profile where **no player can improve by unilaterally
  deviating**. Every finite game has at least one (possibly in mixed/randomized strategies — von
  Neumann/Nash). It's a *stability* concept, not necessarily an *optimal* or fair one.
- **The Prisoner's Dilemma:** mutual defection is the Nash equilibrium even though mutual
  cooperation pays both better — the canonical model of why self-interest can defeat collective
  good (arms races, overfishing, price wars).
- **Mixed strategies:** when no pure equilibrium exists, players randomize (e.g., matching
  pennies, penalty kicks) to keep opponents indifferent/unpredictable.
- **Sequential games & backward induction:** in games with order, solve from the end backward;
  **subgame-perfect equilibrium** rules out non-credible threats. First-mover vs. second-mover
  advantages.
- **Repeated games & the shadow of the future:** repetition enables cooperation via reciprocity
  (the **Folk Theorem**); **tit-for-tat** (Axelrod) — cooperate first, then mirror — performs
  remarkably well: nice, retaliatory, forgiving, clear.
- **Information & signaling:** asymmetric information drives **signaling** (costly, hard-to-fake
  signals — education, warranties) and **screening**; adverse selection and moral hazard.

## 2. Application Frameworks
- **Diagnose the game first:** identify players, payoffs, information, and repetition. Most
  strategic mistakes come from misreading the structure (e.g., treating a repeated relationship
  like a one-shot game).
- **Change the game, don't just play it:** alter payoffs (incentives, penalties), information
  (transparency, commitment), or who moves first. Credible **commitment** (burning bridges,
  contracts) can be a strategic advantage.
- **Cooperation engineering:** lengthen the shadow of the future (repeat interaction), make
  reputations visible, and enable reciprocity to escape prisoner's-dilemma traps — directly
  applicable to `negotiation.md` and team dynamics.
- **Domains:** auctions/pricing, negotiation (BATNA = your outside option = bargaining power),
  business strategy (entry deterrence, competition), evolutionary biology (ESS — evolutionarily
  stable strategies), and policy (public-goods/commons problems).

## 3. Common Pitfalls
1. Treating a **repeated** game as one-shot (defecting and destroying a relationship with future
value). 2. Assuming opponents are fully rational/identical to you (bounded rationality, emotions,
different payoffs). 3. Confusing Nash equilibrium with the *best* or fair outcome. 4. Making
**non-credible threats** (rational opponents ignore them). 5. Ignoring information asymmetry and
signaling. 6. Zero-sum thinking in non-zero-sum situations (missing cooperative value creation —
see `negotiation.md`). 7. Forgetting that you can *restructure* the game rather than just respond.

## 4. Advanced Resources
- von Neumann & Morgenstern, *Theory of Games and Economic Behavior* (foundational); Nash (1950)
  equilibrium papers; Axelrod, *The Evolution of Cooperation*; Dixit & Nalebuff, *The Art of
  Strategy* / *Thinking Strategically* (accessible); Schelling, *The Strategy of Conflict*
  (commitment, focal points).

### Cross-references
`negotiation.md` · `behavioral-logic.md` · `communication-frameworks.md` ·
`../10-curated-wisdom/macroeconomic-principles.md` ·
`../01-monetization-digital-empires/high-conversion-ads.md` (auctions)
