# Template 2: ATELIER NOIR

**Niche/Target Market:** Independent ultra-luxury boutique hotels (Relais & Châteaux tier, $800–$3,500/night ADR), private members' clubs, and vineyard estates with overnight programs. Specifically *not* chain hotels, *not* mid-market — this targets properties where the website itself is part of the brand's perceived value, where guests book based on photographic seduction and editorial copy rather than amenity checklists.

**Core Value Proposition & Aesthetics:**

The thesis: a luxury hotel website that *feels like reading a coffee-table book*. Slow, deliberate, image-led, with copy that reads like long-form journalism rather than booking-engine bullets. Every interaction is restrained — luxury communicates through *what is removed*, not what is added.

**Design System:**
- **Typography:** Editorial serif pairing — display headlines in **GT Sectra** or **Canela** (display weight, 600), body in **Söhne** or **Inter** (regular, 1.7 line-height for editorial readability). Italic serifs for pull quotes. NO sans-serif headlines anywhere — that's mid-market signaling. Captions in 11px monospace (`Söhne Mono`) in uppercase with `letter-spacing: 0.18em` for editorial credit-line treatment.
- **Color Theory:** Bone white `#F5F1EB` primary surface (warmer than pure white, references unbleached linen). Ink black `#171513` for text (slightly warm, never pure `#000`). Single accent: aged brass `#A98B5C` — used sparingly, only for line dividers, hover underlines, and the booking CTA. Photography is the color — no other UI color is permitted.
- **Visual Language:** Full-bleed cinematic photography (always 16:9 or 4:5, never square). Generous whitespace — sections breathe at 160px+ vertical padding on desktop. Type appears small relative to imagery; the *image is the protagonist*, type is the caption. Hairline rules (0.5px solid `#A98B5C` at 30% opacity) divide sections — no boxes, no cards, no shadows.
- **Why $10K+:** Boutique luxury hotels routinely commission custom-photographed sites at $40K–$120K. This template provides the editorial scaffolding that elevates a property's existing photography into the same league. Includes a real direct-booking flow (Mews/Cloudbeds/SiteMinder integration patterns), CMS-driven editorial journal, and a private-events inquiry funnel — features that bolt the site directly onto revenue.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The First Frame)

- **Hero (100vh, full-bleed silent video or hero image):**
  - Single 16:9 video loop or photograph — a slow pan of the property's most evocative space (a candlelit dining room at dusk, a misty courtyard at dawn). Muted, no controls, autoplay, 15-second loop. `object-fit: cover`, `filter: brightness(0.85)` to ensure type legibility.
  - Type overlay: bottom-left aligned, *not* centered. Property name in display serif (clamp(3rem, 6vw, 5.5rem)), single italic tagline below ("A house in the hills. Eleven rooms. Three centuries of stories."). No CTA in hero — restraint is the message. Small chevron `↓` icon at bottom-center indicates scroll.

- **Section: Editorial Lede (the first scroll):**
  - Two-column asymmetric layout: 40% / 60%. Left: a vertical caption in monospace uppercase ("THE PROPERTY — EST. 1742"). Right: a 3-paragraph essay introducing the property's character. Reads like a New York Times "T Magazine" lede — historical context, sensory details, no marketing copy. First letter is a drop-cap (3-line tall, display serif, brass accent color).

- **Section: Rooms & Suites (CMS, asymmetric grid):**
  - Editorial gallery — NOT a uniform grid. 3 rooms displayed in a deliberately asymmetric layout: Image 1 spans left third at full height, Image 2 sits top-right at 40% width, Image 3 sits bottom-right at 60% width. Each image has a small overlay in the bottom-left corner: room name in serif, brass-colored hairline divider, a single sentence ("South-facing terrace. Original parquet. Rolltop bath."). Hover: image scales 1.02 over 800ms, the caption fades in.
  - **CMS Collection "Rooms":** Name, Slug, Hero Image (4:5), Gallery (multi-image), Square Footage, Bed Configuration, Editorial Description (long rich text), View Type, Price From, Booking URL.

- **Section: Dining (full-bleed image with overlay essay):**
  - Single full-width photograph (the kitchen at service, or a plated dish — not a restaurant interior). Min-height 90vh. Right-aligned text panel sits over the image: 480px wide, semi-transparent bone-white overlay (`background: rgba(245,241,235,0.92)`, `backdrop-filter: blur(8px)`), padded 64px. Contains: italic serif heading ("At The Table"), a 4-paragraph essay on the chef's philosophy and seasonal menu approach, and a small "View the menu →" link in brass with a hairline underline.

- **Section: Editorial Journal Preview:**
  - Heading "From the Journal" in display serif. Below: 3 most recent journal entries in a horizontal row. Each entry: a 4:5 image, dateline in monospace uppercase, headline in serif, single-line dek. No "Read More" button — the entire card is clickable, and on hover the headline gets a brass underline that draws across left-to-right over 400ms.

