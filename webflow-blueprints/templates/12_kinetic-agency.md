# Template 12: KINETIC AGENCY

**Niche/Target Market:** Performance marketing agencies serving DTC e-commerce brands at the $5M–$200M ARR scale. Specifically firms that drive paid media at scale across Meta, Google, TikTok, and emerging platforms — with a measurable ROAS focus, not generic brand work. Tier of Common Thread Collective, Disrupter School, Ridge (the agency arm), Andrew Faris, Chase Dimond. Audience is Founders and CMOs at growing DTC brands (typically $500K–$5M monthly ad spend) evaluating agencies after first-tier in-house teams have plateaued. They want PROOF — case studies, results, and the agency's own performance.

**Core Value Proposition & Aesthetics:**

The thesis: a performance marketing agency's website MUST itself be a high-converting page. Hypocrisy is fatal — if the agency's site is slow, has poor conversion, or fails its own basic performance principles, no DTC founder will hire them. The aesthetic is the opposite of subtle: bold, evidence-loaded, results-forward. Big numbers. Real screenshots. Specific account-level case studies with client names attributed. The agency's site is a working demonstration of what they sell.

**Design System:**
- **Typography:** Bold display + clean sans-serif body. **Söhne Breit** or **GT Walsheim Display** for headlines (heavy weights — 700-800), oversized, declarative. **Söhne** or **Inter** at 400-500 for body, 1.6 line-height. Numerals always tabular-nums for ROAS, growth percentages, ad spend figures. Headlines often feature a single word or phrase blown up to viewport-dominating size.
- **Color Theory:** High-contrast, energetic. Primary surface: pure white `#FFFFFF` (energetic, no warmth — DTC brand aesthetic). Body text: `#0A0A0A`. Primary accent: a vibrant electric red-orange `#FF3A2C` — the color of "alert" and "action," used for headlines, CTAs, and result highlights. Secondary accent: success green `#00C46B` for ROAS improvements and positive metrics. Tertiary: bright yellow `#FFD93D` for callouts and highlight boxes (used sparingly). Bold contrast throughout — no muted greys.
- **Visual Language:** Neo-brutalist + modernist DTC. Hard-edged blocks, thick borders (2px+, not hairlines), oversized type, tight grids. Real screenshots of actual Meta Ads Manager, Google Ads dashboards, Triple Whale dashboards (anonymized client data). Big-number displays everywhere. Rotating client logos (real DTC brand logos that the agency has worked with). Photography minimal — when used, it's dynamic action shots of the team or behind-the-scenes content production. NO stock business photography, NO "happy clients shaking hands" cliché.
- **Why $10K+:** Top performance marketing agencies invest $25K–$60K in their own websites because the website is a working sales asset that closes 5- to 6-figure monthly retainers. Generic agency templates fail this niche entirely — DTC founders see "Agency.com" templates daily and dismiss them instantly. This template provides the rare combination: aggressive results-forward design, a real case study CMS engineered for ROAS data presentation, and a calculator/quiz funnel that pre-qualifies leads before the discovery call.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Sales Engine)

- **Hero (90vh, results-forward):**
  - Centered, max-width 1200px. Top: a small uppercase eyebrow in red-orange ("PERFORMANCE MARKETING — FOR DTC BRANDS"). H1 in display sans (`clamp(3rem, 8vw, 7rem)`), heavy weight, line-height 0.95, letter-spacing -0.04em. Direction: "We turn $1 / into $4.20." (Two lines. The actual ROAS number is the headline.) Below: 1-paragraph dek explaining what the agency does in 2 sentences. Two CTAs: primary "Get a free audit" (red-orange filled, bold sans-serif text, hard 0px corners), secondary "View case studies" (1px black border, ghost button).
  - Below the headline: a row of "social proof bar" — typical brand logos OR a row of 3 monolithic stats: "$240M MANAGED AD SPEND IN 2025" / "AVG. CLIENT ROAS 4.2x" / "67 ACTIVE CLIENT BRANDS." Each in heavy display, tabular-nums.
  - Background: pure white. NO decorations.

