# ArchitectFlow — Refactor Guardrails

This document defines the constraints for all refactoring work on this repository.

## Baseline

ArchitectFlow is a **static HTML/CSS/JavaScript application**.
There is no build step, no server-side rendering, and no runtime framework.

## Protected Public Routes

| Route                    | Served By                                   |
| ------------------------ | ------------------------------------------- |
| `/`                      | `index.html` (redirects to Value Simulator) |
| `/value-simulator/`      | `value-simulator/index.html`                |
| `/scaling-ai-framework/` | `scaling-ai-framework/index.html`           |
| `/discover/`             | `discover/index.html`                       |
| `/current-process/`      | `current-process/index.html`                |

These routes must remain unchanged throughout the refactor.

## Non-Negotiables

1. **No runtime frameworks.** Do not introduce React, Next.js, Vue, Svelte, Angular, or similar.
2. **No Tailwind runtime.** Do not add Tailwind CSS as a runtime dependency.
3. **No route changes.** The public routes listed above must remain stable.
4. **No formula changes.** Simulator business formulas in `simulator-core.js` must not be modified unless a proven, documented bug is found.
5. **Preserve existing behavior.** Theme toggle, app shell, sidebar, navigation, export (CSV, PDF, print), and deep-link behavior must keep working.

## Deployment Targets

- Firebase Hosting (primary) — configured via `firebase.json`
- Cloudflare Pages (secondary) — configured via `wrangler.jsonc`
- Any static HTTP server (local dev via `npx serve .`)

## File Structure Snapshot (Pre-Refactor)

```
architectflow/
├── index.html
├── value-simulator/index.html
├── scaling-ai-framework/index.html
├── discover/index.html
├── current-process/index.html
├── firebase.json
├── wrangler.jsonc
├── package.json
├── package-lock.json
├── assets/
│   ├── css/main.css
│   ├── js/
│   │   ├── simulator-core.js
│   │   ├── export-utils.js
│   │   ├── theme.js
│   │   ├── app-shell.js
│   │   ├── toast.js
│   │   ├── chart-bar.js
│   │   ├── value-simulator.js
│   │   └── scaling-ai-framework.js
│   │   ├── discover.js
│   │   ├── current-process.js
│   │   ├── discover-gate1-calc.js
│   │   ├── discover-gate1-data.js
│   │   ├── discover-gate1-render.js
│   │   └── discover-gate1-state.js
│   ├── vendor/
│   │   ├── jspdf.min.js
│   │   └── jspdf.plugin.autotable.min.js
│   └── svg/logo-kpmg.svg
├── GUARDRAILS.md
└── README.md
```
