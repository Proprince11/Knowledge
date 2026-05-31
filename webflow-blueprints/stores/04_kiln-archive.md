# Store 4: KILN ARCHIVE

**Digital Product Focus:** Premium recorded course content sold as standalone digital courses — typically $295–$1,995 per course. Includes structured video curricula, written materials (PDF workbooks, reading lists), private community access, and (for higher tiers) office-hour recordings or one-on-one access to the instructor. This complements (rather than replaces) cohort-based offerings — it serves the audience who can't commit to a synchronous cohort but wants the same intellectual content. Examples: **Reforge's on-demand programs**, **Section's self-paced courses**, **Lenny's Newsletter community courses**, **The Generalist's research vault**.

**Conversion Psychology & Strategy:** Self-paced premium courses must overcome a specific objection: "Why should I pay $1,000 for a course I can pirate or replicate from YouTube?" The answer is FOUR things: (1) **the instructor is materially credible** — they're a recognized practitioner, not a generic instructor, (2) **the curriculum is actually structured** — not a YouTube playlist with a paywall, (3) **community access is real** — not a Discord with 5,000 silent lurkers, (4) **the buyer trusts the seller's brand** — typically built via free content (newsletter, podcast, public writing) over years. The store must signal all four immediately.

The aesthetic register is *Reforge meets Substack* — editorial, content-led, with prominent instructor presence. NOT generic Udemy-tier course platform aesthetics.

---

## 1. High-Converting Storefront Architecture

### Homepage / Catalog

- **Hero (60vh, content-led):**
  - Centered, max-width 800px. Top: small uppercase eyebrow ("ON-DEMAND COURSES — TAUGHT BY [INSTRUCTOR]"). H1 in serif (`clamp(2.5rem, 5vw, 4rem)`): "Deep, structured courses on /the work that actually matters./" (Italic mid-headline.) Below: 2-paragraph dek explaining the program library and instructor philosophy. Two CTAs: primary "Browse all courses →", secondary "Read the syllabus" (ghost button).
  - Below: a small "TAUGHT BY [INSTRUCTOR NAME]" line with a small photo. The instructor IS the brand at this tier.

- **Section: All Courses (catalog grid, restrained):**
  - Heading "AVAILABLE COURSES" tracked uppercase. Below: 3-column grid of course cards. Each card:
    - Top: a course-specific cover image — typically an editorial illustration or a stylized typographic treatment (NOT a generic "course thumbnail" with the instructor's face on it)
    - Course title (serif, 24px)
    - Course duration ("8 modules / ~12 hours of video / 6-week program")
    - 1-paragraph description of what the course covers and who it's for
    - Price + CTA "Enroll →"
    - Hover: card border tints to accent color, subtle lift
  - **CMS Collection "Courses":** Title, Slug, Cover Image, Duration (text), Module Count, Total Video Hours, Description (rich text), Who This Is For (rich text), Price, Pre-requisites (text), Display Order, Featured (boolean), Status (Available / Coming Soon / Closed).

- **Section: Why These Courses (instructor authority block):**
  - 2-column. Left: 4-paragraph essay about why the instructor created these courses and what makes them different from typical online learning. Voice: opinionated, slightly pissed-off-with-the-status-quo. Right: a sticky panel showing instructor stats — "Years of experience," "Companies built/operated," "Total students taught," "Books published," "Press features."

- **Section: Featured Course (deep-dive):**
  - Heading: "OUR FLAGSHIP COURSE." A full-width section featuring the most popular/important course. Layout: a 60/40 split — left side is a 2-3 minute promotional video (not a sales pitch — actual instructor speaking about the course content), right side is course summary, syllabus highlights, price, "Enroll →" CTA.

- **Section: Student Outcomes:**
  - Heading "STUDENTS WHO TOOK THESE COURSES." 3-column grid of testimonials. Each card: student photo (color, professional), name + role + company, 2-sentence quote that's SPECIFIC ("I took the Pricing course and immediately raised our consulting rates 40% with the framework — within 3 weeks of finishing."), course taken (link to that course's PDP).
  - **CMS Collection "Student Outcomes":** Name, Photo, Role, Company, Course Taken (reference), Quote (rich text), Outcome Statement (text — the BEFORE → AFTER version), Featured (boolean).

- **Section: Free Resources (lead magnet):**
  - Heading "START WITH OUR FREE RESOURCES." 3-column row of free content: "Newsletter" (link), "Podcast" (link), "Free email course" (5-day sequence — email opt-in form). These free assets are the top of the funnel — buyers typically consume free content for 6-12 months before purchasing a course.

- **Section: FAQ (accordion):**
  - 8-10 high-friction questions: "Are these courses recorded?" / "How long do I have access?" / "Is there a refund policy?" / "Do I get certified?" / "Can I take this course if I'm a complete beginner?" / "Can I expense this through my company?" / "Do you offer team licenses?"