- **Section: Featured Client Results (the heaviest block):**
  - Heading "RESULTS." Below: a 3-column grid of "result cards." Each card is a chunky, high-contrast block displaying:
    - Top: client brand logo (recognizable DTC brand)
    - Middle: a massive single number — "+340%" (heavy display, 80px, red-orange or green depending on metric direction)
    - Description of what the number measures: "REVENUE INCREASE IN 9 MONTHS"
    - Below: 2-line context ("From $480K/mo to $2.1M/mo. Held ROAS at 4.5x throughout scale.")
    - Bottom: small "VIEW CASE STUDY →" link
  - Cards have 2px black borders, no rounded corners, generous padding. Hover: card translates `(-4px, -4px)`, hard-edged colored shadow appears at offset `(8px, 8px)`. Brutal, evident.
  - **CMS Collection "Case Studies":** Brand Name, Brand Logo, Industry (Apparel / Beauty / Supplements / Home / Tech / etc.), Headline Result (text — "+340%"), Result Type (Revenue / ROAS / CAC Reduction / etc.), Headline Description, Context Sentence, Spend Range, Time Period, Long Case Study Body (rich text), Featured (boolean), Display Order.

- **Section: Services / What We Do (4-column block):**
  - Heading "WHAT WE DO." Below: a 4-column grid of services: Meta Ads / Google Ads / TikTok Ads / Email & SMS. Each card: service name in heavy display, 3-paragraph description with specifics ("We run 200+ creative tests per month per account. Daily creative refresh cycles."), bullet list of specific deliverables, and "Learn more →" link. Cards have 2px borders.

- **Section: How We Work (process block):**
  - Heading "OUR PROCESS." Below: 4-step horizontal flow. Each step has a heavy numeral (left, 100px, red-orange), heading, 2-paragraph description.
    1. **Audit.** Free 7-day deep audit of current ad accounts. We surface what's leaking and what's working.
    2. **Onboard.** 14-day onboarding — creative brief, audience strategy, account restructure, tracking implementation.
    3. **Scale.** Daily testing, weekly creative refresh, monthly strategic reviews. Constant iteration.
    4. **Compound.** Quarterly compounding — winning creative gets retired, new tests deployed, learnings flow into the next quarter.

- **Section: Calculator (interactive lead qualifier):**
  - Heading "WHAT WOULD WE DO FOR YOUR BRAND?" Below: an interactive ROAS calculator. Inputs: current monthly ad spend ($), current ROAS (number), target ROAS (number — pre-filled with 4.0). Outputs (live-update): "Projected revenue increase," "Additional revenue per month," "Revenue per dollar spent." Below outputs: a CTA button — "Get a personalized growth plan →" — that opens a Calendly embed for a discovery call.
  - Custom JS handles the live calculation. Inputs use big, bold styling (50px tall input fields). Outputs displayed in massive numbers below.

- **Section: Team (humanizing block):**
  - Heading "WHO RUNS YOUR ACCOUNT." Below: a 3-column grid of senior team members. Each card: a candid, energetic photograph of the person (color, dynamic — at a desk, at a conference, in a content session — NOT corporate headshots), name, role, and a 2-sentence bio describing what specifically they do at the agency. Real names, real faces, real specifics — DTC founders want to know who's actually running their account.

- **Section: FAQ (objection-handling):**
  - 6-8 questions handling DTC-founder-specific objections: "How much does it cost?" (transparent ranges), "Can you work with our existing creative team?", "What's the contract length?", "Do you require exclusivity?", "What KPIs do you optimize for?", "What if our ROAS is already good?", "How quickly do we see results?", "Can we work with you if we're under $1M ARR?"

- **Section: Final CTA Band:**
  - Full-width red-orange band (the only background color section on the homepage). Heading in white display: "Ready to scale profitably?" Below: 1 sentence. Primary CTA: "Book your free audit" (white background, black text, hard corners).

- **Footer:**
  - 4 columns: Services / Case Studies / Resources (Blog, Free audit, ROAS calculator, Newsletter) / Contact (Office, Phone, Careers). Bottom: copyright + small disclaimer.

### Page 2 — Case Studies (Index + Detail)

- **Index Hero:** "CASE STUDIES." 1-line dek about the agency's commitment to publishing results.

- **Filter:** Industry, Result Type, Spend Range. Real-time filter.

- **Index Layout:** Asymmetric grid — featured case studies get larger tiles (2-column span), regular tiles 1-column. Each tile: brand logo, big result number, headline, "VIEW →" link. Hover: tile lifts with hard-edged shadow.

