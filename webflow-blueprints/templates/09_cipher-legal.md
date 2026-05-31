# Template 9: CIPHER LEGAL

**Niche/Target Market:** Boutique transactional law firms (8–60 attorneys) specializing in M&A, private equity, venture capital, and complex commercial transactions. Specifically the *whitebook* register: Wachtell, Sullivan & Cromwell M&A practice, Cravath, Cleary Gottlieb, Davis Polk. Also boutique alternatives like Latham's Silicon Valley spinouts. Audience is GCs at portfolio companies, PE/VC partners selecting outside counsel for transactions, and CFOs evaluating firms for an upcoming exit. Decisions are referral-driven and reputation-driven; the website confirms the firm's tier rather than initiates the relationship.

**Core Value Proposition & Aesthetics:**

The thesis: elite transactional law firms do not sell on the website — they *confirm* on the website. Visitors arrive having already heard the firm's name from a board member, a partner at another firm, or a banker. The site's job is to remove any doubt about tier. Visual register is the most conservative in the entire 15-template set — institutional, restrained, almost archival.

**Design System:**
- **Typography:** **Times New Roman** (or **Georgia** as a slightly more modern alternative) for everything — headlines, body, captions. Yes — Times. The world's most prestigious transactional firms still use it; it signals continuity with legal publishing tradition. Sizes restrained: H1 maxes at 36px, body at 17px. Italic for case names, statute references, and Latin phrases (per legal citation convention). Tabular-nums for all financial figures.
- **Color Theory:** Cream paper surface `#F4F1E8` (warm, references legal stationery — Strathmore Bristol). Deep ink black `#0A0A0A` for body. Single accent: deep oxblood/burgundy `#5B1A1A` — used only for primary links and the firm's monogram. Secondary accent: gold leaf `#A88837` — used only for partner-name underlines and award/recognition indicators. NO other colors. Charts and tables use grayscale only.
- **Visual Language:** Editorial, archival. Generous use of horizontal rules, hairline borders, and Roman numerals. Photography is exclusively black-and-white formal portraiture (partners) and black-and-white architectural exterior shots of the firm's offices (typically older, prestigious buildings). NO stock photography. NO illustrations. NO icons (icons are tech-startup vocabulary). Drop-caps for editorial sections, two-column text for long-form content. The site reads like a legal periodical — *The American Lawyer* for the homepage, an *AmLaw 100* listing for the bio pages.
- **Why $10K+:** Top transactional firms commission custom sites at $50K–$150K. The Wachtell Lipton site is famously austere; Cravath's redesign in 2022 was reportedly $200K+. The challenge is to look unmistakably *first-tier* without looking dated. This template provides the rare combination: contemporary technical execution underneath a deeply traditional visual register, with a real attorney CMS, transaction/deal CMS, and a publication architecture that maps to how legal recruits and corporate clients evaluate firms.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Calling Card)

