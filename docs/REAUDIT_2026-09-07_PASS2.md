# SkillBun — Re-Audit Pass 2

**Target:** https://skillbun.tech/ · **Version:** 2.10.8 (`732578a`, pushed) · **Date:** 2026-09-07
**Prior passes:** [PRODUCTION_AUDIT_REPORT.md](PRODUCTION_AUDIT_REPORT.md) (v2.9.3) · [REAUDIT_2026-09-07.md](REAUDIT_2026-09-07.md) (v2.10.7)

---

## Verdict

**Every code-level finding is now fixed.** H1, B2 residual, N2, N3 all verified. Tests 28 → 29, lint clean, 0 vulnerabilities, build green.

**N1 is still open: production's backend is still 500ing.** The dependency fix shipped and is deployed, but it did not resolve the crash — so **my Pass 1 root cause was wrong**. Corrected diagnosis below, with the evidence that rules out what I previously blamed.

| ID | Item | Pass 1 | Now |
|---|---|---|---|
| **N1** | 31/35 API routes 500 in production | 🔴 Blocker | 🔴 **Still open** — new diagnosis |
| H1 | Alumni IDOR | 🔴 Still open | ✅ Fixed |
| B2 residual | `list: if signedIn()` | 🟡 Medium | ✅ Fixed |
| N2 | `jose` phantom dep | 🟠 High | ✅ Fixed |
| N3 | `isDevBypass` | 🟡 Low | ✅ Fixed |
| — | `/manifest.json` 404 | ❌ | ✅ Fixed (200) |
| H4 | CSP `unsafe-inline` | ❌ | ❌ Still open |

---

## N1 — Corrected diagnosis 🔴

### What I got wrong in Pass 1

I blamed `@google-cloud/firestore` being an unlisted `optionalDependency` of firebase-admin combined with `serverExternalPackages`. You made that fix correctly:

```
@google-cloud/firestore      ^8.7.1     ← added
@google-cloud/storage        ^7.22.0    ← added
jose                         ^6.2.12    ← added
serverExternalPackages: ['firebase-admin', '@google-cloud/firestore', '@google-cloud/storage', 'nodemailer']
```

Lockfile is in sync and none are flagged optional (`optional=false dev=false` for all three, `lockfileVersion: 3`). **The 500s did not change.** That eliminates module resolution as the cause. My diagnosis was wrong.

### Confirmed still broken, and confirmed deployed

v2.10.8 *is* live — `/manifest.json` was added in that commit and now returns 200 (was 404). So this is not a stale deployment.

```
/api/config                     200   ← no firebaseAdmin import
/api/search?q=react             200   ← no firebaseAdmin import
/api/human/verify               400   ← no firebaseAdmin import (correct validation error)
/api/admin/certificates         500 0B
/api/admin/analytics            500 0B
/api/admin/workforce/employees  500 0B
/api/certify/start (POST)       500 0B
/api/certify/mint               500 0B
/api/docs/react/intro           500 0B
/api/alumni/documents           500 0B
/api/quiz/questions             500 0B
/api/portal/credentials         500 0B
```

