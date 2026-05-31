# Template 14: SYNTH RESEARCH

**Niche/Target Market:** AI research labs and computational research nonprofits — both for-profit research labs (Anthropic, OpenAI's research surface, DeepMind, Adept, Conjecture) and academic-adjacent nonprofits (FAR AI, Redwood Research, MIRI, ARC, the Cooperative AI Foundation). Audience: AI researchers and PhD students considering joining the lab, the research community evaluating papers and citing work, and funders/donors (foundations, philanthropists, sometimes corporate research labs allocating capital to outside research). The site is the lab's *intellectual front* — its papers, agenda, and people.

**Core Value Proposition & Aesthetics:**

The thesis: an AI research lab's website is its *technical reputation, distilled*. Researchers evaluating where to work read papers and assess the lab's research agenda. Funders evaluating where to allocate read the lab's research vision and outputs. The aesthetic must be unmistakably *research-academic* — closer to MIT CSAIL or Berkeley AIR than to a tech startup. Information density is a feature; whitespace is a luxury given to the most important content. The site is a working academic publication, not a marketing site.

**Design System:**
- **Typography:** Academic publication pairing. **Computer Modern** (or **Latin Modern**) — yes, the LaTeX default — for body text and editorial content. Available as a webfont via `cm-unicode` or as a custom-loaded local font. **Iosevka** or **JetBrains Mono** for code, equations (when not rendered via KaTeX), and metadata. **Inter** as a single sans-serif for navigation and UI elements only — never for content. The use of CM signals immediately to AI researchers that the lab takes academic publication conventions seriously.
- **Color Theory:** Pure white surface `#FFFFFF`. Body text in `#1A1A1A`. Single accent: ink blue `#0042AC` — used for links and figure callouts (the standard color for hyperlinks in academic PDFs). Secondary subtle accent: warm grey `#666666` for caption text and metadata. NO bright colors. Charts grayscale + ink blue. Code highlighting uses a subdued palette (greens for keywords, blues for strings, browns for comments).
- **Visual Language:** Academic paper. Numbered sections, numbered figures with formal captions, numbered theorems if applicable, BibTeX-formatted citations. Equations rendered via KaTeX/MathJax. Diagrams in the style of NeurIPS/ICLR papers — clean SVG, monochrome with selective accent. NO hero photography on most pages. NO decorative illustrations. NO icons used decoratively. The single most important visual element on most pages is a *figure from a paper* — chosen, captioned, and credited correctly.
- **Why $10K+:** Top AI research labs invest $30K–$80K in custom websites because the website serves recruiting (#1 priority), donor/funder credibility, and research community reputation simultaneously. The challenge is achieving genuine academic register — most attempts default to generic tech-startup or non-profit aesthetics, both of which signal to PhD-level recruits that the lab is "marketing-heavy, research-light." This template provides the rare academic-paper aesthetic with real publications CMS, research agenda architecture, and funder/donor pages calibrated for institutional philanthropy.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Research Front)

- **Hero (60vh, restrained academic):**
  - Centered, max-width 800px (academic paper width). Top: small ink-blue tracked-uppercase eyebrow ("AI SAFETY RESEARCH — EST. 2021 — BERKELEY"). Below: H1 in Computer Modern serif (`clamp(2rem, 4.5vw, 3rem)`), regular weight: "Synth Research investigates the alignment of advanced AI systems with human intentions." Single sentence. Below: 2-paragraph dek expanding the lab's research mission. Two text links (no buttons): "Recent papers →" and "Open positions →" — both ink blue, hairline underline.
  - No buttons. The serious research register doesn't have CTAs.

- **Section: Research Agenda (the intellectual core):**
  - Heading "RESEARCH AGENDA" in tracked uppercase. Below: 3-paragraph essay describing the lab's research focus. Voice: precise, technical, slightly opinionated (a research agenda IS a position). References specific research areas (interpretability, RLHF, scalable oversight, mechanistic understanding, etc.) with proper academic terminology. Drop-cap on first paragraph (Computer Modern, ink blue, 4-line tall).

- **Section: Recent Publications (the credibility section):**
  - Heading "RECENT PUBLICATIONS" tracked uppercase. Below: a stacked list of 6 most recent papers. Each row in academic citation format:
    - Author list (firm authors bolded, italicized authors-of-record convention)
    - Title (Computer Modern serif, 18px, links to PDF or arXiv)
    - Venue ("*NeurIPS 2025*" / "*arXiv preprint 2410.12345*" / "*ICLR 2025 Workshop on AI Safety*")
    - Below: "PDF" / "arXiv" / "Cite (BibTeX)" / "Code" links — the typical academic paper-page footer
  - Hairline divider between entries. Reads exactly like an academic CV publications list.

- **Section: Featured Figure (signature diagram):**
  - Heading "FIGURE 1 | RESEARCH AREAS." Below: a full-width diagram (SVG) showing the lab's research area connections — drawn in the literal style of a NeurIPS introduction figure. Clean lines, monochrome with selective ink blue, formal labels, arrows showing dependencies between research areas. Below the figure: a Computer Modern italic caption explaining the diagram with proper figure-citation language.

- **Section: People (the recruiting hook):**
  - Heading "RESEARCHERS." Below: a 4-column grid of researcher cards. Each card: a small black-and-white headshot (3:4 aspect, formal but warm), name (Computer Modern serif, 18px, ink blue link to detail page), affiliation status ("Research Scientist" / "PhD Student" / "Visiting Researcher" / "Research Affiliate"), and a single line of focus areas in italic Computer Modern ("Mechanistic interpretability, transformer circuits, eval design").
  - **CMS Collection "Researchers":** Name, Slug, Headshot (B&W, 3:4), Title, Joined Date, Bio (rich text), Education (text), Areas of Focus (multi-reference), Selected Papers (multi-reference to Publications), Personal Website URL, Twitter/X URL, Display Order, Tier (Senior Researcher / Research Scientist / PhD Student / Visiting / Affiliate).

- **Section: Open Positions:**
  - Heading "OPEN POSITIONS" tracked uppercase. Below: a stacked list of 4–6 currently open roles. Each: role title (ink blue link), team, location, 1-line summary. Click → role detail page. Roles are typically: Research Engineer / Research Scientist / Research Manager / Research Internship / PhD Visiting Researcher.

- **Section: Funders & Affiliations:**
  - Heading "SUPPORTERS & AFFILIATIONS" tracked uppercase. Below: a row of 6–10 monochrome logos representing major funders, institutional affiliations, and partner organizations (Open Philanthropy, NSF, university partners, foundation supporters). Logos at 60% opacity, full opacity on hover.

- **Section: Newsletter / Subscribe:**
  - Single sentence + email input. "Receive monthly research updates from Synth." Inline form — email field + "Subscribe" button. Single-column, small, restrained.

- **Footer:**
  - 4 columns: Research (Agenda, Publications, Talks, Code repositories) | People (Researchers, Open positions, Internships, Visiting program) | Resources (Publications, Blog, FAQ, Press kit) | Contact (Email, Office, Mailing list, Newsletter). Bottom: copyright + a small "Synth Research is a [501(c)(3) registered nonprofit / private research lab]" — with appropriate tax-exempt disclosure if applicable.

### Page 2 — Publications (Full Index)

- **Hero:** "PUBLICATIONS" tracked uppercase. 1-line dek about the lab's commitment to peer-reviewed research output and open dissemination.

- **Filtering:** Year, Topic (Interpretability / Alignment / Eval / RLHF / Scalable Oversight / etc.), Authors. Real-time filter via Finsweet CMS Filter.

- **Index Layout:** Single column, 1080px max-width. Publications grouped by year — each year is a section with a tracked-uppercase year header. Within each year, papers in academic-citation format:
  - Author list (firm authors bolded)
  - Title (Computer Modern, 18px, link)
  - Venue + year + volume/issue/pages or arXiv ID
  - Abstract (expandable accordion — click to reveal)
  - Below abstract: PDF / arXiv / Code / Cite (BibTeX) / Project page links
  - Hairline divider between entries

- **CMS Collection "Publications":** Title, Authors (rich text — supports bolding), Venue, Year, Volume, Issue, Pages, arXiv ID, DOI, Abstract (long text), PDF File, Code Repository URL, Project Page URL, Topics (multi-reference), Featured (boolean). BibTeX auto-generated via custom JS.

### Page 3 — Research Agenda (Deep Dive)

- **Hero:** "RESEARCH AGENDA" tracked uppercase. 1-paragraph dek introducing the agenda's structure.

- **Section: Per Research Area (CMS-driven, deep):**
  - For each research area:
    - Area name (H2 Computer Modern, 28px), tracked uppercase eyebrow ("AREA 01"), 1-paragraph dek
    - 4–6 paragraph essay describing the research area in technical depth — what questions are being asked, what approaches are being explored, why this area matters for the lab's overall mission
    - A figure (when available) — SVG diagram or paper figure relevant to this area, with proper Computer Modern italic caption
    - "Selected publications" block — a list of 3–5 papers from this area, in citation format, links to PDFs
    - Hairline divider before the next area
  - **CMS Collection "Research Areas":** Name, Slug, Sequence Number, Description (rich text), Featured Figure (image), Figure Caption (rich text), Selected Publications (multi-reference), Featured Researchers (multi-reference), Display Order.

### Page 4 — Careers / Join Us (Researcher Recruitment)

- **Hero:** "JOIN US." 1-paragraph dek about the lab's hiring philosophy and the kinds of researchers who thrive there.

- **Section: How We Hire.** 3-paragraph essay describing the lab's hiring process — typically: written work submitted, technical conversation about research interests, multi-day visit/interview, offer. Emphasis on assessing research taste and depth, not coding interview puzzles.

- **Section: Open Positions.**
  - Filtered list (Team, Seniority, Location).
  - Each role: title, team, seniority, location, 1-paragraph summary, "View role →".

- **Role Detail Page (CMS):**
  - **Hero:** Role title, dateline, team + seniority + location indicators.
  - **Section: About the role.** 4 paragraphs describing the role's research focus, team it joins, and recent work the team has produced.
  - **Section: What you'll work on.** Bullet list of likely research questions and projects.
  - **Section: What we're looking for.** Required and nice-to-have qualifications, written specifically (e.g., "PhD or equivalent research experience in ML, mechanistic interpretability, or related field" — not generic).
  - **Section: Compensation & support.** Honest compensation range, research support (compute, conference budget, sabbatical norms), and lab culture details.
  - **Section: How to apply.** Specific application instructions (often: email a research statement + recent papers + references to a specific email address; sometimes via Greenhouse/Lever).

- **CMS Collection "Open Positions":** Title, Slug, Team, Seniority (option set), Location, Posted Date, About Role (rich text), Research Questions (rich text), Qualifications (rich text), Compensation (text), Application Instructions (rich text).

- **Section: Visiting Researcher Program.**
  - 3-paragraph description of the lab's visiting program for established researchers (typical 3-12 month visits with specific funding, compute, and collaboration norms).

- **Section: PhD Internship Program.**
  - 3-paragraph description of summer PhD internships. Application timeline, requirements, mentorship structure.

### Page 5 — Support / Donate (Funder Page)

- **Hero:** "SUPPORT OUR WORK." 1-paragraph dek explaining the lab's funding model (grants, donations, partnerships).

- **Section: Why This Work Matters.**
  - 5-paragraph essay describing the importance of the lab's research focus. References the broader research landscape, why independent research is valuable, what the lab's specific contributions are.

- **Section: How Funding Is Used.**
  - 3-paragraph block describing how donations are deployed (researcher compensation, compute, operations, growth). Includes specific cost figures where appropriate ("A research engineer's annual cost runs ~$250K including compensation, benefits, and compute"). Specificity builds funder trust.

- **Section: Major Donors & Affiliations.**
  - Heading "WITH SUPPORT FROM." A list of major institutional and individual donors who have authorized acknowledgment. Each: name, optional logo, description of contribution. Listed in alphabetical order, NOT by donation size.

- **Section: How to Give.**
  - Three pathways:
    1. **Major gifts** — Donations $100K+. Contact the development director directly. Email link.
    2. **Donor-advised fund / institutional grants** — Information for foundations and DAFs.
    3. **Individual donations** — Online donation form (typically via Stripe/Donorbox embed). Tax receipt automatic.
  - **Embedded form** for individual donations with reasonable amount tiers.

- **Section: Annual Report.**
  - Link to download the lab's annual report PDF. Critical for serious funder credibility — major foundations require an annual report before granting.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — KaTeX Equation Rendering (Page Load):**
- Element: All math expressions in research articles and agenda pages.
- Trigger: After page load.
- Action: Custom JS loads KaTeX and renders inline `$...$` and display `$$...$$` math expressions. Replaces source LaTeX with proper typeset output. Critical for academic register — papers without proper typeset math read as amateur.

**Trigger 2 — Citation Hover Tooltip:**
- Element: Inline citation markers `[1]`, `[2]`, etc.
- Hover (200ms ease-out): Tooltip appears above showing the abbreviated citation. 1px ink-blue border, no rounded corners, white background. Click: scrolls to bibliography entry at article end.

**Trigger 3 — Publication Abstract Accordion:**
- Element: "Abstract" link on each publication entry.
- Click: container expands `height: 0 → auto` over 350ms ease-out. Chevron rotates 180°. Custom JS calculates `scrollHeight` for smooth transitions on dynamic CMS content.

**Trigger 4 — Figure Reveal on Scroll (Restrained):**
- Element: Each diagram/figure in research articles.
- Trigger: Scroll into view.
- Action: Figure fades in `opacity: 0 → 1` over 800ms. NO scale animation, NO transform. Pure fade. Academic restraint.

**Trigger 5 — BibTeX Copy:**
- Element: "Cite" button on each publication.
- Click: Custom JS generates BibTeX from publication fields, copies to clipboard via `navigator.clipboard.writeText()`. Button text changes to "Copied!" for 2 seconds.

**Trigger 6 — Drop-Cap Reveal (Page Load):**
- Element: First-paragraph drop-caps in editorial sections (homepage research agenda, research area pages).
- Trigger: Fonts loaded.
- Action: Drop-cap fades in over 1000ms with `cubic-bezier(0.25, 1, 0.5, 1)`.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with research namespace `r-`. Examples: `r-publication_row`, `r-figure_caption`, `r-equation_inline`, `r-area_section`. Utilities: `u-cm-serif`, `u-mono`, `u-text-ink`, `u-italic-cite`. Globals: `g-section_lg` (140px), `g-section_md` (88px), `g-container_paper` (800px — academic paper width), `g-container_index` (1080px).
- **Computer Modern Setup:** Computer Modern is loaded via `@font-face` with WOFF2 files of `CMU Serif` (the Unicode-extended version of CM). Files in `/fonts/` directory. `font-display: swap` to avoid FOIT. Fallback stack: `'CMU Serif', 'Latin Modern Roman', 'Iowan Old Style', Georgia, serif`. The fallback ensures readable text if CM fails to load.
- **KaTeX Integration:** Loaded via the page's custom code. Inline math: `<span class="math-inline">$\nabla L = \mu$</span>`. Display math: `<div class="math-display">$$L = \sum_i \log p_i$$</div>`. Auto-renderer processes both at page load.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Academic paper width (800px container) maintained at all sizes — text never expands beyond optimal reading width even on wide screens.

**How to Edit Content & CMS:**

- **Adding a Publication:** CMS → Publications → New. Authors: rich text with **firm authors bolded**. Use exact author-list formatting from the published paper. Venue: italic. Abstract: paste verbatim from the paper. Topics: multi-select. PDF: upload the camera-ready or use the published URL. arXiv ID: full identifier (e.g., "2410.12345"). The BibTeX is auto-generated from these fields.
- **Adding a Researcher:** CMS → Researchers → New. Headshot: black-and-white, 3:4 aspect, formal but warm. Bio: 2-paragraph description in third person. Areas of Focus: select from existing or add new. Selected Papers: multi-reference to publications — the researcher's strongest 3–5 papers. Critical: include the researcher's *personal* website URL — academic researchers all maintain personal pages, and linking shows the lab respects researcher individuality.
- **Adding a Research Area:** CMS → Research Areas → New. Sequence Number controls display order. Description: 4–6 paragraphs of substantive technical content. Featured Figure: SVG or PNG diagram with descriptive caption. Selected Publications: multi-reference to relevant papers.
- **Posting an Open Position:** CMS → Open Positions → New. Voice: technical, specific, honest. About Role: describe the actual research focus of the team this role joins, including recent papers/projects. What You'll Work On: actual research questions, not generic responsibilities. Compensation: state actual ranges — academic research labs that don't disclose compensation range ARE the labs that pay below market.
- **Annual Report:** Stored as a CMS Singleton "Annual Reports" — Year, PDF File, Brief Description. Surface on the Support page. Annual reports for funders should include: financial overview (operating budget, sources of funds), research output summary (paper count, citation impact, key findings), researcher hiring updates, and forward agenda.
- **501(c)(3) Compliance:** If the lab is a registered nonprofit, the footer disclaimer must include the EIN and 501(c)(3) status. Donor-facing pages must include language about tax-deductibility per IRS guidelines. Coordinate with the lab's nonprofit accountant before launch.
