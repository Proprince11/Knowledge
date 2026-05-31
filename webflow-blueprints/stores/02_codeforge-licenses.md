# Store 2: CODEFORGE LICENSES

**Digital Product Focus:** Premium developer tools sold as **per-seat or usage-tier licenses** with automated license-key delivery — typically command-line tools, IDE plugins, terminal frameworks, deployment SDKs, or specialized analytical libraries. Price points $99–$2,499 per license, sometimes with annual maintenance/upgrade fees. Examples of analogous products: **Tower** (Git client), **Charles Proxy**, **Kaleidoscope**, **TablePlus**, **Postico**, **Soulver Tools**, **ProxyPin**.

**Conversion Psychology & Strategy:** Developers buying premium tools are evaluating the tool against a free alternative. The conversion path hinges on three things: (1) **the tool obviously works** — interactive demos, video walkthroughs, real screenshots showing features, (2) **the licensing terms are immediately clear** — single-user, per-seat, perpetual vs. subscription, what happens in a year, (3) **the developer can try first** — free trial with no credit card. Friction in the trial-to-purchase conversion is high; making the purchase itself frictionless (Stripe Checkout, instant license key, no waiting) is essential.

The aesthetic register is *technical product page* with developer-credible polish — neither corporate-SaaS nor indie-hobbyist. Closer to **Linear**, **Raycast**, **Arc** in visual register, but shipping its own product (not pitching VC).

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog (single-product or multi-product)

- **Hero (60vh, product-led):**
  - 2-column layout, 50/50. Left: product name in heavy display sans (`clamp(2.5rem, 5vw, 4rem)`), 1-line tagline ("The diff tool engineered for monorepo workflows."), 2-paragraph dek explaining what the tool does and who it's for. Two CTAs: primary "Buy License — $129" (with a Stripe-style filled button), secondary "Download Free Trial" (ghost button — 14-day full-feature trial). Below CTAs: tiny note "Instant license key delivery. macOS / Windows / Linux."
  - Right: A high-quality screenshot of the tool in actual use. Static image OR an animated GIF showing a key feature (5-10 seconds, looped). Background is dark to make the product UI pop (e.g., a slate-900 surface).

- **Section: Feature Bento (6-cell asymmetric):**
  - Heading "WHAT IT DOES." Below: an asymmetric bento grid showing 6 features:
    - Cell A (2×2 hero): A 30-second product demo loop — actual screen recording of the tool's most impressive feature, looping autoplay, no audio. Caption below.
    - Cell B (1×1): A specific metric or capability — "Compares 200K-line diffs in <2 seconds"
    - Cell C (1×1): Integration logos (VS Code, IntelliJ, Sublime, Neovim, terminal)
    - Cell D (2×1): A code snippet showing a key CLI usage with syntax highlighting
    - Cell E (1×1): A keyboard shortcut visualization
    - Cell F (1×1): A "Just shipped: [latest feature]" callout
  - Cards have 1px borders, slight rounded corners (8px), hover lifts slightly.

- **Section: Trusted by developers at:**
  - Heading + a row of 8-10 monochrome company logos (60% opacity). The buyer wants to see "real developers use this at real companies."

- **Section: Pricing (the conversion section):**
  - Heading "LICENSING." 3-tier pricing layout (typical):
    - **PERSONAL** — $129 one-time. 1 user, 3 devices. Perpetual license, 1 year of free updates. After year 1: $39/year for continued updates.
    - **TEAM** — $99/seat/year. 5+ seats. Includes maintenance + updates + priority support. Annual subscription.
    - **ENTERPRISE** — Custom. Volume pricing 50+ seats, custom SSO, dedicated support, SOC 2 compliance documentation. Contact sales.
  - Pricing cards with clear feature checklists. Most-purchased tier (Team) visually elevated.
  - Below pricing: small FAQ-style notes addressing common objections: "What happens if I don't renew updates?" / "Can I move the license to a new computer?" / "Do you offer educational discounts?" / "Can I get a refund?"

- **Section: Testimonials (developer-credible):**
  - Heading "WHAT DEVELOPERS SAY." 3 testimonial cards. Each: a photo (real, not stock), name + role + company, a 2-3 sentence quote that's specifically TECHNICAL (not generic praise). Example quote pattern: "I used [competitor] for years. Switched to [product] when our monorepo grew past 500K LOC. The diff performance is genuinely 4x faster, and the keybindings are saner."
  - Twitter/X testimonials embedded as styled quotes (with @handle, retweet count) read more authentic than typical testimonial blocks.

