# ArchitectFlow Discover Gate 1 Rebuild Master Plan

**Document version:** 1.0  
**Date:** 2026-04-24  
**Status:** Planning Baseline / Ready for Delivery Breakdown  
**Project:** ArchitectFlow - Discover Site Rebuild  
**Module:** `/discover/`  
**Prepared for:** KPMG Vietnam Innovation / ArchitectFlow delivery team  

---

## Table of Contents

1. Executive Summary  
2. Document Purpose and Scope  
3. Business Requirements Document (BRD)  
4. Product Requirements Document (PRD)  
5. User Experience and CX Principles  
6. Solution Options and Recommendation  
7. Current-State Assessment  
8. Target-State Product Blueprint  
9. Functional Requirements  
10. Non-Functional Requirements  
11. Technical Design and Architecture  
12. Data Model and XLSX-to-App Pipeline  
13. Information Architecture and UI Specification  
14. State Management and Calculation Model  
15. Content, Copy, and KPMG Style Rules  
16. Delivery Plan and Workstreams  
17. Ticket Breakdown  
18. QA Strategy and Test Cases  
19. Risks, Assumptions, Dependencies, and Mitigations  
20. Acceptance Criteria and Definition of Done  
21. Rollout and Post-Launch Plan  
22. Appendix A - Screen-Level Acceptance Criteria  
23. Appendix B - Data Contract Draft  
24. Appendix C - Example Sprint Plan  

---

# 1. Executive Summary

ArchitectFlow's current Discover module is a prototype-oriented 6-step flow designed around a generic pain point -> workflow -> sizing -> portfolio -> blueprint pattern. That architecture is no longer fit for purpose for the intended Partner-facing experience. The new target is a Gate 1 advisory experience built around business context, service line selection, management goals, operational focus areas, and a benchmark-backed AI Focus Signal.

The required delivery is **not** a cosmetic redesign. It is a controlled rebuild of the Discover module while preserving the existing ArchitectFlow shell, navigation model, theme behavior, visual token system, and overall interaction language used across Discover, Current Process, Value Case, and Scale Model.

The recommended approach is to keep the outer shell and shared UI framework intact, but replace the Discover engine end-to-end:

- Replace the current 6-step prototype logic with a 4-step Gate 1 flow.
- Replace hardcoded prototype data with a structured data layer generated from the provided XLSX workbook.
- Replace generic workflow savings logic with a benchmark-backed calculation engine.
- Replace the current output with a Partner-ready AI Focus Signal management view.
- Enforce KPMG-aligned tone, executive clarity, low cognitive load, evidence-backed output, and complete UI/UX consistency with the rest of the site.

This master plan provides the business case, product definition, technical design, implementation roadmap, detailed ticket structure, QA strategy, acceptance criteria, and rollout plan required to execute delivery with limited ambiguity.

---

# 2. Document Purpose and Scope

## 2.1 Purpose

This document is the single planning baseline for all functions involved in delivery:

- Business stakeholders
- Product owner
- BA / PM
- UX / UI designer
- Front-end developer
- Data / transformation developer
- QA / UAT owner
- Delivery lead

It is intended to serve as:

- BRD
- PRD
- Technical implementation plan
- Ticket source pack
- QA and UAT baseline
- Release readiness checklist

## 2.2 Scope Statement

This plan covers the rebuild of the **Discover** module only.

### In scope

- Rebuild Discover from current 6-step prototype to 4-step Gate 1 flow
- Preserve ArchitectFlow app shell and shared visual system
- Refactor data layer to consume structured workbook-derived data
- Build modular JS architecture for state, rendering, calculations, and data consumption
- Implement desktop-first Partner experience with mobile-safe fallback
- Implement benchmark-backed AI Focus Signal output
- Introduce new persistence model for Discover state
- Deliver test cases, ticket breakdown, rollout sequencing, and UAT criteria

### Out of scope

- Redesign of top-level shell across all modules
- Rebuild of Current Process, Value Case, or Scale Model
- Backend/API/database implementation
- Authentication and user profiles
- Multi-user collaboration
- Enterprise analytics instrumentation beyond basic hooks
- Advanced PDF/branded export workflows

---

# 3. Business Requirements Document (BRD)

## 3.1 Business Problem

The current Discover experience does not adequately support senior Partner conversations because:

- It behaves like an internal prototype rather than an advisory experience.
- The flow is too operationally generic and not sufficiently aligned to function/service context.
- The result is not benchmark-evidenced enough for management conversations.
- The experience does not fully reflect the intended Gate 1 structure defined by the supplied HTML and XLSX sources.
- The current data model is hardcoded and not maintainable for future content updates.

## 3.2 Business Objective

Create a Discover experience that enables Partners and senior stakeholders to rapidly identify high-potential AI focus areas in a credible, structured, KPMG-styled advisory flow.

## 3.3 Business Goals

1. Increase credibility of Discover output for management discussion.
2. Reduce time required for a Partner to understand business relevance.
3. Align Discover with the operating logic in the provided workbook.
4. Ensure consistency with other ArchitectFlow modules.
5. Reduce long-term maintenance cost by externalizing source data.

## 3.4 Success Measures

### Primary success metrics

- Partner can complete the flow in under 5 minutes on desktop.
- Each step clearly communicates step context, selected context, and business implication.
- Output clearly shows benchmark-backed reasoning and next-step direction.
- No shell regression across adjacent modules.

### Secondary success metrics

