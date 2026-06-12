# SkillBun

SkillBun is a Next.js career-guidance app for Indian tech students. It combines Firebase Authentication, profile onboarding, an adaptive Gemini-powered career quiz, Bun-Bot counsellor chat, Cloud Firestore profile/progress sync, and interactive learning roadmaps.

## What It Does

- Authenticates students with Google or email/password through Firebase Authentication.
- Collects degree, current year, and optional interest area during onboarding.
- Runs an adaptive AI career quiz and maps results to native roadmap pages.
- Provides an AI counsellor chat with SkillBun context, markdown answers, and a visual usage limit progress bar with a live cooldown timer.
- Features an advanced search bar for quickly finding roadmaps and static pages.
- Includes a responsive, multi-theme system (Dark/Light mode) powered by CSS variables.
- Uses optional Cloudflare Turnstile plus short-lived signed human-proof tokens before Gemini API calls.
- Stores profile and roadmap progress in Cloud Firestore, with localStorage used as a browser cache for runtime compatibility.
- Allows students to take a 10-question MCQ exam (3 Easy, 5 Moderate, 2 Hard selected dynamically from a 50-question pool) upon reaching 60% progress on any career roadmap to earn a verifiable digital certification.
- Enforces strict anti-cheating measures (no text selection, right-click, or copy/paste, question timer, user info watermark, light/dark-optimized LLM-refusal watermarks, immediate content masking & background blurring on focus loss, and automatic exam disqualification after 5 focus-switch violations).
- Sends password reset emails via Zoho SMTP (limited to 1/min and 3/hr per email, 10/hr per IP, only incremented on successful send/user-not-found), featuring automatic fallback to Vercel's URL configurations for link generation in serverless environments.
- Provides a public certificate registry lookup search page at `/certificate` with client-side network offline state detection, a dedicated verified certificate dynamic page at `/certificate/[id]`, and integrated entry points across the homepage and navbar dropdown for easy student access.
- Corrects user menu navigation flow by removing the redundant "Learning Progress" button and routing the "Saved Paths" button directly to `/roadmap?view=saved` instead of duplicate `/dashboard` links, with full URL query parameters support on the Roadmap Hub to seamlessly load the appropriate tab (saved vs explore).
- Features an interactive, responsive Slide-out Study Guide Drawer with support for dark/light themes, completion indicators, and direct AI counsellor integration, whitelisting YouTube in the Content Security Policy to prevent iframe blocking.
- Allows students to read all 1,304 generated study guides by correcting URL validation to support relative paths (`/data/docs/...`), adding support for YouTube playlist embeds in the drawer, and whitelisting only verified, active YouTube URLs (via a scanned `verified_videos.json` list of 1,607 URLs) to prevent rendering broken "This video isn't available anymore" iframes, after successfully replacing all 1,850+ hallucinated URLs with real, topic-specific videos via local web scraping.
- Enriches all 100 career roadmaps (3,323 topics) with comprehensive study guides, curated YouTube resources from 100+ channels, and inline doc references — covering every domain from web development and DevOps to cybersecurity, AI/ML, game development, design, and more.
- Protects all 3,335 study guide files with SkillBun Vault (SBV1) — a custom 5-layer encryption system (per-file HKDF key derivation, XOR pepper scramble, AES-256-GCM, SHA-256 integrity hash, obfuscated filenames) served via an authenticated API route. Guest users see roadmap structure and YouTube links; study guides require login. Licensed under CC BY-NC-ND 4.0.

## Tech Stack

- App: Next.js App Router, React, CSS
- Auth and database: Firebase Authentication + Cloud Firestore
- AI proxy: Google Gemini API
- Bot protection: Cloudflare Turnstile, optional

## Requirements

- Node.js `>=20.9.0`
- npm
- Firebase project with Authentication and Firestore enabled
- Google sign-in provider enabled in Firebase Authentication
- Gemini API key

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the repo root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_web_app_id

# Optional Firebase web app values.
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

GEMINI_API_KEY=your_gemini_api_key
GEMINI_TIMEOUT_MS=20000
GEMINI_RATE_LIMIT_PER_MINUTE=12
GEMINI_RATE_LIMIT_PER_HOUR=80
GEMINI_MAX_RETRIES=2

# Optional: keep disabled during development; set TURNSTILE_ENABLED=true when ready.
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
TURNSTILE_ENABLED=false

