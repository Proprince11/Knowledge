---
title: Cinematography
domain: 02 — Media & Production
status: done
depth: graduate
prerequisites: [basic optics, camera basics]
reading_time: ~40 min
last_updated: 2026-05-29
---

# Cinematography

Cinematography is **storytelling with light, lens, and motion** — every technical parameter is
also a dramatic choice. The "exposure triangle" is physics; where you point it is authorship.
Mastery means understanding the **optics and sensor**, the **exposure system**, **lens
language**, and **composition/movement** as a unified grammar that directs the audience's eye
and emotion. (Lighting has its own file: `lighting-physics.md`.)

---

## 1. Technical Mechanisms

### 1.1 The exposure triangle

Three controls set brightness *and* carry creative side effects:

| Control | Sets | Creative side effect |
|---|---|---|
| **Aperture (f-stop)** | light through lens | **depth of field** — low f (f/1.8) = shallow/blurred bg; high f (f/11) = deep focus |
| **Shutter (angle/speed)** | exposure time | **motion blur** — the 180° rule (shutter ≈ 1/(2·fps)) gives natural cine motion |
| **ISO/gain** | sensor sensitivity | **noise** — higher ISO = brighter but grainier; respect native ISO |

```
Exposure ∝ (aperture area) × (shutter time) × (ISO)
Each "stop" doubles or halves light. f-stops: 1.4, 2, 2.8, 4, 5.6, 8, 11... (×√2 steps)
```

> **The 180° shutter rule:** at 24 fps, a 180° shutter ≈ 1/48 s. This motion blur looks
> "cinematic"; faster shutters (e.g., the *Saving Private Ryan* look) feel staccato/visceral.

### 1.2 Sensor, resolution, and dynamic range

- **Sensor size** drives field of view, depth of field, and low-light performance. Larger
  sensors (full-frame, S35) give shallower DoF and cleaner shadows at a given exposure.
- **Dynamic range** (stops between noise floor and clipping) determines how much shadow/highlight
  detail you keep. **Log gamma** (S-Log, C-Log, Log-C) records flat to preserve maximum DR for
  grading; **RAW** retains sensor data for maximum latitude.
- **Resolution vs. acuity:** beyond a point, lens quality, focus, and DR matter more than pixel
  count. Shoot to *deliverable* + reframing headroom, not vanity numbers.

### 1.3 Lens language (focal length & the perspective it implies)

- **Focal length** sets field of view *and perspective compression*:
  - **Wide (e.g., 16–35mm):** expansive, exaggerates depth/space, distorts up close — immersive,
    can feel unstable or grand.
  - **Normal (~50mm):** approximates human perspective — neutral, naturalistic.
  - **Telephoto (85mm+):** compresses space, isolates subject, flattering for faces — intimacy
    or surveillance/voyeur feel.
- **Perspective comes from camera distance, not focal length per se** — but focal choice forces
  a distance to hold framing, which changes the look.
- **Aperture & bokeh:** fast primes isolate subjects with shallow DoF; the rendering of
  out-of-focus areas (bokeh) is part of the lens's character.

### 1.4 Color: temperature, gamut, and grading

- **Color temperature (Kelvin):** ~3200K (tungsten/warm) to ~5600K (daylight). **White balance**
  tells the camera what "white" is; deliberate mismatch creates warm/cool moods.
- **Color space/gamut & bit depth:** wide gamuts (e.g., Rec.2020) + 10-bit+ avoid banding and
  give grading latitude vs. 8-bit Rec.709.
- **Grading** is the final authorial pass: primary (overall balance) then secondary (isolated
  hues/areis) to guide the eye and set emotional tone.

---

## 2. Application Frameworks

### 2.1 Composition: directing the eye

- **Rule of thirds / golden ratio:** place subjects on intersections for dynamic balance — then
  break it intentionally.
- **Leading lines, framing, depth layering** (fg/mg/bg): create dimensionality and guide
  attention.
