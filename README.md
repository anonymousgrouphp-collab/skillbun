# 🐰 SkillBun - Hop into the Right Career

SkillBun is an AI-powered career guidance platform for Indian tech students (BCA, BSc, BS/BS-MS AICS/CSDA, and B.Tech).
It helps students discover suitable career tracks using an adaptive quiz and an AI counsellor chat.

Built by Team SkillBun:
- Harsh Patel
- Rainee Patel
- Aiman Patil
- Harshit Patidar
- Ravi Patel

## ✨ What's New

- Profile onboarding flow (name, email, degree, year) before quiz/counsellor usage.
- Optional server-side profile sync to Supabase via `/api/profile`.
- Human verification flow with optional Cloudflare Turnstile.
- Signed short-lived `x-skillbun-human` token required for Gemini API proxy calls.
- Hardened Gemini proxy validation (conversation structure, text size, payload limits, timeout handling).
- Enhanced quiz result handling with roadmap URL normalization and safe fallback links.
- Bun-Bot chat improvements: markdown rendering, history trimming, local per-hour send limit, clear chat action.
- Security hardening with Helmet CSP, strict rate limits, body size limits, and dotfile blocking.

## 🎯 Core Features

- Adaptive AI Career Quiz (typically 10 to 18 questions).
- AI Career Counsellor (Bun-Bot) for role, salary, and roadmap guidance.
- Career recommendation cards with skills, demand, salary range, next steps, and roadmap links.
- Profile-aware responses based on student degree and year.
- Optional CAPTCHA and bot-protection gate before AI usage.

## 🛠️ Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- AI: Google Gemini (`gemini-2.5-flash` via proxy)
- Security: Helmet, express-rate-limit, CORS, request validation
- Optional Data Store: Supabase REST API
- Optional Bot Protection: Cloudflare Turnstile

## 📋 Requirements

- Node.js 18+ (required for built-in `fetch`)
- npm
- Google Gemini API key

## 🚀 Setup

1. Clone and install:
```bash
git clone https://github.com/anonymousgrouphp-collab/skillbun.git
cd skillbun
npm install
```

2. Create `.env` in project root:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000

# Optional: production CORS allowlist (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Optional: Gemini upstream timeout (ms)
GEMINI_TIMEOUT_MS=20000

# Optional: Turnstile CAPTCHA (set both to enable)
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Optional: secret used to sign human-proof tokens
HUMAN_PROOF_SECRET=generate_a_long_random_secret
HUMAN_PROOF_TTL_MS=1800000

# Optional: Supabase profile storage
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROFILE_TABLE=user_profiles
SUPABASE_PROFILE_UPSERT=true
PROFILE_STORAGE_TIMEOUT_MS=20000
```

3. Start server:
```bash
npm start
```

4. Open app:
- `http://localhost:3000/index.html`

## 🗄️ Supabase Table (Optional)

Use this table for profile sync:

```sql
create table if not exists public.user_profiles (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  degree text not null,
  year text not null,
  entrypoint text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz default now()
);
```

If table exists without unique email:

```sql
alter table public.user_profiles
add constraint user_profiles_email_key unique (email);
```

## 🔌 API Endpoints

- `GET /api/config`
  - Returns captcha config for frontend.

- `POST /api/human/verify`
  - Verifies Turnstile token when enabled.
  - Issues signed short-lived human-proof token.

- `POST /api/profile`
  - Validates and stores profile data.
  - Returns `stored: false` when Supabase is not configured.

- `POST /api/gemini`
  - Requires `x-skillbun-human` header.
  - Validates conversation payload and proxies request to Gemini.

## 🛡️ Security Notes

- General rate limit: 60 requests/min/IP.
- Gemini endpoint limit: 25 requests/min/IP.
- JSON body limit: 100kb.
- Dotfile and `.env` access blocked from static routes.
- CSP configured for self-hosted assets + Turnstile scripts.
- HTML assets are no-cache in production; static assets are cacheable.

## 🧪 Useful Scripts

```bash
npm start   # run server
npm run dev # run with nodemon
```

## 📄 Legal Pages

- `public/about.html`
- `public/terms.html`
- `public/privacy.html`

These pages were updated to match the current product behavior, data flow, and security model.
