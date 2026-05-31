# Template 15: KESTREL VENTURES

**Niche/Target Market:** Thesis-driven pre-seed and seed-stage venture capital firms ($30M–$200M funds, single-thesis or sector-focused). Specifically the *narrative VC* register: First Round Capital (early), Lightspeed (vertical funds), Founders Fund (thesis content), Bond Capital, Initialized, Inevitable Ventures, Pace Capital. Audience is technical founders pre-launch evaluating seed firms (the most important reader — their decision is who they raise from), other VCs and angels considering co-investing, and LPs evaluating the firm's thesis substance for fund commitments. The site is the firm's living *thesis document*.

**Core Value Proposition & Aesthetics:**

The thesis: thesis-driven seed firms compete on *intellectual substance*. They are not the largest firms, not the most established names — they win deals because founders read the firm's writing and think "these people understand what I'm building." The aesthetic register is editorial-meets-VC: heavy on long-form writing, the fund's thesis prominent, portfolio companies shown as evidence of thesis execution. Imagery is restrained but warm. Typography signals literary care.

**Design System:**
- **Typography:** Editorial serif for content, sans-serif for navigation. **Source Serif Pro** (or **GT Sectra Display**) for display headlines and editorial body. **Inter** at 400/500 for navigation and metadata. Tabular-nums for portfolio data. Headlines restrained: H1 at 48px, H2 at 28px. Long-form body in 18px serif at 1.7 line-height for sustained reading. Drop-caps used in major editorial sections.
- **Color Theory:** Warm cream surface `#F8F4ED` (warmer than Vantage Capital's, signals editorial register vs. institutional). Body text in deep brown `#2A1F12` (warm near-black). Single primary accent: muted cobalt blue `#1B4480` — used for links, the "Read the thesis" CTA, and active states. Secondary accent: warm gold `#A88837` for portfolio company highlight indicators. NO bright tech-VC colors (no purple, no green, no cyan). The palette signals "literary VC" — readers, not bro-investors.
- **Visual Language:** Magazine layout. Long-form essays prominent, with traditional editorial design — drop caps, pull quotes, multi-column where appropriate, footnotes. Portfolio companies displayed as case studies, not just logo grids. Founder portraits in color editorial style (natural light, environmental — at their offices, not posed). The site reads like *Stratechery* or *Not Boring* with venture investments. Photography is purposeful — every image is editorial, never decorative.
- **Why $10K+:** Top thesis-driven VC firms invest $40K–$120K in custom websites because the website IS the deal-flow engine — founders read the firm's writing, become aware of the thesis, and reach out. First Round's site, Founders Fund's, Inevitable Ventures' all reflect this caliber. The challenge is achieving genuine editorial register (rather than blog-with-VC-branding) AND the right balance of fund substance and founder accessibility. This template provides the rare editorial-VC framework with a real thesis CMS, portfolio company narratives, and a "memo" system for fund-level updates to LPs and founders.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Thesis)

- **Hero (60vh, editorial-led):**
  - 2-column split, 60/40. Left: small cobalt-blue tracked-uppercase eyebrow ("PRE-SEED + SEED VENTURE CAPITAL"). H1 in serif (`clamp(2.5rem, 5vw, 4rem)`): "We invest in companies building infrastructure for the next generation of AI development." Single sentence — the thesis is the headline. Below: 2-paragraph dek expanding the thesis. Two text links (no buttons): "Read the full thesis →" and "Portfolio →" — both cobalt blue with hairline underlines.
  - Right: A single editorial photograph (4:5 aspect) — a warm interior shot, perhaps a partner reading or working, or a candid portfolio-company moment. NOT a polished portrait, NOT stock.

- **Section: The Thesis (long-form opening):**
  - Single column, 720px max-width centered. Heading "OUR THESIS" tracked uppercase. Below: a 6-paragraph essay laying out the fund's investment thesis in genuine editorial form. Drop-cap on first paragraph (Source Serif, 5-line tall, cobalt blue). Italics for emphasis. Pull quote in the middle — full-width break, italic serif, 1.5x size, cobalt left-border. Reads like an essay in *Stratechery*, with specific intellectual claims about market dynamics, technology shifts, and what kinds of companies will win.
  - This essay is the entire pitch. Founders and LPs read it carefully.