# Recommended in production.
HUMAN_PROOF_SECRET=generate_a_long_random_secret
HUMAN_PROOF_TTL_MS=1800000
```

3. Start the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Firebase Data Model

Create a Firebase web app, enable Authentication providers for Google and Email/Password, and enable Cloud Firestore.

SkillBun writes user data to:

```text
users/{uid}
users/{uid}/roadmapProgress/{slug}
users/{uid}/quizAttempts/{slug}
certificates/{certId}
```

`users/{uid}` stores Firebase account metadata plus SkillBun onboarding fields: `name`, `degree`, `year`, and `interest`.

`users/{uid}/roadmapProgress/{slug}` stores `completedNodeIds` for each roadmap.

`users/{uid}/quizAttempts/{slug}` stores historical timestamps of quiz attempts to enforce cooldowns and daily attempt limits.

`certificates/{certId}` stores public, verifiable digital certifications containing user metadata, score, and completion timestamp.

Deploy `firestore.rules` so each signed-in user can read and write only their own profile and progress, while certificates are publicly readable.

## Changelog

### v2.3.54 — Enforce Single-Page Print Layout Height Contraints

Guaranteed that the certificate prints strictly on exactly one page, even with custom browser margins:

- Added print overrides in `globals.css` to restrict `html, body` to `height: 100%` and `overflow: hidden`.
- Constrained heights of `.page` and `.container` to `100vh !important` and set `overflow: hidden` in print media.
- Constrained max-height of `.certificateFrame` and `.templateImg` to `100vh !important` with `object-fit: contain` to scale the template proportionally within the page viewport without overflow spilling.

### v2.3.53 — Fix Certificate Print Layout Spilling (Two Pages)

Resolved print layout issue where the certificate was forced to print across two pages:

- Hidden the main navigation bar (`nav`) globally in print media query using `:global(nav) { display: none !important; }`.
- Reset document body padding and margins in print media using `:global(body) { margin: 0 !important; padding: 0 !important; }` to maximize printable height and prevent overflow page breaks.

### v2.3.52 — Perfect Brand Watermark Template Center Offset

Aligned the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` with the template's printed collaboration text on the public certificate page (`/certificate/[id]`):

- Restored the horizontal center offset of `left: 52.75cqi` (with `transform: translateX(-50%)`) to align with the off-center logo position in the Canva template.
- Set container width to a generous `50.0cqi` to prevent any text wrapping or Flexbox overflow truncation, ensuring the watermark aligns with the printed template content.

### v2.3.51 — Fix Brand Watermark Centering & Alignment

Resolved shifting and misalignment of the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` on the public certificate page (`/certificate/[id]`):

- Replaced the off-center fixed-width container (`width: 35.0cqi`, `left: 52.75cqi`) with a full-width transparent container (`width: 100%`, `left: 0`) and Flexbox centering to guarantee 100% horizontal alignment.
- Removed the solid white container background since the new template image background is already clean white in the logo area, preventing patch visual overlaps.
- Removed unused `.skillbunOverlay::before` print rule.

### v2.3.50 — Certificate Watermark Size & Spacing Enhancement

Enlarged the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` and expanded its spacing on the public certificate page (`/certificate/[id]`):

- Increased the font-size of `.skillbunText` from `4.8cqi` to `5.6cqi`.
- Increased the letter-spacing of `.skillbunText` from `0.22cqi` to `0.36cqi` to make the wordmark more prominent and spacious.
- Widened the white background container `.skillbunOverlay` to `35.0cqi` and increased its height to `7.5cqi` to ensure the enlarged text renders completely without wrapping or boundary clipping.
- Repositioned the top coordinate to `9.8cqi` for perfect vertical alignment.

### v2.3.49 — Certificate Unique ID Size Adjustment

Enlarged the unique ID text overlay below the QR code on the public certificate page (`/certificate/[id]`):

- Increased the font-size of `.qrMetaId` from `0.65cqi` to `0.82cqi` to improve legibility and readability.
- Widened the container `.qrMeta` from `9.0cqi` to `10.0cqi` to support the larger font scaling without excessive line wraps, adjusting `left` from `17.5cqi` to `17.0cqi` to maintain perfect centering.

### v2.3.48 — Certificate Recipient Name Visual Improvements

Enhanced the visual presence of the student's name on the public certificate page (`/certificate/[id]`):

