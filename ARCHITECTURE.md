# ArchitectFlow — Architecture Reference

Technical reference for the ArchitectFlow static HTML application.  
See `README.md` for quick start and deployment.

---

## CSS Token System

All design tokens live in `assets/css/tokens.css`.

| Token                             | Description                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| `--kpmg-primary`                  | Navy `#00205f` — buttons, links, headings                      |
| `--kpmg-secondary`                | Blue `#006397` — scenario labels                               |
| `--kpmg-background`               | Page background (light: `#fcf9f8`, dark: `#0a0a0a`)            |
| `--kpmg-surface-container-lowest` | Card backgrounds                                               |
| `--kpmg-accent-faster`            | Teal `#00b8a9` — Use Case axis                                 |
| `--kpmg-accent-deeper`            | Amber `#f39c12` — User axis                                    |
| `--kpmg-accent-positive`          | Green `#0f6e56` — positive trends                              |
| `--font-body / --font-display`    | Inter → system-ui → BlinkMacSystemFont → Segoe UI → sans-serif |
| `--navy-gradient`                 | Primary gradient for hero and buttons                          |

---

## Protected DOM IDs

These IDs are bound by JavaScript and **must not be renamed** without updating the corresponding JS file.

### Value Simulator (`value-simulator.js` + `simulator-ui.js`)

| ID                 | Purpose                                |
| ------------------ | -------------------------------------- |
| `scenario-tabs`    | Scenario chip render target            |
| `output-grid`      | Output metric cards render target      |
| `scenario-summary` | Scenario summary buttons render target |
| `key-assumptions`  | Assumptions list render target         |
| `sliders-faster`   | Use Case axis sliders render target    |
| `sliders-deeper`   | User axis sliders render target        |
| `hero-annualized`  | Hero: annualised return value          |
| `hero-monthly`     | Hero: monthly savings                  |
| `hero-users`       | Hero: active users                     |
| `hero-ftes`        | Hero: FTEs freed                       |
| `hero-cases`       | Hero: active use cases                 |
| `btn-save`         | Save scenario button                   |
| `btn-csv`          | Export CSV button                      |
| `btn-pdf`          | Export PDF button                      |
| `ready-badge`      | "Ready to Brief" badge                 |
| `ready-action`     | Badge: last action label               |
| `ready-time`       | Badge: timestamp                       |
| `chart-container`  | Bar chart render target                |

### Scaling AI Framework (`scaling-ai-framework.js`)

| ID                 | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `btn-export-pdf`   | Export PDF button (disabled during export)      |
| `btn-export-label` | Button label text ("Export PDF" / "Exporting…") |

---

## Data Flow — Value Simulator

```
User moves slider
     │
     ▼
inputs[key] = Number(el.value)          ← value-simulator.js
     │
     ▼
calcScenarioVariants(inputs)            ← simulator-core.js (pure)
     │
     ├─ currentState.outputs
     ├─ scale2x.outputs
     └─ fullAdoption.outputs
          │
          ▼
     updateAll()                        ← value-simulator.js
          │
          ├─ DOM: hero-annualized, hero-monthly, hero-users, hero-ftes, hero-cases
          ├─ DOM: [data-out-value], [data-out-suffix]  ← output cards
          ├─ DOM: [data-display]  ← slider value displays
          ├─ ChartBar.render()           ← chart-bar.js
          ├─ renderScenarioTabs()        ← simulator-ui.js
          ├─ renderScenarioSummary()     ← simulator-ui.js
          └─ renderKeyAssumptions()      ← simulator-ui.js
```

---

## Framework Content — Single Source of Truth

`assets/js/framework-data.js` exports `FrameworkData` with:

- `FOCUS_ITEMS` — 4 focus areas with trend direction
- `ACTION_GROUPS` — 3 teams with action items
- `SUPPORT` — firm support teams and tools text
- `QUESTIONS` — 5 strategic questions

Both the HTML renderer (`scaling-ai-framework.js`) and the PDF export use `FrameworkData` directly. To update framework content, edit only `framework-data.js`.

---

## Export Flows

### Value Simulator CSV

1. `handleExportCSV()` → `calcScenarioVariants(inputs)` → `ExportUtils.buildCSV(rows)` → `ExportUtils.downloadFile()`

### Value Simulator PDF

1. `handleExportPDF()` → builds inline HTML string → `window.open(blob URL, '_blank')` → `window.print()`
2. Fails gracefully if pop-ups are blocked (shows error toast, revokes URL immediately)

### Scaling AI Framework PDF

1. `handleExportPDF()` → `jsPDF` + `autoTable` → reads `FrameworkData.*` → `doc.save()`
2. Button disabled during export, re-enabled in `finally` block

---

## Hardening Notes (AF-04 to AF-08)

| Ticket | What was hardened                                                                  |
| ------ | ---------------------------------------------------------------------------------- |
| AF-04  | Skip-nav link, focus-visible ring, print rules, aria-live on hero                  |
| AF-05  | Framework content extracted to `framework-data.js` (single source)                 |
| AF-06  | Render functions extracted to `simulator-ui.js` (page driver slimmed to 230 lines) |
| AF-07  | revokeObjectURL timing fixed, QuotaExceededError guard in save handler             |
| AF-08  | localStorage wrapped in try/catch, font stack expanded with system fallbacks       |
