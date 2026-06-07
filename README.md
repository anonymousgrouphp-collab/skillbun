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
```

`users/{uid}` stores Firebase account metadata plus SkillBun onboarding fields: `name`, `degree`, `year`, and `interest`.

`users/{uid}/roadmapProgress/{slug}` stores `completedNodeIds` for each roadmap.

Deploy `firestore.rules` so each signed-in user can read and write only their own profile and roadmap progress.

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
