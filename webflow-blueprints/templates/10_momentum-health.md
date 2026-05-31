# Template 10: MOMENTUM HEALTH

**Niche/Target Market:** Concierge / executive longevity clinics charging $15K–$80K annual memberships. Specifically the *evidence-led wellness* register: Fountain Life, Human Longevity Inc, Wild Health, Hone Health, Function Health (in their Series-A+ tier), Levels (concierge product). Audience is high-earning executives (40–65 yo) who view their health as an optimization problem and have already paid for premium healthcare; spouses (often the actual decision-maker for couple memberships); and retirement-aged HNW individuals concerned with healthspan/lifespan extension.

**Core Value Proposition & Aesthetics:**

The thesis: longevity clinics sit in a complex visual register — they must signal *clinical rigor* (this is real medicine, not wellness woo) AND *premium hospitality* (membership feels worthy of $40K/yr) AND *personalized warmth* (this is your dedicated medical team, not a hospital intake). The aesthetic threading these three: warm clinical — the pristine geometry of a Mayo Clinic concierge wing crossed with the calm hospitality of a high-end spa. NOT crystals, not "wellness," not chiropractic-office-blue, not 23andMe-purple.

**Design System:**
- **Typography:** Editorial-clinical pairing. **Söhne** (or **Inter**) at 400/500 weight for body and UI. **GT Sectra Display** (or **Tiempos Headline**) for editorial display headings — a serif with subtle warmth. Type sizes restrained but readable: H1 at 48px, body at 17px, generous 1.7 line-height. Numerals always tabular-nums for biomarker data and pricing. NO playful fonts (no Recoleta, no Caveat — those are wellness-brand cliché).
- **Color Theory:** Warm-clinical palette. Primary surface: soft cream `#FAF8F4` (warmer than pure white, softer than Vantage Capital's off-white). Body text: warm dark `#1F1A14` (warm near-black). Primary accent: deep sage `#5C7855` — a clinical green that's neither blue (cliché tech-medical) nor mint (cliché wellness). Secondary accent: brass/saffron `#C49846` — used for callouts, biomarker improvements, and the primary CTA. Supporting clinical color for charts/data: muted slate `#6B7B82`. NO bright cyan, NO purples, NO pastels.
- **Visual Language:** Clinical photography balanced with hospitality imagery. Includes: real medical imagery (a longitudinal blood-test chart, a CGM glucose curve, a VO₂max printout — actual clinical artifacts), interior shots of the clinic (warm lighting, designed spaces, NOT generic medical examination rooms), and member portraits (genuine, candid — NOT stock "happy senior couple" imagery). Charts and data visualizations are first-class design elements. Hairline rules and serif drop-caps for editorial sections. Generous white space.
- **Why $10K+:** Top concierge clinics have begun investing $40K–$120K in custom websites — the membership purchase is high-friction, and the website is critical to converting referrals into discovery calls. Most current clinic sites read as either "hospital corporate" or "wellness-spa" — both miss the actual register. This template provides the rare warm-clinical aesthetic with a real biomarker-explorer CMS, member-outcome stories, treatment protocol architecture, and an inquiry funnel calibrated for $20K+ membership decisions.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Membership Pitch)

- **Hero (75vh, restrained warmth):**
  - 2-column split, 55/45. Left: small tracked-uppercase eyebrow in sage ("PRECISION LONGEVITY MEDICINE"). H1 in serif (clamp(2.5rem, 5vw, 3.5rem)): "Healthspan, measured." (Two words. The two-word headline pattern is critical — it should land like a thesis, not a tagline.) Below: 2-paragraph dek explaining the membership clearly: what it is, who it's for, what's included. Two CTAs: primary "Schedule a discovery call" (sage filled), secondary "How the program works" (ghost, sage 1px border with sage text).
  - Right: A single editorial photograph (4:5 aspect) of the clinic environment — a designed, warm-lit consult room, OR a member's hand on a glucose monitor, OR a longitudinal data chart on a tablet. NOT a doctor in a white coat, NOT a stock medical image.
  - Below the hero: a 4-stat row in tabular-nums monospace. "120+ BIOMARKERS TRACKED" / "QUARTERLY MEDICAL REVIEW" / "2 PRIMARY PHYSICIANS" / "DEDICATED HEALTH STRATEGIST." Each stat is a fact about the program — substance over generic claims.

