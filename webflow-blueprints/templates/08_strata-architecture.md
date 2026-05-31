# Template 8: STRATA ARCHITECTURE

**Niche/Target Market:** Architecture and design practices in the 8–40 person range working on residential ($5M+ project value), boutique commercial, and cultural/civic projects. Specifically the *credentialed practice* register: Studio Mumbai, MOS Architects, Sou Fujimoto Architects, Marlon Blackwell, Olson Kundig. Audience is high-net-worth private clients evaluating practices for a custom-home commission, museum/gallery boards selecting designers for cultural projects, and architectural press/critics. Decisions take 6–18 months; the website's role is to be the practice's calling card during a long, deliberate evaluation.

**Core Value Proposition & Aesthetics:**

The thesis: an architecture practice's website is its *built portfolio* — every layout, type choice, and image crop is a demonstration of the practice's spatial sensibility. Words are restrained; images do most of the work, but at extraordinary scale and quality. The aesthetic register is *Domus magazine* meets *El Croquis* — image-led, architecturally-conscious, deeply quiet.

**Design System:**
- **Typography:** Single typeface family executed with restraint — **Founders Grotesk** (or **Söhne**) for everything. Headlines in 400 weight (yes, 400 — not bold), body in 400, captions in 400 with `letter-spacing: 0.1em` uppercase. Type sizes radically restrained: H1 maxes at 32px; H2 at 22px; body at 16px. The smallness of type lets imagery dominate. NO serifs anywhere — that's editorial publishing register, not architectural register.
- **Color Theory:** Pure white surface `#FFFFFF` (not warm — architectural drawings live on white). Body and headings in `#0A0A0A` (near-black). NO accent colors. Hover states use a subtle grey `#888888` for typographic feedback. Color comes exclusively from photography. Charts/diagrams use grayscale only.
- **Visual Language:** Architectural photography at extreme scale — full-bleed, full-viewport, generous. Image captions in the *El Croquis* style: project name, location, year, photographer credit, all in tiny uppercase tracked-out type below the image. Floor plans, sections, and axonometrics presented as architectural drawings (line work only, no fills). White space as compositional principle — sections breathe at 200px+ vertical padding on desktop. Every image hangs within its own optical "room."
- **Why $10K+:** Top architecture practices commission custom sites at $40K–$120K — Studio Mumbai's, OFFICE Kersten Geers David Van Severen's, Olson Kundig's. The challenge is restraint at exhibition-quality. This template provides the rare architectural-aesthetic framework that respects the practice's photography, includes a real project CMS with project-type taxonomy that maps to how clients evaluate practices (residential / cultural / commercial / unbuilt / competition), and surfaces architectural drawings with appropriate display logic.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The First Image)

- **Hero (100vh, single full-bleed image):**
  - One photograph. Filling the entire viewport. The most extraordinary photograph the practice owns — typically an interior moment with directional natural light, a landscape relationship, or a monumental structural moment. `object-fit: cover; object-position: center;`. No text overlay. No CTAs. Just the image.
  - Bottom-left, in tiny uppercase tracked-out type: project name | location | year. Bottom-right: "[01/24]" — indicating this is the first of N projects shown on the homepage. Tiny scroll indicator at bottom-center: "↓".
  - The hero image rotates per visit (custom JS picks a random image from a "Hero Pool" CMS collection on each page load) — gives the site the feeling of a magazine cover that changes per issue.

- **Section: Practice Statement (single paragraph, restrained):**
  - 90vh tall section. Centered. A single 5-sentence paragraph at 24px, line-height 1.6, max-width 720px. The practice's core philosophical position. ("We design buildings that age into their landscapes. We work with stone, wood, and concrete. We make few decisions, but we make them precisely."). No drop-cap. No image. The text floats in the center of the white space.