- Replaced the muted gold color with a shiny, high-contrast metallic gold gradient (`#BF953F`, `#FCF6BA`, `#B38728`, `#FBF5B7`, `#AA771C`) reflecting metallic light highlights.
- Increased `font-weight` to the maximum ultra-bold value `900` to make the Cinzel font stand out clearly.
- Added a letter-spacing of `0.05em` to improve elegance and readability.
- Added a subtle drop shadow (`filter: drop-shadow(...)`) to create depth and separate the text from the background image.
- Updated print media fallback colors to match the new metallic gold tone `#BF953F`.

### v2.3.47 — Fix Certificate Roadmap Title Position & Overlap

Updated vertical alignment and spacing for the roadmap title overlay on the public certificate page (`/certificate/[id]`):

- Centered the `.roadmapTitle` element vertically in the layout gap using `transform: translate(-50%, -50%)` and `top: 39.4cqi` instead of standard `translateX` and baseline top alignment.
- Reduced `line-height` from `1.3` to `1.1` to reduce the vertical footprint of the heading text and prevent it from overlapping with surrounding template content.

### v2.3.46 — Dynamic Font Sizing for Certificate Roadmap Title

Updated the public certificate page (`/certificate/[id]`) with dynamic sizing for the roadmap title:

- Added a `--char-count` custom property to the roadmap title dynamically calculated based on string length.
- Replaced the static `3.5cqi` font-size of the `.roadmapTitle` class with a `clamp` dynamic calculation (`clamp(4.0cqi, calc(6.5cqi - 0.061cqi * var(--char-count)), 5.8cqi)`) to scale short and long titles gracefully on a single line.
- Updated `letter-spacing` to `0.03em` for proportional letter spacing relative to the dynamic font-size.

### v2.3.45 — Increased Roadmap Title Font Size

Updated style properties on the public certificate page (`/certificate/[id]`):

- Increased the `font-size` of the `.roadmapTitle` overlay class from `2.3cqi` to `3.5cqi` to make the pixelated roadmap title larger and more visually balanced as requested.

### v2.3.44 — Pixelated Font and Shadow for Roadmap Title

Styled the roadmap title overlay on the public certificate page (`/certificate/[id]`):

- Imported the pixelated font family `Pixelify_Sans` from `next/font/google` and applied it to the roadmap title header.
- Added a solid dark offset drop-shadow filter to the roadmap title gradient to give it a retro/arcade blocky outline style that matches the reference template design.

### v2.3.43 — Certificate Design Updates with New Background and Spacing

Integrated design improvements for the public certificate page (`/certificate/[id]`):

- Replaced the template background image (`public/certificate-template.png`) with the new version exported from Canva.
- Restored the certificate ID overlay (`cert.id`) centered directly under the QR code area, while keeping name and roadmap metadata removed as requested.
- Made the brand wordmark (`ꌗꀘꀤ꒒꒒ꌃꀎꈤ`) bolder (`font-weight: 900`) and introduced a slight spacing (`letter-spacing: 0.22cqi`) for an enhanced brand presence.

### v2.3.42 — Certificate Stylized Wordmark and QR Metadata Cleanup

Updated certificate display elements on the public certificate page (`/certificate/[id]`):

- Replaced the plain "SKILLBUN" text overlay with the unique, stylized unicode brand wordmark: `ꌗꀘꀤ꒒꒒ꌃꀎꈤ`.
- Removed font-family and letter-spacing overrides from the wordmark overlay to let browser system fonts render the Yi characters natively.
- Removed the metadata overlay (unique ID, name, roadmap title) from below the QR code area as requested.

### v2.3.41 — Certificate Position Fine-Tuning

Fine-tuned the absolute overlay coordinates and structural layout on the certificate display page (`/certificate/[id]`):

- Added `padding: 0 !important;` to `.certificateFrame` to override the global CSS section padding, ensuring the template background image fills the frame completely.
- Refined the SKILLBUN text overlay to use separate container (`.skillbunOverlay`) and text gradient (`.skillbunText`) elements, preventing rendering conflicts and ensuring complete masking of the underlying green "NO GLYPH" bars.
- Centered the SKILLBUN text overlay exactly at `left: 52.75cqi` with `width: 31.0cqi` based on pixel-level color scanning of the template image.
- Adjusted the vertical coordinates of all absolute text overlays (recipient name at `top: 25.8cqi`, roadmap title at `top: 38.6cqi`, and QR meta at `top: 63.6cqi`) to prevent any text overlaps.

### v2.3.40 — Certificate Page Redesign (Canva Template)

Redesigned the public certificate display page (`/certificate/[id]`) to use a custom Canva-designed template:

- Replaced the fully-coded certificate layout with the Canva-exported circuit-board themed template PNG as a background image.
- Dynamic text overlays (recipient name, roadmap title, certificate ID) are positioned over the template using container query units for proportional scaling across screen sizes.
- Added Cinzel serif font (via `next/font/google`) for premium gold-gradient recipient name and roadmap title styling.
- Overlays SKILLBUN text to fix NO GLYPH font rendering in the exported template.
- Displays certificate ID, user name, and roadmap name below the QR code area.
- Preserved existing actions bar (Print/PDF, LinkedIn sharing), loading/error states, and verification note.
- Updated print media queries for landscape A4 output with solid gold fallback for gradient text.

### v2.3.28 — Project Cleanup

Removed unused files, prototype pages, and development artifacts that were not part of the production application:

- Deleted `app/dashboard-concept/` (unused prototype dashboard with its module CSS).
- Deleted one-time offline scripts: `complete-ds.js`, `complete-remaining.js`, `enrich-roadmaps.js`, `generate-status.js`, `generate-quizzes.js`, and `test_sf_real.js` from `scripts/`. Only `encrypt-docs.js` remains.
- Deleted generated status reports: `public/data/roadmaps_status.json` and `public/data/roadmaps_status.md`.
- Deleted generated Playwright artifacts from `output/` and `test-results/`.
- Deleted root-level `.editorconfig` and Firebase Admin SDK service account JSON file.
- Removed `@playwright/test` and `playwright` from devDependencies (no test files existed).

### v2.3.29 — Code-Level Cleanup

Removed dead code, unused CSS, and stale configuration across the codebase:

- Removed dead `parseGeminiJSON()` function from `utils/client/quiz/quizDom.js` (exported but never called).
- Removed dead `useStoredProfile()` export, its `useSyncExternalStore` import, and the internal `subscribeToProfile()` function from `utils/shared/profileStore.js`.
- Removed 5 unused CSS classes from `app/dashboard/dashboard.module.css` (`.glowBadge`, `.navItem`, `.navItemActive`, `.sidebarTitle`, `.sideNav`, `.sidebar`) — leftovers from before `WorkspaceSidebar` was introduced.
- Removed 8 unused CSS classes from `app/roadmap/roadmap-hub.module.css` (`.catalogTools`, `.categoryCard`, `.categoryCardActive`, `.categoryChip`, `.categoryChipActive`, `.categoryGrid`, `.categoryRail`, `.featuredStrip`) — leftovers from an older category-based layout.
- Removed dead SiliconFlow enrichment env vars (`API_PROVIDER`, `SILICONFLOW_API_KEY`, `SILICONFLOW_MODEL`, `SILICONFLOW_BASE_URL`) from `.env.example`.

### v2.3.30 — Windows Auto-Startup Setup

Added a headless background auto-startup configuration for Windows local development environments:

- Created `SkillBunStart.vbs` in the Windows Startup directory (`shell:startup`) to run the server headlessly and quietly on user login.
- Created `SkillBunStart.bat` in the repository root (added to `.gitignore`) containing the directory navigation and Next.js dev server initiation commands, executed automatically by the VBScript.
- Created a `Stop-SkillBun.bat` utility directly on the user's Desktop that queries active processes on port `3000` (the default dev port) and terminates them on demand.

### v2.3.31 — Windows Auto-Startup Cleanup

Removed the background auto-startup setup and all corresponding utility scripts:

- Deleted `SkillBunStart.vbs` from the Windows Startup folder.
- Deleted `SkillBunStart.bat` and `startup_log.log` from the project directory.
- Deleted the `Stop-SkillBun.bat` helper script from the Desktop.
- Cleaned up the `.gitignore` configuration.

### v2.3.32 — Lower Certification Threshold

Lowered the progress requirement to attempt the certification quiz and earn a verifiable digital certification:

- Updated the certification button unlocking logic on `GameMap.jsx` to check for `>= 60%` progress instead of `100%`.
- Updated eligibility verification and UI warning pages on `/roadmap/[slug]/certify/page.jsx` to align with the new 60% threshold.

### v2.3.33 — Expanded Certification Quiz Bank

Expanded the certification exam question pools to improve diversity and shuffle quality:

- Doubled the quiz question bank size from 25 to 50 questions per roadmap across all 100 career roadmaps (generating 2,500 total questions).
- Maintained difficulty-specific selection logic (pulling 3 Easy, 5 Moderate, 2 Hard questions dynamically for each 10-question exam attempt).
- Updated difficulty distributions in every quiz file to 14 Easy, 26 Moderate, and 10 Hard questions.

