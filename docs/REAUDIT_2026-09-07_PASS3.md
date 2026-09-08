# SkillBun — Re-Audit Pass 3 (Final)

**Target:** https://skillbun.tech/ · **Version:** 2.10.12 (`dec925c`) · **Date:** 2026-09-07
**Prior passes:** [PRODUCTION_AUDIT_REPORT.md](PRODUCTION_AUDIT_REPORT.md) (v2.9.3) · [Pass 1](REAUDIT_2026-09-07.md) (v2.10.7) · [Pass 2](REAUDIT_2026-09-07_PASS2.md) (v2.10.8)

---

## Verdict

**Production is healthy. Every blocker across all three passes is fixed and verified live.** No launch blockers remain.

The backend is back — all 31 previously-500ing routes now return correct status codes against production, which also means B1, B2, B3, and H1 are **verified against the live site** for the first time rather than only in code.

| ID | Item | Pass 2 | Now |
|---|---|---|---|
| N1 | 31/35 API routes 500 in production | 🔴 Blocker | ✅ **Fixed — verified live** |
| B1 | `?adminEmail=` admin bypass | ✅ code only | ✅ **Verified live** |
| B2 | `certificates` enumeration | ✅ code only | ✅ **Verified live** |
| B3 | Client-side exam grading | ✅ code only | ✅ Verified (live 401s) |
| H1 | Alumni IDOR | ✅ code only | ✅ **Verified live** |
| H2/H3/H7/N2/N3 | consent · quiz bank · CI · jose dep · devBypass | ✅ | ✅ Hold |
| H4 | CSP `unsafe-inline` | ❌ | ❌ Open (Medium) |
| N4 | `jose` pinned to v4 (EOL branch) | — | 🟡 New (Low) |

---

## N1 — Fixed ✅

**The cause was neither of my two hypotheses.** It was a CommonJS/ESM conflict: `jwks-rsa` (transitively required by `firebase-admin`) does `require('jose')`, and `jose@6` is ESM-only (`"type": "module"`), so the require threw `ERR_REQUIRE_ESM` at module load — killing the function before it could write a response. That produced the `500` + `Content-Length: 0` signature I saw. Node version and `@google-cloud/*` packaging were both red herrings; my Pass 1 and Pass 2 diagnoses were wrong.

Your fix, across `eebac56` → `dec925c`:

```js
// package.json — jose downgraded to the CommonJS branch
"jose": "^4.15.9"          // installed 4.15.9, main: ./dist/node/cjs/index.js
"build": "next build --webpack"   // was turbopack

// next.config.mjs:39 — force server-side jose to the CJS entry
webpack: (config, { isServer }) => {
  if (isServer) config.resolve.alias = { ...config.resolve.alias,
    jose: path.resolve(__dirname, 'node_modules/jose/dist/node/cjs/index.js') }
  return config
}

// :44 — firebase-admin removed from externals so it gets bundled
serverExternalPackages: ['@google-cloud/firestore', '@google-cloud/storage', 'nodemailer']

// utils/server/firebaseAdmin.js:3 — static getAuth import decoupled
// getAuth loaded dynamically on-demand   → await import('firebase-admin/auth')
```

`engines` is now `"22.x"` (matching `.nvmrc`), which was worth doing regardless since firebase-admin@14 requires ≥22.

**Live confirmation** — every route that returned `500 0B` in Pass 2:

```
/api/config                     200   /api/quiz/questions           401
/api/search?q=react             200   /api/portal/credentials       401
/api/admin/certificates         401   /api/alumni/documents         401
/api/admin/analytics            401   /api/docs/react/intro         401
/api/admin/workforce/employees  401   POST /api/certify/start       401
/api/certify/mint               405   POST /api/certify/submit      401
```

All correct: 401 for missing auth, 405 for wrong method. **Zero 500s.**

The dynamic `getAuth` import preserves privileged capability — `deleteUser` and `revokeRefreshTokens` still resolve real `firebase-admin/auth` when service credentials are present (`firebaseAdmin.js:71-95`), so H5 stays fixed. `verifyIdToken` continues to use `jose` + JWKS with issuer and audience validation.

Study guides also confirmed working: `/api/docs/react/intro` → `401 {"error":"Authentication required..."}`, meaning the route executed and `outputFileTracingIncludes` still packages the `.sbv` vault correctly under webpack.

---

## Live verification of the original blockers

These were previously verified only in code and against a local build. Now confirmed against production.

### B1 — Admin bypass ✅

```
GET  /api/admin/certificates                                → 401
GET  /api/admin/certificates?adminEmail=harsh@skillbun.tech → 401  ← was 200 + PII
GET  /api/admin/certificates/SKB-2026-CORP-LOR-Y5NH6M?adminEmail=… → 401
POST /api/admin/emails/send  {"adminEmail":"harsh@skillbun.tech", …} → 401
```

