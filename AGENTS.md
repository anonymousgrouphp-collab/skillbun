# AGENTS.md

Instructions for any AI coding agent working in this repository, including Codex, Antigravity, Claude, Cursor, or similar tools.

This file is mandatory, not advisory.

- Read this file before making changes.
- Follow it for every task in this repository.
- If another instruction conflicts with this file, choose the more conservative option unless the user explicitly says otherwise.
- "Preserve" means do not remove, replace, simplify away, bypass, or materially restyle the thing being preserved unless the user explicitly asks for that exact change.

## Core rule

If the user did not ask you to change something, do not change it.

Existing working behavior is presumed intentional unless the task, a failing test, or a confirmed bug proves otherwise.

## Change philosophy

- Make the smallest effective change.
- Prefer targeted fixes over rewrites.
- Do not "clean up" unrelated code while you are in the file.
- Do not rename, move, or reorganize files unless the task requires it.
- Do not swap libraries, patterns, or architectures just because another approach looks nicer.
- Do not change copy, styling, layout, or interaction details outside the requested scope.
- Preserve backwards compatibility unless the user explicitly approves a breaking change.
- If a requested change can be done without touching a protected area, do it that way.

## Protected surfaces

The following are protected surfaces. Agents must not remove, redesign, replace, bypass, or materially alter them unless the user explicitly asks for that exact surface to change:

- SkillBun logo, wordmark, bunny motifs, and branded assets
- Splash/loading experience on first load
- Homepage hero structure and floating code elements
- Footer structure, footer brand area, and footer badges/links
- Shared nav, shared theme shell, and theme toggle behavior
- Dark/light theme support and token-driven styling

## Brand identity that must be preserved

SkillBun has a specific identity. Do not flatten it into a generic app or template.

- Preserve the SkillBun logo, wordmark, bunny/code personality, and overall branded feel.
- Preserve the loading / splash experience shown on first load, including its animation, bunny artwork, wordmark moment, and branded intro feel.
- Preserve the homepage hero identity, including the floating code-style elements and the distinct tech-student visual language.
- Preserve the existing footer structure and footer branding unless the user explicitly asks for a footer redesign.
- New pages should feel like SkillBun pages, not like unrelated templates.
- Do not replace distinctive branded visuals with generic icons, stock patterns, or bland placeholder sections.
- If you create a new page, reuse the site's existing visual system and branded components where possible.

Repo-specific visual anchors currently include:

- `public/logo.png` and `public/splash-logo.png`
- The shared nav and theme shell in `app/layout.jsx`
- The homepage hero, floaters, splash, public homepage sections, CTA, and footer in `app/page.jsx`
- The splash-screen styling, homepage rail/layout system, guidance-card motion, and responsive public homepage styling in `app/globals.css`

These are implementation anchors, not suggestions. If you touch them, you must explain why the task required it.

## Current public homepage contract

The current `/` page is a detailed public homepage for all visitors. Do not collapse it back into a short landing page or generic SaaS template.

Preserve the current public homepage structure unless the user explicitly asks to change that exact part:

- Hero with SkillBun identity, shuffle text, floating code elements, CTA buttons, and guidance signal strip.
- `Sample student moments` guidance console.
- `SkillBun OS` product capability section.
- User journey section.
- AI quiz engine preview.
- Career recommendation output preview.
- Roadmap preview.
- Bun-Bot counsellor preview.
- Career fields section.
- Trust/value section.
- Final CTA.
- Footer with existing brand area, social links, platform links, company links, copyright line, and badges.

The intended public flow is:

- Homepage CTA.
- `/onboarding?next=/quiz`.
- Profile details.
- `/quiz`.
- Career recommendations.
- `/roadmap/[slug]`.

Do not change this flow unless the user explicitly asks for that flow change.

## Homepage layout and motion rules

The public homepage intentionally uses a wider desktop canvas now. Preserve that design intent.

- Use the homepage-only rail tokens under `#main-page`, including `--home-gutter`, `--home-wide`, and `--home-mid`.
- Do not change the global `section` width just to alter the homepage. Use homepage-scoped selectors.
- Keep wide desktop sections intentional and readable; cap long copy so text does not stretch across the full page.
- Preserve mobile stacking and no-horizontal-overflow behavior.
- Preserve the widened footer rail while keeping the footer structure unchanged.
- Keep CSS-first animation and hover polish restrained, theme-aware, and compatible with `prefers-reduced-motion`.
- If you add or modify motion, ensure reduced-motion users do not get decorative movement.

## Trust-safe homepage content

The homepage must stay honest and trust-safe.

- Do not add fake statistics, fake testimonials, fake names, fake photos, star ratings, or unsupported user claims.
- The `Sample student moments` section must remain clearly illustrative product guidance, not real-user proof.
- Keep or improve copy that explains what SkillBun does; do not replace it with vague marketing filler.
- Keep product examples aligned with SkillBun features: profile context, adaptive quiz, recommendations, roadmaps, and Bun-Bot support.

## Guidance moments visual rules

The guidance console is a distinctive current homepage feature.