- **Case Study Detail Page (CMS):**
  - **Hero:** Brand logo + brand name (heavy display H1), "$X to $Y over Z months" (massive subhead), industry tags.
  - **Section: The Challenge.** 3 paragraphs describing what was broken when the brand came to the agency. Specifics — "ROAS was 1.8x and declining. CAC had risen 60% YoY. Creative refresh cadence was monthly."
  - **Section: The Diagnosis.** What the agency's audit found — specific issues identified ("Account structure was over-segmented; learning phase was perpetual," "Creative library was 90% UGC with no studio-produced ads," "Tracking was attributing 30% incorrectly due to SKAdNetwork misconfiguration").
  - **Section: What We Did.** A detailed walkthrough of the work — campaign restructure, creative production cadence change, audience strategy, bidding strategy, tracking fix. Each subsection with specifics.
  - **Section: Results.** A grid of result cards showing concrete metrics: ROAS over time chart, monthly revenue chart, CAC trajectory, creative test win rate. Each chart: real data, real numbers, with proper attribution and time ranges.
  - **Section: What's Next.** What the agency is currently working on with this brand for the next quarter.
  - **Section: Quote.** A pull-quote from the brand's founder/CMO. Heavy display italic, 32px, with photo + name + title.

  - **CMS Collection (extended):** All fields from above, plus Challenge (rich text), Diagnosis (rich text), Approach (rich text), Results Charts (multi-image — chart screenshots from analytics tools), Founder Quote (rich text), Founder Photo, Founder Title.

### Page 3 — Free Audit (The Conversion Page)

- **Hero:** Heavy display: "Get a free 7-day audit / of your ad account." (Two-line break.) Below: 2-paragraph dek explaining what the audit includes (specific deliverables — account structure review, creative library audit, bidding strategy assessment, tracking validation, growth plan with specific recommendations) and what it doesn't (it's not a sales pitch — the agency delivers actual recommendations whether you become a client or not).

- **Section: What You Get.** A bulleted list of specific deliverables — 22 specific items the audit produces, written in concrete terms. ("A specific list of campaigns to pause, restructure, or scale." "Creative test plan for the next 30 days." "Bidding strategy recommendations by campaign type.")

- **Section: How It Works.** 4-step process: 1. Schedule a 30-min call to share account access. 2. Our team audits over 7 days. 3. We deliver the audit document + 60-min walkthrough. 4. Decide if you want to engage us — no pressure either way.

- **Section: Audit Form.**
  - Substantial qualifying form — fields are deliberate gates that prevent low-quality leads from booking:
    - Name + email + phone
    - Company name + URL
    - Current monthly ad spend (dropdown: <$10K / $10K-$50K / $50K-$200K / $200K-$500K / $500K-$2M / $2M+)
    - Primary platforms (multi-select: Meta / Google / TikTok / etc.)
    - Current monthly revenue (dropdown ranges)
    - "What's the biggest growth challenge you're facing right now?" (textarea — pre-qualifies)
    - "Have you worked with a performance marketing agency before?" (Yes/No)
  - Submit button: red-orange, full-width, "REQUEST AUDIT." On submit: routes to Calendly for the kickoff call.

### Page 4 — Resources / Blog (CMS Educational Content)

- **Hero:** "RESOURCES." Tagline: "Tactical playbooks for DTC growth."

- **Categories Filter:** Meta Ads / Google Ads / TikTok / Email/SMS / Creative / Strategy / Analytics.

- **Index Layout:** Magazine-style. Featured article gets a 2-column hero with image left, big-display headline + dek right. Subsequent articles in a 3-column grid with image, category tag, headline, dek, author/date.

- **Article Page:** 720px max content width. Hero: dateline + category, big-display H1 (44px), italic dek, byline with author photo + role. Body in 18px sans-serif, 1.65 line-height. Drop-cap on first paragraph (red-orange). Inline screenshots of platforms, charts, and dashboards. Pull-quotes (red-orange, big italic display). Code snippets where applicable (for tracking implementations). Bullet lists, numbered lists, tables. End-of-article: a "Want help implementing this?" CTA + 3 related articles.

- **CMS Collection "Resources":** Title, Slug, Hero Image (often a chart or screenshot), Category, Author (reference to Team), Publish Date, Tags, Rich Text Body, Reading Time.

### Page 5 — About / Team (Trust Block)

- **Hero:** "ABOUT KINETIC."

- **Section: Origin Story.** 5 paragraphs. The founders' background, why they started the agency, what they were frustrated with at previous roles. Voice: direct, founder-led, slightly opinionated.

- **Section: Numbers.** Big stats grid: years operating, total ad spend managed, brands served, average client ROAS, average tenure of clients.

- **Section: Team.** Full team grid (12-30 people depending on agency size). Each card: candid photo, name, role, 1-paragraph bio. Filterable by department.

- **Section: Culture / Values.** 4-paragraph essay on how the agency operates internally. Voice: honest, slightly unconventional. Topics: how account teams are structured, weekly/monthly cadences, internal training, specific commitments to clients.

