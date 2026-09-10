# Email recommendations and saved AI variations

The CRM recommends a relevant lifecycle category from recorded student activity. It never rotates across unrelated categories simply to find an unused template.

## Recommendation rules

- Suppress marketing for unsubscribed students, missing email addresses, and students sent a marketing email within 72 hours.
- Acknowledge a real roadmap certificate issued within the last 14 days, once per recorded certificate event. Older history without event IDs is conservatively matched by category and roadmap.
- Recommend exam review only for a confirmed completed unsuccessful exam within seven days. An exam start or attempt counter is not proof of failure.
- Recommend certification preparation at verified 60% roadmap completion; the actual exam page still enforces attempts and cooldowns. Passed exams and issued certificates suppress that roadmap's exam invitation.
- Welcome new accounts with no completed topics during their first seven days.
- Recommend continuing learning after at least three days without recorded login, progress or exam activity.
- Otherwise show “No email due” and explain why.

Dates that are missing are not fabricated. Progress totals come from the public roadmap catalog, matching the target roadmap. Recommendations and recipients are revalidated on the server before CRM sends.

## Growing the variation library

“Prepare recommended mail” uses an unsent built-in variation from the selected category first, then an unsent saved AI variation. When those are exhausted, it generates and saves one new variation before opening the preview. Nothing generates on each dashboard render and there is no background send campaign.

The Email Studio and each eligible student's expanded CRM row have a Saved AI email library. It provides category selection, name-prefix search, pagination, preview and explicit creation of another variation. The CRM can select saved variations for the matching student category.

Each variation stores reusable plain-text content with `{{name}}` and `{{roadmapTitle}}` placeholders. Personalization occurs locally in the server renderer; student names, addresses, answers and activity records are not sent to the model. The shared email theme supplies branding, layout, dark/light CSS, unsubscribe footer and controlled SkillBun links.

Generated variations remain drafts for admin review. They do not send automatically. Exact duplicate generations use the existing record instead of creating another copy. Sent history records the variation ID, lifecycle category, roadmap, event, message ID and test flag. History appends use a transaction to avoid overwriting another append.

## Storage and provider configuration

- Immutable variations: `emailTemplateLibrary/{category}/variations/{contentHash}`.
- Temporary generation leases: `emailDraftLocks/{category}`. A 60-second lease prevents overlapping generations for one category; ownership is checked before release.
- All library access uses authenticated admin API routes and the Firebase Admin SDK. No public/client access rules are added. Existing default-deny rules protect these collections.
- Existing `GROQ_API_KEY` is used first with the existing `llama-3.3-70b-versatile` model; existing `OPENROUTER_API_KEY` / `openrouter/free` is the fallback. No new dependency or key is required when either is configured. `GEMINI_API_KEY` is not used.
- Generation shares those providers' existing quota. Limits are three generations per admin per minute and twenty across admins per hour, with a twelve-second timeout per provider. Provider errors leave the existing library intact.
- Firebase Admin credentials and database write access must be configured on the deployment. Collections are created on first successful generation; the queries use automatic single-field indexes unless these have been disabled in the project.

JSON syntax from the provider is additionally checked for field lengths, allowed placeholders, plain text and prohibited claims before persistence. The model cannot provide HTML, recipient addresses or link destinations. Draft review remains necessary for semantic quality. Provider references: [Groq JSON output documentation](https://console.groq.com/docs/structured-outputs), [OpenRouter API documentation](https://openrouter.ai/docs/api/reference/overview).

## Verification and scope

Focused recommendation and rendering tests cover lifecycle eligibility, 60% thresholds, unknown outcomes, recent activity, cooldowns, unsubscribes, category exhaustion, reusable rendering, duplicate identity, provider request validation, saved-template reuse and unauthorized access. Provider tests use synthetic responses and send no emails.

Verification completed: 18 focused tests and focused lint passed; production build compiled successfully and generated all 160 pages. Local production preview at `http://127.0.0.1:3000/dashboard/console/admin/emails` returned HTTP 200; unauthenticated library access returned HTTP 401. Both existing provider keys are configured locally. A live provider request, Firestore draft write/read round trip, authenticated browser workflow and inbox delivery were not exercised. No test email was sent for this feature.

Changes concern email recommendations, library storage, preview and sending. Branding, homepage splash, hero/floaters, footer and light/dark support are preserved. Authentication checks, certification rules, quiz/counsellor runtime and environment names are preserved. Existing manual Email Studio and Workforce routes remain separate from CRM lifecycle recommendations.
