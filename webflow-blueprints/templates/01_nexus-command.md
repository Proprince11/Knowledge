# Template 1: NEXUS COMMAND

**Niche/Target Market:** Series-A to Series-C AI/ML infrastructure startups — companies building foundational AI models, vector databases, inference engines, or MLOps platforms that sell to enterprise developers. Positioning tier of Pinecone, Replicate, Modal, Weights & Biases — *infrastructure-grade developer tooling* where the website itself must signal technical credibility while driving demo requests from engineering leadership.

**Core Value Proposition & Aesthetics:**

Not a template — a *positioning weapon*. The design system communicates: "We are the infrastructure layer you build on top of."

**Design System:**
- **Typography:** Geist Mono for code snippets and data labels. Geist Sans (or Inter Tight) for headlines at 700 weight, body at 400. Headlines oversized (`clamp(2.5rem, 5vw, 4.5rem)`) with `letter-spacing: -0.03em` for visual density. No decorative fonts anywhere.
- **Color Theory:** Void black `#09090B` (slight warmth prevents clinical harshness). Accent gradient: electric indigo `#6366F1` → violet `#8B5CF6` → cool cyan `#06B6D4`. Success: muted emerald `#10B981`. Three text opacity tiers: 98% / 70% / 45%.
- **Visual Language:** "Control plane" metaphor — interfaces within interfaces, floating dashboard panels, abstract node graphs. Depth via base surface + raised plane (1px border at 8% white + subtle inner glow) + floating accents. No flat illustrations; only engineered diagrams, real terminal output, architecture schematics.
- **Why $10K+:** AI infra companies routinely spend $50K–$150K on custom sites. This delivers 85% of that outcome. Includes a working code-block component with syntax highlighting, real changelog CMS, interactive API reference patterns, and a pricing page engineered for usage-based models.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Command Surface)

- **Hero (100vh, no scroll indicator):**
  - Left 60%: Headline pattern "[Verb] [technical outcome] [speed qualifier]." Direction: "Deploy inference at the edge in under 200ms." Subhead (2 lines max) states the *infrastructure-level* value — what breaks without this product. CTAs: primary "Start Building" (filled, gradient border, 1px hover glow) + secondary "Read the Docs" (ghost, arrow animates right on hover).
  - Right 40%: Floating terminal/dashboard — a Webflow-native component (nested divs styled as a code editor) showing 3–4 lines of realistic CLI output or cURL with the product's actual API. Subtle parallax float (`translateY` ±15px tied to scroll). Glassmorphic surface: `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.04)`, 1px border at 6% white.
  - Background: Radial gradient (indigo at 3% opacity) from the hero panel; fine dot-grid (1px dots, 4% opacity, 24px spacing) fading to transparent at section bottom.

- **Social Proof Bar (80px tall, compact):**
  - "Trusted by engineering teams at" + 6–8 monochrome logos at 40% opacity (70% on hover). Static row, CSS flex wrap on mobile. Ships with placeholder SVGs in correct *style* — geometric, minimal — for buyer to swap.

- **Bento Feature Grid (signature section, 4-col × 2-row asymmetric):**
  - **Cell A** (2×2 hero feature): SVG node graph (3–4 nodes, animated dashed connections). Headline + 2-line description bottom-left.
  - **Cell B** (1×1): Performance metric. Large number (`< 50ms`) + label. Subtle animated gradient pulse (8s loop, 0.02–0.06 opacity oscillation).
  - **Cell C** (1×1): Integration logos in a 2×3 mini-grid + "12+ integrations" label.
  - **Cell D** (2×1): Code snippet — dark inset, monospace, 3-line SDK example. "Copy" button top-right with checkmark state on click.
  - All cells: 1px border (white at 6%), `border-radius: 12px`, padding 24px. Hover: `translateY(-2px)`, border brightens to 12%.

- **How It Works (3-step linear):**
  - Horizontal desktop / vertical mobile. Each step: gradient-ringed numbered circle, imperative headline ("Connect your model"), 2-line explanation. Connector line between steps (dashed, animated `stroke-dashoffset` for flowing-dot effect).

- **Metrics & Outcomes:**
  - Three stat cards in a row: "99.99% uptime," "3.2B daily inferences," "< 200ms p95 latency." One-line context below each. Raised-panel treatment. `font-variant-numeric: tabular-nums`.

