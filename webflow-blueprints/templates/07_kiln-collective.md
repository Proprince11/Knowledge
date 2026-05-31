# Template 7: KILN COLLECTIVE

**Niche/Target Market:** Premium cohort-based courses and high-touch online education programs at the $1,500–$15,000 price tier. Specifically the Maven / On Deck / Reforge / Section / Ness Labs caliber — courses taught by recognized practitioners (not unknown instructors), with a community/alumni network as part of the value proposition. Audience is mid-career professionals (Director-level and above) evaluating a 4–8 week intensive program for skill development, network expansion, or pivot prep. They have spent on courses before and have learned to be skeptical of generic "learn X" pitches.

**Core Value Proposition & Aesthetics:**

The thesis: high-ticket cohort education is bought 70% on *the instructor* and *the alumni network*, not the syllabus. The website's job is to make those two assets feel substantial and earned. Every visual decision must signal: this is a serious, finite, hard-to-get-into program — not a self-paced video library. Aesthetic register sits at the intersection of *New Yorker editorial* and *modern conference site* — confident, textually rich, alumni-forward.

**Design System:**
- **Typography:** Editorial pairing. **Tiempos Headline** (or **Source Serif Pro**) for display headings — but at restrained sizes (40–80px max, never the Aurora Studio heroic register). **GT America** or **Inter** at 400 for body, 1.65 line-height for sustained reading. **GT America Mono** for metadata (cohort dates, member counts, duration). Heading hierarchy uses italic serif for emotional emphasis ("*Who* this is for"), regular weight serif for everything else.
- **Color Theory:** Warm ivory base `#F8F4ED` (warmer than Atelier Noir's bone — closer to vintage book paper). Body text in deep brown `#3A2E1F` (warmer than black, evokes printed-book ink). Single primary accent: terracotta `#C44B2C` — used for the primary CTA, link underlines, and active states. A secondary accent: muted forest green `#5A6B4F` for "completed" states and alumni indicators. NO blue. (Blue is "tech course" cliché.) Charts and data use the brown/terracotta/green palette only.
- **Visual Language:** Photo-rich but earned — every photograph features actual instructors, alumni, or cohort sessions (not stock). Shot in natural light, slightly desaturated, warm shadows. Pull quotes are prominent and from real alumni with real attribution (Name, Role, Company). Layout uses serif-driven editorial design — generous margins, drop caps, multi-column text where appropriate. Numbered lists, italic emphasis, blockquote styling all carry typographic personality.
- **Why $10K+:** Top cohort-based course companies commission custom sites at $30K–$80K for their flagship courses. The challenge is not novelty — it's *editorial confidence* applied to a sales context. This template provides the rare architectural framework that makes a $5K course purchase feel like a serious decision the buyer is making, not a transaction. Includes a real cohort CMS with applications/waitlists, alumni outcomes CMS, and a curriculum-by-week structure that maps to how mid-career buyers evaluate program substance.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage / Course Landing (The Conversion Page)

- **Hero (75vh, no full-screen drama):**
  - Two-column layout, 55/45. Left: small uppercase eyebrow in terracotta ("COHORT 12 — STARTS FEBRUARY 2027"). H1 in serif, 56px ("A 6-week intensive on /how to lead through company-defining decisions./") — italic mid-headline anchors the editorial register. Below H1: 2-paragraph dek explaining the course's specific positioning (who it's for, what makes it different). Two CTAs: primary "Apply for Cohort 12" (terracotta filled), secondary "Read the syllabus" (ghost, brown text + brown 1px underline).
  - Right: A single editorial photograph (4:5 aspect) — the instructor mid-conversation, in natural light, shot in their actual environment (not posed studio). No background overlay or gradient.
  - Below the hero: a thin row of 4 monospace stats — "8 WEEKS" / "120 ALUMNI" / "$4,800 TUITION" / "INVITATION-BASED ADMISSION." Stats establish substance immediately.

- **Section: The Problem (essay-style):**
  - Single column, 720px max-width. Heading "Who this is for." Below: a 4-paragraph essay describing the specific career situation this course addresses. Voice is direct, slightly opinionated. ("If you've recently moved from IC to first-time manager and feel like the playbook stopped working — this course is built for the next 18 months of your career."). Drop-cap on first paragraph.

- **Section: The Instructor (high-trust block):**
  - 2-column layout. Left: a single editorial photograph of the instructor (full-bleed in column, 4:5 aspect). Right: Heading "Taught by [Instructor Name]." Below: a 4-paragraph biography emphasizing concrete achievements (companies built, books written, teams led, papers published). Lists below the bio: "Currently:" (3 bullet points of current roles), "Previously:" (3 bullet points of past roles), "Notable work:" (linked to books, talks, papers). The instructor's credibility is the entire pitch.