- **Footer:**
  - 4 columns: Courses (links to each PDP) | Resources (Newsletter, Podcast, Free email courses, Blog) | About (Instructor, Press, Speaking) | Contact (Email, Twitter, LinkedIn). Bottom: copyright + small note.

### Product Detail Page (PDP) — the conversion-critical page

- **Hero:** Course title in serif (40px), duration + module count + price, 1-paragraph "What you'll learn" summary, primary CTA "Enroll for $X" (filled, large), secondary "Watch a free preview" (links to a 5-10 min sample lesson video).

- **Section: What You'll Learn (concrete outcomes):**
  - Heading "WHAT YOU'LL WALK AWAY WITH." Below: a 4-6 item list of specific, concrete outcomes. NOT "you will understand pricing strategy" — but "you will have a worked-through pricing model for your specific business + a framework for raising prices defensibly."

- **Section: Curriculum (module-by-module):**
  - Heading "CURRICULUM." Below: a vertical list of all modules. Each module: module number, title, duration ("Module 03 — Pricing Frameworks — 1h 45m"), 2-paragraph description, list of specific lesson topics within that module, "Preview module →" link (opens a sample lesson if the module has one).
  - **CMS Collection "Course Modules":** Title, Module Number, Course (reference), Duration, Description (rich text), Lesson Topics (rich text — bullet list), Preview URL (optional).

- **Section: About the Instructor.**
  - 2-column. Left: a candid photo of the instructor in their work environment. Right: 4-paragraph biography emphasizing operational credibility (companies built, books written, talks given, students taught). Includes 1 italic quote from a notable person endorsing the instructor.

- **Section: Course Materials.**
  - Bullet list of everything included with enrollment: "12 hours of structured video lessons" / "120-page PDF workbook with frameworks and exercises" / "Reading list with 30+ curated resources" / "Lifetime access to private student community" / "Quarterly office-hour recordings (most courses)" / "Certificate of completion."

- **Section: Pricing & Enrollment.**
  - Single-tier pricing presented prominently: "Course Price: $695. One-time payment. Lifetime access. 30-day money-back guarantee."
  - Below: optional add-ons:
    - "1:1 strategy session with [Instructor]" — $1,500 add-on (limited slots)
    - "Team license (5 seats)" — $2,495 (40% discount for teams)
  - Primary CTA "Enroll Now — $695."

- **Section: Student Outcomes (filtered):**
  - 3 testimonials specifically from students who took THIS course. Same format as homepage section.

- **Section: FAQ (course-specific).**
  - Course-specific objections: "Do I need any prerequisites?" / "What if I'm a beginner?" / "How long does the course take to complete?" / "What software/tools are needed?"

- **Section: Final CTA.**
  - Centered. Heading: "Ready to start the course?" Single CTA button. Below: small reassurance text "Lifetime access. 30-day refund policy."

### Cart & Checkout Experience

- **Direct-to-checkout (no cart drawer):** Click "Enroll Now" → goes to Stripe Checkout (or similar). For courses, the cart drawer adds friction without value (most buyers buy 1 course per transaction).
- **Stripe Checkout:** Email, name, billing address, payment method. Optional: company name (B2B / expense reports).
- **Post-purchase delivery:** Within 60 seconds:
  - Email with login credentials to the course platform (typically a separate platform: Memberstack + Webflow, Circle, Mighty Networks, or a custom Webflow + Memberstack integration)
  - Welcome video from the instructor (1-2 min, personal but pre-recorded)
  - PDF workbook download
  - Community access (Slack, Circle, or Discord invitation)
- **Confirmation page:** "Welcome to the course!" — clear next steps, link to platform login, instructor's voice.

---

## 2. Webflow E-commerce / Logic Setup

### Step 1: Course Platform Architecture

Two main paths:

**Path A: Webflow + Memberstack (recommended for content-led courses)**
- Webflow handles marketing pages and the course catalog/PDPs.
- Memberstack handles authentication, member portals, and gating premium content.
- Course videos hosted on Vimeo (Pro/Business plan with privacy + domain whitelisting) or Wistia. Embedded into Webflow pages that are gated by Memberstack groups.
- Pros: Single CMS (Webflow), deep brand customization, predictable monthly cost (~$60-200/mo for Memberstack).
- Cons: Requires careful setup of access groups and gating rules.

**Path B: Course platform (Teachable, Podia, Kajabi, or Maven for cohorts)**
- Webflow is the marketing surface. The course content lives on a dedicated course platform.
- "Enroll" buttons link to the course platform's checkout or use the platform's API to create the user account.
- Pros: Industry-standard course delivery, video player optimized, drip schedules built-in.
- Cons: Brand inconsistency, more vendor lock-in, course platform fees (~$40-150/mo + transaction fees).