- **CTA Band:**
  - Full-width dark section, centered. Headline: "Your models deserve better infrastructure." Subline addressing pain. Primary CTA replicated. Dot-grid + accent gradient glow centered behind the button.

- **Footer (information-dense):**
  - 4 columns: Product / Company / Developers / Legal. Bottom row: copyright + SOC-2/GDPR badges (tiny, monochrome). Surface 10% lighter than page background.

### Page 2 — Platform / Product (Deep Feature Exploration)

- **Hero (60vh):** Shorter. Product/platform name. Single technical sentence subhead. Full-width product screenshot or diagram with subtle perspective tilt (`transform: perspective(1200px) rotateX(2deg)`) inside a device-frame component (thin border, rounded corners, three-dot top bar).

- **Feature Deep-Dives (CMS-driven, alternating left/right):**
  - Each block: 24px monoline accent icon + headline + 3–4 sentence paragraph answering *what it does, why it matters, what breaks without it*. Image side: UI screenshot in device frame OR architecture diagram.
  - **CMS:** "Platform Features" — Name, Short Description, Long Description, Category Tag, Diagram/Image, Display Order.

- **Architecture Diagram (full-width):** SVG showing how the product fits into the customer's stack. Labels on integration points. Static image, but the template *includes the editable Figma/SVG source*.

- **Comparison Table:** "Why [Product] vs. [Alternative Approaches]." Responsive table (horizontal scroll + fade-edge on mobile) comparing 4–5 dimensions (latency, cost, scalability, managed vs. self-hosted). Product column highlighted with accent border-top + subtle background tint.

### Page 3 — Pricing (Usage-Based Model)

- **Hero:** Minimal. "Pricing that scales with you" + subline on usage-based fairness. No decorative elements; pricing pages must reduce cognitive load fast.

- **3-Tier Cards:**
  - Each: tier name (Free / Pro / Enterprise), one-line positioning ("For teams shipping their first model to production" — not "For small teams"), primary metric ("10K inferences/month included"), price (large, tabular-nums, "/month" smaller), CTA, then feature checklist (accent green checkmarks, top 3 features **bolded**).
  - Recommended tier (Pro): 2px wider border in accent gradient, "Most Popular" pill badge above, +8px taller padding to break the horizontal line.

- **Usage Calculator (interactive):** Slider/input for expected monthly volume. Below: dynamically calculated cost. Custom JS (vanilla, ~30 lines, commented `// TIER THRESHOLDS — edit these`) included in page custom code.

- **FAQ Accordion:** 6–8 pricing-objection questions ("What if I exceed my tier?", "Can I switch mid-cycle?", "Annual discounts?"). Webflow native interaction: click → height auto-expand, 300ms ease, chevron rotates 180°.

- **Enterprise CTA:** Dark full-width band. "Need custom volume pricing or an SLA?" → "Contact Sales."

### Page 4 — Changelog (CMS Living Document)

- Single-column, 680px max content width, left-aligned.
- **CMS Collection "Changelog":** Title, Date, Version Tag, Category Multi-Reference (links to "Change Type": Feature / Improvement / Fix / Breaking), Rich Text Body (images, code blocks, callouts), Author Reference.
- **Entry card:** Date as left sticky label (`position: sticky` within entry). Version badge (ghost pill). Title bold. Color-coded category pills (green/blue/amber/red). Rich text body, line-height 1.75, monospace code blocks on lighter surface.
- **Filtering:** Top-of-page horizontal filter pills per Change Type. Real-time filter via Finsweet CMS Filter attribute (no page reload).

### Page 5 — Contact / Book a Demo (Conversion Terminal)

