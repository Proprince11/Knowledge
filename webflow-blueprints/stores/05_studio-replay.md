# Store 5: STUDIO REPLAY

**Digital Product Focus:** Premium photography presets and color LUTs for professional photographers and videographers — Lightroom presets ($30–$150 per pack), Adobe Camera RAW XMP files, Capture One styles, video LUTs for DaVinci Resolve / Premiere / Final Cut ($30–$200 per pack), and color science companion guides. Sold as one-time purchases or bundled "complete library" subscriptions ($200–$1,500). Examples: **VSCO film emulation packs**, **Mastin Labs**, **Joshua Cogan presets**, **Tribe Archipelago**, **PolarPro LUTs**, **Filmic Pro color grades**.

**Conversion Psychology & Strategy:** Photography preset and LUT buyers are working photographers/videographers — typically wedding photographers, portrait photographers, content creators, indie filmmakers, and YouTubers. The conversion path: (1) they see *the look* in a portfolio, social post, or a before/after video, (2) they identify the creator, (3) they evaluate whether the look will work on their own footage, (4) they buy. The store must show *real-world before/after examples* on multiple skin tones, lighting conditions, and styles — not cherry-picked golden-hour examples that won't translate to indoor wedding receptions.

The aesthetic register is *photography portfolio meets premium digital store* — gallery-style image-led with conversion polish underneath. Not Etsy-tier, not generic preset shop. Closer to Mastin Labs or Tribe Archipelago in visual register.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (75vh, image-led):**
  - Single full-width image — a hero photograph showing the photographer/colorist's signature look at its strongest. Below the image: small caption with photo credit + which preset pack was used. The image proves the look at the absolute moment of impact.
  - Bottom-left of hero (overlay): tracked uppercase eyebrow ("STUDIO REPLAY — PRESETS BY [PHOTOGRAPHER NAME]"), H1 in serif/heavy display, 1-line tagline ("The film-emulation presets used by [N] working photographers.") Below: two CTAs — primary "Browse all packs" and secondary "Latest release."

- **Section: Preset Packs (catalog grid):**
  - Heading "PRESET PACKS." Below: a 3-column grid of preset packs. Each card:
    - A 4:5 hero image showing a representative photo edited with the pack
    - Pack name (serif/display, 24px)
    - Pack type ("Lightroom Preset Pack" / "Capture One Styles" / "Video LUT Pack")
    - Number of presets included ("18 presets")
    - 1-line description ("Warm summer-light tones. Skin-positive on all complexions.")
    - Price ($85)
    - Hover: card lifts, hero image swaps to a different example showing the same pack on different lighting/subjects.
  - **CMS Collection "Preset Packs":** Name, Slug, Type (option set: Lightroom / Capture One / DaVinci LUT / Premiere LUT / FCP LUT / Universal RAW), Hero Image (4:5), Alternate Hover Image, Number of Presets, Description, Long Description (rich text), Specifications (rich text — software compatibility, file formats), Price, Display Order, Featured (boolean).

- **Section: Before/After Gallery (interactive):**
  - Heading "BEFORE / AFTER." Below: an interactive comparison gallery. Each comparison: a single image with a center divider — drag the divider left/right to reveal "before" (RAW or unedited) on one side and "after" (edited with one of the packs) on the other.
  - Multiple comparisons in a horizontal scroll (or grid). Critical: comparisons must include a RANGE of lighting conditions, skin tones, and shooting environments. Cherry-picking only golden-hour shots is the #1 trust violation in this market.
  - Implementation: custom JS draggable divider over two stacked images.