For premium ($500+) courses, Path A is recommended — buyers expect a more cohesive brand experience.

### Step 2: Variant System for Tiers

- If offering different tiers (Basic / Pro with 1:1 / Team license), use Webflow E-commerce variants. Each variant maps to a different Memberstack access group OR different add-on benefits.
- Example variant structure for one course:
  - Basic: $695 (course access only)
  - Pro: $1,995 (course + 1:1 strategy session)
  - Team: $2,495 (5 seats, group community access)

### Step 3: Transactional Email Sequence

- Webflow Logic flow on order completion:
  1. **Welcome email** — instant, with login credentials, instructor welcome video, course overview
  2. **Day 1: First lesson nudge** — encourages user to start (improves completion rates dramatically)
  3. **Day 7: Check-in** — "How's the course going? Reply with questions." Personal-feeling auto-email
  4. **Day 30: Post-completion check-in** — "How did you find the course? Would you share your experience?"
  5. **Quarterly: Update emails** — when the instructor adds new content, releases a new course, or hosts a live event
- Use a transactional email service (Resend, Postmark, SendGrid) with deliverability optimization.

### Step 4: Refund & Access Management

- 30-day refund policy: Standard for premium courses. Implementation:
  - Refund request form on a hidden page (`/refund`) or via email
  - Manual review (in case of abuse — rare with high-priced courses)
  - On refund approval: Stripe refund + Memberstack access revocation + community removal (automated via webhook)
- Lifetime access: For non-refunded purchases, access persists indefinitely. Handle account changes (email updates, password resets) via Memberstack's native flows.

---

## 3. Store Owner's Operational Guide

### Fulfillment & Testing

- **Test the full enrollment flow:** Test purchase, confirm welcome email arrives within 60 seconds, confirm Memberstack account created, confirm access to gated course pages, confirm community invite arrives. Document the user-facing experience step-by-step.
- **Edge cases:**
  - Buyer's email differs from existing newsletter subscriber → Memberstack account vs. newsletter list mismatch (handle via email sync)
  - Buyer requests refund within 30 days → automated revocation flow tested
  - Buyer wants to switch tiers post-purchase → manual process (issue partial refund + manually upgrade Memberstack group)
  - Team license: how do team members get access? (Common pattern: primary buyer enters team member emails post-purchase via a form; system creates Memberstack accounts for each)
- **Video player testing:** Test course videos on multiple devices (desktop, iPad, iPhone, Android) and at different network speeds. Vimeo and Wistia handle adaptive bitrate well.
- **Community testing:** Walk through the community onboarding from a fresh student's perspective. Is the welcome flow warm? Are pinned messages clear? Is the community moderated?

### Scaling & Analytics

- **Track these events:**
  - `view_course_pdp` (with course title)
  - `watch_preview_video` (signal of high intent)
  - `click_enroll_button`
  - `complete_purchase` (with course, tier, total)
  - `start_first_lesson` (post-purchase activation)
  - `complete_module` (per module — measures engagement)
  - `complete_course` (graduates — strong outcome signal)
- **Conversion funnel:**
  - PDP visit → preview view: 30-40% (good)
  - PDP visit → purchase: 1-3% for cold traffic, 5-15% for warm/email traffic
  - Preview view → purchase: 8-15%
  - Purchase → first lesson watched within 7 days: 70%+ (good — drives retention)
  - Purchase → course completion: 30-50% (premium course average; lower for self-paced, higher for cohort-based)
- **Email-driven sales:** The newsletter is the primary acquisition channel for premium courses. Pattern: write/share substantive content for free for 12-24 months, build a list of 5K-50K engaged readers, then announce the course to the list. First-week sales typically come 60-80% from the email list.
- **Course updates:** Premium courses should be updated annually (or as content gets stale). Update the curriculum CMS, re-record specific lessons that have aged, add new bonus content. Existing buyers get the updates free (reinforces "lifetime access" promise + drives word-of-mouth).
- **Pricing reviews:** Courses can typically raise prices 10-20% annually. Existing buyers grandfather at their original price; new buyers pay the new price. Announce price increases 30 days in advance ("Price increasing on [Date]" — drives last-minute purchases from undecided buyers).
- **Affiliate program:** For courses with strong reputations, a 30-50% affiliate commission to other operators in the space (newsletter writers, podcasters, course creators) drives 20-40% of revenue. Use Rewardful, FirstPromoter, or Refersion.
- **Press & PR:** Reach out to industry newsletters and podcasts when launching a new course. A single endorsement from a recognized voice in the space can drive $50K-$500K in launch-week revenue.