- **Section: The Booking Invitation:**
  - Centered, 720px max width. Single italic serif sentence: "Stays from October through April reveal a different house entirely." Below: a single brass-bordered button "Reserve a Stay" (this is the only filled button on the homepage). On hover: background fills brass, text inverts to bone, hairline border thickens.

- **Footer (newspaper masthead style):**
  - Restrained 3-column layout. Column 1: Property address, phone (no emoji icons, no decorative elements), reservations email. Column 2: A vertical text-only nav (Rooms / Dining / Journal / Private Events / Press). Column 3: A single-input newsletter signup ("The Quarterly — our seasonal letter."). Bottom hairline divider. Below: a serif italic copyright line.

### Page 2 — Rooms & Suites (Editorial Index)

- **Hero (50vh):** Single 16:9 image of an interior — wide architectural shot, not a "marketing" composition. Caption: italic serif H1 ("Eleven Rooms"). Below: a single sentence dek.

- **The Index (asymmetric staggered list):**
  - Each room is a full-width row alternating left/right. Left side: a single 4:5 photograph (uses CSS `aspect-ratio: 4/5`). Right side: 480px text column — room name, square footage in monospace, a 5–6 sentence editorial description, a hairline brass divider, then a "View Suite →" link.
  - Between rooms: 120px of vertical space and a centered hairline rule.

- **Filter (subtle, top-right):**
  - Small monospace dropdown chips ("View" / "Bed" / "Above") — when clicked, expand a small overlay menu with checkboxes. Filtering is real-time (Finsweet CMS Filter). When filters are applied, a tiny brass dot appears next to the active chip.

- **Section: "How to Stay" (editorial sidebar):**
  - Two-column at the bottom: left column is a 5-paragraph essay on the property's booking philosophy (minimum stay, rate inclusions, when to come). Right column: a sticky panel with the booking widget and a "Concierge Direct" phone number.

### Page 3 — Editorial Journal (Long-Form CMS)

- **Hero:** Heading "The Journal" in display serif, dek "Letters from the house, from our gardener, from our sommelier."

- **Index Layout:** Editorial magazine-style — first article is a featured hero (full-width, image left, large headline + dek + dateline right). Following articles flow in a 3-column asymmetric grid where heights vary by article length tag.

- **CMS Collection "Journal":** Title, Slug, Hero Image (16:9 + 4:5 variants), Author Reference (Team collection), Publish Date, Length Tag (Brief / Feature / Essay — controls grid sizing), Category (Reference: Wine / Food / Garden / People / Travel), Rich Text Body (with embedded pull-quote, gallery, and citation blocks).

- **Article Page:** 680px max content width. Centered. Hero image full-bleed at top. Then: dateline in monospace uppercase, serif H1, serif italic dek, byline. Body in serif with 1.7 line-height, drop-cap on first paragraph. Pull quotes: italic serif at 1.5x body size, brass left-border (2px), full-width breaks within the body. Inline images: full-width with 11px monospace caption below (`figcaption` element). End of article: hairline brass divider, "Continue Reading" with 2 related articles below.

### Page 4 — Private Events (High-Intent Inquiry Funnel)

- **Hero:** Single image — the property dressed for an event (a long candlelit table, a cleared salon ready for a string quartet). Headline: "A house, on occasion, becomes the stage." Editorial subhead.

- **Section: Event Types (3 column, restrained):**
  - Three columns: "Weddings & Unions," "Corporate Convenings," "Private Gatherings." Each column: a small image, italic serif heading, 3-sentence description, hairline rule, capacity (in monospace: "Up to 80 seated"). No buttons — entire column is a link to anchored sections below.

- **Section: Available Spaces (CMS-driven):**
  - Single column, full-width per space. Image left (4:5), text right. Includes capacity in 3 modes (seated / standing / theatre), exclusive-use availability, AV provisions.
  - **CMS Collection "Spaces":** Name, Image, Seated Capacity, Standing Capacity, Theatre Capacity, Exclusive Use (boolean), Editorial Description, AV Notes.

- **Section: The Inquiry Form:**
  - 2-column inquiry form sits on a bone-white raised surface. Fields: Event type (dropdown), Estimated date range, Guest count, Your message. Submit triggers a Webflow Logic flow → routes to the events team Slack + sends an editorial auto-response email ("Your note has been received. Our events director will reply within two business days.").

### Page 5 — Reservation (Booking Funnel)

- Minimal. Hero: "Reserve a Stay." Below: an embedded direct-booking widget (Mews, Cloudbeds, SiteMinder, or Bookboost — the buyer chooses). Template includes embed-ready containers with proper height/width sizing for each major PMS.
- Below the widget: a 3-paragraph editorial section on rate inclusions, cancellation philosophy, and what's never charged extra (linens, breakfast, whatever the property includes).
- Bottom: "Prefer to call?" with the reservations phone number in display serif, large, brass-colored.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Editorial Drop-Cap Reveal (Page Load):**
- Element: First paragraph of any editorial section.
- Trigger: Page load, after fonts load (use `document.fonts.ready` Promise).
- Action: Drop-cap letter starts at `opacity: 0`, `transform: translateY(20px)`, animates to `opacity: 1`, `translateY: 0` over 1200ms with `cubic-bezier(0.19, 1, 0.22, 1)` (luxury "ease-out-expo"). Subsequent body text fades in 200ms after, faster (600ms duration).

