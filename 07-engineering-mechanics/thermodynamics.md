---
title: Thermodynamics
domain: 07 — Engineering & Mechanics
status: done
depth: graduate
prerequisites: [calculus, basic physics]
last_updated: 2026-05-29
---

# Thermodynamics

Thermodynamics is the science of **energy, its transformations, and the directional limits on
those transformations**. Its four laws constrain every engine, refrigerator, chemical reaction,
and living cell — they define what is *possible*, and the second law defines what is *inevitable*.

## 1. Technical Mechanisms
- **Zeroth law:** if A and B are each in thermal equilibrium with C, they are with each other →
  defines temperature and makes thermometry possible.
- **First law (energy conservation):** `ΔU = Q − W` — internal energy change = heat added minus
  work done by the system. Energy is neither created nor destroyed; perpetual-motion machines of
  the first kind are impossible.
- **Second law (entropy):** total entropy of an isolated system never decreases:
  `ΔS_universe ≥ 0`. Heat flows spontaneously hot→cold; no process can convert heat *entirely*
  into work. Defines the **arrow of time** and the ceiling on engine efficiency.
- **Third law:** entropy → a constant minimum as T → absolute zero (0 K unreachable in finite
  steps).
- **Key state functions:** internal energy U, enthalpy `H = U + PV`, entropy S, Gibbs free energy
  `G = H − TS` (spontaneity at constant T,P: ΔG < 0), Helmholtz free energy.

## 2. Application Frameworks
- **Carnot efficiency (the hard ceiling):** `η_Carnot = 1 − T_cold/T_hot` (absolute
  temperatures). No heat engine between two reservoirs can beat it — this is *why* engines reject
  waste heat and why higher combustion temps raise efficiency (see `ice-vs-ev-powertrains.md`).
- **Thermodynamic cycles:** **Otto** (gasoline), **Diesel**, **Brayton** (gas turbines/jets),
  **Rankine** (steam power), **refrigeration/heat-pump** (reversed cycle, COP > 1 because it
  *moves* heat rather than generating it).
- **Heat transfer:** **conduction** (Fourier's law, `q = −k∇T`), **convection** (Newton's
  cooling, fluid motion), **radiation** (Stefan–Boltzmann, `P = εσAT⁴` — also the basis of
  blackbody color temperature, linking to `../02-media-production/lighting-physics.md`).
- **Engineering use:** sizing engines, HVAC, power plants, chemical-process feasibility (ΔG),
  insulation, thermal management of electronics/batteries.

## 3. Common Pitfalls
1. Ignoring that efficiency is bounded by Carnot — "100% efficient engine" claims violate the 2nd
law. 2. Confusing heat (Q, energy in transit) with temperature (T, intensive). 3. Using gauge vs.
absolute temperature/pressure incorrectly in cycle math. 4. Forgetting entropy generation in real
(irreversible) processes — real efficiencies fall short of ideal. 5. Treating COP like efficiency
(heat pumps "exceed 100%" because they move, not make, heat). 6. Neglecting heat-transfer mode
dominance at different scales.

## 4. Advanced Resources
- Çengel & Boles, *Thermodynamics: An Engineering Approach*; Fermi, *Thermodynamics*; Moran et
  al., *Fundamentals of Engineering Thermodynamics*.

### Cross-references
`ice-vs-ev-powertrains.md` · `automotive-engineering.md` ·
`../02-media-production/lighting-physics.md` (blackbody radiation) · `robotics.md`
