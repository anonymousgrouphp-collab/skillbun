# SkillBun — Architecture & Workflow Documentation

**Version:** 2.9.3 · **Last updated:** 2026-09-05
**Companion doc:** [PRODUCTION_AUDIT_REPORT.md](PRODUCTION_AUDIT_REPORT.md) — security findings referenced here as `[B1]`, `[H4]`, etc.

Diagrams are Mermaid; they render on GitHub and in most Markdown viewers. Where a diagram carries a `🔴`/`⚠` marker, the annotation points at a live audit finding rather than intended behaviour.

---

## 1. Stack at a glance

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.1 (App Router, JSX — no TypeScript) |
| UI | React 19.2, Tailwind, `next/font` (Fredoka 700, Nunito 400/600/700/800) |
| Auth | Firebase Auth (Google OAuth + email/password) |
| Data | Cloud Firestore — client SDK in the browser, `firebase-admin` on the server |
| Hosting | Vercel (region `sin1`) behind Cloudflare (DNS, TLS, WAF, managed `robots.txt`) |
| Rate limiting | Upstash Redis REST → Firestore transaction → in-process `Map` |
| Content vault | AES-256-GCM encrypted `.sbv` files under `content/docs/` |
| LLM | Gemini (counsellor, quiz assist) |
| Mail | Zoho SMTP via nodemailer |
| PDF | `pdf-lib` server-side, plus browser print CSS |
| Bot defence | Cloudflare Turnstile + HMAC-SHA256 "human proof" tokens |
| Analytics | GA4 `G-XTFMS5Q59C`, PostHog, Vercel Analytics, Vercel Speed Insights |
| Build | Turbopack — 154 pages, 100 roadmaps pre-rendered |

---

## 2. System topology

```mermaid
graph TB
    subgraph client["Browser — untrusted"]
        UI["React 19 client<br/>Firebase Auth SDK"]
        LS["localStorage<br/>skillbun_progress_*"]
        AN["GA4 · PostHog · Vercel<br/>⚠ no consent gate H2"]
    end

    subgraph edge["Cloudflare edge"]
        CF["TLS · WAF · robots.txt<br/>⚠ TLS 1.0/1.1 offered H6"]
    end

    subgraph vercel["Vercel — region sin1"]
        HDR["Security headers<br/>CSP · HSTS 2yr · XFO · XCTO<br/>⚠ script-src unsafe-inline H4"]
        SSG["Static / SSG<br/>154 pages · 100 roadmaps"]
        API["Route handlers<br/>~35 API routes, Node runtime"]
    end

    subgraph server["Server-only trust zone"]
        ADMIN["firebase-admin SDK<br/>bypasses Firestore rules"]
        RL["rateLimitStore<br/>Redis → Firestore → Map"]
        CRYPTO["workforceCrypto<br/>AES-256-GCM + HMAC"]
    end

    subgraph external["External services"]
        FS[("Firestore<br/>7 collections")]
        REDIS[("Upstash Redis")]
        GEM["Gemini LLM"]
        SMTP["Zoho SMTP"]
        VAULT[("content/docs/*.sbv")]
    end

    UI --> CF --> HDR
    HDR --> SSG
    HDR --> API
    UI -.->|"Firebase client SDK<br/>rules enforced"| FS
    UI --> LS
    UI --> AN
    API --> ADMIN
    API --> RL
    API --> CRYPTO
    ADMIN --> FS
    RL --> REDIS
    RL --> FS
    API --> GEM
    API --> SMTP
    CRYPTO --> VAULT

    style client fill:#fee,stroke:#c33
    style server fill:#efe,stroke:#3a3
    style edge fill:#eef,stroke:#33c
```

Two trust boundaries matter:

1. **Browser → server.** Nothing the client sends is authoritative. This is where `[B3]` breaks down: the certify page computes its own exam score and the server accepts it.
2. **Route handler → Firestore.** The client SDK is constrained by `firestore.rules`; `firebase-admin` is not. Any route using the admin SDK must re-implement authorization itself. `[B1]` and `[H1]` are both failures of that second gate.