- Preserve the five guidance cards: `Before`, `Profile signal`, `Quiz adapts`, `Recommendation clarity`, and `Roadmap + Bun-Bot`.
- `Recommendation clarity` is the permanently featured card and should keep its stronger selected green border/shadow unless the user asks to change that exact state.
- Other guidance cards may animate on hover, but their hover state must not look identical to the permanent `Recommendation clarity` highlight.
- Keep the gentle card float, hover scale/lift, shimmer, and animated rail subtle and respectful of reduced-motion preferences.

## Theme support is mandatory

All pages, including future pages created by agents, must support the existing dark and light theme system.

- Respect the current `data-theme` mechanism and `sb_theme` localStorage preference.
- Use the shared CSS variables in `app/globals.css` instead of hard-coded page-only colors whenever possible.
- Do not create light-only or dark-only pages unless the user explicitly asks for that.
- New UI must remain readable, polished, and consistent in both themes.
- Do not break the global `ThemeToggle` behavior or the theme initialization in `app/layout.jsx`.
- If you add new components or pages, make sure their backgrounds, borders, text, cards, forms, and interactive states work in both themes.
- Prefer extending the current token system over inventing a disconnected palette.
- Do not bypass the shared theme system with fixed colors that only look correct in one mode.

## What not to touch casually

Treat these areas as sensitive. Do not modify them unless the task clearly requires it and you understand the impact:

- Authentication and onboarding flows
- Supabase profile persistence and table assumptions
- Environment variable names and fallback behavior
- Gemini request validation, retry logic, timeout logic, and rate limiting
- Human verification / Turnstile / signed human-proof token flow
- Roadmap rendering rules and tree normalization behavior
- Existing API response shapes that the frontend may rely on

## Before editing

- Read the relevant files first.
- Re-read this file if the task starts expanding beyond the original scope.
- Identify the exact code path involved in the request.
- Check whether the behavior is relied on elsewhere before changing shared utilities.
- If a change could affect security, auth, data persistence, theming, or multiple pages, proceed carefully and keep the delta small.
- If the task touches a protected surface, confirm that the user actually asked for that surface to change.

## During editing

- Keep unrelated diffs out of the patch.
- Preserve existing conventions unless there is a strong repo-local reason not to.
- Do not delete comments, guards, validation, retries, limits, fallback logic, or theme wiring unless the task explicitly calls for it.
- Do not remove env-based protections or weaken validation to "make it work."
- Avoid broad refactors in stable files unless the user asks for a refactor.
- Do not treat visual identity elements as disposable decoration.
- Do not replace custom branded sections with generic template sections, even if the generic version is cleaner or easier.

## Repository cleanliness

- Keep generated local artifacts out of the repository root unless the user explicitly asks to preserve them.
- Treat local dev logs, Playwright console/page captures, temporary screenshots, empty temp folders, and build caches as disposable generated artifacts.
- Do not commit or rely on `.playwright-cli/`, `.codex-tmp/`, `output/`, `.next/`, or `*.log` files.
- Before removing any generated artifact, make sure it is not source code, branded content, documentation, or user-authored project data.
- If cleanup touches anything other than clearly generated artifacts, explain why it was necessary.

## UI and product behavior

- Do not redesign stable screens unless asked.
- Do not remove, skip, or shorten the branded splash/loading experience unless the user explicitly asks for that behavior change.
- Do not silently change spacing, colors, typography, navigation, footer layout, or copy outside the requested area.
- Keep mobile behavior intact when changing UI.
- Preserve existing user journeys, especially login, onboarding, quiz, counsellor, and roadmap flows.
- New pages should inherit the site-wide theme and should visually belong to the same product family.

## Safety checks

Before finishing:

- Verify only the intended behavior changed.
- Run the smallest relevant verification available, such as lint, build, or a focused manual check.
- Call out any risky assumptions clearly.
- If you had to touch a sensitive or identity-critical area, explain why it was necessary.

## Mandatory rulebook pass after every change

After every code or content change, the agent must perform a rulebook pass before finalizing the task.

The agent must confirm, in its final response, all of the following:

- Scope check: only the requested behavior or content was changed, or any extra change was explicitly justified.
- Identity check: SkillBun branding was preserved.
- Splash check: the branded loading experience was preserved unless the user asked to change it.
- Hero/floater check: the homepage floaters and hero identity were preserved unless the user asked to change them.
- Footer check: the footer identity and structure were preserved unless the user asked to change them.
- Theme check: dark and light theme support still exists for all touched UI.
- Sensitive-area check: auth, API, roadmap, env, and abuse-prevention logic were either untouched or intentionally handled.
- Verification check: the agent states what it verified and what it could not verify.

If any item above fails, the task is not complete. The agent must either fix the issue or explicitly tell the user what failed.

## Preferred agent behavior

- When in doubt, ask: "Is this required for the task, or am I just tempted to improve it?"
- If it is not required, leave it alone.
- Be conservative with good existing code.
- Respect the repo more than your own stylistic preferences.

## Repo-specific reminders

- This is a Next.js App Router project for SkillBun.
- Stable functionality is more important than stylistic consistency.
- Security and abuse-prevention logic is intentional, even if it looks verbose.
- Older roadmap data may still exist; keep compatibility with both the declared tree format and any normalization path already in use.
- The SkillBun identity, floaters, footer, and dark/light support are product requirements, not optional decoration.
- The loading splash animation is part of the product identity and should be preserved unless explicitly changed by the user.