- **Section: Recent Investments (the proof):**
  - Heading "RECENT INVESTMENTS" tracked uppercase. Below: 3 most recent portfolio company investments displayed as substantive cards. Each card:
    - A photograph of the founder(s) (color, environmental — at their office, in their environment)
    - Company name (serif, 24px, cobalt link)
    - 1-line description ("Building developer tools for distributed AI training.")
    - Founders' names + previous backgrounds ("Alice Chen — formerly research scientist at OpenAI / Bob Patel — former engineering lead at Stripe")
    - Investment date + round size if disclosed
    - 2-paragraph "Why we invested" explanation
    - "Read the announcement memo →" link
  - Cards are spacious, editorial — not thumbnail tiles. The investment IS a thesis statement.

- **Section: Full Portfolio (logo grid):**
  - Heading "PORTFOLIO." A 4-column grid of all portfolio company logos. Each cell: monochrome logo, company name in caption-style text below, sector tag. Hover: cell tints with cobalt accent, full-color logo appears, click → company detail page.

- **Section: Recent Memos (the writing):**
  - Heading "RECENT MEMOS" tracked uppercase. Below: 3 most recent thought-leadership pieces in a 3-column row. Each: dateline tracked uppercase, title in serif (regular weight, 22px), 2-line dek, byline (partner name, cobalt link). Click → memo article page.

- **Section: How We Work With Founders:**
  - 2-column layout. Left: heading "HOW WE WORK WITH FOUNDERS." 5-paragraph essay describing the fund's specific operating model — check size, ownership target, post-investment support, board involvement, time-to-decision norms. Honest, specific, slightly unconventional. ("We typically write checks of $1.5M–$3M as the lead in pre-seed rounds. We aim for 12–18% ownership. We expect to be the operating-leverage investor in the round, not the brand investor. We do not require board seats.").
  - Right: a sticky panel with key fund stats — Fund Size, Check Size Range, Stage Focus, Sector Focus, Geographic Focus, Time to Decision. All in tabular-nums.

- **Section: The Partners (3-column, editorial):**
  - Heading "PARTNERS." 3-column grid of partners. Each card: a color portrait (4:5, environmental, NOT corporate headshot), name (serif, 22px), title in tracked uppercase, 4-paragraph bio describing their background, sectors they lead, board roles, and previous careers (operating roles, prior investing roles). Hover the portrait: subtle saturation increase. Click: routes to partner detail page.

- **Section: For Founders (the conversion):**
  - Centered. Heading: "If you're building something we should know about." Below: 2 paragraphs explaining how the fund evaluates inbound — what they read first, what makes for a strong pitch, what the process looks like. Below: a single email link `partners@kestrelventures.com` and "We respond to substantive pitches within 5 business days." No form. No Calendly. The intentional friction is itself a signal — serious founders should reach out by email with specifics.

- **Footer:**
  - 4 columns: Fund (Thesis, Portfolio, Memos, About) | People (Partners, Operating partners, Advisors, Careers) | For (Founders, LPs, Press, Newsletter) | Contact (Office, Email, Twitter/X, RSS for memos). Bottom: copyright + small fund regulatory disclosures (RIA registration, fund vintage, etc.).

### Page 2 — Thesis (The Long-Form)

- **Hero:** "OUR THESIS." Single dek line.

- The entire thesis page is a long-form essay — typically 3,000–8,000 words — laying out the fund's complete investment thesis. Structure:

- **Section 1: The Macro.** 5–8 paragraphs on the macro shifts the fund believes in. Drop-cap on first paragraph. Specific claims with reasoning, not platitudes.
- **Section 2: Where We're Looking.** 5–8 paragraphs on the specific sub-sectors the fund targets, with reasoning for each.
- **Section 3: What We're Avoiding.** 3-4 paragraphs on what the fund explicitly does NOT invest in, and why. (This restraint signals seriousness — funds that "invest in everything" are almost never the strongest.)
- **Section 4: How This Plays Out.** 4-5 paragraphs on the kinds of companies and founders the fund expects to back.
- **Section 5: A Note on the Timeline.** 2-3 paragraphs acknowledging the time horizon (10+ year holds), the failure rate, and what success looks like.

- Layout: 720px max-width content column. Generous typography. Pull quotes throughout. Footnotes via superscript with citations at article end.

### Page 3 — Portfolio (Detail per Company)

- **Index Hero:** "PORTFOLIO." Filter by sector + stage.

