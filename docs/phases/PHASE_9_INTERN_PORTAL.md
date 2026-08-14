# Phase 9: Intern Workspace Portal

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 8 ← Certificate Multi-Template Renderer](./PHASE_8_CERT_RENDERER.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ✅ Completed  
**Depends On:** Phase 1 (encryption), Phase 2 (employee data), Phase 6 (milestones), Phase 7 (certificates)

---

## Objective

Build the `/portal` page — the intern-facing workspace where they view assigned Zoho credentials, track milestone progress, submit deliverable URLs, and download their issued credentials. Also wire up dual-role navigation for users who are both students and interns.

---

## Deliverables

### 9.1 Portal Page & Auth Gate

Create **`app/portal/page.jsx`**:
- Protected by Firebase Auth
- On load, queries `/api/portal/credentials` for employee record matching the authenticated user.
- If no matching record found → shows friendly access notice with direct navigation to student `/dashboard`.
- If found → renders dedicated Intern Workspace.

### 9.2 Credential Decryption API

Create **`app/api/portal/credentials/route.js`**:
- `GET` — returns decrypted credentials for the authenticated user
- Verifies Firebase Auth token
- Matches `email` against active employee records (`status in ['OFFER_SENT', 'ACTIVE', 'EXTENDED', 'COMPLETED']`)
- Calls `decryptCredentials()` from Phase 1
- Returns `{ work_email, password, access_notes }` only to the verified record owner
- Rate limited: 10 requests/minute per user

### 9.3 Portal UI Sections

#### Section A: Workspace Credentials Card
- Header: "Your Workspace Credentials"
- Shows work email (visible) and password (masked: `••••••••••••••••`)
- **Click-to-reveal** toggle on password — calls `/api/portal/credentials` on first reveal
- **1-click copy** buttons for both email and password
- Access notes shown below if present
- Auto-re-mask password after 30 seconds with live visual countdown timer
- Warning: "Do not share these credentials with anyone."

#### Section B: Milestone Sprint Board
- Fetches from `GET /api/admin/workforce/milestones?employeeId=xxx`
- Filter tabs: `All Tasks` → `To Do` → `In Progress` → `Under Review` → `Completed`
- Each milestone card shows: title, description, priority badge, due date
- Intern can:
  - Change status (dropdown: `TODO` → `IN_PROGRESS` → `UNDER_REVIEW`)
  - Paste deliverable URL (GitHub/Figma/Notion input field)
  - Submit updates via `PATCH /api/admin/workforce/milestones/[id]`
- Overdue items highlighted in red
- Admin review notes shown as read-only feedback

#### Section C: Official Documents Hub
- Lists all certificates issued to this employee (from `/certificates` where `employee_id` matches)
- Each card: cert type badge, stream title, issue date, verification link
- "View & Share Credential ↗" → opens `/certificate/[id]` in new tab

### 9.4 Dual-Role Navigation

Modify **`app/components/UserMenu.jsx`**:
- Authenticated user menu includes "Intern Workspace" link to `/portal` alongside the student "Dashboard" link.
- Both navigation items always accessible regardless of current page.

### 9.5 Portal Styling

Create **`app/portal/portal.module.css`**:
- SkillBun theme system (CSS variables, dark/light)
- Light mode: preserves patterned background
- Responsive: cards stack on mobile (≤768px)
- Credential card has security-themed styling (lock icon, bordered container)

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `app/portal/page.jsx` |
| NEW | `app/portal/portal.module.css` |
| NEW | `app/api/portal/credentials/route.js` |
| MODIFY | `app/components/UserMenu.jsx` (add dual-role nav) |

---

## Verification Checklist

- [x] **V9.1** — `/portal` loads for authenticated user with active employee record
- [x] **V9.2** — `/portal` redirects to `/dashboard` for non-intern users
- [x] **V9.3** — Credential card shows masked password by default
- [x] **V9.4** — Click-to-reveal decrypts and shows password
- [x] **V9.5** — Password auto-re-masks after 30 seconds
- [x] **V9.6** — Copy buttons copy correct values to clipboard
- [x] **V9.7** — Credential API rejects requests from non-owner users (401/404)
- [x] **V9.8** — Milestone board shows intern's assigned tasks grouped by status
- [x] **V9.9** — Intern can change milestone status and submit deliverable URL
- [x] **V9.10** — Intern cannot change milestone title, priority, or due_date (server rejects)
- [x] **V9.11** — Admin review notes display as read-only
- [x] **V9.12** — Documents hub lists all issued certificates with correct links
- [x] **V9.13** — "View Certificate" opens correct `/certificate/[id]` page
- [x] **V9.14** — Dual-role nav: student+intern sees both "Dashboard" and "Intern Workspace"
- [x] **V9.15** — Portal renders correctly in **dark** theme
- [x] **V9.16** — Portal renders correctly in **light** theme (patterned background preserved)
- [x] **V9.17** — Portal is responsive on mobile (≤768px)
- [x] **V9.18** — `npm run build` passes with no new errors

---

## 🏁 Project Complete

The full Workforce Hub & Credentials Engine MVP is complete:

| Phase | Delivers | Status |
|:---|:---|:---:|
| [Phase 1](./PHASE_1_DATA_MODEL.md) | Firestore schema + AES-256-GCM encryption | ✅ Complete |
| [Phase 2](./PHASE_2_EMPLOYEE_CRUD_API.md) | Employee CRUD API | ✅ Complete |
| [Phase 3](./PHASE_3_ADMIN_UI.md) | Admin workforce dashboard | ✅ Complete |
| [Phase 4](./PHASE_4_PDF_ENGINE.md) | PDF offer/extension letter generator | ✅ Complete |
| [Phase 5](./PHASE_5_EMAIL_DISPATCH.md) | Email dispatch pipeline | ✅ Complete |
| [Phase 6](./PHASE_6_MILESTONES.md) | Milestone task system | ✅ Complete |
| [Phase 7](./PHASE_7_CERT_EXPANSION.md) | Certificate type expansion + admin issuance | ✅ Complete |
| [Phase 8](./PHASE_8_CERT_RENDERER.md) | Multi-template certificate renderer | ✅ Complete |
| [Phase 9](./PHASE_9_INTERN_PORTAL.md) | Intern workspace portal + dual-role nav | ✅ Complete |

**→ Ready for production deployment and user acceptance testing.**

