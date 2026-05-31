# Template 4: HELIX BIOWORKS

**Niche/Target Market:** Synthetic biology and biotech startups in the $5M–$80M Series B range — companies engineering microbes for industrial fermentation, building cell-free protein systems, designing CAR-T therapies, or developing CRISPR-based diagnostics. Specifically the *programmable biology* register: Ginkgo Bioworks, Octant, LifeMine, Sherlock Biosciences. Audience is split — they sell to pharma BD teams (need rigor) AND recruit PhD-level scientific talent (need to feel intellectually serious) AND raise from biotech VCs (need to communicate platform thesis). The website threads all three.

**Core Value Proposition & Aesthetics:**

The thesis: scientific work deserves a scientific visual register. Not "Apple-meets-biology" sterility, but the genuine register of a *Nature* paper, a Genentech all-hands deck, a Broad Institute talk. Information density is a feature. White space is structural, not aesthetic. Every visual element refers back to actual scientific objects — molecular structures, sequence data, gel electrophoresis bands, phylogenetic trees.

**Design System:**
- **Typography:** Three-typeface system, each with a job. **Söhne** (or **Inter**) for UI and body — 400 weight, never bolder than 600. **GT Cinetype** (or **Tiempos Text**) — a sturdy serif — for long-form scientific prose, paper abstracts, and editorial content. **JetBrains Mono** (or **IBM Plex Mono**) for sequence data, gene names, scientific notation, and figure captions. Italics used systematically for *gene names* (per scientific convention — *Drosophila*, *cas9*) — this single typographic discipline signals scientific literacy more than any other choice.
- **Color Theory:** Lab-coat white `#FAFAFA` primary surface. Carbon-black `#0A0A0A` text. Two functional accents: oxidative red `#C73E3E` (used for callouts and "active" states only) and cyan `#0CA5E9` (used for scientific diagrams, data visualization, hyperlinks). Specifically uses the *Pantone scientific publication palette* — these two specific colors appear in journal figures, so the site visually echoes the scientific literature it cites. NO gradients. Diagrams use grayscale + the two accents only.
- **Visual Language:** Scientific figures, *as-is*. Phylogenetic trees, plasmid maps, structural biology renderings (PyMOL exports), cell microscopy, gel electrophoresis images. Layout uses scientific-paper conventions: numbered figures with monospace captions ("Figure 3 | Pathway engineering schema, expressed in *S. cerevisiae*"), tables with thick top/bottom rules and hairline middle rules (APA-style), and inline reference citations in superscript (e.g., "the technique we developed¹²").
- **Why $10K+:** Biotech-platform companies routinely commission custom sites at $50K–$120K (think Code & Theory's biotech work). This template provides the rare scientific-aesthetic framework that matches actual journal-paper visual register. Includes a real publications CMS, a "platform technology" feature taxonomy that maps to biotech BD conversations, and a careers page architecture optimized for PhD-level scientific recruiting.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Platform Thesis)

- **Hero (75vh, scientific gravitas):**
  - Centered single-column layout, max-width 960px. Above the fold: a small uppercase eyebrow in monospace + cyan ("PLATFORM BIOLOGY"). Below: H1 in serif, 56px, line-height 1.15, single sentence stating the platform thesis ("We engineer microbial chassis to produce molecules that nature cannot."). Below H1: a 2-paragraph dek in serif body — the first paragraph names the scientific problem, the second states the firm's approach. Below dek: two CTAs — primary "Read our science" (filled black, white text, no rounded corners — angular = scientific), secondary "Partner with us" (ghost, 1px black border).
  - Background: subtle scientific texture — a faded, low-contrast image of a microscope slide pattern or hexagonal molecular grid at 4% opacity. Pure white above and below, fading gradient on the texture so it never dominates.

- **Section: Featured Figure (the signature scientific element):**
  - Heading "Figure 1 | The Platform" in monospace + "PLATFORM ARCHITECTURE" in uppercase eyebrow. Below: a full-width SVG diagram showing the company's actual technology — drawn in the literal style of a *Cell* paper or *Nature* schematic. Multiple labeled components, callout arrows in cyan, gene names in italic monospace, pathway arrows. This is the most important visual on the site. Below the diagram: a serif caption explaining what's depicted, with inline superscript citations linking to the publications page.
  - **CMS:** This figure is replaced via a single "Hero Figure" image upload + a rich-text caption.

- **Section: Programs (3-column scientific cards):**
  - Heading "Programs" + uppercase eyebrow ("CURRENT WORK"). Below: 3 cards representing the firm's research programs. Each card: a small molecular structure thumbnail (PyMOL render or chemical structure SVG) at top-left, program name (medium weight), program stage tag (a monospace pill, e.g., "DISCOVERY" / "OPTIMIZATION" / "PRECLINICAL"), 3-paragraph scientific description, and a "Read more →" link. Hover: card border thickens from 1px hairline to 1px solid black, and the molecular structure thumbnail gets a subtle scale (1.04). No gradients, no shadows.
  - **CMS Collection "Programs":** Name, Slug, Hero Structure Image (for thumbnail), Stage (option set: Discovery / Optimization / Lead Selection / Preclinical / Phase 1 / Phase 2 / Phase 3 / Approved), Description (rich text), Indication (text), Modality (option set: Small Molecule / Biologic / Cell Therapy / Other), Display Order.

- **Section: Recent Publications (CMS, list-style):**
  - Heading "Publications" + uppercase eyebrow ("PEER-REVIEWED OUTPUT"). Below: a stacked list of the 5 most recent publications. Each row: Year (left, monospace, 60px column) | Journal (uppercase italic monospace, e.g., "*NATURE BIOTECHNOLOGY*") | Title (serif, 18px, with italic species names mid-sentence) | Authors (small caption, with company authors in bold). Hairline divider between rows. Title links to the journal's DOI.

- **Section: News / Press (CMS, restrained 3-column):**
  - 3 most recent news items. Each: dateline (monospace), headline (serif), 1-line dek, source ("ENDPOINTS NEWS" / "STAT NEWS" / etc. in uppercase monospace). Click → external news source.

- **Section: Career Hook (recruiting):**
  - Centered. Headline: "Build a platform that produces what nature cannot." Below: 2 sentences on the firm's research culture. Single CTA "View open roles →" routes to careers page.

- **Footer (academic gravitas):**
  - 4 columns: Company (About, Programs, Publications, Press, Careers) | Science (Platform, Publications, Reagent requests, Open data) | Office (Cambridge MA address, Lab address if separate, Phone) | Legal (Terms, Privacy, Accessibility). Below: copyright + a small "Member of XBI / Genome.gov network" line if applicable.

### Page 2 — Platform / Science (The Technical Deep-Dive)

- **Hero (50vh):** "Platform" + 1-paragraph thesis. Below: a navigation rail (sticky on left, scroll-spy linked to section anchors) listing the platform's components — "Chassis Engineering," "Pathway Optimization," "High-Throughput Screening," etc.

- **Section per Platform Component (CMS-driven):**
  - For each component:
    - Component name (H2, serif, 36px), uppercase monospace eyebrow ("COMPONENT 01")
    - 3–4 paragraphs of scientific description (serif, 1.7 line-height, italic species names automatically formatted)
    - A scientific figure (SVG or microscope image) inline, with monospace caption ("Figure 2.1 | Strain selection workflow")
    - A "Selected publications" callout box — bordered with 1px black, monospace font, lists 2–3 papers with citations
    - A hairline divider before the next component
  - **CMS Collection "Platform Components":** Name, Slug, Sequence Number (controls display order), Long Description (rich text), Hero Figure, Figure Caption, Selected Publications (multi-reference to Publications collection).

- **Section: Reagent Sharing Program (academic generosity signal):**
  - Heading "Reagent Sharing." Below: 2-paragraph statement that the firm shares specific strains, plasmids, or cell lines with academic researchers under MTA. List of 4–6 specific reagents available (e.g., "*pHB-DK1 plasmid* | DOI: 10.xxxx/xxx | Available via Addgene"). This is a specific scientific-community signal — companies that share reagents are taken seriously by academic collaborators.

### Page 3 — Publications (CMS Index)

- **Hero:** "Publications." 1-line dek about the company's commitment to peer-reviewed output.

- **Filtering Row:** Year filter (dropdown) | Journal filter (dropdown) | Topic filter (filter pills: "Strain engineering" / "Pathway design" / "High-throughput biology" / etc.) — Finsweet CMS Filter for real-time updates.

- **Index Layout:** Stacked list, single column, max-width 1080px. Each entry:
  - Year (left, monospace, 80px column, 24px font, light weight)
  - Citation block (right, serif body): Title (bold, 20px), authors line (with company authors bolded, others regular), journal italic with volume/issue/pages in monospace, DOI as a link, then below: "Abstract" expandable accordion (click to reveal full abstract from the rich text body), "PDF" link, "Cite" button (copies BibTeX to clipboard).
  - Hairline divider between entries.

- **CMS Collection "Publications":** Title, Authors (rich text — allows bolding company authors), Journal Name, Volume, Issue, Pages, Year, DOI, PDF File (asset upload), Abstract (long text), Topics (multi-reference to Topic collection), Featured (boolean — if true, also surfaces on homepage and Platform pages).

### Page 4 — Careers (PhD-Optimized Recruiting)

- **Hero:** "Build platforms that change what biology can produce." Single sentence. Below: a 4-paragraph section on the firm's research culture — *not* a "perks list," but a description of how science gets done (group meetings, protocol sharing, internal seminar series, publication norms, reagent commons). PhD candidates parse this section more carefully than any other on the site.

- **Section: Open Roles (CMS-driven):**
  - Filter chips at top: Department (Wet Lab / Computational Biology / Operations) | Seniority (PhD / Postdoc / Senior Scientist / Director) | Location.
  - Below: stacked list of open roles. Each: Role title (serif, bold, links to detail page) | small metadata row (Department pill | Seniority pill | Location pill — all monospace uppercase) | 1-paragraph role summary | "View role →" link.

- **Role Detail Page (CMS):** 720px max-width, single column. Hero: role title, dateline ("Posted October 2026"), location, employment type (FTE / Postdoc / Contract). Then 6 standard scientific job sections: "About the Lab," "What you'll do," "What we're looking for," "Our research environment," "How we evaluate," "How to apply." Each is a rich-text block. At the bottom: a clear "Apply via [system]" CTA linking to Greenhouse/Lever/whatever the firm uses.

- **CMS Collection "Open Roles":** Title, Slug, Department (option set), Seniority (option set), Location, Employment Type, Posted Date, About the Lab (rich text), Responsibilities (rich text), Qualifications (rich text), Research Environment (rich text), Application URL.

### Page 5 — Partner / Contact (BD + Press)

- **Hero:** "Partner with us." 2-paragraph dek explaining what partnership means (co-development, licensing, reagent collaboration, contract research).

- **Section: Partnership Pathways (3 columns):**
  - 3 cards, each describing a distinct partnership type:
    1. **Co-development** — early-stage joint program development with shared IP
    2. **Licensing** — out-licensing of platform technologies for specific indications
    3. **Sponsored research** — fee-for-service work using the firm's high-throughput infrastructure
  - Each card: heading, 3-paragraph description, a list of "Recent agreements" (anonymized: "Top-10 pharma in cardiometabolic, 2025"), and a "Inquire →" link with a `mailto:bd@helixbioworks.com?subject=...` pre-fill.

- **Section: Press Contacts:**
  - Heading "Press." 2-row layout: left column for media inquiries (`media@` email + a "Media kit" download link), right column for analyst inquiries (`ir@` email).

- **Section: Office & Lab Locations:** 2-column block. Left: corporate office (Cambridge, MA — full street address). Right: Lab facility (separate address if applicable). Below each: a small monochrome image of the building exterior and a "Visit by appointment only" note.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Scientific Figure Reveal (Scroll-Tied):**
- Element: Each labeled scientific figure (the homepage Figure 1, platform component figures).
- Trigger: "While scrolling in view," 25% from bottom.
- Action 1: SVG paths that compose the figure animate via CSS `stroke-dasharray` + `stroke-dashoffset` — paths "draw in" sequentially over 1800ms total. (Use the SVG technique: set `stroke-dasharray` equal to the path length, animate `stroke-dashoffset` from path-length to 0.)
- Action 2 (200ms after path draw completes): Cyan callout dots fade in with a stagger of 80ms each.
- Result: scientific figures appear to be *constructed* as the user scrolls to them, mimicking the experience of a narrated scientific talk.

**Trigger 2 — Publications Abstract Accordion (Click):**
- Element: "Abstract" link on each publication entry.
- Click: container `height: 0 → auto` with 400ms ease-out. Chevron icon rotates 180°. Text inside fades in 150ms after expand starts. Click again: reverse.
- Custom JS pairing: dynamically calculate `scrollHeight` for each abstract container so the auto-height transition is smooth (Webflow's native auto-height transitions can stutter with dynamic CMS content).

**Trigger 3 — Italic Gene-Name Auto-Formatting (Page Load):**
- Element: All scientific text body content (publications, programs, platform descriptions).
- Trigger: Page load.
- Custom JS: a small script (~40 lines) walks the DOM, finds text matching scientific naming patterns (binomial nomenclature like "Saccharomyces cerevisiae" → both italic; gene names like "TP53" or "cas9" — italic with specific patterns), and wraps them in `<i>` tags. Includes a curated list of ~80 common gene/species names. Maintainable via a JSON config the developer can extend.
- This is the single most important "scientific literacy" signal on the site.

**Trigger 4 — Citation Hover Tooltip:**
- Element: Inline superscript citations (`¹²`).
- Hover (200ms ease-out): A tooltip appears above the citation showing the abbreviated reference ("Kim et al., *Nature Biotech*, 2024"). Tooltip is positioned above via custom CSS, has a 1px black border, no rounded corners, and a small triangle pointer at the bottom.
- Hover out (150ms): Tooltip fades.

**Trigger 5 — Filter Pill Active State (Publications):**
- Click: pill background `transparent → #0A0A0A`, text `#0A0A0A → #FAFAFA`. Chevron beside text rotates 90° if it's a dropdown, or no chevron if it's a toggle pill.
- Custom code coordinates with Finsweet CMS Filter attribute.

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with scientific namespace `sci-`. Examples: `sci-figure_caption`, `sci-publication_row`, `sci-platform_component`, `sci-citation_inline`. Utilities: `u-italic-species`, `u-monospace-caption`, `u-tabular-nums`, `u-hairline-rule`. Globals: `g-section_lg` (160px), `g-container_paper` (1080px max-width — matches academic-paper text width), `g-container_wide` (1280px for diagrams).
- **Grid:** Programs and publications use a uniform 3-column / single-column grid pattern (no asymmetric layouts — biotech aesthetic favors regularity). The platform page uses a 2-column grid (200px left rail + content) via CSS: `grid-template-columns: 200px 1fr; gap: 64px;` with `position: sticky` on the left rail.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Critical: at 991px and below, the platform page's left rail collapses to a top-of-page TOC, then anchor-scrolls to sections.
- **Scientific Figure Sizing:** All scientific figures should be exported at 2x resolution (e.g., 2400px wide for a 1200px display) at 90% PNG/SVG quality. Use SVG when possible (perfect scaling, smaller file). Caption width MUST match figure width — set figure and caption inside the same wrapper with `max-width: 1080px`.
- **Adding a Platform Component:** CMS → Platform Components → New. Set Sequence Number to control order. The left navigation rail auto-updates from the CMS collection.

**How to Edit Content & CMS:**

- **Adding a Publication:** CMS → Publications → New. Title: exactly as it appears on the journal page. Authors: rich text with company authors **bolded** (use the bold formatter — the CSS handles styling). Journal Name: as italic text via the rich-text formatter (typographic convention is that journal names are italicized). Volume/Issue/Pages: monospace fields, formatted as plain numbers. DOI: full URL form (`https://doi.org/10.1038/...`). Abstract: paste the published abstract verbatim from the journal — these are factual, never paraphrase. Topics: select from existing or add new (Topics is a separate CMS collection).
- **Italic Species/Gene Auto-Formatting:** Edit `/utils/sci-italics.json` config file (in Webflow Custom Code section as a `<script>` block). Add new gene/species names to the array as the firm's vocabulary expands. Format: `["Saccharomyces cerevisiae", "Escherichia coli", "TP53", "cas9", "ftsZ"]`. The page-load script wraps any matched text in `<i>` tags automatically.
- **Updating Hero Figure:** Homepage hero figure is a CMS Singleton "Hero Figure" with: Image (SVG or PNG, 2400px wide), Caption (rich text — supports superscript citations linking to Publications). Replace the image and update the caption — the homepage refreshes automatically.
- **Adding a Program:** CMS → Programs → New. Modality: select from option set (drives certain visual treatments — small molecules get a chemical-structure thumbnail, biologics get a ribbon-diagram thumbnail). Stage controls the pill color and label. Description: scientific prose, 3–4 paragraphs, with italic species/gene formatting handled automatically by the page-load script.
- **Posting a Role:** CMS → Open Roles → New. Critical: write the role description in genuine scientific job-description format — not marketing copy. The "About the Lab" section is what PhD candidates read first; it should describe the actual research environment (PI's research focus, recent group publications, weekly seminar series, journal club, equipment available). Rich-text supports lists, links to publications, and inline images of lab spaces.
- **Reagent Sharing Updates:** Reagent list on the Platform page is a CMS collection "Reagents" — fields: Reagent Name, Type (Plasmid / Strain / Cell Line / Antibody), DOI, Addgene Link (or equivalent), Description. Updates here automatically appear on the Platform > Reagent Sharing section.
