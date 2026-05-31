# Store 9: ARCHIVAL FILMS

**Digital Product Focus:** Premium stock film footage marketplace — high-end cinematography clips priced $200–$2,500 per clip (vs. typical stock footage at $20–$100). Includes royalty-free 4K/6K/8K footage, drone shots, slow-motion, atmospheric/B-roll, archival vintage footage. Sold to filmmakers, advertising agencies, documentary producers, and brand video teams. Examples: **Filmsupply** (the premium tier above Storyblocks/Adobe Stock), **Pond5's premium curated collection**, **Artgrid's premium tier**, **MUSICBED's footage division**.

**Conversion Psychology & Strategy:** Premium stock footage buyers are filmmakers/agencies on a project deadline. Conversion path: (1) they need a specific shot (a New York rooftop at sunset, a slow-motion dolphin breach, vintage 1970s footage of a city), (2) they search by keyword/category, (3) they preview clips, (4) they license. Speed of search and preview quality are make-or-break. The store must support: instant streaming previews, frame-accurate scrubbing, multiple resolution options, and a clean license-purchase flow that delivers the file fast.

The aesthetic register is *cinematic + minimal* — the clips ARE the design. Black surfaces (cinema-friendly), large preview players, restrained UI. Closer to Filmsupply, ART OF THE TITLE, or MUBI's curation aesthetic than typical stock-footage marketplaces (which tend toward cluttered Getty-style listings).

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (90vh, video-led):**
  - Full-bleed autoplay video — a beautifully cinematographed clip from the catalog (10-15 seconds, looped, muted). NO text overlay. The video IS the homepage.
  - Below the video: a small overlay caption with the clip's metadata (location, format, license type — e.g., "MOROCCO — 6K ARRI ALEXA — RIGHTS-MANAGED").
  - At top: minimal navigation — search bar (prominent, large, the primary action), small links (Browse / Subscriptions / About).

- **Section: Search-First Interface:**
  - The store is search-first, not browse-first. The hero search bar is large and obvious. As the user types, real-time autocomplete shows matching tags + collections.
  - Search functionality:
    - Keyword search across clip titles, tags, locations, descriptions
    - Filter chips: Resolution (4K / 6K / 8K), Frame rate (24/30/60/120fps slow-mo), Subject (Aerial / Underwater / Cityscape / Nature / Vintage / Portrait), Mood (Cinematic / Documentary / Ethereal / Gritty), License (Royalty-free / Rights-managed / Editorial)
    - Sort: Most relevant / Newest / Most licensed / Price low-to-high

- **Section: Curated Collections:**
  - Heading "FEATURED COLLECTIONS." Below: a 3-column grid of curator-selected collections. Each card: a hero video loop (autoplay on hover, static thumbnail otherwise), collection name, "X clips" count, "View collection →" link.
  - Examples: "Coastal Cinematics" / "Vintage NYC 1970-1989" / "Drone — Iceland" / "Slow-mo — Macro Nature" / "Archival — Industrial Heritage"
  - **CMS Collection "Collections":** Name, Slug, Hero Video Clip Reference, Description, Curator (text — adds editorial authority), Display Order, Featured (boolean).

- **Section: Recent Additions:**
  - Heading "RECENTLY ADDED." A horizontal grid of newest clips. Each tile: video clip (autoplay on hover), clip title, location, resolution. Click → clip detail page.

- **Section: Subscribers Save 70%:**
  - Subscription upsell. 3-tier pricing:
    - **CREATOR** — $89/mo. 10 downloads/month. Royalty-free use.
    - **STUDIO** — $399/mo. 60 downloads/month. Royalty-free + select rights-managed.
    - **ENTERPRISE** — Custom. Unlimited downloads + agency rights + dedicated curator.

- **Section: Cinematographers / Sources:**
  - Heading "FROM THE BEST CINEMATOGRAPHERS." A grid of contributing cinematographers — each a card with a portrait, name, location, brief bio describing their specialization, "View their work →" link.
  - Critical credibility signal — premium footage comes from named professionals, not anonymous archives.

