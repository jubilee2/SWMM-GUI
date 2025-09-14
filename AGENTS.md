# Project Overview

SWMM-GUI is transitioning from a legacy desktop interface to a modern web-based application. The goal is to deliver the same storm water modelling capabilities in a browser while the desktop UI is phased out.

## Directory Layout
- `server/` – Node.js backend and API layer.
- `client/` – React front end served by the backend.
- `Epaswmm5/` – Legacy Delphi code and bindings for SWMM engine.
- `Components/` - Legacy Delphi code and bindings for SWMM engine.

## Tech Stack
Node.js, React, and MongoDB form the core stack for the web application.

## Contribution Rules
- **Commit style**: use concise, present-tense messages (e.g., `feat: add map widget`).
- **Node version**: develop with Node.js v20.
- **Legacy Delphi code**: files under `Epaswmm5/` and `Components/` are maintained for reference. Avoid modifying them unless coordinated with maintainers and document any required changes.
