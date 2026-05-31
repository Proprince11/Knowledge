# Store 7: RIGGED ASSETS

**Digital Product Focus:** Premium 3D models, rigged characters, and architectural visualization assets for professional 3D artists, game developers, and architectural visualizers. Models priced $40–$1,500+ each (rigged characters and complex environments command higher prices). Format support: FBX, OBJ, GLB/GLTF, Blender, Cinema 4D, Maya, Unreal, Unity. Examples: **Quixel Megascans** (now Epic), **Kitbash3D**, **CG Trader's premium tier**, **TurboSquid's Studio Library**, **Twinmotion / Lumion asset libraries**.

**Conversion Psychology & Strategy:** 3D asset buyers are professional artists evaluating models against their pipeline needs. Conversion path: (1) they need a specific asset for a project (architectural visualization scene, game environment, render commission), (2) they search by category/style, (3) they evaluate the asset's polygon count, texture resolution, rigging quality, and format compatibility, (4) they buy. The store must show **the actual model** in extensive detail — multiple renders, wireframes, texture maps, and scale references. Generic marketing imagery is fatal in this market.

The aesthetic register is *technical-precise but visually impressive* — the assets ARE the design. Closer to Quixel's pro-tier presentation, Sketchfab's premium models, and Kitbash3D's product pages than a generic asset marketplace.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (75vh, asset-led):**
  - Single hero render image — a beautifully composed scene using one of the store's flagship asset packs. Below the image: small caption with asset pack credit and rendering software used.
  - Bottom-left overlay: tracked uppercase eyebrow ("RIGGED — PROFESSIONAL 3D ASSETS"), H1 in display sans (`clamp(2.5rem, 5vw, 4rem)`), 1-line tagline ("Production-ready 3D models for studios that can't waste a frame."), Two CTAs: primary "Browse Assets" (filled), secondary "Latest Drop" (ghost).

- **Section: Featured Asset Packs (visual showcase):**
  - Heading "FEATURED PACKS." Below: an asymmetric grid of asset packs. Each card:
    - Hero render image (16:9 — multiple assets composed in a scene)
    - Pack name (display sans, 24px)
    - Asset count ("32 assets")
    - Format support (icons: Blender / FBX / OBJ / GLB / Unreal / Unity)
    - Price ($349)
    - Hover: card lifts, image swaps to a wireframe view (showing polygon density), then back.
  - **CMS Collection "Asset Packs":** Name, Slug, Category (Architecture / Characters / Vehicles / Environments / Props / VFX), Hero Render (16:9), Wireframe Render, Asset Count, Format Support (multi-reference), Polygon Range (text — "5K-50K per asset"), Texture Resolution (text — "4K PBR"), Price, Display Order, Featured (boolean), Drop Date.

- **Section: Browse By Category:**
  - 6-column grid of category tiles. Each tile: a representative render + category name + asset count. Click → filtered catalog by category.

- **Section: Quick Filters / All Assets:**
  - Filter chips: Category, Format, Polygon Count Range, Price Range, Style (Photoreal / Stylized / Low-poly). Real-time filter via Finsweet CMS Filter.
  - Below: full grid of all available asset packs.

- **Section: Used in Production (social proof):**
  - Heading "USED IN PRODUCTION." A scrolling marquee or grid showing examples of the assets used in actual professional work — game screenshots, film stills (where licensing permits credit), architectural visualizations, and renders. Each tile: image + studio/artist credit + asset pack used.

- **Section: Subscription Library (upsell):**
  - 2-column block. Left: pricing for a subscription library — "$99/mo for unlimited downloads of all assets in the library." Right: list of benefits (full library access, monthly new releases, commercial license, bandwidth-unlimited downloads). CTA "Subscribe →."
  - Subscription is the highest-LTV revenue model in this market.

- **Section: Free Sample Pack:**
  - "Download our free starter pack — 8 production-ready assets, no credit card required." Email signup gate.

