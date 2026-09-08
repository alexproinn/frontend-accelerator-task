# TASK-001: Training Sessions Workspace

## Goal

Build the required frontend vertical slice from `frontend-accelerator-assessment/`: a responsive, accessible workspace where a training-business operator finds, inspects, and creates sessions using the fixed HTTP contract implemented with MSW.

Repository and application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`. No alternative application candidate was found. `TASK-001` is this candidate run's first task workspace, not the assessment package's identity.

## Users And Outcome

The primary user is a busy trainer managing basketball programs, coaches, and locations. They need quick schedule scanning, capacity visibility, predictable details navigation, and a trustworthy create flow.

## Acceptance Criteria

### Workspace and details

- [ ] A navigable sessions view displays title, type, status, local start date/time, duration, coach, location, capacity, and booked count.
- [ ] Search matches title, coach name, and location case-insensitively. One status filter supports scheduled, full, cancelled, and completed. Combined filters work, and clear restores the unfiltered list.
- [ ] Search and status are sent to `GET /api/sessions`; the MSW handler filters before calculating `meta.total`, retaining required `page: 1` and `pageSize: 10` metadata. Filtering only the complete client fixture list does not qualify.
- [ ] Status labels are understandable without color. Loading, populated, no sessions, no filter matches, and list failure are visibly distinct; empty/no-match/error states offer useful recovery.
- [ ] Opening a session preserves current list context on return. Details show every list field plus description, trainer notes, capacity summary, coach contact summary, and created/updated timestamps.
- [ ] Details are keyboard accessible and deep-linkable when the chosen router permits. Failed details requests and unknown IDs produce useful error/recovery behavior, including contracted 404 and 500 responses.

### Creation

- [ ] The form provides title, type, date, start time, duration, coach, location name, location address, capacity, visibility, optional description, and optional trainer notes.
- [ ] Title accepts 3–80 trimmed characters; location name 2–80 trimmed characters; location address 3–120 trimmed characters; notes at most 500 characters.
- [ ] Date/time resolves to a future instant in the user's local timezone; duration is an integer from 30–240 minutes; capacity is an integer from 1–100; coach is required; type and visibility use contracted enums.
- [ ] Validation errors appear near controls with programmatic associations. Applicable API field errors are surfaced, with useful form-level errors when appropriate.
- [ ] While submission is pending, duplicate submissions are prevented and pending feedback is observable. No uncontracted idempotency guarantee is claimed.
- [ ] A failed creation preserves entered values and permits recovery. Successful creation is clearly announced and the new session can be found in subsequent list and details reads.
- [ ] If current filters hide the created session, success provides an explicit action to open it or reset relevant filters.
- [ ] Coach loading/failure is observable. When coaches cannot be loaded, the form does not pretend a valid coach choice can be submitted and offers useful recovery.

### API and deterministic mock behavior

- [ ] A replaceable frontend client owns ordinary HTTP requests to `GET /api/sessions`, `GET /api/sessions/:sessionId`, `GET /api/coaches`, and `POST /api/sessions`. Components do not scatter transport calls; components and client do not import fixtures or branch on scenario names.
- [ ] MSW 2.14.6 handles all required endpoints using supplied fixtures and fixed request/response/error shapes. Required error codes are `INVALID_FILTER`, `SESSIONS_UNAVAILABLE`, `SESSION_NOT_FOUND`, `SESSION_DETAILS_UNAVAILABLE`, `COACHES_UNAVAILABLE`, `VALIDATION_FAILED`, and `CREATE_SESSION_FAILED`.
- [ ] Create handler validation covers required fields, a known coach ID, supported enums, positive duration/capacity, and valid ISO timestamp. Invalid input returns 400 with `VALIDATION_FAILED` and field errors where applicable.
- [ ] Successful POST returns 201 with generated ID/timestamps, normalized submitted values, and selected fixture coach; creation persists in memory for subsequent list/details requests. Reset on application restart is allowed.
- [ ] Required scenarios `normal`, `empty`, `list-error`, `details-error` (target `ses_101`), `coaches-error`, and `create-error` are deterministic, selectable at the mock boundary, and documented as assessment infrastructure rather than product features.
- [ ] At mock startup, shift every fixture `startsAt`, `createdAt`, `updatedAt`, and `cancelledAt` by current time minus fixture `referenceNow`. Tests freeze time and apply the same transformation. Client-facing timestamps remain valid ISO 8601 UTC values and display locally.
- [ ] Server/request state has an explicit owner without duplicated sources of truth; request/mutation races do not leave contradictory visible state. Replacing MSW with a real backend does not require rewriting presentation components.

### Responsive and accessible UI

- [ ] At 1440 × 900 and 390 × 844, content and actions remain reachable without overlap or horizontal page scrolling. Desktop supports comparison; mobile supports efficient scanning.
- [ ] All flows work by keyboard with visible focus; controls have semantic names/labels, headings are useful, validation is programmatically associated, and status/mutation feedback is appropriately announced.
- [ ] Text/control contrast is sufficient, states do not rely on color alone, actions are not hover-only, and any nonessential motion respects reduced-motion preferences.
- [ ] The visual hierarchy follows the supplied operational reference and fallback tokens: restrained surfaces, local sans-serif typography, 4px spacing scale, at least 40px controls, 44px mobile touch targets, and visible focus. Avoid oversized marketing heroes, decorative gradients, and excessive nested cards.

### Tests and evidence

- [ ] Essential behavior tests cover search/status filtering; create validation/success; create server failure preserving inputs; initial loading; no sessions/no matches; and at least one list/details failure. Aim for 4–6 focused tests, adding only justified risk coverage.
- [ ] Real-browser evidence includes populated desktop/mobile screenshots, desktop accessibility snapshot, mobile keyboard/touch reachability and overflow checks, create validation/pending/success/discoverability, create failure preservation/recovery, empty/no matches, and list plus one details/coaches error recovery.
- [ ] Browser evidence records actual URL, adapter session, interaction steps, server ownership, console/page errors, relevant network statuses, unexpected navigation, and unverified behavior. Only role-owned browser/server resources are closed.
- [ ] Actual check commands, working directory, exit codes, decisive output, failures/skips, and final Git scope are recorded. Demonstrated primary flows have no uncaught errors. Reproduction instructions include a working start command.
- [ ] Before production edits, requirements, architecture, API, UI, and file-level test-aware implementation plan exist, with timestamped runtime history or a planning checkpoint proving order.
- [ ] Task evidence ultimately includes `architecture.md`, `api-integration.md`, `ui-design.md`, `implementation-plan.md`, `workflow-log.md`, `review.md`, `browser-verification.md`, `verification.md`, `final-report.md`, and required images under `evidence/`.
- [ ] Workflow evidence truthfully records manual role selection, isolated agent/skill execution and STOP boundaries, starting commit, runtime/setup/Doctor/hook state, contextual-role rationale, and developer-reported timing. Review findings retain their actual dispositions. No unperformed verification is claimed.

## Constraints

- Node.js 24+, npm, Git, React 19, TypeScript 5.9+, Vite 7+, and exactly `msw@2.14.6`; initialize and connect the MSW browser worker.
- Build in the new assessment project, not the accelerator toolset source repository. Keep all assessment inputs unchanged; production/task artifacts belong outside that directory.
- Preserve unrelated source/configuration and record reasons/trade-offs for additional dependencies. A data library is not automatically required by React rules.
- No real backend, secrets, real personal data, analytics, production credentials, or required remote assets. The mock-backed application must work without external network access after setup/dependency preparation.
- Fixed endpoint paths, required fields, response shapes, and error codes must not be changed without a documented proposal and evaluator approval.
- Accelerator Doctor must not be BLOCKED; setup method, version/source revision and assessed runtime hook status must be recorded. Record a starting commit before implementing the assessed app.

## Non-Goals

Backend, authentication, registration, payments, email/notifications, drag-and-drop calendar, recurring schedules, attendee/organization management, deployment, public URL, release, and pull request. Localization/i18n is out of scope.

Optional extensions are not included in this baseline: type filtering, URL filter synchronization, pagination, cancellation, read-only permissions, background refresh, tablet-specific evidence, conflict scenarios, optimistic rollback, visual regression suites, calendar, and saved filters. The baseline details navigation must still preserve list context.

## Facts

- Sources reviewed: assessment README, specification, fixed API contract, mocking guide, evidence protocol, rubric, design tokens, and scenario fixture. The SVG is a hierarchy reference, not a pixel-perfect requirement.
- No task workspace or application package manifest was found before this document; no implementation decisions are established here.
- Coordinator-reported checks: Node `v26.1.0`, npm `11.13.0`; `node ./toolchain/bin/doctor.mjs --json` exited 0 with `DEGRADED`; browser/docs passed, Codex/Claude hooks were `PENDING_ACTIVATION`, and lint script was missing. These observations are reported by the coordinator, not independently executed by this role.
- Coordinator reports no Git commits yet. Starting-commit and complete setup evidence remain outstanding.
- Passing requires at least 75/100, rubric section minimums, and no blockers. Honest incompleteness must be explicitly reported and must not be presented as a passing implementation.

## Assumptions

- Required behavior only is the initial implementation scope; optional product extensions need an explicit later choice.
- English UI copy is acceptable because localization is out of scope.
- In-memory session persistence is sufficient as explicitly permitted by the mock guide.
- Concrete navigation, request-state ownership, scenario selector, component structure, test stack, and visual composition belong to the specialists; this document does not preselect them.

## Open Questions And Specialist Handoffs

- `architect`: settle navigation/details context, state ownership, component boundaries, race handling, and proportionate dependencies for the otherwise new app.
- `api-integration`: define typed client/normalization/error handling, full state/error matrix, validation mapping, scenario selection, fixture rebasing, and stateful MSW behavior against the fixed contract.
- `ui-designer`: settle responsive composition, detailed form/recovery interactions, focus/announcement behavior, and token usage.
- `writing-plans`: turn those decisions into an ordered file-level implementation plan and essential tests before production changes.
- Developer-owned evidence: actual start/finish/breaks and active/calendar times must be supplied, never inferred. Starting commit, installation/source provenance, and hook activation evidence need to be completed/preserved.
- No product ambiguity blocks specialist work. Setup/evidence gaps block claiming assessment completion, not documenting requirements.

## Readiness

Requirements are documented and ready for a manually selected `architect` phase for `TASK-001`. Not yet ready for production implementation: specialist decisions and the implementation plan are absent, and starting-commit/setup evidence remains outstanding.

This requirements role STOPs here. It has created only this requirements artifact, has not modified assessment inputs or production code, and has not invoked the next role.
