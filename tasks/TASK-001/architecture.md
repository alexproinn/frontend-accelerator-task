# TASK-001: Frontend Architecture

Status: architecture decisions for planned implementation; no application code exists yet.

## Context And Evidence

Repository and application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`. Inspection found one assessment project, no package manifest, no existing application/router/test stack, and no living architecture specification. Starting commit observed earlier in this session: `4780f7dd96dd3a51fb2835959aaeda52b7cb1d68`.

Inputs: `requirements.md`, `brainstorm.md`, the assessment specification, API contract, mocking guide, and evidence protocol. Loaded Common architect rules and the React architect index's referenced composition/state rules. There is no Project architect section. The mandated target is React 19, TypeScript 5.9+, Vite 7+, npm, Node 24+, and MSW exactly 2.14.6; these are requirements, not evidence of installed dependencies.

This document resolves application boundaries and lifecycle decisions. It does not approve the brainstorm's visual presentation, modify the external contract, choose unapproved packages, or establish implemented living-spec truth. No current third-party API behavior is needed to make these decisions; package APIs and versions beyond the assessment constraints still need verification during planning/implementation.

## Decisions And Alternatives

| Concern | Decision | Rationale and alternatives |
| --- | --- | --- |
| Structure | One application with one sessions feature and separate API/mock boundaries. | A monorepo, shared component package, or generic repository framework adds overhead without a second consumer. These local boundaries remain easy to change. |
| Navigation | A small application-owned hash navigation adapter for list, details, and create. | Three views need links and Back/Forward behavior, not a general routing framework. Hash links avoid dependence on server path fallback. A routing dependency can replace the adapter if route scope grows, but none is selected now. |
| Remote state | Feature-owned request controllers with explicit states and cancellation; no application-wide store or query library. | The slice has one list, one active detail, one coach collection, and one creation workflow. A data library offers caching/invalidation conveniences but adds a dependency; manual lifecycle correctness needs focused tests. |
| Form | One feature-owned draft with pure validation and request mapping. | No form or schema dependency selected. More local validation code is acceptable for this single fixed form. |
| External data | Ordinary HTTP through a typed client; MSW is wired only at bootstrap/test boundaries. | Replacing the mock with a backend must preserve presentation and feature controllers. Direct fixture reads from UI/client are rejected by the assessment. |
| Creation | Pessimistic submission, explicit success, list invalidation after confirmed success. | Avoid fabricated success, rollback complexity, and implied server idempotency. |
| Persistence | In-memory UI/draft/request state; URL holds navigation only. | Reload persistence and filter URL synchronization are optional scope. Mock persistence remains in memory as required. |

These are reversible local implementation decisions within the authorized architect scope. No additional dependency or cross-package convention is treated as chosen. The testing-tool proposal below remains pending human selection.

## Boundaries And Dependency Direction

Proposed directories indicate ownership, not a final file-level implementation plan:

| Boundary | Responsibility | Allowed dependencies |
| --- | --- | --- |
| `src/app/` | Bootstrap, navigation adapter, application shell, fatal-render recovery, wiring the sessions feature. | Feature entry point and mock startup at the composition root only. |
| `src/features/sessions/` | Workspace controller, list/details/create views, draft state, validation, local-time form conversion, local display helpers. | API client/contracts, React, platform capabilities. |
| `src/api/` | Contract types, HTTP requests, response checks, normalized errors, timestamp validity checks. | Platform transport; no React, fixtures, mock scenarios, or UI imports. |
| `src/mocks/` | Scenario configuration, rebased fixture store, MSW handlers, browser/test startup. | Supplied read-only fixtures and contract types; never presentation. |
| Test support | Clock control, mock lifecycle/reset, request assertions, behavior fixtures. | Production public boundaries and MSW handlers. |

Production data flow: view action → feature controller → API client → HTTP → MSW or real backend. Responses travel back through the client to the owning controller and view. Mock handlers do not call the client, and components do not select mock scenarios.

Keep list, details, and create as explicit components rather than one component with unrelated mode booleans. Share a field/status primitive only where actual reuse exists. State lives above the components that consume it. Prefer explicit state/action props for shallow composition; if a complex form requires context, keep a feature-local state/actions/meta interface rather than exposing transport or a global store.

## Navigation And Context

The navigation adapter owns these logical locations:

- `#/sessions`: workspace.
- `#/sessions/new`: create flow.
- `#/sessions/<encoded-session-id>`: details; reserve `new` before parsing IDs.

