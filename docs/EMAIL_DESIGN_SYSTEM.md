# SkillBun Email Design System

**Module:** [`utils/server/emailTheme.js`](../utils/server/emailTheme.js)
**Introduced:** 2.10.14 · **Last revised:** 2.10.16
**Applies to:** 23 generated templates — 18 retention/lifecycle templates, 4 workforce letters and 1 password reset — plus the admin console's custom-HTML path.

These generated templates share this module. Full custom HTML can supply its own document; Firebase's provider-managed verification email is a separate path and is not covered by this renderer. Browser checks are not proof of rendering in every inbox; see [rendering QA](EMAIL_RENDERING_QA.md).

---

## 1. Why it was rebuilt

The previous templates were a green gradient hero over a rounded capsule card, carrying claims the product does not support — a ₹35,000 course value, a "Top 7%" ranking, hiring statistics, voucher codes. That is now gone. The rebuild had three goals:

1. **Honest copy.** No invented monetary values, rankings, scarcity or statistics. SkillBun is free; the emails say so and nothing more.
2. **A layout that matches the product.** SkillBun's mark is a circuit-trace sapling and its content is technical, so the emails read as technical documents — gutter rails, monospace metadata, segmented tracks — not as marketing flyers.
3. **Correct rendering everywhere,** including the two places HTML email actually breaks: Outlook for Windows, and dark mode.

---

## 2. The frame

`buildEmail()` renders four regions on **one flat surface**. The page and the sheet are the same colour.

```
┌──────────────────────────────────────────────┐
│  ▲ ꌗꀘꀤ꒒꒒ꌃꀎꈤ                      ONBOARDING │  1. Masthead
│  ├┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┤   │     logo · doc tag · scale rule
│                                              │
│  GETTING STARTED                             │  2. Title block
│  Welcome to SkillBun, Priya                  │     eyebrow / headline
│  Your account is open and every roadmap …    │     lede / meta chips
│                                              │
│  01 │ Pick a roadmap                         │  3. Content
│  02 │ Work through the topics                │     motifs, composed per template
│  03 │ Sit the exam at 60%                    │
│  ┌──────────────┐                            │
│  │ Open roadmaps│                            │
│  └──────────────┘                            │
│  ──○──────○──────○──                         │  4. Footer
│  ꌗꀘꀤ꒒꒒ꌃꀎꈤ              roadmaps  skillbun.tech │     circuit rule · lockup · legal
└──────────────────────────────────────────────┘
```

**Hard rules — these are also recorded in `AGENTS.md` and must not be reintroduced:**

- No floating card. The sheet must never look like a panel resting on a different-coloured page.
- No page-level background treatment — no grid, pattern, gradient or tint behind the content.
- No border and no shadow around the sheet.
- Ornament belongs *inside* the content, never underneath it.
- Every ornament is drawn with table cells or CSS gradients, **never** an image file. Images are blocked by default in most inboxes, and a hosted PNG cannot follow the reader's theme.

The single exception is the logo, which must be a raster (see §6).

### 2.1 Width

The sheet is not a fixed 600px column. It widens in steps with the viewport, because a 600px email marooned in the middle of a 2400px window wastes most of the screen — but it does not go fluid, because a line of body text stops being readable somewhere past ~90 characters.

| Viewport | Sheet | Side padding | Body size | Measure | ≈ chars |
|---|---|---|---|---|---|
| ≤ 620px | full bleed | 22px | 15.5px | viewport − 44 | — |
| 621–767px | 600px | 40px | 15.5px | 520px | 67 |
| 768–1099px | 680px | 46px | 15.5px | 588px | 76 |
| 1100–1499px | 740px | 56px | 16px | 628px | 79 |
| ≥ 1500px | 860px | 72px | 17px | 716px | 84 |

The padding widens faster than the sheet and the body size steps up with it, so the measure lands between 67 and 84 characters at every width above mobile rather than growing without bound.

**Outlook for Windows is excluded from all of this and that is deliberate.** The Word engine ignores `max-width` and media queries; it reads the `width="600"` attribute on the sheet table and renders a fixed 600px column. That attribute must survive every change — it is the fallback, not a leftover. Clients that strip `<style>` entirely land on the same 600px, via the inline `max-width:600px`.

