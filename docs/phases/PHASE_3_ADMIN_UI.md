# Phase 3: Admin Workforce Hub UI

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 2 ← Employee CRUD API](./PHASE_2_EMPLOYEE_CRUD_API.md)  
**Next Phase:** [Phase 4 → PDF Offer Letter Engine](./PHASE_4_PDF_ENGINE.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ✅ Completed (Firebase-backed interaction validation pending)  
**Depends On:** Phase 2 (✅ Complete — Employee CRUD API routes are implemented and verified)

---

## Objective

Build the `/admin/workforce` page — the central dashboard where Harsh manages all employees. Candidate table, status tabs, quick-add modal, tenure countdown badges, and status transitions. No PDF generation or email dispatch yet — those come in Phase 4 & 5.

---

## Deliverables

### 3.1 Page Route & Auth Guard

- Create `app/admin/workforce/page.jsx` (client component)
- Protect with Firebase Auth + `isAuthorizedAdminEmail()` check
- Redirect non-admins to `/dashboard` with toast notification
- Must follow SkillBun theme system (dark/light via `data-theme`, CSS variables)

### 3.2 Employee Table

- Fetches from `GET /api/admin/workforce/employees`
- Columns: Name, Email, Department, Designation, Status, Tenure Remaining, Actions
- **Status tabs** at top: `All` | `Offer Sent` | `Active` | `Expiring Soon` | `Completed` | `Terminated`
- `Expiring Soon` tab = contracts ending within ≤ 10 days (amber badge)
- Sortable by name, joining date, contract end date
- Search/filter by name or email

### 3.3 Quick-Add Candidate Modal

- Opens via "Add Candidate" button
- Full form with all fields from Phase 2 validation schema
- Salutation dropdown (Mr. / Ms.)
- Employment type dropdown (INTERN / FULL_TIME / CONTRACTOR)
- Date pickers for joining_date and contract_end_date
- Optional: Zoho credentials section (work_email, password, access_notes) — encrypted on save
- Submits to `POST /api/admin/workforce/employees`
- Success → closes modal, refreshes table, shows toast

### 3.4 Employee Detail / Edit

- Click table row → opens detail view or edit modal
- Edit existing fields → `PATCH /api/admin/workforce/employees/[id]`
- Status change buttons: "Mark Active", "Mark Extended", "Mark Completed", "Mark Terminated"
- Terminated → confirmation dialog before proceeding

### 3.5 Tenure Countdown

- For each `ACTIVE` / `EXTENDED` employee, calculate days remaining
- Display as:
  - 🟢 Green badge: >30 days remaining
  - 🟡 Amber badge: ≤30 days remaining
  - 🔴 Red badge: ≤10 days remaining or expired
- Global alert banner at top if any contracts expire within 7 days

### 3.6 Styling

- Create `app/admin/workforce/workforce.module.css`
- Use SkillBun CSS variables (`var(--bg)`, `var(--card-bg)`, `var(--text)`, etc.)
- Responsive: table → card-based layout on mobile
- Both dark and light themes

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `app/admin/workforce/page.jsx` |
| NEW | `app/admin/workforce/workforce.module.css` |

---

## Verification Checklist

- [x] **V3.1** — Client access guard requests a Firebase ID token; unauthorized API responses show a notice before redirecting to `/dashboard`.
- [x] **V3.2** — Employee table loads from `GET /api/admin/workforce/employees`.
- [x] **V3.3** — Status tabs, loaded-record count badges, search, and expiring-soon filtering are implemented.
- [x] **V3.4** — "Add Candidate" modal validates through the Phase 2 API and creates employee records.
- [x] **V3.5** — Edit modal updates employee fields through `PATCH /api/admin/workforce/employees/[id]`.
- [x] **V3.6** — Allowed status action buttons target the Phase 2 transition guards.
- [x] **V3.7** — "Mark Terminated" requires confirmation before the PATCH request.
- [x] **V3.8** — Tenure badges use green (>30 days), amber (<=30 days), and red (<=10 days / overdue) states.
- [x] **V3.9** — Global alert banner is shown when an active or extended contract ends within 7 days.
- [x] **V3.10** — Dark-theme tokens are used throughout the Workforce Hub styles.
- [x] **V3.11** — Light-theme tokens and the shared patterned background remain available.
- [x] **V3.12** — Responsive table-to-card layout is provided at <=768px.
- [x] **V3.13** — `npm run build` passes with no new errors.

### Validation Note

The page route, lint, production build, and localhost render are verified. End-to-end creation, editing, and authorization checks still require a Firebase-backed environment with an authenticated administrator and representative employee records.

---

**→ Once all checks pass, proceed to [Phase 4: PDF Offer Letter Engine](./PHASE_4_PDF_ENGINE.md)**
