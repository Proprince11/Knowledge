---
title: Automotive Engineering
domain: 07 — Engineering & Mechanics
status: done
depth: graduate
prerequisites: [thermodynamics.md, mechanics basics]
last_updated: 2026-05-29
---

# Automotive Engineering

A vehicle is a **system of integrated subsystems** — powertrain, chassis, suspension, brakes,
steering, electronics — engineered to convert stored energy into controlled motion while managing
forces, heat, NVH (noise/vibration/harshness), safety, and efficiency. Mastery is systems
thinking across these domains.

## 1. Technical Mechanisms
- **Powertrain:** engine/motor → transmission → driveline → wheels. Key metrics: **torque**
  (rotational force, → acceleration) vs. **power** (`P = τ·ω`, rate of work, → top speed). The
  torque curve and gearing match the engine's powerband to road load.
- **Vehicle dynamics:** longitudinal (accel/braking — weight transfer), lateral (cornering — tire
  slip angles, the **friction circle** limiting combined grip), and vertical (ride). **Tires are
  the only contact with the road** — every force passes through ~4 palm-sized patches.
- **Suspension:** controls wheel motion, grip, and ride; springs (store energy) + dampers
  (dissipate it); geometry (camber, caster, toe) sets handling. Sprung vs. unsprung mass
  tradeoffs.
- **Braking:** converts kinetic energy to heat (friction) or electricity (regen); brake balance,
  fade (thermal limits), ABS preventing lockup.
- **Aerodynamics:** drag (`F_d = ½ρv²C_dA`, rises with the *square* of speed → dominates highway
  efficiency) and downforce/lift; cooling airflow.
- **Structure:** unibody vs. body-on-frame; crumple zones manage crash energy; stiffness vs.
  weight.

## 2. Application Frameworks
- **Design tradeoffs:** performance vs. efficiency vs. cost vs. comfort vs. safety vs. emissions
  — no free lunch; every choice propagates system-wide.
- **The V-model & integration:** requirements → subsystem design → integration → validation;
  modern cars are also software platforms (ECUs, CAN bus, ADAS — links to `robotics.md` and
  `../03-computer-science-architecture/system-design.md`).
- **Efficiency levers:** mass reduction, aero, rolling resistance, drivetrain losses, and
  powertrain efficiency (see `ice-vs-ev-powertrains.md`).
- **Testing:** dyno, wind tunnel/CFD, FEA (structural/crash), durability, NVH, emissions/
  homologation.

## 3. Common Pitfalls
1. Confusing torque and power (and what each delivers). 2. Ignoring weight transfer in
handling/braking analysis. 3. Forgetting drag's v² law (why top speed is so power-hungry).
4. Treating subsystems in isolation rather than as a coupled system. 5. Underestimating thermal
management (brakes, engine, EV batteries). 6. Neglecting unsprung mass / tire as the limiting
factor. 7. Over-indexing on peak figures vs. usable, drivable performance.

## 4. Advanced Resources
- Gillespie, *Fundamentals of Vehicle Dynamics*; Milliken & Milliken, *Race Car Vehicle
  Dynamics*; Bosch *Automotive Handbook*; Heywood (engines — see ICE file).

### Cross-references
`ice-vs-ev-powertrains.md` · `thermodynamics.md` · `mechanical-maintenance.md` · `robotics.md`