- **Section: Curriculum (week-by-week, structured):**
  - Heading "Curriculum." Below: 6–8 horizontal rows, one per week. Each row layout:
    - Left: large serif "Week 01" / "Week 02" etc. in italic, followed by the week's title ("Diagnosing organizational dysfunction").
    - Right: a 3-paragraph description of what's covered, plus a sub-list of specific topics, plus the type of session ("Live workshop, 90 min" / "Reading + async discussion" / "1:1 office hour with instructor"). Hairline divider between weeks.
  - **CMS Collection "Curriculum":** Week Number, Title, Description (rich text), Session Type, Specific Topics (rich text — bullet list), Required Reading (multi-reference to Reading collection), Display Order.

- **Section: Alumni Outcomes (the social proof tier):**
  - Heading "What alumni did after." 3-column grid of alumni cards. Each card: alumni headshot (3:4 aspect, color photograph), Name + Current Role + Company, a 2-sentence quote in serif italic, and a small "BEFORE → AFTER" line ("Director of Product at [Company A] → VP of Product at [Company B]"). Quote should be SPECIFIC ("This course rewired how I run leadership team meetings — we cut decision time by half") not generic.
  - **CMS Collection "Alumni Stories":** Name, Headshot, Current Role, Current Company, Cohort Number Attended, Before Position, After Position, Quote (rich text), Featured (boolean), Display Order.

- **Section: How the Cohort Works (logistics block):**
  - Heading "How it works." 4-column grid. Each column: an icon (line-drawn, terracotta accent), label, and 2-sentence description.
    - "LIVE SESSIONS — Two 90-minute sessions weekly with the full cohort."
    - "OFFICE HOURS — Weekly 1:1s with the instructor for application sessions."
    - "READING & RESEARCH — 4–6 hours of preparation per week."
    - "PRIVATE NETWORK — Lifetime access to alumni Slack and quarterly reunions."

- **Section: Tuition + Application:**
  - Two-column. Left: Tuition info ("$4,800 tuition. Pay-in-full or 4-month installments available. Scholarships available for early-career applicants — see FAQ."). Right: application timeline ("Applications close: January 15. Decisions: January 22. Cohort begins: February 5."). Below both: a single, large "Apply for Cohort 12 →" button.

- **Section: Common Questions (accordion):**
  - 8–10 questions addressing high-friction objections specific to high-ticket courses: "What's the time commitment?" "What if I miss a session?" "Is this for technical or non-technical folks?" "What's the alumni network actually like?" "Can my company sponsor this?" "What's the refund policy?" Accordion-style, terracotta chevron rotates 90° on expand.

- **Footer:**
  - 3 columns: Course (Apply, Syllabus, Cohort dates, Scholarships) | Resources (Blog, Past cohorts, Alumni Spotlights, Newsletter) | Contact (Email, Twitter/X, LinkedIn, Press). Below: copyright + a small "Thank you to our 120 alumni for the trust" line in serif italic.

### Page 2 — Apply (The Application Funnel)

- **Hero:** Smaller (40vh). "Apply for Cohort 12." Below: 2-paragraph explanation of why the course uses an application process (selectivity preserves cohort quality, applicants self-filter for fit, pre-cohort rapport builds).

