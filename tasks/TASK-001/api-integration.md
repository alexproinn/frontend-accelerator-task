# TASK-001: Frontend API Integration Plan

Status: planning artifact. The assessment contract is confirmed input; no client, handlers, backend, or integration tests have been implemented or verified.

## Context And Contract Classification

Repository/application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`. No existing package manifest, client wrapper, generated schema, authentication integration, or application tests were found. Follow the ownership decisions in `architecture.md` and acceptance criteria in `requirements.md`.

Sources: `frontend-accelerator-assessment/API_CONTRACT.md`, `MOCKING_GUIDE.md`, `FRONTEND_ASSESSMENT_SPEC.md`, `fixtures/mock-scenarios.json`, `fixtures/fixture-clock.json`, and the supplied session details shape. Loaded the Common API integration index and both referenced rules; Framework and Project API integration sections are absent, which is valid.

| Element | Classification | Authority or qualification |
| --- | --- | --- |
| Four required endpoints, DTO fields/enums, success statuses, named errors | Confirmed assessment contract | API_CONTRACT.md; no deployed backend is claimed. |
| Form limits and future local start | Confirmed product requirements | FRONTEND_ASSESSMENT_SPEC.md. |
| MSW 2.14.6, ordinary HTTP, stateful creation, timestamp rebasing | Confirmed assessment requirements | MOCKING_GUIDE.md. |
| Six required scenarios and their supplied failure bodies | Confirmed mock requirements | fixtures/mock-scenarios.json. |
| Client method signatures, frontend failure types, guards, scenario controls | Proposed local implementation decisions | Defined below; do not change the external API. |
| Stable input order, location search includes name and address, new record defaults | Explicit mock conventions | Fill unspecified mock implementation details, not promises from a real backend. |
| Auth, server timeout SLA, idempotency, rate limits, cache headers, backend authorization | Unspecified and not assumed | No new header, token flow, or guarantee is introduced. |
| Cancellation/permissions, conflicts, pagination/type filtering | Confirmed optional contract, excluded baseline | Do not implement their controls or endpoints for this task. |
| Test stack | Pending human selection | Architecture records alternatives; this role does not select/install packages. |

No backend clarification blocks the required mock-backed slice. There are no proposed endpoint or response-shape changes. Future real-backend behavior must be confirmed separately for the unspecified items above.

## Client Boundary

Keep DTO declarations faithful to API_CONTRACT.md, including nullable details fields, nested coach/location, cancellation object, and list metadata. Proposed public client interface:

```ts
interface SessionsFilters {
  query: string;
  status: SessionStatus | "";
}

interface ReadOptions { signal?: AbortSignal }

interface SessionsClient {
  list(filters: SessionsFilters, options?: ReadOptions): Promise<SessionsResponse>;
  details(sessionId: string, options?: ReadOptions): Promise<SessionDetails>;
  coaches(options?: ReadOptions): Promise<CoachesResponse>;
  create(input: CreateSessionRequest): Promise<SessionDetails>;
}
```

The client owns fetch/HTTP handling. Feature controllers call these methods; purely presentational components receive state/actions. Keep base URL configuration in the composition boundary with same-origin `/api` as default. Encode query values and the session path segment using platform facilities; never concatenate unescaped user input into URLs. Creation sends JSON with the appropriate content type. No auth or idempotency headers are invented.

| Method | Request | Successful body |
| --- | --- | --- |
| list | GET `/api/sessions?query=<encoded-query>&status=<encoded-status>`; empty values mean no filter | 200 `{ data: SessionSummary[], meta: { page, pageSize, total } }` |
| details | GET `/api/sessions/<encoded-id>` | 200 `SessionDetails` directly, no data wrapper |
| coaches | GET `/api/coaches` | 200 `{ data: CoachSummary[] }` |
| create | POST `/api/sessions`, exact CreateSessionRequest JSON | 201 `SessionDetails` directly |

Return parsed DTOs without changing their external shape. Reject unexpected success status, missing required fields, invalid field types/enums, malformed JSON, and invalid timestamps as frontend response failures. Allow extra fields for forward compatibility. Check nonnegative integer list metadata and numeric summary values without imposing create-form limits on historical records. Do not require all returned sessions to be future or scheduled. Never coerce malformed responses into empty successes.

Timestamp normalization checks ISO UTC values and retains canonical ISO strings. Shared display helpers format local dates. API/client modules do not import fixture JSON or inspect scenario names.

## Frontend Failure Model

Use a typed frontend failure representation, separate from the contracted JSON envelope:

```ts
type ClientFailure =
  | { kind: "http"; status: number; code?: string;
      message: string; fieldErrors?: Record<string, string> }
  | { kind: "network"; message: string }
  | { kind: "invalid-response"; status?: number; message: string };