- Workbook update can be applied without manual recoding of large data objects.
- QA can trace any output metric back to workbook-derived logic.
- UX acceptance confirms Discover feels consistent with the rest of ArchitectFlow.

## 3.5 Stakeholders

- Sponsor: Innovation leadership / Partner stakeholders
- Product owner: ArchitectFlow owner
- Delivery owner: PM / BA lead
- Design owner: UX/UI lead
- Engineering owner: Front-end developer
- QA owner: QA / UAT lead

## 3.6 Business Constraints

- Must remain within static site architecture currently used by the repo.
- Must preserve visual alignment with current ArchitectFlow shell.
- Must not introduce framework migration risk.
- Must remain usable for senior non-technical audiences.
- Must use the workbook as data source of truth.

## 3.7 Key Business Decisions Already Made

- Option selected: rebuild Discover inner module while keeping existing shell.
- UX target is Gate 1 flow, not the current prototype flow.
- Desktop-first is the primary operating assumption.
- Evidence-backed output is mandatory.

---

# 4. Product Requirements Document (PRD)

## 4.1 Product Vision

Discover should behave as a **guided executive advisory experience** that helps a Partner move from business context to prioritized AI opportunity signal in a concise, credible, visually consistent workflow.

## 4.2 Product Outcome

At the end of the flow, the user should have:

- a selected function and service context,
- a set of management priorities,
- a narrowed set of work focus areas,
- a quantified AI Focus Signal,
- benchmark evidence,
- and a recommended next path into process mapping.

## 4.3 Product Principles

- Management-first, not feature-first
- Guidance over exploration overload
- Evidence over visual novelty
- Consistency over one-off design treatment
- Desktop-first, mobile-safe
- Advisory tone over consumer tone

## 4.4 Target Users

### Primary users

- KPMG Partners
- senior client-facing advisory leads
- innovation leadership

### Secondary users

- internal consulting teams facilitating workshops
- project teams preparing value framing

## 4.5 Core User Jobs

1. Understand whether this function/service area is a good AI candidate.
2. Narrow down where to focus first.
3. Produce a credible management signal with benchmark support.
4. Transition into deeper process analysis.

## 4.6 User Needs

- fast comprehension
- minimal friction
- business language instead of technical jargon
- a clear output they can discuss immediately
- enough evidence to trust the signal

## 4.7 Product Features

### Feature group A - Context definition
- function selection
- service filtering
- contextual helper language

### Feature group B - Goal framing
- management goal selection
- contextual examples per function/service
- limit of 2 selected goals

### Feature group C - Focus identification
- service area accordions
- task chips
- workload sliders
- live summary/cart
- desktop right-hand context panel

### Feature group D - AI Focus Signal
- total impact metrics
- per-area impact cards
- benchmark range / source / confidence
- CTA to next module
- downloadable text summary

---

# 5. User Experience and CX Principles

## 5.1 Executive-first clarity

Every screen must answer within five seconds:

- Where am I in the flow?
- What have I selected?
- What is the business implication?

## 5.2 Low cognitive load

- 4 steps only
- 1 main task per step
- progressive disclosure
- controls appear only when needed
- no spreadsheet-like visual clutter

## 5.3 KPMG advisory tone

The interface copy must be:

- objective
- credible
- concise
- business-facing
- management-summary-led

## 5.4 Evidence-backed output

Every material impact output should be traceable to benchmark logic and source confidence.

## 5.5 Consistency over novelty

The Discover rebuild must feel native to ArchitectFlow, not imported from a separate microsite.

## 5.6 Desktop-first, mobile-safe

Desktop is the primary experience. Mobile must remain structurally intact and usable, but does not need to match the full desktop richness.

## 5.7 Consultative CTA design

The final page must position the result as a decision support signal and transition naturally to Current Process mapping.

---

# 6. Solution Options and Recommendation

## Option 1 - Light refactor of current Discover

**Description:** Keep current flow, lightly adapt labels, cards, and data.

**Pros**
- Faster superficial delivery
- Lower immediate coding effort

**Cons**
- Wrong IA
- Wrong mental model
- High technical debt
- Difficult to align with workbook logic
- High regression risk from mixed legacy and target logic

**Decision:** Reject.

## Option 2 - Full Discover inner rebuild, preserve shell

**Description:** Replace step flow, data layer, state, rendering, and calculations while keeping shared shell and design language.

**Pros**
- Correct architecture
- Best long-term maintainability
- Full alignment with target UX and workbook
- Lowest visual inconsistency risk

**Cons**
- Medium-high effort
- Requires disciplined ticket sequencing

**Decision:** Approve.

## Option 3 - Port target HTML almost as-is

**Description:** Drop in the provided target HTML and adapt quickly.

**Pros**
- Fastest path to visual similarity

**Cons**
- Creates a site-in-site effect
- Breaks consistency with shell patterns
- Duplicates logic and styling
- Harder to maintain

**Decision:** Reject.

## Recommendation

Proceed with **Option 2**.

---

# 7. Current-State Assessment

## 7.1 Current implementation summary

The current Discover module is built with:

- `discover/index.html`
- `assets/js/discover.js`
- `assets/js/discover-data.js`
- `assets/css/pages/discover.css`

The current flow is built around:

- function selection
- pain area selection
- workflow selection
- per-workflow sizing
- portfolio summary
- blueprint summary

## 7.2 Current-state issues

1. Incorrect product flow vs target Gate 1
2. Data is hardcoded and generic
3. Pain/workflow model does not map to target service-area/task model
4. Output lacks benchmark evidence depth
5. Result framing is not Partner-ready enough
6. Persistence model is tied to legacy state shape