Four class hooks drive the ladder: `sb-sheet` (the cap), `sb-pad` (every horizontal padding in the frame), `sb-body` (the content cell's font size) and `sb-lede` (the lede's own measure, which stays narrower than the sheet on purpose). `sb-display` steps the headline up alongside them.

---

## 3. Palette

Monochrome ink on white, one muted grey, hairline rules. The brand green appears only as a small active-state marker; red is reserved for genuine security signal.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `pageBg` / `card` | `#FFFFFF` | `#0D0D0D` | the one flat surface |
| `ink` / `text` | `#1A1A1A` | `#EDEDEA` | headlines, body, filled marks |
| `muted` | `#6E6D68` | `#A3A29C` | lede, labels, captions |
| `faint` | `#8C8B85` | `#8A8983` | doc tag, empty-state indices |
| `hairline` | `#E7E7E3` | `#2C2C29` | rules, row separators |
| `border` | `#DCDCD7` | `#333330` | tag outlines, empty segments |
| `surfaceRaised` | `#FAFAF8` | `#1D1D1B` | perfboard panels |
| `surfaceSunken` | `#F5F5F2` | `#212120` | neutral notes |
| `brand` | `#27B652` | `#3ED971` | active node marker only |
| `danger` / `dangerText` / `dangerSubtle` | `#B42318` / `#7A271A` / `#FEF3F2` | `#F87171` / `#FCA5A5` / `#2A1A1A` | security notices only |

`accent`, `green`, `darkGreen`, `deepGreen` and `lime` remain exported as back-compat aliases, but they all resolve to ink. The accent is a value, not a hue.

**Type:** Nunito (body), Fredoka (wordmark), JetBrains Mono (metadata) — loaded via a Google Fonts `<link>` with full native fallback stacks, so clients that strip web fonts still get a sane rendering.

---

## 4. Motif catalogue

Templates never write raw layout markup. They compose these. Structural variety between emails comes from motif choice, not from re-wording the same block.

| Function | Renders | Argument shape |
|---|---|---|
| `emailText(html)` | body paragraph | trusted markup |
| `emailPoints(items)` | bulleted lines | `string[]` (trusted markup) |
| `emailSectionLabel(text)` | small uppercase mono label | `string` |
| `emailDivider()` | hairline rule | — |
| `emailScaleRule({ ticks })` | drafting-scale tick rule (masthead) | `ticks = 31` |
| `emailCircuitRule({ pads })` | rule with solder pads (footer) | `pads = 3` |
| `emailFrame(innerHtml, { label })` | crop-mark frame around a block | trusted markup + label |
| `emailChipBlock({ eyebrow, title, meta, pins })` | IC-style titled block | `pins = 4` |
| `emailNodeRail(nodes, { flush })` | roadmap gutter with a continuous wire | `[{ title, body, state }]`, `state: 'done'\|'current'\|'todo'`; plain strings accepted |
| `emailStepRail(steps)` | numbered outlined circles, for procedures | `[{ title, body }]` or `string[]` |
| `emailSpecSheet(rows, { title, flush })` | datasheet label/value rows | `[[label, valueHtml], …]` |
| `emailStatBand(stats)` | 2–3 figures between hairlines | `[{ value, label }]` |
| `emailProgressTrack({ percent, label, caption, segments })` | segmented track, not a bar | `percent` 0–100, `segments = 16` |
| `emailWaffle({ total, filled, label, caption, cols })` | one square per topic, roadmap to scale | `cols = 12` |
| `emailCredentialStrip(items, { title })` | perfboard panel for IDs and links | `[[label, value, { mono?, href? }], …]` |
| `emailTags(items)` | monospace technology tags | `string[]` |
| `emailNote(html, tone)` | callout | `tone: 'neutral' \| 'danger'` |
| `emailButton({ href, label, align })` | solid ink CTA | `align = 'left'` |
| `emailLink({ href, label })` | secondary underlined link | — |
| `emailSignoff({ name, role })` | formal letter sign-off | — |