---

## 3. Authentication and authorization

```mermaid
flowchart TD
    REQ["Incoming request"] --> HAS{"Authorization:<br/>Bearer token?"}

    HAS -->|no| ROUTE{"Which route family?"}
    HAS -->|yes| VERIFY["verifyIdToken<br/>jose + createRemoteJWKSet<br/>checks iss + aud<br/>⚠ no checkRevoked H5"]

    VERIFY -->|invalid| ROUTE
    VERIFY -->|valid| ISADMIN{"isUserAuthorizedAdmin<br/>workforceEmployees.js:119"}

    ISADMIN -->|"founder email<br/>+ google.com or verified"| GRANT
    ISADMIN -->|"decodedToken.admin === true"| GRANT
    ISADMIN -->|"env ADMIN_EMAILS"| GRANT
    ISADMIN -->|"/admins/{email} active"| GRANT
    ISADMIN -->|none match| USER["Authenticated user scope<br/>own data only"]

    ROUTE -->|"workforce/* · analytics"| D401["401 Unauthorized ✅"]
    ROUTE -->|"certificates · emails/send"| BYPASS{"?adminEmail= or body.adminEmail<br/>=== harsh@skillbun.tech<br/>OR NODE_ENV=development"}
    ROUTE -->|"alumni/documents"| OPEN["no auth required<br/>🔴 query overrides identity H1"]

    BYPASS -->|yes| GRANT
    BYPASS -->|no| D403["403 Forbidden"]

    GRANT["ADMIN SCOPE"] --> RL{"checkServerRateLimit?"}
    USER --> RL
    OPEN --> HANDLER
    RL -->|"present on most routes"| VAL["validateSchema<br/>inputValidator"]
    RL -->|"absent on the 3 bypass routes 🔴"| VAL
    VAL --> HANDLER["Handler → admin SDK"]

    style BYPASS fill:#fdd,stroke:#c00,stroke-width:3px
    style OPEN fill:#fdd,stroke:#c00,stroke-width:3px
    style GRANT fill:#dfd,stroke:#0a0
```

**The intended path** is the right-hand chain: verified token → layered admin resolution → rate limit → schema validation → admin SDK. `isUserAuthorizedAdmin` is well built; the client-side `useAdmin` hook only affects what the UI renders and is never trusted server-side.

**The defect** is the red `?adminEmail=` node. Three files fall back to a string comparison on a client-supplied value when token verification fails:

