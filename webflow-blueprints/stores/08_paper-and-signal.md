# Store 8: PAPER & SIGNAL

**Digital Product Focus:** Premium editorial PDF reports and industry research — typically 30–150 page documents priced $295–$2,500 per report. Single-purchase reports OR subscription tier ($1,500–$15,000/year) for institutional access. Examples: **Stratechery's Plus subscription**, **Not Boring's Pro tier**, **CB Insights research**, **Bessemer's State of the Cloud**, **Andreessen Horowitz's research portal**, **Forrester / Gartner's executive briefs**.

**Conversion Psychology & Strategy:** Research report buyers are operators, executives, investors, and consultants who NEED specific information to make business decisions. Conversion path: (1) they encounter the brand via free content (newsletter, blog, podcast) over months, (2) they hit a specific need (fundraise prep, market analysis, board deck research), (3) they search for high-quality data on the topic, (4) they buy the relevant report. The store must signal: this is journalist-and-analyst-grade research, NOT a glorified blog post. Specific data, original analysis, named sources, professional design.

The aesthetic register is *Stratechery / The Economist Intelligence Unit / McKinsey Global Institute* — editorial-serious, content-heavy, design-minimal but expensive-feeling. The PDF cover and design quality are critical conversion assets. NOT generic "ebook" templates, NOT a Stripe-buttonless landing page.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (60vh, editorial-led):**
  - Centered, max-width 800px. Top: small uppercase eyebrow ("PAPER & SIGNAL — RESEARCH ON [TOPIC]"). H1 in serif (`clamp(2.5rem, 5vw, 3.5rem)`): "Independent research on the [topic] economy." Below: 2-paragraph dek explaining the publisher's positioning ("Original research, deeply reported analysis. Read by operators, investors, and policymakers."). Two CTAs: primary "Browse all reports →", secondary "Subscribe to the newsletter" (ghost — newsletter signup).

- **Section: Featured Report (most recent / flagship):**
  - 2-column block. Left 40%: an image of the report's actual PDF cover — beautifully designed, 4:5 aspect, magazine-cover quality. Right 60%: report title (serif H2 36px), publication date, page count, brief 2-paragraph description of the report's findings, "Buy Report — $495 →" CTA, "Read free preview →" link (downloads first 10 pages as a free PDF).

- **Section: All Reports (catalog):**
  - Heading "ALL REPORTS." Below: a stacked editorial list (NOT a thumbnail grid — magazine-style). Each report:
    - Left 30%: small PDF cover thumbnail (3:4)
    - Center 50%: report title (serif H3, 24px), publication date, brief 1-paragraph description, page count + format details
    - Right 20%: price + "Buy →" CTA + "Free preview →" link
    - Hairline divider between reports
  - **CMS Collection "Reports":** Title, Slug, Cover Image (4:5), Publication Date, Page Count, Description (rich text), Long Description (rich text — for PDP), Free Preview PDF (file), Full PDF (gated file), Topics (multi-reference), Author Reference (multi-reference), Price, Display Order, Featured (boolean).

- **Section: Subscriptions (the high-LTV product):**
  - Heading "INSTITUTIONAL SUBSCRIPTIONS." 3-column tier comparison:
    - **INDIVIDUAL** — $1,500/year. All current and future reports. 1 user.
    - **TEAM** — $7,500/year. All reports + team Slack briefings. 5 users.
    - **ENTERPRISE** — $25,000+/year. Custom research access + analyst time + executive briefings. Unlimited users.
  - Each tier's feature list. Recommended tier (Team) visually elevated. CTA "Subscribe" or "Contact sales."

- **Section: How These Differ (value prop):**
  - 4-column block. Each column has a heading + 3-paragraph description:
    1. **ORIGINAL RESEARCH** — Every report includes original primary research (interviews, proprietary data analysis, custom surveys).
    2. **NAMED SOURCES** — Most reports include 15–40 named expert interviews. Sources verified, on-record where possible, anonymized only when essential.
    3. **DESIGN MATTERS** — Every report is designed for executive presentation. Charts that print well, typography that reads in long sessions, layouts that respect the reader.
    4. **NO SLOPPINESS** — Reports are fact-checked before publication. Errors corrected publicly with a transparent corrections log.

