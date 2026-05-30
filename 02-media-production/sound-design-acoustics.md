---
title: Sound Design & Acoustics
domain: 02 — Media & Production
status: done
depth: graduate
prerequisites: [basic physics, audio basics]
reading_time: ~40 min
last_updated: 2026-05-29
---

# Sound Design & Acoustics

Audiences forgive imperfect picture but reject bad audio instantly — sound is processed faster
and more emotionally than vision, and carries half the storytelling load while getting a
fraction of the credit. Mastery spans **the physics of sound**, **the psychoacoustics of human
hearing**, the **signal chain** from capture to delivery, and the **craft** of a mix that is
intelligible, emotional, and loudness-compliant. Organized physics → perception → craft.

---

## 1. Technical Mechanisms

### 1.1 The physics of sound

Sound is a longitudinal pressure wave:
```
v = f · λ            speed = frequency × wavelength   (v ≈ 343 m/s in air at 20°C)
Audible range:       ~20 Hz – 20 kHz (degrades with age)
```
- **Frequency (Hz)** ↔ **pitch**; **amplitude** ↔ **loudness**; **waveform/harmonics** ↔
  **timbre**.
- **The decibel is logarithmic:** `L = 20·log10(p/p₀)`. +6 dB ≈ double the pressure;
  **+10 dB ≈ perceived "twice as loud."** Doubling distance in a free field drops level ~6 dB
  (inverse-square law).

### 1.2 Acoustics of spaces

- **Reflection, absorption, diffusion:** hard surfaces reflect (echo/reverb), porous absorb
  (deaden), irregular diffuse (scatter for evenness).
- **Reverberation time (RT60)** — Sabine: `RT60 = 0.161 · V / A` (V = volume m³, A = absorption
  in sabins). Short RT60 → dry/intelligible; long → live/spacious.
- **Room modes / standing waves:** low-frequency resonances from room dimensions — the bane of
  small studios; treat with bass traps.
- **Capture dry, add reverb in post** — you can add reverb but rarely remove it cleanly.

### 1.3 Psychoacoustics (perception ≠ physics)

- **Equal-loudness contours (Fletcher–Munson):** ears are most sensitive ~2–5 kHz, far less to
  bass at low volume — mixes change with playback level; mix at consistent moderate levels and
  check on multiple systems.
- **Masking:** a loud sound hides a quieter one nearby in frequency/time. The core mix problem:
  *carve frequency space* so each element is audible.
- **Localization:** **ITD** (time, low freq) and **ILD** (level, high freq) — the basis of
  stereo/surround panning.
- **Haas (precedence) effect:** first arrival defines direction; delays <~30 ms fuse into one
  sound — used for width without echo.

### 1.4 The digital audio chain

- **Sampling (Nyquist):** sample rate must be **>2× the highest frequency**; 48 kHz (video
  standard) captures up to 24 kHz. Below Nyquist → **aliasing**.
- **Bit depth = dynamic range** (~6 dB/bit): 16-bit ≈ 96 dB (CD); 24-bit ≈ 144 dB (record in
  24-bit for headroom).
- **Headroom & gain staging:** **0 dBFS is the hard ceiling** — clipping is harsh and
  unrecoverable. Track peaks ~−12 to −6 dBFS.

### 1.5 Loudness standards (modern delivery)

Perceived loudness is measured in **LUFS** (ITU-R BS.1770 / EBU R128). Platforms normalize:
streaming/music ≈ **−14 LUFS**; EU broadcast ≈ **−23 LUFS**. Deliver to the platform's
integrated-LUFS target with a **True Peak** ceiling (e.g., −1 dBTP). "As loud as possible" just
gets turned down and sounds worse.

---

## 2. Application Frameworks

### 2.1 The layers of a soundtrack

```
DIALOGUE    intelligibility is priority #1 — sits ~1–4 kHz; everything serves it
SFX         hard effects (sync'd) + Foley (performed everyday sounds) + ambience/atmos (the bed)
MUSIC/SCORE emotional steering; ducks under dialogue
DESIGN      non-literal/processed sound for tone & transitions (whooshes, drones, risers)
```

