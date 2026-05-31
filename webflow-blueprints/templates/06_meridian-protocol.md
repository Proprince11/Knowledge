# Template 6: MERIDIAN PROTOCOL

**Niche/Target Market:** DeFi infrastructure protocols and Web3 developer platforms — L2 scaling solutions, perpetual DEXs, on-chain derivative venues, rollup-as-a-service providers, MEV-aware execution layers, and ZK-proving infrastructure. Tier of Aave, Uniswap, Optimism, Celestia, Eigenlayer. Audience is split: protocol developers integrating the SDK (need docs and clean technical credibility), governance-token holders evaluating the project (need clear tokenomics and roadmap), and institutional capital allocators considering the protocol for treasury or trading desk use (need security disclosures and audit reports).

**Core Value Proposition & Aesthetics:**

The thesis: Web3 infrastructure must communicate three things at once — *technical depth* (real engineers built this), *cypherpunk seriousness* (we're not a NFT-monkey project), and *capital trust* (security and audit primacy). The visual register avoids both the cliché Web3 traps: the gradient-and-NFT visual sludge AND the over-corporate VC-startup blandness. Instead: a neo-brutalist + terminal aesthetic that signals "engineered by people who read papers."

**Design System:**
- **Typography:** **JetBrains Mono** as the primary typeface for headlines, data, and code (yes — monospace for headlines, an aggressive choice that anchors the technical register). Body text in **IBM Plex Sans** at 400 weight for readable long-form. Headlines use mono at heroic sizes (`clamp(3rem, 7vw, 6rem)`) with `letter-spacing: -0.05em` to compress the natural mono spacing. Italics rarely; uppercase frequently for section labels.
- **Color Theory:** True black `#000000` background (not warm — Web3 visual culture demands true black). High-contrast electric green `#00FF85` as primary accent (hex specifically chosen — the green of a profitable trade, of `success` in a CLI). Warning amber `#FFB800` for non-critical alerts. Error red `#FF3B3B` for liquidations and breaking changes. Pure white `#FFFFFF` for body text and headings. Greys: `#0A0A0A`, `#1A1A1A`, `#2A2A2A`, `#666666`, `#AAAAAA` for surface depth.
- **Visual Language:** Neo-brutalist grid — hard 1px borders everywhere (no rounded corners larger than 2px), typographic boxes, raw HTML aesthetic (intentional). Dashboard-style panels with monospace data labels. ASCII-influenced dividers (`────`), terminal prompt indicators (`$ `, `>>> `). Color reserved for state — green for "live," amber for "warning," red for "critical," white for neutral. Charts use only monospace fonts and the accent green/amber/red. No skeuomorphism, no gradients, no decorative elements.
- **Why $10K+:** Top DeFi protocols spend $80K–$200K on website design (Optimism's site, Uniswap's, Aave's). The aesthetic is genuinely hard to execute — most attempts veer either into NFT-cringe or corporate-bland. This template provides the structural foundation: a working data-feed component pattern, real audit-report CMS, governance-proposal CMS, and a developer-focused information architecture that aligns with protocol BD priorities.

---

## 1. Page-by-Page Architecture

### Page 1 — Homepage (The Protocol Surface)

- **Hero (90vh, dashboard-style):**
  - Top of page: a thin status bar (40px tall) spanning full-width with: status indicator dot (green when live, animated subtle pulse) + "MAINNET LIVE" + chain name pills ("ETHEREUM" "ARBITRUM" "BASE" "OPTIMISM" — protocols supported) + a small TPS/throughput counter on the right ("12,847 TPS — 24H AVG").
  - Below: split layout. Left 55%: H1 in mono ("Programmable execution / for capital markets / on Ethereum.") — three-line break, hard left-aligned. 2-line dek below in IBM Plex Sans. Two CTAs: primary "Read the Docs" (white background, black text, sharp 0px corners), secondary "View on GitHub" (1px white border, ghost button) with an open-source link icon.
  - Right 45%: A live data panel — a brutalist-styled box with 1px white border. Inside: 4 metric rows in monospace. "TOTAL VALUE LOCKED: $4.2B" / "24H VOLUME: $187M" / "ACTIVE CONTRACTS: 14,239" / "GAS SAVED: 89%". Each row has a subtle change indicator next to it (green up-arrow `▲ +2.4%` or red down `▼ -0.8%`). Numbers update via a custom JS pulling from a public API endpoint (template ships with the working JS shell — buyer connects their actual data source).

- **Section: How It Works (3-column, terminal aesthetic):**
  - 3 cards arranged in a row. Each card: 1px white border, no rounded corners. Card content:
    - Top: a small uppercase label in green ("01 / EXECUTE")
    - Heading in mono (28px)
    - 3-line description in IBM Plex Sans
    - Bottom: a code snippet in true monospace with syntax highlighting — 4 lines showing the actual SDK usage. Green keywords, amber strings, white function names. Copy button top-right of code block.
  - The 3 cards represent the protocol's primary user flows: (1) Execute orders, (2) Source liquidity, (3) Settle on-chain.

- **Section: Protocol Architecture Diagram (the technical signature):**
  - Heading "ARCHITECTURE" in uppercase mono, green accent. Below: a full-width SVG diagram of the protocol's actual architecture — drawn in the literal style of an Ethereum yellowpaper figure. Components are labeled boxes connected by directional arrows. Mempool → Sequencer → Validator → Settlement Layer. Boxes have monospace labels, hairline white borders, true-black fills. Arrows are 1px white with chevron arrowheads. No decoration. Below diagram: a monospace caption ("FIG 1. Protocol execution path. Settlement T+0 on Ethereum L1 via fraud proofs.").

- **Section: Security & Audits (the trust block):**
  - Heading "SECURITY" + small green dot indicator. Two-column layout. Left: 3-paragraph statement on the protocol's security philosophy (bug bounty program with Immunefi, formal verification of core contracts, multiple independent audits). Right: a list of audit reports — each row: audit firm logo (monochrome, e.g., Trail of Bits, ChainSecurity, OpenZeppelin), audit date, scope description, "View report PDF →" link in green. Hairline divider between rows.

- **Section: Ecosystem (CMS-driven integrations):**
  - Heading "ECOSYSTEM." Below: a grid of integrated protocols/projects. Each cell: monochrome logo (white on black), project name in mono, integration type tag ("LIQUIDITY PROVIDER" / "FRONT-END" / "AGGREGATOR" / "ORACLE"). Hover: cell border thickens to 2px green, logo gets a subtle green glow (`filter: drop-shadow(0 0 8px #00FF85)`).
  - **CMS Collection "Ecosystem":** Project Name, Logo, Project URL, Integration Type, Featured (boolean), Display Order.

- **Section: Latest Activity (live feed):**
  - Heading "RECENT ACTIVITY." Below: a stacked list of 8 recent protocol events. Each row: timestamp (monospace, relative time "12 SEC AGO" / "3 MIN AGO"), event type pill (green outline pill: "SWAP" / "LIQUIDATION" / "GOVERNANCE VOTE" / "DEPOSIT"), short description in mono, transaction hash truncated with copy button (`0x7a3f...8ed1`). Hairline divider between rows.
  - This list updates live via the same API as the hero metrics — feels like a Bloomberg terminal.

- **Section: Get Started (developer CTA):**
  - Centered. Heading: "Build on Meridian." 2 sentences below. CTAs: "Read the Docs →" + "Get Testnet Tokens →." Behind: a faint scrolling marquee of code (CSS animation) — actual snippets from the SDK, fading at edges, providing texture.

- **Footer (terminal-style):**
  - 5 columns: Protocol (Docs, GitHub, Whitepaper, Audits, Status) | Ecosystem (Integrations, Grants, Bug Bounty) | Governance (Forum, Snapshot, DAO) | Resources (Blog, Newsletter, Brand Kit) | Community (Discord, Twitter/X, Mirror, Farcaster). Bottom: a small "Disclaimer: Meridian Protocol is open-source software. Not investment advice." in tiny grey monospace.

### Page 2 — Documentation (Developer-First)

- **Hero:** Mono H1 "Documentation." Below: "Build with Meridian's SDK in TypeScript, Rust, or Solidity."

- **Layout:** Three-column. Left 220px: persistent navigation rail with collapsible sections (Getting Started → Concepts → SDK Reference → Smart Contracts → Examples → Recipes). Center 720px: documentation content with code blocks, callouts, and inline diagrams. Right 240px: a contextual TOC for the current page (auto-generated from H2 headings, highlights as user scrolls).

- **Documentation Page Components:**
  - Code blocks with syntax highlighting (use Prism.js or highlight.js — template ships with custom-code embed). Languages auto-detected from the language identifier. Copy button on every code block.
  - Callout boxes: 4 variants (info / warning / danger / tip) — each with a left border in the appropriate accent color (green / amber / red / cyan), 1px white border on other 3 sides, mono label.
  - Inline diagrams: SVG architecture diagrams that scale with the content column.
  - "Edit this page on GitHub" link at bottom of every doc page (auto-generated from the file path).

- **CMS Collection "Documentation":** Title, Slug, Section (option set: Getting Started / Concepts / SDK / Contracts / Examples / Recipes), Subsection, Display Order, Rich Text Body, Last Updated, Edit URL.

### Page 3 — Tokenomics & Governance (The Capital Page)

- **Hero:** Mono H1 "TOKEN." Below: 1-paragraph description of the protocol's token role (utility, fee-share, governance — never speculative).

- **Section: Token Distribution (data-dense):**
  - Heading "ALLOCATION" + small mono label "TOTAL SUPPLY: 1,000,000,000 MERI." Below: a pure data visualization — a horizontal stacked bar showing allocations by category (Community, Treasury, Investors, Team, Ecosystem) in shades of green/grey. Below the bar: a table with rows for each allocation, showing percentage, token count, vesting schedule, cliff date. Tabular-nums throughout.

- **Section: Vesting Schedule (chart):**
  - Heading "VESTING." A simple chart showing token unlock schedule over time (years 1–4). Use Chart.js or a custom SVG line chart. Lines colored by allocation category, with a vertical "current date" indicator showing how much is unlocked right now.

- **Section: Fee Mechanism:**
  - Heading "FEE FLOW." A flow diagram (SVG) showing how protocol fees are distributed: User → Protocol → 50% Treasury / 30% Stakers / 20% Buyback. Each node is a labeled box with monospace, arrows show direction. Below diagram: a 3-paragraph explanation in body text.

- **Section: Governance:**
  - Heading "GOVERNANCE." 2-paragraph philosophy. Below: a CMS-driven list of recent governance proposals. Each: proposal number (`MIP-43`), title, status pill (Active / Passed / Failed / Pending — colored), date, voting period dates, vote counts (For / Against / Abstain). Click → external Snapshot or governance forum URL.

- **CMS Collection "Governance Proposals":** Number, Title, Slug, Status, Submitted Date, Voting Start, Voting End, Description (rich text), External URL (Snapshot link).

### Page 4 — Roadmap & Status (Public Accountability)

- **Hero:** "ROADMAP" mono H1.

- **Section: Current Status (live):**
  - 4 monospace status rows showing current focus areas of the protocol. Each row: phase label ("PHASE 03 — INSTITUTIONAL ONBOARDING") + a horizontal progress bar (1px white border, green fill) + percentage complete + estimated completion date.

- **Section: Quarterly Roadmap (CMS-driven, vertical timeline):**
  - Vertical timeline. Each quarter is a section. Inside each: a list of milestones with status icons (●  in-progress / ✓ completed / ○ planned / ✗ deprioritized). Each milestone: short description, related GitHub issue link if applicable.

- **Section: Status Page (live):**
  - Heading "SYSTEM STATUS." Same aesthetic as a status.io page but custom-built. Components: Mainnet Operations, Sequencer, Settlement Layer, Bridge, RPC Endpoints, Frontend. Each: a status indicator (green ✓ Operational / amber ⚠ Degraded / red ✗ Outage) + last incident date + 90-day uptime percentage. Updates can be statically managed or pulled from a status API.

- **CMS Collection "Roadmap Milestones":** Title, Quarter, Status, Description, Related GitHub URL, Display Order Within Quarter.

### Page 5 — Community & Resources (Hub)

- **Hero:** "COMMUNITY."

- **Section: Channels (4-column):**
  - 4 cards: Discord, Twitter/X, Forum (Discourse), Farcaster. Each card: 1px border, monochrome icon (large), platform name in mono, subtitle ("Daily discussion" / "Updates and announcements" / "Long-form governance debate" / "Decentralized social"), member/follower count if available, "Join →" link.

- **Section: Grants Program:**
  - Heading "GRANTS." 2-paragraph description of the grants program (what gets funded, typical grant size, application criteria). Below: a list of recent grant recipients (CMS-driven). Each: project name, grant size, grant date, project URL, project description (1 sentence).

- **Section: Bug Bounty:**
  - Heading "BUG BOUNTY." 2-paragraph description with key bounty details: total bounty pool, severity tiers (Critical: $250K / High: $50K / Medium: $10K / Low: $1K), scope. CTA: "Submit on Immunefi →" external link.

- **Section: Brand Kit:**
  - Heading "BRAND ASSETS." Direct download links: Logo SVG, Logo PNG (light + dark), Wordmark, Brand Guidelines PDF. Each as a button.

---

## 2. Advanced Webflow Interactions & Animations

**Trigger 1 — Live Data Update Pulse (No User Trigger):**
- Element: Each metric row in the hero data panel.
- Trigger: When the JS data fetch returns new values (every 30 seconds).
- Action: The number's text content updates. Simultaneously: the entire row gets a brief green flash background (`background-color: rgba(0, 255, 133, 0.1)` for 200ms, then fades to `transparent` over 600ms via CSS transition). Suggests "live" without being annoying.

**Trigger 2 — Status Indicator Dot Pulse (CSS Animation):**
- Element: Green status dot in the status bar.
- Pure CSS: `@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 133, 0.4); } 50% { box-shadow: 0 0 0 6px rgba(0, 255, 133, 0); } }`. Animation: `pulse 2s infinite`. Subtle radiating ring around the dot.

**Trigger 3 — Architecture Diagram Path Animation (Scroll-Tied):**
- Element: SVG arrows in the architecture diagram.
- Trigger: "While scrolling in view," 30% from bottom.
- Action: SVG arrows draw in sequentially via `stroke-dasharray` + `stroke-dashoffset` animation. Each arrow has a 200ms stagger. Arrowheads fade in (opacity 0 → 1) after path completes. Total animation: ~2 seconds.

**Trigger 4 — Code Block Copy with Mono Confirm:**
- Element: Copy button on any code block.
- Click: Button text changes from `[ COPY ]` to `[ ✓ COPIED ]` in green for 2 seconds, then reverts. Custom JS handles `navigator.clipboard.writeText()` from the code block's text content.

**Trigger 5 — Activity Feed Auto-Scroll (Optional):**
- Element: Recent Activity feed.
- Trigger: Page idle for 30 seconds.
- Action: New activity rows append to the top, pushing older rows down with a 400ms slide animation. Enabled via a setting in the data feed JS — buyer can disable if they prefer static.

**Trigger 6 — Brutalist Hover State (All Buttons + Cards):**
- Element: Any bordered card or button.
- Hover: Border color shifts from white to green (200ms), `transform: translate(-2px, -2px)` (lifts up-left), and a hard-edged box-shadow appears at offset (4px, 4px) — solid green color, no blur. This is the signature neo-brutalist hover. Mouse out: snap back instantly (50ms).

---

## 3. Bespoke Developer & Editor Guide

**How to Edit Layout & Structure:**

- **Naming:** Client-First with protocol namespace `proto-`. Examples: `proto-status_bar`, `proto-data_panel`, `proto-doc_callout-warning`, `proto-card_brutalist`. Utilities: `u-mono`, `u-mono-uppercase`, `u-tabular-nums`, `u-text-success`, `u-text-warning`, `u-text-danger`. Globals: `g-section_lg` (120px), `g-section_md` (80px), `g-container_dense` (1240px).
- **Grid:** Documentation uses CSS Grid with three columns: `220px 1fr 240px` with `gap: 48px`. Below 1200px: collapses to single column with the nav rail moving to a top hamburger menu. Status bar uses Flexbox for justified spacing.
- **Breakpoints:** 1920px / 1440px / 991px / 767px / 478px. Mobile critical change: the data panel in the hero collapses to a horizontal scroll row of metric cards instead of a stacked vertical panel.
- **Border System:** All borders are exactly 1px white at 100% opacity (`#FFFFFF`). NEVER use rgba opacity for borders — the brutalist aesthetic requires the border to be visible at full strength. Hover-active borders use `2px` and the green accent.
- **Adding a Documentation Page:** CMS → Documentation → New. Set Section, Subsection, Display Order. Body uses rich text with code blocks (paste code, select, choose "Code Block" from formatter, then add language identifier as a class on the rendered output via custom code embed). Navigation rail auto-rebuilds from the CMS.

**How to Edit Content & CMS:**

- **Connecting Live Data:** The hero metric panel and Recent Activity feed use a custom JS module in Project Settings → Custom Code. Search for `// METRIC ENDPOINTS — REPLACE`. Replace placeholder URLs with the protocol's actual API endpoints. Endpoints must return JSON in the format documented in the comments. Refresh interval is configurable (default 30s).
- **Posting Audit Reports:** CMS → Audit Reports → New. Required: Audit Firm Name, Firm Logo (monochrome SVG), Audit Date (ISO date), Scope (1-line description), Report PDF (file upload). Optional: Critical/High/Medium/Low findings counts. Listed automatically on the Security section in chronological order.
- **Adding Governance Proposals:** CMS → Governance Proposals → New. Number must follow MIP-XX format (Meridian Improvement Proposal). Status: Pending / Active / Passed / Failed / Cancelled — drives pill color. External URL points to Snapshot or governance forum where actual voting happens.
- **Updating Tokenomics:** Tokenomics page is partially CMS-driven (allocations, vesting schedule are CMS Singletons). The bar chart and vesting chart use Chart.js — update the data array in the page's custom code section. Allocation percentages must sum to 100% (template includes a validation script that warns if they don't).
- **Brand Kit Assets:** Stored in Webflow Assets folder `/brand-kit/`. Direct download URLs auto-generated. Update by replacing the file in the asset manager — the public URL stays stable.
- **Status Page:** Two modes — manual (CMS-driven, edit each component's status manually) or API-driven (connect to a status.io / Statuspage API). Toggle via a settings field in the CMS Singleton "Status Config."
- **Discord/Twitter Member Counts:** These are static placeholders in the template — the buyer can either keep them static (update monthly) or wire them to the platforms' APIs (template ships with optional JS shells for Discord guild API and Twitter API v2).