- **Section: Recent Press / Citations:**
  - Heading "CITED BY." A list of major publications, podcasts, and reports that have cited Paper & Signal's work. Each: publication logo (monochrome) + headline of the citation + date.

- **Section: Newsletter:**
  - Heading "FREE WEEKLY ANALYSIS." Newsletter signup with 1-paragraph description ("Industry analysis on [topic]. ~12K subscribers."). Email field + Subscribe button. The newsletter is the primary acquisition funnel — buyers subscribe for free for 6-18 months before purchasing reports.

- **Footer:**
  - 4 columns: Reports (Latest, By Topic, Free Previews, Archive) | Subscribe (Newsletter, Pro Subscription, Enterprise, Affiliate) | About (Editorial team, Methodology, Corrections, Press) | Contact (Email, Twitter, LinkedIn, RSS). Bottom: copyright + a small editorial commitment statement ("Paper & Signal is editorially independent. We accept no advertising. All revenue comes from subscriptions and report sales.").

### Product Detail Page (PDP) — the conversion-critical page

- **Hero:** 2-column. Left: PDF cover image (large, full-quality). Right: title (serif H1 40px), publication date, page count, format ("PDF + EPUB"), 2-paragraph description, primary CTA "Buy Report — $495", secondary "Read 10-page free preview" link.

- **Section: Table of Contents.**
  - Tracked uppercase header. Below: the report's full table of contents — every chapter, section, subsection. This signals depth + helps the buyer evaluate whether the report covers their specific question.

- **Section: Inside This Report.**
  - 3-column block summarizing key findings (without giving away the substance). Each column: a finding headline + 2-sentence teaser. Examples: "How the [industry segment] grew 240% YoY despite the macro slowdown" / "Why the dominant player's strategy is structurally vulnerable" / "Five companies positioned to take share over the next 24 months."

- **Section: Free Preview Excerpt.**
  - Embedded preview of the first 10 pages of the report — readable on the page (PDF.js viewer). Buyer reads enough to confirm quality + analytical depth before purchasing.

- **Section: About the Authors.**
  - Author bios. Each: small headshot, name, credential ("former [previous role]"), 2-paragraph bio describing their qualifications for this research. Critical for credibility.

- **Section: Methodology.**
  - 2-3 paragraphs describing the research methodology: data sources, interview process, analysis approach, validation steps. Methodology transparency dramatically increases buyer trust.

- **Section: Cited By / In Use.**
  - List of how the report has been used or cited externally — references in other publications, podcast discussions, executive briefings.

- **Section: Pricing.**
  - Single-buy: $495. OR included with subscription ($1,500/yr individual, $7,500/yr team). Subscription option is highlighted as the better value if buyer expects to need multiple reports.

- **Section: FAQ.**
  - Common questions: "How is this delivered?" / "Can I share this with my team?" (License terms) / "How does the subscription work?" / "Do you offer refunds?" / "Are there discounts for academic/nonprofit?"

- **Section: Other Reports.**
  - 3-card row of related reports.

### Cart & Checkout Experience

- **Direct-to-checkout (no cart):** Click "Buy Report — $495" → Stripe Checkout.
- **Stripe Checkout:** Email, name, billing address, payment method. Optional company name + VAT ID.
- **Instant delivery:** On payment success:
  - Email with PDF + EPUB download URLs (signed, 30-day expiration)
  - License document attached
  - "Account access" link to a Memberstack-gated library where the report is permanently available
- **For subscriptions:** Stripe subscription via subscription product. Subscribers get instant access to ALL reports past + future. Customer portal for managing subscription.
- **Confirmation page:** "Your report is ready" + clear next steps + support contact.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Gated Content Architecture

- The full PDFs are gated; only purchasers (or subscribers) can access them. Architecture:
- All PDFs hosted on Cloudflare R2 (or S3) with signed URLs.
- Webflow E-commerce / Stripe handles the transaction.
- On purchase webhook: serverless function generates a signed URL (30-day expiration), emails it to the buyer.
- "My Library" page (Memberstack-gated) shows all reports the user has access to; clicking generates a fresh signed URL each time.

