# SkillBun Current Architecture & Production Workflow

**Release:** 2.10.12  
**Updated:** 2026-09-08  
**Companion audit:** [PRODUCTION_AUDIT_REPORT_2026-09-08.md](PRODUCTION_AUDIT_REPORT_2026-09-08.md)

**Current authority:** [Hardening results and remaining release gates](HARDENING_RELEASE_REPORT_2026-09-08.md). Changes below describe the local release candidate, not an already deployed release.

## End-to-end workflow

```mermaid
flowchart TD
    V[Visitor] --> H[Homepage]
    H --> O[Onboarding]
    O --> A[Firebase Auth\nGoogle or email/password]
    A --> P[Profile + preferences]
    P --> Q[Career discovery quiz]
    Q --> R[Career recommendations]
    R --> RM[Roadmap catalog\n100 roadmap definitions; dynamically rendered pages]
    RM --> T[Roadmap progress]
    T --> SG[Study guide request]
    SG --> DOCS[/api/docs/:slug/:topicId]
    DOCS --> AUTH{Bearer token valid?}
    AUTH -->|no| D401[401]
    AUTH -->|yes| RL1[User/IP rate limits]
    RL1 --> SBV[SBV1 lookup + AES-GCM decrypt\ncontent hash verification]
    SBV --> GUIDE[Markdown guide rendered in client]
    T --> GATE{At least 60% progress?}
    GATE -->|no| T
    GATE -->|yes| START[/api/certify/start]
    START --> ATT[Atomic quota reservation + examAttempts creation\nanswer key never client-readable]
    ATT --> EXAM[10-question exam\nclient receives no answer key]
    EXAM --> SUBMIT[/api/certify/submit]
    SUBMIT --> GRADE[Transactional server grading\nowner + status + expiry checks]
    GRADE --> PASS{Score >= 70%?}
    PASS -->|no| RETRY[Retry/cooldown controls]
    PASS -->|yes| MINT[/api/certify/mint\ntransaction binds score, name, title; consumes attempt]
    MINT --> CERT[(Firestore certificates)]
    CERT --> VERIFY[Public certificate verification\nexact document read]
```

## Trust boundaries

```mermaid
flowchart LR
    B[Browser\nuntrusted input] --> EDGE[Cloudflare + Vercel]
    EDGE --> NONCE[Page proxy: fresh CSP nonce, no HTML cache]
    EDGE --> API[Next.js route handlers]
    API --> TOK[Firebase ID-token verification plus revocation check]
    TOK --> RBAC[Owner/admin authorization]
    API --> LIMIT[Redis -> Firestore -> memory rate limit fallback]
    API --> ADMIN[firebase-admin server SDK]
    ADMIN --> FS[(Firestore; Admin SDK bypasses client rules)]
    API --> EXT[Gemini / Zoho SMTP / Turnstile]
    API --> VAULT[(Encrypted SBV1 content)]
```

Rules for the boundary:

- Browser scores and query parameters are not authority. Learning progress remains self-reported; the server validates the 60% threshold, not actual study completion.
- Admin routes require a verified bearer token and server-side admin resolution.
- Direct client writes to certificates and exam attempts are denied by Firestore rules.
- Public certificate verification is an exact-document lookup; collection listing is admin-only or restricted by an owner UID query. Existing exact public reads still expose whole records; field minimization remains a release decision.
- Study guides require auth before decrypting content.
- Email dispatch is an admin-only server action and must remain rate-limited.

## Admin workflow

```mermaid
flowchart TD
    ADMINUI[Admin console] --> TOKEN[Firebase ID token]
    TOKEN --> CHECK{Server verifies token}
    CHECK -->|invalid/missing| DENY[401/403]
    CHECK -->|valid| ROLE{Admin claim, approved email, or active /admins doc?}
    ROLE -->|no| DENY
    ROLE -->|yes| LIMIT[Admin user/IP rate limits]
    LIMIT --> VAL[Strict schema validation]
    VAL --> CRUD[Certificates / workforce / analytics]
    CRUD --> DB[(Firestore via firebase-admin)]
    CRUD --> MAIL[Zoho SMTP\ncontrolled recipients/templates]
```

## Current release controls

| Control | Current state |
|---|---|
| Runtime | Node 22, Next.js webpack production build |
| Auth compatibility | `jose` 4.x CommonJS-compatible pin retained for Firebase/JWKS deployment path |
| Protected API behavior | Missing-auth probes return 401; wrong methods return 405 |
| Firestore exposure | Anonymous certificate/exam collection listing returns 403 |
| Consent | Local fix: load analytics only after consent; privacy page can reopen choices |
| Content | Local proxy blocks plaintext banks; live fullstack bank still returned 200 during recheck |
| Security headers | Local nonce CSP verified; live site has the older policy |
| Monitoring follow-up | Add production 5xx, latency, Redis, SMTP, and Firestore alerts |

## Launch sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CI as CI/build checks
    participant V as Vercel
    participant Live as skillbun.tech
    participant Smoke as Authenticated smoke test

    Dev->>CI: lint + tests + npm audit + production build
    CI-->>Dev: Tests, dependency audit and build must pass on Node 22
    Dev->>CI: Firestore emulator tests plus authenticated staging smoke
    Dev->>V: Verify service credentials, no HTML caching, publish Firestore rules
    Dev->>V: deploy release
    V->>Live: serve pages and API routes
    Smoke->>Live: login and student flow
    Smoke->>Live: admin flow and non-destructive preview
    Live-->>Smoke: expected authorized responses
    Smoke-->>Dev: approve public announcement
```

## Operational warning

The current audit verifies unauthenticated denial and static/build health. It does not create accounts or perform production writes. Before announcement, run the controlled authenticated smoke test and confirm alerting for unexpected 5xx responses.
