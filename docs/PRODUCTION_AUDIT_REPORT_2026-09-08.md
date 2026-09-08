# SkillBun Full Live Pre-Production Audit

> **Superseded verdict:** The conditional approval below is withdrawn. The subsequent hardening pass found additional answer-bank exposure, an alumni reference-classification bypass, and exam transaction/rules issues. See [the current remediation and release-gate report](HARDENING_RELEASE_REPORT_2026-09-08.md). The remainder is retained as historical evidence, not current production approval.

**Site:** https://skillbun.tech/  
**Repository:** https://github.com/anonymousgrouphp-collab/skillbun  
**Audit date:** 2026-09-08  
**Release checked:** 2.10.12 (`dec925c`)  
**Scope:** live black-box checks, repository review, Firestore rules, API authorization, build/test/lint/dependency verification, SEO/headers, secrets, injection surfaces, abuse controls, and production workflow documentation.

## 1. Executive verdict

**Conditional production approval: no critical or high-severity blocker was reproduced in this audit.** The previous release blockers are fixed and verified against production. Keep the remaining medium/low items in the launch checklist, and complete one authenticated student/admin smoke test before announcing the release.

### Previous blockers re-tested live

| Area | Live result | Status |
|---|---:|---|
| Admin query/body impersonation (`adminEmail`) | 401 on certificate routes, ID route, workforce routes, and email dispatch | Fixed |
| Anonymous alumni email lookup / IDOR | 401 with a non-reference email query | Fixed |
| Anonymous Firestore certificate collection enumeration | 403 | Fixed |
| Certificate/exam backend availability | API routes return expected 401/405 instead of prior 500 | Fixed |
| Client-side certificate grading | Server attempt records, server grading, ownership/status checks, mint reads verified score | Fixed in code; authenticated success path still needs a real smoke test |

## 2. Evidence summary

### Automated repository checks

| Check | Result |
|---|---|
| Production build | PASS — Next.js webpack build; 158 static/generated pages completed |
| Unit/security/roadmap tests | PASS — 29 passed, 0 failed |
| ESLint | PASS — no reported errors/warnings in the final run |
| `npm audit` | PASS — 0 known vulnerabilities |
| Git secret-pattern scan | PASS — no tracked private-key blocks, JWTs, cloud tokens, or common live-key patterns found |
| Environment separation | PASS — server credentials use server-only variables; Firebase browser config uses expected public variables |
| Working tree | Only audit documentation is untracked; no source changes were made by this audit |

### Live route and platform checks

| Request | Result |
|---|---:|
| `/`, `/roadmap`, `/quiz`, `/counsellor`, `/projects`, `/alumni`, `/certificate`, `/dashboard` | 200 |
| `/robots.txt`, `/sitemap.xml`, `/manifest.json`, `/favicon.ico` | 200 |
| Unknown page | 404 |
| Public `/api/config`, `/api/search` | 200 |
| Protected admin, quiz, docs, portal, alumni, certification routes without auth | 401 |
| Wrong-method certification request | 405 |
| `/.env`, `/.git/config`, traversal probe, source-map probe | 404 |
| HTTP → HTTPS / www canonicalization | Redirects observed; exact permanent status should be confirmed in deployment settings if SEO tooling requires 301 specifically |

## 3. Security category status

| Category | Status | Evidence / conclusion |
|---|---|---|
| Authentication and session handling | PASS with follow-up | Firebase token verification is active; protected routes deny missing tokens. Full authorized flow and token-revocation behaviour require a real authenticated smoke test. |
| Authorization and IDOR | PASS for audited vectors | Admin impersonation fallback is gone; alumni email lookup requires auth; Firestore certificate listing is admin-only. |
| Secrets and credentials | PASS | Tracked-file pattern scan clean; `.env` is ignored and not tracked. Continue rotating credentials after historical exposure investigations. |
| Injection and XSS | PASS with review note | Parameter allowlists and centralized validation are present. Dynamic HTML sinks are concentrated in client quiz/counsellor renderers; DOMPurify is used in the main rich-content paths. Keep sink-by-sink review in regression tests. |
| API route protection | PASS for unauthenticated boundary | All sampled protected routes return 401; admin routes no longer accept client-supplied admin email. |
| Input validation | PASS | Security tests cover prototype-pollution defense, SQL-injection pattern defense, and strict schemas; route-level validation is present on sensitive mutations. |
| Rate limiting and abuse controls | PASS with coverage follow-up | Sensitive certificate, email, AI, docs, human-verification, and portal flows include limits. Maintain a route-to-limit inventory and alert on fallback degradation. |
| Firestore rules | PASS for tested exposure | Anonymous collection enumeration of `certificates` and `examAttempts` returns 403; exact certificate reads remain intentionally public for verification. |
| CORS and security headers | PASS with CSP hardening follow-up | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and CSP reach live HTML/API responses. Production CSP still includes `script-src 'unsafe-inline'`. |
| Dependency safety | PASS | `npm audit` reports 0 vulnerabilities. `jose` is pinned to the CommonJS-compatible 4.x line to avoid the prior production ESM crash; document this compatibility constraint. |
| Sensitive error/log leakage | PASS for tested auth boundaries; review remaining handlers | The previous email route stack/details leak was removed with the bypass fix. Keep generic client errors and server-only detailed logs. |
| SEO/indexing | PASS with polish items | Sitemap, robots, canonical metadata, manifest, favicon, and certificate `noindex` are live. Robots output contains both Cloudflare-managed and application groups, so policy ownership should be documented. |
| Accessibility | Not fully instrumented | Skip navigation and semantic structure exist, but no automated axe/keyboard/contrast run was available in this audit. |
| Performance | Build/cache pass; load test pending | Immutable static asset caching and page generation are healthy. No production load/stress profile was run. |
| Privacy/compliance | Improved; legal review pending | Consent gating is present for analytics. Confirm retention, DPDP/GDPR language, processor disclosures, and consent withdrawal behaviour with counsel. |

