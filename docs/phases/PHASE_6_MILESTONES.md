# Phase 6: Milestone Task System

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 5 ← Email Dispatch Pipeline](./PHASE_5_EMAIL_DISPATCH.md)  
**Next Phase:** [Phase 7 → Certificate Type Expansion](./PHASE_7_CERT_EXPANSION.md)  
**Effort:** ~1.5 Days (1 Engineer)  
**Status:** ✅ Completed  
**Depends On:** Phase 2 (employee records must exist), Phase 3 (admin UI shell)

---

## Objective

Build the milestone/task assignment system — API routes for CRUD + the admin-side milestone management UI within `/admin/workforce`. Intern-side milestone view comes in Phase 9.

---

## Deliverables

### 6.1 Milestone CRUD API Routes

#### `GET /api/admin/workforce/milestones?employeeId=xxx`
- Admin: returns all milestones (optionally filtered by employee)
- Intern: returns only their own milestones (matched by `employee_email`)

#### `POST /api/admin/workforce/milestones`
- Admin-only: creates milestone assigned to employee
- Auto-populates `employee_email` (denormalized from employee record)
- Validates: title (required), priority (enum), status (enum), due_date

#### `PATCH /api/admin/workforce/milestones/[id]`
- Admin: can update any field
- Intern: can only update `status`, `deliverable_url` (enforced server-side, matches Firestore rules)

#### `DELETE /api/admin/workforce/milestones/[id]`
- Admin-only

### 6.2 Validation Schema

```javascript
{
  employee_id:    { type: 'string', required: true },
  title:          { type: 'string', required: true, minLength: 3, maxLength: 200 },
  description:    { type: 'string', maxLength: 500 },
  priority:       { type: 'string', required: true, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
  status:         { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'] },
  due_date:       { type: 'string', required: true },
  deliverable_url:{ type: 'string', maxLength: 500 },
  review_notes:   { type: 'string', maxLength: 500 },
}
```

### 6.3 Admin UI — Milestone Panel

Add to `/admin/workforce` employee detail view:
- **"Milestones"** tab/section within employee detail
- List of assigned milestones with priority badges (🔴 Urgent, 🟠 High, 🔵 Medium, ⚪ Low)
- Status pills: `To Do` | `In Progress` | `Under Review` | `Completed`
- "Add Milestone" button → modal with title, description, priority, due date
- Clickable deliverable URLs open in new tab
- Overdue milestones highlighted with red border
- Admin can add review notes to any milestone

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `utils/server/workforceMilestones.js` (validation, serialization, intern field guards) |
| NEW | `app/api/admin/workforce/milestones/route.js` (GET, POST) |
| NEW | `app/api/admin/workforce/milestones/[id]/route.js` (PATCH, DELETE) |
| MODIFY | `app/admin/workforce/page.jsx` (add milestone panel to employee detail) |
| MODIFY | `app/admin/workforce/workforce.module.css` (milestone styles) |

---

## Verification Checklist

- [x] **V6.1** — `POST` creates milestone linked to correct employee
- [x] **V6.2** — `GET` with `?employeeId=` returns only that employee's milestones
- [x] **V6.3** — `PATCH` by admin updates any field
- [x] **V6.4** — `PATCH` by intern only allows `status` and `deliverable_url` changes (server rejects other fields)
- [x] **V6.5** — `DELETE` removes milestone (admin-only)
- [x] **V6.6** — Priority badges render correctly (color-coded)
- [x] **V6.7** — Status pills display and are accurate
- [x] **V6.8** — "Add Milestone" modal validates required fields
- [x] **V6.9** — Overdue milestones (past due_date, not completed) show red indicator
- [x] **V6.10** — Deliverable URLs are clickable and open in new tab
- [x] **V6.11** — Milestone panel works in both dark and light themes
- [x] **V6.12** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 7: Certificate Type Expansion](./PHASE_7_CERT_EXPANSION.md)**