## 7.3 Current-state strengths to preserve

1. Shared shell structure
2. Shared theme system
3. Shared navigation and route behavior
4. Existing modular page CSS pattern
5. Static site simplicity

---

# 8. Target-State Product Blueprint

## 8.1 Step 1 - Function and Service

**Purpose:** Establish business operating context.

**Expected UI elements:**
- executive hero
- function cards
- dynamic service list after function selection
- contextual note on illustrative management scope

**Rules:**
- user cannot proceed without function and service
- service list filtered by selected function
- state selections must be visually clear but restrained

## 8.2 Step 2 - Goals

**Purpose:** Capture management priorities.

**Expected UI elements:**
- 4 goal cards
- maximum 2 selections
- dynamic helper text/examples based on chosen context

**Rules:**
- goals are outcome statements, not operational pain statements
- wording must stay business-led

## 8.3 Step 3 - Identify the Work

**Purpose:** Isolate candidate work areas worth prioritizing.

**Expected UI elements:**
- service area accordions
- task chips
- sliders per selected area
- desktop summary sidebar
- mobile sticky summary strip
- live subtotaling

**Rules:**
- sliders shown only after area/task selection
- avoid overwhelming controls
- keep flow consultative, not analytical overload

## 8.4 Step 4 - AI Focus Signal

**Purpose:** Produce one-page management-ready prioritization output.

**Expected UI elements:**
- total impact hero
- hours saved, annual value, FTE equivalent
- per-area detail cards
- benchmark ranges, source, confidence
- CTA to Current Process
- summary download

**Rules:**
- output must be interpretable in under one minute
- metric hierarchy: total signal first, evidence second

---

# 9. Functional Requirements

## FR-01 Function selection
System shall display available function cards and allow single selection.

## FR-02 Service filtering
System shall display only services relevant to the selected function.

## FR-03 Step progression guard
System shall prevent movement to the next step until the current step has valid required input.

## FR-04 Goal selection
System shall allow selection of up to two goals.

## FR-05 Goal contextualization
System shall surface helper examples or guidance based on selected function/service.

## FR-06 Service area display
System shall display service areas relevant to the selected service context.

## FR-07 Task chip selection
System shall allow task selection within each service area.

## FR-08 Area configuration controls
System shall show people/frequency/time sliders for selected areas only.

## FR-09 Live recalculation
System shall recalculate impact metrics live when configuration changes.

## FR-10 Summary cart
System shall show current selected focus areas and aggregate totals in a persistent summary component.

## FR-11 Benchmark aggregation
System shall aggregate benchmarks from the selected task-capability mapping.

## FR-12 Benchmark fallback
System shall apply fallback benchmark rules where benchmark coverage is incomplete.

## FR-13 AI Focus Signal output
System shall render a results view containing totals, per-area signals, and evidence metadata.

## FR-14 Download summary
System shall allow download of a plain-text summary of the generated Focus Signal.

## FR-15 Reset / restart
System shall allow user to restart or reconfigure the flow without refreshing the page.

## FR-16 Persistence
System shall persist current session state locally using a new versioned key.

## FR-17 Migration isolation
System shall not restore old legacy Discover state into the new module.

## FR-18 Current Process handoff
System shall provide a clear CTA from the Focus Signal to the Current Process module.

---

# 10. Non-Functional Requirements

## NFR-01 Consistency
Must align visually and behaviorally with existing ArchitectFlow shell and patterns.

## NFR-02 Maintainability
Data updates must not require large manual code edits.

## NFR-03 Performance
Page interactions should feel immediate under standard desktop browser conditions.

## NFR-04 Accessibility
Keyboard navigation, focus visibility, contrast, and semantic markup are mandatory.

## NFR-05 Responsiveness
Desktop must be optimized; tablet and mobile must remain fully usable.

## NFR-06 Traceability
Major outputs must be traceable to workbook-derived data and formula logic.

## NFR-07 Resilience
Invalid workbook mappings should fail at build/validation time rather than silently in UI.

## NFR-08 No framework migration
The solution must remain within the static HTML/CSS/vanilla JS architecture.

---

# 11. Technical Design and Architecture

## 11.1 Architectural principle

Retain the current shell and shared assets. Rebuild the Discover engine as a modular page application within the existing static architecture.

## 11.2 Proposed front-end modules

### `assets/js/discover.js`
Bootstrap/controller layer.

Responsibilities:
- initialize page
- wire modules together
- bind user events
- coordinate navigation
- trigger render/update cycle

### `assets/js/discover-gate1-state.js`
State model and transition layer.

Responsibilities:
- define state structure
- step guards
- update selection state
- reset/migration handling
- persistence handling

### `assets/js/discover-gate1-calc.js`
Pure calculation layer.

Responsibilities:
- workload math
- benchmark aggregation
- annual value calculations
- FTE calculations
- formatting helpers where appropriate

### `assets/js/discover-gate1-render.js`
Render/UI composition layer.

Responsibilities:
- render steps
- render selected summaries
- render result cards
- update button states
- manage progressive disclosure

### `assets/js/discover-gate1-data.js` or `assets/data/discover-gate1-data.json`
Generated source data artifact.

Responsibilities:
- expose normalized data object to the app
- contain only generated, validated, canonical data

### `scripts/build_discover_data.py`
Data transformation/validation script.