```

Non-success responses retain HTTP status and valid error-envelope fields. If a non-success body is HTML, malformed JSON, or lacks an error envelope, retain the HTTP status with a safe fallback message. Malformed successful responses use invalid-response. Unexpected error codes remain recoverable generic failures; do not invent new server codes. Aborted reads are ignored by their owner and do not enter a visible error state.

Display server messages as text, with operation-specific fallback copy; never show stack traces or raw response bodies. Field errors apply only to an allowlist of known controls. Unknown field keys contribute to the form-level failure rather than disappearing silently.

## Validation And Local-Time Mapping

The form controller owns a draft with string values for editable numeric/date/time fields. A pure validator returns field errors and, only when valid, a CreateSessionRequest. Do not let an empty numeric control become zero through coercion.

| Draft input | Validation | Request mapping |
| --- | --- | --- |
| title | 3–80 characters after trim | trimmed title |
| type | training, camp, or private | type |
| date + start time | valid local calendar/time; future at submission | startsAt as UTC ISO |
| duration | integer 30–240 | durationMinutes number |
| coach | nonempty choice from loaded coaches | coachId |
| location name | 2–80 after trim | locationName trimmed |
| location address | 3–120 after trim | locationAddress trimmed |
| capacity | integer 1–100 | capacity number |
| visibility | public or invite-only | visibility |
| description | optional, no invented maximum | trimmed text or null |
| trainer notes | at most 500 characters in entered text | trimmed text or null |

Validate the date/time again immediately before submission. Build from local numeric date/time components rather than treating a date-only string as UTC. Round-trip local components to reject impossible dates and daylight-saving gaps. Local convention for a repeated daylight-saving time: use the earlier occurrence; confirm that the selected platform implementation satisfies this in a controlled timezone test. Show the interpreted local time/offset when ambiguous rather than silently suggesting support for selecting both occurrences. Supporting a user-selected scheduling timezone is outside scope.

Map API field keys directly except durationMinutes → duration and startsAt → the schedule group. A startsAt error must be associated with both date and time inputs and focus the date control first. Unrecognized keys remain at form level. Do not clear draft values after any failed request. Keep required coach loading/error separate from invalid form input.

Mock POST validation must independently enforce the required fields, known coach, enums, valid UTC timestamp, and positive numeric inputs. For consistency it will also apply the product's lengths, integer bounds, and future-start rules. This is an explicit assessment mock convention, not evidence of extra guarantees from a real backend.

## Request Ownership, Retry, And Caching

Follow architecture.md: list state belongs to the persistent workspace; details to the current ID; coaches/draft to the create flow; the in-flight mutation and success receipt survive child-view navigation.

- List keys contain applied query/status and an invalidation generation. Details keys contain the ID. Cancel superseded reads and ignore late completions using key/generation checks.
- Read cancellation saves work but is not the only race defense. Outdated results must not overwrite newer state even if transport cancellation is ineffective.
- No automatic retry or polling. Explicit Retry repeats the current read. Changing a filter naturally issues the new request.
- No bespoke timeout is selected without a product requirement or server SLA. Pending read state remains explicit; navigation/filter changes cancel obsolete reads. This is a limitation, not a claim that requests always finish.
- Only one creation may be in flight; acquire the guard before awaiting or relying on rerendered disabled controls. Never automatically retry POST.
- Confirmed creation increments list invalidation before refreshing. Preserve filters and success receipt even when the refreshed list excludes the new record or fails.
- No persistent client cache, stale-time assumption, cross-tab deduplication, or idempotency guarantee. Mock responses should prevent browser caching so retries/scenario changes exercise handlers consistently; real-backend cache policy remains external confirmation.

## State And Error Matrix

| Operation/result | Visible state | Recovery and preservation |
| --- | --- | --- |
| Initial list pending | Loading in list region | Shell/filter controls remain available. |
| List 200 with records | Populated workspace | Render response rows and meta.total; no second client filter pass. |
| List 200 empty, no filters | No sessions yet | Create action. |
| List 200 empty with filters | No matching sessions | Clear/edit filters; do not infer the entire dataset is empty. |
| List 400 INVALID_FILTER | Invalid-filter feedback | Clear filters; keep current input available for correction. |
| List 500 SESSIONS_UNAVAILABLE | List error | Retry current filters. |
| Details pending | Details loading | Return action always available. |
| Details 200 | Complete detail information | Return preserves workspace context. |
| Details 404 SESSION_NOT_FOUND | Not-found state | Return to Sessions; no endless automatic retry. |
| Details 500 SESSION_DETAILS_UNAVAILABLE | Details error | Retry this ID or return. |
| Coaches pending | Loading choices | Preserve/allow other draft fields; prevent valid submission. |
| Coaches 500 COACHES_UNAVAILABLE | Choices unavailable | Retry coaches without resetting draft. |
| Client form invalid | Inline errors | Correct input; no POST. |
| Create pending | Submitting feedback | Prevent duplicates; retain pending owner during in-app navigation. |
| Create 400 VALIDATION_FAILED | Inline known errors plus form fallback | Preserve all values and permit correction. |
| Create 500 CREATE_SESSION_FAILED | Form error | Preserve values; deliberate retry. |
| Create 201 | Announced success | Open created session; refresh list; clear filters action available. |
| List refresh fails after create | Success plus independent list error | Preserve created ID action; retry list, not creation. |
| Read network/invalid response | Operation-specific failure | Retry read; never claim empty success. |
| Create network/invalid response | Result not reliably confirmed | Preserve values; explain uncertainty before deliberate retry, which may duplicate a server-side success. |
| Superseded read abort | No error announcement | Only the current request may change visible state. |

No permission state is required in the baseline. If an unexpected 401/403 arrives, show a generic access failure without fabricating login or role-management flows. Optional cancellation-specific errors do not create permission features by implication.

## Mock Store And Handler Plan

Fixtures stay unchanged. Initialize an isolated store from cloned sessions/details/coaches. Use detail records as the canonical session entities and project summaries with exactly the contracted fields; validate agreement with the supplied summary fixture during initialization/tests. Preserve fixture ordering for existing records; place newly created records first. Ordering is a local mock convention, not a contracted server sort.

Capture one startup instant. Subtract fixture referenceNow and shift every fixture startsAt, createdAt, updatedAt, and nested cancelledAt by that same delta. Preserve nulls and valid ISO output. Do not rebase again on requests, retries, or scenario switches. New records use the current clock directly. Tests freeze time before initialization and exercise this same transformation.

List handler applies case-insensitive substring search across title, coach name, location name and address, then exact status, before total calculation. Trim outer search whitespace consistently. Missing/empty query and status are accepted; unsupported nonempty status or repeated query/status keys return 400 INVALID_FILTER. Do not introduce an arbitrary search length limit. Baseline returns all matching records with page: 1 and pageSize: 10 as required; actual paging is excluded even after creation grows the store.

Details returns the current stored entity or 404 SESSION_NOT_FOUND. Coaches returns its contracted wrapper. A valid create generates a unique ID, createdAt/updatedAt, normalized values, and the selected coach. Local defaults: status scheduled, bookedCount 0, cancellation null; missing optional text becomes null. Update the canonical store before returning 201 so immediate list/details reads see it. Never mutate fixtures or add a backend service.

## Deterministic Scenario Selection And Recovery

Proposed assessment-only configuration: `?mockScenario=<name>` in the URL query before the navigation hash, default normal. Only mock bootstrap parses this query. Unknown names produce an explicit assessment startup configuration error. Do not add scenario query parameters to API calls or product controls.

Expose a small assessment-only automation bridge from mock bootstrap, for example `window.__assessmentMocks.setScenario(name)`, to switch required error scenarios without reloading/losing draft values. It affects subsequent requests, not already captured in-flight responses. It is absent when mocks are disabled. Test/browser scripts, not presentation components, invoke it. Export the equivalent configuration operation for automated integration tests. No new HTTP endpoint is introduced.

| Scenario | Behavior |
| --- | --- |
| normal | Fixture-backed store and approximately 250 ms deterministic response delay, using supplied defaultLatencyMs. |
| empty | On startup, seed an empty session store with normal coaches. Return an empty list until creation; then newly created records must remain discoverable. |
| list-error | GET list returns exact supplied 500 error envelope. Other endpoints behave normally. |
| details-error | Only details for ses_101 returns the supplied 500 envelope. Other IDs retain ordinary behavior. |
| coaches-error | GET coaches returns the supplied 500 envelope. |
| create-error | A valid POST returns the supplied 500 envelope without inserting a record; malformed submissions still receive validation errors. |

The in-place switch accepts normal/list-error/details-error/coaches-error/create-error and retains the store and clock. Empty is startup-only to avoid an implicit destructive store reset during recovery. Switching to normal lets the user press Retry or resubmit with existing inputs. Tests reset store explicitly between cases. Evidence must record both startup URL and any bridge changes, never claim the unchanged URL represents the active override.

Capture scenario/store snapshot choices at request entry, apply validation and the targeted override, then respond after the fixed delay. The integration implementation should support controlled delays in tests without adding a product setting. Scope handler matching to the contracted same-origin `/api` paths. Startup waits for browser interception readiness before rendering request-producing components; startup failure is explicit. Both browser and automated tests reuse handlers/store rules. Unhandled application API calls should fail verification; ordinary asset requests are not API failures.

## Test Strategy And Required Evidence

Use the eventual human-selected stack; no library is added by this document. Verify through the real client and shared handlers wherever possible:

- Search across each supported field and combined status; clearing filters; meta.total and fixed metadata; INVALID_FILTER for malformed status.
- Detail success, unknown ID, targeted details-error with another ID unaffected; coaches error/recovery.
- Exact POST payload mapping, validation blocking, 201 values and persistent list/details availability, including creation from empty and under a hiding filter.
- Server field errors, unknown field keys, 500 and network/malformed-success failures preserve draft. A rapid repeat submission makes one pending request.
- Loading, empty/no matches, superseded read responses, and a pre-create list response arriving after invalidation.
- One captured rebase offset across every fixture timestamp, no double shifting, fresh creation timestamps, local date/time mapping and daylight-saving gap/repeated-time policy.
- Browser recovery changes scenario in place, retries the operation, and proves retained form values; record URL, bridge changes, relevant HTTP statuses, and unexpected console/page/network errors.

Group assertions into the assessment's focused behavior tests; add narrow validation/clock checks only where needed to prove boundary risks. Browser evidence remains required for actual worker startup, focus, mobile reachability, and offline local operation.

## Open Items And Handoff

No external API confirmation is required for the specified mock-backed assessment. A real backend adoption needs confirmation of authentication/permissions, ordering/search conventions, validation parity, timezone ambiguity policy, cache/timeout behavior, and safe mutation retry/idempotency before claiming those guarantees.

Before coding: human selection of test dependencies remains outstanding; implementation must verify MSW/platform APIs used to realize this plan. UI designer owns control grouping, precise recovery copy, announcements, and pending-navigation affordances. The recommended next manual role is `ui-designer` for TASK-001.

Only this task artifact was written. No production client/handlers, dependencies, assessment inputs, or living specifications changed. This role ran in the main agent; no isolated sub-agent execution or passing runtime/API tests are claimed. STOP: no subsequent role was invoked.
