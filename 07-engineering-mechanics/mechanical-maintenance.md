---
title: Mechanical Maintenance & Reliability Engineering
domain: 07 — Engineering & Mechanics
status: done
depth: graduate
prerequisites: [mechanics basics, automotive-engineering.md helpful]
last_updated: 2026-05-29
---

# Mechanical Maintenance & Reliability Engineering

Maintenance is **applied reliability engineering**: managing the inevitable degradation of
physical systems to maximize uptime and safety at minimum lifecycle cost. The discipline has
evolved from "fix it when it breaks" to data-driven prediction — and the core insight is that
*most failures are not random; they're foreseeable and often preventable.*

## 1. Technical Mechanisms
- **Failure modes:** **wear** (abrasion, adhesion), **fatigue** (cyclic loading → crack
  initiation/propagation; the dominant cause of mechanical failure), **corrosion**, **creep**
  (slow deformation under load+heat), **overload/fracture**, **lubrication failure**, **thermal
  degradation**. Each has signatures.
- **The bathtub curve:** failure rate over life = high **infant mortality** (defects, break-in) →
  low **random-failure** plateau (useful life) → rising **wear-out**. Maintenance strategy should
  match the phase.
- **Tribology:** friction, wear, and lubrication. Lubricants separate surfaces
  (hydrodynamic/boundary regimes), carry heat, and exclude contaminants — *lubrication failure is
  a leading root cause* of bearing/gear death.
- **Vibration & alignment:** misalignment, imbalance, looseness, and bearing defects each produce
  characteristic vibration spectra — the basis of condition monitoring.
- **Root Cause Analysis (RCA):** the "5 Whys," fishbone (Ishikawa), fault-tree analysis —
  distinguish the *symptom* from the *cause* (e.g., a failed bearing whose root cause was
  contaminated oil).

## 2. Application Frameworks
- **Maintenance strategies (matched to criticality):**
  - **Reactive (run-to-failure):** acceptable only for cheap, non-critical, redundant items.
  - **Preventive (time/usage-based):** scheduled service (oil changes, filter swaps) — simple but
    can over- or under-maintain.
  - **Predictive (condition-based, PdM):** monitor actual condition (vibration analysis, oil
    analysis/tribology, thermography, ultrasound, motor-current signature) and act on trend — the
    highest-ROI modern approach.
  - **Reliability-Centered Maintenance (RCM):** systematically choose the right strategy per
    failure mode based on consequence.
- **Key metrics:** **MTBF** (mean time between failures), **MTTR** (mean time to repair),
  **availability = MTBF/(MTBF+MTTR)**, OEE (overall equipment effectiveness). These mirror the SRE
  concepts in `../03-computer-science-architecture/system-design.md`.
- **Practical discipline:** torque specs (fastener preload matters), correct lubricant/intervals,
  contamination control (cleanliness is reliability), alignment/balancing, and documentation/
  history (the maintenance log = the failure dataset).
- **Predictive + IoT/ML:** sensors + analytics forecast remaining useful life — linking to
  `robotics.md` and `../03-computer-science-architecture/ai-ml-engineering.md`.

## 3. Common Pitfalls
1. Run-to-failure on critical equipment. 2. Treating symptoms, not root causes (no RCA → repeat
failures). 3. Ignoring lubrication/contamination (the silent killers). 4. Over-maintenance
(introducing faults, wasting cost) or under-maintenance. 5. Skipping torque specs / proper
alignment. 6. No maintenance history → no learning. 7. Reacting to single readings instead of
trends. 8. Ignoring infant-mortality from poor installation/break-in.

## 4. Advanced Resources
- Moubray, *Reliability-Centered Maintenance (RCM II)*; Bloch & Geitner, *Machinery Failure
  Analysis and Troubleshooting*; SMRP body of knowledge; ISO 55000 (asset management).

### Cross-references
`automotive-engineering.md` · `ice-vs-ev-powertrains.md` · `robotics.md` ·
`../03-computer-science-architecture/system-design.md` (reliability/availability)
