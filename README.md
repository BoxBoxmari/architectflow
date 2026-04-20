# ArchitectFlow — Static HTML Build

Lightweight static-HTML replacement for the original Next.js / React application.

## Structure

```
architectflow-html/
├── index.html                       → redirects to /value-simulator/
├── value-simulator/index.html       → Value Simulator page
├── scaling-ai-framework/index.html  → Scaling AI Framework page
├── firebase.json                    → Firebase Hosting config
├── assets/
│   ├── css/main.css                 → Design system (tokens, layout, components, dark mode)
│   ├── js/
│   │   ├── simulator-core.js        → Calculation engine (CONSTANTS, DEFAULTS, RANGES, calcOutputs, calcScenarioVariants)
│   │   ├── export-utils.js          → CSV builder + file download helper
│   │   ├── theme.js                 → Light/dark/system theme with localStorage persistence
│   │   ├── app-shell.js             → Sidebar collapse, mobile toggle, active nav
│   │   ├── toast.js                 → Lightweight toast notifications
│   │   ├── chart-bar.js             → DOM-based bar chart (replaces Recharts)
│   │   ├── value-simulator.js       → Page driver for Value Simulator
│   │   └── scaling-ai-framework.js  → Page driver + jsPDF export for Scaling AI Framework
│   ├── vendor/
│   │   ├── jspdf.min.js             → jsPDF 2.5.2
│   │   └── jspdf.plugin.autotable.min.js → jsPDF-AutoTable 3.8.4
│   └── svg/logo-kpmg.svg            → App logo
└── README.md                        → This file
```

## Running Locally

Any static HTTP server will work:

```bash
npx serve architectflow-html
# or
python -m http.server 8000 --directory architectflow-html
```

## Deploying to Firebase Hosting

```bash
cd architectflow-html
firebase deploy --only hosting
```

## Design Decisions

- **Zero runtime frameworks.** No React, Next.js, or Tailwind at runtime.
- **IIFE modules.** Each `.js` file exposes a single namespace via IIFE pattern.
- **1:1 parity.** Simulator formulas in `simulator-core.js` match the original `calcOutputs.ts` exactly.
- **Theme persistence.** Uses `localStorage` key `architectflow-theme` and `html.dark` class — same as the original.
- **PDF export.** Value Simulator uses browser print dialog; Scaling AI uses jsPDF + autoTable.
