---
title: Robotics
domain: 07 — Engineering & Mechanics
status: done
depth: graduate
prerequisites: [linear algebra, control basics, programming]
last_updated: 2026-05-29
---

# Robotics

A robot is a **sense → plan → act loop embodied in the physical world** — the integration of
mechanical design, electronics, control theory, and software (increasingly AI). Its defining
challenge is operating under *uncertainty*: noisy sensors, imperfect models, and an unforgiving
physical environment.

## 1. Technical Mechanisms
- **Kinematics:** the geometry of motion. **Forward kinematics** (joint angles → end-effector
  pose) is straightforward; **inverse kinematics** (desired pose → joint angles) is the hard,
  often multi-solution problem. Described with homogeneous transforms / Denavit–Hartenberg
  parameters; **degrees of freedom** define the configuration space.
- **Dynamics:** forces/torques producing motion (Newton-Euler or Lagrangian formulations);
  accounts for inertia, gravity, friction — essential for fast/precise/compliant motion.
- **Sensing:** proprioceptive (encoders, IMUs) + exteroceptive (cameras, LiDAR, depth,
  force/torque, ultrasonic). All noisy → **sensor fusion** (e.g., **Kalman/particle filters**)
  estimates state from imperfect data.
- **Control:** **PID** for joint/motor control; model-based control (computed-torque, MPC) for
  complex dynamics; **feedback** rejects disturbance. The loop must be fast and stable (control
  theory — poles, stability margins).
- **Perception & mapping:** computer vision, **SLAM** (Simultaneous Localization and Mapping)
  builds a map while tracking position — foundational for mobile/autonomous robots.
- **Planning:** path/motion planning (A*, RRT, RRT*), trajectory optimization, and task planning;
  navigation under constraints and obstacles.

## 2. Application Frameworks
- **The autonomy stack:** **Perception** (sense + interpret) → **Localization/Mapping** (where am
  I) → **Planning** (what to do) → **Control** (execute) → actuation, looping continuously. Mirrors
  the agent loop and ties to `../03-computer-science-architecture/ai-ml-engineering.md`.
- **Categories:** industrial arms (precision, repeatability — manufacturing), mobile robots/AMRs
  (logistics), drones/UAVs, legged robots (rough terrain), collaborative robots ("cobots," safe
  near humans), and increasingly **learning-based** robots (RL, imitation learning,
  vision-language-action models).
- **Software:** **ROS/ROS2** as the de facto middleware (nodes, topics, services); simulation
  (Gazebo, Isaac) for safe, cheap iteration before hardware (the sim-to-real gap is a key
  challenge).
- **Design tradeoffs:** payload vs. weight, speed vs. precision, rigidity vs. compliance/safety,
  autonomy vs. reliability, power/energy budget (batteries — links to `ice-vs-ev-powertrains.md`).
- **Emerging:** end-to-end learned control, foundation models for manipulation, swarm robotics,
  soft robotics.

## 3. Common Pitfalls
1. Ignoring sensor noise / no state estimation → brittle behavior. 2. Treating inverse kinematics
as having one clean solution. 3. Neglecting dynamics at high speed (kinematics-only control
fails). 4. Poorly tuned control loops (instability, oscillation). 5. Underestimating the
**sim-to-real gap**. 6. Safety afterthoughts around humans (cobots need designed-in safety).
7. Over-relying on ML without robust fallback/safety layers. 8. Power/thermal budgets ignored
until late. 9. Edge cases in the physical world (the "long tail" that breaks autonomy).

## 4. Advanced Resources
- Siciliano & Khatib, *Springer Handbook of Robotics*; Thrun, Burgard & Fox, *Probabilistic
  Robotics* (SLAM/filters); Lynch & Park, *Modern Robotics* (free online); ROS documentation
  (<https://docs.ros.org/>).

### Cross-references
`mechanical-maintenance.md` · `automotive-engineering.md` ·
`../03-computer-science-architecture/ai-ml-engineering.md` ·
`../06-deep-sciences-biology/agricultural-science.md` (ag robotics)