- **Section: Trusted By:**
  - Logos of major brands, studios, and agencies that license footage from this store. Monochrome, restrained.

- **Footer:**
  - 4 columns: Browse (Collections, Recent, Cinematographers, By Location) | Licensing (Royalty-free, Rights-managed, Editorial, Custom rights) | Account (Subscriptions, My Downloads, Affiliate program) | Contact (Email, Submission portal for cinematographers, Press). Bottom: copyright + small license-terms link.

### Product Detail Page (PDP) — Clip detail

- **Hero:** Large video player taking 70% of viewport width. High-quality video preview at 1080p (full-resolution preview gated to authenticated/preview-token mode).
  - Custom video controls — frame-accurate scrubber, frame-stepping (← → keys), mute/unmute, fullscreen, download original (gated by purchase).
  - Below the player: a small thumbnail strip showing key frames from the clip (5-10 thumbnails). Click any thumbnail → seek to that point in the video.

- **Right rail (sticky):**
  - Clip title (serif, 22px)
  - Cinematographer credit (linked to their profile)
  - Specifications:
    - Resolution: 6K (5760x3240)
    - Codec: ProRes 4444 XQ
    - Frame rate: 24fps
    - Duration: 12 seconds
    - Camera: ARRI ALEXA Mini LF
    - Lens: Cooke S7/i 32mm
    - File size: 2.1 GB
  - Pricing options:
    - **Royalty-Free Standard** — $399 (single project, unlimited use)
    - **Rights-Managed** — $1,200 (specific use case, geographic limits, time-limited)
    - **Editorial Only** — $99 (news/documentary use only)
  - "Add to Cart" CTA + "Save to Bin" (saves to user's collection for later review)

- **Section: About This Clip.**
  - 2-3 paragraph description of the clip — what's depicted, when it was shot, where, by whom, what's special about the cinematography.

- **Section: Tags & Categories.**
  - Lists of related tags. Each clickable → searches for similar clips.

- **Section: License Details.**
  - Detailed license terms for each tier. Clear what is and isn't allowed (broadcast use, commercial use, geographic restrictions, modifications).

- **Section: Similar Clips.**
  - Grid of similar clips. Algorithm: same cinematographer, same location, same mood, same subject. Critical for filmmakers who need "more of this."

### Cart & Checkout Experience

- **Cart drawer:** Shows clips with license tier selected per clip, total. Editable license tier from cart.
- **Stripe Checkout:** Email, name, billing, payment. Optional: Production company name, project name (for license documentation).
- **Post-purchase delivery:** On payment success:
  - Email with download URLs (signed, 7-day expiration)
  - License document attached (specific to project + buyer)
  - "My Downloads" page (Memberstack) for re-access
- **Confirmation:** Standard delivery confirmation, support contact.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Video Streaming & Preview Architecture

- Video previews: 1080p H.264 streamed via Vimeo (Pro/Business plan) or AWS CloudFront. Full-resolution master files (ProRes, RAW) stored on AWS S3 / Cloudflare R2.
- For the search-first interface, video previews must autoplay on hover smoothly. Implementation: pre-load the first second of each clip; on hover, swap to the playing video.
- Frame-accurate scrubber: use Vimeo's player API or implement a custom HTML5 video player with timeline controls.

### Step 2: Multi-Tier Licensing Variants

- Each clip is a Webflow product with 3+ variants (one per license tier). Variants priced differently. License tier selected at cart determines which license document is generated.

### Step 3: License Document Generation per Project

- For Rights-Managed and Editorial licenses, license documents are project-specific. Generation flow:
  - On checkout, buyer enters: Production company, Project name, Use cases, Geographic distribution, Term length
  - Webhook generates a custom license PDF tailored to the buyer's project — uses a template document service (DocsAutomator with conditional logic).
  - For complex commercial licenses (>$5K), manual review by a licensing agent before delivery is standard.

### Step 4: Subscription Library Logic

- Subscriptions = bandwidth + downloads per month. Implementation:
  - Subscription product via Stripe.
  - Memberstack tracks subscription status + monthly download count.
  - On clip download via subscription: counter decrements; user can't download more than their monthly cap.
  - Counter resets monthly on subscription anniversary.
- License tier within subscription is "Royalty-Free Standard" by default; rights-managed clips require additional purchase.

### Step 5: Cinematographer Submission Portal

- A separate (Memberstack-gated) portal where cinematographers submit footage for review. Submission form: clips, metadata, exclusive vs. non-exclusive offer, royalty terms.
- Approved submissions enter the catalog with the cinematographer credited and revenue split (typical: 50-70% to cinematographer per license, 30-50% to platform).

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test purchase flow:** Buy clips at each license tier in sandbox. Confirm full-resolution download URLs work. Confirm license PDFs generate correctly with project-specific details.
- **Edge cases:**
  - Buyer's project changes after purchase (different geography, different use case) → re-license at delta cost
  - Multiple clips in one project → single combined license document covering all clips
  - Editorial license used commercially → strict no-modification policy + DMCA enforcement infrastructure
  - Subscription buyer downloads then cancels → license persists for the downloaded clips
- **Quality control:** Every clip submitted by cinematographers is reviewed for: technical quality (focus, exposure, audio if any), originality (not a duplicate of an existing clip), licensing rights cleared, metadata accuracy.

### Scaling & Analytics

- **Track these events:**
  - `search_query` (with query + result count)
  - `view_clip` (with clip ID, cinematographer)
  - `play_preview` (signal of intent — full preview viewed)
  - `add_to_bin` (save for later — strong intent)
  - `add_to_cart`
  - `complete_purchase` (with clip, license tier, total)
  - `subscribe`
- **Conversion benchmarks:**
  - Search → clip view: 30-50%
  - Clip view → preview play: 60-80%
  - Preview play → purchase: 1-3% for cold traffic, 5-15% for warm/professional traffic
  - Subscription churn: 5-10% (excellent)
- **Acquisition channels:**
  - **SEO** (primary) — long-tail keyword traffic ("4K aerial drone footage of [location]", "slow motion tiger shot") drives 40-60% of traffic
  - **Cinematographer reputation** — top cinematographers' personal followings (Instagram, Vimeo) drive significant traffic to their clips on the platform
  - **Industry trade publications** — Filmsupply gets coverage in No Film School, Premium Beat, Wistia. Pitch new collection releases.
  - **Affiliate program** — 20-30% commission for video editors and tutorial creators
- **Cinematographer recruitment:** The catalog quality depends on cinematographer talent. Recruit actively — outreach to top cinematographers on Vimeo Staff Picks, ARRI's contributor program, freelancers shooting for major brands. Offer competitive royalty splits (60-70%+ for established names).
- **Pricing reviews:**
  - Royalty-Free Standard: $99-$799 per clip (varies by uniqueness, resolution, cinematography quality)
  - Rights-Managed: $500-$5,000+ per clip per use case
  - Editorial Only: $50-$200 per clip
  - Subscription: $89-$399/mo for individuals, $1,500-$15,000/yr for studios
- **Curator-led collections:** Curated collections drive higher conversion than algorithmic browsing. Hire 2-3 part-time curators (working filmmakers, music supervisors, ex-music video commissioners) to create themed collections monthly.
- **Production-ready output:** Clips must come with all common deliverable formats: ProRes 4444, ProRes 422 HQ, ProRes 422, ProRes Proxy. H.264 versions for web preview only. Original camera RAW available on request for premium tiers.
- **Rights clearance discipline:** Every clip must have full chain of title cleared — model releases for any identifiable people, location releases for private property, clearances for any visible logos/products. Without this, the platform faces legal exposure on every license.
