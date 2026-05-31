# Template 11: FORGE QUANT

**Niche/Target Market:** Quantitative trading firms and systematic hedge funds in the $200M–$5B AUM range. Specifically funds that recruit PhD-level quants, electronic-trading specialists, and infrastructure engineers. Tier of Two Sigma, Jane Street, Hudson River Trading, Citadel Securities (the systematic side), DRW. The website serves three audiences: (1) elite engineering/quant talent (the recruiting funnel — single most important audience), (2) institutional LPs evaluating the firm for allocation, and (3) counterparties/exchanges/regulators establishing the firm's institutional bona fides.

**Core Value Proposition & Aesthetics:**

The thesis: quantitative trading firms occupy a unique aesthetic register — they recruit the same people as Google DeepMind and Bell Labs (so they need to look intellectually serious), they handle institutional capital (so they need regulatory credibility), but they emphatically reject the "Wall Street" register (no marble, no skylines, no power suits). The aesthetic threading these: a Bell Labs / MIT CSAIL register — academic-credible, technically precise, deliberately understated. Functional aesthetic: this is what a website built by people who care about latency *to the picosecond* looks like.

**Design System:**
- **Typography:** **JetBrains Mono** as the primary typeface across most surfaces — yes, monospace for body and headlines. **GT America** as a single sans-serif fallback for long-form content where mono would impair reading. Sizes: H1 mono 48px, body monospace 15px (slightly smaller than typical to compensate for monospace width), generous 1.7 line-height. Tabular figures everywhere. Italics for variable names in research notes (per academic mathematical convention — *x*, *μ*, *σ*).
- **Color Theory:** Off-white technical surface `#FAFAF8` (warm but not cream — academic paper). Body text in `#0A0A0A`. Muted grayscale ramp for surface depth: `#F0F0EC`, `#E5E5E0`, `#999996`, `#555550`. Single accent: muted slate-blue `#36495C` — used for links and the primary CTA. NO bright accents. NO greens (those signal financial-success cliché). Charts use grayscale + slate-blue only.
- **Visual Language:** Academic technical paper aesthetic. Equations rendered with proper mathematical typesetting (KaTeX or MathJax integration). Charts are functional, not decorative — small multiples, time-series line plots, distribution histograms. Photography minimal: only the firm's office building exterior (architectural, B&W) and team photographs (B&W formal portraits). NO traffic-floor imagery, NO trader-screens stock photography. Diagrams use grayscale technical drawings — block diagrams of the firm's infrastructure, simplified flow diagrams of data pipelines.
- **Why $10K+:** Top quant firms invest $80K–$150K in custom websites — Two Sigma's, Jane Street's, Hudson River's. The challenge is achieving the *intellectual register* of CSAIL or DeepMind without the "tech corporate" cliché AND without the Wall Street cliché. This template provides the rare middle ground: research-paper aesthetic, working LaTeX/KaTeX integration, real research papers CMS, and a careers architecture optimized for high-IQ technical recruiting.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Research Front)

- **Hero (60vh, mono-driven, restrained):**
  - Centered single-column, max-width 960px. Top: small mono uppercase eyebrow ("FORGE QUANTITATIVE — EST. 2011"). Below: H1 in mono (`clamp(2.5rem, 5vw, 3.5rem)`): "We trade systematic strategies / across global markets." (Two-line break is intentional.) Below: 2-paragraph dek explaining the firm's approach in plain technical language. Two text links: "Our research →" and "Open positions →" — both slate-blue, mono uppercase, hairline underline.
  - No buttons. No CTAs in the traditional sense. The clean restraint is the signal.

- **Section: Markets We Trade (data-dense reference):**
  - Heading "MARKETS." Below: a 3-column grid of asset classes: Equities / Futures / FX / Fixed Income / Options / Crypto. Each cell: asset class name (mono, 18px), 1-line description, list of specific markets traded ("US large-cap, EU futures, Asian indices"), volume signal in tabular nums ("~$8B daily notional"). Hairline 1px borders.

- **Section: Research Output (the credibility section):**
  - Heading "RESEARCH" + small mono "PEER-REVIEWED & WORKING PAPERS." Below: a stacked list of 6 most recent papers/preprints. Each row: Year | Authors (mono, with firm authors bolded) | Paper title (slate-blue, links to PDF or arXiv) | Venue ("NeurIPS 2025" / "QF Journal" / "arXiv preprint"). Hairline dividers. Reads like an academic CV publications section.

