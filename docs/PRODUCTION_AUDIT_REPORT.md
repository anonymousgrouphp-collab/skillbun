# SkillBun — Full Production Readiness Audit

**Target:** https://skillbun.tech/ · **Repo:** [anonymousgrouphp-collab/skillbun](https://github.com/anonymousgrouphp-collab/skillbun)
**Version audited:** 2.9.3 (commit `8fd486d`, branch `main`) · **Audit date:** 2026-09-05
**Scope:** static analysis of ~57k LOC (`app/`, `lib/`, `utils/`), config, Firestore rules, plus black-box verification against the live production site.

---

## 1. Verdict

**DO NOT LAUNCH / ANNOUNCE YET.** Three launch-blocking defects are confirmed and reproducible against production right now. All three are small, surgical fixes — realistically a few hours of work, not a rewrite.

| # | Blocker | Severity | Status |
|---|---------|----------|--------|
| B1 | `?adminEmail=` query param grants full admin on certificate + bulk-email routes with **no token** | **Critical** | Reproduced live |
| B2 | `certificates` Firestore collection is **world-readable**, exposing student PII | **Critical** | Reproduced live |
| B3 | Certification exam is scored **entirely client-side**; any user can mint a "verified" certificate | **High** | Confirmed in code |

Everything else found is a quality, compliance, or hardening issue that can ship as follow-up work.

The encouraging half of the picture: the build is clean, dependencies are healthy, and several subsystems are genuinely well-engineered. The problems are concentrated in three specific places, not spread across the codebase.

### Baseline health (all verified locally)

| Check | Result |
|---|---|
| Production build (`next build`) | ✅ Pass — 154 pages, 100 roadmaps pre-rendered (SSG), 1 warning |
| Unit tests (`npm test`) | ✅ 19/19 pass |
| ESLint | ✅ 0 errors, 7 warnings (all `window.location` navigation nits) |
| `npm audit` | ✅ **0 vulnerabilities** across 634 deps |
| Secret hygiene | ✅ `.env` never committed (full history checked) |
| TLS | ✅ Google Trust Services, valid to 2026-10-23, TLS 1.3, wildcard SAN |
| Security headers | ✅ CSP, HSTS (2yr, preload), XCTO, XFO, Referrer-Policy, Permissions-Policy — present on HTML, API **and** static assets |

---

## 2. Launch blockers

### B1 — Unauthenticated admin bypass via `?adminEmail=` (Critical)