The split is still exactly "imports `firebaseAdmin`" vs "doesn't." Pages, static assets, `/manifest.json`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml` are all 200.

**The same commit is healthy locally.** Rebuilt HEAD (`exit 0`, 158 pages) and ran `next start` with the real `.env` present:

```
LOCAL /api/config                200
LOCAL /api/admin/certificates    401   ← correct auth denial
LOCAL /api/quiz/questions        401   ← correct
LOCAL /api/alumni/documents      401   ← correct (H1 fix working)
LOCAL /api/certify/start         405   ← correct (POST-only)
```

`.env` exists locally with real `FIREBASE_ADMIN_*` values, so the local run exercised the genuine firebase-admin path — not a fallback. The code is fine.

### Leading hypothesis: Node runtime version

`firebase-admin@14.2.0` requires **Node ≥ 22**:

```js
// node_modules/firebase-admin/package.json
"engines": { "node": ">=22" }
```

The project's `engines` field permits Node 20:

```js
// package.json
"engines": { "node": ">=20.0.0 <=22.x" }
```

Vercel reads `engines.node` to pick the runtime. A range starting at `>=20.0.0` can resolve to Node 20, on which firebase-admin@14 is unsupported — and an unsupported-runtime failure at module load produces exactly the observed signature: `500` with `Content-Length: 0`, `x-matched-path` set, `x-vercel-cache: MISS`. Routing succeeded; the function died before it could write a response body.

Note `.nvmrc` says `22`, but Vercel prefers `engines.node` over `.nvmrc` — so the two disagree and the looser one likely wins.

**Fix — pin the floor to 22:**

```json
"engines": { "node": "22.x" }
```

Then in the Vercel dashboard confirm **Settings → General → Node.js Version** is 22.x (a dashboard override beats `engines`), and redeploy.

I could not verify the runtime version from outside, so this is a strong hypothesis, not a confirmed cause — I was wrong once already on this bug and want to be explicit about the confidence level.

### Read the function log before applying any fix

This has now cost two speculative fixes. The one thing that resolves it definitively is the error text, and it is one click away:

**Vercel dashboard → your project → Logs → filter to Function → invoke `/api/config` (works) then `/api/admin/certificates` (fails), compare.** Or `vercel logs <deployment-url> --follow` (CLI is not installed locally).

The error string tells you which of these it is:

| Log line | Cause | Fix |
|---|---|---|
| `MODULE_NOT_FOUND` / `Cannot find module` | packaging | name the module; adjust `serverExternalPackages` |
| `Unsupported engine` / `SyntaxError` at load | Node 20 vs `>=22` | `"engines": {"node": "22.x"}` |
| `Cannot read properties of undefined` in init | env var missing/malformed | check `FIREBASE_ADMIN_*` in Production scope |
| `FUNCTION_INVOCATION_FAILED` + OOM | memory | raise function memory |

**Also worth checking while you are in there:** the env var names are `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` (note the `_ADMIN_` infix — `utils/server/env.js:145-155` reads no aliases). Confirm all three exist in the **Production** environment specifically, and that the private key contains real newlines or literal `\n` (the accessor handles `\n` → newline and strips wrapping quotes). A missing key alone shouldn't cause this — `getAdminApp()` returns `null` and falls back to jose — but a *malformed* key throws inside `cert()`, which would.

---

## Confirmed fixes

### H1 — Alumni IDOR closed ✅

[app/api/alumni/documents/route.js](../app/api/alumni/documents/route.js) is properly rewritten:

```js
const isRefCode = /^(sb|skb)[-/]/i.test(rawQuery) || rawQuery.includes('/');
if (token) {
  try { … userEmail = decoded.email; isAdmin = await isUserAuthorizedAdmin(decoded); }
  catch (authErr) { return 401 'Invalid or expired authentication token.' }   // no longer swallowed
}
if (!isRefCode && !token) return 401   // email lookups require auth
```

Three things fixed at once: the invalid-token `catch` now returns 401 instead of falling through to the query, email lookups require a token, and reference-code lookups (the legitimate public verification case) still work. A `maskEmail()` helper was added for good measure.

**Verified locally** — the exact request that returned `200` with full PII in Pass 1:

```
GET /api/alumni/documents?query=ceoharshpatel@gmail.com   (no Authorization header)
→ 401, 111B   (was: 200, count:3, full names/emails/departments/dates)
```

### B2 residual — enumeration restricted to admins ✅

```
match /certificates/{certId} {
  allow get: if true;         // public verification by exact ID
  allow list: if isAdmin();   // was signedIn() — any registered user could enumerate
  allow write: if false;
}
```

The remaining item from Pass 1 (`get` returns the full document including `email`/`uid` to anyone holding a certificate ID) is a **deliberate design tradeoff**, not a defect — public verification needs to display the holder's identity. Worth revisiting if you ever want minimal disclosure, but no longer flagged.

### N2 — `jose` is now a real dependency ✅

`jose@^6.2.12` is in `dependencies`, no longer resolving through hoisting via `jwks-rsa`. Confirmed importable alongside firebase-admin under ESM in 966 ms.

### N3 — `isDevBypass` double-guarded ✅

```js
// :66 — the flag can no longer even be set outside development
const isDevBypass = process.env.NODE_ENV === 'development' && Boolean(rawBody.isDevBypass);
// :126
if (process.env.NODE_ENV === 'development' && isDevBypass) {
```

Guarded at parse time as well as use time. Not exploitable in production.

### Regression check

| Check | Result |
|---|---|
| Build | ✅ `exit 0`, compiled 3.6s, 158/158 pages |
| Tests | ✅ **29 pass, 0 fail** (was 28) |
| ESLint | ✅ 0 errors, 0 warnings |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Lockfile | ✅ in sync, `lockfileVersion: 3` |
| Git | ✅ HEAD `732578a` == `origin/main`, nothing unpushed |
| B1 (code) | ✅ bypass still absent; 401 locally |
| B3 (code) | ✅ server-side grading intact |
| Security headers | ✅ present, including on 500 responses |

---

## Still open

- **N1** — production backend down. Blocker. See above.
- **H4 — CSP `unsafe-inline`.** Live: `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://*.posthog.com`. Needs nonces.
- **`.env.example` drift (Low).** It omits 14 vars the code reads — `ADMIN_EMAILS`, `COUNSELLOR_AI_PROVIDER`, `GROQ_API_KEY`, `HUGGINGFACE_API_KEY`, `OPENROUTER_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `KV_*`, `REDIS_URL`, `OLLAMA_BASE_URL`, `GEMINI_RETRY_BASE_DELAY_MS` — and lists `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_APP_URL`, `DOCS_ENCRYPTION_KEY`, `GEMINI_API_KEY` which `env.js` doesn't read (some are read elsewhere). Anyone provisioning a new environment from it gets a silently degraded deploy — plausibly relevant to N1. Worth reconciling either way.
- **Monitoring.** Still the highest-leverage gap: the backend has been fully down across two audit passes with nothing alerting. One uptime check against an authenticated route would have caught it immediately.
- **Not re-tested:** TLS 1.0/1.1 (H6), DMARC `p=none` (H8), rate-limiter fallback under load (H9), accessibility, performance, authenticated end-to-end flows.

---

## Next steps

1. **Read the Vercel function log** for `/api/admin/certificates`. Do this before changing anything — two fixes have now been applied on inference. **[N1]**
2. Set `"engines": { "node": "22.x" }` and confirm the dashboard Node version is 22.x. Most likely fix, and harmless regardless since firebase-admin requires ≥22. **[N1]**
3. Verify `FIREBASE_ADMIN_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` exist in the Production scope with a well-formed key. **[N1]**
4. After redeploy, re-run the probe table above — all rows should be 401/405, none 500. That also completes the live verification of B1, B3, and H1, which are currently verified only in code and locally.
5. Add uptime monitoring on one authenticated route plus error reporting.
6. Then: CSP nonces, `.env.example` reconciliation, TLS 1.2 minimum, DMARC `p=quarantine`.

---

## Coverage

**This pass:** full build; 29 tests; ESLint; `npm audit --omit=dev`; dependency tree, classification, and lockfile sync; `engines` vs firebase-admin/`@google-cloud/*`/`jose` requirements; ESM import smoke test of the full admin chain; 15 live production endpoints; 5 endpoints against a local production server with real `.env`; git push state; re-reads of `alumni/documents`, `firestore.rules`, `certify/submit`, `firebaseAdmin.js`, `env.js`, and `.env.example` vs code.

**Could not verify:** the actual production error (Vercel function logs are not reachable from here — CLI not installed, and Cloudflare returns a 0-byte body); the deployed Node version; live behaviour of any firebase-admin route. B1, B3, and H1 fixes are confirmed in code and against a local production build, **not** against production.
