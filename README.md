# 🐰 SkillBun — Hop into the Right Career

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Database-Firebase%2012-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

SkillBun is an advanced, high-performance career guidance and interactive learning ecosystem designed for Indian tech students. Built using Next.js App Router, React 19, and vanilla CSS, the platform bridges the gap between academic education and industry requirements through AI-driven personalization, structured learning roadmaps, and robust skill certification.

---

## 🚀 Core Features & Capabilities

### 🎯 Adaptive AI Career Quiz
- **Tailored Questioning**: Generates adaptive questions via the Google Gemini API based on a student's onboarded profile (degree, year, and interests).
- **Abuse Prevention**: Runs Cloudflare Turnstile verification with short-lived, signed human-proof tokens to prevent automated script usage.
- **Intelligent Recommendations**: Maps quiz scores and answers directly to native career roadmap pages.

### 🗺️ Dynamic Interactive Roadmaps
- **100 Curated Paths**: Cover Web Development, DevOps, AI/ML, Cybersecurity, Game Dev, System Design, and more.
- **Prerequisite Tree Structure**: Features core root nodes branching into child skills, unlocking progressively based on completed milestones.
- **Unified Normalization**: Supports tree-based and stage-based data representations, auto-normalizing them at runtime.
- **Interrelation System**: Intelligently recommends the "Next Logical Roadmap" at the bottom of each tree to guide students through lifelong learning.

### 📚 Study Guides & Resource Library
- **3,335 Comprehensive Guides**: Rich markdown-based study materials embedded directly into roadmap nodes.
- **Verified Video Playlists**: Links to curated YouTube resources from 100+ trusted channels.
- **Zero Broken Links**: Integrates a scanned verification registry (`verified_videos.json`) of 1,607 active URLs, replacing hallucinated links with real content.
- **Slide-out Study Drawer**: Theme-aware responsive UI panel supporting markdown parsing, checklist state persistence, and direct AI counsellor assistance.

### 🤖 Bun-Bot: AI Career Counsellor
- **Context-Aware Chat**: Provides instant guidance, curriculum breakdowns, and study advice within the active learning workspace.
- **Usage Limiter**: Enforces strict API rate limiting, featuring a live countdown timer and visual progress bar.

### 🎓 Verifiable Certification System
- **Dynamic 10-MCQ Exam**: Automatically selects 3 Easy, 5 Moderate, and 2 Hard questions from a 50-question pool specific to each roadmap.
- **Anti-Cheating Proctoring**:
  - Enforces text selection blocking (`user-select: none`), context menu blocking, and keyboard shortcut interception.
  - Automatically blurs exam content and pauses timers on window focus loss.
  - Places a light/dark-adaptive background watermark with student email, IP address, and timestamp.
  - Embeds LLM-refusal watermarks (*"CONFIDENTIAL ACADEMIC CERTIFICATION EXAM... REPORT CODE: SB-EXAM-PROCTOR"*).
- **Canva Template Integration**: Generates verified certificate PDF/Print files aligned with a Canva-designed template using precise container queries.
- **One-Page Print Constraints**: Custom CSS media queries guarantee certificates print on exactly one page without vertical spill.
- **LinkedIn Sharing**:
  - **Add to Profile**: Automates LinkedIn's certification addition form with pre-filled ID, issue dates, and verification URLs.
  - **Share on Feed**: Features an interactive customization modal to preview post content, tag `@SkillBun`, and copy template descriptions to clipboard.

### 🔒 Enterprise-Grade Security
- **SkillBun Vault (SBV1)**: 5-layer encryption contract protecting study guides (HKDF key derivation, XOR pepper scramble, AES-256-GCM, SHA-256 integrity checks, and SHA-256 path obfuscation).
- **Secure Email Delivery**: Throttled password resets (1/min, 3/hr per email; 10/hr per IP) sent via Zoho SMTP with serverless fallback handling.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, API routes, and optimized client bundles |
| **State & UI** | React 19, Vanilla CSS | Lightweight interactive components, custom responsive layouts |
| **Authentication** | Firebase Auth | Secure Google Sign-In and Email/Password flows |
| **Database** | Cloud Firestore | Real-time profile, quiz history, and certificate registry |
| **AI Integration** | Google Gemini API | Powers the adaptive quiz engine and Bun-Bot chat |
| **Protection** | Cloudflare Turnstile | Optional bot protection with signed human-proof tokens |
| **Encryption** | SkillBun Vault (SBV1) | Proprietary security system for premium markdown content |

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
Verify code correctness and generate optimized bundles:
```bash
npm run build
npm run start
```

