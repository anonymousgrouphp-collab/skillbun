# SkillBun

SkillBun is a Next.js career-guidance app for Indian tech students. It combines Google/Supabase auth, profile onboarding, an adaptive Gemini-powered career quiz, Bun-Bot counsellor chat, and interactive learning roadmaps.

## What It Does

- Authenticates students with Google through Supabase.
- Collects degree, current year, and optional interest area during onboarding.
- Runs an adaptive AI career quiz and maps results to native roadmap pages.
- Provides an AI counsellor chat with SkillBun context and markdown answers.
- Uses optional Cloudflare Turnstile plus short-lived signed human-proof tokens before Gemini API calls.
- Stores roadmap progress locally per roadmap.

## Tech Stack

- App: Next.js App Router, React, CSS
- Auth and database: Supabase
- AI proxy: Google Gemini API
- Bot protection: Cloudflare Turnstile, optional

## Requirements

- Node.js `>=20.9.0`
- npm
- Supabase project with Google auth enabled
- Google OAuth client ID
- Gemini API key

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional server-side overrides. If omitted, the NEXT_PUBLIC values are used.
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

GEMINI_API_KEY=your_gemini_api_key
GEMINI_TIMEOUT_MS=20000

# Optional: set both to enable Turnstile.
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

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

## Supabase Table

Create the profile table and enable Row-Level Security:

```sql
create table if not exists public.user_profiles (
  id bigserial primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  degree text not null,
  current_year text not null,
  interest_area text,
  browser text,
  os text,
  device_type text,
  screen_resolution text,
  referral_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read their own profile"
on public.user_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own profile"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.user_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

If your existing table is older, make sure `user_id` is `unique`; the app uses `upsert(..., { onConflict: 'user_id' })`.

## API Routes

- `GET /api/config`: returns Turnstile configuration for the browser.
- `POST /api/human/verify`: verifies Turnstile when enabled and issues a signed human-proof token.
- `POST /api/profile`: validates and stores the authenticated user's profile.
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

## Deployment Notes

- Add your production domain to the Google OAuth client authorized JavaScript origins.
- Enable Google as a provider in Supabase Auth.
- Add production and preview hostnames to Cloudflare Turnstile if Turnstile is enabled.
- Set `HUMAN_PROOF_SECRET` in production so human-proof tokens do not depend on another API key.