The query-param and JSON-body bypasses are both dead. The open mail relay is closed.

### B2 — Certificate enumeration ✅

Unauthenticated Firestore REST, previously 200 with names/emails/UIDs:

```
certificates  403 PERMISSION_DENIED
examAttempts  403 PERMISSION_DENIED
```

### H1 — Alumni IDOR ✅

```
GET /api/alumni/documents?query=ceoharshpatel@gmail.com   (no auth)
→ 401 {"success":false,"documents":[],
       "error":"Authentication required. Please sign in to look up records by email."}
```

Was `200` with `count:3` and full names, emails, departments, designations, and dates.

### B3 — Exam integrity ✅

`/api/certify/start` and `/submit` both return 401 without auth (were 500). Server-side grading, per-attempt option shuffling, and `verifiedScore = attemptData.score` in mint are unchanged from the Pass 1 review.

---

## Regression check

| Check | Result |
|---|---|
| Build (`next build --webpack`) | ✅ exit 0, compiled 6.3s, 158/158 pages |
| Tests | ✅ 29 pass, 0 fail |
| ESLint | ✅ 0 errors, 0 warnings |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Git | ✅ clean tree, HEAD == remote |
| `/manifest.json` · `/favicon.ico` | ✅ 200 |
| `/data/quizQuestions.json` | ✅ 404 (H3 holds) |
| `/certificate/[id]` | ✅ `content="noindex, nofollow"` |
| Security headers | ✅ CSP, HSTS 2yr preload, XCTO, XFO, Referrer-Policy, Permissions-Policy |

No regressions from the webpack switch.

---

## Remaining items (none blocking)

**H4 — CSP `unsafe-inline` (Medium).** Unchanged and the last real security item:

```
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.gstatic.com
           https://apis.google.com https://www.googletagmanager.com https://*.posthog.com
```

Needed today by the JSON-LD block and the pre-paint theme script in `app/layout.jsx`. Move to nonces via middleware. The rest of the policy is tight (`object-src 'none'`, `frame-ancestors 'self'`).

**N4 — `jose` pinned to v4 (Low, new).** `4.15.9` vs current `6.2.12`. This is the correct fix for the CJS constraint, but it parks you on an older branch that will stop getting security patches. Two exits when convenient:

- Prefer: return to `jose@6` once `jwks-rsa` ships an ESM-compatible release — then drop the webpack alias too.
- Or: since `verifyIdToken` is the only thing using `jose` directly, and `getAdminApp()` now works, use real `getAuth(app).verifyIdToken()` and remove the `jose` dependency entirely.

Track it; don't rush it. The webpack alias is load-bearing until one of those lands.

**Build-tooling note.** `next build --webpack` opts out of Turbopack. Fine and stable, but revisit after the `jose`/`jwks-rsa` situation resolves so you're not on the legacy path indefinitely.

**Housekeeping.** `firebase-admin` 14.2.0 → 14.3.0, `next` 16.3.1 → 16.3.4, `dompurify` 3.4.13 → 3.4.15 available (all patch/minor). `.env.example` still omits 14 vars the code reads (from Pass 2). `@google-cloud/firestore` 9.x and `@google-cloud/storage` 8.x are majors — leave them pinned until firebase-admin supports them.

**Infrastructure, not re-tested this pass:** TLS 1.0/1.1 minimum (H6), DMARC `p=none` (H8), rate-limiter fallback under load (H9).

**Still the highest-leverage gap: monitoring.** The backend was fully down across two audit passes and nothing alerted. Uptime checks on one authenticated route plus error reporting (Sentry or equivalent) would have caught it in minutes instead of two review cycles.

---

## Summary

Four blockers from the original audit and one deployment blocker introduced during remediation are all resolved and verified against production. Remaining work is one Medium hardening item (CSP nonces), one dependency-hygiene item to track (`jose` v4), plus the pre-existing infrastructure and observability backlog.

**From a security standpoint this is launch-ready.** Add monitoring before you drive real traffic to it.

---

## Coverage

**This pass:** 12 live production endpoints (GET and POST); B1 bypass re-tested on 3 vectors including JSON body; unauthenticated Firestore REST on `certificates` and `examAttempts`; live CSP header; full build; 29 tests; ESLint; `npm audit --omit=dev`; `npm outdated`; dependency versions and module formats; re-read of `firebaseAdmin.js`, `next.config.mjs`, `package.json`; git state.

**Not verified:** authenticated end-to-end flows as student and admin (no test credentials used — all live checks are unauthenticated, so they confirm access is *denied* correctly, not that authorized paths *succeed*; exercise one real login and one real cert mint before launch); TLS/DNS; accessibility; performance under load.
