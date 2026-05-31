# Template 3: VANTAGE CAPITAL

**Niche/Target Market:** Lower-middle-market private equity firms ($300M–$2B AUM), boutique venture funds (Series B+ specialists), and family-office direct investing arms. Properties that need to communicate institutional credibility to LPs reading the site before a first call, and signal sophistication to founders evaluating term sheets. Specifically *not* retail-facing financial products — this is the visual register of Hellman & Friedman, Hg Capital, Cinven, NEA — funds that will never run a Facebook ad in their lives.

**Core Value Proposition & Aesthetics:**

The thesis: institutional capital websites must convey *quiet confidence*. The aesthetic equivalent of a Loro Piana suit — visible only to those who recognize it. No hero animations. No bento grids. No gradients. The *absence* of contemporary tech-startup design is the signal: we don't need to impress with novelty because our track record does the work.

**Design System:**
- **Typography:** Single typeface family executed with discipline — **Söhne** (or **Inter**) for everything. Headlines in 500 weight, never 700+ (institutional finance uses medium weights; bold = retail). Body in 400, captions in 500 with `letter-spacing: 0.06em` uppercase. Numerals always tabular-nums for data alignment. Heading sizes restrained: H1 maxes at 56px desktop. Generous line-height on body (1.65) for legibility on long-form portfolio descriptions.
- **Color Theory:** Institutional palette executed with restraint. Off-white surface `#FAFAF9` (warm, not stark). Body text in `#1C1C1A` (warm near-black). Single accent: deep navy `#1E3A5F` — reserved for links, the primary CTA, and active-state indicators. Tertiary tone: warm gray `#6B6B68` for metadata. NO secondary accent colors. Charts and data visualizations use shades of the navy + grayscale ramp only.
- **Visual Language:** Editorial, *Wall Street Journal* discipline. Generous left-aligned text. Hairline rules (1px solid `#E5E5E2`) divide content. No drop shadows. No rounded corners larger than 4px (institutions don't trust "friendly" UI). Photography uses corporate portraiture (subjects looking directly at camera, neutral backgrounds, monochrome conversion) and architectural shots of office locations — never stock business imagery.
- **Why $10K+:** PE/VC firms typically commission custom institutional sites at $35K–$80K (think Tuck-Hill, Six Pillars). This template provides the structural and editorial framework that makes a $50K custom build redundant. Includes a real portfolio CMS, secure LP-portal redirect pattern, fund-by-fund vintage data presentation, and an investment-thesis architecture that maps to how diligence-conscious LPs and founders evaluate firms.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Front Door)

- **Hero (60vh, no full-screen drama):**
  - Two-column layout, 50/50. Left: H1 in 500 weight ("We invest in operationally complex businesses across North American industrials and tech-enabled services."). Single sentence — stating the firm's investment thesis in one line is the test of an actual firm. No tagline. No buttons in the hero.
  - Right: A single black-and-white photograph (50% width, full height of the hero) — an architectural detail of the firm's office, a textural shot, never a person. Treated with subtle warm tone (`filter: sepia(0.05) contrast(0.95)`).
  - Below the hero, a thin navy rule (1px) and a small uppercase eyebrow ("AS OF Q3 2026") followed by 4 statistics in a horizontal row, each in tabular-nums:
    - "AUM $1.4B"
    - "47 Portfolio Companies"
    - "23 Years of Capital Deployment"
    - "Vintages 1998–2026"
  - Each stat: small uppercase label (10px, gray), large number (32px, navy, tabular-nums), no animation — institutions don't count up.

- **Section: Investment Approach (3 columns, deeply textual):**
  - Heading "Approach" left-aligned, 32px. Below: 3 columns of body text. Each column has a small navy uppercase pill at top ("Sector," "Stage," "Geography"), then a 4-paragraph essay describing the firm's discipline in that dimension. No icons. No buttons. Just paragraphs with hairline dividers between them.