- **Index Layout:** Same logo grid as homepage, but full portfolio shown.

- **Portfolio Company Detail Page (CMS):**
  - **Hero:** A founder portrait or company environment shot (16:9 full-bleed). Overlay: company name in serif (40px), 1-line positioning, sector tag.
  - **Section: What They're Building.** 3-paragraph description of the company in the firm's voice (NOT marketing copy from the company itself).
  - **Section: Why We Invested.** 5-paragraph "investment memo summary" — the firm's reasoning for backing the company. Specific, substantive, intellectual.
  - **Section: The Founders.** 2-3 paragraphs on the founding team — who they are, what they did before, what makes them suited to this problem.
  - **Section: Investment Details.** A small data block with: Investment Date, Round (Pre-Seed / Seed / Series A), Lead/Participated, Co-Investors (other firms in the round), Round Size (if disclosed).
  - **Section: Updates.** Periodic updates from the firm about the portfolio company's progress (CMS-driven, optional). Each update: date, brief description, link to any external news.
  - **Section: Related Reading.** Links to the firm's memos that relate to this investment thesis.
  - **CMS Collection "Portfolio":** Name, Slug, Logo, Hero Image (founders or environment), Description (rich text), Investment Memo (rich text), Founder Bios (rich text), Investment Date, Stage Invested, Lead Status (Lead / Co-Lead / Participated), Co-Investors (text), Round Size (text — supports "Undisclosed"), Sector (option set), Status (Current / Acquired / IPO / Wound Down), Featured (boolean), Updates (multi-reference to Updates collection).

### Page 4 — Memos (Long-Form CMS)

- **Hero:** "MEMOS." Tagline: "Notes on companies, markets, and what we're thinking about."