## 4. Detailed remaining findings

### M1 — Production CSP still permits `unsafe-inline`

**Severity:** Medium  
**Location:** `next.config.mjs` security headers  
**Evidence:** Live `script-src` includes `'unsafe-inline'`.

Inline JSON-LD and theme bootstrap code make the current policy convenient, but `unsafe-inline` reduces protection against script injection. Move inline scripts to nonce-bearing scripts or external static modules, then remove `unsafe-inline` from `script-src`. Validate Firebase/Google/Turnstile/PostHog compatibility after tightening.

### M2 — Authenticated end-to-end production path is not yet proven

**Severity:** Medium operational risk  
**Evidence:** This audit intentionally used no credentials. Unauthenticated denial is verified, but authorized success is not.

Before launch, run a controlled smoke test with a test account and an admin account: login, onboarding, quiz/questions, study-guide decrypt, certification start/submit/mint, public certificate verification, admin read, and one non-destructive email preview. Do not use a real recipient for mail testing.

### M3 — No production load/stress test or uptime alert was demonstrated

**Severity:** Medium operational risk  
**Evidence:** Build and route health pass, but no sustained traffic test or alert configuration was available.

Add an external monitor for `/api/config` and a protected-route health signal that distinguishes expected 401 from unexpected 5xx. Alert on 5xx rate, function cold-start failures, Redis fallback, SMTP failures, and Firestore permission errors.

### L1 — CSP/robots/DNS and dependency maintenance follow-up

**Severity:** Low / maintenance  
**Evidence:** `robots.txt` combines Cloudflare-managed content-signal groups with application groups; `jose` is intentionally held on 4.x while the current major is 6.x; `npm outdated` reports newer compatible candidates for several packages.

Document the compatibility pin, review upgrades in a branch, and establish one authoritative robots policy. Do not upgrade `jose` without testing the Firebase Admin/JWKS deployment path.

### L2 — Node test runner emits module-type warnings

**Severity:** Low  
**Evidence:** Tests pass but report `MODULE_TYPELESS_PACKAGE_JSON` for server utility modules.

Either add the appropriate module declaration after validating the whole build, or explicitly document why the mixed Next.js/Node test setup remains warning-only.

## 5. Positive controls verified

- Admin authorization uses server-side token verification and layered admin resolution.
- Certificate collection writes are denied to direct clients; exact-document public reads support verification.
- Exam answer keys are kept server-side; client question payloads omit `correctIndex` and explanations.
- Exam submissions verify attempt ownership, active/completed status, expiration, and rate limits.
- Study-guide route validates slug/topic formats, requires auth, rate-limits access, uses obfuscated paths, AES-GCM authentication, and content-hash verification.
- Public unencrypted quiz question data is no longer exposed at `/data/quizQuestions.json`.
- Manifest, favicon, certificate `noindex`, and consent-gated analytics are live.
- Open-redirect normalization rejects protocol-relative, absolute, and backslash-based external paths.
- `.env`, service-account material, and common secret patterns are absent from tracked files.

## 6. Required launch checklist

1. Run one controlled authenticated student and admin smoke test in production.
2. Confirm Vercel Production environment variables and Node 22 runtime are present.
3. Confirm Firestore rules deployed match the repository rules.
4. Configure 5xx/latency/SMTP/Redis/Firestore monitoring and an owner alert destination.
5. Schedule CSP nonce hardening and accessibility/load testing as post-launch work if not completed before announcement.

## 7. Workflow chart

The current workflow and trust-boundary chart is maintained in [ARCHITECTURE_WORKFLOW_2026-09-08.md](ARCHITECTURE_WORKFLOW_2026-09-08.md).

## 8. Audit limitations

No credentials, destructive writes, certificate minting, email dispatch, or user-data mutation were performed. Accessibility, browser matrix, authenticated E2E, load/stress, disaster recovery, backup restore, and legal content review remain outside this black-box pass.
