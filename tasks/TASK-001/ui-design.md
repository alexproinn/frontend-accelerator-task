# TASK-001: Training Sessions UI Design

Status: implementation-ready task design within the supplied visual direction. No production UI or rendered verification is claimed.

## Context And Direction

Repository/application root: `/Users/alexanderprotasov/Documents/projects/frontend-assesment`; no existing application screens or components exist. Inputs are TASK-001 requirements, brainstorm, architecture, API integration, assessment specification, supplied design tokens, and the SVG hierarchy reference. Read the Common UI index, product-context rules, and pinned interface guidelines. No Framework/Project UI section exists. Vercel branding preferences are not selected.

Use the supplied calm operational style: pale canvas, white work surfaces, dark text, teal primary actions, compact local sans-serif typography, 4px spacing scale, and small radii. Preserve the reference's heading → actions → filters → results → contextual details hierarchy. The SVG is a structural reference, not an exact screen to reproduce: optional type filtering and nonfunctional Coaches/Locations/Programs navigation are omitted.

Use a compact top application bar containing COURTSIDE and the current Sessions navigation link. A permanent 224px rail is unnecessary for one destination and takes space needed for required session fields. No hero, decorative gradient, metrics dashboard, or empty reserved details panel.

## Layout And Information Hierarchy

### Workspace

1. Skip link, application bar, main region.
2. H1 “Training sessions”, short supporting text “Find sessions, review capacity, and schedule training.” Primary Create session link aligned to the heading area.
3. Filter surface: visible Search sessions label, text input with hint “Search title, coach, or location”; Status label and native select; Clear filters button. Options: All statuses, Scheduled, Full, Cancelled, Completed. Search uses a 300ms debounce; status and clearing apply immediately. Enter applies the current query immediately. Do not move focus during filtering.
4. Persistent feedback region for creation outcomes, if present.
5. Results heading with count, followed by the list/table or its region-specific state. During a changed search show “Updating sessions…” rather than a count from a previous filter as if current.

At wide desktop, use a semantic table with five columns:

| Column | Content |
| --- | --- |
| Session | Title link; type and location name underneath. |
| Start | Local calendar date and time; duration underneath. Include year when needed for clarity. |
| Coach | Full coach name. |
| Capacity | “14 of 18 booked”, tabular numerals. |
| Status | Visible Scheduled/Full/Cancelled/Completed text with restrained optional symbol. |

Table titles are the navigation links; do not make an entire row a second custom interactive control. Title accessible names include the title itself. A currently open title link may use aria-current with an appropriate location value. Required data wraps; no critical field is available only in a tooltip. Show location address in details; location name satisfies the summary location requirement.

### Contextual Details

At viewport widths of 1280px and above, show a nonmodal 360px details section alongside the results with a 24px gap. Main content uses 24px side padding and up to 1392px width. At 1440px this leaves about 1008px for results. Details remains in normal document flow rather than a fixed-height scroll trap. The section is labelled by its session heading. No backdrop, dialog role, focus trap, or inert list is used for this nonmodal presentation.

At narrower widths, details occupies the main content area and the results are not exposed as a second active view. The persistent workspace context remains available for return as defined by architecture. This is a navigated full view, not a mobile modal. Resizing changes presentation without resetting the selection or refocusing the user.

Details order:

1. Back to sessions link, always present, including loading/not-found/error states.
2. Session title and status, followed by type and visibility (Public or Invite-only).
3. Schedule: full local date/time, local timezone, duration.
4. Capacity: booked out of total and remaining places derived from those values. An optional decorative fill bar duplicates the text; it is not a second announcement.
5. Coach name and email as selectable contact text; a clearly named email link may be used. No in-app message/send action.
6. Location name and full address, wrapping without ellipsis.
7. Description and trainer notes, retaining meaningful line breaks. Null/blank content reads “No description provided.” / “No trainer notes.”
8. Created and Last updated local timestamps. For a supplied cancellation, show cancelled timestamp and reason, or “No cancellation reason provided.” No cancellation mutation controls.

Opening details focuses its heading once after navigation. While loading, a stable “Session details” heading provides the target; update content without another focus jump. On return restore scroll and the invoking title link; fall back to results heading when the record is absent. Direct links use Back to sessions to reach the default workspace rather than relying on browser history.

### Create Session

Use a dedicated full content view at every width, with a form surface up to 800px wide. Retain a Back to sessions link, H1 “Create session”, and a timezone note. Desktop fields use two columns only for short related inputs; mobile is one column. No wizard or optional-fields accordion.

| Group | Fields and controls | Persistent guidance |
| --- | --- | --- |
| Session | Title text input full width; Session type select | Title: “3–80 characters.” Type options Training, Camp, Private; initial empty “Select type”. |
| Schedule | Date input and Start time input; Duration number input; Coach select | “Times are in your local timezone: <resolved timezone>.” Duration: “30–240 minutes.” Coach starts with “Select coach”. |
| Location and capacity | Location name, address (each full width); Capacity number input | Name 2–80; address 3–120; capacity 1–100. |
| Visibility | Public / Invite-only native radio group | Both are explicit; default Public is a reversible form default. No unsupported permission promise. |
| Optional details | Description textarea; Trainer notes textarea | Mark both Optional. Notes show character count and 500-character guidance. |