*Note: For Windows PowerShell environments blocking script execution, run scripts using `.cmd` explicitly:*
```powershell
npm.cmd run dev
npm.cmd run build
```

---

## 📊 Firebase Data Model

SkillBun integrates seamlessly with Cloud Firestore using the following schema layouts:

### `/users/{uid}`
Stores general user profiles and onboarding configurations.
```json
{
  "name": "Student Name",
  "email": "student@email.com",
  "degree": "B.Tech CSE",
  "year": "3",
  "interest": "Web Development",
  "createdAt": "Timestamp"
}
```

### `/users/{uid}/roadmapProgress/{slug}`
Tracks node completions within a specific learning roadmap.
```json
{
  "completedNodeIds": ["html-basics", "css-flexbox", "js-variables"],
  "updatedAt": "Timestamp"
}
```

### `/users/{uid}/quizAttempts/{slug}`
Logs quiz attempt history to enforce exam cooldown rules.
```json
{
  "attempts": [
    {
      "timestamp": "Timestamp",
      "score": 8,
      "passed": true
    }
  ]
}
```

### `/certificates/{certId}`
Public certificate lookup registry.
```json
{
  "uid": "user_firebase_uid",
  "studentName": "Student Name",
  "roadmapTitle": "Fullstack Web Development",
  "score": 90,
  "issueDate": "Timestamp",
  "certId": "cert_xxxx_xxxx"
}
```

---

