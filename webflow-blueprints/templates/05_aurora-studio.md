# Template 5: AURORA STUDIO

**Niche/Target Market:** Multi-disciplinary creative studios at the $1.5M–$8M annual revenue tier — practices doing high-end brand identity, motion design, art direction, and packaging for fashion, music, hospitality, and culture clients. Specifically the *credentialed creative class* register: Studio Dumbar, Pentagram, Order, Manual, Pearlfisher. Audience is Creative Directors at consumer brands evaluating a studio for a $200K–$1M brand-system project, and editors/curators considering the studio's work for press features.

**Core Value Proposition & Aesthetics:**

The thesis: a creative studio's website *is* its most important case study. Every layout decision is a design test the visitor unconsciously evaluates. The site must be more confident, more idiosyncratic, and more memorable than 95% of work made for clients. Boldness is the brief — but boldness with structural rigor.

**Design System:**
- **Typography:** Aggressive editorial display + restrained body. Display in **GT Alpina** or **Hatch** at heroic sizes (`clamp(4rem, 12vw, 14rem)`) with `letter-spacing: -0.04em` and `line-height: 0.92` (overlapping ascenders/descenders is intentional density). Body in **GT America** or **ABC Diatype** at 400 weight, generous (1.6 line-height). Captions in monospace **GT America Mono** uppercase. Mix display weights radically: 200 weight ultra-light for sub-headlines paired with 700+ weight for primary titles — extreme contrast is the studio's typographic signature.
- **Color Theory:** Asymmetric color system. Primary surface: warm cream `#F0EDE5`. Text: deep ink `#161613`. Then **rotating accent colors per page section** — burnt orange `#D85A2C`, electric chartreuse `#D4FF3F`, ultramarine `#1E3CC2`, rose `#E8B4B8`. Each major section "owns" one accent. This rotation creates the sensation of moving through different rooms in a gallery. NO greys (greys are corporate); use warm-tinted neutrals only.
- **Visual Language:** Asymmetric, anti-grid layouts that *look* chaotic but follow strict baseline-grid rules. Heavy use of full-bleed imagery and motion. Type often overlays imagery directly (no boxes, no scrims). Negative space is itself a composition element. Project work shown at scale — never thumbnailed. Custom cursor states throughout (this template ships with 4 cursor variants: default, hover-link, hover-image, hover-button).
- **Why $10K+:** Top creative studios commission custom sites at $80K–$200K (Order's site for itself was rumored to be $250K). The site is part business development, part recruiting, part status object. This template provides the structural framework — bold-but-rigorous editorial layouts, real case study CMS architecture, and motion-rich interactions — that a creative studio can adapt to its own visual vocabulary.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Statement)

- **Hero (100vh, type-driven, no images):**
  - Single sentence as hero: massive display type spanning multiple lines, broken intentionally for rhythm. Direction: "We make brands the world / *actually* / wants to remember." (Italic mid-sentence is critical — sets vocabulary.) Type sized at clamp(4rem, 12vw, 14rem) — fills the viewport. Color shifts mid-word: "the world" in one accent color, the rest in ink black.
  - Bottom-left: a small monospace eyebrow ("AURORA — A CREATIVE STUDIO. EST. 2014. AMSTERDAM + NEW YORK"). Bottom-right: a small "Selected work below ↓" indicator that subtly bobs (CSS animation, 2s loop, ±4px Y).
  - No image. No video. No buttons. The type IS the brand.

- **Section: Selected Work (the meat — asymmetric scroll-stack):**
  - 5–7 featured projects, displayed as full-width "scenes" — each project takes a full viewport+ of vertical space. Layout per project alternates radically:
    - Project 1: Full-bleed image left, 60% width. Right 40%: project name (display, 60px), client name, year, tags (Brand / Identity / Motion).
    - Project 2: Centered single image at 70% width. Below: project name spans the full width in display type.
    - Project 3: Three-image asymmetric collage — large image left taking 2/3, two stacked smaller right.
    - Project 4: Full-bleed video (autoplay, muted, looping). Project name overlays bottom-left in white display type.
  - Each project section is a CMS item; the layout type is a field controlling which template variant renders. This means the studio can add a project and choose its presentation style.
  - **CMS Collection "Projects":** Title, Client, Year, Slug, Layout Variant (option set: Full-Bleed Left / Centered Single / Asymmetric Trio / Full-Bleed Video / Type-Driven), Hero Image(s) (multi-image), Hero Video (optional file), Tags (multi-reference: Brand / Identity / Motion / Packaging / Editorial / Digital), Featured Section Position (number — controls homepage order).

- **Section: Studio Statement (single paragraph, oversized):**
  - Centered. One paragraph, 4 sentences, set in display type at 32px (no smaller than this). The paragraph describes the studio's philosophy in genuine, opinionated voice — not "we believe in great design" platitudes, but specific aesthetic positions: ("We don't believe in trends. We believe in trends seen 30 years from now."). Italics used liberally for emphasis. Behind the paragraph: a massive accent-colored background block (full-width, 80vh tall) that the type sits centered within.

- **Section: Recognition (press marquee):**
  - Heading "Recognized by." Below: a horizontal scrolling marquee of press logos and award badges (D&AD, Cannes Lions, Brand New, It's Nice That, Print Magazine, Communication Arts). CSS-only marquee using `transform: translateX` infinite animation (60s loop). Logos in monochrome at 60% opacity, scale to 100% on hover.

- **Section: Now / Working On (transparency signal):**
  - 2-column layout. Left column: heading "Now" + a list of 4–6 things the studio is currently focused on, in casual prose ("Working on a brand system for [redacted, NDA] launching Q1 2027." "Hiring a senior motion designer." "Curating a print show in May."). Right column: heading "Recently shipped" + a list of recently launched projects with launch dates. Both columns updateable via CMS Singleton "Now Page" — gives the studio a "lived-in" feel that high-tier creative buyers respond to.

- **Section: Capabilities (5-column micro-list):**
  - Heading "What we do." Below: 5 columns in a single row. Each column: a discipline (Brand Identity / Art Direction / Motion / Packaging / Editorial), and below each: 4–5 specific service items in monospace caption type. No icons. No hover states. Pure list. Reads like a studio's services section in *Eye Magazine*.

- **Footer (statement-style):**
  - Massive footer with the studio's contact info displayed as a single ultra-large display-type sentence: "Want to work together? / [hello@aurorastudio.com](#)." (Email is a hyperlink, underlined, 0.5em thick underline). Below: small monospace columns — Office addresses, Instagram/Are.na/Vimeo links, Press contact, Newsletter signup. Bottom of footer: copyright in tiny monospace.

### Page 2 — Work / Case Studies (Index + Detail)

- **Index Hero:** "Work" in display type. Below: filter chips for tags (Brand / Identity / Motion / Packaging / Editorial / Digital). Active filter shows in the corresponding accent color.

- **Index Layout:** Asymmetric mosaic — 3-column grid where rows have variable heights and individual cells span 1, 2, or 3 cells. CSS Grid with `grid-auto-flow: dense` for automatic packing. Each project tile shows: a single hero image (object-fit cover, varying aspect ratios), and on hover: image fades to 80% opacity, project name + client name appears overlaid in display type. Click → project detail page.

- **Project Detail Page (CMS template):**
  - **Hero:** Full-bleed hero image (or video) at 100vh. Overlay: top-left small monospace data ("BRAND IDENTITY — 2025 — FOR [CLIENT]"), bottom-left massive display type project name (`clamp(3rem, 8vw, 9rem)`).
  - **Section: Brief.** Single column, 720px max-width centered. Heading "Brief." 3-paragraph essay describing what the client asked for. Pull quotes: italic display, accent color, full-width breaks.
  - **Section: Approach.** Same width. Heading "Approach." Process documentation — sketches, type explorations, color tests, intermediate iterations. Mix of full-width images and inline text.
  - **Section: Outcome.** This is where the work is shown at full force. Multiple sections of full-bleed imagery, type-set across images, motion examples (video embeds), and detail shots. Layout per outcome section is freely-defined via the CMS rich text + image embeds.
  - **Section: Credits.** Centered, monospace. Lists every contributor: Client, Creative Director, Art Director, Designers, Motion, Photographer, Type Designer, Print Production, Web Build. This is non-negotiable in the creative industry — credit lists are a legal/professional norm. Template requires it.
  - **Section: Related Work.** 3 related projects (same tag or client). Hover behavior matches the index page.
  - **CMS Collection "Project Detail":** All fields from "Projects" plus Brief (rich text), Approach (rich text), Outcome (rich text with embedded media), Credits (long text or rich text — supports the formatted credit roll).

### Page 3 — Studio (About + Team + Practice)

- **Hero:** "Studio." Single sentence below: "A 23-person practice working across brand, motion, and editorial. Independent since 2014."

- **Section: The Practice (manifesto):**
  - Single column, 800px max-width. 8-paragraph essay on the studio's working philosophy. Reads like an essay in *Eye Magazine* or an *AIGA* journal piece. Drop-cap on first paragraph (display type, 5-line tall, accent color). Pull quotes throughout, italic display, full-width breaks.

- **Section: Team Grid:**
  - 4-column responsive grid of team members. Each card: a portrait photograph (4:5 aspect, in the studio's distinctive photo treatment — could be black-and-white, could be highly saturated, depends on studio identity), name (display type, 24px), role (caption monospace). Hover: portrait switches to a "candid" alternate photo (template ships with field for a primary + secondary photo — clicking effect = mood, suggests personality).
  - **CMS Collection "Team":** Name, Slug, Role, Primary Portrait, Secondary Portrait (alternate state), Bio (rich text — 2 paragraphs in studio voice, never corporate), Joined Year, Hometown, "What I'm into right now" (a single line that gets refreshed seasonally), Display Order.

- **Section: Recognition (deeper than homepage):**
  - Stacked list of every press feature, award, and industry recognition. Each row: year (monospace, left) | title of recognition | publisher/awarding body | category. Hairline divider between rows. Reads like a CV.

- **Section: Open Roles (recruiting integration):**
  - If there are open roles, surfaces here. Otherwise: "We're not actively hiring, but we always read introductions. [hello@aurorastudio.com](#)." This honesty is itself a positioning move.

### Page 4 — Journal / Field Notes (CMS thought leadership)

- **Hero:** "Journal." Single dek line: "Process notes, field observations, type explorations."

- **Index:** Asymmetric layout — featured post takes a 2/3 width tile, smaller posts in a packed grid below. Each post tile: image, dateline (monospace), title (display type), author (caption).

- **Article Page:** Generous editorial layout. 720px text column for body, but images and pull quotes break to full bleed (1280px) and ultra-bleed (full viewport). Drop-cap on first paragraph. Body in 19px reading type, 1.7 line-height.

- **CMS Collection "Journal":** Title, Slug, Hero Image, Dateline, Author (reference to Team), Tags, Rich Text Body (with embedded images, pull quotes, and gallery blocks), Reading Time.

### Page 5 — Contact (Inquiry Funnel)

- **Hero:** Massive display type: "Tell us about your project." Below: a 2-paragraph dek explaining how the studio engages — what kinds of projects fit, what doesn't (this filters the inbound).

- **Section: Inquiry Form (designed):**
  - Full-width form, designed as if it's part of the visual system. Fields rendered in display type sizes (label as 28px display, input field 24px serif body type, custom-styled — no default browser styling). Fields: Your name, Company, How can we help (dropdown: Brand Identity / Art Direction / Motion / Packaging / Editorial / Other / Just curious), Budget range (dropdown — gives the studio early signal), Project description (large textarea), When do you need it (dropdown). Submit button: massive — full-width, accent-colored, display type "Send →" (50px+).
  - On submit: page transitions to a "Received" state with a thank-you message in display type and a note that the studio responds within 5 business days.

- **Section: Direct Contacts:**
  - Below the form, smaller. 3 columns for direct emails: New work (`hello@`), Press (`press@`), Careers (`careers@`).

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Custom Cursor States (Mouse Move):**
- 4 cursor variants: default (small dot), link-hover (expanded ring), image-hover (large solid disk with "View" text), button-hover (filled accent dot).
- Implementation: hide the system cursor (`cursor: none` on body), render an absolutely-positioned div that follows mouse position via JS (`mousemove` event listener updating `transform: translate3d`). Variant changes triggered by `data-cursor` attributes on hovered elements.
- Mobile: disabled (touch-detect via `('ontouchstart' in window)`).

**Trigger 2 — Type-Driven Hero Color Shift on Scroll:**
- Element: Homepage hero sentence words.
- Trigger: "While scrolling in view" on hero.
- Action: Each word individually animated. As the user scrolls down, words shift from ink black to their target accent colors (e.g., "the world" goes from `#161613` → `#D85A2C`) over the first 30% of scroll progress. Different words have different target colors — the sentence gradually becomes a polychrome statement.
- Implementation: each word is wrapped in a `<span>` with its own scroll-tied interaction.

**Trigger 3 — Image Reveal on Scroll (Project Tiles):**
- Element: Each project tile image in the work index.
- Trigger: Scroll into view, 20% from bottom.
- Initial state: image has a colored overlay (`::after` pseudo-element, `background: var(--accent-color); opacity: 1;`).
- Action: overlay slides off image (`transform: translateX(0) → translateX(100%)`) over 1200ms with `cubic-bezier(0.85, 0, 0.15, 1)` (sharp slow-fast-slow). Reveals image underneath. Result: every image entrance has a "curtain reveal" feel — distinctly creative-studio vocabulary.

**Trigger 4 — Display Type Hover Distortion (Project Names on Hover):**
- Element: Project names in the index.
- Hover: type smoothly shifts from one weight to another (200 → 800 over 400ms, using `font-variation-settings` for variable fonts), letter-spacing tightens (`letter-spacing: -0.04em → -0.06em`). Tiny detail; massively studio-specific feel.

**Trigger 5 — Marquee Press Logos (Infinite, CSS-Only):**
- Element: Press marquee row.
- Pure CSS: `@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`. Apply to a flex row containing the logos duplicated twice. Animation: `60s linear infinite`. On hover (any logo): `animation-play-state: paused;` — entire marquee stops, individual logo scales up slightly. Resumes on mouse-leave.

**Trigger 6 — Page Transition (Click on Project Tile):**
- Element: Project tile click in work index.
- On click: a full-screen colored block (matching project's primary accent) animates from the click position outward, expanding to fill the screen over 600ms (`clip-path: circle()` from clicked coordinates expanding to 100%). Page transition happens during the cover. New page loads with cover sliding off in the same direction over 800ms. Smooth, intentional, reduces perceived load time.
- Implementation: small JS layer using View Transitions API where supported (`document.startViewTransition()`) with fallback to a manual transition layer.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with creative namespace `cr-`. Examples: `cr-hero_type`, `cr-project_tile`, `cr-marquee_press`, `cr-cursor_dot`. Utility classes prefixed `u-` for typographic operations: `u-display-xl`, `u-display-md`, `u-mono-caption`, `u-italic-emphasis`. Globals use `g-` prefix: `g-section_lg` (160px padding), `g-section_md` (96px), `g-container_wide` (1440px), `g-container_text` (720px for editorial body).
- **Asymmetric Grid:** Work index uses CSS Grid via embed: `grid-template-columns: repeat(3, 1fr); grid-auto-flow: dense; grid-auto-rows: 280px;`. Cells span via `grid-column: span 1|2` and `grid-row: span 1|2` based on the project's "Layout Variant" CMS field — handled by a small custom-code block that maps variants to span values.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Critical: hero display type uses `clamp()` to scale fluidly — never hardcode hero sizes per breakpoint. At 991px and below, the cursor system disables; at 767px, asymmetric grids collapse to 2-column; at 478px, single-column.
- **Color Section System:** Each major section has a `data-section-color` attribute (e.g., `data-section-color="orange"`). A small custom-code block on page load reads the active section as user scrolls and updates a CSS variable `--current-accent` that drives any "owner" elements. Adding a new accent color: define it in the global CSS variables map, add it to the option set in CMS, and apply `data-section-color` accordingly.

**How to Edit Content & CMS:**

- **Adding a Project:** CMS → Projects → New. Critical decisions: Layout Variant determines the homepage presentation — choose deliberately (don't over-use the same variant or the homepage loses rhythm). Hero Image must be production-quality — this is a design studio's portfolio; pixelated or cropped imagery destroys credibility. Tags should accurately reflect deliverables — a "Brand Identity" project with no logo work shouldn't carry that tag.
- **Writing Project Detail Pages:** Brief, Approach, Outcome are three required rich-text sections. Voice direction: write in confident, first-person plural ("We approached this as..." not "The brand needed..."). Avoid client-marketing language. The strongest project pages read like *AIGA Eye on Design* features — describe the *thinking*, not just the output. Credits section: include EVERYONE who touched the project, including external contractors. Standard format provided in the template's content style guide.
- **Updating "Now" Page:** Studio → Now CMS Singleton. Update 4–6 bullet points monthly. Voice: casual, observational, slightly self-deprecating. Examples: "Reading: *Type Specimens* by Otl Aicher" / "Hiring: a senior brand designer (link below)" / "Working on: a record sleeve for a band we love but can't name yet." This casual transparency is the signal that converts high-tier buyers — it suggests the studio isn't trying to be everything to everyone.
- **Color Section Rotation:** When adding sections to a page, decide consciously which accent owns it. The system supports up to 4 accents simultaneously per page; using more creates visual noise. Common rotation: hero (no accent / black), Section 1 (orange), Section 2 (chartreuse), Section 3 (ultramarine). Document the choice in the CMS via a "Section Color Notes" field for the buyer's reference.
- **Cursor Variant Mapping:** To add new cursor states (e.g., a "drag" variant for sliders), edit the cursor JS module in Project Settings → Custom Code. Variants are mapped via the `data-cursor` attribute on hover elements: `data-cursor="link"` / `"image"` / `"button"` / `"drag"` (your new one). New variants need both a JS state-handler entry and a CSS class with the styled cursor element appearance.