- **Hero (60vh, restrained):**
  - Centered single-column layout. Top: a small monogram (the firm's initials in a custom serif treatment, oxblood color, 60px). Below: H1 in Times serif, 36px, regular weight. Direction: "Cipher LLP — Counsel to public and private companies in complex transactions." (The em-dash separator and "LLP" suffix are critical — signals law firm conventions.) Below: 1-paragraph dek (max 3 sentences) describing practice scope. Two text links (no buttons): "Practice areas →" and "Recent transactions →" — both oxblood with hairline underlines.

- **Section: Recent Transactions (the credibility block):**
  - Heading "RECENT TRANSACTIONS" in tracked uppercase. Below: a vertical stack of 6 transaction announcements. Each row layout:
    - Date column (left, 120px wide, tracked uppercase: "OCTOBER 2026")
    - Transaction description (Times serif, 18px): "Represented [Client] in its $1.2B acquisition of [Target Company]."
    - Hairline divider above and below each row
  - Reads exactly like a *Wall Street Journal* deal column. The transactions ARE the marketing.
  - **CMS Collection "Transactions":** Date, Client (text), Counterparty (text — optional), Transaction Description (rich text — the formal language: "Represented X in its acquisition / merger / IPO / restructuring of Y"), Transaction Value (text — supports "Undisclosed" or "$X.XB"), Practice Areas (multi-reference), Featured (boolean — surfaces on homepage).

- **Section: Practice Areas (textual grid):**
  - Heading "PRACTICE AREAS" (tracked uppercase). Below: a 3-column grid where each cell is a textual block. Each column has 5–7 practice areas listed:
    - Column 1: Corporate (Mergers & Acquisitions / Private Equity / Venture Capital / Capital Markets / Securities)
    - Column 2: Commercial (Technology Transactions / Joint Ventures / Strategic Alliances / Licensing / Distribution)
    - Column 3: Specialized (Restructuring / Tax Planning / Cross-Border Transactions / Financial Regulation)
  - Each line is a link in oxblood, plain Times serif, hairline underline on hover.

- **Section: A Statement (firm philosophy):**
  - Centered, 720px max-width. 5-paragraph essay describing the firm's approach to transactional work — what they do, what they don't do, how they staff matters, and how they engage with clients. Reads like a partner's letter in an annual report. Drop-cap on first paragraph (Times Roman, 5-line tall, oxblood color). Italics for emphasis on key principles ("We staff matters /lean and senior./").

- **Section: Selected Recognition:**
  - Heading "RECOGNITION" tracked uppercase. Below: a stacked list of 8 recent recognitions. Each row: year | publication name (italic) | recognition title ("Ranked Tier 1 — M&A: Mid-Market"). Hairline dividers. Sources: Chambers USA, Chambers Global, Legal 500, AmLaw, IFLR1000.

- **Section: Recent Insights:**
  - Heading "INSIGHTS" tracked uppercase. Below: 3 most recent thought leadership pieces in a 3-column row. Each: dateline tracked uppercase, headline in Times serif (regular weight, 22px), 1-line dek, byline (partner name in oxblood). Click → article page.

- **Footer (legal periodical style):**
  - 4 columns: Practice (links to all practice area pages) | Lawyers (link to Lawyers index, partner names list) | Insights (link to all insights, by topic) | Contact (Office addresses — main office street address listed in full, with phone). Bottom: copyright + "ATTORNEY ADVERTISING. PRIOR RESULTS DO NOT GUARANTEE A SIMILAR OUTCOME." (the standard legal disclaimer, in tracked uppercase, smallest type) + state bar disclosures.

### Page 2 — Lawyers (Index + Detail)

- **Index Hero:** "LAWYERS" in tracked uppercase. Below: tiny dropdown filters for Practice Area, Office Location, Title (Partner / Counsel / Associate). Filtering uses Finsweet CMS Filter.

- **Index Layout:** Stacked list, single-column max-width 1200px. Each lawyer: a 3-column row.
  - Column 1 (160px wide): Black-and-white portrait, 4:5 aspect, formal headshot.
  - Column 2 (flex): Name (Times serif, 22px, regular weight, oxblood) — links to detail page. Below: Title in tracked uppercase ("PARTNER" / "COUNSEL" / "ASSOCIATE"). Below: Practice areas in italic Times ("M&A, Private Equity").
  - Column 3 (flex): A 1-line description of the lawyer's focus + recent representative matter (tightly written, factual). Below: small list of contact items (phone, email — both as plain Times text links).
  - Hairline dividers between rows.

- **Lawyer Detail Page (CMS template):**
  - **Hero:** 2-column. Left: black-and-white portrait at large size (max 480px wide). Right: Name in serif (40px, regular weight), Title tracked uppercase, Practice areas italic, contact info (direct phone, email, office address). Tiny LinkedIn link if applicable.
  - **Section: Biography.** Single column 720px max-width. 5–8 paragraphs of biographical content. Reads like a *Best Lawyers in America* profile. Includes: career path, areas of focus, representative matters (with discretion — "Represented a leading aerospace manufacturer in its $4B acquisition of [redacted]"), industry sector experience.
  - **Section: Education.** Tracked uppercase header. Below: list in chronological order (most recent first). Format: "Harvard Law School, J.D., magna cum laude, 2008." "Yale College, B.A., summa cum laude, 2005." Each entry on its own line.
  - **Section: Bar Admissions.** Tracked uppercase header. Below: comma-separated list. "New York; California; District of Columbia."
  - **Section: Recognitions.** Tracked uppercase header. Below: list of recognitions specific to this lawyer (Chambers ranked, Best Lawyers, Super Lawyers, AmLaw industry recognition).
  - **Section: Recent Speaking & Writing.** List of recent talks given and articles published. Each: year | title | venue/publication | external link.
  - **Section: Selected Representative Matters.** A list of 5–8 transaction summaries that best showcase the lawyer's work. Same format as the homepage transactions section.
  - **CMS Collection "Lawyers":** Name, Slug, Title (option set: Partner / Counsel / Senior Associate / Associate), Practice Areas (multi-reference), Office Location, Portrait (B&W, 4:5), Direct Phone, Email, LinkedIn URL, Education (rich text), Bar Admissions (text), Biography (rich text), Recognitions (rich text), Speaking & Writing (rich text), Featured Matters (rich text), Display Order (within tier).

### Page 3 — Practice Areas (Index + Detail)

- **Index Hero:** "PRACTICE AREAS." Single dek line.

- **Index Layout:** A simple stacked list of all practice areas. Each row: practice area name in serif (24px, oxblood, links to detail page), 1-line description, hairline divider. No imagery. Just structured text.

- **Practice Area Detail Page (CMS template):**
  - **Hero:** Practice area name (H1 serif 36px, regular weight). Below: 2-paragraph description.
  - **Section: Approach.** 4-paragraph essay describing how the firm handles work in this practice area — staffing model, typical engagement structure, distinguishing approach.
  - **Section: Representative Transactions.** A filtered subset of the Transactions CMS — only transactions tagged with this practice area. Same row format as homepage.
  - **Section: Lawyers.** A grid of lawyers who practice in this area, with portraits and names. Click → lawyer detail page.
  - **Section: Insights & Publications.** Filtered list of Insights CMS items tagged with this practice area.
  - **CMS Collection "Practice Areas":** Name, Slug, Description (rich text), Approach (rich text), Display Order.

### Page 4 — Insights (Long-Form Legal Publishing)

- **Hero:** "INSIGHTS." 1-line dek about the firm's commitment to client alerts and substantive analysis.

- **Filtering:** Top of page — dropdown filters for Type (Client Alert / Article / White Paper / Webinar Recap / Speaking Engagement), Practice Area, Year. Real-time via Finsweet.

- **Index Layout:** Stacked list. Each entry: Date (left column, tracked uppercase) | Type pill (small, oxblood outline) | Title (serif, 22px, regular weight, oxblood) | byline (italic) | 1-line dek. Hairline dividers between entries.

- **Article Page:** 720px max content width, single column. Hero: tracked uppercase dateline, type indicator, serif H1 (32px), italic dek, byline with author name + portrait (if applicable). Body in Times serif at 17px, 1.7 line-height. Drop-cap on first paragraph. Inline blockquotes for case excerpts. Numbered footnotes via superscript with citations at article end (legal academic norm). Body supports tables (with proper top/bottom rules) for comparing statutory or contractual provisions. End-of-article: a "Related Insights" section with 3 articles by topic.

- **CMS Collection "Insights":** Title, Slug, Type (option set), Practice Areas (multi-reference), Authors (multi-reference to Lawyers), Publish Date, Rich Text Body, Footnotes/Citations (rich text), Reading Time.

### Page 5 — Office & Contact (Restrained)

- **Hero:** "OFFICES."

- **Layout:** A vertical list of office locations. For each office:
  - Office name (e.g., "NEW YORK") in tracked uppercase
  - Below: Black-and-white architectural exterior photograph of the office building (typically the building's facade — the firm typically occupies a prestigious address like 1271 Avenue of the Americas or 250 W 55th)
  - Below image: Full address formatted as a postal address (multi-line, Times serif, 16px), main reception phone, fax (yes — fax is still legal-firm convention), general inquiries email
  - Hairline divider before next office

- **Section: Practice Inquiries.** A small section at the bottom with role-specific email contacts: General matters (`info@`), Press (`press@`), Recruiting (`recruiting@`), Diversity & Inclusion (`diversity@`). Each as a plain `mailto:` link, oxblood, hairline underline on hover.

- **Section: Diversity & Pro Bono Statement.** A 2-paragraph statement on the firm's commitment to diversity, inclusion, and pro bono work. Critical for institutional credibility — most major firms now feature this prominently. Standard language; the template provides editable copy.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Hairline Divider Draw-In (Scroll-Tied):**
- Element: Hairline rules between transaction rows, lawyer rows, insight entries.
- Trigger: "Scroll into view," 30% from bottom.
- Initial state: `width: 0`.
- Action: `width: 0 → 100%` over 800ms with linear easing. Slow draw — fast looks tech-startup, slow looks archival.

**Trigger 2 — Drop-Cap Reveal (Page Load):**
- Element: First-paragraph drop-caps in editorial sections.
- Trigger: Fonts loaded.
- Action: Drop-cap fades in over 1000ms with `cubic-bezier(0.25, 1, 0.5, 1)`. Body text follows 200ms later.

**Trigger 3 — Lawyer Portrait Subtle Saturation (Hover):**
- Element: Lawyer portraits in the index and detail pages.
- Hover (400ms ease-out): Portrait `filter: saturate(0%) → saturate(15%)` (subtle warm tint). Suggests warmth without breaking the formal register.
- Hover out (300ms ease-in-out): Reverse.

**Trigger 4 — Link Hover Underline Thickening:**
- Element: All editorial links throughout the site.
- Hover (250ms ease-out): Underline `text-decoration-thickness: 1px → 2px`. Color stays oxblood. No other animation. Subdued.

**Trigger 5 — No Decorative Animations (Critical):**
- Legal sites should NOT have parallax, scroll-tied transforms beyond the divider draw-in, or any visual gimmick. Every visual flourish read as inappropriate by transactional clients. Template explicitly omits common Webflow interaction templates (no card-tilt, no marquee, no animated gradients). The restraint IS the design.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with legal namespace `lex-`. Examples: `lex-transaction_row`, `lex-lawyer_card`, `lex-insight_dropcap`, `lex-divider_hairline`. Utilities: `u-tracked-uppercase`, `u-times-serif`, `u-text-oxblood`, `u-italic-citation`, `u-tabular-financial`. Globals: `g-section_lg` (140px), `g-section_md` (96px), `g-container_text` (720px), `g-container_index` (1200px).
- **Typography Discipline:** All headlines use Times serif at 400 (regular) weight. NEVER bold for headlines — that's not the legal-firm register. 500 weight permitted for partner names in lawyer index only. Body uses Times serif at 400. Italics ONLY for case names, statute references, publication names, and Latin phrases — never for general emphasis.
- **Vertical Rhythm:** All editorial sections use a strict 8px baseline. Section padding: 140px / 96px / 64px / 48px (responsive). Heading-to-body: 32px. Paragraph-to-paragraph: 24px. Tracked-uppercase label-to-content: 20px.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At all breakpoints, retain hairline dividers — they're the structural element. At 991px, lawyer index 3-column collapses to 2-column with portrait above text. At 478px, all transactions/lawyers stack as single column.

**How to Edit Content & CMS:**

- **Adding a Transaction Announcement:** CMS → Transactions → New. Date: month + year format ("OCTOBER 2026"). Description language is tightly conventional — use the legal-firm formal register: "Represented [Client] in its $X acquisition of [Counterparty]" / "Advised [Client] on its $X initial public offering" / "Counsel to [Client] in the divestiture of [Asset]." Practice Areas: multi-select. Featured boolean: surfaces on homepage. Critical: Transaction Value field accepts "Undisclosed" — many transactions are non-public. Don't fabricate values.
- **Adding a Lawyer:** CMS → Lawyers → New. Portrait: must be a formal black-and-white headshot, 4:5 aspect, neutral background, subject in business attire. Convert color photos to monochrome in pre-production using a photographic conversion (not a CSS filter — looks better when handled in image processing). Education: list each degree on its own line with the specific Latin honors notation. Bar Admissions: comma-separated list of jurisdictions. Featured Matters: select 5–8 strongest matters from the Transactions CMS (multi-reference) — these surface on the lawyer's detail page.
- **Posting an Insight (Client Alert):** CMS → Insights → New. Type field controls treatment: "Client Alert" gets a smaller hero block (these are often quick legal updates), "Article" gets a fuller editorial layout, "White Paper" gets a downloadable PDF link in addition to web text. Authors: multi-reference to Lawyers. Body: include footnotes with proper Bluebook citation format. Template's rich-text formatter has a "Footnote" custom embed style.
- **Office Updates:** Offices are stored as a CMS collection "Offices" — add new offices here. Address must be in proper postal format (suite numbers, ZIP codes). Phone/Fax fields are formatted via display CSS. Photograph: black-and-white architectural exterior shot (the building's facade, typically taken from across the street).
- **Practice Area Pages:** CMS → Practice Areas → New. Description: 2 paragraphs, declarative ("Cipher's M&A practice represents public and private companies in domestic and cross-border transactions ranging from $50M to $5B+."). Approach: 4 paragraphs describing how matters are staffed and engaged.
- **Recognitions:** Stored in a separate CMS collection "Recognitions" — Chambers Global / Chambers USA / Legal 500 / AmLaw rankings. Each entry: Year, Publication, Recognition Title, Practice Area, optional URL link. Lawyer detail pages auto-pull recognitions tagged to that lawyer.
- **Critical Compliance:** The footer disclaimer ("ATTORNEY ADVERTISING. PRIOR RESULTS DO NOT GUARANTEE A SIMILAR OUTCOME.") is required by most state bars (especially New York) — DO NOT remove. Additional state-specific disclosures live in a CMS Singleton "Compliance Settings" — coordinate with the firm's general counsel before edits.
