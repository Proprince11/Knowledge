# Template 13: OBSIDIAN PR

**Niche/Target Market:** Crisis PR, executive reputation management, and litigation communications firms — typically 5–25 person practices charging $25K–$250K monthly retainers. Specifically the *whisper firms* tier: Sard Verbinnen, Brunswick Group (the crisis arm), Edelman Crisis & Risk, Sitrick, Joele Frank. Audience is Fortune 500 General Counsels facing imminent crises (regulatory, litigation, executive misconduct, hostile activism), HNW individuals navigating personal reputation crises (often pre-litigation), and PE/VC firms managing portfolio company crises. Decisions are made under duress, in narrow timeframes, with maximum risk aversion. The website is reached via referral from a M&A lawyer or board member.

**Core Value Proposition & Aesthetics:**

The thesis: crisis PR firms must communicate one thing — *we will not embarrass you, we will not leak, we are the calmest people in the room when everyone else panics*. The visual register must signal absolute discretion. No marketing energy. No "client logos" on the homepage (clients of crisis firms are by definition not eager to be associated). No case studies (crisis work is confidential by definition). The site exists almost as a concession to digital expectation — but the *quality* of its restraint signals tier.

**Design System:**
- **Typography:** **Söhne** at 400 weight for everything. NO display fonts. NO bold weights anywhere. Type sizes deliberately small: H1 at 28px (small for a hero), body at 16px. Italics ONLY for legal case names (per legal convention). The website should read like a private memo, not marketing collateral.
- **Color Theory:** Pure black surface `#000000`. Off-white text `#F5F5F2`. Single accent: muted gold `#9B834C` — used only for links and the small monogram. NO bright accents. NO success/warning colors. The aesthetic is a closed door at midnight.
- **Visual Language:** Maximum visual restraint. NO photography (literally none — no team photos, no office photos, no decorative imagery). NO illustrations. NO icons. NO gradients. NO charts. The entire site is typography on a dark surface with hairline rules. The discipline is the message: this firm does not advertise. Every element is functional. White space is the dominant element.
- **Why $10K+:** Top crisis PR firms commission custom websites at $30K–$80K — Sard Verbinnen's site, Joele Frank's. The challenge is not flashy design — it's the right kind of *absence*. Most attempts at this register either go "boutique luxury" (which reads as marketing) or "law firm" (which reads as institutional). The actual register is somewhere in between — quieter, more anonymous, more discrete. This template provides the rare framework that captures it: real partner CMS, capabilities pages with no client names, contact paths optimized for high-trust referral inbound.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Quiet Door)

- **Hero (50vh, almost empty):**
  - Centered, max-width 720px. Top: small monogram (firm initials, gold, 32px serif). Below: H1 in regular weight (28px): "Strategic communications for moments that demand discretion." That's the entire headline. Below: 2-paragraph dek (3 sentences total) describing what the firm does in plain language. No CTA in hero. No buttons. The page invites you to scroll, not click.

- **Section: Capabilities (textual, restrained):**
  - Heading "CAPABILITIES" in tracked uppercase, gold, 12px. Below: a single column of capability descriptions. Each capability: name in 18px regular weight, 2-paragraph description below in body text. Hairline rule (1px gold at 30% opacity) between capabilities.
  - Capabilities listed:
    - **Crisis & Risk Communications** — Counsel during regulatory inquiries, litigation, executive transitions, and media-attention events. Strategy, message development, media management, and stakeholder communications.
    - **Executive & Personal Reputation** — Reputation strategy for executives, founders, and HNW individuals navigating litigation, divorce, succession, or public scrutiny.
    - **Litigation Communications** — Coordinated communications strategy with outside counsel during active litigation, regulatory enforcement, or activist campaigns.
    - **Activism Defense** — Counsel to public-company boards facing shareholder activism or hostile actors.
    - **M&A Communications** — Strategy and execution for sensitive transactions, hostile bids, or contested deals.

- **Section: Approach.**
  - Single column, 720px max-width. 4-paragraph essay describing the firm's working philosophy. Voice: declarative, slightly understated, almost terse. ("We do not pursue press. We rarely speak to reporters about our clients. We respond to attention; we do not invite it. We bill by the matter, not the hour. We staff matters with senior partners, not associate teams. Our engagements are confidential. Our client lists are not published. We do not provide references except by reciprocal introduction.")

- **Section: Senior Partners (textual only, no photos):**
  - Heading "SENIOR PARTNERS" tracked uppercase. Below: a stacked list of 4–7 senior partners. Each row: Name (18px regular weight, gold link to detail page), title in tracked uppercase ("MANAGING PARTNER" / "PARTNER" / "COUNSEL"), 1-line previous-affiliation note ("Previously: General Counsel, [Major Public Company]" / "Previously: Senior Editor, [Major Publication]" / "Previously: Press Secretary, [Federal Agency]"). Hairline divider between rows.
  - The previous-affiliation note is the entire pitch — these are people who came from positions of substance. NO bios on the homepage. NO photographs. The reader who needs to know more clicks through.
  - **CMS Collection "Senior Partners":** Name, Slug, Title, Previous Affiliation Summary (text — short), Bio (long text — for detail page), Areas of Focus (multi-reference), Contact Email, Display Order.

