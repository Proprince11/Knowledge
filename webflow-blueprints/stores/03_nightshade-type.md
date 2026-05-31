# Store 3: NIGHTSHADE TYPE

**Digital Product Focus:** Independent typeface foundry — sells custom-designed display, text, and variable typefaces with proper licensing tiers (Desktop / Web / App / Broadcast). Type families typically priced $40–$400 per weight, $200–$2,000 for full families. Licensing is multi-tier and complex (per-domain limits for web fonts, registered-user counts for app fonts). Examples of the register: **Pangram Pangram**, **Bold Monday**, **Klim Type Foundry**, **Pentagram's Lineto**, **Future Fonts**, **Display Type**.

**Conversion Psychology & Strategy:** Type buyers are designers (working professionals at agencies, brands, or studios) who care deeply about type quality. The conversion path: (1) they see the type in use somewhere (a project, a portfolio, a social post), (2) they discover the foundry, (3) they evaluate the typeface — testing it in their own copy, examining OpenType features, downloading specimens, (4) they buy a license appropriate to their use case. The store must support this workflow at every stage with extreme typographic care — the typography of the *store itself* is part of the product evaluation.

The aesthetic register is *type specimen book + foundry website* — Klim's site is the gold standard. Heavy use of the foundry's own typefaces in dramatic display sizes. Specimen layouts that demonstrate the type's range. Interactive type testers where designers can input their own copy. NO stock imagery. NO marketing fluff. Pure type, demonstrated at scale.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (90vh, type-led):**
  - The hero IS a typeface. A single character or word displayed at gigantic size in the foundry's most distinctive typeface. Direction: a single letterform like "K" filling the entire viewport at clamp(20rem, 50vw, 50rem) — let the character be the brand.
  - Below or beside: small foundry name in a different typeface, tracked uppercase. A 1-line tagline: "A type foundry from [city]. Est [year]." Below: 2-paragraph about what the foundry makes. Two text links: "Browse typefaces →" and "Latest release →" (the just-released typeface gets the "latest release" link).

- **Section: Featured Typefaces (asymmetric specimen grid):**
  - Heading "TYPEFACES" tracked uppercase. Below: an asymmetric specimen grid. Each specimen is a "card" showcasing one typeface. Layout per card alternates radically:
    - Card 1: A single massive word in the typeface (full-width).
    - Card 2: A 2-column block — left shows a paragraph of text in the typeface, right shows the typeface name + designer + year + price.
    - Card 3: An animated pangram (the text remains the same, but the type's variable axes oscillate — slow animation showing the typeface's range of weights or widths).
    - Card 4: A character map style display — the alphabet shown in the typeface at moderate size.
  - Each card links to that typeface's PDP. Hover: subtle cursor change suggests "click to explore."
  - **CMS Collection "Typefaces":** Name, Slug, Designer, Year Released, Description (rich text), Display Specimen Type (option set: Single Word / Paragraph / Variable Animation / Character Map), Hero Specimen Image (or text content), Weights & Styles (rich text — list), OpenType Features (rich text), Pricing (multi-reference to Pricing Tiers), Featured (boolean), Display Order.

- **Section: In Use (real-world applications):**
  - Heading "IN USE." Below: a grid of designer-submitted projects using the foundry's typefaces. Each tile: project image (book covers, posters, branding work, magazine spreads), project credit (designer name + project name), typeface used. Click → larger view with full credits.
  - This section is critical — it shows the type "in the wild" and demonstrates that real designers buy and use the work. Gold-standard foundries actively curate this section.
  - **CMS Collection "In Use":** Project Name, Designer/Studio, Image, Typefaces Used (multi-reference), Year, Project URL.

- **Section: Latest Release.**
  - When a new typeface drops, this section becomes the focal point of the homepage. A dedicated block: large display of the new typeface's signature glyph or word, name + designer + release date, 2-paragraph description of what the typeface is and why it was made, "Buy now →" link. Surfaces only for ~3 months after release; then rotates to a different featured typeface.

- **Section: About the Foundry.**
  - 720px max-width centered. 4-paragraph essay on the foundry's history, design philosophy, and process. Set in one of the foundry's own typefaces at body-text scale. Restrained, slightly intellectual voice.

- **Section: Custom Type & Licensing Inquiries.**
  - 2-paragraph note that the foundry takes on custom commissions for brands and studios. Email link `studio@nightshadetype.com`.