## 🔒 Security Policies (Firestore Rules)
Deploy the following rules to secure user data while keeping certificates publicly verifiable:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /roadmapProgress/{roadmapId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /quizAttempts/{roadmapId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /certificates/{certId} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

---

## 📂 API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/config` | `GET` | Returns client-side Turnstile site configurations | No |
| `/api/search` | `GET` | Queries index for roadmaps and static pages | No |
| `/api/human/verify` | `POST` | Validates Turnstile captcha and issues signed tokens | No |
| `/api/gemini` | `POST` | Proxies prompts to Google Gemini under rate limits | Yes |
| `/api/docs/[slug]/[topicId]` | `GET` | Decrypts and serves SkillBun Vault (SBV1) study guides | Yes (Firebase ID Token) |

---

## 📜 Project Changelog

### v2.6.2 — Harden SBV1 Live Study Guide Loading
- Matched the Next.js output file tracing include to the exact dynamic `/api/docs/[slug]/[topicId]` route so encrypted SBV1 files are bundled reliably for the deployed API route.
- Normalized `DOCS_ENCRYPTION_KEY` at runtime to tolerate accidental copied whitespace or wrapping quotes while preserving the required 64-character hex key validation.
- Incremented project version to 2.6.2.

### v2.6.1 — SBV1 Study Guide Deployment Fix
- Included encrypted `content/docs` SBV1 vault files in Next.js server output tracing so deployed API routes can read study guides at runtime.
- Pinned the authenticated `/api/docs/[slug]/[topicId]` route to the Node.js runtime because it intentionally uses filesystem and crypto APIs for SBV1 decryption.
- Incremented project version to 2.6.1.

### v2.6.0 — Legal & Compliance Documentation Renewal
- Renewed and updated the Terms of Use and Privacy Policy pages to be highly professional, comprehensive, and legally robust.
- Addressed specific technical and policy details including Firebase authentication, Firestore Firestore Rules, Zoho SMTP, Google Gemini API terms, Cloudflare Turnstile bot protection, and SkillBun Vault (SBV1) encryption guidelines.
- Incremented project version to 2.6.0.

### v2.3.60 — Comprehensive Documentation Renewal
- Redesigned and renewed the project `README.md` into enterprise-ready documentation.
- Integrated dynamic system architecture overviews, security contracts, and database blueprints.
- Performed final dependency and environment checks, bumping project version to 2.3.60.

### v2.3.59 — Interactive Share Customization Modal
- Created an interactive share guidance popup modal for the "Share on Feed" action on the public certificate page (`/certificate/[id]`).
- Added a customizable text editor popup modal when a student clicks the "Share on Feed" button, allowing them to preview and edit their LinkedIn post content before sharing.
- Integrated a step-by-step guidance list explaining how to copy the post text, launch the LinkedIn sharing tab, paste (Ctrl+V) the content, and tag the official company page `@SkillBun`.
- Designed the modal using theme-respecting local CSS classes, smooth keyframe transitions, and a blur backdrop.

### v2.3.58 — Prevent Weird 'C' Character Rendering in Certificate Preview
- Updated the homepage mock certificate roadmap placeholder to avoid using the letter 'C' due to blocky pixel artifacts in the `Pixelify_Sans` font.
- Replaced `'CHOSEN CAREER PATH'` with `'YOUR LEARNING ROADMAP'` (Length: 21).
- Updated `--char-count` properties to match the new string size.

### v2.3.57 — Generic Placeholders for Homepage Certificate Preview
- Updated the homepage mock certificate preview overlays to use generic, descriptive placeholders to prevent hardcoded user data representations.
- Changed name overlay to `'STUDENT NAME'`.
- Changed roadmap title overlay to `'CHOSEN CAREER PATH'`.
- Changed certificate verification ID to `'cert_xxxx_xxxx'`.
- Adjusted `--char-count` properties to match the new placeholder string length for proportional scaling.

### v2.3.56 — Homepage Mock Certificate Redesign
- Redesigned the mock certificate preview shown on the homepage certifications section (`/`) to match the Canva-template design from the certificate verification page.
- Imported and instantiated `Cinzel` and `Pixelify_Sans` fonts in `app/page.jsx`.
- Replaced the CSS-drawn mock certificate container with the Canva certificate template background image (`/certificate-template.png`) and matched overlay fields (watermark, recipient name, roadmap title, and certificate ID).
- Appended responsive container-query-based layout overlay styling rules (`.sb-cert-mock-overlay-skillbun`, `.sb-cert-mock-name`, `.sb-cert-mock-title`, etc.) in `app/globals.css` using `cqi` units for proportional font and coordinate scaling.

### v2.3.55 — Split LinkedIn Actions & Tagging Automation
- Split the "Share on LinkedIn" button on the certificate verification page (`/certificate/[id]`) into two distinct actions and implemented automated clipboard tag templates to enhance student sharing and brand outreach.
- Created **Add to Profile** button: Directs students to LinkedIn's Licenses & Certifications form pre-filled with the certification name (formatted as `[Roadmap Title] Certification`), issuing organization (defaults to "SkillBun"), issue year, issue month, unique credential ID, and direct verification link.
- Created **Share on Feed** button: Shares the verified certificate link to the user's timeline.
- Automated Tag Copying: Auto-copies a customized post description template containing the `@SkillBun` tag and verification link to the user's clipboard upon clicking "Share on Feed".
- Added Toast Notification: Displays a themed, animated fade-in confirmation toast ("📋 Post template copied! Paste (Ctrl+V) on LinkedIn to tag @SkillBun.") that auto-dismisses after 4 seconds.
- Created optional configuration support: Documented `NEXT_PUBLIC_LINKEDIN_ORGANIZATION_ID` in `.env.example` to link certificates to the official organization logo if configured, falling back to the text name "SkillBun" (matching username `skillbun-tech`) if not set.
- Styled actions bar buttons: Made "Add to Profile" solid LinkedIn blue, and "Share on Feed" a clean, theme-aware outline blue button.

### v2.3.54 — Enforce Single-Page Print Layout Height Constraints
- Guaranteed that the certificate prints strictly on exactly one page, even with custom browser margins.
- Constrained heights of `.page` and `.container` to `100vh !important` and set `overflow: hidden` in print media.
- Constrained max-height of `.certificateFrame` and `.templateImg` to `100vh !important` with `object-fit: contain` to scale the template proportionally within the page viewport without overflow spilling.

### v2.3.53 — Fix Certificate Print Layout Spilling (Two Pages)
- Resolved print layout issue where the certificate was forced to print across two pages.
- Hidden the main navigation bar (`nav`) globally in print media query using `:global(nav) { display: none !important; }`.
- Reset document body padding and margins in print media using `:global(body) { margin: 0 !important; padding: 0 !important; }` to maximize printable height and prevent overflow page breaks.

### v2.3.52 — Perfect Brand Watermark Template Center Offset
- Aligned the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` with the template's printed collaboration text on the public certificate page (`/certificate/[id]`).
- Restored the horizontal center offset of `left: 52.75cqi` (with `transform: translateX(-50%)`) to align with the off-center logo position in the Canva template.
- Set container width to a generous `50.0cqi` to prevent any text wrapping or Flexbox overflow truncation, ensuring the watermark aligns with the printed template content.

### v2.3.51 — Fix Brand Watermark Centering & Alignment
- Resolved shifting and misalignment of the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` on the public certificate page (`/certificate/[id]`).
- Replaced the off-center fixed-width container (`width: 35.0cqi`, `left: 52.75cqi`) with a full-width transparent container (`width: 100%`, `left: 0`) and Flexbox centering to guarantee 100% horizontal alignment.
- Removed the solid white container background since the new template image background is already clean white in the logo area, preventing patch visual overlaps.
- Removed unused `.skillbunOverlay::before` print rule.

### v2.3.50 — Certificate Watermark Size & Spacing Enhancement
- Enlarged the stylized brand watermark `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` and expanded its spacing on the public certificate page (`/certificate/[id]`).
- Increased the font-size of `.skillbunText` from `4.8cqi` to `5.6cqi`.
- Increased the letter-spacing of `.skillbunText` from `0.22cqi` to `0.36cqi` to make the wordmark more prominent and spacious.
- Widened the white background container `.skillbunOverlay` to `35.0cqi` and increased its height to `7.5cqi` to ensure the enlarged text renders completely without wrapping or boundary clipping.
- Repositioned the top coordinate to `9.8cqi` for perfect vertical alignment.

### v2.3.49 — Certificate Unique ID Size Adjustment
- Enlarged the unique ID text overlay below the QR code on the public certificate page (`/certificate/[id]`).
- Increased the font-size of `.qrMetaId` from `0.65cqi` to `0.82cqi` to improve legibility and readability.
- Widened the container `.qrMeta` from `9.0cqi` to `10.0cqi` to support the larger font scaling without excessive line wraps, adjusting `left` from `17.5cqi` to `17.0cqi` to maintain perfect centering.

### v2.3.48 — Certificate Recipient Name Visual Improvements
- Enhanced the visual presence of the student's name on the public certificate page (`/certificate/[id]`).
- Replaced the muted gold color with a shiny, high-contrast metallic gold gradient (`#BF953F`, `#FCF6BA`, `#B38728`, `#FBF5B7`, `#AA771C`) reflecting metallic light highlights.
- Increased `font-weight` to the maximum ultra-bold value `900` to make the Cinzel font stand out clearly.
- Added a letter-spacing of `0.05em` to improve elegance and readability.
- Added a subtle drop shadow (`filter: drop-shadow(...)`) to create depth and separate the text from the background image.
- Updated print media fallback colors to match the new metallic gold tone `#BF953F`.

### v2.3.47 — Fix Certificate Roadmap Title Position & Overlap
- Updated vertical alignment and spacing for the roadmap title overlay on the public certificate page (`/certificate/[id]`).
- Centered the `.roadmapTitle` element vertically in the layout gap using `transform: translate(-50%, -50%)` and `top: 39.4cqi` instead of standard `translateX` and baseline top alignment.
- Reduced `line-height` from `1.3` to `1.1` to reduce the vertical footprint of the heading text and prevent it from overlapping with surrounding template content.

### v2.3.46 — Dynamic Font Sizing for Certificate Roadmap Title
- Updated the public certificate page (`/certificate/[id]`) with dynamic sizing for the roadmap title.
- Added a `--char-count` custom property to the roadmap title dynamically calculated based on string length.
- Replaced the static `3.5cqi` font-size of the `.roadmapTitle` class with a `clamp` dynamic calculation (`clamp(4.0cqi, calc(6.5cqi - 0.061cqi * var(--char-count)), 5.8cqi)`) to scale short and long titles gracefully on a single line.
- Updated `letter-spacing` to `0.03em` for proportional letter spacing relative to the dynamic font-size.

### v2.3.45 — Increased Roadmap Title Font Size
- Updated style properties on the public certificate page (`/certificate/[id]`).
- Increased the `font-size` of the `.roadmapTitle` overlay class from `2.3cqi` to `3.5cqi` to make the pixelated roadmap title larger and more visually balanced as requested.

### v2.3.44 — Pixelated Font and Shadow for Roadmap Title
- Styled the roadmap title overlay on the public certificate page (`/certificate/[id]`).
- Imported the pixelated font family `Pixelify_Sans` from `next/font/google` and applied it to the roadmap title header.
- Added a solid dark offset drop-shadow filter to the roadmap title gradient to give it a retro/arcade blocky outline style that matches the reference template design.

### v2.3.43 — Certificate Design Updates with New Background and Spacing
- Integrated design improvements for the public certificate page (`/certificate/[id]`).
- Replaced the template background image (`public/certificate-template.png`) with the new version exported from Canva.
- Restored the certificate ID overlay (`cert.id`) centered directly under the QR code area, while keeping name and roadmap metadata removed as requested.
- Made the brand wordmark (`ꌗꀘꀤ꒒꒒ꌃꀎꈤ`) bolder (`font-weight: 900`) and introduced a slight spacing (`letter-spacing: 0.22cqi`) for an enhanced brand presence.

### v2.3.42 — Certificate Stylized Wordmark and QR Metadata Cleanup
- Updated certificate display elements on the public certificate page (`/certificate/[id]`).
- Replaced the plain "SKILLBUN" text overlay with the unique, stylized unicode brand wordmark: `ꌗꀘꀤ꒒꒒ꌃꀎꈤ`.
- Removed font-family and letter-spacing overrides from the wordmark overlay to let browser system fonts render the Yi characters natively.
- Removed the metadata overlay (unique ID, name, roadmap title) from below the QR code area as requested.

### v2.3.41 — Certificate Position Fine-Tuning
- Fine-tuned the absolute overlay coordinates and structural layout on the certificate display page (`/certificate/[id]`).
- Added `padding: 0 !important;` to `.certificateFrame` to override the global CSS section padding, ensuring the template background image fills the frame completely.
- Refined the SKILLBUN text overlay to use separate container (`.skillbunOverlay`) and text gradient (`.skillbunText`) elements, preventing rendering conflicts and ensuring complete masking of the underlying green "NO GLYPH" bars.
- Centered the SKILLBUN text overlay exactly at `left: 52.75cqi` with `width: 31.0cqi` based on pixel-level color scanning of the template image.
- Adjusted the vertical coordinates of all absolute text overlays (recipient name at `top: 25.8cqi`, roadmap title at `top: 38.6cqi`, and QR meta at `top: 63.6cqi`) to prevent any text overlaps.

### v2.3.40 — Certificate Page Redesign (Canva Template)
- Redesigned the public certificate display page (`/certificate/[id]`) to use a custom Canva-designed template.
- Dynamic text overlays (recipient name, roadmap title, certificate ID) are positioned over the template using container query units for proportional scaling across screen sizes.
- Added Cinzel serif font (via `next/font/google`) for premium gold-gradient recipient name and roadmap title styling.
- Overlays SKILLBUN text to fix NO GLYPH font rendering in the exported template.
- Displays certificate ID, user name, and roadmap name below the QR code area.
- Preserved existing actions bar (Print/PDF, LinkedIn sharing), loading/error states, and verification note.
- Updated print media queries for landscape A4 output with solid gold fallback for gradient text.

### v2.3.28 — Project Cleanup
- Removed unused files, prototype pages, and development artifacts that were not part of the production application.
- Deleted `app/dashboard-concept/` (unused prototype dashboard with its module CSS).
- Deleted one-time offline scripts: `complete-ds.js`, `complete-remaining.js`, `enrich-roadmaps.js`, `generate-status.js`, `generate-quizzes.js`, and `test_sf_real.js` from `scripts/`. Only `encrypt-docs.js` remains.
- Deleted generated status reports: `public/data/roadmaps_status.json` and `public/data/roadmaps_status.md`.
- Deleted generated Playwright artifacts from `output/` and `test-results/`.
- Deleted root-level `.editorconfig` and Firebase Admin SDK service account JSON file.
- Removed `@playwright/test` and `playwright` from devDependencies (no test files existed).

### v2.3.29 — Code-Level Cleanup
- Removed dead code, unused CSS, and stale configuration across the codebase.
- Removed dead `parseGeminiJSON()` function from `utils/client/quiz/quizDom.js` (exported but never called).
- Removed dead `useStoredProfile()` export, its `useSyncExternalStore` import, and the internal `subscribeToProfile()` function from `utils/shared/profileStore.js`.
- Removed 5 unused CSS classes from `app/dashboard/dashboard.module.css` — leftovers from before `WorkspaceSidebar` was introduced.
- Removed 8 unused CSS classes from `app/roadmap/roadmap-hub.module.css` — leftovers from an older category-based layout.
- Removed dead SiliconFlow enrichment env vars from `.env.example`.

### v2.3.30 — Windows Auto-Startup Setup
- Added a headless background auto-startup configuration for Windows local development environments.
- Created `SkillBunStart.vbs` in the Windows Startup directory to run the server headlessly and quietly on user login.
- Created `SkillBunStart.bat` in the repository root containing the directory navigation and Next.js dev server initiation commands, executed automatically by the VBScript.
- Created a `Stop-SkillBun.bat` utility directly on the user's Desktop that queries active processes on port `3000` and terminates them on demand.

### v2.3.31 — Windows Auto-Startup Cleanup
- Removed the background auto-startup setup and all corresponding utility scripts.
- Deleted `SkillBunStart.vbs` from the Windows Startup folder.
- Deleted `SkillBunStart.bat` and `startup_log.log` from the project directory.
- Deleted the `Stop-SkillBun.bat` helper script from the Desktop.
- Cleaned up the `.gitignore` configuration.

### v2.3.32 — Lower Certification Threshold
- Lowered the progress requirement to attempt the certification quiz and earn a verifiable digital certification.
- Updated the certification button unlocking logic on `GameMap.jsx` to check for `>= 60%` progress instead of `100%`.
- Updated eligibility verification and UI warning pages on `/roadmap/[slug]/certify/page.jsx` to align with the new 60% threshold.

### v2.3.33 — Expanded Certification Quiz Bank
- Expanded the certification exam question pools to improve diversity and shuffle quality.
- Doubled the quiz question bank size from 25 to 50 questions per roadmap across all 100 career roadmaps.
- Maintained difficulty-specific selection logic (pulling 3 Easy, 5 Moderate, 2 Hard questions dynamically for each 10-question exam attempt).
- Updated difficulty distributions in every quiz file to 14 Easy, 26 Moderate, and 10 Hard questions.

### v2.3.39 — Revert Roadmap Tree Canvas Viewport
- Reverted the interactive, Figma-style canvas layout on the roadmap skill tree page back to the standard horizontal scrollable container view to optimize usability and rendering.

### v2.3.38 — Roadmap Tree Canvas Viewport
- Converted the static SkillBun roadmap tree into an interactive, Figma-style canvas (subsequently reverted in v2.3.39).
- Wrapped the tree mapping in a canvas viewport container with custom state for smooth click-and-drag panning, scrollwheel zooming, and touch-gestures (pinch-to-zoom).
- Implemented a hover-responsive floating overlay toolbar showing Zoom In (+), Zoom Out (-), Reset View (🎯), and the current scale percentage.
- Restructured layout styles so the wide tree diagram structure remains horizontal and explore-friendly on mobile screens, utilizing touch gestures instead of collapsing to vertical lists.
- Prevented scroll-trapping by requiring the Ctrl/Cmd key to zoom with the mouse wheel, letting normal wheel scrolling scroll the page.

### v2.3.37 — Study Guide Button Layout Tuning
- Tuned the study guide resource button layout to prevent line wrapping.
- Prevented line wrapping inside study guide resource buttons by adding `white-space: nowrap` and reducing the font-size to `0.74rem`.
- Set tighter character tracking (`letter-spacing: -1.2px`) on the stylized unicode wordmark (`ꌗꀘꀤ꒒꒒ꌃꀎꈤ`) to optimize horizontal footprint.
- Added custom `.sk-res-doc-btn` padding/gap reduction to maximize available space for text alignment inside skill cards.

### v2.3.36 — Stylized Wordmark in Study Guides
- Stylized the brand name wordmark inside study guide resource buttons.
- Updated the "SkillBun" text within study guide resource buttons to display the stylized unicode wordmark: `ꌗꀘꀤ꒒꒒ꌃꀎꈤ`.
- Removed custom font overrides from the button title so the rest of the text inherits the default button font layout like other buttons.
- Preserved the linear gradient color styling on the stylized wordmark.

### v2.3.35 — Branded Study Guide Resource Buttons
- Renamed and branded all inline study guide resource buttons inside the roadmap skill trees.
- Dynamically renamed the resource button text from generic "Study Guide & Notes" to "Study Guide by SkillBun".
- Applied the unique brand typography (`Fredoka`) and custom CSS styles to the renamed button.
- Styled the "SkillBun" text within the button using a vibrant linear gradient matching the app's premium visual branding.

### v2.3.34 — Roadmap Interrelation Connections
- Added dynamic next-step roadmap recommendations across all 100 learning paths.
- Created a central relationship database (`public/data/roadmap_connections.json`) mapping every roadmap to a logical next career path milestone.
- Added a generation builder script (`scripts/build-roadmap-connections.js`) that automatically loads the correct roadmap metadata to construct the lookup.
- Integrated a premium, interactive "Next Recommended Roadmap" button at the bottom of the skill tree view, enabling seamless user transitions between related skills.
- Ensured full theme compatibility for both dark and light modes using the shared token-driven design system.

---

🌐 Built and maintained by **Team Cosmic** (Govt. of India MSME Registered Startup).