- **Section: Selected Projects (asymmetric scroll-stack):**
  - Each project gets its own full-viewport section. Layout alternates per project to create visual rhythm:
    - Project 1: Single full-bleed image, project caption below in tiny tracked uppercase
    - Project 2: Two-image side-by-side at 50/50, both vertical aspect, captions stacked below
    - Project 3: Single image at 70% width centered, large white margins above/below
    - Project 4: Triptych — 3 horizontal images stacked vertically, single project caption below all three
    - Project 5: A floor plan (line drawing on white) at 80% width, with a small annotation block in the bottom-right
  - The asymmetric rhythm prevents the homepage from feeling like a portfolio thumbnail grid. CMS controls layout variant per project.
  - **CMS Collection "Selected Projects":** Project Reference (link to Projects collection), Layout Variant, Display Order, Featured Images (1–3 image slots based on variant).

- **Section: Practice Index (textual):**
  - Heading "PRACTICE." (uppercase tracked-out, only header on the page using this treatment.) Below: a 4-column grid of textual links — Recent Projects | Awards | Publications | Contact. Each column header in same uppercase tracked treatment, with 5–7 child links below, each as plain text underlined on hover. No icons. No images. Pure typographic navigation.

- **Section: Latest Press (single line):**
  - Heading "PRESS." Below: a stacked list of 5 most recent press features. Each row: year | publication name (italic) | feature title. Hairline divider between rows. Click → external article URL.