All other fields are required. Date, time, title, type, coach, duration, capacity, and location start blank; no invented schedule or numeric defaults. Description remains unconstrained by an invented maximum. Do not prevent paste or silently truncate invalid text; validate full entered values. For ambiguous repeated local time, show the resolved offset and “This time occurs twice; the earlier occurrence will be used.” Nonexistent local time is an error. This implements the integration plan's local-time policy, not a selectable timezone feature.

Place Create session submit and Back to sessions at the bottom in normal flow; no sticky mobile footer obscuring content or keyboard. The top return link remains available as ordinary scrollable content. Buttons meet mobile target size and labels stay stable when pending.

Keep submit enabled for ordinary incomplete/invalid input so submission exposes errors. Disable it only during the request or while coach choices are unavailable; adjacent status text explains those exceptions. Validate on submit, then revalidate affected fields as the user corrects them. Use specific inline messages, such as “Enter a title with 3–80 characters.” / “Choose a future date and time.” Focus the first invalid control in document order. API startsAt errors associate with both date/time and focus Date first. Unknown API field errors appear in the form summary.

## Draft, Pending, And Success Behavior

- In-app Back to sessions preserves the draft without a discard prompt because no data is lost. Show “Draft kept for this visit.” and change the creation entry action to “Resume session draft” when a nonempty draft exists. The form opens at its retained values.
- Do not add a discard/reset action to the baseline. Successful creation clears the submitted draft. If the user attempts to reload/leave with a dirty draft or pending submission, use the platform's unsaved-change warning where supported. It cannot guarantee preservation on browser/device shutdown; do not promise it can.
- During POST, show “Creating session…” and aria-busy on the form. Disable editing of the submitted fields so the receipt cannot silently clear newer edits. Prevent repeated submission using the architecture's in-flight guard as well as disabled controls.
- In-app navigation may continue while submission settles; workspace feedback shows “Creating session…” with a return-to-form action. Reopening the form reflects the same pending request, not a new instance. A later failure appears in persistent feedback with “Review session form”, preserving values.
- On confirmed creation, navigate the visible create view back to the workspace, focus its success heading, and show “Session created: <title>.” If the user already navigated elsewhere, do not unexpectedly redirect or steal focus; announce the receipt there. Always provide Open created session, plus Clear filters when filters are active. Keep success until dismissed or superseded by another creation; no timed toast.
- Refresh failure cannot replace creation success. Show a separate “Session created, but the list could not refresh.” message with Retry list and Open created session.
- A network failure or malformed success leaves an uncertain result. Show “We couldn’t confirm whether this session was created. Check sessions before trying again.” Preserve the draft; provide Back to sessions and allow deliberate resubmission after pending ends. Never automatically repeat POST.

## Complete State Matrix

| State | Content and controls | Focus/announcement |
| --- | --- | --- |
| Initial list loading | Stable heading/filters; “Loading sessions…” in results; optional static skeleton hidden from assistive tech | Polite loading status, no focus jump. |
| Populated | Results count and all required row information | Announce completed count once per applied search. |
| Sparse/dense content | Natural row height for one record; normal page scroll for many | No fixed blank area or hidden overflow. |
| Empty with no filters | “No sessions yet.” / “Create your first training session.” Create session action | State in results; do not focus automatically. |
| No matches | “No sessions match your filters.” Clear filters | Retain inputs/focus. |
| List failure | “Sessions couldn’t load.” Retry; keep search/status | Announce failure once; retry retains focus where possible. |
| Invalid filter response | “This filter couldn’t be applied.” Clear filters | Preserve input for correction. |
| Details loading | Back link and labelled loading section | Focus stable details heading on initial navigation. |
| Details not found | “Session not found.” Back to sessions | Heading reflects failure; no automatic retry. |
| Details temporary error | “Session details couldn’t load.” Retry / Back to sessions | Announce failure; retry does not jump to list. |
| Coaches loading | “Loading coaches…”; other draft controls usable; submit unavailable | Polite status near select. |
| Coaches failure | “Coaches couldn’t load. Retry to choose a coach.” Retry coaches | Associate explanation with coach/submit availability; retain draft. |
| Coaches empty response | “No coaches are available.” Retry coaches / Back to sessions; submit unavailable | No fabricated coach or manage-coaches destination. |
| Client validation failure | Specific field messages; concise error summary if multiple | Focus first invalid control, avoid duplicate full-form announcements. |
| API field failure | Mapped field messages plus form-level fallback | Focus first mapped error, otherwise summary. |
| Create pending | Creating session…; submitted fields/submit disabled | Polite status; in-app navigation remains available. |
| Create server failure | “Session couldn’t be created. Your entries are still here.” Try again via submit | Focus form error summary when form active; otherwise announce with return action. |
| Create uncertain result | Explanation described above; retained draft | No success claim or automatic retry. |
| Create success | Persistent receipt with Open created session, optional Clear filters, Dismiss confirmation | Announce; focus only on intentional return from create. |
| Unexpected access failure | “This request isn’t available with the current access.” Back to sessions | No invented login or role-changing action. |
| Startup/fatal render error | Plain “Workspace couldn’t start.” / “Something went wrong.” Reload workspace | Meaningful heading; no claim that reload preserves draft. |