- [app/api/admin/certificates/route.js:31](../app/api/admin/certificates/route.js#L31) — guards `GET` and `POST`
- [app/api/admin/certificates/[id]/route.js:30](../app/api/admin/certificates/[id]/route.js#L30) — guards `GET`, `PATCH`, `DELETE`
- [app/api/admin/emails/send/route.js:62](../app/api/admin/emails/send/route.js#L62) — also reads `adminEmail` from the JSON body

Everything else under `/api/admin/` returns 401 correctly, verified with and without the parameter.

---

## 4. Student journey

```mermaid
flowchart LR
    V["Visitor"] --> HOME["/ homepage<br/>SSG"]
    HOME --> AUTH["/auth<br/>Google or email"]
    AUTH --> ONB["/onboarding<br/>goal · skill level"]
    ONB --> DASH["/dashboard"]

    DASH --> RM["/roadmap/[slug]<br/>100 SSG pages"]
    DASH --> QZ["/quiz"]
    DASH --> CN["/counsellor"]
    DASH --> PJ["/projects"]

    RM --> NODE["Topic node"]
    NODE --> DOC["/api/docs/[slug]/[topicId]<br/>SBV1 decrypt ✅"]
    NODE --> PROG["mark complete<br/>→ localStorage<br/>+ Firestore roadmapProgress"]

    PROG --> GATE{"progress ≥ 60%?<br/>🔴 client-side check B3"}
    GATE -->|yes| CERT["/roadmap/[slug]/certify"]
    CERT --> EXAM["10-question exam"]
    EXAM --> MINT["/api/certify/mint"]
    MINT --> PUB["/certificate/[id]<br/>public verification<br/>⚠ no noindex"]

    style DOC fill:#dfd,stroke:#0a0
    style GATE fill:#fdd,stroke:#c00
```

### The study-guide vault — reference implementation

`/api/docs/[slug]/[topicId]` is the strongest route in the codebase and the pattern other routes should copy:

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Route handler
    participant V as content/docs/*.sbv

    C->>R: GET /api/docs/{slug}/{topicId}<br/>Bearer token
    R->>R: allowlist ^[a-zA-Z0-9_-]+$<br/>slug ≤64 · topicId ≤128 → else 400
    R->>R: verifyIdToken → else 401
    R->>R: rate limit 30/min · 300/hr user · 60/min IP
    R->>R: obfuscateFilename = SHA-256(slug + topicId)
    R->>V: read hashed filename
    V-->>R: SBV1 blob
    R->>R: derive key · AES-256-GCM decrypt<br/>verify authTag + content SHA-256
    R-->>C: markdown, Cache-Control: private, max-age=3600
```

Because the on-disk name is a hash, the path is not attacker-influenced at all — traversal is structurally impossible rather than filtered out. The allowlist, length caps, auth, rate limits, and integrity check all sit in front of that.

---

## 5. Certification flow

```mermaid
sequenceDiagram
    participant S as Student
    participant B as Browser
    participant A as API
    participant F as Firestore

    S->>B: open /roadmap/{slug}/certify
    B->>B: read localStorage progress
    Note over B: 🔴 60% gate is client-side<br/>and localStorage is user-editable
    B->>A: GET quiz questions (auth ✅)
    A-->>B: questions INCLUDING correctIndex
    Note over B: 🔴 answer key delivered to client
    S->>B: answer 10 questions
    B->>B: score = round(correct/10 × 100)
    Note over B: 🔴 client grades itself
    B->>A: POST /api/certify/mint { name, slug, score }
    A->>A: verifyIdToken ✅
    A->>A: rate limit 5/min · 30/hr user · 50/hr IP ✅
    A->>A: validate score is integer 70..100
    Note over A: 🔴 shape only — never recomputed
    A->>F: get roadmapProgress/{slug}
    F-->>A: snapshot
    A->>A: if (!progSnap.exists) → 403
    Note over A: 🔴 existence only, not ≥60%<br/>and catch swallows errors
    A->>F: write certificates/{certId}
    A-->>B: { certId }
    B-->>S: certificate issued
```

**What holds:** authentication, rate limiting, ID generation, and the `pdf-lib` render path. Workforce credential types (`INTERNSHIP`, `TRAINING`, `LOR`) correctly require `isAdmin` and cannot be self-minted.

**What does not:** every step that establishes *merit*. Fixing `[B3]` means issuing an attempt ID alongside the questions, keeping the answer key server-side, submitting answer indices for server grading, and having `mint` read the score from that attempt record instead of the request body.

---

## 6. Admin and workforce console

```mermaid
flowchart TD
    AD["Admin"] --> CONSOLE["/dashboard/console/admin"]
    CONSOLE --> WF["Workforce<br/>employees · milestones · docs"]
    CONSOLE --> CM["Certificate manager"]
    CONSOLE --> EM["Bulk email"]
    CONSOLE --> AA["Analytics"]

    WF --> WFAPI["/api/admin/workforce/*<br/>token + isAdmin ✅ 401 otherwise"]
    AA --> AAAPI["/api/admin/analytics<br/>token + isAdmin ✅"]
    CM --> CMAPI["/api/admin/certificates<br/>🔴 ?adminEmail= bypass B1"]
    EM --> EMAPI["/api/admin/emails/send<br/>🔴 bypass + customHtml relay B1<br/>🔴 err.stack leaked at HTTP 200"]

    WFAPI --> ASDK["firebase-admin"]
    AAAPI --> ASDK
    CMAPI --> ASDK
    EMAPI --> SMTP["Zoho SMTP<br/>⚠ DMARC p=none H8"]
    ASDK --> FS[("Firestore")]

    ALUM["Anyone, no auth"] --> ALAPI["/api/alumni/documents<br/>🔴 query overrides token H1"]
    ALAPI --> ASDK

    style CMAPI fill:#fdd,stroke:#c00,stroke-width:3px
    style EMAPI fill:#fdd,stroke:#c00,stroke-width:3px
    style ALAPI fill:#fdd,stroke:#c00,stroke-width:3px
    style WFAPI fill:#dfd,stroke:#0a0
    style AAAPI fill:#dfd,stroke:#0a0
```

Green nodes are correctly gated. The three red nodes are reachable without any credential; `/api/admin/emails/send` combines that with attacker-authored `customHtml` delivered over the org's own SMTP, which is why `[B1]` and `[H8]` compound each other.

---

## 7. Data model and rules

```mermaid
flowchart LR
    subgraph rules["Enforced by firestore.rules — client SDK"]
        U["users/{uid}<br/>+ roadmapProgress/{slug}<br/>owner only ✅"]
        E["employees/{id}<br/>owner-scoped ✅"]
        M["milestones/{id}<br/>diff().affectedKeys()<br/>limited to 3 fields ✅"]
        W["workforce_docs/{id}<br/>owner only ✅"]
        AD["admins/{email}<br/>isAdmin only ✅"]
        SR["serverRateLimits/{key}<br/>server only ✅"]
        C["certificates/{certId}<br/>allow read: if true 🔴 B2<br/>allow write: if false ✅"]
    end

    CL["Browser<br/>client SDK"] --> rules
    SV["Route handlers<br/>firebase-admin"] -.->|"rules do NOT apply"| rules

    style C fill:#fdd,stroke:#c00,stroke-width:3px
```

Six of seven collections deny anonymous reads — confirmed by direct unauthenticated probes of the Firestore REST API, all returning `403 PERMISSION_DENIED`. `certificates` returns `200` with `email`, `name`, `uid`, `employee_id`, `department`, `designation`, and `recommendation_text`.

The rules file itself is otherwise well written: `hasOnly` field allowlists, string length caps, list-size bounds (`completedNodeIds ≤ 800`), and a three-field restriction on intern milestone updates. `isAdmin()` resolves through a custom claim, the founder email, or an `/admins/{email}` document.

Note the dashed line: any route using `firebase-admin` sidesteps this entire diagram. That is by design, and it is exactly why the API-layer authorization in §3 has to be airtight.

---

## 8. Rate limiting

```mermaid
flowchart TD
    CALL["checkServerRateLimit(key, limit, window)"] --> R{"isRedisConfigured?"}
    R -->|yes| REDIS["Upstash REST pipeline<br/>atomic INCR + EXPIRE<br/>2s AbortController"]
    R -->|no| FSQ{"Firestore admin available?"}
    REDIS -->|timeout or error| FSQ
    FSQ -->|yes| TX["runTransaction on<br/>serverRateLimits/{key}<br/>distributed ✅"]
    FSQ -->|no| MEM["module-level Map<br/>⚠ per-lambda, silent H9"]
    TX --> DEC{"count > limit?"}
    REDIS --> DEC
    MEM --> DEC
    DEC -->|yes| R429["429 + Retry-After"]
    DEC -->|no| OK["proceed"]

    style MEM fill:#ffd,stroke:#c90
```

Buckets are keyed per-user and per-IP. Representative limits: docs 30/min + 300/hr user + 60/min IP; certify mint 5/min + 30/hr user + 50/hr IP. The Firestore tier is what makes this genuinely distributed rather than best-effort. Two gaps: the memory fallback is per-lambda on Vercel and fails silently, and the three `[B1]` routes call `checkServerRateLimit` zero times.

---

## 9. Bot defence

```mermaid
sequenceDiagram
    participant B as Browser
    participant T as Cloudflare Turnstile
    participant A as /api/human-proof
    participant P as Protected route

    B->>T: solve challenge
    T-->>B: cf-turnstile-response
    B->>A: POST token
    A->>T: siteverify
    T-->>A: success
    A->>A: HMAC-SHA256(payload, HUMAN_PROOF_SECRET)
    A-->>B: signed token + exp
    B->>P: request + human-proof token
    P->>P: recompute HMAC<br/>crypto.timingSafeEqual + exp check
    Note over P: ⚠ no nonce — token replayable within TTL
    P-->>B: response
```

The HMAC verification in [utils/server/humanProof.js](../utils/server/humanProof.js) is correct: SHA-256, base64url, expiry enforcement, constant-time comparison with a length pre-check. Two operational caveats — there is no replay protection inside the TTL, and `getHumanProofSecret()` will seed itself from an LLM API key if the dedicated secret is unset, returning `''` in production rather than failing loudly.

---

## 10. Build and deploy

```mermaid
flowchart LR
    DEV["local dev<br/>next dev --webpack"] --> PUSH["git push main"]
    PUSH --> VB["Vercel build<br/>next build (Turbopack)"]
    VB --> OUT["154 pages<br/>100 SSG roadmaps<br/>~35 route handlers"]
    OUT --> DEPLOY["Deploy → sin1"]
    DEPLOY --> CFE["Cloudflare edge"]

    RULES["firestore.rules"] -.->|"manual<br/>firebase deploy<br/>⚠ can drift H7"| FS[("Firestore")]

    NOCI["⚠ no .github/<br/>lint · test · build<br/>never gate a merge H7"] -.-> PUSH

    style NOCI fill:#ffd,stroke:#c90
    style RULES fill:#ffd,stroke:#c90
```

`npm test` covers two files (`idSystem`, `pdfAndPrintSystem`) — 19 assertions, all passing, against ~35 API routes. No workflow file exists, so nothing blocks a merge. Firestore rules are deployed by hand, meaning production rules can silently diverge from the repo; adding emulator tests plus a deploy step would close both gaps at once.

---

## 11. Environment variables

Full inventory in `.env.example` (35 vars). Grouped by role:

| Group | Variables |
|---|---|
| Firebase client | `NEXT_PUBLIC_FIREBASE_*` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) |
| Firebase admin | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |
| Crypto | `SBV_MASTER_KEY`, `WORKFORCE_ENC_KEY`, `HUMAN_PROOF_SECRET` |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| LLM | `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` |
| Mail | `ZOHO_SMTP_HOST`, `ZOHO_SMTP_PORT`, `ZOHO_SMTP_USER`, `ZOHO_SMTP_PASS` |
| Bot defence | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Analytics | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Admin | `ADMIN_EMAILS`, `NEXT_PUBLIC_ADMIN_EMAILS` ⚠ remove — ships the admin list to every browser |

`.env` has never been committed (full git history checked). Accessors live in [utils/server/env.js](../utils/server/env.js); two behaviours to be aware of — `getHumanProofSecret()` falls back to an LLM key and then to `''`, and `getAdminEmails()` hardcodes `['harsh@skillbun.tech']` as its default.

---

## 12. Known deviations from intent

Quick index of where the running system differs from the design above. Details and fixes in the [audit report](PRODUCTION_AUDIT_REPORT.md).

| ID | Deviation | Diagram |
|---|---|---|
| B1 | `?adminEmail=` grants admin without a token on 3 routes | §3, §6 |
| B2 | `certificates` collection world-readable | §7 |
| B3 | Exam graded and gated client-side | §5 |
| H1 | `/api/alumni/documents` unauthenticated IDOR | §3, §6 |
| H2 | Analytics load before any consent | §2 |
| H4 | CSP permits `unsafe-inline` in production | §2 |
| H5 | Auth stub lacks `checkRevoked`, `deleteUser`, `revokeRefreshTokens` | §3 |
| H6 | TLS 1.0/1.1 offered at the edge | §2 |
| H7 | No CI; rules deployed manually | §10 |
| H8 | DMARC `p=none`, no DKIM | §6 |
| H9 | Rate limiter degrades silently to per-lambda memory | §8 |