- **Section: Documentation Preview:**
  - Heading "DOCUMENTATION." A small block linking to the public docs with 3-4 highlighted starter guides. Developers who skim docs before buying are higher-intent.

- **Section: Changelog:**
  - Heading "RELEASE NOTES." Below: 3 most recent releases with version numbers, dates, and brief highlight bullets. Developers parse changelogs to confirm the product is actively maintained — STRONG buy signal.

- **Section: Final CTA:**
  - Centered. Heading: "Try [Product] for 14 days." 2 sentences. Two CTAs: "Download Free Trial" + "Buy License — $129."

- **Footer:**
  - 4 columns: Product (Features, Pricing, Roadmap, Changelog) | Resources (Documentation, API reference, Status, Bug bounty) | Company (About, Blog, Press, Contact) | Legal (Privacy, Terms, EULA, Refund policy). Bottom: copyright + "Made by [N] developers in [City]."

### Product Detail Page (PDP)

For multi-product catalogs (where the same store sells multiple developer tools), each product gets its own PDP. For single-product stores, the homepage IS the PDP. PDP structure for multi-product:

- **Hero:** Product name, 1-line tagline, hero screenshot, primary CTA "Buy License — $X."
- **Section: Feature Walkthrough.** A vertical scroll of feature blocks. Each block: 50/50 layout — feature description left, screenshot/animation right. Alternates left/right per feature.
- **Section: How It Compares.** A side-by-side table comparing the tool against 2-3 alternatives (often free competitors). Honest comparison; the buyer is going to do this comparison anyway, so doing it transparently builds trust.
- **Section: Pricing.** Same 3-tier structure as homepage.
- **Section: FAQ.** Accordion of objection-handling questions.

### Cart & Checkout Experience

- **Direct-to-checkout (no cart drawer):** Click "Buy License — $129" → goes directly to Stripe Checkout (or a Webflow E-commerce checkout). Why no cart? Most developer-tool buyers buy ONE product per transaction; the cart drawer adds friction without value.
- **Stripe Checkout (recommended):** Use Stripe's hosted checkout (one of the most-trusted payment surfaces among developers). Configure to collect:
  - Email (delivery + license)
  - Billing address (tax purposes, VAT handling)
  - Payment method (cards, Apple Pay, Google Pay, Link)
  - Optional: Company name + VAT ID (B2B buyers)
- **License delivery:** Immediate. The moment Stripe confirms payment, a webhook triggers license-key generation + email delivery. Buyer sees a "Success! Your license has been emailed to [email]" confirmation page.
- **Confirmation page:** Includes: license key (visible, copyable), download link, getting-started guide, support contact. Developers expect to be self-serving from here.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: License Key Generation Architecture

- **Two architecture options:**

**Option A: Webflow + Lemon Squeezy (recommended for simpler setups)**
- Use Lemon Squeezy as the merchant-of-record + license server. Lemon Squeezy handles VAT/tax (huge for international sales), automated license key generation, and email delivery. Webflow E-commerce module disabled; instead, "Buy License" buttons link directly to Lemon Squeezy checkout URLs.
- Pros: Zero VAT compliance burden, license keys auto-generated, refund/dispute handling included.
- Cons: 5% + payment fees (vs. 2.9% Stripe direct).

**Option B: Stripe Checkout + Custom License Server (recommended for higher-volume)**
- Webflow E-commerce module enabled with Stripe payment processing. Webhook on `payment_succeeded` triggers a serverless function (Cloudflare Workers / Vercel Functions / Netlify Functions) that:
  1. Generates a license key (template ships with a working JS snippet using HMAC-signed payload + UUID for uniqueness).
  2. Stores the license in a database (recommended: Supabase or Airtable).
  3. Sends a transactional email via Resend/Postmark/SendGrid with the license key.
- The license key validation endpoint is a separate API the actual product calls to validate licenses.
- Pros: Lower fees, full control over license logic.
- Cons: VAT compliance becomes the seller's responsibility (use a service like Quaderno, Octobat, or TaxJar to automate).

### Step 2: License Key Validation API

