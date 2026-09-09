# TASK-001: Product And Interaction Exploration

Status: recommendation for manual handoff; not an approved design or implementation plan.

## Problem Framing

A training-business operator needs to find a scheduled session, answer practical questions about it, and create another session without losing their place. The experience should support repeated use throughout a working day: fast comparison, clear capacity and status, and dependable feedback after actions.

Repository and application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`. There is no existing application behavior to preserve. `requirements.md` already defines the required scope. The architecture phase was interrupted before an artifact was written; its preliminary commentary is not a confirmed decision.

Sources: the assessment README, FRONTEND_ASSESSMENT_SPEC.md, API_CONTRACT.md, MOCKING_GUIDE.md, EVIDENCE_PROTOCOL.md, designs/DESIGN_TOKENS.md, and TASK-001 requirements. This exploration does not change the fixed assessment contract.

## Users And Jobs

- Primary user: a busy trainer or operator coordinating coaches and locations.
- Repeated job: search for a session and establish when, where, with whom, and how full it is.
- Inspection job: read description, notes, coach contact information, and timestamps without losing the search context.
- Scheduling job: enter a new session, correct mistakes, and know that creation succeeded.
- Success feels predictable: returning from details restores the previous search and position; failures retain useful context; a successful creation always has an obvious next action.

Frequency comes from the brief's repeated daily use. No user research, task timing, or preference validation has been performed. English copy and a single operator with creation access remain baseline assumptions; optional permission behavior is excluded.

## Options And Trade-Offs

| Approach | User value | Complexity and risk | Reversibility | Fit with brief |
| --- | --- | --- | --- | --- |
| A. List with contextual details; separate create surface | Fast scan–inspect–return loop. Desktop details can retain the visible list; mobile gives details the full screen. The longer form gets adequate space. | Moderate: focus, return position, and responsive transitions must be deliberate. | High: details presentation can change while preserving the same flow. | Strongest fit for repeated comparison and preserving context. |
| B. List with dedicated details and create pages | Clear focus on each job; room for long notes and form fields. Easy to understand on mobile. | Low to moderate: return context still needs preservation; repeated inspection adds navigation. | High: details can later become contextual without changing required information. | Strong fit; favors focused reading over rapid comparison. |
| C. Day-grouped agenda with expandable session information | Makes chronological scanning prominent; expansion keeps users near the session they selected. | Moderate to high: variable row heights hinder comparison; several expanded records create long mobile pages; all required fields must remain reachable. | Medium: changing grouping alters users' scanning habits. | Weaker fit for finding across cancelled, completed, and future sessions. No calendar grid or scheduling interactions are included. |

Recommend A. B is a reasonable fallback if contextual details cannot be made reliable within the required keyboard and mobile behavior. C offers less benefit for the assessment's cross-status search tasks and is not recommended for the baseline.

These are product alternatives, not choices of routing technology, libraries, or module structure.

## Primary And Alternate Flows

### Find And Inspect

1. Open Sessions. Show an explicit loading state while retaining the page heading and recognizable controls.
2. Display a scan-friendly list with all required summary information. Use text for scheduled, full, cancelled, and completed; show capacity as booked out of total.
3. Search by title, coach, or location and optionally select one status. Make the active filters apparent and provide Clear filters.
4. Open a session using an explicitly named keyboard-accessible action. Details show the complete information, including notes, contact summary, and created/updated timestamps.
5. Return to the same search, status, and list position. Restore focus to the invoking action when it still exists; otherwise use the list heading or another meaningful fallback.
6. A direct details link must offer an explicit way to reach Sessions without depending on an earlier in-app visit.

Details are read-only in the baseline. Do not imply that a cancelled session can be restored or a full session can be booked from this workspace.

### Create

1. Choose Create session from the workspace.
2. Present one form, grouped into session information, schedule and coach, location and capacity, and optional details. A multi-step wizard is not justified for this scope.
3. Show the user's local timezone near date/time inputs. Keep optional description and trainer notes available without making them required.
4. On invalid submission, retain values, identify each invalid field, and move attention to the first actionable error. Associate errors with their controls.
5. While submitting, expose pending feedback and prevent another submission. Keep the action's dimensions stable.
6. On success, announce creation and provide an explicit Open created session action. Refresh the workspace results while preserving filters; never leave success dependent on whether a row happens to be visible.
7. If filters hide the created session, the same success message provides Open created session and Clear filters. Do not silently discard the operator's search.

Prefer an in-page create surface with the workspace's context retained for return. Exact layout and close/back behavior belong to UI design. Preserving a draft after an API failure is required; persistence across reloads is not proposed.

### Empty, Failure, And Recovery Paths

| Situation | User-facing behavior | Recovery |
| --- | --- | --- |
| No sessions exist, no active filters | Explain that the workspace has no sessions yet. | Create session. |
| No results with active filters | Explain that nothing matches the current search/filter; avoid claiming the whole workspace is empty. | Clear filters or edit the search. |
| List fails | Show a list-specific error; retain filter values and the application shell. | Retry the current search. |
| Details fails | Keep return navigation available and distinguish not-found from a temporary load failure. | Return to Sessions; retry temporary failures. |
| Coaches loading | Show that choices are loading; allow entry in independent fields. | Wait for choices before valid submission. |
| Coaches fails | Keep the form and existing values; explain why submission is unavailable. | Retry coach loading. |
| Create validation failure from the API | Place known field errors next to their controls; use a form-level message for errors without a known control. | Correct values and resubmit. |
| Create server or network failure | Preserve every entered value and show useful form-level feedback. | Allow deliberate retry; never auto-repeat creation or claim the server could not have saved a request whose result is unknown. |
| Successful create, list refresh fails | Keep the success confirmation and created-session action; report the separate list failure. | Open the created session or retry the list. |

Mock scenarios are assessment infrastructure, never operator-facing modes. Their selection and recovery mechanics belong to the API integration handoff. Optional cancellation and read-only scenarios remain out of scope.

## Recommended Product Direction

Use a restrained sessions workspace with compact comparison on desktop and a single-column, scan-friendly presentation on mobile. Keep search, one status filter, Clear filters, and Create session discoverable. Prefer contextual inspection and a spacious single create form. Do not add a marketing header, dashboard metrics, saved views, calendar interactions, or optional filters before required behavior is complete.

UI design must ensure that every required summary field remains available at 390 × 844, rather than solving density by removing information. Focus visibility, text status labels, announced async feedback, useful headings, and local date/time display are core behavior. Follow the supplied tokens; validate actual contrast and responsive reachability rather than assuming tokens alone prove accessibility.

## Success Criteria For Later Verification

- At 1440 × 900 and 390 × 844, all fields and actions are reachable without overlap or horizontal page scrolling.
- Keyboard users can search, open details, return, complete creation, correct validation, and recover from failures.
- Search and status context survive a details visit; return focus has a meaningful destination.
- A successful create is announced and directly discoverable even under a conflicting filter.
- Loading, empty workspace, no matches, and failures are visibly distinct.
- API failure never clears the create form; pending feedback prevents accidental repeated submission.
- Browser evidence demonstrates these outcomes. This brainstorm provides no verification verdict or measured usability claim.

## Decisions And Handoff

- Recommended product direction is A; it is not recorded as a user-approved visual design. No additional product scope is requested.
- Architect: resolve navigation/context preservation, state ownership, failure containment, and testability for these flows.
- UI designer: settle details surface semantics, responsive information hierarchy, form grouping, focus and announcement behavior, and pending navigation behavior. These details must preserve the acceptance criteria whichever presentation is chosen.
- API integration: define request/error mapping and deterministic scenario selection/recovery under the existing fixed contract.
- Writing plans: translate the eventual confirmed decisions into a file-level plan. This exploration is not that plan.

Only this brainstorm artifact was written. No source, dependencies, assessment inputs, requirements, or living specifications changed. The role STOPs here; the recommended next manually selected role is `architect` for TASK-001. No next role was invoked.
