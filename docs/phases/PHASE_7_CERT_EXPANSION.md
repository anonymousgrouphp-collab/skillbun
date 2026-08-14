# Phase 7: Certificate Type Expansion & Admin Issuance

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 6 ← Milestone Task System](./PHASE_6_MILESTONES.md)  
**Next Phase:** [Phase 8 → Certificate Multi-Template Renderer](./PHASE_8_CERT_RENDERER.md)  
**Effort:** ~1.5 Days (1 Engineer)  
**Status:** ✅ Completed  
**Depends On:** Phase 3 (admin UI), existing `/api/certify/mint` route

---

## Objective

Extend the existing certificate minting API to support `INTERNSHIP`, `TRAINING`, and `LOR` cert types with admin-only issuance. Add 1-click credential issuance modals to the admin workforce hub. The public verification page update comes in Phase 8.

---

## Deliverables

### 7.1 Extend Certificate Minting API

Modify **`app/api/certify/mint/route.js`**:

Current schema accepts: `name`, `roadmapSlug`, `roadmapTitle`, `score`  
Extended schema adds support for workforce certificates:

```javascript
// New fields for workforce cert types
cert_type:          { type: 'string', enum: ['ROADMAP', 'INTERNSHIP', 'TRAINING', 'LOR'], default: 'ROADMAP' },
employee_id:        { type: 'string' },          // FK to /employees
stream_or_track:    { type: 'string' },           // e.g., "Tech Team (Development & Engineering)"
start_date:         { type: 'string' },           // YYYY-MM-DD
end_date:           { type: 'string' },           // YYYY-MM-DD
recommendation_text:{ type: 'string' },           // LOR only
issued_by:          { type: 'string', default: 'Harsh Patel (Lead, SkillBun / Team Cosmic)' },
```

**Logic changes:**
- `cert_type: 'ROADMAP'` → existing flow (user self-mint after quiz, requires score ≥ 70)
- `cert_type: 'INTERNSHIP' | 'TRAINING' | 'LOR'` → admin-only issuance (check `isAuthorizedAdminEmail()`)
- Workforce certs use custom IDs from `generateWorkforceId()` instead of Firestore auto-IDs
- Workforce certs block issuance if employee `status === 'TERMINATED'`

### 7.2 Admin Issuance Modals

Add three modals to `/admin/workforce` employee detail view:

#### "Issue Certificate of Internship" Modal
- Pre-filled: name, email, department, stream, joining_date, contract_end_date
- Admin reviews and clicks "Issue" → mints `SB-INT-YYYY-XXXXXX`
- Only available when status = `COMPLETED`

#### "Issue Certificate of Training" Modal
- Pre-filled: name, email, stream/track trained in
- Admin can customize the training track title
- Admin reviews and clicks "Issue" → mints `SB-TRN-YYYY-XXXXXX`
- Available when status = `ACTIVE` or `COMPLETED`

#### "Issue Letter of Recommendation" Modal
- Pre-filled: name, email, department, stream, tenure dates
- **Editable `recommendation_text` textarea** with professional boilerplate pre-filled
- Admin customizes the recommendation text before issuing
- Clicks "Issue" → mints `SB-LOR-YYYY-XXXXXX`
- Only available when status = `COMPLETED`

### 7.3 Issued Credentials List

Add to employee detail view:
- "Issued Credentials" section showing all certificates linked to this employee
- Each row: cert type badge, ID, issue date, status (active/revoked)
- Click → opens `/certificate/[id]` in new tab
- Admin can revoke a credential (sets `is_revoked: true`)

---

## Files Created / Modified

| Action | File |
|:---|:---|
| MODIFY | `app/api/certify/mint/route.js` (extend schema + admin-only workforce flow + custom IDs) |
| NEW | `app/api/admin/workforce/credentials/route.js` (GET credentials by employee ID) |
| NEW | `app/api/admin/workforce/credentials/[id]/route.js` (PATCH credential revocation) |
| MODIFY | `app/admin/workforce/page.jsx` (add 3 issuance modals + credentials list + revocation actions) |
| MODIFY | `app/admin/workforce/workforce.module.css` (credentials cards, badges, and issuance styles) |

---

## Verification Checklist

- [x] **V7.1** — Existing `ROADMAP` cert minting still works unchanged (backward compat)
- [x] **V7.2** — `INTERNSHIP` cert mints with correct `SB-INT-YYYY-XXXXXX` ID
- [x] **V7.3** — `TRAINING` cert mints with correct `SB-TRN-YYYY-XXXXXX` ID
- [x] **V7.4** — `LOR` cert mints with `recommendation_text` stored in Firestore
- [x] **V7.5** — Non-admin user cannot mint `INTERNSHIP`/`TRAINING`/`LOR` (403)
- [x] **V7.6** — Terminated employee cannot receive completion certs (blocked)
- [x] **V7.7** — Admin modals pre-fill correct employee data
- [x] **V7.8** — LOR textarea shows editable boilerplate text
- [x] **V7.9** — Issued credentials list shows all certs for employee
- [x] **V7.10** — Revoke button sets `is_revoked: true` in Firestore
- [x] **V7.11** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 8: Certificate Multi-Template Renderer](./PHASE_8_CERT_RENDERER.md)**

