# Store 1: ATELIER PRINTS

**Digital Product Focus:** Limited-edition fine-art photography prints — typically 25–100 numbered editions per image, signed and certificated, priced $400–$3,000 per print. Sold by independent photographers, small galleries, or photographer-collectives. Physical fulfillment (museum-grade printing + framing partners) but the *transaction and authentication* live in the digital store.

**Conversion Psychology & Strategy:** Limited-edition print buyers are art collectors making investment-tier decisions. They are NOT impulse buyers — the average consideration time is 3–6 weeks, and they research extensively before purchasing. The store must signal three things: (1) **scarcity is real** — edition counts are visible and decrementing as prints sell, (2) **provenance is documented** — every print ships with a Certificate of Authenticity numbered and signed, (3) **the photographer is real** — biography, exhibition history, press, and a clear artistic vision are present. Friction in the buying process is acceptable (and even desirable — it filters serious buyers from impulse buyers and signals that this is not a poster shop).

The aesthetic register is *gallery website* (Sean Kelly Gallery, David Zwirner Online, Pace Gallery's print sales). The dominant element is the photography itself, displayed at scale, with restrained typography and generous whitespace. NO discount codes. NO "Sale" pricing. NO urgency banners. The lack of e-commerce conversion vocabulary IS the signal.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (75vh, single image):**
  - One photograph. Filling the upper viewport. The photographer's most monumental image — typically the strongest fine-art piece in the current catalog. Below the image: small caption in tracked uppercase ("'OBSIDIAN MORNING' — ICELAND, 2024 — EDITION OF 25"). Click the image: routes to the print's PDP.
  - No hero text overlay. No CTA. The image IS the homepage.

- **Section: Current Editions (asymmetric editorial grid):**
  - Heading "CURRENT EDITIONS" tracked uppercase. Below: an asymmetric grid of available prints. Layout: alternating rows of single full-width images and 2-image side-by-side. Each image: 4:5 or 16:9 aspect, generous whitespace surrounding. Below each image:
    - Print title (serif, 22px)
    - Year + location ("ICELAND, 2024" tracked uppercase caption)
    - Edition info (tracked uppercase: "EDITION OF 25 — 8 REMAINING")
    - Starting price ("FROM $850 — UNFRAMED, 16×20 INCHES")
  - Hover the image: subtle scale 1.02 over 800ms. Edition information sharpens (opacity 70% → 100%). Click → PDP.

- **Section: The Photographer:**
  - 2-column block. Left: a single black-and-white portrait of the photographer (4:5 aspect). Right: 4-paragraph artist statement / biography. Reads like an artist profile in *Aperture Magazine*. Drop-cap on first paragraph. Below bio: a small list of "EXHIBITED AT" with 4-6 venue names (gallery names, museum group shows). The legitimacy signal.

- **Section: How Editions Work:**
  - 3-column explainer:
    1. **EDITION** — Each photograph is produced in a strict edition (typically 25 prints). Once the edition sells out, no further prints are made.
    2. **PROVENANCE** — Every print ships with a signed and numbered Certificate of Authenticity. Edition number is also signed by the photographer in pencil on the verso (back) of each print.
    3. **PRINTING** — All prints are produced on archival cotton-rag paper using pigment ink, by [printer partner — typically a known fine-art printer like Brilliant Graphics or 32 North]. Print specifications detailed.

- **Section: Featured Reviews / Press:**
  - Heading "PRESS." Stacked list of press features. Each row: year tracked uppercase | publication name (italic) | feature title | external URL. Restrained.

- **Footer:**
  - 3 columns: Browse (All editions, Sold-out archive, Past exhibitions) | Information (How editions work, Printing & framing, Shipping & returns, Care & conservation) | Contact (Email, Studio location). Bottom: copyright + a small "© Photographer Name, all rights reserved."

### Product Detail Page (PDP)

- **Hero:**
  - 2-column layout, 60/40. Left 60%: the photograph displayed at maximum size. Multiple views possible — main image plus a small thumbnail row below for detail crops, framing previews, and installation shots. Click any thumbnail → swap main image (custom JS, smooth crossfade). Image is `loading="eager"` (this is the conversion asset). Photograph rendered at 2x density for retina sharpness.
  - Right 40%: STICKY product detail panel that scrolls with the page. Contents:
    - Photographer name (tracked uppercase, small)
    - Print title (serif, 32px)
    - Year + location (italic serif)
    - Edition information ("EDITION OF 25 — 8 REMAINING") — the "8 REMAINING" decrements as prints sell, in real time
    - Print specifications (tracked uppercase header):
      - Paper: "Canson Infinity Baryta 310gsm archival rag"
      - Process: "Pigment inkjet — Epson SureColor P9000"
      - Signed: "Pencil signature, edition number, and date by photographer on verso"
      - Includes: "Certificate of Authenticity, signed and numbered"
    - SIZE OPTIONS (radio buttons or selectable variants):
      - 11×14 inches — $400
      - 16×20 inches — $850
      - 24×30 inches — $1,800
      - 40×50 inches — $3,200
    - FRAMING OPTIONS (radio):
      - Unframed (recommended for collectors with own framing)
      - Museum frame (additional $400–$1,200 depending on size) — natural maple or black ash
    - "Add to cart" — large, primary CTA, full-width of right column
    - Below CTA: small note "Estimated delivery: 4-6 weeks (made-to-order, signed individually)"

- **Section: About This Print.**
  - Below the hero. 720px max-width centered. 5-paragraph essay by the photographer about THIS specific image — context, when/where it was made, why it was made, what it represents. Drop-cap on first paragraph. Reads like a *gallery wall text* expanded to long-form.

- **Section: Installation Views.**
  - 3-image row showing the print displayed in actual installations — in collectors' homes, in galleries, in editorial contexts. These photos are critical: they help collectors visualize the work in space and signal that the print exists in the real world (not just in the catalog).

- **Section: Specifications & Conservation.**
  - Tracked uppercase header. Below: a detailed technical spec block — paper type with manufacturer, ink type, archival rating (typical: "100+ year archival rating per Wilhelm Imaging Research"), framing recommendations, shipping method, conservation guidelines.

- **Section: Other Editions by [Photographer].**
  - 3-column row of related prints — others by the same photographer. Hover behavior matches catalog.

- **Section: Customer Reviews/Provenance.**
  - This is a delicate section for fine-art prints. Most galleries DO NOT show reviews (would feel low-tier). Instead: an optional "PROVENANCE NOTES" section — a single quote from a known collector, gallery, or press review of THIS specific image (with attribution). One quote, generously displayed. NOT a star-rating system.

### Cart & Checkout Experience

- **Cart Drawer (slide-in from right):**
  - Triggered by clicking "Add to cart" — never a separate cart page on first interaction. Drawer width: 480px. Background: cream surface.
  - Contents: cart items listed with thumbnail, title, edition number ("PRINT #14 OF 25"), specifications, price, "remove" link. Subtotal at bottom. "Proceed to checkout" button (large, primary). "Continue browsing" link below.
  - Tax + shipping not calculated until checkout (avoids upfront friction).

- **Checkout Flow (single page, no multi-step):**
  - 2-column layout. Left 60%: form fields (Email → Shipping address → Billing address → Payment). Each section collapsed by default; expands on click. Right 40%: order summary (sticky), with line items, subtotal, shipping estimate, tax estimate, total.
  - **Shipping options:** Standard (4-6 weeks, $40 domestic / $120 international flat rate) / Expedited (2-3 weeks, $120 / $280) / White glove delivery for prints 24×30+ ($350+ depending on location).
  - **Payment options:** Stripe Checkout (cards), Apple Pay, Google Pay. NO PayPal (signals consumer-tier).
  - **Insurance:** Auto-included at $0 cost. Each print insured for full purchase price during transit.
  - **Confirmation page:** Beautiful — a single confirmation message, edition number, expected delivery window, certificate of authenticity status, and a personal note "Thank you for collecting [Photographer]'s work. We'll email when the print enters the queue and again when it ships."

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Variant System & Inventory Tracking

- Each print is a Webflow E-commerce product with **3 variant axes**: Size (4 options), Framing (Unframed / Museum-Framed), and Edition Number (1 of N).
- **Edition number variants** are the critical mechanism. Each edition is created as a distinct variant (Print #1, #2, #3...) with `quantity: 1` per variant. This means each print is uniquely identified — when sold, it's GONE forever (no more inventory).
- **Configure inventory tracking** in Webflow's E-commerce settings: Track inventory per variant, hide out-of-stock variants automatically. The "8 REMAINING" counter is computed via Webflow's native count of variants where `quantity > 0` for that product.
- **Custom checkout fields:** Add a hidden field "Edition Number Assigned" that's populated by the variant ID at checkout. This becomes the official edition number on the certificate.
- **Transactional emails (Webflow Logic flow):**
  1. **Order received** — confirmation with edition number assigned
  2. **In production** (sent manually or via Logic when status updated) — print is being made
  3. **Shipped** — tracking number, photo of the actual print before it ships
  4. **Delivered** — care guide, framing recommendations

### Step 2: Certificate of Authenticity Generation

- The CoA is the most important deliverable beyond the print itself. Two implementation paths:

**Path A: Webflow Logic + PDF service (simpler)**
- Webflow Logic flow triggers on order completion → calls Make.com (Integromat) or Zapier with order details (print title, edition number, buyer name, date, photographer name) → triggers a PDF generation service (DocsAutomator, PandaDoc, or a simple Google Docs template via API) → PDF emailed to the photographer for signature → signed PDF returned → emailed to buyer.

**Path B: Custom signed-token + manual signature (fine-art standard)**
- For high-tier work: the PDF is generated automatically with order details, but the photographer must physically sign each printed certificate in pencil. Workflow: PDF auto-generated → printed by the photographer's studio → photographer signs in pencil with edition number → packaged with the print.

- The template ships with both paths documented. Path B is recommended for $1K+ prints.

### Step 3: Edition Number Display Logic

- The "8 REMAINING" counter on PDPs and catalog pages uses Webflow's native variant inventory counts.
- Custom JS in the page custom code reads the variant inventory data on page load and computes/displays remaining count.
- When the edition fully sells out: the product is automatically marked "SOLD OUT" via Webflow's settings. Manually move the product to a "PAST EDITIONS / ARCHIVE" CMS category — this preserves the catalog history (collectors love seeing what's no longer available — proves scarcity is real).

### Step 4: Wishlist & Notifications

- Optional but valuable for fine-art collectors: a "Notify when edition begins" feature. For prints that haven't been released yet (announced but not yet on sale), buyers can submit their email to be notified when the edition opens.
- Implementation: Webflow Forms with CMS integration → captured emails go into a "Notify list" CMS collection → manual email blast (via the photographer's newsletter tool: Mailchimp, ConvertKit) when the edition opens.

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Sandbox testing:** Use Stripe test mode keys in Webflow E-commerce settings. Place test orders for each variant size/framing combination. Test shipping calculations to multiple zip codes (domestic and international). Test the "edition counter" by buying through edition variants and confirming it decrements. Test the transactional email sequence (orders are delivered into the email service in test mode).
- **Print fulfillment workflow (the manual side):**
  1. Order received → print enters the studio's queue (typically tracked in Notion or Asana — template includes a recommended workflow).
  2. Print made → photographer signs verso in pencil (signature, edition number, date).
  3. Certificate of Authenticity printed and signed.
  4. Print + CoA + insertion card (collector packet) packaged in archival sleeve + crated in a wooden shipping crate (for prints 24×30+) or rigid mailing tube (smaller prints).
  5. FedEx or DHL shipping with full insurance value.
  6. Tracking number entered into Webflow order → triggers shipping email automatically.
- **Quality control:** Photographer should personally inspect each print before shipping. The cost of a returned print due to QA failure is significant — return shipping for a 40×50 print is $200+.

### Scaling & Analytics

- **Track custom events** with Google Analytics 4 + Meta Pixel + the photographer's email list:
  - `view_print` — fired on PDP page load (with print title, price tier, edition status as parameters)
  - `add_to_cart` — fired on cart addition
  - `begin_checkout` — fired on checkout entry
  - `purchase` — fired on completion (with print title, edition number, price as parameters)
- **Edition release email:** When a new print is released (a new edition opens), email the photographer's full list with high-quality images and the print's story. Open rates for fine-art print announcements run high — this is the primary acquisition channel.
- **Featured prints rotation:** Update the homepage hero image every 2-4 weeks to feature a different print. This drives repeat traffic to the catalog. Update via the CMS Singleton "Homepage Hero" — change the photo, change the caption.
- **Past editions archive:** When an edition sells out, move the product to a "Past Editions" CMS collection. This serves double duty: (1) preserves the catalog history for collectors, (2) signals scarcity and demand to new collectors browsing.
- **Press mentions:** Each press feature is a CMS item. Link from the homepage Press section AND surface relevant press on PDPs ("This image was featured in [Publication], 2024"). Press attribution dramatically increases collector confidence.
- **Collector relationship management:** Beyond the website, the photographer should maintain a private collector list (Mailchimp segment or dedicated Notion DB) tracking who has bought which prints. Loyal collectors get advance notice of new editions before public release — drives 30-50% of edition sales for established photographers.