- **Layout:** Split — 55% content / 45% form.
- **Left:** Headline: "Talk to our engineering team" (specificity > "Contact Us"). 3 icon bullets stating what happens on the call ("1. We'll audit your current inference stack. 2. Map your scaling requirements. 3. Build a custom deployment plan."). Below: "Trusted by [X] teams" + 3 logos (pre-qualifies the lead).
- **Right:** Embedded form (Webflow native or HubSpot/Calendly). Fields: Work email, Company name, Monthly inference volume (dropdown: <100K / 100K–1M / 1M–10M / 10M+), "What are you building?" (textarea). Primary gradient submit button. Below: "We respond within 4 hours" (response-time commitments cut form abandonment 20–30%).
- Right form panel sits on raised glassmorphic surface to draw the eye.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Hero Terminal Float (Scroll-Tied Parallax):**
- Element: Floating terminal panel (Homepage hero).
- Trigger: "While scrolling in view" on hero section wrapper.
- Action 1 (0–100% scroll): `translateY: 0 → -30px` (panel floats up, separates from background).
- Action 2 (0–100%): Opacity `100% → 85%` (subtle recession).
- Action 3 (background dot-grid): `background-position-Y: 0 → +15px` (counter-scroll, amplifies depth).
- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`.

**Trigger 2 — Bento Grid Staggered Reveal (Scroll-Into-View):**
- Elements: Each bento cell.
- Trigger: "Scroll into view," 15% from bottom.
- Initial state (set on page load): `opacity: 0`, `translateY: 24px`, `scale: 0.97`.
- Action: Animate to `opacity: 1`, `translateY: 0`, `scale: 1`. Duration 600ms. Easing `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- Stagger: Cell A 0ms, B 80ms, C 160ms, D 240ms — same interaction class on each cell with different "delay before" values.

**Trigger 3 — Code Block Copy Button (Click):**
- Trigger: Mouse click on Copy button.
- Action 1: Hide clipboard icon (opacity 0, 150ms).
- Action 2 (after 150ms): Show checkmark icon (opacity 1, 150ms) + text swap "Copy" → "Copied!" (two spans, toggle display).
- Action 3 (after 2000ms): Reverse — clipboard icon back, "Copy" text restored.
- Custom code pairing: small `<script>` calls `navigator.clipboard.writeText()` on the code block's `innerText`. Webflow handles visual state; JS handles functional clipboard write.

**Trigger 4 — Pricing Card Hover Elevation:**
- Element: Each pricing tier card.
- Hover in (250ms ease-out): `translateY: -4px`, `box-shadow: 0 4px 24px rgba(0,0,0,0.1) → 0 12px 48px rgba(99,102,241,0.08)` (accent color in shadow = "glow lift").
- Hover out (350ms ease-in-out): Resting state. Slightly longer hover-out prevents jarring snap-back.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Modified Client-First (Finsweet). Pattern: `[block]_[element]-[modifier]`. Examples: `hero_terminal-panel`, `bento_cell-large`, `pricing_card-featured`, `cta_button-primary`. Utility classes: `u-` prefix (e.g., `u-text-opacity-70`, `u-max-width-content`). Globals: `g-` (e.g., `g-section-padding`, `g-container-width`).
- **Grid:** Master container `g-container-width` is `max-width: 1280px`, auto margins, 24px horizontal padding (48px above 1440px breakpoint). Bento grid uses CSS Grid via custom code embed: `display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); gap: 16px;` with explicit `grid-column: span X` per cell class.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Bento collapses to 2-col at 991px, single-col at 478px. Always design at 1440px first; check 991px and 478px; `clamp()` handles between.
- **Adding a Bento Cell:** Duplicate any `bento_cell` div, change `grid-column`/`grid-row`, add to the stagger interaction with delay incremented by 80ms.

**How to Edit Content & CMS:**

- **Changelog:** CMS → "Changelog" → New Item. Fill Title (imperative: "Added GPU autoscaling for inference endpoints"), Date, Version, select Change Types (multi-reference), write Rich Text body, optionally link Author. Publish — entries auto-sort by Date descending.
- **Pricing:** Static (not CMS — pricing changes need precise visual control). Edit text content directly in Designer. To change "recommended" tier: move the `pricing_card-featured` class to the new card. Edit usage calculator JS via page custom code; tier breakpoints commented `// TIER THRESHOLDS`.
- **Logos:** Each is an SVG inside `proof_logo-item`. Replace via asset manager (white/light SVG on transparent for dark mode). Maintain consistent height (28px); width flexes naturally.
- **Platform Features:** CMS → "Platform Features" — Title, Short Description, Long Description (rich text), Category Tag, Diagram/Image (SVG for diagrams, WebP for screenshots, max 1200px), Display Order (lower = first). Alternating left/right is automatic via CSS `:nth-child(even)`.