**Trigger 2 — Hairline Rule Draw-In (Scroll-Into-View):**
- Element: All hairline brass dividers between sections.
- Trigger: Scroll into view, 30% from bottom.
- Initial state: `width: 0`, set on page load.
- Action: Animate `width: 0 → 100%` over 1400ms with linear easing. Slow draw is critical — fast = mid-market.

**Trigger 3 — Image Scale on Hover (Gallery Cards):**
- Element: Each image card in the rooms gallery, journal index.
- Hover in (800ms, `cubic-bezier(0.19, 1, 0.22, 1)`): `transform: scale(1.02)` on the inner `<img>`. Image is wrapped in a container with `overflow: hidden` so it appears to "settle into" the frame. Caption opacity `0 → 1` over 400ms, 100ms delay.
- Hover out (1200ms): Reverse, longer duration for visual luxury (snappy = cheap).

**Trigger 4 — Hero Video Subtle Ken Burns (CSS):**
- Element: Hero video.
- Pure CSS `@keyframes`: `transform: scale(1) → scale(1.06)` over 30s, infinite alternate. Combined with `filter: brightness(0.85)`. The slow zoom adds cinematic depth without requiring animation interactions.

**Trigger 5 — Brass Underline Draw on Link Hover:**
- Element: All editorial text links.
- Hover in (400ms, ease-out): An absolutely-positioned `::after` pseudo-element grows `width: 0 → 100%` from left. Background: `#A98B5C`. Height 1px. Sits at `bottom: -2px`.
- Hover out (250ms): `transform-origin: right`, width shrinks `100% → 0` from right (different direction creates asymmetric, intentional motion).

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with editorial namespace prefix `ed-`. Examples: `ed-hero_video`, `ed-room_card`, `ed-journal_pull-quote`, `ed-divider_hairline`. Utility classes: `u-text-italic`, `u-spacing-editorial`, `u-aspect-4-5`. Globals: `g-section_lg` (160px padding), `g-section_md` (120px padding), `g-container_editorial` (1240px max-width).
- **Grid:** The asymmetric room gallery uses CSS Grid via embed: `grid-template-columns: 1fr 2fr; grid-template-rows: auto auto; gap: 24px;` with explicit cell placement. To add a 4th room to the asymmetric gallery, duplicate Cell 3 and adjust `grid-column` / `grid-row` placement.
- **Breakpoints:** 1920px (large desktop padding increase) / 1440px (default) / 991px (asymmetric grids collapse to single-column stacked, 4:5 aspect maintained) / 767px (drop-caps disabled, all rooms full-width) / 478px (hero text repositions to bottom-center, editorial padding reduced to 80px).
- **Vertical Rhythm:** All editorial sections use a strict 8px baseline. Section padding: 160px / 120px / 80px / 64px. Heading-to-body spacing: always 32px. Paragraph-to-paragraph: 24px. NEVER use 16px or 20px — those are mid-market values.

**How to Edit Content & CMS:**

- **Adding a Room:** CMS → "Rooms" → New Item. Required fields: Name, Slug (lowercase-hyphenated), Hero Image (upload at minimum 1600×2000px for 4:5, 90% JPEG quality), Gallery (4–8 supporting images at same aspect), Square Footage (number), Bed Configuration (text: "King + queen sofa"), Editorial Description (rich text — 5–6 sentences, written like a real estate listing in The New York Times, NOT marketing copy). Set Display Order; lower numbers appear first in the gallery.
- **Writing Journal Articles:** CMS → "Journal." Hero Image must have a 16:9 version (for index thumbnail) AND a 4:5 version (for article page hero) — upload both. Length Tag controls grid sizing on the index page: "Brief" (1×1 grid cell), "Feature" (1×2), "Essay" (2×2). Pull quotes: highlight text in the rich text editor → use "Quote" embed (template ships with custom rich-text formatting class `.ed-pullquote`). Drop-cap is automatic on the first paragraph via CSS `:first-child::first-letter`.
- **Updating Booking Widget:** The Reservation page has a clearly-labeled embed div: `<div id="booking-widget-mount">`. Replace its contents with the buyer's chosen PMS embed code (Mews, Cloudbeds, SiteMinder, etc.). Template ships with three pre-styled wrapper templates — uncomment the appropriate one in the Page Settings → Custom Code section.
- **Photography Replacement Discipline:** All hero images must be 16:9 (1920×1080 minimum), all room/journal images 4:5 (1600×2000 minimum). Use WebP format for performance, JPEG fallback. Critical: maintain consistent color grading across all property photography — the template provides a "Editorial Photo Standards" PDF in the assets folder describing the visual treatment (slightly desaturated, warm shadows, natural light bias).
