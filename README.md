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
- Allows students to take a 10-question MCQ quiz (3 Easy, 5 Moderate, 2 Hard) upon reaching 100% progress on any career roadmap to earn a verifiable digital certification.
- Enforces strict anti-cheating measures (no text selection, right-click, or copy/paste, question timer, user info watermark, light/dark-optimized LLM-refusal watermarks, immediate content masking & background blurring on focus loss, and automatic exam disqualification after 5 focus-switch violations).
- Sends password reset emails via Zoho SMTP (limited to 1/min and 3/hr per email, 10/hr per IP, only incremented on successful send/user-not-found), featuring automatic fallback to Vercel's URL configurations for link generation in serverless environments.
- Provides a public certificate registry lookup search page at `/certificate` with client-side network offline state detection, a dedicated verified certificate dynamic page at `/certificate/[id]`, and integrated entry points across the homepage and navbar dropdown for easy student access.
- Corrects user menu navigation flow by removing the redundant "Learning Progress" button and routing the "Saved Paths" button directly to `/roadmap?view=saved` instead of duplicate `/dashboard` links, with full URL query parameters support on the Roadmap Hub to seamlessly load the appropriate tab (saved vs explore).
- Features an interactive, responsive Slide-out Study Guide Drawer with support for dark/light themes, completion indicators, and direct AI counsellor integration, whitelisting YouTube in the Content Security Policy to prevent iframe blocking.
- Allows students to read all 1,304 generated study guides by correcting URL validation to support relative paths (`/data/docs/...`), adding support for YouTube playlist embeds in the drawer, and whitelisting only verified, active YouTube URLs (via a scanned `verified_videos.json` list of 1,607 URLs) to prevent rendering broken "This video isn't available anymore" iframes, after successfully replacing all 1,850+ hallucinated URLs with real, topic-specific videos via local web scraping.

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

## Sourcing and Enrichment Pipeline

To enrich all 100 career roadmaps with in-depth study documentation and verified resources, an offline generator script is provided:

```bash
node scripts/enrich-roadmaps.js
```

### LLM Providers & Configurations

The script supports Google Gemini, SiliconFlow, and standard OpenAI-compatible APIs (like local Ollama). Configure the following in your `.env` file:

- **Gemini (Default)**:
  ```env
  API_PROVIDER=gemini
  GEMINI_API_KEY=your_key_here
  ```
- **SiliconFlow (DeepSeek / Qwen)**:
  ```env
  API_PROVIDER=siliconflow
  SILICONFLOW_API_KEY=your_siliconflow_key_here
  SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
  SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
  ```
- **Ollama / Custom OpenAI Endpoint**:
  ```env
  API_PROVIDER=openai
  OPENAI_API_KEY=ollama
  OPENAI_MODEL=qwen2.5:7b
  OPENAI_BASE_URL=http://localhost:11434/v1
  ```

### Script Capabilities:
1. **Multi-Provider LLM Integration**: Dynamically routes API calls through Gemini, SiliconFlow, or standard OpenAI/Ollama endpoints. Supports indexed keys (e.g. `SILICONFLOW_API_KEY_2`) for concurrent execution.
2. **Pipeline Architecture**: Processes roadmaps in two stages using a dynamic task queue. Workers 1 to 4 optimize the structure and add/update nodes, while remaining workers validate resources, correct irrelevant YouTube videos, and generate study guides.
3. **Dynamic Scaling & Load Balancing**: Uses parallel workers matching the number of API keys defined in `.env`. Workers 1 to 4 automatically transition to help with Phase 2 once Phase 1 is finished, ensuring maximum speed.
4. **Resumable Runs & Local Disk Cache Skipping**: Automatically checks if a topic's Markdown study guide already exists on disk (under `public/data/docs/`). If the file exists, it skips the LLM API call entirely, updates the JSON structure in memory, and moves on, saving API quota and preventing duplicate costs.
5. **Outage Resilience**: Implemented a 6-attempt retry strategy with exponential backoff (10s, 20s, 30s, etc.) to gracefully handle LLM API 500 (Internal Server Error) and 503 (Unavailable) codes.
6. **Options**:
   - `--file <filename.json>`: Runs only on the specified roadmap file for testing.
   - `--limit <number>`: Processes only the first N roadmaps.

### Running on Google Colab (Free T4 GPU + Local Ollama)

If you do not have an API key or want to run generation 100% free offline, you can run the enrichment pipeline directly on Google Colab:

1. **Mount Drive or Clone Repo in a Colab Cell**:
   ```bash
   !git clone https://github.com/your-username/skillbun-backup.git
   %cd skillbun-backup
   !npm install
   ```

2. **Install & Run Ollama in Colab**:
   ```python
   # Install Ollama client
   !curl -fsSL https://ollama.com/install.sh | sh

   # Start Ollama server in background
   import subprocess
   import time
   subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
   time.sleep(5)  # Wait for startup

   # Pull Qwen 2.5 Coder or standard model
   !ollama pull qwen2.5:7b
   ```

3. **Configure Environment & Run**:
   ```python
   import os
   os.environ["API_PROVIDER"] = "openai"
   os.environ["OPENAI_API_KEY"] = "ollama"
   os.environ["OPENAI_BASE_URL"] = "http://localhost:11434/v1"
   os.environ["OPENAI_MODEL"] = "qwen2.5:7b"

   # Run the enricher script
   !node scripts/enrich-roadmaps.js
   ```

4. **Commit and Push Back**:
   ```bash
   !git config --global user.name "Your Name"
   !git config --global user.email "your.email@example.com"
   !git add public/data/
   !git commit -m "Enrich roadmaps with Colab Ollama"
   !git push origin main
   ```

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
