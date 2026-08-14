# Phase 5: Email Dispatch Pipeline

**Parent PRD:** [PRD_WORKFORCE_MANAGEMENT.md](../PRD_WORKFORCE_MANAGEMENT.md)  
**Previous Phase:** [Phase 4 ← PDF Offer Letter Engine](./PHASE_4_PDF_ENGINE.md)  
**Next Phase:** [Phase 6 → Milestone Task System](./PHASE_6_MILESTONES.md)  
**Effort:** ~1.5 Days (1 Engineer)  
**Status:** ⬜ Not Started  
**Depends On:** Phase 4 (PDF generators must produce valid buffers)

---

## Objective

Wire up the complete offer dispatch flow: generate PDF → attach to Zoho email → send to candidate → log document in Firestore → update employee status. Extends the existing `zohoMailer.js` — does NOT rebuild it.

---

## Deliverables

### 5.1 Extend Zoho Mailer

Modify **`utils/server/zohoMailer.js`** — add a generic `sendMailWithAttachment()` function:
```javascript
export async function sendMailWithAttachment({ to, cc, replyTo, subject, html, text, attachments }) {
  // attachments = [{ filename: 'Offer.pdf', content: Buffer, contentType: 'application/pdf' }]
  await getTransporter().sendMail({ from, to, cc, replyTo, subject, html, text, attachments });
}
```

### 5.2 Offer Dispatch Email Template

Add to **`utils/server/retentionTemplates.js`** (or a new workforce template file):
- Uses existing `buildBaseEmailWrapper()` for dark/light HTML shell
- Subject: `[SkillBun] Internship Offer Letter & Terms of Engagement - {name} (Ref: {refId})`
- From: `SkillBun Careers <noreply@skillbun.tech>`
- CC: `harsh@skillbun.tech`
- Reply-To: `harsh@skillbun.tech`
- Body: Professional welcome message instructing candidate to review terms and reply with signed copy within 3 business days
- Attachment: In-memory PDF buffer from Phase 4

### 5.3 Offer Dispatch API Route

Create **`app/api/admin/workforce/offer/route.js`**:

```
POST /api/admin/workforce/offer
Body: { employeeId: string }
```

Flow:
1. Verify admin auth (Firebase token + `isAuthorizedAdminEmail()`)
2. Fetch employee record from Firestore
3. Validate employee exists and status allows offer dispatch
4. Generate 4-page PDF via `offerLetterGenerator.js`
5. Generate reference ID via `generateWorkforceId('SB-OFF')`
6. Send email via `sendMailWithAttachment()` with PDF attached
7. Log document in `/workforce_docs` collection with metadata snapshot
8. Update employee status to `OFFER_SENT`
9. Return `{ success: true, referenceId, message }`

**Fallback:** If SMTP fails → return PDF buffer as base64 for manual download + set status to `DISPATCH_FAILED`

### 5.4 Admin UI Integration

Update `/admin/workforce` page:
- Replace Phase 4's temporary download button with **"Generate & Dispatch Offer Pack"**
- Button shows loading spinner during dispatch
- Success → toast notification with reference ID
- SMTP failure → modal with "Download PDF Manually" button + pre-filled email draft

---

## Files Created / Modified

| Action | File |
|:---|:---|
| MODIFY | `utils/server/zohoMailer.js` (add `sendMailWithAttachment()`) |
| MODIFY | `utils/server/retentionTemplates.js` (add offer email template) |
| NEW | `app/api/admin/workforce/offer/route.js` |
| MODIFY | `app/admin/workforce/page.jsx` (wire dispatch button) |

---

## Verification Checklist

- [ ] **V5.1** — `sendMailWithAttachment()` sends email with PDF attachment successfully
- [ ] **V5.2** — Email arrives at candidate address with correct subject, CC, Reply-To
- [ ] **V5.3** — PDF attachment opens correctly from email client
- [ ] **V5.4** — Email HTML renders well in both light and dark email clients
- [ ] **V5.5** — `/workforce_docs` Firestore document created with correct metadata snapshot
- [ ] **V5.6** — Employee status updates to `OFFER_SENT` after successful dispatch
- [ ] **V5.7** — SMTP failure returns PDF buffer as fallback download
- [ ] **V5.8** — SMTP failure sets employee status to `DISPATCH_FAILED`
- [ ] **V5.9** — Non-admin cannot call the offer dispatch API (403)
- [ ] **V5.10** — Admin UI shows success toast with reference ID
- [ ] **V5.11** — `npm run build` passes with no new errors

---

**→ Once all checks pass, proceed to [Phase 6: Milestone Task System](./PHASE_6_MILESTONES.md)**