- The product itself (the desktop app or CLI tool) needs to validate licenses. Standard architecture:
- Endpoint: `POST /api/v1/license/validate` with `{ license_key, machine_id }`
- Returns: `{ valid: true, expires_at: '2026-12-31', features: [...], owner_email: '...' }` or `{ valid: false, reason: 'expired' | 'revoked' | 'invalid' | 'machine_limit_exceeded' }`
- Implementation: Cloudflare Workers + KV store (or Supabase + Edge Functions). Template ships with a working reference implementation in `/license-server/`.
- **Machine limit enforcement:** Each license key can be activated on N devices (typically 3 for personal). Activations stored as `{license_key, machine_id, activated_at}` rows; product calls validation API on first launch with `machine_id` (a hash of MAC address or hostname).

### Step 3: Trial-to-Purchase Conversion

- Free trial implementation:
- Product downloads include a 14-day trial — no signup, no credit card, just download and run. Trial timestamp stored locally.
- Product checks license periodically; on day 14, prompts "Trial expired. Buy a license to continue."
- The product's "Buy License" button opens the store's PDP. **Critical:** include a UTM parameter (`?utm_source=trial-expired`) so the store can track trial-to-purchase conversion rates.
- Trial-to-purchase rates for premium developer tools range from 5-25% depending on quality and pricing.

### Step 4: Update Distribution & Maintenance

- **Auto-updates** within the product itself (Sparkle for macOS, Squirrel for Windows). The store doesn't handle distribution of updates — that's done via the product's own update channels.
- **Update entitlement check:** The license validation API returns whether the user is entitled to the latest version (based on whether their maintenance period is current). Products older than the entitled version still work; the user is prompted to renew maintenance to access the new version.
- **Renewal flow:** When maintenance expires, the product shows a banner "Your maintenance has expired. Renew for $39/year to continue receiving updates." Click → routes to a renewal Stripe checkout pre-populated with the user's email.

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test the full purchase flow:** In test/sandbox mode, place orders at every pricing tier. Verify license keys generate correctly. Confirm emails arrive within 60 seconds of purchase. Test the license-validation API with the generated keys against a test build of the product.
- **Edge cases to test:**
  - Failed payments (decline scenarios) — does the user receive an apologetic email with retry instructions?
  - Refund flow — when a refund is issued in Stripe, does the corresponding license get revoked? (Recommended: yes, via webhook on `charge.refunded`).
  - License key recovery — buyer who lost their license email can recover via "Resend License" form (email-based authentication).
  - Cross-platform license (one purchase, used on macOS + Windows + Linux) — does the validation API correctly count distinct machine activations?
- **VAT compliance:** Critical for international sales. EU buyers (B2C) must be charged VAT at their country's rate. EU B2B buyers with valid VAT IDs can use reverse charge. Lemon Squeezy handles this automatically; if using Stripe direct, integrate Quaderno or TaxJar to compute and remit VAT.

### Scaling & Analytics

- **Track these specific events:**
  - `download_trial` — fired when free trial download is initiated
  - `view_pricing` — fired on pricing page load
  - `begin_checkout` — fired on checkout entry
  - `purchase_complete` — fired on successful purchase (with tier, price, country as parameters)
  - `license_activated` — fired by the product on first launch with a valid license (signals real activation, not just purchase)
- **Conversion funnel analysis:**
  - Trial download → trial activation rate (good: 70%+)
  - Trial activation → purchase rate (good: 10-25% for premium tools)
  - Purchase → product activation rate (good: 95%+)
  - Drops at any stage indicate specific friction (UX in onboarding, pricing objections, payment processing issues)
- **Pixel integration:** Google Analytics 4 (with `purchase` event), Meta Pixel for retargeting trial users, Twitter/X Pixel if running developer-focused ads. Add custom code via Webflow Project Settings.
- **Updating product features:** Each major release updates the homepage Feature Bento (CMS-driven). Each release adds an entry to the Changelog CMS. Both are visible to potential buyers and signal active development.
- **Customer support:** Helpscout, Front, or a dedicated email (`support@`) for license issues + product support. Developer customers expect technical responses, not generic CX scripts. Recommend: support is handled by an actual engineer, not a generalist.
- **Refund policy:** 30-day no-questions refunds. The cost of a few refunds is much less than the cost of bad reviews. Developers who refund usually do so within 24-48 hours of purchase if the tool doesn't fit their workflow — let them go cleanly.
- **Annual review:** Once a year, review pricing tiers vs. competitor pricing AND vs. customer LTV. Most premium developer tools should raise prices annually (by 5-10%) — the buyers don't notice, and the LTV math works.
