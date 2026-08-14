# Phase 1: Firestore Data Model & Encryption

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Next Phase:** [Phase 2 → Employee CRUD API](./PHASE_2_EMPLOYEE_CRUD_API.md)  
**Effort:** ~1 Day (1 Engineer)  
**Status:** ⬜ Not Started

---

## Objective

Lay the data foundation — create all Firestore collections, deploy security rules, and build the AES-256-GCM encryption helper for credential storage. No UI, no API routes — just the data layer.

---

## Deliverables

### 1.1 Firestore Collections

Create the following collections (documents will be created via Phase 2 APIs):

**`/employees`** — Intern/team member records
```
id, salutation, full_name, parent_name, current_address, permanent_address,
course_degree, college_name, personal_email (unique indexed), work_email,
phone, employment_type, status, department, designation, joining_date,
contract_end_date, stipend_amount, stipend_currency, encrypted_credentials,
created_at, updated_at
```

**`/milestones`** — Task assignments
```
id, employee_id, employee_email (denormalized), title, description,
priority, status, due_date, deliverable_url, review_notes,
completed_at, created_at
```

**`/workforce_docs`** — Offer/extension letter audit trail
```
id (e.g. SB-OFF-2026-8K29DF), employee_id, doc_type, title,
metadata_snapshot, issued_by, issued_at
```

### 1.2 Firestore Security Rules

Deploy the rules from PRD Section 7.2:
- `isAdmin()` → checks `request.auth.token.admin == true` OR email in admin list
- `/employees` → Admin full CRUD; intern read-only on own record (matched by `personal_email`)
- `/milestones` → Admin full CRUD; intern can update only `status`, `deliverable_url`, `updated_at`
- `/certificates` → Public read; Admin write-only

### 1.3 Encryption Helper

Create **`utils/server/workforceCrypto.js`**:
- `encryptCredentials(data)` → AES-256-GCM encrypt JSON payload using `WORKFORCE_ENCRYPTION_KEY` env var
- `decryptCredentials(ciphertext)` → Decrypt and return JSON
- Random 12-byte IV per encryption, 16-byte auth tag stored with ciphertext
- Base64 encoding for Firestore string storage

### 1.4 Environment Variable

Add to `.env.example`:
```
WORKFORCE_ENCRYPTION_KEY=  # 32-byte hex key for AES-256-GCM credential encryption
```

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `utils/server/workforceCrypto.js` |
| MODIFY | `firestore.rules` (or deploy via Firebase Console) |
| MODIFY | `.env.example` |

---

## Verification Checklist

- [ ] **V1.1** — `workforceCrypto.js` exports `encryptCredentials()` and `decryptCredentials()`
- [ ] **V1.2** — Encrypt → decrypt round-trip returns identical JSON payload
- [ ] **V1.3** — Missing `WORKFORCE_ENCRYPTION_KEY` throws a clear error, not a silent failure
- [ ] **V1.4** — Firestore security rules deploy without errors
- [ ] **V1.5** — Security rules: unauthenticated user cannot read `/employees`
- [ ] **V1.6** — Security rules: authenticated non-admin cannot write to `/employees`
- [ ] **V1.7** — Security rules: `/certificates` is publicly readable
- [ ] **V1.8** — `.env.example` documents the new `WORKFORCE_ENCRYPTION_KEY` variable
- [ ] **V1.9** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 2: Employee CRUD API](./PHASE_2_EMPLOYEE_CRUD_API.md)**