- **Section: Infrastructure (technical signal):**
  - Heading "INFRASTRUCTURE." 3-paragraph essay describing the firm's technical infrastructure choices in genuine detail: programming languages used (`Python for research, C++/Rust for production trading systems`), core technical decisions (`co-located in 8 exchange data centers, FPGA acceleration on critical paths`), team composition (`50% engineers, 35% quants, 15% trading & operations`). This level of specificity is what attracts the technical talent the firm wants to recruit.
  - Below: a small block diagram (SVG, grayscale + slate-blue accents) showing the firm's data pipeline architecture: Market Data → Signal Generation → Risk Engine → Order Management → Exchange Connectivity. Each node labeled in mono.

- **Section: Open Positions Preview:**
  - Heading "POSITIONS WE'RE HIRING FOR." Below: a stacked list of 5 currently open roles. Each: Role title (mono, 18px, slate-blue), team ("Research" / "Engineering" / "Trading"), location ("New York" / "Singapore" / "London"), 1-line summary. Click → role detail page. Below the list: "View all positions →" link.

- **Section: A Note on the Firm.**
  - 720px max-width centered. 4-paragraph essay on the firm's culture. Voice: direct, slightly understated. Topics: how the firm staffs, how research is shared internally, the emphasis on individual contribution AND collaborative research, the lack of internal politics/hierarchy. Reads like a Y Combinator essay rather than a corporate "About Us." Signals to potential recruits exactly what working here is like.

- **Footer:**
  - 4 columns: Firm (Research, Markets, Infrastructure, About) | Careers (Open positions, Internships, How we hire, Compensation philosophy) | Resources (Publications, Engineering blog, Quant blog) | Contact (Office locations, Press, Compliance). Bottom: copyright + a small "Forge Quant LLC is registered with the SEC and FINRA. CRD #XXXXXX. Member SIPC." — institutional credibility marker.

### Page 2 — Research (Publications + Working Papers)

- **Hero:** "RESEARCH." 1-line dek about the firm's commitment to peer-reviewed research output and open publication.

- **Filtering:** Top of page — Year, Topic (Market Microstructure / Statistical Arbitrage / Reinforcement Learning / Volatility Modeling / etc.), Authors (multi-select from firm researchers).

- **Index Layout:** Stacked list, 1080px max-width, single column. Each entry:
  - Year (left, mono, 80px column, larger font)
  - Right side: Title (mono, 22px, links to detail or external URL), Authors line (mono — firm authors bolded), Venue (italic mono with year/volume/issue), Abstract (expandable accordion — click to reveal full abstract).
  - Below: PDF link, Cite (BibTeX copy), arXiv ID if applicable.
  - Hairline divider between entries.

- **CMS Collection "Research Papers":** Title, Authors (rich text — supports bolding firm authors), Venue, Year, Abstract (long text), PDF File, arXiv ID, External URL, Topics (multi-reference), Featured (boolean). Auto-generates BibTeX from these fields via custom code.

### Page 3 — Engineering Blog (CMS Long-Form, Technical)

- **Hero:** "ENGINEERING BLOG." Tagline: "Notes from our engineering and research teams."

- **Index Layout:** Single column, 1080px max-width. Featured article (most recent or pinned) gets a 2-column hero: image left (small architecture diagram or chart), title/author/dek right. Subsequent articles in a stacked list with small thumbnail left, title/author/dek right. Date in mono uppercase.

- **Article Page:** 720px max-width, single column. Hero: dateline mono uppercase, mono H1 (32px), italic dek, byline with author name (linked) + small B&W headshot. Body in 16px monospace, 1.7 line-height. Drop-cap on first paragraph (mono, 4-line tall). Code blocks with syntax highlighting (Prism.js). Inline equations via KaTeX (both inline `$x = \mu + \sigma \epsilon$` and display mode for larger equations). Charts inline (SVG line plots, scatter plots, histograms). Footnotes via superscript with full citations at article end.

