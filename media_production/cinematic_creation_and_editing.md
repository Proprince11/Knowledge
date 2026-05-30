# Cinematic Creation & Editing — Technical Execution Guide

> A working manual for cinematographers, editors, and sound designers operating at a
> theatrical / high-end commercial standard, written for practitioners who already know
> their tools and want the *physics, math, and decision frameworks* behind the choices.

---

## Table of Contents

1. [Cinematography — Lighting Physics](#1-cinematography--lighting-physics)
2. [Cinematography — Camera Color Profiles (LOG vs RAW)](#2-cinematography--camera-color-profiles-log-vs-raw)
3. [Cinematography — Framing Psychology](#3-cinematography--framing-psychology)
4. [Video Editing — High-Leverage Workflow](#4-video-editing--high-leverage-workflow)
5. [Video Editing — Color Grading Mechanics (Scopes)](#5-video-editing--color-grading-mechanics-scopes)
6. [Video Editing — Pacing Formulas for Retention](#6-video-editing--pacing-formulas-for-retention)
7. [Sound Design — Acoustic Treatment Math](#7-sound-design--acoustic-treatment-math)
8. [Sound Design — EQ Frameworks](#8-sound-design--eq-frameworks)
9. [Sound Design — Spatial Audio Configuration](#9-sound-design--spatial-audio-configuration)
10. [Appendix — Reference Tables & Cheatsheet](#10-appendix)

---

## 1. Cinematography — Lighting Physics

### 1.1 The Inverse-Square Law

For an idealized **point source** emitting in free space, illuminance falls with the square
of the distance from the source:

```
        Φ
E  =  ─────
       4πd²
```

- `E` = illuminance at the subject (lux)
- `Φ` = luminous flux of the source (lumens)
- `d` = distance from source to subject (m)

For practical set work the equivalent rule is:

```
E₂      d₁²
── =  ─────
E₁      d₂²
```

Doubling distance gives **¼** the light. Halving distance gives **4×** the light.

#### Practical f-stop math

A camera f-stop is a logarithmic measure of light: each full stop is a factor of 2.
Translating distance changes into stops:

```
ΔStops = 2 · log₂( d₂ / d₁ )
```

| Distance change | Light multiplier | f-stop change |
|---|---|---|
| ×0.5 (half) | 4× | +2 stops |
| ×0.71 | 2× | +1 stop |
| ×1.0 | 1× | 0 |
| ×1.41 | 0.5× | −1 stop |
| ×2.0 | 0.25× | −2 stops |
| ×2.83 | 0.125× | −3 stops |
| ×4.0 | 0.0625× | −4 stops |

#### Falloff is non-linear → expressive control

A 1 m move when the key is 1 m from talent is dramatic; the same 1 m move when the key is
6 m away is invisible. The closer the source, the more aggressive the foreground/background
separation, and the more the actor "sculpts" by moving in/out of the pool of light.

#### Why "softness" is geometry, not a bulb spec

Apparent softness is the angular size of the source as seen by the subject:

```
θ ≈ 2 · arctan( S / 2d )
```

- `S` = source diameter (m)
- `d` = distance from source to subject

Source size relative to distance — not wattage — defines softness. A 4×4 ft diffusion frame
2 ft from a face is *gigantically* soft; the same frame at 20 ft is functionally hard.

**Key working ratio:** keep the source **larger than the subject** to wrap shadows.
A face is ~25 cm tall; a 60×90 cm softbox at 90 cm produces silky transitions, while at 4 m
it begins to behave like a hard source.

### 1.2 Color Temperature, CRI, TLCI, SSI

Continuous-spectrum metrics that matter on set:

| Metric | Range | Meaning |
|---|---|---|
| Correlated Color Temperature (CCT) | 1700K (candle) → 10000K (cold sky) | Visual hue of the light |
| **CRI (R₁–R₈ avg, "Ra")** | 0–100 | General color rendering vs. blackbody |
| **CRI R9** | typically reported separately | Saturated red rendering — critical for skin |
| **TLCI** | 0–100 | TV-camera-relevant color rendering |
| **SSI (Spectral Similarity Index)** | 0–100 | Modern, source-vs-reference spectral match |

Hard targets for narrative work: **CRI ≥ 95**, **R9 ≥ 90**, **TLCI ≥ 90**, **SSI ≥ 75**
against your reference. Below these, faces look chalky in the grade.

### 1.3 Hard Numbers for Common Sources

Approximate output on a face at 3 m, no diffusion:

| Source | Power | Lux on subject @ 3 m | Notes |
|---|---|---|---|
| ARRI SkyPanel S60-C | 410 W LED | ~3,200 lx | Tunable 2800–10000K |
| Aputure 600d Pro | 720 W LED | ~14,000 lx | HMI-class point source |
| 1.2 kW HMI Par | 1200 W | ~25,000 lx | Daylight, very punchy |
| 4-bank Kino Flo | 220 W | ~1,500 lx | Soft, broad |
| Practical 60 W LED bulb | 60 W | ~700 lx | "Motivated" lighting only |

### 1.4 Daylight, Tungsten, Mixed-Color Sets

- **Daylight balance (5600 K)** for sun, HMIs, daylight-balanced LEDs.
- **Tungsten balance (3200 K)** for incandescent, halogen, tungsten-balanced LEDs.
- **Mixing**: gel daylight to tungsten with **CTO** (Full = ~3200K from 5600K). Reverse with
  **CTB**. Quarter and Half gels let you shift partially.

ND gels reduce intensity without changing color: **ND 0.3 = 1 stop**, **ND 0.6 = 2 stops**,
**ND 0.9 = 3 stops**.

### 1.5 Three-Point + Beyond

Working portrait pattern, in order of importance:

1. **Key** — primary modeling light. Define direction, intensity, and softness first.
2. **Negative fill** — subtractive control (a flag or solid black) to deepen the shadow
   side. Often more important than a fill light.
3. **Positive fill** — bounce or LED at 1/4–1/2 the key intensity. Match or warm relative
   to key.
4. **Backlight / hair / kicker** — separation from background. Typical ratio 1:1 to 2:1
   relative to key, often warmer.
5. **Background light** — paint the BG independently to control depth and contrast.

#### Lighting ratios → contrast

| Key:Fill | Δ stops | Mood |
|---|---|---|
| 1:1 | 0 | High-key, commercial, beauty |
| 2:1 | 1 | Subtle modeling, sitcom, doc |
| 4:1 | 2 | Standard narrative |
| 8:1 | 3 | Dramatic, noir, single source |
| 16:1+ | 4+ | Chiaroscuro, horror, night exterior |

#### Classical portrait patterns

- **Rembrandt** — small triangle of light on the shadow-side cheek under the eye.
- **Loop** — nose shadow loops down, doesn't touch the lip line.
- **Split** — half the face lit, half in shadow. Maximum drama.
- **Butterfly / Paramount** — symmetrical shadow under the nose. Beauty, glamour.
- **Broad / Short** — key on the side of the face turned *toward* (broad) or *away*
  (short, more flattering) from camera.

### 1.6 Motivated Lighting Discipline

Every beam answers: "What in the world is making this light?" — sun through a window,
a practical lamp, a fluorescent ceiling, a TV screen. Even when the source is a 12K HMI
on a condor outside, it should *behave* like the motivator: same direction, same color,
same texture. Audiences forgive impossible *amounts* of light; they don't forgive
impossible *directions*.

---

## 2. Cinematography — Camera Color Profiles (LOG vs RAW)

### 2.1 The Two Axes: Encoding and Sampling

A digital recording is defined by:

1. **What** is recorded: debayered RGB (display- or scene-referred) vs. **raw sensor data**.
2. **How** the tonal range is mapped: **linear**, **gamma (Rec.709/2.4)**, or **log**.
3. **Bit depth**: 8-bit (256 codes), 10-bit (1024), 12-bit (4096), 14-bit (16384), 16-bit.
4. **Chroma subsampling**: 4:4:4 (full color), 4:2:2 (broadcast standard), 4:2:0 (consumer).
5. **Codec**: intra-frame (ProRes, DNxHR, BRAW, REDCODE) vs. long-GOP (H.264/H.265).

### 2.2 Rec.709 vs LOG vs RAW

| Property | Rec.709 (baked) | LOG | RAW |
|---|---|---|---|
| Tonal mapping | ~2.4 gamma curve | Logarithmic | Linear sensor data |
| Dynamic range captured | ~6 stops usable | 12–15 stops | full sensor (13–17 stops) |
| White balance | Baked in | Baked in (metadata only) | Adjustable in post |
| ISO | Baked in | Baked in (metadata only) | Adjustable in post |
| Bit depth typical | 8-bit | 10/12-bit | 12/16-bit |
| File size | small | medium | large (3–10× LOG) |
| Post pipeline | none | LUT + grade | debayer + grade |
| Best for | live, fast turnaround | most narrative/commercial | hero shots, VFX, archival |

### 2.3 LOG Curves in Detail

LOG encoding distributes code values logarithmically so highlights and shadows preserve
gradient steps. Each manufacturer ships its own curve and gamut:

| Manufacturer | LOG curve | Gamut | Stops captured |
|---|---|---|---|
| ARRI | Log C3 / Log C4 | ARRI Wide Gamut 3 / 4 | ~14 / ~17 |
| Sony | S-Log3 | S-Gamut3.Cine / S-Gamut3 | ~14 |
| Canon | C-Log2 / C-Log3 | Cinema Gamut | ~15 / ~14 |
| Panasonic | V-Log | V-Gamut | ~14 |
| RED | Log3G10 | REDWideGamutRGB | ~16.5 |
| Blackmagic | BMD Film Gen 5 | BMD Wide Gamut | ~13 |
| Fujifilm | F-Log / F-Log2 | F-Gamut | ~13 / ~14 |
| Nikon | N-Log | (Rec.2020 ish) | ~12 |
| DJI | D-Log / D-Log M | DJI Wide Gamut | ~13 |

LOG **looks flat** because 18% middle gray sits around code value 41% (varies per curve)
and skin lives in a narrow upper-mid band. The flatness is the *cost* of preserving
information; the *grade* restores contrast.

#### Working LOG correctly

1. **Expose using waveform**, not the LOG image. Place 18% gray at the manufacturer's
   target IRE (e.g., S-Log3: 41%, Log C: 38%, V-Log: 42%).
2. **ETTR (expose-to-the-right)** by 1/3 to 2/3 stops on most modern cameras to protect
   shadow noise — but never clip skin highlights.
3. **Apply a monitoring LUT on set** (the official Rec.709 conversion LUT) so director,
   focus puller, and DIT see a representative image.
4. **Record at minimum 10-bit 4:2:2** (e.g., All-Intra ProRes 422, XAVC, BRAW).
   8-bit + LOG is a banding factory — never do it for client work.

### 2.4 RAW in Detail

RAW preserves the **Bayer-pattern photosite values** before debayering, white balance, and
ISO scaling are applied. Implementations:

| Codec | Notes |
|---|---|
| ARRIRAW | Uncompressed; reference quality |
| REDCODE RAW | Wavelet compression 2:1–22:1; the original pro mezzanine raw |
| ProRes RAW / RAW HQ | Apple wavelet, GPU-accelerated |
| Blackmagic RAW (BRAW) | Partially debayered; smaller, fast |
| Canon Cinema RAW Light / LT | Wavelet, manageable bitrate |
| CinemaDNG | Open standard; per-frame DNGs |

#### When RAW pays for itself

- Critical skin tones in **mixed lighting** (window + tungsten).
- **Heavy VFX** — keyers love clean linear data.
- **HDR finishing** at PQ/HLG — full sensor latitude survives the grade.
- **Reframing in post** when shooting 6K/8K and finishing 4K.
- **Archival masters** for productions with long shelf life.

#### When LOG is the right answer

- Standard narrative / commercial / documentary at 4K.
- Tight schedules where storage and DIT bandwidth matter.
- Long takes / interviews — RAW data rates become punishing.

#### What RAW is *not*

- Not a license to ignore on-set lighting. Garbage in, garbage out.
- Not "future-proof" if the codec/format dies — keep mezzanine ProRes 4444 XQ archives.
- Not free white balance — extreme corrections (e.g., 2800K → 8000K) still degrade quality.

### 2.5 Bit Depth and Banding Math

A linear gradient in a flat sky at 8-bit (256 levels) shows visible banding once the
gradient occupies more than ~50 codes — common in graded LOG output. 10-bit (1024) gives
4× the codes; 12-bit (4096) gives 16×. The cost of bit depth is bandwidth, but banding
is irreversible without re-shooting.

### 2.6 ACES and Modern Color Pipelines

For productions touching multiple cameras, VFX vendors, and HDR deliverables, **ACES
(Academy Color Encoding System)** is the lingua franca:

```
Camera (IDT) → ACES2065-1 (working space) → RRT → ODT → display
```

- **IDT (Input Device Transform)** — manufacturer-specific; converts native gamut/log to
  ACES.
- **RRT (Reference Rendering Transform)** — film-like tone-mapping baked into ACES.
- **ODT (Output Device Transform)** — Rec.709 / P3 D65 / Rec.2020 PQ etc.

Why bother: *predictable matching* of ARRI Alexa 35, Sony Venice 2, and DJI Ronin 4D in
the same timeline; deterministic HDR/SDR trims; and a long-term archival format.

---

## 3. Cinematography — Framing Psychology

### 3.1 Compositional Geometry

- **Rule of thirds** — the easy starting point: subjects/horizons on third lines or
  intersections.
- **Phi grid (golden ratio, 1.618)** — slightly tighter to center than thirds; many DPs
  prefer it for portraits.
- **Dynamic symmetry** (Bouleau) — diagonals connecting frame corners + their reciprocals.
  Compositions that align with these "armatures" feel architecturally settled.
- **Centered framing** — Kubrick / Wes Anderson — reads as control, ritual, omniscience.
  Use deliberately, not lazily.

### 3.2 Headroom and Lead Room

- **Headroom** — empty space above the subject's head. Tighter shots → less headroom; in a
  CU the eyes sit on the upper third, the top of the head touches or goes off-frame.
- **Look / nose / lead room** — empty space *in the direction the subject faces or moves*.
  Without it the frame feels claustrophobic and the subject "leaves" emotionally.

### 3.3 Shot Sizes and Emotional Weight

| Shot | Coverage | Emotional function |
|---|---|---|
| **ECU** Extreme close-up | An eye, a hand | Forensic; obsession; trauma |
| **CU** Close-up | Head & shoulders | Empathy; truth |
| **MCU** Medium close-up | Mid-chest up | Default conversation shot |
| **MS** Medium | Waist up | Behavior + reaction |
| **MLS** Medium-long | Knees up | Body language, blocking |
| **LS** Long / wide | Full figure | Geography; isolation |
| **ELS** Extreme long | Figure ≤ 10% of frame | Scale; landscape; impotence |

Coverage discipline: cut between shots that change size by *at least* one full step (CU →
MS), and ideally angle by ≥ 30° (the **30-degree rule**). Smaller jumps read as a mistake.

### 3.4 Camera Height — Power Geometry

- **Eye-level** — neutral, equal status with the audience.
- **Low angle (camera below eye)** — subject gains power, dominance, threat.
- **High angle** — subject loses power, vulnerability.
- **Bird's eye / top-down** — God POV; helplessness or omniscience.
- **Worm's eye** — inhuman scale; fantasy/horror.

Even subtle 5–10° shifts read on screen; in a two-shot of unequal characters, drop the
camera below the dominant one's eyeline and raise it above the subordinate's.

### 3.5 Lens Psychology

For Super-35 / S35-equivalent sensors:

| Focal length | Field feel | Use |
|---|---|---|
| 12–18 mm | Distortion, immersion, anxiety | POV, hand-held action |
| 21–27 mm | Wide naturalism | Establishing, environmental |
| 32–40 mm | Human eye-ish | Walking, blocking |
| 50 mm | Neutral portrait | Conversation |
| 75–100 mm | Compressed intimacy | CU, "the look" |
| 135 mm+ | Voyeur, removed | Telephoto observation |
| 200 mm+ | Hyper-compression | Surveillance, abstract |

**Compression / parallax** — long lenses flatten depth and make backgrounds loom; wide
lenses exaggerate distance. Choose lens *for what you want the background to do*, not for
"how close" the camera is.

### 3.6 Continuity Rules

- **180-degree rule** — once you draw the action axis (line between two characters or
  along a movement vector), don't cross it without a motivated re-establish. Crossing
  reverses screen direction and disorients viewers.
- **30-degree rule** — adjacent angles closer than 30° read as a jump cut.
- **Eye-line match** — each cut maintains the angle of gaze established in the prior shot.
- **Screen direction** — characters moving left-to-right in shot A must continue
  left-to-right in shot B unless a turn is shown.

### 3.7 Eye Trace and Visual Hierarchy

- Place the *next* point of interest near the *current* one in the outgoing frame so the
  cut is invisible.
- Use **luminance contrast** to lead the eye — the eye goes to the brightest area first.
- Use **color separation** (warm subject in cool field) for instant figure/ground.
- Use **focus** — defocused is invisible to the brain; pulls between depth planes redirect
  attention precisely.

### 3.8 Negative Space and Layered Depth

A frame should answer three questions in three planes:

- **Foreground** — proximity, intimacy, voyeurism.
- **Midground** — subject and action.
- **Background** — context and emotional color.

A frame with all three layers reading distinctly *feels* cinematic regardless of budget.

---

## 4. Video Editing — High-Leverage Workflow

### 4.1 The Pipeline

```
INGEST  →  ORGANIZE  →  TRANSCODE/PROXY  →  ASSEMBLY  →  ROUGH CUT
   →  FINE CUT  →  PICTURE LOCK  →  ONLINE/CONFORM  →  COLOR  →  SOUND
   →  FINAL MIX  →  MASTER & DELIVERABLES
```

### 4.2 Ingest and Organization

Folder template (NLE-agnostic):

```
PROJECT/
├── 01_FOOTAGE/
│   ├── A001_DAY01/   ← camera roll = ingest barrier
│   ├── A002_DAY01/
│   └── ...
├── 02_AUDIO/
│   ├── 01_SYNC/
│   ├── 02_VO/
│   ├── 03_MUSIC/
│   └── 04_SFX/
├── 03_PROXIES/
├── 04_GFX/
├── 05_PROJECT/       ← .prproj / .drp / .fcpbundle
├── 06_EXPORTS/
└── 07_DELIVERABLES/
```

Naming convention: `SCENE_SHOT_TAKE_DESCRIPTOR_DATE.ext` — never rely on camera-default
names for the conform stage.

### 4.3 Proxies

Master codec → proxy codec, fixed ratio:

| Master | Proxy | Reason |
|---|---|---|
| BRAW / REDCODE | DNxHR LB or ProRes Proxy | Real-time scrub at 4K on laptop |
| ProRes 422 HQ | ProRes Proxy | 1/8 the data |
| H.265 (long-GOP) | DNxHR LB | Long-GOP is *editor poison* — always proxy |

Always relink to the master before color and final export.

### 4.4 Assembly → Rough Cut

- Pull selects per scene (a "string-out" or "stringout") at full length.
- Build a **radio cut** (audio-driven, especially for documentary/commentary).
- Layer B-roll *after* the radio cut works as audio.
- Aim for **1.4–1.8× target runtime** at rough cut so the fine cut has room to compress.

### 4.5 Fine Cut Discipline

- **Temp music early** — defines pacing; replace before lock.
- **Watch in one sitting** without stopping; mark every "soft" moment, then trim.
- **Trim on action / sound / dialogue** — let the cut be motivated by content, not the
  arbitrary frame.
- **J-cuts and L-cuts** — audio leads or lingers across the picture cut. Almost every
  professional dialogue cut is a J or L cut.
- **Match cuts** for emphasis, not decoration.

### 4.6 Picture Lock → Online → Color → Sound

Once locked, **do not change picture timing.** Online conforms the high-res masters,
color graders work in scene-referred space, sound designers build to the locked timeline.
Every frame change after lock multiplies cost across three teams.

### 4.7 Hotkey Hygiene

Time saved per hour of editing if you stay on the keyboard versus mouse hopping: ~25%.
Memorize, in order: J/K/L (transport), I/O (in/out), V (selection), B/N (slip/slide),
Q/W (ripple in/out), Cmd+K / `\` (blade), `,`/`.` (insert/overwrite), `;`/`'`
(trim by frame). Customize for your NLE but commit to the muscle memory.

---

## 5. Video Editing — Color Grading Mechanics (Scopes)

Scopes are the only objective representation of an image. Your monitor lies; scopes don't.

### 5.1 Waveform Monitor (Luminance)

- X axis: horizontal screen position.
- Y axis: luminance (0 = black, 100 = peak white in IRE).
- **Targets**:
  - Pure black: 0 IRE (Rec.709 broadcast safe: 0; HDR PQ: 0 nits).
  - Caucasian skin midtone: 60–75 IRE.
  - Diffuse white (paper, T-shirt): 85–95 IRE.
  - Specular highlights (metal, water): allowed to clip in SDR if narratively justified.

A waveform that clusters in the middle = flat image. Push lift down and gain up until it
fills 0–100 with the subject between 50 and 80.

### 5.2 RGB Parade

Three side-by-side waveforms — Red, Green, Blue. Used for **white balance** and
**color cast detection**.

- Neutral whites and grays: R = G = B at the top and bottom of the parade.
- Warm tungsten cast: blue lower than red/green at the bottom — fix by lifting blue in
  shadows or cooling overall white balance.
- Magenta cast (mixed fluorescent): green lower than R/B in mids — fix with the tint axis.

### 5.3 Vectorscope

A polar plot of **chroma** (color), independent of brightness:

- **Angle** = hue.
- **Radius** = saturation.
- Six target boxes (R, Yl, G, Cy, B, Mg) for the SMPTE 75% color bars.
- The **skin tone line / I-line** runs from the center toward roughly **123°** (between
  red and yellow). Healthy skin sits *along* this line — regardless of ethnicity.
  Different complexions vary in *radius* (how saturated), not in *angle*.

#### Workflow with the vectorscope

1. Park on a clean face; isolate skin with a HSL qualifier or window.
2. Watch the scope: rotate hue (or shift midtone color balance) until the skin trace lies
   on the I-line.
3. Reduce saturation slightly if the trace exceeds ~50% of the scope radius — beyond that,
   skin reads "sunburnt" or "Oompa-Loompa."
4. *Then* push secondary color choices (teal shadows, amber highlights, etc.) — the skin
   anchor protects you from a grade that sells stylization at the cost of believability.

### 5.4 Histogram

Overall distribution of pixel brightness/RGB. Useful for *exposure* but coarser than
waveform; use as a sanity check, not a primary tool.

### 5.5 Primary Correction — Lift / Gamma / Gain (LGG) or Offset / Power / Slope

| Wheel | Affects | Mental model |
|---|---|---|
| **Lift / Offset** | Shadows / black point | "Where is black?" |
| **Gamma / Power** | Midtones | "Where is skin?" |
| **Gain / Slope** | Highlights / white point | "Where is white?" |

Order of operations:

1. **Set black** — pull lift until the bottom of the waveform sits at 0 (or 4 for safe).
2. **Set white** — push gain until diffuse white sits at ~90.
3. **Place skin** — gamma until skin is 60–75 IRE on the waveform.
4. **Balance** — RGB parade neutral on the white reference; vectorscope on the I-line for
   skin.
5. **Saturation** — bring overall saturation up gently until vectorscope traces fill
   ~50% of their natural range.

### 5.6 Secondary Correction

- **HSL Qualifier** — pick a hue/sat/luma range (skin, sky, foliage). Refine with denoise
  + soften matte edge.
- **Power Window** — geometric shape (oval/rectangle/curve) tracking a region. Track with
  the NLE's tracker before grading inside.
- **Curves (HUE vs HUE/SAT/LUM)** — surgical hue shifts (e.g., shift only foliage from
  yellow-green to teal-green without touching skin).

### 5.7 Node Order (DaVinci-style, but applies to layer-based NLEs too)

A clean node tree:

```
[Input Transform] → [Balance] → [Primary] → [Secondary skin] → [Secondary sky/BG]
   → [Look / Creative] → [Sharpen / Texture] → [Output Transform]
```

Keep balance and creative separate. When a director says "warm it up," you adjust the
*creative* node only and never break the technically balanced base.

### 5.8 LUTs — Use, Don't Abuse

- A **technical LUT** (S-Log3 → Rec.709) is a *transform*, not a grade.
- A **creative LUT** is a stylistic recipe — apply *after* a balanced primary, not before.
- Burning a creative LUT before primary correction locks you out of fixing exposure and
  white balance.

### 5.9 HDR vs SDR Trim Pass

When delivering HDR (PQ at up to 1000–4000 nits) and SDR (Rec.709 at 100 nits) from the
same master:

1. Grade in HDR first (you have more headroom).
2. Tone-map to SDR via ACES ODT or DaVinci's Color Space Transform.
3. **Trim pass** — usually pull HDR highlights down 0.5–1 stop in SDR; gently saturate
   midtones; check skin doesn't crush.

---

## 6. Video Editing — Pacing Formulas for Retention

Retention is the ratio of viewers still watching at time `t`:

```
R(t) = viewers_still_watching(t) / initial_viewers
```

YouTube ranks against **AVD** (Average View Duration) and **APV** (Average Percentage
Viewed). Instagram Reels / TikTok rank on completion + replays + shares; the first
1–2 seconds determine whether the algorithm even *tests* you on a wider audience.

### 6.1 The Universal Hook → Loop Structure

```
[0–3s]   HOOK              — the question, claim, or visual that promises the payoff
[3–10s]  PROMISE / STAKES  — what the viewer gets if they stay
[10s–N]  PROOF / CONTENT   — delivery, with pattern interrupts every 3–7s
[N-3s]   PAYOFF            — the resolution / takeaway
[N]      LOOP / CTA        — bridge to next video, replay-bait, or comment prompt
```

Every section is **a contract**. Break any contract → viewers leave.

### 6.2 YouTube Long-Form (8–20 min)

- **First 15 seconds** decide ~60% of long-form retention. Lead with the *most visually
  arresting moment* and the *single sentence* of value.
- **Open loops** — set up a question, delay the answer. Viewers stay for closure.
- **Pattern interrupts** every 30–90 seconds: cut to B-roll, change shot scale, change
  music, change location, drop a graphic, change voice register.
- **Chapter pacing**: aim for chapter lengths under 90 seconds; long chapters lose viewers.
- **Re-engagement spikes** at predictable retention dips (1:30, 4:00, 8:00) — insert a
  visual/audio escalation.
- **Avg shot length (ASL)** for talking head + B-roll: 3–5 s. For pure documentary
  narration: 4–7 s. For VFX-heavy explainer: 1.5–3 s.

### 6.3 Shorts / Reels / TikTok (≤ 60 s)

- **0.0–0.5 s** — the hook frame must be the *thumbnail* of the video. No black frames,
  no logo bumpers.
- **0.5–2 s** — visual + spoken claim. Captions on by frame 1.
- **Average shot length 0.6–1.5 s.** Anything longer is a luxury you must earn.
- **Movement on every cut** — push-ins, whip pans, zooms, scale changes. The eye must
  re-engage every shot.
- **Captions** burned in (not platform auto-caps) at ≥ 60% of frame width, contrasted, in
  the safe zone (~14% top/bottom margins on 9:16).
- **Loop close** — the last frame should bridge to the first frame for replays. A clean
  loop multiplies completion rate.
- **Audio leads picture** by ~6 frames at cuts (J-cut) — feels professional vs. amateur.

### 6.4 The Retention Math — Why Edits Matter

If your retention drops 1% per second after 5 s, in 60 s you're at 0.99⁵⁵ ≈ 57% retention.
Cut that drop to 0.5%/s and you reach 76%. That 19-percentage-point swing is the entire
game — and it's bought with **trim, not new footage**.

Practical levers, ranked by impact:

1. **Cut the first frame ruthlessly.** Any setup before the hook is dead weight.
2. **Compress dead air.** Pauses > 0.3 s in dialogue need to be removed or covered.
3. **Add one B-roll layer per 4 s of A-roll** when retention sags.
4. **Re-time music** so cuts land on transients/downbeats (perceived as "tighter").
5. **Color and sound polish at the end** — they boost retention by 3–8% empirically.

### 6.5 Rhythm and Music

A cut on a music transient is invisible; a cut between transients is a hiccup. For 120 BPM
music a beat lands every 0.5 s — frame-snap your edit points to those boundaries.
**Downbeats** (1 in a 4/4 bar) are reserved for major transitions; **upbeats** (2 and 4)
for in-scene cuts; **off-beats** for tension.

### 6.6 Captions and On-Screen Text

- **0.8–1.4 s** of screen time per text element minimum (long enough to read, short enough
  not to drag).
- Animate in/out (≤ 6 frames) to telegraph appearance.
- Use **2 type styles max** per video — heading and body.
- Caption timing should *lead* spoken word by 2–3 frames so the brain reads ahead of
  hearing.

---

## 7. Sound Design — Acoustic Treatment Math

The room is the first instrument. Treat it before you spend on microphones.

### 7.1 Reverberation Time — Sabine

```
RT60 = 0.161 · V / A      (metric)
RT60 = 0.049 · V / A      (imperial, ft³)
```

- `RT60` = time for sound to decay by 60 dB (s)
- `V` = room volume (m³ or ft³)
- `A` = total absorption (sabins) = Σ (Sᵢ · αᵢ) over surfaces, where `α` is the absorption
  coefficient at a given frequency.

#### Target RT60 by use

| Room | Target RT60 (mid-band) |
|---|---|
| Voiceover / podcast booth | 0.15–0.25 s |
| Dialogue ADR / on-camera | 0.25–0.35 s |
| Critical-listening control room | 0.20–0.30 s |
| Music tracking room | 0.4–1.0 s |
| Live concert hall | 1.5–2.2 s |
| Cathedral | 4–8 s |

#### Worked example

A 4 m × 5 m × 2.5 m room → V = 50 m³.
Target RT60 = 0.3 s → A = 0.161 × 50 / 0.3 ≈ **26.8 sabins**.
A 2.4 m² panel of 75 mm rockwool has α ≈ 1.0 mid-band, so ≈ **11 panels** of that size are
needed. Realistically, mix panels with α = 0.7 average, giving ~15 panels of similar size.
This is why "throw a few foam squares on the wall" almost never produces a usable room.

### 7.2 Room Modes

For axial modes between two parallel surfaces:

```
f_n = (n · c) / (2 · L)        n = 1, 2, 3, ...
```

- `c` = 343 m/s (speed of sound in air at 20°C)
- `L` = distance between the parallel surfaces (m)

A 4 m wall pair → first mode at 343/(2·4) ≈ **42.9 Hz**, then 85.8 Hz, 128.7 Hz…
Tangential and oblique modes also exist but are weaker. Modes pile bass into peaks/nulls;
**bass traps** in tri-corners (where pressure peaks) tackle them.

### 7.3 Treatment Hierarchy

1. **Bass traps in all 8 tri-corners** — broadband 100 mm+ porous absorber, or membrane
   traps for sub-100 Hz.
2. **First-reflection points** on side walls and ceiling (mirror trick: a helper slides a
   mirror along the wall while you sit at the listening position; wherever you can see a
   speaker, treat that spot).
3. **Front-wall absorption** behind the speakers and behind the camera in a vocal booth.
4. **Diffusion on the rear wall** — keep the room "alive" but un-flutter. QRD or skyline
   diffusers tuned to ~500 Hz–5 kHz for a typical control room.
5. **Avoid total deadening.** A near-anechoic room is fatiguing and unnatural. RT60 of 0.0
   s is a goal, not a virtue.

### 7.4 Speaker / Listener Geometry

For a stereo pair:

- **Equilateral triangle**: each speaker is the same distance from the listener as the
  speakers are from each other.
- Tweeters at **ear height**.
- Speakers angled inward so axes meet **at or just behind the listener's head**.
- **38% rule** — sit 38% of the room length from the front wall. Statistically the best
  modal trade-off.
- Distance from front wall: not equal to the distance from side walls (avoid identical
  reflection times).

### 7.5 Microphone Position vs. Acoustics

Inverse-square law applies to mics too. Halving distance gives +6 dB direct sound. Direct
sound dominates over room sound when:

```
d ≤ d_critical = 0.057 · √(V / RT60)        (metric, for omni; closer for cardioid)
```

In a 50 m³ room with 0.3 s RT60, `d_critical ≈ 0.74 m`. Inside that radius, room
contamination is below the direct signal — that's why VO mics live 6–20 cm from the lips.

---

## 8. Sound Design — EQ Frameworks

### 8.1 Audible Bands (Reference)

| Band | Range | Musical / production role |
|---|---|---|
| Sub-bass | 20–60 Hz | Felt rumble; theaters, EDM kicks |
| Bass | 60–250 Hz | Body, weight, warmth |
| Low-mid | 250–500 Hz | Mud / boxiness if too much |
| Mid | 500 Hz–2 kHz | Speech intelligibility core |
| High-mid | 2–4 kHz | Presence, attack, bite |
| Presence | 4–6 kHz | Clarity, sibilance edge |
| Brilliance / Air | 6–20 kHz | Sparkle, sense of "open" |

### 8.2 Operations

- **High-pass filter (HPF)** — removes content below cutoff. Slope 12/24 dB/oct.
- **Low-pass filter (LPF)** — removes above cutoff.
- **Shelf** — boost/cut all frequencies above (high shelf) or below (low shelf) a corner.
- **Bell / peaking** — boost/cut around a center frequency with a Q (bandwidth) parameter.
  Lower Q = wider; higher Q = surgical.

### 8.3 The Subtractive-First Rule

Cut before you boost. Why:

- Boosting raises noise floor and CPU usage on saturating EQs.
- Most "harshness" or "muddiness" is caused by *too much* of something, not *too little*.
- Cutting frees headroom — your mix has more space without the mix bus working harder.

#### Surgical de-mud sweep

1. Insert a bell with **+8 dB gain, Q = 4**.
2. Sweep slowly through 100 Hz–800 Hz on the source.
3. Where it sounds *worst* — boomy, nasal, boxy — that's the offender.
4. Pull the bell to **−3 to −6 dB** at that frequency. Done.

### 8.4 Voice EQ Recipe (Dialogue / VO / Podcast)

| Move | Frequency | Amount |
|---|---|---|
| HPF (12 dB/oct) | 80 Hz (male) / 100 Hz (female) | Removes rumble |
| Notch | 200–400 Hz | −2 to −4 dB (de-mud) |
| Notch | 800 Hz–1 kHz | −1 to −3 dB if "honky" |
| Bell boost | 3–5 kHz | +1 to +3 dB (presence) |
| De-esser | 5–10 kHz | Threshold for −3 to −6 dB on sibilance |
| Shelf boost | 10–12 kHz | +1 to +2 dB (air) |
| LPF | 16–18 kHz | Optional — tame mic hiss |

Always EQ *after* gain-staging and noise reduction. EQ on a noisy signal amplifies the
noise.

### 8.5 Mix-Bus EQ — Frequency Masking

When two sources occupy the same range, one masks the other. Strategy:

- **Carve, don't compete.** If voice lives at 3 kHz, dip music −3 dB at 3 kHz with a wide
  bell so the voice "sits in the hole."
- **Pan stereo elements** — voice mono center, music in L/R. The stereo field is itself
  a frequency separator.
- **Side-chain compression** — let the voice's transients duck the music in real time (key
  on the dialogue stem).

### 8.6 Final-Mix Loudness Targets (Integrated LUFS)

| Platform | Target | True peak ceiling |
|---|---|---|
| Cinema (theatrical) | Dialogue at ~−27 to −31 LKFS | ≤ −2 dBTP |
| Broadcast TV (EBU R128) | −23 LUFS | ≤ −1 dBTP |
| Broadcast TV (ATSC A/85) | −24 LKFS ±2 | ≤ −2 dBTP |
| Spotify / Apple Music | −14 LUFS | ≤ −1 dBTP |
| YouTube | −14 LUFS (normalized) | ≤ −1 dBTP |
| Podcasts | −16 LUFS | ≤ −1 dBTP |
| Instagram / TikTok / Reels | ~−14 LUFS practical | ≤ −1 dBTP |

Use a meter like **Youlean** or **iZotope Insight** measuring **integrated** loudness over
the whole program, **short-term** (3 s window) for compliance, and **true peak** to avoid
inter-sample clipping that becomes audible after lossy re-encoding.

---

## 9. Sound Design — Spatial Audio Configuration

### 9.1 Channel-Based vs Object-Based

- **Channel-based** — audio is mixed to specific speaker outputs (L, R, C, LFE, Ls, Rs…).
  Examples: stereo, 5.1, 7.1.
- **Object-based** (Dolby Atmos, MPEG-H, DTS:X) — audio elements ("objects") carry
  positional metadata and are rendered to whatever speaker layout the playback system has.

### 9.2 ITU-R BS.775 Standard (5.1)

- **L, R**: ±30° from center, on the listener's horizontal plane.
- **C**: 0°, dialogue anchor.
- **LFE**: anywhere (bass is non-directional below ~80 Hz).
- **Ls, Rs**: ±100° to ±120° (typically 110°).
- All speakers equidistant from the listener (or delays applied for compensation).

### 9.3 7.1 and 7.1.4 (Atmos)

- **7.1** adds rear surrounds at ±150°.
- **7.1.4** adds 4 height speakers (front-height ±30° azimuth, ~30° elevation; rear-height
  ±120° azimuth, ~30° elevation).
- **9.1.6** adds front wides and a 5th/6th overhead pair — used in dub stages.

### 9.4 LFE and Bass Management

- LFE is a **dedicated low-frequency effects channel**, not a subwoofer feed. It is band-
  limited to ~120 Hz (cinema) or 80 Hz (consumer).
- **Bass management** redirects low frequencies from main channels (whose speakers can't
  reproduce them) into the subwoofer, blended with the LFE.
- Crossover commonly **80 Hz, 24 dB/oct** for monitors that don't reach below.

### 9.5 Subwoofer Placement and Calibration

- **Crawl method**: place sub at the listening position playing pink noise; crawl the room
  perimeter; the spot where it sounds smoothest is where the sub should sit.
- **Phase / polarity** — invert and listen at crossover; pick the orientation that's
  *louder* (in-phase with mains).
- **SPL calibration** — pink noise at −20 dBFS RMS should produce 79 dB SPL (C-weighted,
  slow) per main channel and 89 dB SPL for LFE alone (cinema reference). For a near-field
  studio, 79 dB SPL at the listening position with all bass-managed channels is typical.

### 9.6 Binaural and HRTF

For headphones — **Head-Related Transfer Functions** simulate the way the head, ears, and
torso filter sound from different directions. Apple Spatial Audio, Dolby Atmos for
headphones, and Sony 360 Reality Audio all use HRTF rendering. Mix engineers should
**always check on at least one HRTF renderer** because the public listens on AirPods.

### 9.7 Ambisonics

A spherical-harmonic representation of a 3D sound field, decoupled from any speaker layout.

- **1st-order (B-format)** — 4 channels (W, X, Y, Z). Coarse spatial resolution.
- **2nd-order** — 9 channels. Better localization.
- **3rd-order** — 16 channels. Standard for high-end VR/360 video.

Ambisonics excels for **360° video** (YouTube VR) and **VR/AR** because the listener can
rotate their head and the field rotates with them, all from a single spatially-encoded
master.

### 9.8 Practical Atmos Mixing Rules

- **Anchor dialogue to the screen** (front L/C/R). Floating dialogue in surrounds is a
  common amateur mistake.
- **Use objects sparingly** — 8–16 objects in motion is plenty. Hundreds of static objects
  are a sign you should be using beds.
- **Test on every layout** — 7.1.4, 5.1.4, 5.1.2, stereo downmix, binaural. The
  downmix matrix can collapse a creative pan into mono mush; verify before delivery.
- **Headroom** — Atmos masters target **−18 LUFS integrated**, true peak −1 dBTP. Loud
  Atmos masters get re-rendered with reduced dynamics on consumer playback.

### 9.9 Loudness Across Formats

Apple Music and Tidal apply *no* attenuation to Atmos vs. stereo, but most platforms
apply **−7 LU** to align Atmos with their stereo loudness target. Mix accordingly: a
hot stereo master and a quiet Atmos master will not feel matched; the Atmos master must
be *intentionally quieter* with more dynamics to deliver the same emotional weight on
playback.

---

## 10. Appendix

### 10.1 On-Set Light Math Cheatsheet

```
INVERSE SQUARE       E ∝ 1/d²        2× distance = ¼ light = −2 stops
DOUBLE THE LIGHT     d × 0.71        +1 stop
HALF THE LIGHT       d × 1.41        −1 stop
SOFTNESS             apparent angular size of source at subject
KEY:FILL CONTRAST    ratio in stops; 4:1 = 2 stops
ND GELS              ND0.3 = 1 stop, ND0.6 = 2, ND0.9 = 3
CTO/CTB              shift 5600K → 3200K (Full CTO) and reverse (Full CTB)
```

### 10.2 LOG Exposure Targets (18% gray on waveform)

| Camera profile | Place 18% gray at IRE |
|---|---|
| ARRI Log C3 / C4 | 38–43 |
| Sony S-Log3 | 41 |
| Canon C-Log3 | 32 |
| Panasonic V-Log | 42 |
| RED Log3G10 | 46 |
| BMD Film Gen 5 | 38 |
| Fuji F-Log2 | 39 |

### 10.3 Editor's One-Page Cheatsheet

```
PROXIES                BRAW/RED → DNxHR LB or ProRes Proxy
SHOT-LENGTH TARGETS    Reels/Shorts 0.6–1.5 s   |   YT long-form 3–7 s
HOOK STRUCTURE         Hook → Promise → Proof → Payoff → Loop
RETENTION FIRST 15 s   Lead with most arresting visual + 1 sentence value
J/L CUTS               Audio leads/lingers across picture edits
COLOR ORDER            Black → White → Skin → Balance → Saturation → Look
SCOPES                 Waveform = exposure, Parade = balance, Vector = chroma
SKIN ON VECTORSCOPE    Aim trace along the I-line near 123°
LUFS YT/IG/STREAMING   −14 integrated, −1 dBTP
```

### 10.4 Sound Cheatsheet

```
SABINE                 RT60 = 0.161·V/A
TARGET RT60 VOICE      0.15–0.35 s
ROOM MODES (axial)     f = c/(2L), c = 343 m/s
SPEAKER LAYOUT 5.1     L,R ±30° | C 0° | Ls,Rs ±110° | LFE crossover 80 Hz
VOICE EQ               HPF 80–100 | cut 200–400 (mud) | boost 3–5k (presence)
                       de-ess 5–10k | shelf 10–12k (air)
LOUDNESS               Cinema dialogue ≈ −27 LKFS, Broadcast −23 LUFS,
                       Streaming/YT −14 LUFS, Atmos −18 LUFS
```

### 10.5 Further Reading

- **Cinematography**: *Painting With Light* (Alton); *Cinematography: Theory and Practice*
  (Brown); ASC Magazine "Lens & Filter" issues.
- **Color**: Alexis Van Hurkman, *Color Correction Handbook*; ACES documentation
  (acescentral.com).
- **Editing**: Walter Murch, *In the Blink of an Eye*; Karen Pearlman, *Cutting Rhythms*.
- **Sound**: David Sonnenschein, *Sound Design*; Bobby Owsinski, *The Mixing Engineer's
  Handbook*; Floyd Toole, *Sound Reproduction*.
- **Acoustics**: F. Alton Everest, *The Master Handbook of Acoustics*.

---

> The job is invisible labor: a frame the audience never notices, a cut they never feel,
> a low-shelf at 80 Hz they would only miss if it were gone. Mastery is the discipline
> to do that invisible work even when no one is watching the scopes.