- **Application Form:**
  - Form designed in editorial style — fields rendered with serif labels, generous spacing, no chunky inputs. 7 fields:
    1. Your name + email (combined row)
    2. Your role + company (combined row)
    3. LinkedIn URL (recommended)
    4. "What's bringing you to this course right now?" (textarea, serif italic placeholder text shows what they're looking for: "Specific situations or decisions you're navigating get strong responses.")
    5. "What's the biggest gap in how you currently lead?" (textarea)
    6. "Any specific outcomes you're hoping for?" (textarea)
    7. "Anything else we should know?" (optional textarea)
  - Submit button: terracotta, full-width, "Submit Application." On submit: form replaces with a serif-styled "Received" message that explains the timeline ("We'll review your application and respond within 5 business days. If we have follow-up questions, we'll schedule a 20-minute call.").

- **Section: What we evaluate:**
  - Below the form. 3 italic-titled subsections:
    1. "*Specificity over polish*" — we don't care about wordsmithing, we care that you're describing a real situation.
    2. "*Diversity of cohort*" — we admit cohorts that range across industries, seniority, and company stage on purpose.
    3. "*Genuine engagement*" — applicants who treat the application like a transaction usually don't get the most out of the cohort.

### Page 3 — Past Cohorts (Social Proof Index)

- **Hero:** "Past Cohorts." Single dek line: "Twelve cohorts. 120 alumni. Eleven companies founded by graduates."

- **Section: Cohort Index (CMS-driven, chronological):**
  - Each cohort is a row. Layout per cohort:
    - Left: Cohort number + dates ("COHORT 11 — JUNE 2025"), large.
    - Right: A 4×3 mini-grid of small cohort member headshots (24 members per cohort, displayed in this grid). Hover any headshot: enlarges with a tooltip showing name, role, company. Click: routes to that alumni's outcome card on the homepage or to their LinkedIn.
    - Below: 1 sentence on what made that cohort distinct ("Cohort 11 had unusually deep representation from healthtech.").
  - Hairline divider between cohorts.

- **Section: Alumni Companies:**
  - Heading "Where alumni work now." A grid of company logos (monochrome) representing companies where alumni currently hold senior roles. 6 columns, scrolls up to 5 rows. Logos at 60% opacity, 100% on hover.

- **Section: Alumni Founded:**
  - Heading "Companies founded by alumni." A list of 11 alumni-founded companies. Each row: company name (link to company), founder's name (with link to alumni page on this site), founding year, brief description. Clean, unpolished, factual.

### Page 4 — The Instructor (Deep Bio Page)

- **Hero:** "[Instructor Name]." Subheading in italic serif ("Teacher, writer, former [past role]").

- **Section: Bio (long-form essay):**
  - 720px max-width single column. 8–10 paragraph career biography written in serif body type, 1.7 line-height. Drop-cap on first paragraph. The biography should read like a *New Yorker* "talk of the town" piece — narrative-driven, specific, name-dropping where earned.

- **Section: Selected Work:**
  - 3-column grid of the instructor's published work: books (with cover image, title, year, publisher, link to buy), notable essays (linked title, publication, year), and notable talks (with thumbnail from talk video, title, conference, year + link).

- **Section: Teaching Philosophy:**
  - 5-paragraph statement on how the instructor approaches teaching this specific course — what they're trying to do, what they're not trying to do, what kinds of students get the most out of it. Honest, slightly opinionated voice.

- **Section: Recent Writing:**
  - 5–8 most recent writings (essays, newsletter pieces, papers) pulled from the Journal CMS. Each: dateline, title, publication, 1-line dek.

### Page 5 — Journal (CMS Long-Form)

- **Hero:** "Journal."

- **Index Layout:** Editorial blog. Featured article gets a 2/3-width hero treatment with image left + headline/dek/dateline right. Subsequent articles in a stacked single-column list, each with a small thumbnail image left, dateline + title + dek + byline right.

- **Article Page:** 720px content width. Editorial book design. Hero image full-bleed at top, then dateline in monospace uppercase, serif H1 (44px), italic dek, byline with author photo. Body in 19px serif, 1.7 line-height. Drop-cap on first paragraph. Pull quotes: italic, terracotta left-border. Inline images full-width with serif italic captions. End-of-article: a "Continue reading" section with 3 related articles.

- **CMS Collection "Journal":** Title, Slug, Hero Image, Dateline, Author (reference to Team), Tags, Rich Text Body (with embedded pull quotes, images, and footnote support), Reading Time (auto-calculated).

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Drop-Cap Reveal (Page Load):**
- Element: First-paragraph drop-caps in editorial sections.
- Trigger: After fonts loaded.
- Action: Drop-cap fades in over 800ms with `cubic-bezier(0.25, 1, 0.5, 1)`. Subsequent body text fades in 200ms after, faster (400ms duration). Editorial pacing — type doesn't snap.

**Trigger 2 — Curriculum Week Hover Expansion:**
- Element: Curriculum week rows.
- Hover (300ms ease-out): Background tint shifts to a 4% opacity terracotta fill. Topic sub-list (initially showing only first 2 topics) expands to show all topics with a subtle slide-down. Hairline border on the right edge thickens to terracotta.
- Hover out (250ms): Reverse.

**Trigger 3 — Alumni Card Quote Reveal (Scroll-Tied):**
- Element: Alumni outcome cards.
- Trigger: Scroll into view, 30% from bottom.
- Initial state: Card has only the headshot + name + role visible. Quote is `opacity: 0`, `max-height: 0`.
- Action: Quote fades in (`opacity: 0 → 1` over 600ms, `max-height: 0 → auto` over 400ms). Hairline divider between role and quote draws in (`width: 0 → 100%` over 400ms).
- Stagger: Cards in a row stagger by 120ms.

**Trigger 4 — Application Form Field Focus (User Input):**
- Element: Each form field.
- On focus: Field's bottom-border thickens from 1px brown to 2px terracotta over 200ms. Label above the field shifts up 4px and color-shifts from brown to terracotta. Suggests the field is "engaged."
- On blur (with content): Border returns to 1px terracotta (stays accent-colored to indicate filled). Label stays in raised position.
- On blur (empty): Border returns to 1px brown, label returns to original position.

**Trigger 5 — FAQ Accordion (Click):**
- Element: FAQ question rows.
- Click: Row container's height transitions from collapsed to auto (use `max-height` technique with calculated values, or modern `interpolate-size: allow-keywords` for true auto). Chevron icon rotates 90°. 350ms ease-out.

**Trigger 6 — Cohort Headshot Hover (Past Cohorts page):**
- Element: Each cohort member headshot.
- Hover (200ms): Headshot scales to 1.1, comes forward in stacking order, and a tooltip appears above with name + role. Tooltip has 1px terracotta border, no rounded corners, ivory background.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with editorial namespace `ed-`. Examples: `ed-hero_eyebrow`, `ed-curriculum_week`, `ed-alumni_card`, `ed-quote_pull`. Utilities: `u-serif-display`, `u-serif-body`, `u-mono-meta`, `u-italic-emphasis`, `u-text-terracotta`, `u-text-forest`. Globals: `g-section_lg` (140px), `g-section_md` (88px), `g-container_text` (720px for body), `g-container_wide` (1200px for layouts).
- **Editorial Vertical Rhythm:** All editorial sections use a strict 8px baseline grid. Section padding: 140px / 100px / 64px / 48px (responsive scale). Heading-to-body: 32px. Paragraph-to-paragraph: 24px. Drop-caps: 5-line tall, line-height: 0.85, margin-right: 12px, float: left. NEVER use 16px or 20px section paddings — they read mid-market.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At 991px and below, drop-caps disable (small screens make them feel cramped). At 767px, two-column hero collapses with image moving below text. At 478px, all 3-column grids collapse to single-column stacked.
- **Photography Discipline:** The instructor and alumni photography is the most important visual asset. ALL photos must be: shot in natural light, slightly desaturated (`-12%` saturation in pre-production), warm-tone preserved (don't over-correct shadows), 4:5 aspect for portraits, 16:9 for cohort/session photography. Stock photos break the editorial register instantly — even a single one corrupts the whole feel.

**How to Edit Content & CMS:**

- **Adding a New Cohort:** CMS → Cohorts → New. Cohort Number, Dates (Start / End), Application Deadline, Decision Date, Members (multi-reference to Alumni collection — populated after cohort completes). Once a cohort starts, mark "Active" boolean to true; when it ends, switch to false and the homepage CTA automatically shifts to apply for the *next* cohort.
- **Posting an Alumni Story:** CMS → Alumni Stories → New. Headshot must be color, 3:4 aspect, professional but warm (not overly polished). Quote field is rich text — keep it 2 sentences max, specific and concrete. Avoid generic praise. The "Before → After" field is critical — it's the most-read element in alumni cards. Format: "Title at Company → Title at Company" (use → arrow character, not "to").
- **Updating Curriculum:** CMS → Curriculum → New (or edit existing). Week Number controls display order (lower numbers first). Description: 3 paragraphs of substantive content, NOT "We'll cover X, Y, and Z" — describe the actual decisions and frameworks discussed. Specific Topics: 5–8 bullet items. Session Type: choose from option set.
- **Writing Journal Articles:** CMS → Journal → New. Voice direction: write in the instructor's voice (or attributed guest contributors). Pieces should be 1,200–3,000 words, building toward a single argument or insight. Pull quotes: highlight a sentence in the rich text editor → use the "Pull Quote" formatter. Footnotes: use the rich-text superscript formatter; full footnotes go at the article end.
- **Tuition & Pricing Updates:** Tuition is stored in a CMS Singleton "Course Settings" with fields: Tuition (text — supports formatting like "$4,800"), Installment Option, Scholarship Note, Application Open Date, Application Close Date. All references on the site update automatically. Critical: when changing tuition for a new cohort, also update the FAQ entry that addresses pricing if it references specific numbers.
- **Application Form Routing:** Form submissions route via Webflow's native Forms — but the template includes a Webflow Logic flow that: (1) sends a styled auto-response to the applicant, (2) posts a Slack notification to the team's `#applications` channel, (3) creates a row in a connected Airtable for review tracking. Logic flows are documented in the README; reconfigure endpoints in Project Settings → Logic.