- **CMS Collection "Engineering Blog":** Title, Slug, Hero Image (often a chart or diagram), Author (reference to Team), Publish Date, Topics (Research / Engineering / Operations / Trading), Rich Text Body (with code block, equation, and chart embeds), Reading Time, Featured (boolean).

### Page 4 — Careers (PhD-Level Recruiting)

- **Hero:** "We hire researchers, engineers, and traders." Single dek paragraph: "We don't separate research from engineering. We don't separate engineering from trading. The strongest people on our team move fluidly across all three."

- **Section: Open Positions (CMS-driven):**
  - Filter chips: Team (Research / Engineering / Trading / Operations), Location, Seniority (PhD / Senior / Staff / Intern).
  - Stacked list. Each role: Title (mono, 22px, slate-blue link), Team + Location + Seniority pills, 1-paragraph summary, "View role →" link.

- **Role Detail Page (CMS):**
  - **Hero:** Role title, dateline ("Posted October 2026"), team + location + seniority indicators.
  - **Section: About the team.** 3 paragraphs describing the specific team this role joins, the research/engineering it does, recent papers or internal projects.
  - **Section: What you'll do.** Bullet list of responsibilities, written specifically not generically.
  - **Section: What we're looking for.** Bullet list of qualifications. Honest — both required and nice-to-have, with a clear bias toward research/engineering excellence over years-of-experience metrics.
  - **Section: Compensation & benefits.** RARE TRANSPARENCY for finance: state actual compensation ranges. (`Base salary $250K–$450K. Performance bonus typically 1–3x base. Equity in firm. Full benefits.`) — this transparency is the most powerful recruiting tool in tech finance because most peers are opaque.
  - **Section: How we hire.** 4-step process: Application → Take-home technical exercise (research problem) → Onsite (multiple research/engineering interviews) → Offer. Emphasize: no whiteboard algorithm puzzles, focus on real research problems.
  - **Application:** "Apply via [Greenhouse/Lever] →" external link.

- **CMS Collection "Open Positions":** Title, Slug, Team, Location, Seniority, Posted Date, About Team (rich text), Responsibilities (rich text), Qualifications (rich text), Compensation Notes (text — including the transparency on ranges), Application URL, Hiring Manager (reference to Team).

- **Section: Internships & PhD Programs.**
  - Heading "INTERNSHIPS." 2-paragraph description of the summer research internship program for PhD students. Application timeline (apply by January, decisions by March, summer June–September). Mentions specific universities the firm has historically recruited from (Princeton, MIT, Stanford, CMU, Berkeley, Toronto, ETH Zurich, Oxford, Cambridge).

- **Section: How We Compensate.**
  - 5-paragraph essay on the firm's compensation philosophy: base + bonus structure, equity participation, no commissions on individual P&L (firm-wide profit sharing), transparency about pay bands. This explicit philosophy is itself a recruiting signal.

### Page 5 — About (Firm History + Culture + Compliance)

- **Hero:** "ABOUT FORGE."

- **Section: History.** 6-paragraph essay on the firm's founding, growth trajectory, current state, and trajectory. Specific dates and names of founders (linked to their team profiles).

- **Section: People.** 4-column grid of firm leaders. Same B&W formal portrait treatment as Vantage Capital. Name, title, brief bio, education (Princeton PhD '06 / MIT BS '03 format).

- **Section: Office Locations.** 3-column block. Each office: name (city), street address, headcount approximate ("~85 people"), small B&W exterior photograph.

- **Section: Investor Inquiries.** 2-paragraph statement on the firm's LP composition (typically institutional only — pensions, endowments, sovereign wealth) and how to make inquiries (`ir@` email). No "Become an investor" CTA — top quant funds are typically capacity-constrained.

- **Section: Press & Media.** Direct contact for press (`press@`). List of recent press features (links).

- **Section: Compliance & Regulatory.** Standard institutional disclosures: SEC registered, CRD number, NFA member if applicable, Form ADV filing link, important risk disclosures, and contact for compliance officer.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Equation Rendering (Page Load):**
- Element: All inline and display math expressions in research articles.
- Trigger: After page load.
- Action: Custom JS loads KaTeX (or MathJax) and re-renders all `<span class="math-inline">$...$</span>` and `<div class="math-display">$$...$$</div>` blocks. Render is fast (KaTeX is faster than MathJax — preferred). Replaces the source LaTeX with proper typeset math.