- **Section: Portfolio (CMS-driven, restrained grid):**
  - Heading "Portfolio." Below: a 4×N grid of portfolio company logos. Each logo: monochrome (black on bone), centered in a 200px square cell, hairline border on the cell. Below each logo: company name in caption-style monospace uppercase + a single descriptor ("HEALTHTECH SAAS" / "INDUSTRIAL DISTRIBUTION"). Hover: cell background fills with `#1C1C1A` for 200ms, logo inverts to bone via `filter: invert(1)`, name and descriptor turn to bone — instant institutional sophistication. Click: routes to the portfolio company detail page.
  - Bottom: small navy "View full portfolio →" link.

- **Section: Recent Activity (5-row data list):**
  - Heading "Recent Activity." Below: a stacked list (not a grid), 5 rows. Each row: date (left, monospace, 100px column) | activity type pill (navy outline, "INVESTMENT" / "EXIT" / "ADD-ON") | company name (link styled, navy underline on hover) | one-line description ("Lead investor in Series C"). Hairline divider between rows. Reads like a Bloomberg terminal in static form.

- **Section: Insights Preview:**
  - Heading "Recent Insights" + small "View all →" link top-right. Below: 3 most recent thought-leadership pieces in a 3-column row. Each: small uppercase category label + dateline, serif-adjacent headline, 2-line dek, byline. Entire card clickable. Hover: headline gets navy underline that draws across.

- **Section: Contact (single line, restrained):**
  - Centered. "For inquiries: [team@vantagecapital.com](#)" + below a smaller line "Operating offices in New York, London, and Singapore." That's the entire CTA. Institutions don't beg for meetings — qualified counterparts know how to reach them.

- **Footer (single row, minimal):**
  - Three columns: Office addresses (one per location, exact street addresses) | Navigation (Approach / Portfolio / Insights / Team / Contact) | Compliance (an SEC-disclosure link, ADV link, accessibility statement). Below: copyright + the firm's CRD number (regulatory marker that signals a real RIA).

### Page 2 — Approach (The Investment Thesis)

- **Hero (40vh):** "Approach" headline. Single dek paragraph (3 sentences) describing the firm's overall philosophy in plain language.

- **Section: Our Sectors (deeply structured CMS):**
  - For each sector the firm targets, a full-width row:
    - Left 60%: Sector name (H2, 500 weight), 5–6 paragraph essay describing why the firm targets this sector, what theses they're acting on, and what kinds of companies they look for. Reads like a McKinsey market overview.
    - Right 40%: A sticky panel containing: a list of relevant portfolio companies (links), a "View Sector Insights →" link, and key sector statistics (deal count, total invested, average vintage).
  - **CMS Collection "Sectors":** Name, Slug, Long Description (rich text, supports H3 subheadings, blockquotes for founder quotes, and inline data callouts), Featured Companies (multi-reference to Portfolio collection), Statistics (separate JSON-like fields).

- **Section: How We Engage (operational philosophy):**
  - Heading "How We Engage." Below: a numbered 4-step list (Discovery → Diligence → Partnership → Realization). Each step: large numeral (left, 80px, navy, light weight), heading + 3-paragraph essay (right). Hairline dividers between steps. Total reads like a McKinsey operating manual.

- **Section: Standards (the legal/ethical signal):**
  - Heading "Standards." 3-paragraph statement on responsible ownership — ESG framework, value-creation discipline, governance principles. Followed by a small list of memberships and signatories (UN PRI, ILPA principles, industry associations). Logos in monochrome.

### Page 3 — Portfolio (CMS Index + Detail)

- **Index Hero:** "Portfolio." Single dek line. Below: filter chips for Sector, Stage, Geography, and Status (Current / Realized). Filters use Finsweet CMS Filter for real-time updates without page reload.

- **Index Layout:** 4-column grid of company cards. Each card: monochrome logo top, hairline border, company name (medium weight, 16px), single-line description, small metadata row (sector pill + acquisition year). Hover: card background tints to `#F5F5F2`, name color shifts to navy. Click → portfolio detail page.