`emailNodeRail` carries the roadmap metaphor and belongs only in messages about a learning path; `emailStepRail` is for plain procedures where that metaphor would mislead. Pass `{ flush: true }` when nesting a motif inside `emailFrame`, so the frame's own padding sets the bottom gap instead of doubling up.

---

## 5. Email-client constraints

These are not stylistic choices. Each one is a defect worked around, with the support data behind it.

### 5.1 Outlook for Windows ignores `display`

Outlook 2007–2019 and Outlook Windows Mail render through Word, which supports **only** `display:none`. `display:inline-block` never applies, so an inline box loses its padding and its vertical margins — a button collapses to a text-height slab, and a row of tags closes up.

Nothing in this module is laid out with `display`. Anything that needs a box is a table cell:

- **`emailButton`** declares its padding twice. `mso-padding-alt:13px 26px` on the `<td>` is the Word-only property that restores what Word dropped; `mso-padding-alt:0` on the anchor stops Word applying it a second time. Every other client ignores both and uses the anchor's own padding, which keeps the whole button clickable.
- **`emailTags`** makes each tag its own single-cell table floated with `align="left"` — the float Word does honour — instead of an inline-block span.

Rounded corners still degrade to square in Outlook (`border-radius` is at ~83% support). The fixed-width VML roundrect would fix that but needs a hard pixel width, and these labels vary in length, so it is deliberately not used.

### 5.2 Only solid background colours are universal

| Property | Support | Failure mode |
|---|---|---|
| `background-color` | universal | — |
| `background-image` | ~91% | Gmail Desktop Webmail drops the **entire** style attribute when a valid image URL appears in `url()`; Yahoo/AOL/GMX/WEB.DE strip the comma between two values |
| `linear-gradient` | ~60% | Outlook Windows needs VML; Gmail Android will not take it inline in `background-image` |
| `border-radius` | ~83% | Outlook Windows falls back to square |
| inline `<svg>` | ~40% | stripped by Gmail, Outlook and Yahoo |

Gradients therefore always sit **on top of** a solid `background-color`, so a client that drops them still gets the flat surface underneath — and they are only ever used on a contained element, never on the page.

### 5.3 Techniques worth knowing

- **Continuous wire.** Adjacent cells' `border-left` values stack into one unbroken vertical line, which is how `emailNodeRail` draws its gutter without any positioning trick.
- **div-inside-td.** A `<td>` with a background fills its whole cell height regardless of `height`, so every thin line, tick and solder pad is a `<div>` inside a `vertical-align:middle` cell.
- **Percent-summed segments.** `emailProgressTrack` sizes segments *and* gaps in percent so they total exactly 100% and the final segment is never wider than the rest.

---

## 6. Theme sync

Emails follow the reader's device theme. That takes four mechanisms working together, because no single one covers every inbox:

1. `<meta name="color-scheme">` + `<meta name="supported-color-schemes">` — tells Apple Mail and iOS the design handles dark, so they skip auto-inversion.
2. `:root { color-scheme: light dark; supported-color-schemes: light dark; }` — the same signal for webmail.
3. `@media (prefers-color-scheme: dark)` — Apple Mail, iOS, Outlook for Mac.
4. `[data-ogsc]` and `[data-ogsb]` prefixed copies of **every** dark rule — Outlook.com and the Windows Outlook app rewrite inline colours and stamp those attributes instead of honouring the media query.

**Light stays inline.** It is what a client renders when it strips `<style>` entirely, so the fallback is always the readable one. Dark ships only through the style block.

Every element that changes between themes carries a class hook: `sb-page sb-sheet sb-text sb-muted sb-faint sb-display sb-hr sb-dot sb-tick sb-frame sb-step-num sb-wire sb-wire-on sb-node-live sb-tag sb-strip sb-term-head sb-note-neutral sb-note-danger sb-seg-on sb-seg-off sb-hairline-top sb-cell sb-cell-l sb-btn sb-btn-a sb-wordmark`. **If you add a motif with a colour, it needs a hook and a matching dark rule, or it will stay light-on-light in dark mode.**

