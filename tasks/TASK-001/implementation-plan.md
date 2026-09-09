# TASK-001: Implementation Plan

Status: ready for the manually selected coder phase. Application scope, boundaries, and tooling selection are resolved. This planning phase does not start installation or production implementation.

## Current And Intended Behavior

Repository/application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`. The repository contains the unchanged assessment input, accelerator toolchain/rulesets, and TASK-001 planning artifacts. No package.json, application source, test scripts, or running application were found. There are no existing frontend conventions to reuse beyond the supplied rulesets and task decisions.

Build the required Training Sessions Workspace: server-filtered list, navigable details preserving list context, validated creation, deterministic MSW behavior, complete loading/empty/error states, responsive/accessibility behavior, essential tests, and honest verification evidence. Scope is defined by requirements.md, architecture.md, api-integration.md, and ui-design.md. Optional cancellation, permissions, pagination, calendar, persistence across reload, backend, deployment, and public hosting are excluded.

## Preconditions And Approved Tooling

Confirmed assessment constraints: Node 24+, npm, React 19, TypeScript 5.9+, Vite 7+, and MSW exactly 2.14.6. No additional runtime router, form, validation, state, or date library is selected.

The user approved the recommended testing and lint tooling in this conversation on 2026-09-08:

- Testing: Vitest, React Testing Library, user-event, and jsdom; use the installed accelerator browser adapter for required real-browser evidence. This gives focused component/HTTP tests while reserving layout and real focus checks for browser verification.
- Lint: ESLint with TypeScript and React Hooks rules, enabling a real lint script for the existing changed-file lint gate.

Playwright Test was an alternative and is not selected. No separate formatter is required by the assessment; do not silently add one. These approved development dependencies add setup/maintenance cost but support the required behavior checks and lint gate.

This approval resolves the outstanding tooling notes in the earlier architecture, API, and UI artifacts; those notes describe their earlier phase state. The file map below uses the approved stack. Framework build integration, type packages, compatible versions, and exact lint packages must be verified and recorded during bootstrap rather than guessed in this plan. No further product/tooling selection is needed for the approved stack; environment-required execution approvals still apply. This role neither installs dependencies nor runs invented npm scripts.

Before production implementation, preserve planning order using this timestamped conversation/export or another evidence-protocol-compliant source. The observed starting commit is `4780f7dd96dd3a51fb2835959aaeda52b7cb1d68`; creating another commit is not a required action here. Earlier requirements contain older setup observations; do not treat those as current or rewrite them to hide history. Earlier Doctor output in this session showed DEGRADED with Codex hooks ACTIVE, Claude pending, and lint missing; rerun when relevant setup changes.

## Ordered File Changes

### 1. Application And Verification Scaffold

Create:

- `package.json`: declare mandated application dependencies and selected tooling; define actual local start, test, typecheck, lint, and build scripts. Exact script bodies belong to bootstrap, using verified installed capabilities.
- `package-lock.json`: generated only by the authorized npm setup; pin resolved versions and MSW 2.14.6.
- `index.html`: application root, viewport allowing zoom, page title/theme metadata.
- `vite.config.ts`: application build integration and assessment mock-mode configuration; do not assume an occupied port is available.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: strict application/config checks and appropriate browser/tooling boundaries.
- `src/vite-env.d.ts`: build environment typing.
- `src/main.tsx`: await selected mock startup before mounting the app, with explicit startup error recovery.
- `src/app/App.tsx`: application shell entry point.
- `src/styles.css`: supplied tokens, base semantics/focus, and later responsive styles; no external assets/fonts.
- `eslint.config.js`: selected lint rules, scoped to application/tests/config as appropriate and excluding generated worker/assessment/toolchain copies.
- `vitest.config.ts`, `src/test/setup.ts`: configure the approved test environment and reliable mock cleanup.
- `.gitignore`: exclude dependencies/build output and transient test artifacts. Preserve the assessment, planning artifacts, runtime setup, and required browser evidence; do not blanket-ignore tasks or evidence.

Do not replace the repository with a scaffolder output, overwrite accelerator configuration, or change assessment inputs. Add only the files needed for the single application at repository root. Verify scaffold type/build boundaries before adding behavior once corresponding scripts exist.

### 2. Contract, Validation, And Clock Boundaries

Create:

- `src/api/contracts.ts`: exact endpoint DTOs and enums from API_CONTRACT.md.
- `src/api/errors.ts`: typed HTTP/network/invalid-response failures and safe fallback handling.
- `src/api/parse.ts`: runtime response checks including required fields, nullable values, envelopes, and valid UTC timestamps; allow unknown extra fields.
- `src/api/sessions-client.ts`: four client methods from api-integration.md, encoded paths/query values, ordinary HTTP, cancellable reads, and no automatic POST retries.
- `src/features/sessions/session-form.ts`: draft type/defaults, complete pure validation, known field-error mapping, and request conversion.
- `src/features/sessions/date-time.ts`: local display formatting and local date/time conversion with round-trip validation and explicit ambiguous-time handling.
- `src/features/sessions/session-form.test.ts`: focused pure checks for integer/trim/null/date boundaries, including daylight-saving gap/repeated time and future-time reevaluation.

Contract: presentation does not import fixtures or raw transport. UI states consume normalized frontend failures, not response-body guesses. Keep empty numeric inputs distinct from zero. Tests of historical responses must not apply create-only future/range constraints.

### 3. Shared Mock API

Create:

- `src/mocks/store.ts`: clone supplied fixtures, rebase all required timestamps once with one clock offset, keep canonical details entities, project summaries, and insert generated records.
- `src/mocks/scenarios.ts`: six required startup scenarios, fixed delay, targeted errors, and in-place error recovery controls according to api-integration.md.
- `src/mocks/handlers.ts`: required list/details/coaches/create HTTP handlers; independent POST validation and exact status/envelope behavior.
- `src/mocks/browser.ts`: assessment browser interception startup and automation bridge, absent when mock mode is disabled.
- `src/mocks/server.ts`: shared-handler test integration for the selected testing environment.
- `public/mockServiceWorker.js`: generated by the verified installed MSW initializer, never hand-authored.
- `src/api/sessions-client.test.ts`: focused boundary coverage through shared handlers, including rebasing consistency, stateful creation, malformed responses, and contracted error shapes.

Contract: API/UI modules never depend on mocks. Empty startup creates an empty store that can subsequently accept discoverable sessions. Switching an error scenario to normal preserves drafts/store/clock. Only ses_101 fails in details-error. Handle query/status before total; preserve the required fixed metadata without adding pagination. Await startup before any application request.

### 4. Navigation And Feature Request Ownership

Create:

- `src/app/navigation.ts`: parse/build the three hash locations, reserve new before IDs, safe ID decoding, links/Back/Forward notifications, recoverable unknown paths.
- `src/app/ErrorBoundary.tsx`: unexpected-render fallback with usable recovery.
- `src/features/sessions/use-sessions-workspace.ts`: persistent filter/list state, request keys/generations, cancellation/late-response rejection, list invalidation, success receipt, and return context.
- `src/features/sessions/use-session-details.ts`: current-ID request and independent retry/not-found states.
- `src/features/sessions/use-create-session.ts`: coaches, retained draft/errors, synchronous in-flight guard, pending lifecycle, and creation result handling.

Modify `src/app/App.tsx` to wire the controllers and navigation. Keep one state owner per architecture.md rather than independently copying state into each rendered presentation.

Contract: opening another view keeps the workspace/mutation owner mounted. An old list request cannot overwrite a post-create refresh. Direct detail reads do not wait for list success. Retrying uses the current key. Navigation does not imply cancelling/rolling back a submitted mutation.

### 5. Workspace And Details UI

Create:

- `src/features/sessions/SessionsWorkspace.tsx`: heading/actions, filter controls, feedback, current child view and result states.
- `src/features/sessions/SessionList.tsx`: desktop table and mobile list with identical required content, one active accessible representation.
- `src/features/sessions/SessionDetails.tsx`: complete required fields, nonmodal desktop section/full narrow view, retry/not-found/return behavior.
- `src/features/sessions/StatusLabel.tsx`: text status with supplied accessible colors.
- `src/features/sessions/RequestFeedback.tsx`: reusable labelled loading/error/status content without duplicate live announcements.

Modify `src/styles.css` for the exact breakpoint/reflow rules in ui-design.md: table and contextual details at 1280px+, table/full details at intermediate widths, mobile list below 768px. Preserve full required content, wrapping, visible focus, and local times. No placeholder navigation to unimplemented screens.

Behavior tests accompany this step: server-driven combined search/status; clear; loading; populated/empty/no matches; list/details error recovery; direct details and return context. Avoid asserting incidental CSS structure in component tests.

### 6. Create And Cross-View Feedback

Create:

- `src/features/sessions/CreateSession.tsx`: grouped form, labelled fields, guidance, inline/error summary mapping, keyboard focus, pending disabled editing, and coaches loading/error/empty behavior.
- `src/features/sessions/FormField.tsx`: repeated label/hint/error association where actual reuse justifies it.
- `src/features/sessions/CreationFeedback.tsx`: persistent pending/success/failure receipt, Open created session, relevant Clear filters, and dismiss confirmation action.

Modify workspace wiring and styles for retained drafts, Resume session draft, in-app pending navigation, and success/refresh-failure separation. Use native unsaved-change warning only for actual dirty/pending state; in-app return preserves the draft without discarding it. Do not introduce unsupported cancellation/discard controls.

Contract: invalid input makes no POST; rapidly repeated submit makes one pending POST; API failure retains every value; confirmed 201 clears the submitted draft and invalidates the list; navigating elsewhere during submission does not lose its outcome. Use focus only where specified, avoiding surprise redirects when the user already left the form.

### 7. Essential Behavior Suite And Reproduction

Create:

- `src/features/sessions/SessionsWorkspace.test.tsx`: approximately six focused interaction scenarios listed below, using the real client/shared MSW handlers and deterministic clock/latency.
- `README.md`: actual prerequisites, selected dependencies/reasons, verified setup/start/check commands once implemented, mock-enabled local preview/offline expectations, scenario URLs and in-place recovery controls, reset behavior, and no-backend scope.

Modify earlier tests only to complete essential coverage, not to mirror internal controller implementation. Keep test bridge documentation in assessment/reproduction instructions, not the product UI.

No source changes after this step should be hidden from later review/verification. Coder reports actual files/checks and STOPs. Read-only review, browser verification, final verification, and evidence assembly remain later manually selected roles, not automatic implementation substeps.

## Dependency Order And Independent Work

Scaffold/tooling selection precedes executable tests. DTO/error/draft contracts precede transport, mocks, and controllers. Client and mock internals can be developed independently once their DTOs and failure conventions are fixed. Static styles and stateless status/field primitives can proceed after scaffold using the already-defined UI design. Navigation and mock-store implementation can proceed independently. Full behavior tests wait for the shared client/mock boundary and feature wiring. This describes work dependencies, not authorization to spawn agents or chain roles.

## Essential Tests Beside Behavior

The main interaction suite should group these six flows:

1. Loading → populated → search by supported fields/status → no matches → Clear filters. Assert actual request filtering, not a client fixture shortcut.
2. Empty-start workspace → create entry; separately prove created records become readable in that store through the client-boundary test.
3. Details direct link, complete content, return context, and representative list/details failure with retry.
4. Create validation → valid submission → pending repeat prevention → success/discoverability under a hiding filter.
5. Create server failure retains inputs → in-place scenario recovery → deliberate successful retry; include mapped server errors where appropriate.
6. Coaches failure/recovery and retained draft, with pending navigation preserving the active mutation outcome.

Narrow boundary tests in the files above cover malformed response handling, timestamp rebasing/local conversion, complete validation edges, stale-read rejection, and post-create invalidation. Add those assertions where observable without creating a duplicate controller-mocking suite. Reset mock store/scenario and clock for every test; clean up timers/requests. Never freeze time after rebasing fixtures.

Additional risk coverage, if gaps remain after implementation/review: oversized/unknown fields, invalid hash escaping, lost-response mutation ambiguity, long-content accessibility, and browser lifecycle shutdown. These do not expand the product scope or replace the mandatory browser matrix. A later test-generator phase is conditional on demonstrated gaps.

## Verification Commands And Evidence

Existing commands discovered/observed from repository root:

- `node toolchain/bin/doctor.mjs --json`: available Runtime Doctor. Earlier session output was DEGRADED, with Codex ACTIVE; this planning turn did not rerun it.
- `git status --short`: inspect changed/untracked scope.
- `git diff --check`: whitespace check for tracked diffs; untracked planning files need explicit file checks.

No npm scripts currently exist, so this plan does not claim `npm test`, build, lint, or dev commands are runnable. After authorized bootstrap creates package.json, coder must discover and execute its actual scripts for tests, typecheck, lint, and build, recording working directory, exit code, and decisive output. Documentation must use those actual commands. Dependency installation is not a verification command or an action of this planning phase.

Later browser-verify uses the installed project browser adapter and discovers the actual application URL/port. Preserve populated 1440 × 900 and 390 × 844 screenshots plus the required accessibility, create/pending/error/empty/recovery, focus/overflow, console/page/network evidence. Follow EVIDENCE_PROTOCOL.md and do not claim that automated DOM tests prove rendered behavior.

Later manually selected roles own `review.md`, `browser-verification.md`, `verification.md`, and `final-report.md`, plus required evidence images under `tasks/TASK-001/evidence/`. A workflow log must preserve actual manual selections and STOPs, setup provenance, and developer-supplied timing; agents must not infer timing or claim isolated execution when roles ran in the main agent. Missing developer timing/provenance is an evidence gap, not permission to invent it.

## Risks And Rollback

This is a new local application, with no deployed service or data migration; no rollout/rollback machinery is warranted. Preserve all existing accelerator files, assessment inputs, and unrelated untracked content. Mock-enabled startup is an explicit application mode, not a release toggle. Real-backend mode must not accidentally initialize fixtures or expose automation controls.

Main risks are hand-owned request races, transient draft/pending lifecycle, navigation/focus behavior, timezone edge cases, and mock worker startup. The specified tests and real-browser evidence address them. No completion verdict is possible before implementation and checks.

## This Phase's Result And STOP

Created this implementation plan and finalized it after explicit user approval of the recommended test and lint stack. No source, dependencies, assessment files, scripts, or living specifications changed. No application tests/build/browser checks ran. The plan is ready for `coder` on TASK-001; no next role was invoked.