- **Portfolio Company Detail Page (CMS template):**
  - **Hero:** Two-column. Left 60%: Company name (H1), single-sentence positioning, founding year, headquarters. Right 40%: Logo + a 4-row data table (Investment Date, Investment Size [text — "Undisclosed" if not public], Stage, Status). All in tabular-nums.
  - **Section: The Thesis:** 4–5 paragraph essay on why the firm invested. Reads like an internal investment memo (because, for the better firms, that's exactly what's published).
  - **Section: Operating Footprint:** 3-column data block (Employees, Geographies, Customers — text fields).
  - **Section: Related Portfolio Companies:** 3 logos of similar portfolio companies (same sector or thesis), each clickable.
  - **CMS Collection "Portfolio":** Name, Slug, Logo (SVG monochrome), Description (single line), Long Thesis (rich text), Sector (reference), Stage (option set), Geography (option set), Investment Date, Status (Current / Realized), Employees (text), HQ Location (text), Featured (boolean — if true, appears on homepage).

### Page 4 — Insights (Thought Leadership CMS)

- **Hero:** Single line "Insights." A 1-sentence dek about the firm's writing discipline.

- **Index:** Editorial 2-column layout. Featured article (latest, 2-column-spanning hero). Subsequent articles in a single-column stacked list — date | category | headline | byline. Hairline dividers between rows. Pagination at bottom (small navy chevron buttons).

- **Article Page:** 720px max content width. Hero: dateline + category in monospace uppercase, H1 in 500 weight (40px), italic dek. Then byline with author photo (50px circle, monochrome). Body in 18px body text, 1.7 line-height. Pull-quotes: navy left-border, italic, 1.4x size. Citations as superscript footnote markers, full citations in a small monospace block at article end. Below article: 3 related insights.

- **CMS Collection "Insights":** Title, Slug, Author (reference to Team), Publish Date, Category (Sector Outlook / Operating Perspective / Market Letter / Position Paper), Featured Image (16:9 monochrome), Hero Image Alt Text, Rich Text Body, Footnotes/Citations (rich text), Reading Time (auto-calculated via custom code from body length).

### Page 5 — Team & Contact (Trust + Conversion)

- **Hero:** "Team."

- **Section: Partners (CMS-driven, formal):**
  - 3-column grid. Each partner: a black-and-white headshot (4:5 aspect, formal portrait style — subject looking at camera, neutral background), name (H3, 500 weight), title, joined-firm date in monospace ("AT VANTAGE SINCE 2014"), 3-paragraph bio (career, sectors led, board roles), tiny LinkedIn icon (monochrome). Hover on headshot: subtle saturation increase via `filter: saturate(0.2)` (suggests warmth without being unprofessional).
  - **CMS Collection "Team":** Name, Slug, Title, Headshot (4:5 monochrome), Joined Date, Bio (rich text), Sectors Led (multi-reference), LinkedIn URL, Email, Display Order, Tier (Partner / Operating Partner / Principal — controls grid placement).

- **Section: Operating Partners (separate row):** Same card pattern as partners, but smaller (4-column grid, slightly smaller photos). Operating partners are advisors, not investment professionals — distinction matters in PE.

- **Section: Contact (the actual conversion):**
  - 2-column layout. Left: 3 office addresses listed formally (street address, city, ZIP, phone — *not* a contact form). Right: 4 functional email addresses (`team@`, `lps@` for LP relations, `careers@`, `media@`). Each email is a `mailto:` link in navy. No form. Institutions communicate by email — forms feel retail.
  - At the bottom: small "Investor Login →" navy link (LP-only portal redirect).

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Portfolio Logo Inversion (Hover):**
- Element: Each portfolio company logo cell.
- Hover in (200ms ease-out): Cell `background-color: transparent → #1C1C1A`. Inner logo `filter: invert(0) → invert(1)`. Caption text color `#1C1C1A → #FAFAF9`.
- Hover out (300ms ease-in-out): Reverse. The slight asymmetry (faster in, slower out) is the institutional polish detail.

**Trigger 2 — Insights Card Headline Underline (Hover):**
- Element: Headline text in any insights card.
- Hover in (350ms ease-out): An `::after` pseudo-element grows `width: 0 → 100%` from left. Background `#1E3A5F`, height 1px, positioned at `bottom: -2px`.
- Hover out (250ms): `transform-origin: right`, width shrinks `100% → 0`. Same asymmetric direction principle as Atelier Noir.

