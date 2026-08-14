# Phase 9: Intern Workspace Portal

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 8 ← Certificate Multi-Template Renderer](./PHASE_8_CERT_RENDERER.md)  
**Effort:** ~2 Days (1 Engineer)  
**Status:** ⬜ Not Started  
**Depends On:** Phase 1 (encryption), Phase 2 (employee data), Phase 6 (milestones), Phase 7 (certificates)

---

## Objective

Build the `/portal` page — the intern-facing workspace where they view assigned Zoho credentials, track milestone progress, submit deliverable URLs, and download their issued credentials. Also wire up dual-role navigation for users who are both students and interns.

---

## Deliverables

### 9.1 Portal Page & Auth Gate

Create **`app/portal/page.jsx`**:
- Protected by Firebase Auth
- On load, query Firestore for employee record matching `user.email`:
  ```javascript
  const employeeSnap = await db.collection('employees')
    .where('personal_email', '==', user.email.toLowerCase())
    .where('status', 'in', ['OFFER_SENT', 'ACTIVE', 'EXTENDED', 'COMPLETED'])
    .limit(1)
    .get();
  ```
- If no matching record found → redirect to `/dashboard` with toast: "No active workspace found for your account."
- If found → render portal workspace

### 9.2 Credential Decryption API

Create **`app/api/portal/credentials/route.js`**:
- `GET` — returns decrypted credentials for the authenticated user
- Verifies Firebase Auth token
- Matches `uid` or `email` against employee record
- Calls `decryptCredentials()` from Phase 1
- Returns `{ work_email, password, access_notes }` only to the record owner
- Rate limited: 5 requests/minute per user

### 9.3 Portal UI Sections

#### Section A: Workspace Credentials Card
- Header: "Your Workspace Credentials"
- Shows work email (visible) and password (masked: `••••••••••`)
- **Click-to-reveal** toggle on password — calls `/api/portal/credentials` on first reveal
- **1-click copy** buttons for both email and password
- Access notes shown below if present
- Auto-re-mask password after 30 seconds
- Warning: "Do not share these credentials with anyone."

#### Section B: Milestone Sprint Board
- Fetches from `GET /api/admin/workforce/milestones?employeeId=xxx`
- Grouped by status: `To Do` → `In Progress` → `Under Review` → `Completed`
- Each milestone card shows: title, description, priority badge, due date
- Intern can:
  - Change status (dropdown: TODO → IN_PROGRESS → UNDER_REVIEW)
  - Paste deliverable URL (GitHub/Figma/Notion input field)
  - Submit updates via `PATCH /api/admin/workforce/milestones/[id]`
- Overdue items highlighted
- Admin review notes shown as read-only feedback

#### Section C: Official Documents Hub
- Lists all certificates issued to this employee (from `/certificates` where `employee_id` matches)
- Each row: cert type badge, title, issue date, verification link
- "View Certificate" → opens `/certificate/[id]` in new tab
- "Download / Print" → navigates to cert page and triggers `window.print()`
- Shows offer letter reference ID and date (from `/workforce_docs`)

### 9.4 Dual-Role Navigation

Modify **`app/components/UserMenu.jsx`** (or equivalent nav component):
- After auth, check if user has an active employee record
- If yes → show "Intern Workspace" link to `/portal` alongside existing "Dashboard" link
- Active interns default landing (after login) → `/portal`
- Both navigation items always accessible regardless of current page

### 9.5 Portal Styling

Create **`app/portal/portal.module.css`**:
- SkillBun theme system (CSS variables, dark/light)
- Light mode: preserve patterned background
- Responsive: cards stack on mobile
- Credential card has subtle security-themed styling (lock icon, bordered container)

---

## Files Created / Modified

| Action | File |
|:---|:---|
| NEW | `app/portal/page.jsx` |
| NEW | `app/portal/portal.module.css` |
| NEW | `app/api/portal/credentials/route.js` |
| MODIFY | `app/components/UserMenu.jsx` (or equivalent — add dual-role nav) |

---

## Verification Checklist

- [ ] **V9.1** — `/portal` loads for authenticated user with active employee record
- [ ] **V9.2** — `/portal` redirects to `/dashboard` for non-intern users
- [ ] **V9.3** — Credential card shows masked password by default
- [ ] **V9.4** — Click-to-reveal decrypts and shows password
- [ ] **V9.5** — Password auto-re-masks after 30 seconds
- [ ] **V9.6** — Copy buttons copy correct values to clipboard
- [ ] **V9.7** — Credential API rejects requests from non-owner users (403)
- [ ] **V9.8** — Milestone board shows intern's assigned tasks grouped by status
- [ ] **V9.9** — Intern can change milestone status and submit deliverable URL
- [ ] **V9.10** — Intern cannot change milestone title, priority, or due_date (server rejects)
- [ ] **V9.11** — Admin review notes display as read-only
- [ ] **V9.12** — Documents hub lists all issued certificates with correct links
- [ ] **V9.13** — "View Certificate" opens correct `/certificate/[id]` page
- [ ] **V9.14** — Dual-role nav: student+intern sees both "Dashboard" and "Intern Workspace"
- [ ] **V9.15** — Portal renders correctly in **dark** theme
- [ ] **V9.16** — Portal renders correctly in **light** theme (patterned background preserved)
- [ ] **V9.17** — Portal is responsive on mobile (≤768px)
- [ ] **V9.18** — `npm run build` passes with no new errors

---

## 🏁 Project Complete

Once Phase 9 verification passes, the full Workforce Hub MVP is complete:

| Phase | Delivers |
|:---|:---|
| [Phase 1](./PHASE_1_DATA_MODEL.md) | Firestore schema + encryption |
| [Phase 2](./PHASE_2_EMPLOYEE_CRUD_API.md) | Employee CRUD API |
| [Phase 3](./PHASE_3_ADMIN_UI.md) | Admin workforce dashboard |
| [Phase 4](./PHASE_4_PDF_ENGINE.md) | PDF offer/extension letter generator |
| [Phase 5](./PHASE_5_EMAIL_DISPATCH.md) | Email dispatch pipeline |
| [Phase 6](./PHASE_6_MILESTONES.md) | Milestone task system |
| [Phase 7](./PHASE_7_CERT_EXPANSION.md) | Certificate type expansion + admin issuance |
| [Phase 8](./PHASE_8_CERT_RENDERER.md) | Multi-template certificate renderer |
| [Phase 9](./PHASE_9_INTERN_PORTAL.md) | Intern workspace portal + dual-role nav |

**→ Ready for production deployment and user acceptance testing.**