Use links for navigation and one parser/action boundary for initial location, user navigation, and Back/Forward. Invalid paths receive a recoverable not-found view with a Sessions link. Decode IDs safely and reject malformed navigation without throwing through the application shell. No other module parses the hash.

The sessions workspace owner remains mounted while its child view changes. It retains search, status, list request state, return scroll position, and the identity of the invoking control. Opening details or create does not clear those values. Returning restores focus after content is ready, with the workspace heading as fallback when a row is absent. The UI designer owns whether details appear as a panel or full view and the resulting dialog/focus semantics.

Direct details links load the requested session independently of list success. With no previous in-app list context, the explicit Sessions action opens the default workspace rather than blindly navigating browser history. Reloading preserves the linked view but resets transient filters/drafts; persistence across reload is not claimed.

Navigation state is derived from the current location. Do not maintain a second selected-session ID that can disagree with the URL. Presentation changes between desktop and mobile must not create independent navigation or data owners.

## State Ownership

| State | Single owner | Lifecycle |
| --- | --- | --- |
| Current view/session ID | Navigation adapter | URL-derived. |
| Search and one status | Persistent workspace controller | Retained across child views, reset by explicit Clear filters. |
| List result and request status | List controller under workspace | Keyed by applied query/status and invalidation generation. |
| Active details result | Details controller | Keyed by URL ID; discard old data when ID changes. |
| Coaches and request status | Create-flow controller | Load when create is opened; retry independently of draft. |
| Draft and field/form errors | Create-flow controller | Retain on failures and in-app view changes; clear on confirmed success or explicit discard. |
| Create request and success receipt | Persistent workspace/create controller | Survive child-view navigation while a submission settles. |
| Focus/scroll return metadata | Workspace presentation boundary | Transient references/identifiers, not another copy of session data. |
| Mock records and scenario | Mock boundary | Reset on mock startup/test reset; never owned by UI. |

Use explicit discriminated request states such as idle, loading, success, and error. Derive capacity text, empty/no-match distinctions, and disabled controls from authoritative state rather than synchronizing duplicate booleans. Search is passed to the contracted endpoint; do not implement fixture filtering in components. If input debouncing is introduced, distinguish the pending draft query from the applied request key and label pending results correctly.

## Request Races And Mutation Flow

Every read has a request key and generation. Abort superseded reads where possible and ignore late results unless their key and generation still match. Cancellation is not a user-facing error. Cleanup must tolerate mount/unmount repetition. Retry uses the current key, never a captured older filter or session ID.

For a changed filter/ID, do not display an older result as if it belongs to the new key. The baseline may show loading in the affected region. A same-key refresh may retain existing data only with explicit refreshing/stale feedback. A failed refresh must not imply retained data is current.

Creation sequence:

1. Validate the current draft against the complete specification, including trimmed lengths, integer bounds, required coach, and future local start.
2. Acquire a synchronous in-flight guard before starting the request; disabled rendering alone is insufficient for rapid repeated events.
3. Send one request. Do not auto-retry POST or claim aborting navigation rolls back server work. Keep the mutation owner mounted during in-app navigation so its outcome remains observable.
4. On field/server failure, retain all draft values, map recognized field errors, expose a form-level fallback, and release the guard for deliberate correction/retry. A network failure can have an unknown server outcome; do not claim the session definitely was not created.
5. On confirmed 201, store a small success receipt (created ID/title), clear the submitted draft, and invalidate the list. Increment the list generation so a pre-mutation response cannot overwrite the refreshed result.
6. Preserve active filters and always expose Open created session. Offer Clear filters to find it in the list. Details use their ordinary read endpoint; the receipt is feedback, not a second authoritative details store.
7. If the list refresh fails, preserve creation success and report the independent refresh error. Never offer another create submission as the recovery for a failed list refresh.

## API, Dates, And Mock Boundary

Expose list, details, coaches, and create methods matching the four required endpoints. Accept cancellation for reads. Preserve contracted error code, message, status, and optional field errors in a frontend error representation. Transport failures and malformed responses need explicit fallback kinds; they must not become empty successful collections. Exact signatures and field mapping belong to `api-integration`.

At the API boundary, validate relevant response structure and timestamp validity. Keep valid UTC ISO strings as the canonical data representation; a shared feature display formatter renders local time. Convert date/time form values to one UTC ISO value in a pure submission mapper. Validate by round-tripping local components so nonexistent daylight-saving times are not silently moved. For repeated local times, document and test the chosen platform disambiguation in the integration plan; no timezone scheduling library is selected.