- **Section: Inquiries (the actual CTA, deliberately restrained):**
  - Heading "INQUIRIES" tracked uppercase. Below: 2-paragraph statement: "We accept new engagements primarily through referral. Counsel, board members, and existing clients may make introductions to [`partners@obsidian.pr`](#). Direct inquiries from individuals or organizations facing time-sensitive matters: please reach our managing partner directly via [`mp@obsidian.pr`](#). Press inquiries: [`media@obsidian.pr`](#)."
  - Three plain `mailto:` links. NO contact form. Crisis clients reach by phone or email; forms feel inappropriate for the urgency level.

- **Footer (minimal):**
  - Single row, three blocks: Office (London, New York, Washington — addresses listed) | Hours (24/7 availability noted) | Confidentiality ("Engagements are confidential. Communications with the firm are protected by relevant privilege where applicable."). Bottom: tiny copyright, no decorative elements.

### Page 2 — Capabilities Detail (per capability area)

- **Hero:** Capability name in 32px regular weight. Below: single-paragraph dek.

- **Section: How We Work in [Capability].**
  - 4-paragraph essay describing how the firm operates in this specific capability. Generic-sounding by design — specifics are kept private. The text describes patterns of work without describing any specific matter.

- **Section: Indicative Engagements.**
  - Critical section. The firm cannot list client names, so it lists *indicative* engagements as anonymized vignettes:
    - "Counseled a Fortune 100 industrial company through an SEC enforcement action involving alleged accounting irregularities. The matter resolved with a deferred prosecution agreement and minimal media coverage."
    - "Advised the founder of a venture-backed technology company during a personal SEC investigation. The matter resolved with a no-action letter and no public disclosure."
    - Each vignette is 2 sentences. Specific enough to demonstrate competence; anonymous enough to preserve discretion.
  - **CMS Collection "Indicative Engagements":** Capability (reference), Anonymized Description (rich text), Year, Display Order.

- **Section: Senior Counsel for This Capability.**
  - Stacked list of 2–4 partners who lead this capability. Same format as homepage senior partners section.

### Page 3 — Senior Partner Detail (per partner)

- **Hero:** Partner's name in 32px regular weight. Below: title in tracked uppercase.

- **Section: Previously.**
  - 4-paragraph career biography. Voice: factual, dispassionate, third-person. Reads like a *Wall Street Journal* "Who's Who" biographical entry. Specific titles, specific companies, specific years. NO photo of the partner. The work and credentials speak.

- **Section: Areas of Focus.**
  - Tracked uppercase header. Below: bulleted list of 4–6 areas of focus.

- **Section: Education & Bar Admissions.**
  - Tracked uppercase header. Below: degrees and bar admissions in formal format. (Many crisis PR partners are former lawyers.)

- **Section: Contact.**
  - Tracked uppercase header. Below: direct email + direct phone. Just plain text links. The senior partners are personally reachable.

- **CMS Collection (extended Senior Partners fields):** Education (rich text), Bar Admissions (text), Direct Phone, Direct Email, Areas of Focus (rich text — bulleted list).

### Page 4 — Insights (Sparse, Restrained)

- **Hero:** "INSIGHTS" tracked uppercase.

- The crisis PR firm publishes very little. The Insights page is sparse by design — 6–10 published pieces over multiple years, each substantial.

- **Index Layout:** Stacked list. Each entry: Year (left, tracked uppercase, 80px column) | Title (regular weight, gold link) | 1-line dek. Hairline dividers between entries.

- **Article Page:** 720px max-width. Hero: dateline tracked uppercase, regular-weight H1 (28px), no italic dek. Body in 17px sans-serif, 1.7 line-height. NO drop-cap. NO pull quotes. The visual restraint extends to article pages — the writing must stand on its own. Topics: regulatory communications strategy, litigation communications best practices, board governance during crises. NEVER about specific clients or recent events.

- **CMS Collection "Insights":** Title, Slug, Publish Date, Author (reference to Senior Partner), Body (rich text), Topics, Featured.

### Page 5 — Contact (Single-Page Funnel)

- **Hero:** "CONTACT."

- **Section: For Time-Sensitive Matters.**
  - 1-paragraph statement: "If you are facing an urgent matter requiring immediate counsel, contact our managing partner directly via the line below. We respond to time-sensitive inquiries within 60 minutes during business hours and within 4 hours outside business hours." Below: managing partner direct phone (formatted: "+1 212 XXX XXXX" — clickable `tel:` link), managing partner email (`mp@obsidian.pr`).

