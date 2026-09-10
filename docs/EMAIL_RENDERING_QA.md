# Email rendering repairs and verification

Historical verification recorded on 2026-09-10 in the development repository. This report documents those checks, not the current production deployment status.

## Repairs

- Added inline font fallbacks so generated email text remains readable when stylesheets are stripped.
- Made the narrow layout the inline fallback and kept the wordmark on one line; wider clients retain the responsive layout.
- Increased faint text contrast in light and dark themes.
- Corrected double-escaped account fields, zero/unknown progress, roadmap totals, specific roadmap/exam links and retry wording.
- Made admin preview theme controls affect the email itself; added styles-stripped and images-blocked diagnostics.
- Preserved meaningful plain text and Reply-To in dispatch. The generic email catalog now restricts demo workforce letters to founder tests; official letters remain in the Workforce console.
- Removed the misleading one-click unsubscribe POST header. The current settings link is not an RFC 8058 endpoint; implementing a signed endpoint is a separate follow-up.
- Added message IDs to send history and reusable synthetic preview/test tools. Generated exports and dispatch receipts stay ignored.

## Completed checks

- Production build passed, including all 158 static pages.
- Focused lint passed and all 9 email regression tests passed.
- Browser preview: 23 templates × 5 modes × 3 widths (320, 375, 600 pixels) = 345 renders, with no horizontal overflow reported. Modes: light, dark, styles stripped, images blocked and long content.
- Coverage includes generated retention, workforce and password-reset HTML, escaping, plain text, contrast, progress validation, links and authenticated admin dispatch behavior.

## Inbox test status

The user requested stopping additional inbox testing rather than signing into each client. The batch was stopped: SMTP confirmed acceptance of six Gmail samples and one Zoho sample. A second Zoho sample was in flight when the process was interrupted; its result is unknown and it must not be automatically resent. No Outlook send was attempted. SMTP acceptance does not establish inbox delivery or visual correctness.

No received message was visually verified. Gmail/Zoho/Outlook client rendering, classic Outlook, Apple Mail, client-forced dark mode and Firebase's provider-managed verification email remain unverified. These are limits of the evidence, not confirmed failures.

## Reuse and configuration

Run `node scripts/preview-emails.mjs` for the synthetic gallery at http://127.0.0.1:3088. It also exports HTML and EML files under ignored `output/email-preview/`. `--export-only` avoids starting a server. Use `node --test tests/unit/emailRendering.test.mjs` for the focused checks.

No new dependency or environment variable is required. The optional inbox dispatch script uses existing Zoho SMTP configuration and requires explicitly authorized recipient arguments. Do not rerun it without a new request to resume sends. Its checkpoint avoids automatically repeating submitted or uncertain attempts.

Recommendation: ship the targeted repairs through the normal deployment process. Use the local gallery for routine template changes. Resume a small real-client spot check only when inbox access is convenient; universal client compatibility is not established by the browser gallery.

## Rulebook pass

Scope stayed within email rendering, preview, dispatch and verification. SkillBun branding, splash, homepage hero/floaters and footer structure are preserved. Light/dark support remains. Authentication, roadmap runtime, environment names and abuse-prevention guards are preserved; email dispatch changes are intentional and described above. Local app preview: http://127.0.0.1:3000.