### v2.3.39 — Revert Roadmap Tree Canvas Viewport

Reverted the interactive, Figma-style canvas layout on the roadmap skill tree page back to the standard horizontal scrollable container view to optimize usability and rendering.

### v2.3.38 — Roadmap Tree Canvas Viewport

Converted the static SkillBun roadmap tree into an interactive, Figma-style canvas (subsequently reverted in v2.3.39):

- Wrapped the tree mapping in a canvas viewport container with custom state for smooth click-and-drag panning, scrollwheel zooming, and touch-gestures (pinch-to-zoom).
- Implemented a hover-responsive floating overlay toolbar showing Zoom In (+), Zoom Out (-), Reset View (🎯), and the current scale percentage.
- Restructured layout styles so the wide tree diagram structure remains horizontal and explore-friendly on mobile screens, utilizing touch gestures instead of collapsing to vertical lists.
- Prevented scroll-trapping by requiring the Ctrl/Cmd key to zoom with the mouse wheel, letting normal wheel scrolling scroll the page.

### v2.3.37 — Study Guide Button Layout Tuning

Tuned the study guide resource button layout to prevent line wrapping:

- Prevented line wrapping inside study guide resource buttons by adding `white-space: nowrap` and reducing the font-size to `0.74rem`.
- Set tighter character tracking (`letter-spacing: -1.2px`) on the stylized unicode wordmark (`ꌗꀘꀤ꒒꒒ꌃꀎꈤ`) to optimize horizontal footprint.
- Added custom `.sk-res-doc-btn` padding/gap reduction to maximize available space for text alignment inside skill cards.

### v2.3.36 — Stylized Wordmark in Study Guides

Stylized the brand name wordmark inside study guide resource buttons:

- Updated the "SkillBun" text within study guide resource buttons to display the stylized unicode wordmark: `ꌗꀘꀤ꒒꒒ꌃꀎꈤ`.
- Removed custom font overrides from the button title so the rest of the text inherits the default button font layout like other buttons.
- Preserved the linear gradient color styling on the stylized wordmark.

### v2.3.35 — Branded Study Guide Resource Buttons

Renamed and branded all inline study guide resource buttons inside the roadmap skill trees:

- Dynamically renamed the resource button text from generic "Study Guide & Notes" to "Study Guide by SkillBun".
- Applied the unique brand typography (`Fredoka`) and custom CSS styles to the renamed button.
- Styled the "SkillBun" text within the button using a vibrant linear gradient matching the app's premium visual branding.

### v2.3.34 — Roadmap Interrelation Connections

Added dynamic next-step roadmap recommendations across all 100 learning paths:

- Created a central relationship database (`public/data/roadmap_connections.json`) mapping every roadmap to a logical next career path milestone.
- Added a generation builder script (`scripts/build-roadmap-connections.js`) that automatically loads the correct roadmap metadata to construct the lookup.
- Integrated a premium, interactive "Next Recommended Roadmap" button at the bottom of the skill tree view, enabling seamless user transitions between related skills.
- Ensured full theme compatibility for both dark and light modes using the shared token-driven design system.




## API Routes

- `GET /api/config`: returns Turnstile configuration for the browser.
- `GET /api/search`: searches available roadmaps and static pages for the advanced search bar.
- `POST /api/human/verify`: verifies Turnstile when enabled and issues a signed human-proof token.
- `POST /api/gemini`: validates conversation payloads and proxies requests to Gemini.

## Useful Commands

```bash
npm run lint
npm run build
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

## Roadmap Structure Rule

All roadmap pages must render as the same prerequisite tree:

- A roadmap is made of ordered core roots.
- Each core root can branch into child skills.
- Child skills can have their own sub-branches.
- The next core root unlocks only after progress is made in the previous root's terminal branch.
- Handcrafted roadmaps should use `format: "tree"` with `tree[].children`.
- Older roadmap files may keep `stages`; the app normalizes every stage into the same tree structure at render time.

### Deployment Notes

- Add your production and preview domains to Firebase Authentication authorized domains.
- Enable Google and Email/Password providers in Firebase Authentication.
- Publish the Firestore rules in `firestore.rules`.
- Add production and preview hostnames to Cloudflare Turnstile if Turnstile is enabled.
- Set `HUMAN_PROOF_SECRET` in production so human-proof tokens do not depend on another API key.

---
🌐 Built and maintained by **Team Cosmic** (Govt. of India MSME Registered Startup).