Responsibilities:
- ingest XLSX
- normalize sheets
- validate mappings
- emit build artifact

## 11.3 File strategy

### Existing files to modify
- `discover/index.html`
- `assets/css/pages/discover.css`
- `assets/js/discover.js`

### New files to add
- `assets/js/discover-gate1-state.js`
- `assets/js/discover-gate1-calc.js`
- `assets/js/discover-gate1-render.js`
- `assets/js/discover-gate1-data.js` or `assets/data/discover-gate1-data.json`
- `scripts/build_discover_data.py`

### Existing file to deprecate or repurpose
- `assets/js/discover-data.js`

## 11.4 Design constraints

- No React/Vue introduction
- No copied inline HTML app from the source prototype
- No duplicate shell structures
- No hardcoded large data objects in business logic files

---

# 12. Data Model and XLSX-to-App Pipeline

## 12.1 Source of truth

The workbook is the authoritative source for business data. The target HTML is the authoritative source for target interaction concept and screen logic, but not for long-term maintainable data storage.

## 12.2 Canonical entities

```js
{
  functions: [],
  servicesByFunction: {},
  goals: [],
  goalExamplesByFunction: {},
  serviceAreas: [],
  serviceAreaMeta: {},
  taskPatterns: {},
  taskMapByService: {},
  capabilityBenchmarks: {},
  capabilityPatternMeta: {},
  headcountByFunctionService: {}
}
```

## 12.3 Transformation pipeline

1. Read workbook file.
2. Load relevant sheets.
3. Normalize headers.
4. Normalize textual keys.
5. Generate stable IDs.
6. Validate cross-sheet referential integrity.
7. Generate canonical artifact.
8. Fail build if critical mapping breaks.

## 12.4 Normalization rules

- all IDs in slug format
- trim whitespace aggressively
- preserve human-readable labels separately
- deduplicate tasks by service-area-specific identity, not only label text
- benchmark ranges stored as numeric min/max/midpoint
- source and confidence retained in each benchmark object
- fallback benchmark not stored in data artifact; managed in calculation layer

## 12.5 Validation rules

Build must fail if:
- a service has no parent function
- a task has no service area mapping
- a capability benchmark record is malformed
- duplicate primary identifiers are created
- headcount context cannot map to selected context

## 12.6 Recommended artifact format

Prefer generated JS object if current static architecture already expects script-first inclusion.
If team prefers clearer separation, use JSON plus a lightweight loader.

**Recommendation:** generated JS object file for lowest integration friction.

---

# 13. Information Architecture and UI Specification

## 13.1 Global page behavior

- keep current shell
- keep sidebar and topbar
- keep theme toggle
- keep route behavior
- keep sticky bottom actions pattern
- ensure step number and section title are always visible in content area

## 13.2 Layout model

### Desktop
- main content column + right context/sidebar panel for Step 3 and Step 4
- generous whitespace
- restrained accent colors
- clear metric hierarchy

### Tablet
- content-first stack with summary block beneath or above depending on step

### Mobile
- single column
- sticky summary strip replaces right rail
- simplified density and spacing

## 13.3 Step-level IA

### Step 1
- hero
- function selection area
- service selection area
- context helper

### Step 2
- step intro
- goal cards
- contextual helper block

### Step 3
- step intro
- service area accordion list
- task chips in each accordion
- per-area sliders after selection
- right summary sidebar or sticky strip

### Step 4
- result hero
- key metrics row
- detailed area signal cards
- benchmark support block
- next-step CTA
- download/reset actions

## 13.4 Visual language requirements

- cards cleaner and more premium than the target prototype HTML
- muted borders
- restrained highlight fills
- strong numeric emphasis
- minimal decorative noise
- typography must feel aligned with existing ArchitectFlow shell

---

# 14. State Management and Calculation Model

## 14.1 Proposed state shape

```js
state = {
  step: 1,
  functionId: null,
  functionLabel: '',
  serviceId: null,
  serviceLabel: '',
  selectedGoals: [],
  selections: [
    {
      areaId: '',
      areaLabel: '',
      tasks: [],
      people: 0,
      freq: 0,
      avgMin: 0,
      capabilities: [],
      benchmark: {
        min: 0,
        max: 0,
        midpoint: 0,
        source: '',
        confidence: ''
      },
      monthlyHours: 0,
      annualValue: 0
    }
  ],
  totals: {
    monthlyHours: 0,
    annualValue: 0,
    monthlyFTE: 0
  }
}
```

## 14.2 State rules

- no direct mutation from render layer
- each area selection identified by `areaId`
- tasks can update capability set without destroying user-entered slider values unnecessarily
- derived totals recalculated from source state, not manually stored unless cached centrally in one place
- step progression based on explicit validation rules

## 14.3 Persistence rules

- storage key: `architectflow.discover.gate1.v2`
- do not hydrate old `architectflow.discover.v1`
- schema mismatch => hard reset
- restore only if state passes validation

## 14.4 Calculation formulas

- `workloadHours = people * freq * (avgMin / 60)`
- `savingRate = average(midpoint of applicable benchmarks)`
- `monthlyHoursSaved = workloadHours * savingRate`
- `annualValue = monthlyHoursSaved * hourlyRate * 12`
- `monthlyFTE = monthlyHoursSaved / monthlyCapacityHours`

## 14.5 Benchmark logic

For each selected area:

1. collect tasks
2. resolve capabilities
3. deduplicate capabilities
4. fetch benchmark rows
5. compute min/max/midpoint aggregate
6. preserve source + confidence metadata
7. if no applicable benchmark coverage, fallback to 35%