- **Index:** Editorial layout. Featured memo (latest/pinned) gets a 2-column hero — small editorial image left, large title + dek + byline right. Subsequent memos in a stacked single-column list (no thumbnails — like a literary publication's TOC), each with date, title (serif, large), 2-line dek, byline.

- **Article Page:** 720px max content width. Hero: dateline tracked uppercase, serif H1 (44px), italic dek, byline with author photo. Body in 19px serif, 1.7 line-height. Drop-cap on first paragraph (cobalt). Pull quotes (italic, cobalt left-border, full-width breaks). Inline images full-bleed with serif italic captions. Footnotes via superscript with full citations at article end. End-of-article: 3 related memos.

- **CMS Collection "Memos":** Title, Slug, Hero Image (optional — many memos are pure text), Author (reference to Partners), Publish Date, Topics (multi-reference), Rich Text Body (with embedded pull quotes, images, footnotes), Reading Time, Featured (boolean).

### Page 5 — Partners (Detail per Partner) + Contact

- **Partner Detail Page (CMS):**
  - **Hero:** Color portrait (4:5, large), name (serif H1 36px), title tracked uppercase.
  - **Section: Background.** 6-paragraph career biography in third-person editorial prose. Reads like a *New York Times* magazine profile lead.
  - **Section: Areas of Focus.** Tracked uppercase header. Below: 4-6 areas the partner leads, with specific reasoning for each.
  - **Section: Selected Investments.** A grid of 4-8 portfolio companies the partner has led or strongly supported. Logos + brief context.
  - **Section: Selected Memos.** A list of 5-10 memos this partner has written.
  - **Section: Personal.** 2-paragraph block about the partner's interests outside venture (reading habits, hobbies, side projects). Humanizes without being unprofessional.
  - **Section: Contact.** Direct email + Twitter/X + LinkedIn.

- **Contact Page (separate, simple):**
  - **Hero:** "CONTACT."
  - **Section: For Founders.** 3-paragraph note on how to reach out with a pitch. Direct email link.
  - **Section: For LPs.** Direct email for `lps@`.
  - **Section: Press & Speaking.** Direct email for `press@`.
  - **Section: Office.** Single block with office address, phone (if applicable), and a small note ("Visits by appointment").

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Drop-Cap Reveal (Page Load):**
- Element: First-paragraph drop-caps in editorial sections.
- Trigger: Fonts loaded.
- Action: Drop-cap fades in over 1000ms with `cubic-bezier(0.25, 1, 0.5, 1)`. Body text follows 200ms later, faster duration.

**Trigger 2 — Pull Quote Reveal (Scroll-Tied):**
- Element: Pull quotes in long-form articles.
- Trigger: Scroll into view, 30% from bottom.
- Action: Pull quote fades in (`opacity: 0 → 1` over 800ms), with the cobalt left-border drawing in (`width: 0 → 4px` simultaneously).

**Trigger 3 — Portfolio Logo Grid Hover:**
- Element: Each portfolio company logo cell.
- Hover (300ms ease-out): Cell background tints (`#F8F4ED → #E8E0D2`). Logo color-shifts from monochrome to full color (filter swap). Cobalt 1px border appears on the cell. Click routes to detail page.

**Trigger 4 — Editorial Link Underline (Hover):**
- Element: All editorial links throughout the site.
- Hover (350ms ease-out): An `::after` pseudo-element grows from left, `width: 0 → 100%`. Background cobalt, height 1px, position `bottom: -2px`. Same asymmetric direction principle as Atelier Noir.

**Trigger 5 — Sticky Panel on How-We-Work Section:**
- Element: Right-column fund stats panel.
- Implementation: Pure CSS `position: sticky; top: 120px;` so the stats stay visible while reading the long-form left column.

**Trigger 6 — Newsletter Subscribe Inline (No Modal):**
- Element: Newsletter signup at bottom of memo articles.
- Inline form (no popup). Email input + subscribe button. On submit: replace with serif italic confirmation message ("Subscribed. Check your email to confirm."). NO popups, NO modal interruption — interrupts violate the editorial register.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with VC namespace `vc-`. Examples: `vc-thesis_dropcap`, `vc-portfolio_card`, `vc-memo_pullquote`, `vc-partner_portrait`. Utilities: `u-serif-display`, `u-serif-body`, `u-mono-meta`, `u-italic-emphasis`, `u-text-cobalt`, `u-text-gold`. Globals: `g-section_lg` (140px), `g-section_md` (96px), `g-container_text` (720px), `g-container_wide` (1200px).
- **Vertical Rhythm:** 8px baseline grid. Section padding: 140px / 96px / 64px / 48px (responsive). Heading-to-body: 32px. Paragraph-to-paragraph: 24px. Drop-caps: 5-line tall, line-height 0.85.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Drop-caps disable at 991px and below. Two-column hero collapses at 991px (image moves below text). At 478px, all multi-column layouts stack.

**How to Edit Content & CMS:**

- **Updating the Thesis:** Thesis is stored as a rich-text content body in a CMS Singleton "Thesis." Major thesis updates happen rarely (perhaps once per fund vintage) — when they do, they're significant edits with intellectual implications. The thesis is the fund's single most important content asset.
- **Posting a Memo:** CMS → Memos → New. Voice: editorial, opinionated, intellectually substantive. Topics should be specific (NOT "thoughts on AI" — but "Why we think the next platform shift is in AI inference latency" or "What we got wrong about consumer subscription"). Length: 1,500-5,000 words typical. Pull quotes via rich-text formatter. Footnotes for citations.
- **Adding a Portfolio Company:** CMS → Portfolio → New. Hero Image: an environmental shot of the founders or company (NOT the company logo on a pretty background). Investment Memo: 5-paragraph "Why we invested" reasoning, written in the fund's voice. Founder Bios: 2-3 paragraphs on the team's background and suitability for the problem. Investment Date and Stage Invested are critical metadata.
- **Adding a Partner:** CMS → Partners → New. Color portrait: editorial, environmental, NOT corporate headshot. The portrait sets the tone for partner pages. Background biography: written in third-person, editorial voice. Areas of Focus: specific subsectors with reasoning. Personal section: humanizes without being unprofessional.
- **Founder Photography:** When investing in a new portfolio company, commission an editorial-style founder portrait (color, natural light, environmental — at the company's office, not in a studio). Cost: $500-$2K per shoot. This investment in photography signals to other founders that the fund cares about how its companies are presented.
- **Newsletter Integration:** Memos newsletter via Substack, Beehiiv, or ConvertKit embed. Configure in Project Settings → Custom Code. RSS feed of memos auto-generated by Webflow CMS — useful for syndication to Substack and Medium.
- **Fund Disclosures:** Footer regulatory disclosures (RIA registration, fund vintage, etc.) stored in a CMS Singleton "Fund Settings." Coordinate with the fund's General Counsel before edits — VC fund disclosures have specific SEC requirements depending on registration status (RIA vs ERA).
