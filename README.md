# ArchitectFlow

KPMG AI Intelligence Hub — static web application.  
**No build step required.** Open the HTML files in a browser, or serve locally.

---

## Quick Start

```bash
npm install   # installs serve (dev dependency only)
npm run dev   # serves on http://localhost:4028
```

Or without npm:

```bash
npx serve . -p 4028
```

---

## Public Routes

| URL                      | Page                            |
| ------------------------ | ------------------------------- |
| `/`                      | Redirects → `/value-simulator/` |
| `/value-simulator/`      | AI Value Simulator              |
| `/scaling-ai-framework/` | Scaling AI Framework            |

---

## Project Structure

```
architectflow/
├── index.html                        # Root redirect → /value-simulator/
├── value-simulator/
│   └── index.html                    # Value Simulator page
├── scaling-ai-framework/
│   └── index.html                    # Scaling AI Framework page
├── assets/
│   ├── css/
│   │   ├── tokens.css                # Design tokens (colors, fonts, shadows)
│   │   ├── base.css                  # Reset, utilities, print, scrollbar
│   │   ├── layout.css                # App shell, sidebar, topbar, content area
│   │   ├── components.css            # Buttons, cards, sliders, charts, toasts
│   │   └── pages/
│   │       ├── value-simulator.css   # Page-specific styles (simulator)
│   │       └── scaling-ai-framework.css  # Page-specific styles (framework)
│   ├── js/
│   │   ├── simulator-core.js         # Pure calculation engine (no DOM)
│   │   ├── simulator-ui.js           # Render functions + static definitions
│   │   ├── value-simulator.js        # Page driver: state, events, exports
│   │   ├── framework-data.js         # Framework content (single source of truth)
│   │   ├── scaling-ai-framework.js  # Page driver: PDF export, init
│   │   ├── chart-bar.js              # Bar chart renderer
│   │   ├── export-utils.js           # CSV builder + file download utility
│   │   ├── theme.js                  # Light/dark/system theme manager
│   │   ├── app-shell.js              # Sidebar collapse, mobile menu, nav state
│   │   └── toast.js                  # Toast notification system
│   ├── svg/
│   │   └── logo-kpmg.svg
│   └── vendor/
│       ├── jspdf.min.js
│       └── jspdf.plugin.autotable.min.js
├── favicon.ico
├── firebase.json                     # Firebase Hosting config
├── wrangler.jsonc                    # Cloudflare Pages config
├── package.json
├── GUARDRAILS.md                     # Hard constraints for this project
└── ARCHITECTURE.md                   # Detailed technical reference
```

---

## Deployment

### Firebase Hosting (primary)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

Config: `firebase.json` — `cleanUrls: true`, assets cached 1 year, HTML `no-cache`.

### Cloudflare Pages

Connect the repository in Cloudflare Pages dashboard.  
Build command: _(none — static output)_  
Output directory: `.` (root)

---

## CSS Architecture

Layered import order (all imported via `main.css` compatibility shim, or directly in each HTML `<head>`):

```
tokens.css → base.css → layout.css → components.css → pages/<page>.css
```

Do **not** add inline styles. Use or extend existing token variables and component classes.

---

## JS Module Map

```
simulator-core.js     ← no dependencies (pure functions)
export-utils.js       ← no dependencies
chart-bar.js          ← no dependencies
framework-data.js     ← no dependencies
theme.js              ← no dependencies
toast.js              ← no dependencies
app-shell.js          ← no dependencies
simulator-ui.js       ← depends on: simulator-core.js, chart-bar.js
value-simulator.js    ← depends on: simulator-core.js, simulator-ui.js,
                         export-utils.js, theme.js, app-shell.js, toast.js
scaling-ai-framework.js ← depends on: framework-data.js, jspdf, theme.js,
                           app-shell.js, toast.js
```

---

## Guardrails

See [`GUARDRAILS.md`](./GUARDRAILS.md) for the non-negotiable constraints on this project.

---

## Known Constraints

- No runtime frameworks (no React, Vue, Next.js).
- No build step — the served directory is the production artifact.
- PDF export on Value Simulator uses `window.open` + `window.print()` — pop-up blockers will prevent it.
- `localStorage` used for scenario save/theme persistence; fails silently in private browsing.