**The logo must be a raster.** Inline SVG is stripped by Gmail, Outlook and Yahoo. We ship `/logo-tight.png` — the cropped 53×78 art — rather than `/logo.png`, whose glyph occupies only the middle of a 128×128 canvas and renders far too small at masthead size. Both are transparent PNGs, so no background is painted behind the mark in either theme.

---

## 7. Escaping and the subject contract

**The rule: callers escape dynamic data; the design system trusts its arguments.**

Every `text` / `label` / `html` argument to a motif is treated as trusted markup, so templates can pass `<strong>` and entities. Only `href` values are escaped defensively inside the module. `escapeHtml()` is applied once, at the entry point — `generateRetentionEmailHtml()` escapes `name`, `email`, `roadmapTitle` and `degree` before any template sees them.

Two consequences that were live bugs before 2.10.14:

- **Subjects are plain text, not HTML.** Templates compose the subject from the same pre-escaped values they use in the body, so a student on the "AI & Machine Learning" track received `Your AI &amp; Machine Learning roadmap is waiting`. `generateRetentionEmailHtml()` now runs `decodeHtmlEntities()` — the exact inverse of `escapeHtml`, decoding `&amp;` last so an escaped entity in the source unwinds one level only — and returns a plain-text subject. **Never pass an escaped value straight into a mail header.**
- **The preheader must not re-escape the lede.** `lede` is trusted markup that already carries its own entities; escaping it again showed readers `&amp;amp;`. `buildEmail()` now strips tags from `lede` instead, and only escapes `title`, which is plain text.

Workforce letters build their subjects and plaintext bodies from raw values and were never affected.

---

## 8. Message inventory

### 8.1 Retention and lifecycle — [`utils/server/retentionTemplates.js`](../utils/server/retentionTemplates.js)

18 templates in 6 categories, three variants each. Marketing templates carry the unsubscribe line; transactional ones do not.

| Category | Templates | Doc tag | Marketing |
|---|---|---|---|
| 1. Onboarding | `welcome_v1/v2/v3` | Onboarding | yes |
| 2. Re-engagement | `reengagement_v1/v2/v3` | Progress | yes |
| 3. Exam Ready | `exam_nudge_v1/v2/v3` | Certification | yes |
| 4. Exam Retake | `exam_failed_v1/v2/v3` | Retake | yes |
| 5. Alumni Cert | `cert_congrats_v1/v2/v3` | Credential | yes |
| 6. Transactional | `transactional_alert_v1/v2/v3` | Security / Account / Notice | **no** |

Personalisation fields: `name`, `email`, `roadmapTitle`, `progressCount`, `degree`. Each falls back to a safe default (`Student`, `Full Stack Web Development`, `B.Tech - Computer Science`) when absent, so a partial user record never renders an empty slot. Progress is derived against a 24-node track and clamped to 4–96% so the motif never shows a dishonest 0% or 100%.

`roadmapTitle` is additionally **normalised**, because callers reach it with three different shapes and two of them read badly in a sentence:

| Caller supplies | Rendered as |
|---|---|
| `Full Stack Web Development` | unchanged |
| `full_stack_web_development` (slug) | `Full Stack Web Development` |
| `FULL STACK WEB DEVELOPMENT` (analytics console upper-cases what it reads from progress) | `Full Stack Web Development` |
| `UI/UX Design`, `AI & Machine Learning` | unchanged — mixed case is left alone |
| `Not sure yet – help me explore!`, `N/A`, empty | falls back to `Full Stack Web Development` |

That last row was a live defect: the analytics console falls back to the student's onboarding **interest** when they have no roadmap progress, and "Not sure yet – help me explore!" is one of the options the onboarding form offers — so a real send went out reading *"Congratulations, Harsh Patel — you're Not sure yet – help me explore! certified"*. Acronyms (`AI`, `ML`, `UI`, `UX`, `iOS`, `DevOps`, `MLOps`, `SRE`, `NLP`, …) are preserved when a shouted title is repaired.

### 8.2 Workforce letters — [`utils/server/workforceEmailTemplates.js`](../utils/server/workforceEmailTemplates.js)