**Trigger 2 — Code Block Syntax Highlighting (Page Load):**
- Element: All code blocks in articles.
- Trigger: After page load.
- Action: Custom JS loads Prism.js and applies syntax highlighting. Languages auto-detected from class names (`language-python`, `language-cpp`, `language-rust`). Color scheme: very subdued — dark slate keywords, regular weight everything (no bold), grayscale strings, slightly tinted comments.

**Trigger 3 — Citation Hover Tooltip:**
- Element: Inline superscript footnote markers.
- Hover (200ms ease-out): Tooltip appears above showing abbreviated citation. 1px slate border, no rounded corners, off-white background.

**Trigger 4 — Chart Animate-In (Scroll-Tied):**
- Element: Inline SVG charts in articles.
- Trigger: Scroll into view, 30% from bottom.
- Action: Chart axis lines draw in first (200ms), then data lines via `stroke-dasharray` animation (1000ms with stagger if multiple series). Data point markers fade in last (300ms).

**Trigger 5 — Restraint as a System (Critical):**
- No card-tilt animations. No marquee animations. No parallax. No hover state transformations beyond basic underline thickening. The entire visual register depends on visual quietness — animations are interpretation, and quant firms want to be the protocol, not the show.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with quant namespace `q-`. Examples: `q-research_row`, `q-equation_inline`, `q-position_card`, `q-chart_inline`. Utilities: `u-mono`, `u-mono-uppercase`, `u-tabular-nums`, `u-text-slate`, `u-italic-variable`. Globals: `g-section_lg` (140px), `g-section_md` (96px), `g-container_paper` (1080px), `g-container_text` (720px).
- **Mathematical Typesetting:** KaTeX/MathJax integration is via the page's custom code section. Inline math: `<span class="math-inline">$\mu + \sigma\epsilon$</span>`. Display math: `<div class="math-display">$$L = \sum_i \log(p_i)$$</div>`. The auto-renderer processes both at page load.
- **Code Blocks:** Use Webflow's rich-text "Code Block" formatter. Specify language via inline script that adds `class="language-python"` to the `<pre>` element after rich text renders. Languages supported by Prism.js: Python, C++, Rust, JavaScript, TypeScript, Go, R, Julia, Haskell, OCaml, Scala.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At 991px, 3-column market grids collapse to 2-column. At 767px, all multi-column layouts collapse. Critical: equations remain readable at all sizes — KaTeX handles responsive math automatically.

**How to Edit Content & CMS:**

- **Adding a Research Paper:** CMS → Research Papers → New. Authors: rich text with **firm authors bolded** via the bold formatter. Venue: italic mono — "*JFE*, vol. 152, 2024" / "*NeurIPS 2025*" / "*arXiv:2410.12345*." Abstract: paste verbatim from the paper — never paraphrase. PDF File: upload the camera-ready PDF or use the published URL via the External URL field. Topics: select from the Topics CMS collection.
- **Posting an Engineering Blog Article:** CMS → Engineering Blog → New. Voice: technical, specific, voice-of-the-author. Acceptable topics: novel approaches the firm has used in trading systems, infrastructure case studies, research summaries, quant methodology pieces. NOT acceptable: marketing-themed content, "10 things every quant should know" listicles. The blog's value is its technical specificity.
- **Posting an Open Position:** CMS → Open Positions → New. Critical: write the role description with technical specificity. Include actual technical requirements (specific languages, libraries, areas of mathematical expertise). Compensation Notes: state actual base salary range AND describe bonus structure honestly. This transparency is a hiring superpower for technical roles.
- **KaTeX/MathJax Configuration:** Default config in Project Settings → Custom Code Head. Use KaTeX for performance. The math-renderer script runs on `DOMContentLoaded` AND on `webflow.ready` (for CMS template pages that re-render). To customize math styling: edit the KaTeX CSS overrides in the same custom code block.
- **Compliance Updates:** Compliance disclosures are stored in a CMS Singleton "Compliance Settings" — SEC registration status, CRD numbers, important risk disclosures, contact for compliance officer. Coordinate with the firm's General Counsel or Compliance Officer before any edits to this content.