### Step 2: Subscription Library Logic

- Subscriptions = full access to all past + future reports. Implementation:
- Stripe subscription product (yearly or monthly billing).
- On subscription start: Memberstack account upgraded to "Subscriber" group → "My Library" page shows ALL reports.
- New reports auto-published to Subscriber group.
- On subscription cancellation: Subscriber group removed → "My Library" only shows reports they've individually purchased.

### Step 3: Free Preview Distribution

- Each report has a "Free Preview" PDF (first 10 pages). Distribution:
- Email-gated: download the preview in exchange for email signup → enters newsletter funnel (this is the lead gen mechanism).
- Hosted on the same R2 bucket as full PDFs but on a different path (no signed URL needed — public).

### Step 4: Newsletter Integration

- Newsletter is the primary acquisition funnel. Integration:
- Webflow Forms → ConvertKit / Substack / Beehiiv API → email captured.
- Free preview download link sent to confirmed subscribers.
- Newsletter sequence: 5-email welcome → weekly editorial → quarterly report announcement.

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test purchase flow:** Buy each report in sandbox, confirm signed URL arrives within 60 seconds, confirm download works on macOS + Windows + Linux + iOS + Android. Confirm the EPUB version renders correctly in Apple Books, Kindle, etc.
- **Edge cases:**
  - Subscriber asks for a specific report PDF directly (not just access) → grant permanent access via Memberstack vs. subscription expiration scenarios
  - PDF link expires before customer downloads → "My Library" page handles re-download via Memberstack auth
  - Customer wants to share with team (without team subscription) → coordinate license terms; some publishers allow 1-3 internal shares per single report
  - Refund within 7 days → manual review; for subscriptions, prorated refund standard
- **PDF quality control:** Every PDF must be tested before launch — check pagination, chart legibility, hyperlinks, table of contents navigation, embedded fonts, file size optimization.

### Scaling & Analytics

- **Track these events:**
  - `view_report_pdp` (with report title)
  - `download_free_preview` (signal of high intent)
  - `read_free_preview` (track time spent in PDF.js viewer)
  - `complete_purchase` (with report, total)
  - `subscribe`
- **Conversion benchmarks:**
  - PDP view → preview download: 8-20%
  - Preview download → 30-day purchase: 5-15%
  - Newsletter subscriber → 12-month report purchase: 3-12%
  - Newsletter subscriber → subscription: 1-5%
- **Acquisition channels:**
  - **Newsletter** (primary) — drives 60-80% of revenue. Build for years.
  - **Twitter/X** — share insights from reports, drive newsletter signups.
  - **Podcasts** — guest appearances on industry podcasts drive massive subscriber spikes.
  - **Press citations** — when major publications cite reports, traffic spikes 10x. Pitch journalists actively.
  - **Affiliate program** — 30-50% commission for newsletter writers and industry voices. Drives 15-25% of revenue.
- **Pricing strategy:**
  - Free preview: always free (10-page samples)
  - Standard report: $295-595 (most common)
  - Comprehensive flagship report: $995-2,500 (1-2 per year, deep multi-quarter research)
  - Individual subscription: $1,500-2,500/year (1-3 reports/year + analyst access)
  - Team subscription: $5,000-15,000/year
  - Enterprise: $25,000-100,000/year (custom research + dedicated analyst)
- **Editorial calendar:** Publish 6-12 reports per year + 2-4 flagship deep-research reports. Weekly newsletter (free) + monthly paid bulletin (subscribers only). Annual industry-overview report ($995-1,995) is typically the highest-revenue single product.
- **Methodology disclosure:** Maintain a public methodology page describing research processes. Critical for institutional buyer trust. Update annually.
- **Press relations:** Build relationships with 20-50 industry journalists. Send embargo'd advance copies of major reports. Press citations are the primary brand-building lever — a single major citation (Bloomberg, FT, NYT) drives sustained traffic for months.
- **Pricing reviews:** Annual review. Top research publishers raise prices 10-30% annually as their reputation grows. Existing subscribers grandfathered or given limited-time renewal discounts.