## 14.6 Guardrails

- clamp slider ranges
- prevent divide-by-zero
- use safe defaults for empty selection states
- mark fallback usage visually as estimated rather than benchmark-backed

---

# 15. Content, Copy, and KPMG Style Rules

## 15.1 Tone rules

Copy must be:
- management-ready
- advisory
- concise
- evidence-oriented
- calm and confident

## 15.2 Avoid

- hype language
- consumer language
- gamified wording
- excessive AI jargon
- casual CTA phrasing

## 15.3 Copy rewrite targets

- hero subtitle
- step instructions
- helper text
- benchmark labels
- result section titles
- CTA labels
- download summary wording

## 15.4 Example direction

### Weak
"Pick the tasks AI should automate first."

### Better
"Identify the work areas where AI could create the strongest operational signal first."

### Weak
"Your AI blueprint is ready."

### Better
"Your AI Focus Signal is ready for management review."

---

# 16. Delivery Plan and Workstreams

## Workstream A - Product and UX alignment

**Objective:** Lock product flow, content model, screen behavior, and acceptance criteria.

**Outputs:**
- approved step logic
- approved content model
- approved UI acceptance rules
- approved tone/copy direction

## Workstream B - Data engineering

**Objective:** Create workbook transformation pipeline and validated canonical data artifact.

**Outputs:**
- transformation script
- validation logic
- generated data asset
- data dictionary

## Workstream C - Front-end architecture

**Objective:** Establish modular JS structure and step/state/render lifecycle.

**Outputs:**
- bootstrap controller
- state module
- render module
- calc module

## Workstream D - UI implementation

**Objective:** Rebuild step-by-step Discover interface in ArchitectFlow shell.

**Outputs:**
- rewritten `discover/index.html`
- rewritten `discover.css`
- interactive step flow

## Workstream E - Results and handoff

**Objective:** Build AI Focus Signal and next-step transition.

**Outputs:**
- result screen
- benchmark evidence cards
- download summary
- Current Process CTA

## Workstream F - QA and hardening

**Objective:** Validate correctness, UX, consistency, and stability.

**Outputs:**
- functional test pass
- workbook trace validation
- responsive pass
- regression pass

---

# 17. Ticket Breakdown

## 17.1 Epic structure

### EPIC-01 Product foundation and acceptance alignment
### EPIC-02 Data pipeline and validation
### EPIC-03 Discover front-end architecture rebuild
### EPIC-04 Discover UI and interaction implementation
### EPIC-05 AI Focus Signal and handoff output
### EPIC-06 QA, UAT, and hardening

---

## 17.2 Detailed tickets

## EPIC-01 Product foundation and acceptance alignment

### TKT-001 Confirm Gate 1 scope baseline
**Type:** BA/PM  
**Priority:** P0  
**Description:** Freeze the 4-step Discover scope, confirm in-scope/out-of-scope boundaries, and lock option 2 as the approved implementation direction.  
**Deliverables:** signed-off scope summary, updated assumptions log.  
**Dependencies:** none.

### TKT-002 Create step-level acceptance matrix
**Type:** BA/UX  
**Priority:** P0  
**Description:** Define acceptance criteria for each step, including progression guards, visibility rules, result rules, and edge states.  
**Deliverables:** step acceptance matrix.  
**Dependencies:** TKT-001.

### TKT-003 Approve KPMG copy and tone rules
**Type:** UX/Content  
**Priority:** P1  
**Description:** Establish copy standards for hero text, step copy, result labels, benchmark evidence blocks, and CTA language.  
**Deliverables:** copy guidelines and approved text patterns.  
**Dependencies:** TKT-001.

---

## EPIC-02 Data pipeline and validation

### TKT-010 Map workbook sheets to canonical entities
**Type:** BA/Data  
**Priority:** P0  
**Description:** Define exact mapping between workbook sheets and application entities.  
**Deliverables:** entity-to-sheet mapping table.  
**Dependencies:** TKT-001.

### TKT-011 Build workbook transformation script
**Type:** Dev  
**Priority:** P0  
**Description:** Create `scripts/build_discover_data.py` to transform XLSX into canonical data artifact.  
**Deliverables:** runnable script.  
**Dependencies:** TKT-010.

### TKT-012 Implement validation rules in transformation pipeline
**Type:** Dev  
**Priority:** P0  
**Description:** Add validation for missing relationships, duplicate IDs, malformed benchmark records, and headcount mismatches.  
**Deliverables:** validation checks with fail-fast behavior.  
**Dependencies:** TKT-011.

### TKT-013 Generate first canonical data artifact
**Type:** Dev  
**Priority:** P0  
**Description:** Produce initial generated data file and verify it can be loaded by front-end code.  
**Deliverables:** `discover-gate1-data.js` or equivalent.  
**Dependencies:** TKT-011, TKT-012.

### TKT-014 Create data dictionary
**Type:** BA/Dev  
**Priority:** P1  
**Description:** Document all canonical fields, IDs, and benchmark semantics.  
**Deliverables:** data dictionary appendix or separate md.  
**Dependencies:** TKT-013.

---

## EPIC-03 Discover front-end architecture rebuild

### TKT-020 Create modular Discover JS structure
**Type:** Dev  
**Priority:** P0  
**Description:** Introduce state, calc, render, and data modules and refactor `discover.js` into controller/bootstrap role.  
**Deliverables:** modular JS structure.  
**Dependencies:** TKT-013.