- **Section: Featured Pack (deep-dive):**
  - Heading "FEATURED PACK." A 2-column block deep-diving on one preset pack — 5-8 sample images on the left (gallery), pack details on the right (description, what's included, price, "Buy" CTA).

- **Section: The Photographer/Colorist (credibility):**
  - 2-column. Left: a portrait of the photographer/colorist (color, environmental — at their desk, on location). Right: 4-paragraph biography. Credentials matter here — published in [magazines], shot for [brands], commercial work for [clients].

- **Section: Used By (social proof):**
  - Heading "USED BY PHOTOGRAPHERS WORLDWIDE." A grid of small Instagram-style images submitted by paying customers using the presets on their work. Each tile: image + photographer's @handle + pack used. Click → opens an Instagram-style modal with full image + caption.
  - Critical: these are real customer images (curated and approved by the customer). Builds massive social proof.

- **Section: Bundle Pricing (upsell):**
  - Heading "GET THE COMPLETE LIBRARY." A bundle pricing block: "Buy all 8 packs for $499 — saves $200 vs. individual purchase." Below: list of all included packs. Single CTA "Buy Complete Library."

- **Section: FAQ:**
  - Common questions: "Does this work in Lightroom Mobile?" / "Can I use these on commercial work?" / "Will these work on my older version of Lightroom?" / "Is this a one-time purchase or subscription?" / "Do I get future updates free?"

- **Footer:**
  - 4 columns: Packs (links to each pack PDP) | Resources (Installation guide, Compatibility, Tutorials, Color theory blog) | About (Photographer, Press, Affiliate program) | Contact (Email, Instagram, YouTube). Bottom: copyright + small disclaimer.

### Product Detail Page (PDP)

- **Hero:** Pack name in display, 1-line tagline, hero image showing pack's signature look.

- **Section: Sample Gallery.**
  - 8-15 images showing the pack applied to a range of subjects: portraits, weddings, products, landscapes, indoor low-light, outdoor sunlight. Each image has a small caption noting the lighting condition. Carousel or grid layout.

- **Section: Before / After Slider.**
  - 4-6 interactive before/after sliders. Same draggable divider mechanic. Different lighting conditions, different skin tones, different subjects. This section converts the most.

- **Section: What's Included.**
  - Bullet list: "18 presets" / "Compatible with Lightroom Classic 9.0+ and Lightroom CC" / "Mobile (.dng) versions included" / "Capture One companion styles included" / "Installation guide PDF" / "Free updates for life."

- **Section: Buy / Pricing.**
  - Pricing card: $85 (or $X). Stripe-styled "Buy Now" button. Below: refund policy ("Due to the digital nature of this product, all sales are final"), software compatibility note, instant download note.

- **Section: How To Install.**
  - 3-step visual guide for installation in Lightroom (or relevant software). Helps reduce post-purchase support tickets.

- **Section: Customer Photos (filtered).**
  - Same Instagram grid as homepage, but filtered to images using THIS specific pack.

- **Section: Other Packs You Might Like.**
  - 3-card row of related packs (similar style or by the same photographer).

### Cart & Checkout Experience

- **Cart drawer (right slide-in):** Shows: pack(s), price, "Continue to checkout."
- **Checkout (Stripe):** Email, name, billing address, payment method. Optional company name (B2B).
- **Instant download delivery:** On payment success:
  - Download URL emailed within 60 seconds — links to a ZIP file containing presets, installation guide, and any companion materials
  - Download URL is a signed CDN URL with 7-day expiration (encourages immediate download but allows re-download for a week)
  - "My Downloads" page on the site (Memberstack-gated) for customers to re-access purchased packs anytime
- **Confirmation page:** "Your packs are downloading!" — clear next steps, installation guide link, support email.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Digital File Delivery System

- Preset packs are delivered as ZIP files. Architecture options:

**Option A: Webflow E-commerce native + linked download URLs**
- Each pack's product configuration includes a "Download URL" field (CMS extension). On purchase, the order confirmation email includes the URL.
- Pros: Simple, no third-party services.
- Cons: URLs are static — can be shared. Less protection against piracy.

**Option B: SendOwl / Easy Digital Downloads / FetchApp (recommended)**
- Third-party digital delivery service that generates unique download URLs per purchase, tracks downloads, and supports re-download from a customer portal.
- Webflow E-commerce checkout integrates via webhook → SendOwl creates the download URL → email sent automatically.
- Pros: Anti-piracy (limited download counts per URL, expiration), customer portal for re-access.
- Cons: Monthly fee ($9-39/mo).

For premium presets ($50+), Option B is recommended — the anti-piracy protection is worth it.

### Step 2: Bundle Logic

- Bundle products are separate Webflow products that, on purchase, deliver multiple files. Configuration:
- Bundle product has a "Bundle Components" multi-reference to the individual packs.
- On purchase webhook: trigger fires for each component pack, generating download URLs for ALL of them. Customer gets ONE email with multiple download links.

### Step 3: Customer Portal (Optional but Valuable)

- Memberstack-powered portal where customers can:
  - View all purchased packs
  - Re-download files anytime
  - Access installation guides and tutorials
  - Submit photos for the "Used By" gallery
- Implementation: Memberstack accounts created on first purchase (matched by email). Hidden Webflow pages gated by Memberstack access groups.

### Step 4: Updates & Versioning

- When a pack is updated (improvements, new presets added, compatibility fixes):
- Email all previous buyers with the update notification + new download URL.
- Marked as "Updated" on the pack's PDP for new buyers.
- Versioning tracked via filename (`PackName-v1.2.zip` → `PackName-v1.3.zip`).

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test the full purchase flow:** Buy each pack in sandbox, confirm download URL arrives within 60 seconds, confirm ZIP contents (presets + installation guide), confirm presets actually install in Lightroom (test on macOS and Windows).
- **Edge cases:**
  - Customer's Lightroom version is too old (e.g., Lightroom 6 standalone) → support flow, possibly issue a legacy version
  - Customer accidentally double-purchased → automated refund flow OR offer to swap for a different pack
  - Customer's download URL expired → re-issue via support email or self-serve via customer portal
  - International customers with VAT obligations → use a service like Quaderno or Lemon Squeezy to handle EU VAT
- **Quality control:** Before launching a pack, test it on a representative range of 20-50 images covering different conditions. Critical: skin tone testing — the pack must work well on diverse skin tones (the #1 customer complaint about photography presets is "doesn't look good on darker skin"). Address this in the pack design itself.

### Scaling & Analytics

- **Track these events:**
  - `view_pack` (with pack name)
  - `interact_before_after` (when user uses the slider — strong intent signal)
  - `add_to_cart`
  - `complete_purchase` (with pack, bundle vs. individual, total)
  - `download_complete` (signal of successful delivery)
- **Conversion benchmarks:**
  - PDP view → purchase: 2-5% for cold traffic, 8-20% for warm/Instagram-driven traffic
  - Bundle attach rate (when buying single pack, % who upgrade to bundle): 8-15%
  - Repeat purchase rate (within 12 months): 25-40% for engaged customers
- **Instagram is the primary acquisition channel** for photography presets:
  - Photographer posts work tagged with the brand → followers click bio → land on the store
  - Affiliate program for other photographers (typical: 30-40% commission on referred sales) drives 20-40% of revenue
  - Influencer collaborations: send free packs to recognized photographers in exchange for tagged posts/Reels
- **Email list building:** Free presets as lead magnets — offer a 1-2 preset "starter pack" in exchange for email signup. These free users convert to paid customers at 5-10% within 6 months.
- **Tutorial content as marketing:** YouTube tutorials, Instagram Reels, and TikTok content showing the presets in use drive massive organic traffic. Short-form video where the photographer explains their editing process is the highest-converting content format.
- **Pack release cadence:** Top preset shops release a new pack every 3-6 months. Each new release announcement drives a sales spike across the entire catalog (existing customers buy the new pack + first-time customers discover the brand and buy multiple packs).
- **Bundle pricing:** Always offer a "complete library" bundle at 30-50% off the individual sum. This drives high-AOV purchases from new customers AND captures customers who would otherwise buy 2-3 packs over time.
- **Photo submission program:** Encourage paying customers to submit their work using your presets via a hashtag or email. Curate the best for the "Used By" gallery. Photographers love being featured (and tagging your brand), creating a viral loop.
