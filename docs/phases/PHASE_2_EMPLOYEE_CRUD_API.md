# Phase 2: Employee CRUD API Routes

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 1 ← Data Model & Encryption](./PHASE_1_DATA_MODEL.md)  
**Next Phase:** [Phase 3 → Admin Workforce Hub UI](./PHASE_3_ADMIN_UI.md)  
**Effort:** ~1.5 Days (1 Engineer)  
**Status:** ⬜ Not Started  
**Depends On:** Phase 1 (Firestore schema + encryption helper must exist)

---

## Objective

Build the four server-side API routes for employee record management. Admin-only, Firebase Auth protected, with full input validation and rate limiting using existing SkillBun utilities.

---

## Deliverables

### 2.1 API Routes

All routes are admin-only (guarded by `isAuthorizedAdminEmail()` which covers both the `ADMIN_EMAILS` env var check and Firebase Auth Custom Claims `request.auth.token.admin === true` per PRD §5.1).

#### `GET /api/admin/workforce/employees`
- Returns all employee records (paginated if >50)
- Optional query filters: `?status=ACTIVE`, `?department=Tech Team`
- Credentials field returned as `[ENCRYPTED]` placeholder (never sent raw to client list view)

#### `POST /api/admin/workforce/employees`
- Creates new employee record in `/employees` collection
- Validates all required fields via `validateSchema()`
- Encrypts `credentials_data` via `encryptCredentials()` before Firestore write
- Sets `created_at` and `updated_at` timestamps server-side
- Returns new employee `id`

#### `PATCH /api/admin/workforce/employees/[id]`
- Partial update of employee fields
- If `credentials_data` is included, re-encrypt before saving
- Updates `updated_at` timestamp
- Status transitions: validates allowed transitions (e.g., `OFFER_SENT → ACTIVE`, not `COMPLETED → OFFER_SENT`)

#### `DELETE /api/admin/workforce/employees/[id]`
- Soft-delete preferred: set `status: 'ARCHIVED'` and `archived_at` timestamp
- Hard-delete only if employee has zero linked certificates and milestones

### 2.2 Validation Schema

```javascript
{
  salutation:       { type: 'string', required: true, enum: ['Mr.', 'Ms.'] },
  full_name:        { type: 'string', required: true, minLength: 2, maxLength: 100 },
  parent_name:      { type: 'string', required: true, minLength: 2, maxLength: 100 },
  personal_email:   { type: 'email',  required: true },
  phone:            { type: 'string', required: true, pattern: /^[+\d\s-]{7,15}$/ },
  course_degree:    { type: 'string', required: true, maxLength: 100 },
  college_name:     { type: 'string', required: true, maxLength: 150 },
  current_address:  { type: 'string', required: true, maxLength: 300 },
  permanent_address:{ type: 'string', required: true, maxLength: 300 },
  employment_type:  { type: 'string', required: true, enum: ['INTERN', 'FULL_TIME', 'CONTRACTOR'] },
  department:       { type: 'string', required: true, maxLength: 100 },
  designation:      { type: 'string', required: true, maxLength: 100 },
  joining_date:     { type: 'string', required: true },
  contract_end_date:{ type: 'string', required: true },
  stipend_amount:   { type: 'number', required: true, min: 0 },
  stipend_currency: { type: 'string', required: true, enum: ['INR'], default: 'INR' },
  work_email:       { type: 'email' },  // Optional — assigned Zoho workspace email
}
```

### 2.3 Rate Limiting

Apply existing `checkServerRateLimit()`:
- 10 requests/minute per admin user
- 30 requests/hour per IP

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `app/api/admin/workforce/employees/route.js` (GET, POST) |
| NEW | `app/api/admin/workforce/employees/[id]/route.js` (PATCH, DELETE) |

---

## Verification Checklist

- [ ] **V2.1** — `POST` creates employee → returned `id` matches Firestore document
- [ ] **V2.2** — `GET` returns list of all employees with `[ENCRYPTED]` for credentials
- [ ] **V2.3** — `PATCH` updates fields and `updated_at` timestamp changes
- [ ] **V2.4** — `DELETE` soft-archives the employee (status = `ARCHIVED`)
- [ ] **V2.5** — Non-admin authenticated user gets `403 Forbidden` on all routes
- [ ] **V2.6** — Unauthenticated request gets `401`
- [ ] **V2.7** — Missing required fields return `400` with clear validation error
- [ ] **V2.8** — Invalid email format is rejected
- [ ] **V2.9** — Duplicate `personal_email` is rejected on `POST`
- [ ] **V2.10** — Rate limit triggers `429` after 10 rapid requests
- [ ] **V2.11** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 3: Admin Workforce Hub UI](./PHASE_3_ADMIN_UI.md)**
