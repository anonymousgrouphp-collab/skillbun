# Phase 4: PDF Offer Letter Engine

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 3 ← Admin Workforce Hub UI](./PHASE_3_ADMIN_UI.md)  
**Next Phase:** [Phase 5 → Email Dispatch Pipeline](./PHASE_5_EMAIL_DISPATCH.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ✅ Completed  
**Depends On:** Phase 1 (data model), Phase 2 (employee CRUD for test data)

---

## Objective

Install `pdf-lib` and build the server-side 4-page Offer Letter & Terms of Engagement PDF generator, plus a 1-page Extension Letter generator. Output is an in-memory `Buffer` — email dispatch comes in Phase 5.

---

## Deliverables

### 4.1 Install Dependency

```bash
npm install pdf-lib
```

### 4.2 Offer Letter Generator

Create **`utils/server/pdf/offerLetterGenerator.js`**:

**Input:** Employee data object (from Firestore `/employees` record)  
**Output:** `{ buffer: Buffer, filename: string, referenceId: string }`

Must render the exact 4-page layout from PRD Section 6.1:

| Page | Content |
|:---|:---|
| **Page 1** | Header (SKILLBUN), blue accent title, To Block (salutation, name, parent, addresses, qualification, college), BACKGROUND, SELECTION AS INTERN, INTERNSHIP STATUS AND PURPOSE |
| **Page 2** | PARTICIPATION AND RESPONSIBILITIES (period dates), TIME MANAGEMENT, DUTIES (stream-specific), COMPLIANCE, PROFESSIONAL CONDUCT, NDA |
| **Page 3** | NDA contd., COMPENSATION/PERKS/PPO (stipend or unpaid), TERMINATION clauses, LIABILITY, GOVERNING LAW, ENTIRE AGREEMENT |
| **Page 4** | IN WITNESS WHEREOF execution block, SkillBun signature (Harsh Patel, Lead) with seal placeholder, Candidate signature line, confidential footer |

**Typography:**
- Header: bold, 14pt
- Section titles: bold, 11pt, blue accent
- Body text: regular, 10pt
- Footer: italic, 8pt, gray

**Reference ID:** Generated as `SB-OFF-YYYY-[6-CHAR-ALPHANUM]` (from PRD Section 6.2)

### 4.3 Extension Letter Generator

Create **`utils/server/pdf/extensionLetterGenerator.js`**:

**Input:** Employee data + new contract end date  
**Output:** `{ buffer: Buffer, filename: string, referenceId: string }`

Single-page letter:
- SkillBun letterhead
- "EXTENSION OF INTERNSHIP TENURE"
- References original offer (SB-OFF ID)
- New end date, all other terms unchanged
- Signature block
- Reference ID: `SB-EXT-YYYY-[6-CHAR-ALPHANUM]`

> **Note:** The PRD data model also defines `RELIEVING_LETTER` as a `doc_type`. Relieving letter generation is deferred to post-MVP — the schema supports it, but no generator is built in this phase.

### 4.4 ID Generator Utility

Create **`utils/server/workforce/idGenerator.js`**:
```javascript
export function generateWorkforceId(prefix) {
  // prefix = 'SB-OFF', 'SB-EXT', 'SB-INT', 'SB-TRN', 'SB-LOR'
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
  return `${prefix}-${year}-${random}`;
}
```

### 4.5 Admin UI Integration

Add to `/admin/workforce` (Phase 3 page):
- "Generate Offer Pack" button on employee detail (visible when status = `OFFER_SENT`)
- "Generate Extension Letter" button (visible when status = `ACTIVE`)
- Both buttons trigger server-side generation and return PDF for preview/download
- Temporary: direct download only (email dispatch wired in Phase 5)

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `utils/server/pdf/pdfLayoutHelper.js` |
| NEW | `utils/server/pdf/offerLetterGenerator.js` |
| NEW | `utils/server/pdf/extensionLetterGenerator.js` |
| NEW | `utils/server/workforceId.js` |
| NEW | `app/api/admin/workforce/pdf/offer/route.js` |
| NEW | `app/api/admin/workforce/pdf/extension/route.js` |
| MODIFY | `package.json` (added `pdf-lib`) |

---

## Verification Checklist

- [x] **V4.1** — `pdf-lib` installed and `package.json` updated
- [x] **V4.2** — Offer letter generates a 4-page PDF buffer without errors
- [x] **V4.3** — PDF opens correctly in browser/reader with proper text rendering
- [x] **V4.4** — All dynamic fields (name, address, dates, stream, stipend) populate correctly
- [x] **V4.5** — Page headers and footers appear on all 4 pages
- [x] **V4.6** — Confidential footer shows "Page X of 4" correctly
- [x] **V4.7** — Extension letter generates a 1-page PDF buffer
- [x] **V4.8** — `generateWorkforceId('SB-OFF')` produces valid format (e.g., `SB-OFF-2026-A1B2C3`)
- [x] **V4.9** — IDs are non-sequential (two calls produce different IDs)
- [x] **V4.10** — Serverless PDF generation API endpoints ready for admin UI download & dispatch
- [x] **V4.11** — Extension Letter PDF generation API endpoint ready for admin UI download
- [x] **V4.12** — `npm run lint` / build passes with zero errors

---

**→ Once all checks pass, proceed to [Phase 5: Email Dispatch Pipeline](./PHASE_5_EMAIL_DISPATCH.md)**