**Location:** [app/api/admin/certificates/route.js:31](app/api/admin/certificates/route.js#L31), [app/api/admin/certificates/[id]/route.js:30](app/api/admin/certificates/[id]/route.js#L30), [app/api/admin/emails/send/route.js:62](app/api/admin/emails/send/route.js#L62)

Each route verifies a Bearer token properly — and then, if that fails, falls through to a string comparison on a **client-supplied query parameter**:

```js
// app/api/admin/certificates/route.js:29-33
const url = new URL(request.url);
const adminEmail = (url.searchParams.get('adminEmail') || '').toLowerCase();
if (adminEmail === ADMIN_CONFIRMATION_EMAIL || process.env.NODE_ENV === 'development') {
  return { authorized: true, email: ADMIN_CONFIRMATION_EMAIL, uid: 'admin_dev' };
}
```

**Reproduced against production, no credentials of any kind:**

```
GET /api/admin/certificates                                  → 403  {"error":"Unauthorized: Admin privileges required."}
GET /api/admin/certificates?adminEmail=harsh@skillbun.tech   → 200  full certificate table
GET /api/admin/certificates/SKB-2026-CORP-LOR-Y5NH6M?adminEmail=…  → 200
```

The 200 response body contains real student PII:

```json
{"success":true,"certificates":[{"id":"SKB-2026-INT-REC-S8QCRR",
"name":"Sakshi Gupta","email":"sakshii554321@gmail.com",
"uid":"ZfxCwz2o0gdRBt1SrC77Yxst7zu2","designation":"QA & Testing Intern", …}]}
```

`verifyAdminAuth` is the **only** gate on every method in both certificate files — `GET`, `POST` (`:151`), `PATCH` (`:66`), `DELETE` (`:123`). So an anonymous attacker can read, forge, revoke, and permanently delete institutional credentials. None of the three files call `checkServerRateLimit` (verified: 0 occurrences each).

The email route is worse in kind: it accepts `adminEmail` from the **JSON body** as well as the query string, then sends attacker-authored HTML (`body.customHtml`, `:78-84`) to an arbitrary `recipientEmail` (`:206`) through the org's Zoho SMTP — an unauthenticated open relay that speaks with `skillbun.tech`'s domain reputation. Its catch block also returns `err.stack` and `String(err)` to the caller ([:315-317](app/api/admin/emails/send/route.js#L315)).

**Fix.** Delete the fallback in all three files. Require a verified token plus `isUserAuthorizedAdmin(decoded)` for every method, return 401 when the token is absent, and add rate limits. The `NODE_ENV === 'development'` clause should go too — one misconfigured env var turns it into the same hole.

*Scope note:* the bypass is confined to these three files. `/api/admin/analytics`, `/api/admin/workforce/*` (employees, credentials, documents, milestones) all correctly returned **401 with and without** the parameter.

---

### B2 — `certificates` collection is world-readable (Critical)

**Location:** [firestore.rules:118](firestore.rules#L118)

```
match /certificates/{certId} {
  allow read: if true;
  allow write: if false;
}
```

Anyone can bypass the app entirely and read the collection straight from Google's REST API:

```bash
curl "https://firestore.googleapis.com/v1/projects/skillbun-75d10/databases/(default)/documents/certificates"
# → HTTP 200
```

Returned fields include `email`, `name`, `uid`, `employee_id`, `department`, `designation`, `recommendation_text`, `issued_by_email`.

`allow write: if false` is correct and holds — this is a read-exposure issue only.

**Current blast radius is small:** 4 documents, 2 distinct people, both founder test records. This is a structural flaw caught before real scale, which is the good news. At 1,000 students it becomes a reportable breach.

**Every other collection is correctly locked** — `users`, `employees`, `milestones`, `workforce_docs`, `admins`, `serverRateLimits` all returned `403 PERMISSION_DENIED` to the same unauthenticated probe. The rules file is otherwise strong: field allowlists via `hasOnly`, length caps, `diff().affectedKeys()` to restrict intern milestone updates to three fields.

**Fix.** Public *verification* needs single-document lookup by ID, not collection listing, and not PII:

```
match /certificates/{certId} {
  allow get: if true;    // verification by exact ID
  allow list: if isAdmin();  // no enumeration
  allow write: if false;
}
```

Better still: drop `email` and `uid` from the document, or move verification behind a server route that returns only name + status + issue date.

---

### B3 — Certificate exam integrity is client-side only (High)

**Location:** [app/roadmap/[slug]/certify/page.jsx:429-434, 575-589](app/roadmap/[slug]/certify/page.jsx#L575) → [app/api/certify/mint/route.js:82](app/api/certify/mint/route.js#L82)

The browser receives the correct answers, grades itself, and posts the result:

```js
// page.jsx:580 — client has q.correctIndex
if (selectedAnswers[idx] === q.correctIndex) correct++;
const finalScore = Math.round((correct / 10) * 100);
// :622 — score is then sent to the mint API
body: JSON.stringify({ name, roadmapSlug, roadmapTitle, score })
```

The server validates the *shape* of that number but never recomputes it:

```js
// mint/route.js:82
score: { type: 'integer', required: true, min: 70, max: 100, label: 'Exam Score' },
```

So `POST /api/certify/mint {"score":100,…}` from any authenticated account mints a passing certificate without answering a question. The 60% progress gate does not help: it is enforced in the client from `localStorage` ([progressStore.js](utils/shared/progressStore.js), user-editable), and the server-side check only asserts the progress document *exists* — `if (!progSnap.exists)` — never that it reaches 60%. Its surrounding `catch` also swallows failures and continues (`:104-106`).

This undermines the product's core claim. Every certificate is publicly verifiable at `/certificate/[id]`, and employers are the audience.

**Fix.** Keep answers server-side: issue an attempt ID with the questions, hold the key in Firestore, submit answer *indices* to be graded by the server, and have the mint route read the score from that attempt record. Recompute the progress percentage server-side against the roadmap's node count instead of testing for existence.

---

## 3. High and medium findings

| ID | Finding | Severity | Location |
|---|---|---|---|
| H1 | `/api/alumni/documents` returns anyone's documents by email — no auth | High | [route.js:26](app/api/alumni/documents/route.js#L26) |
| H2 | No cookie/consent gate before GA4 + PostHog | High | [AnalyticsProvider.jsx](app/components/AnalyticsProvider.jsx) |
| H3 | Full 4.5 MB quiz bank publicly downloadable | High | `/data/quizQuestions.json` |
| H4 | CSP allows `script-src 'unsafe-inline'` in production | Medium | [next.config.mjs:21](next.config.mjs#L21) |
| H5 | Session revocation / account deletion non-functional | Medium | [firebaseAdmin.js:38](utils/server/firebaseAdmin.js#L38) |
| H6 | TLS 1.0 / 1.1 still offered | Medium | Cloudflare edge |
| H7 | No CI pipeline; 2 test files for ~35 API routes | Medium | repo root |
| H8 | DMARC policy is `p=none` | Medium | DNS |
| H9 | Rate limiting silently degrades to per-instance memory | Medium | [rateLimitStore.js:145](utils/server/rateLimitStore.js#L145) |

**H1 — Alumni document IDOR.** `const searchQuery = (rawQuery || userEmail).toLowerCase()` — the client-supplied query takes precedence over the token's own email, and no auth is required at all. Verified live: `GET /api/alumni/documents?query=ceoharshpatel@gmail.com` → `200`, `count: 3`, with `recipient_name`, `recipient_email`, `department`, `designation`, dates, and `verification_url` per document. This admin-SDK route bypasses the `workforce_docs` owner-only rule that Firestore correctly enforces. `pdf_base64` was `false` on these records but the code path attaches it when present. **Fix:** require a token and force the search to the token's own email.

**H2 — No consent gate.** PostHog initialises at module load in [instrumentation-client.js](instrumentation-client.js) with `capture_exceptions: true`; GA4 loads via `<GoogleAnalytics gaId="G-XTFMS5Q59C" />` in the root layout. `identifyUser(user.uid, {email, name})` ships email and display name to PostHog. No consent UI exists anywhere in `app/`. For an India-focused student audience this is a DPDP Act 2023 exposure, and GDPR/ePrivacy for any EU visitor. Related: no age gate, though college intake includes 17-year-olds, for whom DPDP requires verifiable parental consent and bans behavioural tracking.

**H3 — Quiz bank exposure.** `/data/quizQuestions.json` serves 4,470,280 bytes / 2,531 questions to anyone. I checked for answer keys in that file and found **none** — no `correct`, `answer`, `correctIndex`, or `solution` keys — so this is content leakage and bandwidth cost, not a direct answer leak. It is still a 4.5 MB public asset that lets a competitor clone the question bank.

**H4 — CSP `unsafe-inline`.** Defeats most of CSP's XSS value. Three inline scripts require it: the JSON-LD block and theme initialiser in [app/layout.jsx](app/layout.jsx), plus Next's own bootstrap. Migrate to a nonce via middleware. Also review `object-src 'self' blob: data:` and `frame-src blob: data:`, both wider than needed.

**H5 — Auth stub.** `getFirebaseAdminAuth()` returns a hand-rolled object exposing only `verifyIdToken`, implemented with `jose`. Consequences: `checkRevoked` is impossible, so a terminated employee's token stays valid until natural expiry; and any call to `revokeRefreshTokens`, `deleteUser`, or `listUsers` throws `TypeError` at runtime. Token verification itself is sound (correct JWKS, issuer, audience).

**H6 — TLS.** All four protocol versions were offered, including TLS 1.0 and 1.1. Set the minimum to TLS 1.2 in Cloudflare → SSL/TLS → Edge Certificates.

**H7 — No CI.** No `.github/` directory. Minimum gate: `npm ci && npm run lint && npm test && npm run build` on every PR. Highest-value untested paths: the three bypassed admin routes, `workforceCrypto`, `inputValidator`, rate limiting, and Firestore rules (which have no emulator tests and are deployed manually — `firebase.json` declares them but nothing automates deployment, so production rules can silently drift from the repo).

**H8 — DMARC.** `v=DMARC1; p=none; rua=…cloudflare.net` — monitoring only, nothing rejected. With SPF `v=spf1 include:zoho.in ~all` and no DKIM record found, spoofing `skillbun.tech` is viable. Progress to `p=quarantine` then `p=reject`, and publish DKIM. This compounds B1's open-relay risk.

**H9 — Rate limit degradation.** The Redis → Firestore → in-memory chain is well-built and Upstash is wired correctly, but if `isRedisConfigured()` is false and Firestore init fails, it lands on a module-level `Map` that is per-lambda on Vercel — effectively no limit under concurrency, and the fallback is silent. Log loudly when the memory path is hit in production. Note the three B1 routes have no rate limiting at all.

---

## 4. Low findings and polish

- **`/favicon.ico` → 404.** `next.config.mjs:70` sets a cache header for a file that does not exist; the layout points at `/logo.png`. Add a real `app/icon.png`.
- **No `manifest.json`, no `apple-touch-icon`.** No installability, poor iOS add-to-home.
- **`og:image` is 512×512** but `twitter:card` is `summary_large_image`, which wants 1200×630 — cards will render cropped or fall back.
- **Dead `sameAs` in JSON-LD.** `github.com/skillbun` and `linkedin.com/company/skillbun` are asserted in the org schema; verify both resolve or remove them.
- **`robots.txt` self-conflict.** The served file is Cloudflare's managed block (which `Disallow: /` for ClaudeBot, GPTBot, CCBot, Google-Extended, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent) concatenated with `app/robots.js` output, which **Allows those same agents**. Two `User-agent: *` groups in one file. Resolve in the Cloudflare dashboard so the file states one intent.
- **Missing metadata on 12+ routes.** Only 9 pages export `metadata`. `/quiz`, `/counsellor`, `/projects`, `/alumni`, `/settings`, `/onboarding`, `/auth`, `/certificate/[id]` inherit the root title. `/certificate/[id]` has no `noindex` — it publishes a real person's name at a crawlable URL.
- **Frozen `lastmod`.** Every `sitemap.xml` entry reads `2026-08-20T13:22:41.859Z`.
- **Stale homepage cache.** `Age: 528747` (~6 days) against `x-nextjs-stale-time: 300`.
- **3 × 1.26 MB PNGs** (`certificate-template.png`, `internship-cert-template.png`, `training-cert-template.png`) are byte-identical in size — likely duplicates. Nav logo uses `unoptimized`.
- **Build warning:** the `.sbv` path pattern matches 12,380 files, bloating the lambda bundle ([route.js:167](app/api/docs/[slug]/[topicId]/route.js#L167)).
- **Inconsistent error envelopes:** `{error:"…"}` vs `{success:false,error:{code,message}}` across routes.
- **Duplicated analytics components** under `app/dashboard/analytics/components/` and `app/dashboard/console/admin/analytics/components/` — check for drift.
- **`NEXT_PUBLIC_ADMIN_EMAILS`** in `.env.example` ships the admin list to every browser. Server logic already ignores it; delete the variable.
- **No `engines` field / `.nvmrc`.** A Vercel Node bump could break `firebase-admin` unannounced.
- **7 ESLint warnings** — `window.location.assign/href` for internal navigation in `UserMenu.jsx:209,235`, `page.jsx:222`, `counsellorDom.js:34,272`, `quizDom.js:270,995`. Use `router.push()`.
- **`vercel.json` is 2 lines.** No `regions` (traffic is India, edge resolved `sin1`), no `maxDuration`/`memory` for the LLM and PDF routes, no cron for `retentionEmails.js` — confirm that is not dead code.

---

## 5. What is already done right

Credit where the engineering holds up:

- **Study-guide vault** ([app/api/docs/[slug]/[topicId]/route.js](app/api/docs/[slug]/[topicId]/route.js)) — genuinely strong. AES-256-GCM with per-file HKDF-style key derivation, SHA-256 content-integrity check, filenames derived by hash (traversal is structurally impossible, not merely filtered), plus a strict `^[a-zA-Z0-9_-]+$` allowlist, length bounds, auth, and three-tier rate limits.
- **Server-side admin resolution** ([workforceEmployees.js:119](utils/server/workforceEmployees.js#L119)) — layered custom claim → env allowlist → Firestore `/admins/{email}`, with the founder path requiring Google sign-in or a verified email. The client hook is UI-only; the server never trusts it.
- **Firestore rules** — field allowlists, length caps, list-size bounds, and `diff().affectedKeys().hasOnly([...])` restricting intern milestone writes to exactly three fields. Six of seven collections deny anonymous reads.
- **HMAC human-proof tokens** ([humanProof.js](utils/server/humanProof.js)) — SHA-256 HMAC, base64url, expiry, and `crypto.timingSafeEqual` with a length pre-check.
- **Open-redirect defence** ([routes.js](utils/shared/routes.js)) — protocol-pattern rejection, `//` and `\` handling, origin re-validation after parsing.
- **Rate limit architecture** — atomic Upstash pipeline with a 2s `AbortController`, Firestore transactional fallback, per-user and per-IP buckets, `Retry-After` on 429.
- **Security headers reach everywhere** — verified present on HTML, `/api/config`, and `/_next/static/**`. Static assets carry `max-age=31536000, immutable`.
- **`access-control-allow-origin: *` is benign here** — it appears only on public static HTML, not on credentialed API responses. I checked `/api/config` and `/api/search` specifically; neither returns it.
- **Rendering strategy** — 100 roadmap pages pre-rendered via `generateStaticParams`; only genuinely dynamic routes are server-rendered.
- **Zero dependency vulnerabilities**, all 9 outdated packages are patch/minor.
- **Accessibility foundations** — skip-nav link to `#main-content`, `lang="en"`, single `<main>` landmark, `suppressHydrationWarning` with a pre-paint theme script (no FOUC).

---

## 6. Remediation plan

**Before launch (blockers)**

1. Delete the `?adminEmail=` fallback in all three route files; require token + `isUserAuthorizedAdmin` on every method; add rate limits; stop returning `err.stack`. **[B1]**
2. Change `certificates` rules to `allow get: if true; allow list: if isAdmin();` and strip `email`/`uid` from public reads. Deploy with `firebase deploy --only firestore:rules`. **[B2]**
3. Move exam grading server-side; recompute the 60% gate from real node counts. **[B3]**
4. Require auth on `/api/alumni/documents` and pin the query to the caller's own email. **[H1]**
5. Rotate anything reachable through the bypassed routes; review Zoho SMTP logs for unauthorised sends.

**Week one**

6. Consent banner gating GA4 + PostHog; add a delete-my-account path. **[H2]**
7. Set TLS minimum to 1.2; advance DMARC to `p=quarantine`; publish DKIM. **[H6, H8]**
8. Add the CI gate. **[H7]**
9. Restore real `firebase-admin` `getAuth()` so revocation and deletion work. **[H5]**
10. Move the quiz bank behind the authenticated API. **[H3]**

**Month one**

11. CSP nonces to drop `unsafe-inline`. **[H4]**
12. Metadata + `noindex` sweep; fix `robots.txt`; real `lastmod`. 
13. `favicon.ico`, `manifest.json`, 1200×630 OG image.
14. Compress the 1.26 MB PNGs; narrow the `.sbv` build pattern.
15. Error reporting (Sentry or equivalent) and uptime monitoring — a production 500 is currently invisible.
16. Firestore backups and an emulator test suite for the rules.

---

## 7. Method and coverage

**Verified first-hand:** production build, unit tests, ESLint, `npm audit`, `npm outdated`, full git history for secrets, unauthenticated probes of 22 pages and 16 API routes, direct Firestore REST probes of all 7 collections, TLS and protocol enumeration, DNS (SPF/DMARC/MX/NS), header inspection across HTML/API/static, static HTML leak checks on 6 protected pages, and close reads of the auth, crypto, rules, rate-limit, and certification paths.

**Not covered — recommend before launch:** real-device mobile and cross-browser testing; automated axe/Lighthouse runs (contrast ratios were not computed per-pair); load and stress testing; authenticated end-to-end flows as a student and as an admin (no test credentials were used); Firestore backup/DR verification; YouTube ToS review for `verified_videos.json`; and content accuracy across the 100+ roadmaps.

An adversarial verification pass over these findings was cut short by an API quota limit partway through, so the three blockers were instead each confirmed by hand against production — the reproduction commands and responses are quoted inline above. Severities for the H-tier items reflect single-pass analysis and may warrant re-rating.

---

## 8. System workflow chart

### 8.1 Request and trust boundaries

```
                          ┌──────────────────────────────┐
                          │  Browser (React 19 client)   │
                          │  Firebase Auth SDK · GA4     │
                          │  PostHog · localStorage      │
                          └──────────────┬───────────────┘
                                         │ HTTPS
                    ═════════════════════▼═════════════════════  TRUST BOUNDARY
                          ┌──────────────────────────────┐
                          │   Cloudflare edge            │
                          │   TLS · WAF · robots.txt     │
                          │   ⚠ TLS 1.0/1.1 offered [H6] │
                          └──────────────┬───────────────┘
                          ┌──────────────▼───────────────┐
                          │   Vercel (sin1)              │
                          │   Security headers ✅         │
                          │   ⚠ CSP unsafe-inline [H4]   │
                          └──────┬────────────────┬──────┘
                    ┌────────────▼───┐      ┌─────▼──────────────┐
                    │ Static / SSG   │      │ Route handlers     │
                    │ 154 pages      │      │ ~35 API routes     │
                    │ 100 roadmaps   │      │ (Node runtime)     │
                    └────────────────┘      └─────┬──────────────┘
                                                  │
                    ═════════════════════════════▼═════════════  TRUST BOUNDARY
                          ┌──────────────────────────────┐
                          │  Firebase Admin SDK          │
                          │  (bypasses Firestore rules)  │
                          └──────────────┬───────────────┘
              ┌──────────────┬───────────┼───────────┬──────────────┐
         ┌────▼────┐   ┌─────▼─────┐ ┌───▼────┐ ┌────▼────┐  ┌──────▼──────┐
         │Firestore│   │  Upstash  │ │ Gemini │ │  Zoho   │  │ content/    │
         │7 colls  │   │   Redis   │ │  LLM   │ │  SMTP   │  │ *.sbv vault │
         └─────────┘   └───────────┘ └────────┘ └─────────┘  └─────────────┘
              │
              └── ⚠ certificates: allow read: if true  [B2]
                  ✅ users · employees · milestones · workforce_docs
                     admins · serverRateLimits → all deny anonymous
```

### 8.2 API authorization flow

```
                        Incoming request
                               │
                    ┌──────────▼──────────┐
                    │ Authorization:      │
                    │ Bearer <token>?     │
                    └──────┬───────┬──────┘
                       yes │       │ no
              ┌────────────▼──┐    │
              │ verifyIdToken │    │
              │ (jose + JWKS) │    │
              │ ⚠ no          │    │
              │ checkRevoked  │    │
              │        [H5]   │    │
              └───┬───────┬───┘    │
              ok  │       │ fail   │
        ┌─────────▼─────┐ │        │
        │isUserAuthorized│ │       │
        │Admin()         │ │       │
        │ claim → env →  │ │       │
        │ /admins/{email}│ │       │
        │      ✅ solid  │ │       │
        └────┬──────┬────┘ │       │
         yes │      │ no   │       │
             │      │      │       │
             │      └──────┴───────┤
             │                     │
             │        ┌────────────▼─────────────────┐
             │        │ Which route?                 │
             │        └───┬──────────────────────┬───┘
             │            │                      │
             │   ┌────────▼─────────┐  ┌─────────▼──────────┐
             │   │ workforce/*      │  │ certificates/*     │
             │   │ analytics        │  │ emails/send        │
             │   │                  │  │                    │
             │   │  → 401 ✅        │  │ ?adminEmail=       │
             │   │  (verified: same │  │ harsh@skillbun.tech│
             │   │   with & without │  │        ?           │
             │   │   the param)     │  │   yes → GRANT 🔴   │
             │   └──────────────────┘  │   no  → 403        │
             │                         │        [B1]        │
             │                         └─────────┬──────────┘
             └───────────────────┬───────────────┘
                        ┌────────▼────────┐
                        │ Rate limit      │
                        │ Redis→FS→memory │
                        │ ⚠ silent        │
                        │   degrade [H9]  │
                        │ ⚠ absent on B1  │
                        │   routes        │
                        └────────┬────────┘
                        ┌────────▼────────┐
                        │ validateSchema  │
                        └────────┬────────┘
                        ┌────────▼────────┐
                        │ Admin SDK write │
                        └─────────────────┘
```

### 8.3 Certification flow — where integrity breaks

```
   STUDENT                    BROWSER                      SERVER
      │                          │                            │
      │  open /certify           │                            │
      ├─────────────────────────►│                            │
      │                          │  read localStorage         │
      │                          │  progress ≥ 60% ?          │
      │                          │  🔴 user-editable [B3]     │
      │                          │                            │
      │                          │  GET /api/quiz/questions   │
      │                          ├───────────────────────────►│
      │                          │                       ┌────▼────┐
      │                          │                       │ auth ✅ │
      │                          │                       │ 401 if  │
      │                          │                       │ absent  │
      │                          │                       └────┬────┘
      │                          │◄───────────────────────────┤
      │                          │  questions + correctIndex  │
      │                          │  🔴 answer key to client   │
      │  answer 10 Qs            │                            │
      ├─────────────────────────►│                            │
      │                          │  grade locally             │
      │                          │  score = correct/10 × 100  │
      │                          │  🔴 client computes result │
      │                          │                            │
      │                          │  POST /api/certify/mint    │
      │                          │  { name, slug, score }     │
      │                          ├───────────────────────────►│
      │                          │                       ┌────▼─────────────┐
      │                          │                       │ verify token ✅  │
      │                          │                       │ rate limit ✅    │
      │                          │                       │ score 70..100?   │
      │                          │                       │ 🔴 shape only —  │
      │                          │                       │    never recomputed│
      │                          │                       │ progSnap.exists? │
      │                          │                       │ 🔴 not ≥ 60%     │
      │                          │                       │    catch swallows│
      │                          │                       └────┬─────────────┘
      │                          │                       ┌────▼─────────────┐
      │                          │                       │ write certificate│
      │                          │                       └────┬─────────────┘
      │                          │◄───────────────────────────┤
      │  certificate issued      │  { certId }                │
      │◄─────────────────────────┤                            │
      │                                                       │
      │  /certificate/{id} — public, no noindex                │
      │  readable by anyone via Firestore REST [B2]            │
```

### 8.4 Remediation sequence

```
  BLOCKERS (before launch)
  ┌─────────────────────────────────────────────────────┐
  │ 1. strip ?adminEmail= fallback ×3 files      [B1] 🔴│
  │ 2. certificates → get/list split             [B2] 🔴│
  │ 3. server-side exam grading                  [B3] 🔴│
  │ 4. auth on /api/alumni/documents             [H1] 🟠│
  │ 5. rotate credentials · audit SMTP logs           🔴│
  └───────────────────────────┬─────────────────────────┘
                              ▼
  WEEK ONE
  ┌─────────────────────────────────────────────────────┐
  │ consent banner + delete-account   [H2]              │
  │ TLS 1.2 min · DMARC quarantine    [H6][H8]          │
  │ CI: lint + test + build           [H7]              │
  │ real firebase-admin getAuth()     [H5]              │
  │ quiz bank behind auth             [H3]              │
  └───────────────────────────┬─────────────────────────┘
                              ▼
  MONTH ONE
  ┌─────────────────────────────────────────────────────┐
  │ CSP nonces  [H4]   ·  metadata + noindex sweep      │
  │ favicon · manifest · OG 1200×630                    │
  │ image compression · narrow .sbv pattern             │
  │ error reporting · uptime alerts · Firestore backups │
  │ rules emulator tests                                │
  └─────────────────────────────────────────────────────┘
```