- **Footer:**
  - 4 columns: Typefaces (links to each typeface's PDP) | Foundry (About, Designers, In Use, Custom work) | Resources (Specimens, License terms, FAQ, EULA) | Contact (Email, Studio location, Newsletter). Bottom: copyright + a typeface attribution ("Set in [Foundry's Sans] and [Foundry's Display].").

### Product Detail Page (PDP) — the most important page

- **Hero:** Typeface name in massive display (the typeface displaying its own name — the meta-flex). Below: designer + year + 1-sentence description.

- **Section: Specimen Gallery (the heart of the PDP):**
  - A series of 6-10 specimen layouts showing the typeface in different contexts: large display, paragraph text, all-caps, italic, with numerals, with OpenType features active, in different weights. Each specimen is a beautifully composed layout — these specimens are the foundry's actual design work demonstrating the type's range.

- **Section: Interactive Type Tester:**
  - A live tester where designers can input their own copy, change weight/style, and see how the typeface performs with their text. UI: text input field + weight/style selector + size slider + (for variable fonts) variable axis sliders + alignment + line-height. The text is rendered in real-time using the typeface's web font.
  - This is the SINGLE most important conversion tool on the PDP. Designers absolutely will use it; if it's slow, glitchy, or limited, they don't buy.
  - Implementation: the typeface's WOFF2 file is loaded (a trial version with limited character support, watermarked, or limited to a non-commercial use license). The tester renders text via standard CSS.

- **Section: Character Set & OpenType Features:**
  - A section showing the complete character set: uppercase, lowercase, numerals, punctuation, special characters, ligatures, alternates, fractions, etc. Designers need to confirm the typeface has the characters they need.
  - Below: list of OpenType features available (`liga` Standard Ligatures, `dlig` Discretionary Ligatures, `salt` Stylistic Alternates, etc.) with examples showing what each feature does. Toggle each feature on the previewed text.

- **Section: Designer's Notes:**
  - 720px max-width centered. 3-5 paragraph essay by the typeface's designer about what they were trying to do with the design — its origins, references, what makes it distinctive. Reads like an artist statement. Drop-cap on first paragraph.

- **Section: Pricing & Licensing.**
  - The conversion section. Pricing tiers presented as a clean table:
    - **DESKTOP** — $40 per weight / $200 family. For installation on personal computers for design work.
    - **WEB** — $80 per weight (up to 100K monthly visitors) / $40 additional for each 500K visitors / $400 family. Self-hosted web font usage.
    - **APP** — $200 per weight / $1,000 family. For embedded use in apps (iOS, Android, desktop apps). Per-app license.
    - **BROADCAST** — Custom pricing. For TV/film/streaming use.
    - **TRIAL** — Free download. Watermarked + restricted character set. For evaluation only.
  - Each tier expandable to reveal full license terms. Clear "What can I use this for?" answers.
  - Buy buttons: per-style buy ("Buy Light" / "Buy Regular Italic") or "Buy Full Family" (deeper discount). Selecting variants adds to cart.

- **Section: Licensing FAQ.**
  - 8-10 common licensing questions: "Can I use this on multiple computers?" / "What if my web traffic exceeds the tier?" / "Do I need a license per project or per company?" / "Can I embed this in a PDF?" / "What about a logo?"

- **Section: In Use (filtered):**
  - Projects that use this specific typeface. Same format as homepage section but filtered.

- **Section: Other Typefaces by [Designer]:**
  - 3-column row of related typefaces by the same designer or in a similar style.

### Cart & Checkout Experience

- **Cart drawer (right slide-in):** Triggered on "Buy" click. Shows: typeface(s), styles selected, license tier per typeface, price. Editable license tier from cart (designer realizes they need Web instead of Desktop — can swap easily). Subtotal at bottom + "Checkout" button.

- **Checkout (single page):** Stripe Checkout (or Webflow E-commerce). Required fields:
  - Email
  - Name (the licensed entity — could be individual or company)
  - Company name + size (dropdown: Solo / 2-10 employees / 11-50 / 51-250 / 250+) — this drives pricing for some tiers (Web font tier scales with company size at some foundries)
  - Billing address (VAT)
  - Payment method
- **License delivery:** Within 60 seconds of purchase, an email arrives with:
  - License agreement PDF (specific to the buyer, includes the buyer's name + entity)
  - Download links for the typeface files (OTF, WOFF2, variable font files where applicable)
  - Typeface specimen PDF
  - Getting started guide
- **License terms:** Every license is "perpetual for the licensed use" — no annual fees, no usage tracking. Industry-standard for type foundries.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Variant Architecture for Multi-Tier Licensing

- Each typeface is a Webflow E-commerce product with **TWO variant axes**:
  - **Style** (Light / Light Italic / Regular / Regular Italic / Medium / Bold / etc.)
  - **License Tier** (Desktop / Web / App / Broadcast)
- This generates a matrix: e.g., 8 styles × 4 license tiers = 32 variants per typeface.
- Cart line items track style + license tier per item.
- **Family pricing:** Add a "Buy Full Family" SKU as a separate product entry that bundles all styles at a discount. Webflow product variants support this via a "Family Bundle" boolean field.

### Step 2: License Document Generation

- On purchase completion, a webhook triggers a serverless function (or Make.com / Zapier flow) that:
  1. Reads order details (typeface, styles, license tier, buyer name + entity)
  2. Generates a custom-named license PDF using a templated document service (DocsAutomator, PandaDoc, or PDFShift)
  3. Bundles the PDF with the typeface files (OTF, WOFF2, variable font) into a downloadable ZIP
  4. Hosts the ZIP on a private CDN or signed-URL service (Cloudflare R2, AWS S3 with presigned URLs)
  5. Sends an email to the buyer with the download URL (24-hour expiration)
- License document language is the foundry's standard EULA with the buyer's specific entity inserted. Template includes a sample EULA in the docs folder.

### Step 3: Trial Font Distribution

- Trial fonts are restricted: limited character set, watermarked, and licensed only for non-commercial evaluation. Distributed via the same store, but as a $0 product that's added to "cart" → "checkout" → email delivery (collects the buyer's email for follow-up marketing).
- Implementation: a separate "Trial Fonts" CMS collection. Each typeface has a "Trial Font File" reference pointing to the restricted WOFF2.
- Buyer-facing experience: "Download Trial — Free" button on each PDP. One-click download (after email collection).

### Step 4: Web Font Hosting Toggle (advanced)

- Some foundries offer hosted web font delivery as part of the Web license (the foundry hosts the font, the buyer's site references a URL). Implementation:
- After purchase of a Web license, the buyer gets a unique font URL (e.g., `https://fonts.nightshadetype.com/[license_id]/typeface.woff2`). The buyer adds this URL to their CSS `@font-face` rule.
- Backend tracks usage per license (monthly visitor count via referrer-based tracking). If the buyer exceeds their tier, they receive an email to upgrade.
- This is operationally complex; most independent foundries prefer self-hosted Web licenses (buyer hosts the font themselves). The template ships with both options documented.

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test the full purchase flow** with each license tier. Confirm license PDFs generate correctly with proper buyer-name insertion. Confirm trial fonts work as expected (limited character set, watermarked).
- **Edge cases:**
  - Buyer enters wrong company name → support flow to update license document and reissue
  - Web license tier exceeded → email automation to prompt upgrade
  - Buyer requests refund → typically refused within 7 days post-download, but case-by-case for technical issues
  - Buyer requests transfer of license → standard practice is allow transfer with $50 administrative fee
- **EULA versioning:** Maintain version history of the EULA. License documents must reference the EULA version active at time of purchase. Major EULA changes (e.g., Web tier visitor limits change) apply only to NEW purchases — grandfather existing licenses.

### Scaling & Analytics

- **Track these events:**
  - `view_typeface` — fired on PDP load (with typeface name, designer)
  - `download_trial` — fired on trial download
  - `use_type_tester` — fired when designer types in the live tester (with text length, weight changes)
  - `add_to_cart` — fired with style + license tier
  - `purchase` — fired on completion (with typeface, family vs. style, total price, license tier)
- **Conversion signals:**
  - Trial download → 30-day purchase rate (good: 8-15%)
  - Type tester usage > 30 seconds → strong purchase signal
  - PDP scroll-depth past Specimen Gallery → mid-funnel signal
- **Designer outreach:** Curate "In Use" submissions actively. Email designers who have purchased and request project images for the In Use section. Builds the social proof and creates ongoing flywheel.
- **Newsletter:** Type designers and design directors subscribe to type foundry newsletters at high rates (5-15% CTR). Use the newsletter to announce new releases (always the highest-converting moment), specimen updates, and "In Use" features.
- **Pricing reviews:** Annual pricing review — most foundries raise prices 5-15% annually as their reputation grows. New typefaces typically launch at slightly-elevated pricing to anchor the foundry's tier.
- **Specimen PDFs:** Beyond the website, generate beautiful printed specimen PDFs for each typeface — these are sent to design press (Eye Magazine, Type Specimens, It's Nice That) and to design directors at major studios as marketing.
- **Custom commissions:** The most lucrative revenue stream for established foundries. The website's "Custom Type & Licensing Inquiries" link routes to a separate inquiry form for custom typeface commissions ($30K-$300K+ projects). These are managed outside the store as bespoke engagements.
