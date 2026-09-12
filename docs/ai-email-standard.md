# AI email content and graphics standard

All newly generated AI library emails use this standard automatically. The model writes reusable plain text; `renderSavedEmail` builds the branded graphics and approved links through the shared email theme. Admins can preview a draft before sending it from the Student CRM.

## Required content

New drafts have a specific subject and headline, a concise introduction, one or two useful paragraphs, one primary action, a focus block (`title`, `detail`), and exactly three distinct steps (`title`, `body`). Each step starts with a practical action and describes something the reader can choose, explain, compare, write, or build. The focus identifies the task; the steps make it actionable. Generic encouragement and vague button labels do not satisfy the generation quality gate.

The maximum lengths are: name 80, subject 80, headline 90, introduction 240, button label 40, each paragraph 260, focus title 70/detail 160, and step title 60 characters. Step bodies must contain 30–180 characters. Every field is validated as non-empty plain text. Only `{{name}}` and `{{roadmapTitle}}` placeholders are allowed. HTML, external destinations, email addresses, unsupported placeholders, duplicate steps, and known unsupported promotional claims are rejected. Invalid or incomplete responses fall through to the next configured provider; they are not saved as successful drafts.

## Graphics and truthful context

The renderer guarantees a branded focus graphic and a three-step visual plan; the model cannot remove the layout or supply arbitrary artwork. Decorative graphics use the existing email-safe table cells and CSS with solid-color fallbacks. The shared flat page/sheet, branding, footer, light/dark support, and Outlook theme rules remain in place. Content remains readable when images or advanced styles are blocked.

The graphic illustrates suggested actions, never student completion or progress. AI copy must not contain metrics or invent scores, lesson names, timings, features, dates, deadlines, guarantees, job access, or available exam attempts. This standard combines enforced structure and known-claim checks with a factual generation brief; admins still review AI wording before sending.

| Category | Purpose | Primary destination |
| --- | --- | --- |
| Welcome | Set up a profile and discover career interests | Onboarding, then the career quiz |
| Continue learning | Choose and work through one topic | Relevant roadmap or roadmap picker |
| Certification preparation | Review concepts and check exam options | Relevant exam page, or roadmap picker if no track is known |
| Unsuccessful exam | Review and explain concepts before another attempt | Relevant roadmap or roadmap picker |
| Certificate congratulations | Acknowledge the earned certificate and apply a learned concept | Relevant roadmap or roadmap picker |

The recommendation engine still controls lifecycle eligibility, category, suppression, and sending intervals. The AI receives no student record or actual student identifiers. Personalization happens when the email is rendered.

## Optional public catalog grounding

Generation uses the shared [central retrieval pipeline](rag-architecture.md) to find relevant examples across the public roadmap catalog. Each email category supplies a fixed learning query; no student profile or activity is used to retrieve examples. The shared pipeline combines BM25 and available vector retrieval, reranks candidates when a cross-encoder is configured, and keeps a lexical fallback when neural services are unavailable. The email adapter includes at most three distinct roadmap titles and two topic names with brief descriptions per roadmap. The complete context is capped at 1,800 characters, and retrieval has a 4.5-second budget within the existing overall drafting deadline.

The model may use relevant context as an explicitly optional example. It must keep the email useful for any reader in the category, preserve `{{roadmapTitle}}`, and never suggest that an example is the reader's chosen track, next topic, completed work, or assessed weakness. Public catalog strings are labeled as data, never instructions. Fields with markup, links, addresses, placeholders, or control characters are excluded. Private vault files, study guides, quiz banks, salaries, certifications, resource URLs, and student records are never included.

The central corpus supports both tree and legacy roadmap formats, bounds parallel file reads, and retains safe cached data through partial catalog failures. The email adapter applies an additional plain-text filter and deduplicates roadmap sources. Generation still works from the category brief when retrieval is unavailable or evidence is insufficient. Saved drafts retain the same `groundingSources` slug list, identifying which public sources were supplied, not a claim that the model used or cited each source. Existing records need no migration. Optional neural retrieval and index setup follow the shared [RAG configuration](rag-architecture.md); the lexical fallback requires no model service.

## Existing drafts and configuration

Existing schema version 1 drafts remain readable with their saved copy and IDs. The renderer supplies the visual plan they lack without rewriting stored records. Newly saved drafts use schema version 2. There is no database migration or image-generation service required for the graphics.

Generation continues to use the existing configured Groq, TokenRouter, and OpenRouter providers, with the same provider fallback, timeout budget, locking, and rate limits. At least one existing provider key must already be configured. No additional setup is required for the graphics. Generating or previewing a draft does not send an email.