### TKT-021 Define new Discover state model
**Type:** Dev  
**Priority:** P0  
**Description:** Implement state shape, step guards, selection update logic, and reset behavior.  
**Deliverables:** state module.  
**Dependencies:** TKT-020.

### TKT-022 Implement local persistence v2
**Type:** Dev  
**Priority:** P1  
**Description:** Add versioned persistence for the new state and ensure no legacy state is rehydrated.  
**Deliverables:** persistence logic.  
**Dependencies:** TKT-021.

### TKT-023 Implement calculation engine
**Type:** Dev  
**Priority:** P0  
**Description:** Build pure functions for workload, benchmark aggregation, savings, annual value, and FTE logic.  
**Deliverables:** calc module with testable pure functions.  
**Dependencies:** TKT-013, TKT-020.

---

## EPIC-04 Discover UI and interaction implementation

### TKT-030 Rewrite Discover page structure
**Type:** Dev  
**Priority:** P0  
**Description:** Replace the current step content in `discover/index.html` with the new 4-step structure while preserving shell.  
**Deliverables:** updated HTML structure.  
**Dependencies:** TKT-002, TKT-020.

### TKT-031 Rebuild Discover page CSS
**Type:** Dev/UI  
**Priority:** P0  
**Description:** Rewrite page-level CSS to support the new layout, desktop sidebar, sticky summary strip, and result hierarchy.  
**Deliverables:** updated `discover.css`.  
**Dependencies:** TKT-030.

### TKT-032 Implement Step 1 - Function and Service
**Type:** Dev  
**Priority:** P0  
**Description:** Render function cards, service filtering, and next-step guard logic.  
**Deliverables:** working Step 1.  
**Dependencies:** TKT-030, TKT-020.

### TKT-033 Implement Step 2 - Goals
**Type:** Dev  
**Priority:** P0  
**Description:** Render goals, apply max-2 selection rule, and show contextual helper text.  
**Deliverables:** working Step 2.  
**Dependencies:** TKT-032.

### TKT-034 Implement Step 3 - Service area accordion
**Type:** Dev  
**Priority:** P0  
**Description:** Render relevant service areas and accordion expand/collapse behavior.  
**Deliverables:** working accordion layer.  
**Dependencies:** TKT-033.

### TKT-035 Implement task chip selection and area configuration UI
**Type:** Dev  
**Priority:** P0  
**Description:** Build task chips, reveal configuration sliders on selection, and preserve user-entered values.  
**Deliverables:** area configuration behavior.  
**Dependencies:** TKT-034, TKT-023.

### TKT-036 Implement desktop summary sidebar and mobile sticky summary strip
**Type:** Dev  
**Priority:** P1  
**Description:** Render ongoing selection summary and live totals in responsive variants.  
**Deliverables:** desktop and mobile summary components.  
**Dependencies:** TKT-035.

### TKT-037 Implement step navigation and sticky actions
**Type:** Dev  
**Priority:** P1  
**Description:** Ensure next/back behavior, disabled states, validation gating, and scroll management all work correctly.  
**Deliverables:** navigation control behavior.  
**Dependencies:** TKT-032 to TKT-036.

---

## EPIC-05 AI Focus Signal and handoff output

### TKT-040 Implement Step 4 total impact hero
**Type:** Dev  
**Priority:** P0  
**Description:** Render annual impact, monthly hours saved, and FTE equivalent in executive hierarchy.  
**Deliverables:** total signal hero section.  
**Dependencies:** TKT-023, TKT-035.

### TKT-041 Implement per-area signal cards
**Type:** Dev  
**Priority:** P0  
**Description:** Render per-area cards showing tasks, benchmark range, source, confidence, and annual contribution.  
**Deliverables:** detail cards.  
**Dependencies:** TKT-040.

### TKT-042 Implement benchmark evidence presentation rules
**Type:** Dev/UX  
**Priority:** P1  
**Description:** Visually distinguish benchmark-backed vs fallback-estimated cases.  
**Deliverables:** evidence styling logic.  
**Dependencies:** TKT-041.

### TKT-043 Implement Current Process handoff CTA
**Type:** Dev  
**Priority:** P1  
**Description:** Add clear next-step transition CTA aligned with consultative flow.  
**Deliverables:** CTA block.  
**Dependencies:** TKT-040.

### TKT-044 Implement downloadable summary
**Type:** Dev  
**Priority:** P1  
**Description:** Generate plain-text summary with context, area details, and totals.  
**Deliverables:** download action.  
**Dependencies:** TKT-040, TKT-041.

### TKT-045 Implement restart/reconfigure path
**Type:** Dev  
**Priority:** P1  
**Description:** Allow users to revise selections without page reload and without stale state issues.  
**Deliverables:** reset/reconfigure logic.  
**Dependencies:** TKT-037.

---

## EPIC-06 QA, UAT, and hardening

### TKT-050 Functional QA execution
**Type:** QA  
**Priority:** P0  
**Description:** Execute all functional test cases against the rebuilt module.  
**Deliverables:** QA result log.  
**Dependencies:** TKT-045.

### TKT-051 Workbook traceability validation
**Type:** QA/BA  
**Priority:** P0  
**Description:** Validate representative result outputs against workbook-derived logic.  
**Deliverables:** traceability sheet.  
**Dependencies:** TKT-050.

