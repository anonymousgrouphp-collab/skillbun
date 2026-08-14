# Phase 8: Certificate Multi-Template Renderer

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 7 ← Certificate Type Expansion](./PHASE_7_CERT_EXPANSION.md)  
**Next Phase:** [Phase 9 → Intern Workspace Portal](./PHASE_9_INTERN_PORTAL.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ⬜ Not Started  
**Depends On:** Phase 7 (workforce certs must exist in Firestore)  
**Design Dependency:** Canva PNG templates for Internship & Training certificates

---

## Objective

Update the existing `/certificate/[id]` public verification page to render four distinct certificate types based on `cert_type`. The page currently only renders ROADMAP certs with a single Canva template. This phase adds Internship, Training, and LOR renders.

---

## Deliverables

### 8.1 Template Assets (Design Dependency)

The following Canva PNG assets must be provided before this phase starts:

| Asset | Path | Dimensions |
|:---|:---|:---|
| Internship Certificate | `public/internship-cert-template.png` | Landscape (matching existing cert aspect ratio) |
| Training Certificate | `public/training-cert-template.png` | Landscape (matching existing cert aspect ratio) |

> **Note:** The LOR does NOT use a Canva template — it uses a programmatic corporate letterhead layout.

### 8.2 Conditional Rendering in `/certificate/[id]`

Modify **`app/certificate/[id]/page.jsx`**:

Read `cert.cert_type` (defaulting to `'ROADMAP'` for backward compat) and render accordingly:

#### `ROADMAP` (existing — no changes)
- Existing Canva template (`certificate-template.png`)
- Existing overlays: SkillBun wordmark, recipient name, roadmap title, QR meta

#### `INTERNSHIP`
- Template: `internship-cert-template.png`
- Overlays: Recipient name (Cinzel), department, designation, tenure period (start → end date), certificate ID, QR code
- Verification badge: "Verified Certificate of Internship"

#### `TRAINING`
- Template: `training-cert-template.png`
- Overlays: Recipient name (Cinzel), training track/stream title, tenure period, certificate ID, QR code
- Verification badge: "Verified Certificate of Training"

#### `LOR`
- **No Canva template** — fully programmatic vertical A4 layout
- Header: Team Cosmic / SkillBun letterhead banner with logo
- Title: "LETTER OF RECOMMENDATION"
- Salutation: **"TO WHOMSOEVER IT MAY CONCERN"**
- Body: `cert.recommendation_text` rendered as formatted paragraphs
- Footer: Harsh Patel signature block, seal placeholder, certificate ID, verification URL
- Print-optimized: A4 page margins, `@media print` styles

### 8.3 Revoked Certificate Handling

If `cert.is_revoked === true`:
- Show a red "REVOKED" banner across the certificate
- Hide LinkedIn share buttons
- Display: "This credential has been revoked by the issuing authority."

### 8.4 Certificate Type Badge

Above the certificate frame, show a type-specific badge:
- 🎓 `ROADMAP` → "Career Roadmap Certification"
- 📋 `INTERNSHIP` → "Certificate of Internship"
- 🏅 `TRAINING` → "Certificate of Training"
- ✉️ `LOR` → "Letter of Recommendation"

---

## Files Created / Modified

| Action | File |
|:---|:---|
| MODIFY | `app/certificate/[id]/page.jsx` (conditional rendering per cert_type) |
| MODIFY | `app/certificate/[id]/certificate.module.css` (LOR styles, revoked banner, type badges) |
| NEW | `public/internship-cert-template.png` (design dependency) |
| NEW | `public/training-cert-template.png` (design dependency) |

---

## Verification Checklist

- [ ] **V8.1** — Existing `ROADMAP` certificates render identically to before (zero regression)
- [ ] **V8.2** — `INTERNSHIP` cert renders with correct Canva template and overlays
- [ ] **V8.3** — `TRAINING` cert renders with correct Canva template and overlays
- [ ] **V8.4** — `LOR` renders as vertical letterhead document with recommendation text
- [ ] **V8.5** — LOR print view produces clean A4 output via `window.print()`
- [ ] **V8.6** — Cert type badge displays correctly above certificate frame
- [ ] **V8.7** — Revoked certificates show red "REVOKED" banner
- [ ] **V8.8** — Revoked certificates hide LinkedIn share buttons
- [ ] **V8.9** — LinkedIn "Add to Profile" works for INTERNSHIP/TRAINING types
- [ ] **V8.10** — Invalid/nonexistent cert IDs still show the existing error card
- [ ] **V8.11** — All certificate types render correctly in **dark** theme
- [ ] **V8.12** — All certificate types render correctly in **light** theme
- [ ] **V8.13** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 9: Intern Workspace Portal](./PHASE_9_INTERN_PORTAL.md)**