Status labels never depend on color. Cancelled/completed remain readable records rather than disabled rows. Cancellation, destructive record actions, read-only mode, and optional scenarios are out of scope. The only loss warning is for leaving a transient draft/pending request.

## Responsive Rules

- 1280px and above: full-width table when closed; table plus 360px contextual details when open. With only one actual navigation destination, the top bar preserves comparison space.
- 768–1279px: table workspace; details as full view. Form supports two short fields per row when its container permits.
- Below 768px, including required 390 × 844: result list replaces table presentation. Each item has title link and text status at top; type/location next; labelled local start and duration; coach; booked/capacity. Every required field remains visible and wraps. Use one presentation at a time, with no duplicate tab stops or screen-reader content.
- Mobile heading/action stack; search full width; status and Clear filters wrap as needed rather than squeezing controls. Date/time form fields stack. Page padding 16px; desktop 24px. Add safe-area spacing where needed.
- All layouts use document scrolling with no fixed viewport-height panels. Actions below the fold remain reachable; focused inputs scroll above the software keyboard. Browser zoom and text expansion must remain enabled.
- Long titles, addresses, email, notes, and error messages wrap, including unbroken strings. Do not hide horizontal overflow to conceal broken layout. No fixed row heights or required-data ellipsis. Notes/description can grow vertically.

## Accessibility And Visual Specification

Use one page H1 and labelled sections beneath it; the desktop contextual title is H2, while a standalone details view uses its title as H1. Include a keyboard-visible skip link. Native links/buttons/selects/radios carry their own keyboard behavior; no redundant key handlers for native controls. No hover-only action or icon-only essential action.

Controls have visible labels and meaningful names. Field errors use aria-invalid and aria-describedby with stable IDs; guidance remains associated when errors appear. Radios use fieldset/legend and shared label hit targets. Keep disabled explanations readable. Set non-auth autocomplete deliberately; no password-manager-style personal-address autofill for a training venue. Do not autofocus editable inputs on mobile.

Use a persistent polite status region for loading/result/mutation announcements, with no duplicated announcements from parallel hidden views. Use a focusable error summary for explicit submit failure. Focus outlines are at least 2px with offset; ensure no clipping and adequate contrast on all surfaces. Normal Tab order follows visual/document order. Back/Forward respects the architecture's return behavior. No custom global shortcuts.

Typography follows supplied tokens: H1 24/32 bold; section headings 16/24; body 14/20; supporting 13/18; local sans-serif. Use 16px text for mobile form inputs to avoid unnecessary zoom. Tabular numerals for capacities and counts. Body/status text stays readable at full contrast even on cancelled/completed records.

Use canvas #F5F7F8, surface #FFFFFF, primary #087F72, primary-hover #06675D, text #172124, muted #5F6B6F, focus #1769E0. Supplied #D7DEE0 borders are decorative dividers; use #5F6B6F for essential input boundaries so controls do not rely on the low-contrast divider token. Status text on white: scheduled #217A3C, full #9A6200, cancelled #B42318, completed #5F6B6F. Avoid unverified tinted status backgrounds; visible words provide the semantics.

Local mathematical contrast checks performed for these pairs: white/primary 4.90:1, muted/white 5.50:1, full-status/white 5.10:1, muted/canvas 5.12:1, focus/white 5.08:1. These checks do not verify rendered opacity, overlays, all combinations, or complete accessibility. Implementation/browser verification must check actual results.

Controls are at least 40px tall, with at least 44 × 44px actionable targets on mobile; title links receive adequate hit area without making entire rows interactive. Use 8/12/16/24/32px gaps and maximum 6px repeated/control radii. No motion is needed. If pending indicators rotate, reduced-motion disables rotation while retaining pending text.

## Reuse Candidates And Verification Handoff

Reuse candidates: status label, labelled field with hint/error, request feedback region, capacity text, local timestamp display, and navigation return action. Table rows and mobile items share the same content rules, not conflicting independently maintained data. Module ownership stays with architecture; this document does not prescribe a component library.

Required later browser evidence: populated 1440 × 900 and 390 × 844 screenshots; desktop accessibility snapshot; mobile overflow/touch/keyboard checks; details focus/return context and direct-link recovery; create validation/pending/success under a hiding filter; retained values and recovery after create/coach error; empty/no matches; list and details/coach retry. Include long-content checks, console/page errors, and expected versus unexpected network failures. Scenario controls remain automation infrastructure, absent from product UI.

No visual-direction choice blocks implementation planning: direction comes from the assessment and is specialized here. Test dependencies remain awaiting human selection from the architecture proposals. No mockup rendering, user research, browser validation, or production checks were performed in this role. Only ui-design.md was written; assessment inputs and living specifications are unchanged. The role ran in the main agent; no isolated agent evidence is claimed.

Recommended next manual role: `writing-plans` for TASK-001. STOP; no next role was invoked.