- **Section: Press & Recognition.** Logos of industry recognition (Inc 5000, Adweek, etc.) and links to press features.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Big Number Counter Animation (Scroll-Tied):**
- Element: Massive result numbers in case study tiles and homepage stats.
- Trigger: Scroll into view, 30% from bottom.
- Action: Custom JS animates the number from 0 to its target value over 1500ms with `cubic-bezier(0.16, 1, 0.3, 1)` easing. Numbers count up like a slot machine landing — pure conversion psychology.

**Trigger 2 — Brutalist Hover (All Cards):**
- Hover: Card translates `(-4px, -4px)`, hard-edged solid-color box-shadow appears at offset `(8px, 8px)` (color matches the section's accent — red-orange or green). Snap fast (150ms ease-out). Mouse leave: snap back instantly (50ms).

**Trigger 3 — ROAS Calculator Live Updates:**
- Custom JS reads input field changes via `oninput` event. On every keystroke: recalculates output values, animates the displayed numbers from current to new value over 200ms (interpolated). Every change shows immediate impact — visceral conversion driver.

**Trigger 4 — Display Type Color Cycle (Hero Headlines):**
- Element: Specific words in the homepage H1 ("$1" and "$4.20" — the dollar figures).
- Pure CSS animation: `color` cycles between black → red-orange → green → black over 6 seconds, infinite. Subtle but draws attention to the result claim.

**Trigger 5 — Case Study Tile Stagger Reveal (Scroll-Tied):**
- Element: Result tiles in the Featured Results section.
- Trigger: Scroll into view.
- Initial state: `opacity: 0`, `translateY: 32px`.
- Action: Animate to `opacity: 1`, `translateY: 0` over 600ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Stagger by 100ms per tile.

**Trigger 6 — Form Field Validation (Live):**
- On blur with valid content: field bottom-border becomes green (success). On blur with invalid: red-orange border + small error message below in 12px text. Pure CSS + minimal JS for validation states.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with kinetic namespace `kn-`. Examples: `kn-hero_big`, `kn-result_tile`, `kn-calc_input`, `kn-cta_band`. Utilities: `u-display-heavy`, `u-tabular-nums`, `u-text-orange`, `u-text-success`, `u-border-thick`. Globals: `g-section_lg` (120px), `g-section_md` (80px), `g-container` (1280px).
- **Border System:** Borders are 2px solid black (or accent color on hover). NO hairlines. NO rounded corners larger than 0px. The brutal aesthetic depends on these hard edges.
- **Big-Number Discipline:** Display numbers (ROAS results, revenue figures, percentages) MUST use heavy display weight (700+) and tabular-nums. Apply `u-display-heavy` and `u-tabular-nums` together. Numbers should fill their containers — sizes between 60–120px depending on context.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At 991px: 4-column grids → 2-column. At 767px: 3-column → 2-column. At 478px: all single-column. Hero headline scales fluidly via clamp(); never size manually per breakpoint.

**How to Edit Content & CMS:**

- **Adding a Case Study:** CMS → Case Studies → New. CRITICAL: client name attribution requires explicit written client permission (template includes a sample release form in /docs). Headline Result is the most important field — make it specific and shocking ("+340%" not "Significant growth"). Time Period and Spend Range provide necessary context.
- **Result Charts:** Charts in case studies are typically screenshots from analytics tools (Triple Whale, Northbeam, Meta Ads Manager). Crop tightly, anonymize sensitive data, but keep dates and numbers visible. Save as PNG at 2400px wide for retina sharpness.
- **Updating the Calculator:** ROAS calculator JS is in Project Settings → Custom Code. Variables clearly commented at the top — adjust formulas to match the agency's typical client improvement patterns.
- **Posting Resources/Blog Articles:** CMS → Resources → New. Voice: tactical, specific, action-oriented. Acceptable formats: tactical playbooks, platform deep-dives, case study summaries, growth frameworks. NOT acceptable: generic "5 tips" listicles or thought-leadership pieces. The blog's value is its tactical specificity.
- **Team Photos:** Use candid, energetic photography — team members at work, at conferences, in content shoots. NOT corporate headshots. Color, well-lit, dynamic. The team page humanizes the agency for DTC founders comparing options.
- **Press Logos & Recognition:** Stored in CMS collection "Press." Logos in monochrome SVG; the recognition page applies a saturation filter on hover to reveal full color.
- **Critical Compliance:** Many case studies include client revenue/ROAS data. Confirm with each client before publishing — even with permission, anonymize sensitive identifiers if requested. Some industries (supplements, finance, health) have additional disclosure requirements; coordinate with the agency's legal counsel.
