# Courtside · Training Sessions Workspace

A React/TypeScript frontend for finding, inspecting, and creating training sessions. The assessment application uses an in-memory MSW API; no backend, account, or external assets are required after dependencies are prepared.

## Run locally

Use Node.js 24+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The default development command explicitly enables assessment mocks and waits for the worker before rendering. Sessions reset on page reload; newly created records are available through both list and details until then. The worker is checked into `public/`.

Production-style local preview, also with assessment mocks:

```sh
npm run build
npm run preview
```

`npm run build:backend` builds without mock initialization, fixture bundles, or the automation bridge. It expects the contracted same-origin `/api` backend; none is included here. Serve a build over HTTP on localhost or HTTPS so service workers can operate. Offline means no external services are needed while the local server is available; this is not an offline-cached PWA.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
node toolchain/bin/doctor.mjs --json
```

The test suite uses shared MSW handlers, a frozen reference clock, and ordinary HTTP through the frontend client. Node 26 may emit an experimental localStorage warning from the test environment; the application does not use localStorage. npm currently marks the selected ESLint 9 line deprecated, although the installed configuration runs successfully. See the lockfile for exact resolved dependencies.

## Mock scenarios

Add a scenario in the URL query before the navigation hash, for example:

```text
http://localhost:<actual-port>/?mockScenario=list-error#/sessions
http://localhost:<actual-port>/?mockScenario=details-error#/sessions/ses_101
http://localhost:<actual-port>/?mockScenario=create-error#/sessions/new
```

Supported startup names: `normal`, `empty`, `list-error`, `details-error`, `coaches-error`, `create-error`. The default is normal. Empty seeds an empty session store but retains coaches and supports stateful creation. Details-error affects only `ses_101`. Unknown scenario names fail startup visibly.

For repeatable recovery tests without losing a draft, run this in the assessment page's browser console or automation evaluation, then use the UI's Retry or submit control:

```js
window.__assessmentMocks.setScenario('normal');
```

The bridge also accepts the four required error scenario names; empty is startup-only. Scenario changes affect subsequent requests and do not reset records or rebase timestamps again. These controls are assessment infrastructure and do not appear in the product. Record in-place scenario changes alongside the initial URL in verification evidence.

## Boundaries and trade-offs

- `src/api`: fixed DTOs, response guards, ordinary HTTP and normalized failures. No fixture imports.
- `src/mocks`: shared handlers, stateful fixture store, one-time clock rebasing, browser/test startup.
- `src/features/sessions`: reusable views, form validation, local-time mapping, and request/create lifecycle.
- `src/app`: persistent workspace wiring and three hash-based views. No routing or state-library dependency.

React 19, TypeScript 5.9, Vite 7, and MSW 2.14.6 are assessment requirements. Approved development tooling is Vitest, React Testing Library, user-event, jsdom, ESLint, TypeScript lint rules, and React Hooks rules. DOM tests are quick but do not prove rendered layout; the existing accelerator browser adapter provides real-browser checks without adding a second browser-test package. Types packages support strict checks. Vite's existing TypeScript/JSX transform is sufficient; no React build plugin or formatter was added.

Filters and drafts survive in-app navigation but not reload. Creation is not automatically retried; a network failure may leave its server outcome uncertain. Local scheduling uses the user's timezone, rejects impossible times, and chooses the earlier occurrence of repeated daylight-saving times. No optional cancellation, authentication, pagination, or persistent storage is implemented.

## Assessment evidence

The input under `frontend-accelerator-assessment/` remains unchanged. Task decisions and the approved plan are in `tasks/TASK-001/`. The [coder report](tasks/TASK-001/coder-report.md) records actual implementation checks, smoke screenshots, and deviations from the file map. Full read-only review, the required browser verification matrix, final verification, and final-report assembly remain separate manual phases. The coder smoke check is not an assessment completion verdict.