- **Footer:**
  - 4 columns: Assets (links to category pages) | Resources (Format guide, Compatibility, Tutorials, Changelog) | Account (Subscriptions, License terms, Affiliate program) | Contact (Email, Twitter, ArtStation, LinkedIn). Bottom: copyright + small disclaimer.

### Product Detail Page (PDP)

- **Hero:** Pack name in display, primary CTA "Buy Pack — $349" (filled), secondary "Try a free sample" (ghost — single-asset download for evaluation). Format icons row.

- **Section: Render Gallery.**
  - 8-15 high-quality render images of the assets in the pack. Multiple angles, multiple compositions, multiple lighting conditions. Each render: full-quality 4K image, with caption noting the rendering engine ("V-Ray 6 / Octane / Unreal Engine 5"). Lightbox-enabled — click to view at full resolution.
  - This section is the ENTIRE conversion. Generic renders kill conversion; specific, hero-quality renders close it.

- **Section: Wireframe & Topology.**
  - 4-6 wireframe render images showing topology quality. Buyers care deeply about clean topology — quad-dominant meshes for rigging, optimized poly distribution. Wireframe renders are the "show me you're a pro" signal.

- **Section: Asset List (the inventory).**
  - A grid showing every asset included in the pack. Each asset: thumbnail render, asset name, polygon count, texture resolution, scale reference (height in meters/feet). Click any asset → enlarged view with all included files listed.

- **Section: Format & Compatibility.**
  - A table showing format support: which file formats are included (FBX, OBJ, Blend, GLB, etc.), which textures (Diffuse, Normal, Roughness, Metallic, AO, Displacement), and which engines tested (Blender 4.x, Cinema 4D 2025, Maya 2025, Unreal 5.4, Unity 2024 HDRP/URP).

- **Section: License Terms.**
  - Clearly displayed:
    - Standard license: "Use in unlimited commercial and personal projects. Cannot be resold as-is or used in NFT/AI training datasets."
    - Extended license: "Includes resale rights for stock asset marketplaces. Additional fee."
    - Studio license: "Multi-user team license. Per-seat pricing."

- **Section: Pricing.**
  - Pack price + license tier selector (Standard / Extended / Studio). "Buy Pack — $X" CTA.

- **Section: Sample Asset (free download).**
  - One asset from the pack made available as a free download (with full textures). Lets buyers actually test the quality in their pipeline before committing $349.

- **Section: Customer Renders (social proof).**
  - Customer-submitted renders using the pack. Each tile: render + customer credit + studio/project (when permitted).

- **Section: Other Packs:**
  - Related packs in the same category.

### Cart & Checkout Experience