### TKT-052 Responsive and accessibility pass
**Type:** QA/UX  
**Priority:** P1  
**Description:** Validate desktop, tablet, mobile, keyboard navigation, focus states, and contrast.  
**Deliverables:** responsive/accessibility report.  
**Dependencies:** TKT-050.

### TKT-053 Regression check against adjacent modules
**Type:** QA  
**Priority:** P0  
**Description:** Confirm no regressions to shell, theme, navigation, or cross-module links.  
**Deliverables:** regression sign-off.  
**Dependencies:** TKT-050.

### TKT-054 UAT with Partner-facing reviewers
**Type:** PM/QA/Stakeholder  
**Priority:** P0  
**Description:** Conduct UAT and obtain approval against executive-readiness criteria.  
**Deliverables:** UAT sign-off.  
**Dependencies:** TKT-051, TKT-052, TKT-053.

---

# 18. QA Strategy and Test Cases

## 18.1 Test strategy

Testing will be performed across four layers:

1. Data transformation validation
2. Functional flow validation
3. UX/responsive/accessibility validation
4. Regression validation

## 18.2 Sample functional test cases

### TC-001 Function selection loads correctly
**Precondition:** Page opens fresh.  
**Steps:** Open Discover. Observe function cards. Select one function.  
**Expected:** Selected state appears. Service list is filtered and displayed. Next remains disabled until service is selected.

### TC-002 Step 1 progression guard
**Steps:** Select function only. Attempt Next.  
**Expected:** Progress blocked.

### TC-003 Service selection enables progression
**Steps:** Select function and service.  
**Expected:** Next enabled.

### TC-004 Goal maximum selection rule
**Steps:** Select three goals.  
**Expected:** Third selection blocked or prior state handled according to design rule; max active goals remain 2.

### TC-005 Contextual helper text updates
**Steps:** Change function/service. Move to Step 2.  
**Expected:** Goal helper content changes according to context.

### TC-006 Relevant service areas render only for selected context
**Steps:** Select function/service. Go to Step 3.  
**Expected:** Only mapped service areas appear.

### TC-007 Accordion interaction
**Steps:** Expand and collapse service area sections.  
**Expected:** Interaction is stable, no layout break, aria-expanded updates.

### TC-008 Task chip selection reveals configuration
**Steps:** Select one task under a service area.  
**Expected:** Area configuration controls appear for that selected area only.

### TC-009 Multiple area selection updates summary sidebar
**Steps:** Select tasks across multiple areas.  
**Expected:** Summary sidebar/sticky strip lists all current selections and live totals.

### TC-010 Slider updates recalculate totals
**Steps:** Change people, frequency, and time values.  
**Expected:** Per-area and aggregate metrics recalculate immediately and correctly.

### TC-011 Benchmark fallback behavior
**Steps:** Use a mapped case with no benchmark coverage.  
**Expected:** Fallback rate applied; UI marks estimate accordingly.

### TC-012 Step 4 result structure
**Steps:** Complete flow to results.  
**Expected:** Total signal hero, area cards, benchmark evidence, CTA, and download action all appear.

### TC-013 Download summary content
**Steps:** Trigger download.  
**Expected:** File contains selected context, selected areas, totals, and benchmark summary language.

### TC-014 Restart behavior
**Steps:** Use restart/reconfigure action.  
**Expected:** State resets cleanly with no stale totals or orphan selections.

### TC-015 Persistence restore
**Steps:** Configure flow partially or fully, refresh page.  
**Expected:** Valid state restores under v2 schema.

### TC-016 Legacy state isolation
**Precondition:** Legacy storage key exists.  
**Steps:** Open new Discover.  
**Expected:** Legacy state is ignored.

### TC-017 Current Process CTA routing
**Steps:** Click CTA from Step 4.  
**Expected:** Navigation moves correctly to Current Process route.

## 18.3 Data validation test cases

### TC-D01 Missing function-service mapping
Expected: build fails.

### TC-D02 Duplicate task identifier generation
Expected: build fails.

### TC-D03 Malformed benchmark row
Expected: build fails.

### TC-D04 Headcount mismatch
Expected: build fails or warning escalation according to severity rule.

### TC-D05 Midpoint calculation verification
Expected: generated midpoint equals validated arithmetic midpoint.

## 18.4 Responsive and accessibility cases

### TC-R01 Desktop right rail renders correctly above 1280px
### TC-R02 Tablet layout does not overflow at medium widths
### TC-R03 Mobile sticky strip remains visible and non-obstructive
### TC-A01 Keyboard can traverse actionable cards and controls
### TC-A02 Focus states remain visible in light and dark mode
### TC-A03 Contrast meets acceptable readability threshold
### TC-A04 Accordion state is announced correctly

---

# 19. Risks, Assumptions, Dependencies, and Mitigations

## 19.1 Risks

### Risk R1 - Data drift between workbook and UI
**Impact:** High  
**Mitigation:** transformation script, validation rules, canonical artifact versioning.

### Risk R2 - Imported design language diverges from ArchitectFlow shell
**Impact:** High  
**Mitigation:** preserve shared tokens, shared layout, existing shell, and no direct HTML port.

### Risk R3 - Step 3 becomes cognitively heavy
**Impact:** High  
**Mitigation:** progressive disclosure, accordion model, summary sidebar, minimal visible controls.

### Risk R4 - Benchmark evidence becomes hard to interpret
**Impact:** Medium  
**Mitigation:** visible source/confidence treatment and estimated-vs-backed distinction.

### Risk R5 - Legacy localStorage causes inconsistent state
**Impact:** Medium  
**Mitigation:** new versioned key and hard reset on mismatch.

