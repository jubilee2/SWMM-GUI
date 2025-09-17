# Project Overview

SWMM-GUI is in the middle of a multi-year migration from a legacy Delphi desktop
interface to a modern, web-based experience. The goal is to expose the same
storm-water modeling capabilities that existed on the desktop, but in a
browser-first UI that is easier to extend, test, and deploy.

## Directory Layout
- `server/` – Node.js backend and API layer.
- `client/` – React front end served by the backend.
- `Epaswmm5/` & `Components/` – Legacy Delphi code and bindings for the SWMM engine.
- `test/` – Shared utilities and fixtures for integration tests.

## Tech Stack
The current stack is Node.js (v20), React, and MongoDB. TypeScript is gradually
being introduced in both the server and client folders. Legacy Delphi code is
retained strictly for reference and should not be modified without prior
coordination with the maintainers.

## Local Development
1. Install dependencies with `npm install` at the repo root.
2. Use `npm run dev` to start the combined development server once the script is
   introduced. For now, start the pieces manually as noted below.
3. Frontend-only work can be run with `npm --prefix client run dev` while
   backend-only work should use `npm run start` from the repo root.
4. MongoDB is expected to be available locally on the default port.

## Testing & QA
- Install dependencies with `npm ci && npm --prefix client ci` to mirror the CI workflow.
- Backend logic is covered by Vitest suites. Run `npm run test:server` before
  opening a PR.
- Frontend checks must match the GitHub Action: run `npm --prefix client run lint` and
  `npm --prefix client test`.
- If you touch Cypress end-to-end specs (future work), run `npm run cypress` and
  capture failures in the PR description.

## Contribution Rules
- **Commit style** – Use concise, present-tense messages (e.g., `feat: add map widget`).
- **Formatting** – Prefer Prettier defaults. Do not disable ESLint rules unless
  essential; instead, update the code to satisfy the linter.
- **TypeScript** – When adding new files, prefer TypeScript (`.ts`/`.tsx`) over
  plain JavaScript. Always include explicit types for exported functions.
- **Testing expectations** – Changes that alter business logic must include unit
  tests or integration tests demonstrating the new behavior.
- **Documentation** – Update README or inline comments when behavior changes
  affect developer workflows.

## Review Checklist
When opening a PR, confirm the following:
- [ ] Tests succeed locally (`npm run test:server`).
- [ ] Frontend checks succeed (`npm --prefix client run lint`,
      `npm --prefix client test`).
- [ ] Updated screenshots are attached for UI changes.
- [ ] Breaking changes are flagged in the PR description.
- [ ] Any new environment variables are documented with defaults.

Following this guide keeps the migration on track and makes reviews much faster.