| Builder | Subject |
|---|---|
| `buildOfferDispatchEmail` | `[SkillBun] Formal Offer of Engagement & Internship Terms - {name} (Ref: {refId})` |
| `buildExtensionDispatchEmail` | `[SkillBun] Extension of Internship Tenure - {name} (Ref: {refId})` |
| `buildTerminationDispatchEmail` | completion acknowledgement or conclusion notice, depending on `isPositive` |
| `buildActivationWelcomeEmail` | `[SkillBun] Welcome to the Team! Onboarding Complete & Workspace Access - {name}` |

Each returns `{ subject, html, text, cc, replyTo }` (offer and activation also return `from`). Employee fields are snake_case as stored in Firestore: `full_name`, `course_degree`, `joining_date`, `contract_end_date`, `stipend_amount`, `personal_email`, `work_email`.

### 8.3 Password reset — [`utils/server/zohoMailer.js`](../utils/server/zohoMailer.js)

`sendSkillBunPasswordResetEmail({ email, resetLink })`, doc tag `Password reset`, non-marketing.

---

## 9. Addressing contract

**SkillBun operates exactly two mailboxes.** This is binding — see `AGENTS.md`.

| Address | Role |
|---|---|
| `noreply@skillbun.tech` | outgoing only. **Never receives mail.** From headers: `SkillBun <noreply@skillbun.tech>`, `SkillBun Hiring Team <noreply@skillbun.tech>` |
| `harsh@skillbun.tech` | founder. **All** CC, Reply-To and inbound correspondence |

Do not invent or hardcode any other alias — `careers@`, `hiring@`, `support@`, `hello@`, `admin@` and `contact@skillbun.tech` do not exist. Any signed document must instruct the recipient to *reply to `harsh@skillbun.tech` with the signed copy within 3 business days*.

Transport is Zoho SMTP via `nodemailer` (`smtppro.zoho.in`, port 465, secure), configured through the environment getters in `utils/server/env.js`.

---

## 10. Adding or changing a template

1. Add the entry to `RETENTION_TEMPLATES` with `id`, `category`, `name`, `subject`, `description` and `isMarketing`.
2. Add its branch to `renderTemplateContent()`, returning `{ subject, eyebrow, headline, lede, docTag, chips, contentHtml, isMarketing }`.
3. Compose `contentHtml` from §4 motifs. Pick a motif that means something — do not reuse `emailNodeRail` for a message that is not about a learning path.
4. Assume every dynamic value is **already escaped**. Do not escape again.
5. If you introduce a new coloured element, give it a class hook and add the matching rule to `darkRules()`.
6. Keep the copy honest. No monetary values, rankings, statistics, scarcity or decorative emoji.

### Verification

Render every variant, in both themes, before shipping:

```bash
npx eslint utils/server/emailTheme.js utils/server/retentionTemplates.js utils/server/retentionEmails.js utils/server/workforceEmailTemplates.js utils/server/zohoMailer.js
```

Then render all 18 retention templates plus the 4 workforce letters and the password reset to a single HTML file and open it — checking, at minimum:

- personalised fields actually appear in the visible text (strip tags and decode entities before asserting; `17` will otherwise match `line-height:1.72`);
- subjects contain no `&amp;`, `&#39;` or other entities;
- missing-data fallbacks render;
- dark mode repaints (emulate `prefers-color-scheme: dark` and **reload** — the media query does not re-evaluate without one);
- the width ladder holds (§2.1): render each template into an iframe at 375 / 600 / 700 / 900 / 1280 / 1700 / 2360px and assert `documentElement.scrollWidth` never exceeds the frame — a media query inside an iframe evaluates against the iframe's width, which is what makes this measurable;
- `width="600"` is still on the sheet table;
- tags wrap across rows with their spacing intact and the CTA stays clear of them.

---

## Related

- [Phase 5 — Email Dispatch Pipeline](phases/PHASE_5_EMAIL_DISPATCH.md)
- [Workforce Management PRD](PRD_WORKFORCE_MANAGEMENT.md)
- [Architecture & workflow](ARCHITECTURE_WORKFLOW.md)