- **Section: How the Program Works (4-step linear):**
  - Heading "HOW MEMBERSHIP WORKS." 4 horizontal steps:
    1. **Comprehensive baseline.** Initial 2-day assessment with full lab panel (120+ biomarkers), advanced imaging (DEXA, coronary calcium score, full-body MRI optional), VO₂max, cognitive battery.
    2. **Personalized protocol.** Your medical team builds a 12-month longitudinal protocol — diet, supplementation, exercise prescription, sleep, stress, and any indicated treatments.
    3. **Continuous tracking.** Wearables, quarterly labs, monthly check-ins. We watch your biomarkers move in near-real-time.
    4. **Quarterly recalibration.** Every 3 months, your data is reviewed with you and your protocol is adjusted. This is what concierge means.
  - Each step: numbered (sage, large), heading + 3-sentence description. Hairline divider between steps. NO icons. NO illustrations.

- **Section: Featured Biomarkers (data-led credibility):**
  - Heading "WHAT WE MEASURE." Below: a 4-column grid of biomarker categories: "Cardiovascular" / "Metabolic" / "Inflammation" / "Hormonal." Each card: category name in serif (24px), 1-paragraph description of what's tracked and why it matters, then a small list of 4–5 specific tests in monospace ("ApoB / Lp(a) / hsCRP / NMR LipoProfile"). Hairline 1px border on each card.
  - **CMS Collection "Biomarker Categories":** Name, Slug, Description (rich text), Specific Tests (rich text — formatted list with proper italic for compound names), Display Order.

- **Section: Member Outcomes (the social proof):**
  - Heading "MEMBER OUTCOMES." 3-column grid of member story cards. Each card:
    - A real member portrait (color photograph, candid lifestyle setting — NOT a "satisfied customer" pose)
    - Member's first name + age + occupation pattern ("Sarah, 47, CFO at a healthtech company.")
    - A specific biomarker improvement ("ApoB dropped from 124 → 78 mg/dL over 14 months.")
    - A 2-sentence quote in serif italic that explains what changed in their life ("I had three years of declining lab numbers no one explained. Six months in, I had a clear plan and they were already moving.")
    - A small "READ FULL STORY →" link in sage
  - **CMS Collection "Member Outcomes":** First Name, Age, Occupation Pattern, Portrait, Headline Biomarker Change (text + before/after numbers), Quote (rich text), Full Story (rich text — for a detail page), Member Since Date, Featured (boolean).

- **Section: Your Medical Team (trust block):**
  - Heading "YOUR MEDICAL TEAM." Layout: a 4-column row of physicians and specialists. Each card: Black-and-white portrait (4:5 aspect — the only B&W photography on the site, signals medical-credentialing tradition), Name (serif, 22px), Credentials (in tracked uppercase: "MD, FACP — INTERNAL MEDICINE & LONGEVITY"), 1-sentence specialty description, board certifications listed in monospace (ABIM Internal Medicine, ABFM Sports Medicine, etc.).
  - **CMS Collection "Medical Team":** Name, Slug, Title, Credentials (text — "MD, FACP" format), Portrait (B&W, 4:5), Bio (rich text), Education (text — list format), Board Certifications (text), Notable Affiliations (text — Mayo, Cleveland Clinic, etc.), Display Order, Tier (Founding Physician / Staff Physician / Specialist / Health Strategist).

- **Section: The Science Behind (editorial credibility):**
  - 720px max-width centered. 5-paragraph essay on the program's clinical philosophy. References real research areas: longitudinal biomarker tracking, cardiometabolic precision medicine, hormetic interventions, sleep-mediated cognitive decline reversal. Includes inline citations to actual papers (linked, with proper journal-citation format). Drop-cap on first paragraph (serif, 5-line, sage color). Reads like a *New England Journal of Medicine* perspective piece.

- **Section: Membership Tiers (transparent pricing):**
  - Heading "MEMBERSHIP." 3-column tier comparison. Each tier: Name (Foundation / Comprehensive / Family), Price ("$24,000/year" — NOT "From $24K" — concierge clients respect the directness), 1-line positioning ("For executives committed to a 12-month longitudinal program."), feature checklist with checkmarks in sage. Recommended tier (Comprehensive) is highlighted with brass border-top + a "Most members choose this" pill.
  - Below the tiers: a small "Couple memberships available — couples@" link.

- **Section: Discovery Call (conversion):**
  - Centered. Heading: "Begin with a discovery call." 3 sentences explaining what happens on the call: a 30-minute conversation with a senior physician about your current health situation, your goals, and whether the program fits. Below: an embedded scheduling widget (Calendly or Cal.com). No form filtration — qualified buyers should reach the calendar directly.