- **Cart drawer (right slide-in):** Shows pack(s), license tier per pack, total. License tier editable from cart.
- **Checkout (Stripe):** Email, name, billing address. Optional company name + VAT ID.
- **Instant download delivery:** On payment success:
  - Email with download URLs (signed, 30-day expiration) for each format included in the pack
  - Email also includes the license PDF (named with buyer's entity)
  - "My Downloads" page (Memberstack-gated) for re-access
- **Confirmation page:** Standard download confirmation, support contact, link to format compatibility guide.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Multi-Format File Delivery

- Each asset pack has multiple ZIP files (one per format: Blender, FBX, OBJ, GLB, etc.). On purchase, ALL formats included in the pack are delivered.
- Implementation:
  - **Recommended:** Cloudflare R2 + signed URLs (cheaper than S3 for high-bandwidth digital downloads — typical 3D asset packs are 500MB-5GB+).
  - Each pack has a folder structure on R2: `/packs/[pack-slug]/[format].zip`.
  - On purchase webhook: serverless function generates signed URLs for each format ZIP and emails them.
- Alternative: SendOwl / Easy Digital Downloads — handles bandwidth and signed URLs, but transaction fees apply.

### Step 2: License Document Generation

- Each purchase generates a custom license PDF with the buyer's entity name. Same pattern as Nightshade Type:
- Webhook → PDF generation (DocsAutomator or similar) → buyer name inserted → emailed with the download URLs.

### Step 3: Subscription Tier (Optional but High-LTV)

- "Library subscription" = $99/mo for all assets. Implementation:
- Stripe subscription product → on subscription start, Memberstack account upgraded to "Subscriber" tier → all asset PDPs show "Free download for subscribers" instead of "Buy" → click downloads via subscription credentials.
- On subscription cancellation: previous downloads retained (buyers keep what they got while subscribed), but new downloads blocked.
- Critical: subscription pricing must be carefully calculated — too cheap and it cannibalizes one-off purchases; too expensive and conversion suffers. Sweet spot: $79-149/mo for a library worth ~$5,000+ in individual purchases.

### Step 4: Subscription Customer Portal

- Memberstack-powered portal for subscribers:
- Dashboard showing all available assets
- "Recently downloaded" history
- Subscription management (pause, cancel, billing)
- Hi-resolution preview gallery for each pack

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test purchase flow:** Buy each pack in sandbox. Confirm download URLs arrive within 60 seconds. Test downloading and importing each format into the relevant 3D software (Blender, Cinema 4D, Maya, Unreal). This testing is critical and time-consuming but unavoidable.
- **Edge cases:**
  - Customer's software version is too old → flag in the store's compatibility section; for older software, provide legacy format on request
  - Format issues (e.g., FBX rotation/scale problems) → standard workflow: provide an FAQ entry with fixes; for major issues, update the pack
  - License questions for AI training / NFT use → standard policy: NOT included in basic license, requires custom commercial discussion (`legal@`)
  - Bandwidth issues for very large packs (>5GB) → use Cloudflare R2 with proper CDN; consider torrent-style distribution for the largest assets
- **Asset quality review:** Before launching, every asset must be tested in 3 different render engines (V-Ray + Cycles + Unreal Engine), in 3 different lighting setups (studio HDRI + outdoor sunset + dramatic key light). Topology validated for proper UV unwrapping and rigging compatibility.

### Scaling & Analytics

- **Track these events:**
  - `view_pack` (with pack name, category)
  - `view_render_gallery` (signal of strong interest)
  - `download_sample` (free asset download — strong conversion signal)
  - `add_to_cart`
  - `purchase_complete` (with pack, license tier, total)
  - `subscribe` (subscription start)
- **Conversion benchmarks:**
  - PDP view → sample download: 5-15%
  - PDP view → purchase: 1-3% for cold traffic, 5-15% for warm/community traffic
  - Sample download → purchase within 14 days: 8-20%
  - Subscription churn (monthly): 5-10% (excellent), 10-20% (typical)
- **Acquisition channels:**
  - **ArtStation** — primary for 3D artists. Maintain a high-quality ArtStation profile linking to the store. Drive 30-50% of traffic.
  - **Instagram + TikTok** — short-form video showing assets in production-quality renders or behind-the-scenes 3D workflow content. Drives 20-40% of traffic for stylized/character assets.
  - **YouTube** — tutorials using the store's assets in actual workflows (Blender modeling tutorials using a vehicle from the store, Unreal scene building with an environment pack). Long-form content drives organic traffic and authority.
  - **Affiliate program** — 30-40% commission for tutorial creators and community influencers. Drives 15-25% of revenue.
- **New asset release cadence:** 1-2 new packs per month is sustainable for a small studio. Each release should be announced via email + social, drives a sales spike across the entire catalog.
- **Subscription growth strategy:** Subscription LTV (typical $99/mo, average tenure 8-14 months) is $800-$1,400 per subscriber — much higher than typical one-off purchase LTV. Scale subscription via:
  - Free trial (7 days) for new subscribers
  - Annual plans at 20% discount ($950/yr instead of $1,188 monthly)
  - Loyalty rewards (subscribers get early access to new packs 7 days before public release)
- **Pricing reviews:** Annually review individual pack pricing AND subscription pricing vs. competitors. Most successful stores raise individual pack prices 10-15% annually; subscription prices typically remain stable but the value (number of assets included) grows.
- **License compliance:** Major studios (game companies, film studios) require specific license verification before purchase. Have a clear "Studio License" path with manual review for purchases >$5K — these convert at high rates and command 2-3x standard license pricing.