### Risk R6 - CSS rewrite creates adjacent module regressions
**Impact:** Medium  
**Mitigation:** strict page-scoped class prefixes and regression QA.

## 19.2 Assumptions

- Workbook contains sufficient data to populate target flow.
- Existing shell assets are stable enough to preserve.
- Static front-end architecture remains the approved deployment approach.
- Desktop remains the dominant usage mode.

## 19.3 Dependencies

- Access to workbook source
- Agreement on final step copy
- Agreement on benchmark display rules
- Availability of QA/UAT reviewers

---

# 20. Acceptance Criteria and Definition of Done

## 20.1 Product acceptance criteria

The rebuild is accepted only if:

1. Discover no longer uses the legacy pain/workflow/portfolio model.
2. Discover follows the approved 4-step Gate 1 flow.
3. The rebuilt module feels fully native to ArchitectFlow shell and other modules.
4. The output reads like a Partner-ready management advisory signal.
5. Result metrics are derived from workbook-backed logic, not hand-maintained hardcoded structures.
6. Desktop experience is polished and stable; mobile remains usable.
7. No shell/theme/navigation regression is introduced.

## 20.2 Definition of done

Done means:
- code implemented
- generated data artifact validated
- functional QA passed
- responsive/accessibility pass completed
- workbook trace checks completed
- UAT signed off
- delivery notes documented

---

# 21. Rollout and Post-Launch Plan

## 21.1 Recommended rollout approach

### Phase 1 - Internal validation
Use feature branch or temporary route to validate without overwriting production Discover immediately.

### Phase 2 - Controlled UAT demo
Review with internal stakeholder group and selected Partner-facing reviewers.

### Phase 3 - Production swap
Promote new Discover into main route after sign-off.

## 21.2 Launch checks

- final workbook artifact generated
- route verified
- download summary verified
- cross-link to Current Process verified
- theme parity verified

## 21.3 Post-launch monitoring

Even in static architecture, team should manually review:
- browser compatibility
- content clarity feedback
- benchmark explanation confusion points
- requests for additional service mapping coverage

---

# 22. Appendix A - Screen-Level Acceptance Criteria

## Step 1 Acceptance
- shell preserved
- function cards readable and aligned with KPMG style
- service list appears only after function selection
- next disabled until context complete

## Step 2 Acceptance
- goals limited to 2
- helper content reflects selected context
- selection states clear and low-noise

## Step 3 Acceptance
- only relevant service areas shown
- accordion behavior smooth
- task chips selectable and deselectable
- sliders appear only when needed
- summary always visible in desktop or mobile equivalent
- live totals update correctly

## Step 4 Acceptance
- total signal visible above fold on desktop
- annual value, hours, and FTE prioritized visually
- per-area detail cards render clearly
- benchmark source and confidence visible
- CTA to Current Process visible
- download summary works

---

# 23. Appendix B - Data Contract Draft

```js
window.DiscoverGate1Data = {
  meta: {
    version: '1.0.0',
    generatedAt: 'ISO_TIMESTAMP',
    sourceWorkbook: 'Gate1_Mapping_Matrix.xlsx'
  },
  functions: [
    { id: 'audit', label: 'Audit' }
  ],
  servicesByFunction: {
    audit: [
      { id: 'external-audit', label: 'External Audit' }
    ]
  },
  goals: [
    { id: 'reduce-cycle-time', label: 'Reduce cycle time' }
  ],
  goalExamplesByFunction: {
    audit: ['Example text']
  },
  serviceAreas: [
    { id: 'research-analysis', label: 'Research & Analysis' }
  ],
  serviceAreaMeta: {
    'research-analysis': {
      description: '...',
      icon: '...'
    }
  },
  taskMapByService: {
    'external-audit': {
      'research-analysis': [
        {
          id: 'sample-task-id',
          label: 'Sample task',
          capabilities: ['retrieval', 'summarization']
        }
      ]
    }
  },
  capabilityBenchmarks: {
    retrieval: {
      min: 0.2,
      max: 0.4,
      midpoint: 0.3,
      source: 'Benchmark source',
      confidence: 'Medium'
    }
  },
  capabilityPatternMeta: {
    retrieval: {
      label: 'Retrieval',
      patternLabel: 'Knowledge retrieval'
    }
  },
  headcountByFunctionService: {
    audit: {
      'external-audit': 520
    }
  }
}
```

---

# 24. Appendix C - Example Sprint Plan

## Sprint 1
- TKT-001
- TKT-002
- TKT-010
- TKT-011
- TKT-012
- TKT-013
- TKT-020
- TKT-021
- TKT-023

## Sprint 2
- TKT-030
- TKT-031
- TKT-032
- TKT-033
- TKT-034
- TKT-035
- TKT-037

## Sprint 3
- TKT-036
- TKT-040
- TKT-041
- TKT-042
- TKT-043
- TKT-044
- TKT-045
- TKT-022

## Sprint 4
- TKT-050
- TKT-051
- TKT-052
- TKT-053
- TKT-054

---

# Final Recommendation

Do not attempt a superficial refactor.
Do not import the target HTML directly as a standalone experience.
Do not preserve the old Discover data model.

The correct delivery model is:

**Preserve ArchitectFlow shell and shared design system, rebuild Discover inner architecture completely, externalize data generation from workbook, and deliver a Partner-grade Gate 1 advisory experience with benchmark-backed AI Focus Signal output.**