- **Footer:**
  - 4 columns: Program (How it works, Membership, Biomarkers, FAQ) | About (Medical team, Locations, Press, Careers) | Resources (Insights, Outcomes, Newsletter, Member portal login) | Contact (Reception phone, Email contacts). Bottom: copyright + "Momentum Health is a private medical practice. Membership is by application." + state medical license disclosures.

### Page 2 — How the Program Works (Detail Page)

- **Hero:** "How the program works." 1-sentence dek.

- **Section: The Annual Arc (timeline visualization):**
  - A horizontal timeline showing what happens across the 12-month membership. Months 1–2 (Onboarding & Baseline), Month 3 (First Recalibration), Months 4–6 (Active Optimization), Months 7–9 (Mid-Year Comprehensive), Months 10–12 (Annual Review). Each phase: a panel with description, what data is gathered, what protocols are active.

- **Section: Each Phase Detailed.** A vertical CMS-driven section. Each phase: heading, 4-paragraph description, list of specific activities, expected outcomes.
  - **CMS Collection "Program Phases":** Phase Name, Phase Number, Months (range), Description (rich text), Activities (rich text), Expected Outcomes (rich text), Display Order.

- **Section: What's Included.** A detailed inclusion list — every test, treatment, consultation, and tool included in the Comprehensive membership. Reads like an itinerary, not a marketing block.

### Page 3 — Member Outcomes (Stories)

- **Hero:** "Member Outcomes." 1-line dek about the practice's commitment to longitudinal data-driven outcomes.

- **Index:** Stacked list. Each story is a CMS item. Layout: 2-column row — left 30% portrait, right 70% summary. Summary: name + occupation + member tenure, a chart showing key biomarker over time (small SVG, sage line on cream background), a 3-sentence summary.

- **Story Detail Page (CMS):**
  - **Hero:** Member photograph + name + age + tenure with the program.
  - **Section: Where they started.** 3 paragraphs on the member's situation when they joined — what was concerning them, what they had tried, what brought them to Momentum.
  - **Section: What we did.** 4-paragraph description of the protocol — diet changes, exercise prescription, supplementation, any indicated medical interventions, lifestyle adjustments.
  - **Section: The data.** A series of 3–5 biomarker charts showing longitudinal change. Each chart: small SVG line chart, before/after values in tabular-nums, brief interpretation.
  - **Section: In their words.** A 2–3 paragraph quote in serif italic from the member, in their voice, about what changed for them.
  - **Section: What's next.** What the program is focused on for this member going forward.

### Page 4 — Insights (CMS Long-Form Education)

- **Hero:** "Insights." Tagline: "Practitioner notes on longevity science."

- **Index:** 2-column editorial layout. Featured article (latest) gets a 2-column hero. Subsequent articles in stacked list — date | category | title | byline.

- **Article Page:** 720px max content width. Hero: dateline tracked uppercase, serif H1 (38px), italic dek, byline with author photo. Body in 18px serif, 1.7 line-height. Drop-cap on first paragraph. Inline references to studies via superscript footnotes; full citations at article end with PubMed/DOI links. Charts inline (SVG line charts of relevant biomarker trends, supplemented by published-paper figure references).

- **CMS Collection "Insights":** Title, Slug, Hero Image, Author (reference to Medical Team), Publish Date, Category (Cardiovascular / Metabolic / Cognitive / Sleep / Hormonal / Practice News), Rich Text Body, Citations (rich text), Reading Time.

### Page 5 — Membership & Apply (Inquiry Funnel)

- **Hero:** "Membership."

- **Section: Detailed Tier Comparison.** A more substantial version of the homepage comparison — full feature lists per tier, FAQ-style notes ("What does 'comprehensive baseline' include?"), and a side-by-side comparison table.

- **Section: How to Begin.** 3-step process: 1. Schedule a discovery call. 2. Receive a tailored proposal. 3. Begin your baseline assessment.

- **Section: Application Form.** A formal application form with substantive fields:
  - Name, email, phone (combined section)
  - Age, location (which clinic — if multi-location practice)
  - "What are you hoping to address through Momentum?" (textarea — qualifies the prospect)
  - "Which membership tier interests you most?" (dropdown)
  - "When would you like to begin?" (dropdown: ASAP / Within 3 months / Within 6 months)
  - "Anything we should know in advance?" (optional textarea)
  - Submit button: sage, full-width.

- **Section: Couple Memberships.** A small block on couple memberships (typical 15% discount when joining together). 2-paragraph explanation.

