# TASK-001: Coder Evidence

Status: required application behavior and essential tests implemented; ready for manual code-reviewer. This is not the final assessment verification verdict.

## Implemented Scope

- React 19/TypeScript/Vite application at repository root, with documented assessment development/build/preview and backend-mode build.
- Server-filtered search/status list, distinct loading/empty/no-match/error states, desktop table/mobile items, text statuses and local dates.
- Hash-linked session details, complete detail fields, independent error/not-found recovery, retained list filters and return focus/scroll.
- Full validated create form with coach loading/failure recovery, retained drafts, field errors, in-flight guard, pending navigation, success receipt, list invalidation, and direct discoverability under hiding filters.
- Replaceable typed HTTP client, runtime response checks, normalized errors, shared MSW 2.14.6 handlers/store, all six required scenarios, in-place error recovery bridge, and one-time fixture-clock rebasing.
- Thirteen tests across three files covering the essential behavior flows and focused boundary/race/date risks.

Created application/configuration files: package.json, package-lock.json, index.html, tsconfig.json, vite.config.ts, vitest.config.ts, eslint.config.js, .gitignore, README.md, public/mockServiceWorker.js, and src/**. Generated dist/node_modules are ignored. Required assessment input remains unchanged. Existing runtime setup and earlier planning artifacts were already untracked; they were preserved.

## Deliberate File-Map Adjustments

The implementation preserves the planned responsibilities with fewer one-use files: App.tsx owns the workspace composition/filter/list controller and success receipt instead of separate SessionsWorkspace/use-sessions-workspace/CreationFeedback files. A shared use-request.ts implements read lifecycle; SessionDetails owns its small details controller. One strict tsconfig.json covers application/test/build configuration instead of separate application/node configs. Vite types are provided through tsconfig types rather than a dedicated environment declaration. No additional runtime library, build plugin, or formatter was installed.

The seven workspace interaction tests include one extra stale-response regression; six narrower API/validation/date tests cover risks outside normal component flows. This exceeds the assessment's suggested four-to-six target to prove explicit race, malformed-data, and time-boundary behavior.

## Commands And Results

All commands ran from `/Users/alexanderprotasov/Documents/projects/frontend-assesment`.

| Command/check | Result |
| --- | --- |
| npm install --cache /private/tmp/frontend-assessment-npm-cache | Initial sandbox attempt could not resolve npm registry (ENOTFOUND), interrupted with exit 130. Approved escalated rerun exit 0; 291 packages added, 0 vulnerabilities reported. |
| node node_modules/msw/cli/index.js init public --save | Worker copied successfully and package metadata updated. A following independent documentation command failed in sandbox; worker generation itself completed. |
| npm run typecheck | Exit 0. |
| npm run lint | Exit 0, including after final source changes. |
| npm test | Initial run: 11 passed, 2 failed due to incorrect test expectations. Corrected tests to respect nested response fields and two Maya-coached fixtures. Final run exit 0: 3 files, 13 tests passed. |
| npm run build | Exit 0 after final source edits: 289 modules, separate mock chunk; final build completed in 518ms. |
| npm run build:backend | Exit 0: 45 modules, no mock chunk. Search for Mocking enabled / __assessmentMocks / fixture title in dist/assets returned no matches (rg exit 1, expected). Assessment build restored afterward. |
| node toolchain/bin/doctor.mjs --json | Exit 0, READY. Node 26.1.0, browser agent-browser 0.32.3 and docs ctx7 0.5.5 PASS, Codex and Claude hooks ACTIVE, lint capability found. |
| git diff --exit-code -- frontend-accelerator-assessment | Exit 0; assessment inputs unchanged. |
| git diff --check | Exit 0 for tracked changes. New files remain untracked; this is not claimed as a whitespace check of every new file. |
| npm ls --depth=0 | Exit 0; React 19.2.8, TS 5.9.3, Vite 7.3.6, MSW 2.14.6, Vitest 4.1.11, RTL 16.3.3, user-event 14.6.7, jsdom 27.4.0, ESLint 9.39.5, typescript-eslint 8.70.0, React Hooks lint 7.1.1. |

Test runner emitted Node 26's experimental localStorage warning; no application localStorage is used. npm marked the selected ESLint 9 release deprecated; lint succeeds, but future maintenance should evaluate its supported successor and compatible configuration. No test/build failure was hidden or treated as a pass.

Project ctx7 adapter documentation requests failed in the network sandbox, then succeeded after escalation. Read MSW handler/response/server/lifecycle guidance through `/websites/mswjs_io`, and Vitest clock/lifecycle guidance through `/vitest-dev/vitest`. Installed declarations and successful compiler/tests provide additional API evidence. No backend endpoint was invented.

## Coder Browser Smoke Check

This was a limited implementation check, not the separate browser-verify role or its full matrix.

- Started own Vite server. Initial listen failed with EPERM in sandbox; approved rerun served `http://127.0.0.1:5173/`.
- Used the installed project browser adapter in isolated session `task001-coder`. Initial sandbox startup could not write its socket directory; approved rerun succeeded.
- Loaded normal populated workspace; inspected full desktop accessibility snapshot and screenshot at 1440 × 900.
- Inspected populated screenshot at 390 × 844; document scrollWidth and innerWidth both 390.
- Opened ses_101 on mobile; details heading received focus (`details-heading`), displayed as heading level 1 after the responsive heading adjustment, and document remained 390px wide.
- Browser page-error output was empty for inspected flows. Console showed Vite/React development messages, MSW startup, and successful list 200 responses. Default MSW request logging was then disabled with quiet mode to avoid logging submitted form content.
- An attempted CSS `:visible` selector was unsupported/not found by this adapter command; the subsequent fresh accessibility-ref click succeeded. This was an automation selector failure, not an application navigation failure.
- Screenshots: `evidence/coder-populated-desktop.png`, `evidence/coder-populated-mobile.png`. These capture populated rendering, not create/error coverage.
- Closed only session `task001-coder`; stopped only the Vite process created here (intentional interrupt exit 130). No server remains running from this role.

Not verified in browser here: complete keyboard/touch matrix, create pending/success/error, coach/list/detail recovery interactions across all viewports, long-content stress, offline operation/preview startup, all network statuses, and full accessibility conformance. Automated tests cover core behaviors but do not replace those observations.

## Remaining Assessment Work

Manual code review, required browser-verify matrix, final verify verdict, and docs-generator final report remain. Developer-reported start/finish/breaks/active/calendar time and complete accelerator installation provenance have not been supplied. Planning preceded production edits in this conversation; no additional Git checkpoint was made. Roles in this conversation ran in the main agent, so isolated-agent workflow compliance must not be claimed.

Product limitations match planned scope: transient drafts/filters reset on reload; native leave warnings cannot guarantee preservation; POST retries cannot guarantee idempotency after uncertain network outcomes; no configured request timeout or real backend; optional features excluded. No known required behavior is intentionally omitted from the implementation, but full acceptance remains subject to review/browser verification.

Coder STOPs here. Recommended next manual phase: code-reviewer for TASK-001. No next role invoked.

## Follow-Up Coder: Review Findings

The subsequent read-only review returned NEEDS-CHANGES with two P2 findings: discarded unmapped/visibility validation feedback, and missing return-focus fallback for direct details/creation navigation. The user manually selected coder to address them.

- Validation feedback: use-create-session.ts now includes unmapped API field-error messages in the form summary. CreateSession.tsx renders visibility errors and associates them with the radio group and each radio; the existing invalid-control focus behavior now targets the first radio when appropriate.
- Return focus: App.tsx detects transitions back to the list and focuses the workspace heading when no previous row or creation-success target applies. Initial workspace load does not acquire this fallback focus. Existing row restoration and creation-success focus retain precedence.
- Regression coverage: SessionsWorkspace.test.tsx exercises response-driven unknown/visibility errors, error associations and focus, retained title, direct details return, direct create return, and entering/leaving creation without opening a row.

Before fixes, the four added regression cases failed (4 failed, 7 skipped in the targeted run). After implementation, one keyboard test initially raced the existing initial-navigation animation-frame focus; the test now waits for that focus to settle before activating the return link. Final npm test exited 0: 3 test files, 17 tests passed. npm run lint exited 0. npm run build exited 0, including TypeScript checks and the assessment build (289 modules). Commands ran from the repository root. The Node experimental localStorage warning remains as recorded above.

Changed production files: src/app/App.tsx, src/features/sessions/CreateSession.tsx, src/features/sessions/use-create-session.ts. Changed test file: src/features/sessions/SessionsWorkspace.test.tsx. Updated this evidence report and workflow log. No dependencies, public API contracts, fixtures, or assessment inputs changed.

Coder disposition: both findings addressed with regression tests. This does not replace the reviewer's NEEDS-CHANGES verdict with an independent PASS. No additional real-browser verification occurred during this follow-up; rendered keyboard/screen-reader checks remain for browser-verify. Recommended next manual phase: code-reviewer for the focused fixes. STOP; no subsequent role invoked.