### 2.2 Capture discipline (the cheapest quality win)

- **Mic close** to maximize signal vs. room/noise (inverse-square law works for you).
- **Choose the pattern:** cardioid (rejects rear), shotgun (directional dialogue), omni (room),
  figure-8 — pick for source + environment.
- **Treat the room or get closer** — you can EQ tone but can't un-record a bad room.
- **Capture room tone** (30s) for editing seams.

### 2.3 The mixing workflow

```
1. EDIT/CLEAN     remove noise/clicks; tighten timing; gain-stage to consistent levels
2. BALANCE        static levels with dialogue as anchor; rough the story arc
3. EQ             subtractive first (cut mud/resonances); carve space to fight MASKING
4. DYNAMICS       compression for consistency/glue; gates for noise; de-ess sibilance
5. SPACE          reverb/delay for depth; pan for width and localization
6. AUTOMATION     ride levels for emotion and intelligibility
7. MASTER         bus processing + loudness normalization to LUFS/True-Peak target
```

### 2.4 EQ and dynamics intuition

- **Subtractive EQ** (cut problems) sounds more natural than boosting; sweep to find resonances.
- **Compression** reduces dynamic range (ratio/threshold/attack/release) — over-compression
  kills life and fatigues.
- **Frequency budget:** highpass what doesn't need lows; give each element a niche (dialogue
  1–4 kHz, bass <250 Hz, air >10 kHz).

### 2.5 Sound for emotion & narrative

- **Diegetic vs. non-diegetic:** in-world sound vs. score/narration — crossing the line
  deliberately is a powerful device.
- **Sound shapes the picture:** the same shot reads tense or calm depending on the bed; silence
  after density is a dramatic peak.
- **Anticipation & release:** risers/drones build tension; impacts and sudden quiet release it —
  the auditory emotional arc (`storytelling-psychology.md`).
- **Continuity:** consistent ambience/room tone glues cuts.

---

## 3. Common Pitfalls

1. **Neglecting dialogue intelligibility.** If words are unclear, nothing else matters.
2. **Bad room / far mic** → unfixable reverb and noise.
3. **Clipping (>0 dBFS).** Harsh, unrecoverable; track at −12 to −6.
4. **Aliasing / wrong sample rate**; not matching 48 kHz for video.
5. **Over-compression / over-loud masters.** Fatiguing; defeated by LUFS normalization.
6. **Ignoring loudness standards** → turned down or distorted by the platform.
7. **Boosting instead of cutting EQ;** ignoring masking → muddy mix.
8. **Mixing at one (loud) volume** → Fletcher–Munson fools you.
9. **No room tone / inconsistent ambience** → audible seams.
10. **Untreated low-frequency room modes** → bass that doesn't translate.
11. **Mixing only on headphones/one speaker** → translation failures.

---

## 4. Advanced Resources

**Standards**
- ITU-R BS.1770 / EBU R128 (loudness/LUFS): <https://tech.ebu.ch/publications/r128>
- AES (digital audio & acoustics): <https://www.aes.org/>

**Books**
- Sonnenschein, D. *Sound Design.*
- Everest & Pohlmann. *Master Handbook of Acoustics.*
- Izhaki, R. *Mixing Audio.*
- Bregman, A. *Auditory Scene Analysis* (advanced perception).

**Reference**
- Fletcher–Munson / ISO 226 equal-loudness contours; Sabine acoustics; Nyquist–Shannon theorem.

---

### Cross-references
- `storytelling-psychology.md` — sound as a direct emotion channel.
- `cinematic-video-editing.md` — sound and picture cut together; rhythm.
- `cinematography.md` / `lighting-physics.md` — sister wave-physics (light vs. sound).
- `../01-monetization-digital-empires/youtube-algorithm-mastery.md` — audio quality and retention.