- **Section: For Standard Inquiries.**
  - List of functional emails: New engagements (`partners@`), Press (`media@`), Recruiting (`recruiting@`). Each as plain `mailto:` link.

- **Section: Office Locations.**
  - 3 blocks: London / New York / Washington. Each: full street address, main reception phone, hours of operation. Listed formally.

- **Section: A Note on Communication.**
  - 3-paragraph statement on how the firm handles communication: "We use encrypted email by default for all client communication. We accept communication via Signal, ProtonMail, or established secure channels. We do not communicate about active engagements via SMS, voicemail, or unsecured messaging. New clients are onboarded with a confidentiality protocol document detailing communication standards." This statement signals operational seriousness to crisis-aware clients.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Restraint as the System (Critical):**
- This entire site uses MINIMAL animation. NO scroll-tied transforms. NO hover state animations beyond basic underline thickening. NO page transitions. NO loading animations. The deliberate quietness IS the design statement.

**Trigger 2 — Hairline Divider Fade-In (Scroll-Tied, very subtle):**
- Element: Hairline gold rules between capability descriptions, senior partner rows, indicative engagements.
- Trigger: Scroll into view.
- Action: `opacity: 0 → 1` over 1500ms (slow, intentional). NO width animation. NO transform. Pure opacity. Restraint at its most precise.

**Trigger 3 — Link Hover (Subtle):**
- Element: All gold links throughout the site.
- Hover (300ms ease-out): Link `text-decoration-thickness: 1px → 1.5px`. Color stays gold. NO other animation.

**Trigger 4 — Page Load Subtle Fade (One Animation Total):**
- On initial page load: entire page content fades from `opacity: 0 → 1` over 600ms with linear easing. Single page-level animation. After that: nothing animates beyond hover states.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with discreet namespace `ob-`. Examples: `ob-capability_row`, `ob-partner_card`, `ob-engagement_anonymized`, `ob-divider_hairline`. Utilities: `u-tracked-uppercase`, `u-text-gold`, `u-italic-citation`. Globals: `g-section_lg` (160px), `g-section_md` (96px), `g-container_text` (720px), `g-container_index` (960px).
- **Visual Discipline:** This template's value depends on *what is removed*. Every addition risks corrupting the register. NEVER add: photography, decorative graphics, hover state transforms, page transitions, animated icons, scroll indicators, social media links, newsletter signups (all read as marketing). The user is on this site under stress; the absence of marketing energy is itself reassuring.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Layouts are single-column at all breakpoints — there are no 2-column or 3-column grids to collapse. Type sizes scale via clamp() but stay restrained at all sizes.
- **Confidentiality in Layout:** No element should be recordable as "screenshot-worthy social media content." This is partly accomplished by design (no big visuals) and partly by avoiding any branded "moments" that crisis-aware clients would worry about being shared.

**How to Edit Content & CMS:**

- **Adding a Senior Partner:** CMS → Senior Partners → New. NO photograph required (or even appropriate). Previous Affiliation Summary: 1-line factual statement of the most credibility-establishing previous role. Bio: 4 paragraphs, factual third-person prose. Education: list each degree with institution and year. Bar Admissions if applicable.
- **Posting an Indicative Engagement:** CMS → Indicative Engagements → New. CRITICAL: completely anonymize. NEVER include details that would allow identification — specific industry sub-sectors, specific time periods, specific transaction values, specific regulatory agencies. Voice: passive, factual, terminology-precise. Coordinate with the firm's General Counsel before publishing any indicative engagement.
- **Posting an Insight:** CMS → Insights → New. RARE EVENT — most months no new insights are published. Topics must be GENERAL (regulatory communications strategy, litigation communications best practices, board governance during crises) — NEVER about specific clients, recent matters, or current events that might be associated with the firm's clients. The publication cadence itself is a reputation signal: scarcity = quality.
- **Updating Office Information:** Offices stored as a CMS Singleton. Critical: managing partner direct phone and email on the contact page must be ACTUAL working channels — clients reaching this firm typically reach in moments of urgency. The managing partner (or their executive assistant) must monitor these channels in near-real-time.
- **Communication Protocol Document:** Referenced in the Contact page but not displayed. The firm should provide this document to onboarded clients separately. Template includes a sample protocol document (PDF) in the /docs folder describing encryption standards, communication channels, and operational security practices.
- **Critical Operational Note:** This template's deployment requires coordination with the firm's IT/security advisors. Recommend: HTTPS-only, proper SPF/DKIM/DMARC for the email domain, monitoring for credential leaks on the firm's domain, encrypted DNS, and regular security review. The visual restraint signals discretion; the technical operational rigor must match.