- **Headroom, lookroom/nose room:** leave space in the direction of gaze/motion.
- **Balance & negative space:** emptiness is a compositional and emotional tool.
- **The eye goes to:** brightness, focus, motion, faces, and convergence of lines — control these
  to control attention.

### 2.2 Shot grammar (size & angle = meaning)

| Shot | Typical narrative function |
|---|---|
| Wide / establishing | place, scale, context, isolation |
| Medium | conversation, body language |
| Close-up | emotion, importance (faces trigger contagion — `storytelling-psychology.md`) |
| Extreme close-up | intensity, detail, tension |
| Low angle | power/dominance of subject |
| High angle | vulnerability/smallness |
| Dutch tilt | unease/disorientation |
| POV | identification/subjectivity |

### 2.3 Camera movement as emotion

- **Static:** stability, observation, control.
- **Pan/tilt:** reveal, follow, connect spaces.
- **Dolly/tracking:** smooth movement *with* a subject — engagement, momentum.
- **Handheld:** immediacy, energy, documentary realism, chaos.
- **Steadicam/gimbal:** floating, dreamlike, immersive long takes.
- **Crane/drone:** scale, god's-eye perspective, transitions.
- **Push-in:** intensify a realization (slow) or shock (fast); **pull-out:** isolation/reveal.

> **Principle:** *motivated movement* — the camera should move because the story/emotion
> demands it, not for spectacle.

### 2.4 The 180-degree rule & continuity

Keep the camera on one side of the **axis of action** so screen direction stays consistent
(characters keep facing each other across cuts). Crossing it disorients — used deliberately for
exactly that effect. Eyeline matches and consistent screen direction make cuts invisible
(`cinematic-video-editing.md`).

### 2.5 Pre-production: shot lists, storyboards, blocking

```
1. SCRIPT BREAKDOWN  identify the dramatic beat of each scene
2. BLOCKING          where actors move; the camera serves the blocking
3. SHOT LIST/BOARDS  sizes, angles, movement, lenses per beat
4. COVERAGE PLAN     enough angles to cut the scene; protect for editorial flexibility
```

### 2.6 The look as a system

Lens choice + DoF + movement + color + lighting combine into a coherent **visual language** for
a project. Reference films, build a look-book, and keep it consistent — the audience reads
visual consistency as authorship and reads change as meaning.

---

## 3. Common Pitfalls

1. **Exposure without intent.** Correct brightness but no DoF/motion-blur choice.
2. **Wrong shutter** → unnatural motion (unless intended); breaking the 180° rule by accident.
3. **Clipping highlights / crushing shadows** — unrecoverable; expose for latitude (log/RAW,
   protect highlights).
4. **8-bit / no log on high-contrast scenes** → banding, no grading latitude.
5. **Ignoring the 180° (axis) rule** → disorienting screen-direction errors.
6. **Unmotivated camera movement** → distracting spectacle.
7. **Focal-length misuse** (e.g., wide lens close on faces → distortion).
8. **Mixed color temperatures** unintentionally → ugly color casts.
9. **No coverage** → uncuttable scenes in the edit.
10. **Resolution obsession** over focus, DR, and lighting (which matter more).
11. **Composition that buries the subject** — eye has nowhere to go.

---

## 4. Advanced Resources

**Books**
- Brown, B. *Cinematography: Theory and Practice.*
- Mascelli, J. *The Five C's of Cinematography.*
- Ascher & Pincus. *The Filmmaker's Handbook.*
- *American Cinematographer Manual* (ASC).

**References / community**
- ASC (American Society of Cinematographers): <https://theasc.com/>
- Manufacturer white papers on log/RAW workflows (ARRI, RED, Sony).

---

### Cross-references
- `lighting-physics.md` — the other half of the image.
- `cinematic-video-editing.md` — coverage, continuity, the cut.
- `sound-design-acoustics.md` — picture + sound as one experience.
- `storytelling-psychology.md` — close-ups, contagion, eye direction.