- **Footer (architectural credit-block style):**
  - Three rows. Row 1: practice name, large but understated (28px). Row 2: 3-column block — Office address(es), Email contact, Press contact. Row 3: Tiny copyright + a single "ARB / RIBA / AIA" credential note (depending on practice's licensing). Generous padding. Pure text.

### Page 2 — Projects (Index + Detail)

- **Index Hero:** Single line "PROJECTS." in tracked-out uppercase. Below: tiny filter dropdowns for Project Type (Residential / Cultural / Commercial / Unbuilt / Competition), Year, Status (Built / In Progress / Concept). Filters use Finsweet CMS Filter, real-time updates without page reload.

- **Index Layout:** A vertical stack — each project occupies a full-viewport row. Layout per row: Left 60%: a single image (the project's signature exterior or interior shot). Right 40%: a textual block — small uppercase project type label, project name (24px regular weight), 1-line description, and a small data block (Location, Year, Area in sqm, Status). Hover the image: subtle scale to 1.02 over 800ms; the textual block shifts slightly right (4px) — suggests a "page turn" without being decorative.

- **Project Detail Page (CMS template):**
  - **Hero:** Full-bleed signature image. 100vh. No overlay. Tiny project info bottom-left.
  - **Section: Project Description.** Single column 720px max-width. 3–5 paragraphs of restrained, descriptive prose about the project. NOT a marketing brief — written like an architectural critic would describe the building. Specifics over abstractions. ("The house cantilevers 4 meters over the slope to maintain a 23-degree view to the sea.") Drop-cap on first paragraph (a single large initial in regular weight, no decoration).
  - **Section: Image Sequence.** A series of 8–15 images displayed sequentially full-bleed. Alternating between exteriors, interiors, structural details, and material close-ups. Images are 16:9 or 4:5. Each image: full-width display + a small uppercase tracked caption below ("EAST ELEVATION, MORNING LIGHT — PHOTO: [Photographer]").
  - **Section: Drawings.** Floor plans, sections, axonometrics displayed as architectural line drawings (PNG with transparent background or SVG). Each drawing: full-width on white surface, with a small drawing-title caption below ("GROUND FLOOR PLAN — 1:200").
  - **Section: Materials.** A 3-column block listing the project's primary materials. Each column: material name + supplier/source + small image of the material sample. Demonstrates architectural sensibility through specificity.
  - **Section: Credits.** Bottom of the project page. List of all collaborators: Architect (the practice), Engineering, Landscape, Interiors, Lighting, Photographer. Standard architectural credit-roll format.
  - **Section: Related Projects.** 3 related projects (similar typology or scale) displayed as a 3-column row of thumbnails with project names below.
  - **CMS Collection "Projects":** Name, Slug, Project Type (option set), Year, Status, Location, Area (sqm or sqft), Hero Image, Long Description (rich text), Image Sequence (multi-image upload, ordered), Drawings (multi-image upload), Materials (multi-reference to Materials collection), Credits (rich text formatted), Photographer Credit, Featured (boolean).

### Page 3 — Practice (About + Approach)

- **Hero:** "PRACTICE." (uppercase tracked.)

- **Section: Who We Are.**
  - Single column 720px max-width. 8-paragraph essay describing the practice's history, founding principles, and approach. Reads like a *Domus* practice profile. Drop-cap on first paragraph. Italics used for emphasis on key concepts. Block quotes for founding-partner statements.

- **Section: Team.**
  - 3-column grid of team members. Each: a small black-and-white portrait (3:4 aspect, formal but not stiff), name (regular weight, 18px), role (uppercase tracked caption), brief 1-paragraph bio. NO LinkedIn icons or social media links — architecture practices traditionally don't surface them.
  - **CMS Collection "Team":** Name, Role, Portrait (B&W, 3:4), Bio (rich text), Joined Year, Education (text — universities + degrees, formatted like CV), Notable Past Work (text — practices previously worked at), Display Order, Tier (Principal / Associate / Senior Architect / Architect).

- **Section: Awards & Recognition.**
  - Stacked list. Each row: year (left, tracked uppercase) | award name | category | project recognized (link to project page). Hairline dividers. Reads like a CV.

- **Section: Selected Publications.**
  - Stacked list. Each row: year | publication name (italic) | article title | author. Click → external URL.

### Page 4 — Materials Library (Distinctive Element)

This page is what sets a serious architecture practice apart — a curated library of materials they've worked with. Demonstrates depth.

- **Hero:** "MATERIALS." Single sentence dek: "A working library of stone, wood, metal, and finish samples used in our projects."

- **Layout:** Asymmetric grid of material cards. Each card: a high-quality close-up photograph of the material sample (4:5 or 1:1 aspect), and below: material name in regular weight, source/supplier, projects where used (linked). Hover: photograph scales subtly, material specifications appear as a small overlay (density, source country, finish details).

- **Filter:** Top of page, small dropdowns: Material Type (Stone / Wood / Metal / Concrete / Finish / Glass), Project Used In, Source Region.

- **CMS Collection "Materials":** Name, Material Type, Sample Photograph, Supplier/Source, Source Region, Specifications (rich text — density, finish, treatment), Used In Projects (multi-reference), Display Order.

### Page 5 — Contact (Restrained)

- **Hero:** "CONTACT."

- **Layout:** Single column, 720px max-width, centered. Content:
  - Office addresses (one per location). For each: practice name, street address, phone number, general inquiries email. Listed formally, no decoration.
  - **Section: Inquiries.** 3 functional emails: New project inquiries (`projects@`), Press (`press@`), Careers (`careers@`). Each as a plain `mailto:` link, underlined on hover.
  - **Section: Visiting.** "Studio visits by appointment only." 1 sentence.
  - No contact form. Architecture practices don't take inbound from forms — qualified clients reach out via email or referral.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Random Hero Image (Page Load):**
- Element: Homepage hero image.
- Trigger: Page load.
- Action: Custom JS reads the "Hero Pool" CMS collection (an array of image URLs), picks one at random, and sets it as the hero image's `src`. Critical: preload all images so subsequent visits don't show flicker. Or: use a single base image with a pre-fetch list and crossfade if user lingers >30s.

**Trigger 2 — Image Scale on Hover (Subtle):**
- Element: Project images in the index.
- Hover (800ms, `cubic-bezier(0.19, 1, 0.22, 1)`): image scales 1 → 1.02 inside an `overflow: hidden` container. Right-side text shifts 4px right (also 800ms). Pure restraint — too much animation breaks the architectural register.

**Trigger 3 — Caption Typography Reveal (Scroll-Tied):**
- Element: Image captions throughout the site.
- Trigger: Image scrolls into view.
- Action: Caption text appears letter-by-letter via a custom typewriter effect (CSS keyframes on individual letter spans, 30ms per letter, total ~600ms for full caption). Subtle. Mimics reading a museum wall caption.

**Trigger 4 — Footer Practice Name Slow Fade-In (Scroll-Tied):**
- Element: Practice name in the footer.
- Trigger: User scrolls to within 200px of footer.
- Action: Practice name fades from `opacity: 0 → 1` over 1500ms (very slow, intentional). Suggests the practice signing off.

**Trigger 5 — No Hover States on Images (Critical):**
- Architecture imagery should NEVER carry "Click to see project" overlays, tinted hover states, or zoom icons. These are e-commerce vocabulary. The image is the project — visitors understand to click.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with architectural namespace `arch-`. Examples: `arch-hero_image`, `arch-project_row`, `arch-caption_tracked`, `arch-drawing_plan`. Utilities: `u-tracked-caption`, `u-tabular-data`, `u-image-fullbleed`, `u-text-restrained`. Globals: `g-section_lg` (240px padding), `g-section_md` (160px), `g-container_text` (720px), `g-container_image` (1440px max).
- **Vertical Rhythm:** Architectural layouts demand generous whitespace. Section padding never below 120px on desktop. Image-to-caption gap exactly 24px. Caption letter-spacing exactly 0.1em uppercase. NEVER shrink these for "tighter" layouts — restraint is the value proposition.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. At all breakpoints, full-bleed images remain full-bleed (don't add side padding). At 991px, the asymmetric scroll-stack collapses to single-column with each project full-width. At 478px, multi-image rows stack vertically.
- **Typography Discipline:** All headlines stay at 400 weight. NEVER use bold. Italics reserved for publication names and conceptual emphasis only. Tracked-uppercase captions are the structural language — apply consistently.

**How to Edit Content & CMS:**

- **Adding a Project:** CMS → Projects → New. Hero Image must be the practice's strongest single image of that project (typically an exterior at golden hour or a hero interior). Image Sequence: 8–15 images, ordered, alternating exterior/interior/detail to create visual rhythm. Drawings: minimum a floor plan and a section. Materials: select from Materials collection — these auto-populate the Materials library page. Credits: include all consultants (engineering, landscape, lighting, etc.) — architectural professional norm.
- **Photography Standards:** All project photography must be commissioned from a professional architectural photographer (Iwan Baan / Hélène Binet caliber). DO NOT use construction photography or amateur shots — destroys credibility. Photographer credit must appear in every caption. Files: 16:9 horizontal exteriors at 2400px, 4:5 portraits at 1600px×2000px, 1:1 detail shots at 1600px×1600px. JPEG quality 92%.
- **Drawing Files:** Plans, sections, axonometrics MUST be exported as line drawings only (no fills, no shadows, no rendered shading). PNG with transparent background or SVG. Black lines on white, line weight hierarchy preserved (heaviest for cut lines, medium for projection lines, lightest for hatching). The drawings should look like CAD prints, not architectural renders.
- **Updating Hero Pool:** CMS → Hero Pool → New. Add a single hero-quality image (any project, signature shot). The homepage random selection picks from this pool. Recommend keeping 5–12 images — fewer feels static, more starts to dilute "the strongest images."
- **Posting Press Mentions:** CMS → Press → New. Year, Publication Name (will be italicized automatically via CSS), Article Title, Author, External URL, Optional excerpt (rich text — used if surfacing on a Press detail page). Listed in chronological order on the Press section.
- **Materials Library:** CMS → Materials → New. Sample Photograph: a high-quality close-up showing material texture and finish (4:5 typical). Specifications field: rich text supporting bold for key specs. "Used In Projects" multi-reference: link to all projects where this material was used — auto-populates back-references on project pages.
- **Critical Restraint:** When adding new content, resist the temptation to add accent colors, decorative dividers, or "interest" elements. The white space and restrained typography ARE the design. Adding "more" makes the practice look less serious.
