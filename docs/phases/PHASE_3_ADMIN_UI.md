# Phase 3: Admin Workforce Hub UI

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 2 ← Employee CRUD API](./PHASE_2_EMPLOYEE_CRUD_API.md)  
**Next Phase:** [Phase 4 → PDF Offer Letter Engine](./PHASE_4_PDF_ENGINE.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ⬜ Not Started  
**Depends On:** Phase 2 (CRUD API routes must be functional)

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

- [ ] **V3.1** — `/admin/workforce` loads for admin user, redirects non-admin
- [ ] **V3.2** — Employee table displays all employees from API
- [ ] **V3.3** — Status tabs filter correctly (count badges on each tab)
- [ ] **V3.4** — "Add Candidate" modal opens, validates, and creates employee
- [ ] **V3.5** — Edit modal updates employee fields via PATCH
- [ ] **V3.6** — Status change buttons work (OFFER_SENT → ACTIVE, etc.)
- [ ] **V3.7** — "Mark Terminated" shows confirmation dialog first
- [ ] **V3.8** — Tenure badges show correct color (green/amber/red)
- [ ] **V3.9** — Global alert banner appears when a contract expires within 7 days
- [ ] **V3.10** — Page renders correctly in **dark** theme
- [ ] **V3.11** — Page renders correctly in **light** theme (with patterned background)
- [ ] **V3.12** — Table degrades to card layout on mobile (≤768px)
- [ ] **V3.13** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 4: PDF Offer Letter Engine](./PHASE_4_PDF_ENGINE.md)**