- **Section: Frequently Asked.** Accordion of 8–10 high-friction questions: "Do you accept insurance?" (No — and explanation why concierge model exists), "How is this different from regular concierge medicine?", "What's the time commitment?", "What if I travel often?", "Can I keep my existing doctors?", "What about urgent care?".

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Biomarker Chart Animate-In (Scroll-Tied):**
- Element: SVG line charts in member outcome cards.
- Trigger: Scroll into view, 30% from bottom.
- Action: Chart line draws via `stroke-dasharray` / `stroke-dashoffset` animation, 1500ms total. The "before" value point appears, the line draws across the time axis, and the "after" value point pops in at the end.

**Trigger 2 — Stats Row Tabular-Nums Reveal (Scroll-Tied):**
- Element: 4-stat row below the hero.
- Trigger: Scroll into view.
- Action: Each stat fades in with 100ms stagger. Numbers do NOT count up — concierge medicine doesn't gamify data. Static reveal only.

**Trigger 3 — Member Story Card Hover (Restrained):**
- Hover (300ms ease-out): Card border thickens from 1px hairline to 1px sage. Subtle box-shadow appears. The "READ FULL STORY →" arrow translates 4px right.

**Trigger 4 — Drop-Cap Reveal (Page Load):**
- Element: First-paragraph drop-caps in editorial sections.
- Trigger: Fonts loaded.
- Action: Drop-cap fades in over 1000ms with `cubic-bezier(0.25, 1, 0.5, 1)`.

**Trigger 5 — FAQ Accordion (Click):**
- Click: Question row's child container `height: 0 → auto` over 350ms ease-out. Sage chevron rotates 90°.

**Trigger 6 — Form Field Focus (Editorial):**
- Field bottom-border thickens from 1px warm-dark to 2px sage. Label color-shifts to sage. Subtle but signals "engagement."

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with health namespace `mh-`. Examples: `mh-hero_stats`, `mh-biomarker_card`, `mh-member_story`, `mh-team_portrait`. Utilities: `u-tabular-nums`, `u-tracked-uppercase`, `u-text-sage`, `u-text-brass`, `u-italic-quote`, `u-serif-display`. Globals: `g-section_lg` (140px), `g-section_md` (96px), `g-container_text` (720px), `g-container_wide` (1280px).
- **Photography Discipline:** Three categories of photography, each with strict rules. (1) Member portraits: color, candid lifestyle, NOT corporate stock. (2) Medical team portraits: black-and-white, formal, signals medical-credentialing tradition. (3) Clinic environment: warm-lit, designed, NOT clinical-fluorescent. NEVER mix these treatments.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At 991px, member outcome cards collapse from 3-column to 2-column. Medical team grid from 4-column to 2-column. At 478px, all multi-column layouts stack vertically.

**How to Edit Content & CMS:**

- **Adding a Member Outcome:** CMS → Member Outcomes → New. Critical: only publish with explicit member consent (HIPAA compliance — the template includes a model consent form in the docs folder). First Name + Age + Occupation Pattern preserves privacy while building credibility. Headline Biomarker Change: format strictly as "Marker dropped from X → Y units over Z months" — specificity is the entire signal. Quote: 2 sentences in member's voice, NOT marketing copy.
- **Adding a Medical Team Member:** CMS → Medical Team → New. Portrait MUST be black-and-white, formal but warm — neutral background, business-formal attire, slight smile permitted (not stiff). Credentials in tracked uppercase format: "MD, FACP — INTERNAL MEDICINE & LONGEVITY" (use em-dash separators). Education: list each degree with institution and year. Board Certifications: list ABMS-recognized certifications with full names.
- **Posting an Insight:** CMS → Insights → New. Authors must be credentialed (clinic physicians or affiliated researchers). Body: write in clinical-but-accessible voice — comparable to *Peter Attia's blog* tone. Include real citations (PubMed PMIDs / DOIs). Charts inline are SVG — template provides a starter chart component that can be customized.
- **Updating Pricing:** Pricing is stored in a CMS Singleton "Membership Tiers" with fields per tier. Edit tier prices, descriptions, and feature lists here; site updates automatically. Critical: update both the homepage 3-tier section AND the dedicated Membership page simultaneously.
- **Discovery Call Scheduling:** The discovery call CTA links to an embedded Calendly or Cal.com widget. Configure the booking link in Project Settings → Custom Code (search for `// SCHEDULING WIDGET URL`). Recommend creating a dedicated booking type for "Momentum Discovery Call — 30 min" with senior physician availability.
- **Compliance & HIPAA:** Member outcome stories require signed consent. Template includes a model consent form (PDF). All forms on the site use HTTPS. Application form data routes to a HIPAA-compliant intake system (template ships with reference integrations for: Spruce Health forms, Healthie forms, or an authenticated Webflow Logic + encrypted Airtable setup). Coordinate with the practice's Compliance Officer before launch.