Only the mock bootstrap rebases fixture timestamps, once per initialized store, using one captured current instant. Shift every startsAt, createdAt, updatedAt, and cancelledAt consistently. POST-generated timestamps use actual/mock clock time without a second rebase. Tests freeze the clock before store initialization and reset the store per test.

Use the same handlers/store behavior for browser and automated integration tests. Scenario selection belongs to mock startup configuration; the integration role will select its exact mechanism. Await mock readiness before the first application request. A startup failure produces a clear startup error, not accidental fallback calls to an absent backend. Provide an explicit mock-enabled assessment mode for development and reproducible local preview; ordinary backend mode excludes mock startup. No server implementation is authorized.

## Failure Containment And Accessibility

List, details, and coaches have independent recoverable request boundaries. A failed list must not prevent opening a directly linked session or retaining a creation success receipt. A coaches failure preserves the form but prevents valid submission until choices are available. Unknown detail IDs provide a not-found recovery distinct from transient failure.

An application render-error boundary contains unexpected rendering faults and offers a reload/recovery path. It does not replace explicit async request handling or suppress errors needed for verification. Startup errors are handled before rendering the main workspace. Do not promise draft retention after fatal reloads.

Components must expose semantic controls and error/status associations to the UI designer. Navigation and async lifecycle owners provide the events required for meaningful focus and announcements. Detailed layout, modal trapping, pending navigation affordances, responsive hierarchy, and live-region copy stay with `ui-designer`.

## Performance, Security, And Observability

- Keep the supplied small dataset simple: no virtualization, global normalized cache, speculative prefetch, or memoization framework without measured need.
- Load independent resources without artificial dependencies; a details read must not wait for the list. Fetch coaches when entering creation, not as a prerequisite for viewing sessions.
- Keep mock code/fixture imports behind the selected assessment startup boundary. Use local fonts/assets for offline operation.
- Treat descriptions, notes, names, and error messages as text. Do not render server strings as HTML. Encode IDs and query values at the transport/navigation boundaries.
- No secrets, analytics, real contact data, authentication, or authorization claims. Optional permissions/cancellation remain excluded.
- Expected HTTP failures surface in their owning region; unexpected runtime errors remain observable. Avoid logging full draft/contact payloads. Browser verification must distinguish expected scenario failures from unexpected network and console errors.

## Testability And Pending Tooling Selection

Pure validation/date mapping can be tested without rendering. Feature behavior tests should exercise ordinary HTTP intercepted by shared MSW handlers, rather than mocking away the client. Reset handlers/store between cases and explicitly control latency/clock for pending and race behavior.

Preserve the assessment's focused cases: search/status, creation validation/success, create failure retaining values, loading, empty/no matches, and a request error. Add targeted stale-read and duplicate-submit assertions because this architecture owns those risks. Browser evidence remains mandatory for real navigation, focus restoration, mobile overflow, and the required error/create flows.

No test packages are currently installed or selected. Before adding dependencies, obtain human selection between:

| Proposal | Benefit | Cost |
| --- | --- | --- |
| Recommended: Vitest, React Testing Library, user-event, and jsdom for focused behavior tests; use existing accelerator browser tooling for required real-browser evidence. | Quick component/HTTP behavior feedback and precise validation assertions. | Adds test-only packages; DOM simulation cannot establish real layout/focus behavior. |
| Alternative: Playwright Test as the primary automated behavior suite against the running app. | Tests real browser interactions and HTTP worker integration together. | Browser installation/server lifecycle and deterministic clock/scenario setup add weight and runtime. |

This is a proposal, not permission to install either stack. `writing-plans` must carry forward the user's selection and verify compatible APIs/versions. Required framework/MSW dependencies are already mandated by the assessment.

## Implementation Implications And Handoff

The architecture establishes reversible ownership boundaries without additional runtime packages. The API integration role should next specify client signatures, normalization/error mapping, local-time edge policy, mock scenario configuration, and the state/error matrix. UI design then resolves surfaces/focus behavior. The implementation plan must precede production edits and include navigation race, mutation, and mock startup checks.

Risks: manually owned request lifecycle needs regression proof; a small navigation adapter still needs direct-link and Back/Forward tests; responsive contextual details need browser accessibility evidence; network-failed POST cannot guarantee duplicate prevention across deliberate retries or reloads. Additional routes, shared caches, or scheduling timezone requirements would justify revisiting these choices.

Evidence for this phase: repository/task inspection and creation of this document only. No application tests, build, browser checks, or dependency API verification were run. No production code, assessment inputs, requirements, or living specifications changed. This turn executes the architect skill in the main agent; no isolated sub-agent execution is claimed. The role STOPs here and has not invoked the next role.