**Trigger 3 — Stat Row Fade-In (Scroll-Into-View, restrained):**
- Element: The 4-stat row below the hero.
- Trigger: Scroll into view, 50% from bottom.
- Initial state: opacity 0, no transform (no slide-up — institutions don't bounce).
- Action: Opacity 0 → 1 over 600ms, linear easing. No stagger. All 4 stats appear simultaneously. Subdued.

**Trigger 4 — Filter Chip Active State:**
- Element: Filter chips on Portfolio index.
- Click (no hover): Chip background `transparent → #1E3A5F`. Text `#1C1C1A → #FAFAF9`. A small navy dot appears beside the chip text. Click again: deactivates.
- Custom code coordinates with Finsweet CMS Filter — chip state directly drives the filter attribute.

**Trigger 5 — Sticky Section Sidebar (Scroll, no JS):**
- Element: Right 40% sticky panel on Approach > Sectors.
- Implementation: Pure CSS `position: sticky; top: 120px;` on the right column. No interaction needed. The sticky behavior survives Webflow's responsive breakpoints because we set it on the column wrapper.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with institutional namespace `inst-`. Examples: `inst-hero_stats`, `inst-portfolio_card`, `inst-insights_pull-quote`, `inst-divider_hairline`. Utilities: `u-tabular-nums`, `u-uppercase-eyebrow`, `u-text-navy`, `u-bw-image`. Globals: `g-section_lg` (140px), `g-section_md` (96px), `g-container` (1200px max-width).
- **Grid:** Portfolio grid uses CSS Grid via embed: `grid-template-columns: repeat(4, 1fr); gap: 0;` (no gap — hairline borders create the separation, more institutional than gap-based grids). At 991px: `repeat(3, 1fr)`. At 767px: `repeat(2, 1fr)`. At 478px: `1fr`.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Critical: maintain hairline dividers at ALL breakpoints — they're the structural language. Never collapse a section divider at mobile.
- **Tabular Numerals:** All data displays use `font-variant-numeric: tabular-nums` via the `u-tabular-nums` utility. Always apply this to AUM stats, dates, percentages. Without it, numbers visually jitter — instantly cheap-looking.
- **Adding a Sector:** CMS → Sectors → New. Create the sector definition. Then update the homepage hero stats and the Approach > Sectors page automatically pulls the new entry. No manual layout edits required.

**How to Edit Content & CMS:**

- **Adding a Portfolio Company:** CMS → Portfolio → New. Logo MUST be SVG monochrome (black on transparent — the inversion interaction depends on it). Description: 1 sentence describing what the company does (NOT marketing copy — write it like a Bloomberg "Company Overview"). Long Thesis: 4–5 paragraphs reading like an investment memo summary (why we invested, what we believe, how we're partnering). Set Status to Current or Realized — Realized companies move to a separate filter.
- **Writing Insights:** CMS → Insights → New. Critical: Category dictates visual treatment. "Sector Outlook" gets a 16:9 hero image; "Market Letter" gets only a dropcap; "Position Paper" gets a sidebar TOC (auto-generated from H2 headings via Webflow's rich-text rendering). Write headlines like *Wall Street Journal* — declarative, specific, not clickbait. ("Industrial Distribution Margins Compressed 40bps in Q2," not "What's Next for Industrial Distribution?")
- **Updating Stats Block (Homepage):** Hero stats are stored in a CMS Singleton "Firm Stats" with 4 fields: AUM, Portfolio Count, Years of Deployment, Vintage Range. Edit values here; homepage updates automatically. Critical: always update all 4 simultaneously — the visual rhythm of the row depends on consistent data tone.
- **Adding a Team Member:** CMS → Team → New. Headshot must be 4:5 aspect (1200×1500px minimum), monochrome conversion done in pre-production (template ships with a Photoshop action `.atn` file that applies the firm's exact desaturation curve). Tier field controls placement: Partners on the main team grid, Operating Partners in the secondary grid, Principals appear in a third tier (smaller cards, 5-column).
- **Compliance Updates:** Footer compliance links (ADV, SEC disclosure) are edited via the "Footer Settings" CMS Singleton. Critical: any RIA-registered firm MUST keep these links current — broken links here are an actual regulatory finding, not a UX issue.
