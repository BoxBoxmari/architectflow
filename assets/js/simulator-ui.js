/**
 * Simulator UI — Render functions and static definitions for Value Simulator.
 * Extracted from value-simulator.js (AF-06) so the page driver only handles
 * state, events, and exports.
 *
 * Depends on: simulator-core.js (SimulatorCore), chart-bar.js (ChartBar)
 * Exposes: SimulatorUI
 */

const SimulatorUI = (() => {
  'use strict';

  const { CONSTANTS, RANGES } = SimulatorCore;

  // ── Static definitions ────────────────────────────────────

  const SLIDER_DEFS = {
    faster: [
      {
        key: 'targetUseCaseCount',
        label: 'Target Use Case Count',
        hint: 'Number of AI use cases selected for scaled enablement.',
        format: v => '' + v,
        color: '#00B8A9'
      },
      {
        key: 'activationRate',
        label: 'Use Case Activation Rate',
        hint: 'Share of prioritised use cases expected to reach active deployment.',
        format: v => v + '%',
        color: '#00B8A9'
      },
      {
        key: 'tasksPerUserPerUseCasePerMonth',
        label: 'Tasks per User / Use Case / Month',
        hint: 'Average monthly task volume per active user for each active use case.',
        format: v => '' + v,
        color: '#00B8A9'
      },
    ],
    deeper: [
      {
        key: 'targetUserCount',
        label: 'Target User Count',
        hint: 'Number of professionals targeted for AI-enabled workflows.',
        format: v => v.toLocaleString(),
        color: '#F39C12'
      },
      {
        key: 'adoptionRate',
        label: 'User Adoption Rate',
        hint: 'Share of targeted users expected to use the workflow consistently.',
        format: v => v + '%',
        color: '#F39C12'
      },
      {
        key: 'avgTimeSavedMinutes',
        label: 'Average Time Saved per Task',
        hint: 'Average minutes released per AI-assisted task.',
        format: v => v + 'm',
        color: '#F39C12'
      },
      {
        key: 'hourlyRate',
        label: 'Hourly Cost Rate',
        hint: 'Fully-loaded average cost per working hour (USD). Used to convert time saved into indicative value.',
        format: v => '$' + v + '/hr',
        color: '#F39C12'
      },
    ],
  };

  const SCENARIOS = [
    { id: 'current',      label: 'Baseline',         color: 'var(--scenario-color-baseline)' },
    { id: 'scale2x',      label: 'Scaled adoption',  color: 'var(--scenario-color-scaled)' },
    { id: 'fulladoption', label: 'Full rollout',     color: 'var(--scenario-color-full)' },
  ];

  const OUTPUT_CARDS = [
    {
      id: 'out-active-cases',
      label: 'Activated use cases',
      get: (o, i) => ({ value: o.activeUseCases.toString(), suffix: 'of ' + Math.max(o.activeUseCases, i.targetUseCaseCount) }),
      color: 'var(--card-color-1)'
    },
    {
      id: 'out-active-users',
      label: 'Active users',
      get: (o, i) => ({ value: o.activeUsers.toLocaleString(), suffix: 'of ' + Math.max(o.activeUsers, i.targetUserCount).toLocaleString() }),
      color: 'var(--card-color-2)'
    },
    {
      id: 'out-hours',
      label: 'Hours released / month',
      get: (o) => ({ value: Math.round(o.hoursPerMonth).toLocaleString(), suffix: 'hrs' }),
      color: 'var(--card-color-3)'
    },
    {
      id: 'out-tasks',
      label: 'AI-assisted tasks / month',
      get: (o) => ({ value: Math.round(o.tasksPerMonth).toLocaleString(), suffix: 'tasks' }),
      color: 'var(--card-color-4)'
    },
    {
      id: 'out-ftes',
      label: 'Capacity released',
      get: (o) => ({ value: o.ftesFreed.toFixed(1), suffix: 'FTE / month' }),
      color: 'var(--card-color-5)'
    },
    {
      id: 'out-value-user',
      label: 'Indicative value / user / month',
      get: (o) => ({ value: fmtExec(o.valuePerUserPerMonth), suffix: '' }),
      color: 'var(--card-color-1)'
    },
    {
      id: 'out-time-user',
      label: 'Time released / user / month',
      get: (o) => ({ value: Math.round(o.timePerUserPerMonth).toLocaleString(), suffix: 'min' }),
      color: 'var(--card-color-2)'
    },
    {
      id: 'out-daily',
      label: 'Daily AI interactions',
      get: (o) => ({ value: Math.round(o.dailyInteractions).toLocaleString(), suffix: '/day' }),
      color: 'var(--card-color-3)'
    },
    {
      id: 'out-penetration',
      label: 'Programme penetration',
      get: (o, i) => {
        const pct = (o.activeUsers / Math.max(i.targetUserCount, 1)) * 100;
        return { value: Math.round(Math.min(pct, 100)).toString(), suffix: '%' };
      },
      color: 'var(--card-color-4)'
    },
  ];

  // ── Formatter (shared) ────────────────────────────────────

  function fmtExec(value) {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000)     return '$' + (value / 1_000).toFixed(1) + 'K';
    return '$' + Math.round(value);
  }

  // ── Render functions ──────────────────────────────────────

  function renderSliders(containerId, defs, inputs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = defs.map(d => {
      const r = RANGES[d.key];
      return `
        <div class="slider-row" data-slider="${d.key}">
          <div class="slider-header">
            <div class="slider-label-group">
              <span class="slider-label">${d.label}</span>
              <div class="slider-tooltip">
                <svg class="slider-tooltip-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <div class="slider-tooltip-text">${d.hint}</div>
              </div>
            </div>
            <span class="slider-value" style="color:${d.color};" data-display="${d.key}">${d.format(inputs[d.key])}</span>
          </div>
          <div class="slider-track">
            <input type="range" min="${r.min}" max="${r.max}" step="${r.step}" value="${inputs[d.key]}" data-input="${d.key}" aria-label="${d.label}">
          </div>
          <div class="slider-minmax">
            <span>${d.format(r.min)}</span>
            <span>${d.format(r.max)}</span>
          </div>
        </div>`;
    }).join('');
  }

  function updateSliderTrack(inputEl, color) {
    const min = parseFloat(inputEl.min);
    const max = parseFloat(inputEl.max);
    const val = parseFloat(inputEl.value);
    const pct = ((val - min) / (max - min)) * 100;
    inputEl.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #EBE7E7 ${pct}%, #EBE7E7 100%)`;
    inputEl.style.setProperty('--thumb-color', color);
  }

  function renderScenarioTabs(activeScenario) {
    const container = document.getElementById('scenario-tabs');
    if (!container) return;
    container.innerHTML = SCENARIOS.map(s =>
      `<button class="scenario-chip ${activeScenario === s.id ? '' : 'inactive'}" data-scenario="${s.id}" style="${
        activeScenario === s.id ? 'background:' + s.color + ';color:#fff;' : ''
      }">${s.label}</button>`
    ).join('');
  }

  function renderOutputGrid() {
    const container = document.getElementById('output-grid');
    if (!container) return;
    container.innerHTML = OUTPUT_CARDS.map(c => `
      <div class="output-card" id="${c.id}">
        <p class="output-card-label">${c.label}</p>
        <div class="output-card-value-row">
          <span class="output-card-value tabular-nums" data-out-value="${c.id}" style="color:${c.color};"></span>
          <span class="output-card-suffix" data-out-suffix="${c.id}"></span>
        </div>
      </div>
    `).join('');
  }

  function renderScenarioSummary(activeScenario, variants) {
    const container = document.getElementById('scenario-summary');
    if (!container) return;
    const scenarioMap = {
      current:      variants.currentState.outputs,
      scale2x:      variants.scale2x.outputs,
      fulladoption: variants.fullAdoption.outputs,
    };
    container.innerHTML = SCENARIOS.map(s => {
      const o = scenarioMap[s.id];
      const isActive = activeScenario === s.id;
      return `
        <button class="scenario-summary-btn ${isActive ? 'active-scenario' : ''}" data-scenario-summary="${s.id}"
          style="${isActive ? 'outline-color:' + s.color + ';' : ''}">
          <div class="scenario-summary-header">
            <span class="scenario-label" style="color:${s.color};">${s.label}</span>
            ${isActive ? `<span class="scenario-active-dot" style="background:${s.color};"></span>` : ''}
          </div>
          <p class="scenario-value">${fmtExec(o.annualizedReturn)}</p>
          <p class="scenario-detail">${o.ftesFreed.toFixed(1)} FTEs · ${o.activeUsers.toLocaleString()} users</p>
        </button>`;
    }).join('');
  }

  function renderKeyAssumptions(inputs, variants) {
    const container = document.getElementById('key-assumptions');
    if (!container) return;
    const o = variants.currentState.outputs;
    const items = [
      { label: 'Working days / month', value: '' + CONSTANTS.WORKING_DAYS_PER_MONTH },
      { label: 'Working hours / day',  value: '' + CONSTANTS.WORKING_HOURS_PER_DAY },
      { label: 'Activated use cases',  value: o.activeUseCases + ' of ' + Math.max(o.activeUseCases, inputs.targetUseCaseCount) },
      { label: 'Active users',         value: o.activeUsers.toLocaleString() + ' of ' + inputs.targetUserCount.toLocaleString() },
    ];
    container.innerHTML = items.map(i => `
      <div class="ka-row">
        <span class="ka-label">${i.label}</span>
        <span class="ka-value tabular-nums">${i.value}</span>
      </div>
    `).join('');
  }

  function renderChart(variants) {
    ChartBar.render('chart-container', [
      { name: 'Baseline',        value: variants.currentState.annualizedReturn, color: '#006397' },
      { name: 'Scaled adoption', value: variants.scale2x.annualizedReturn,      color: '#00B8A9' },
      { name: 'Full rollout',    value: variants.fullAdoption.annualizedReturn,  color: '#0F6E56' },
    ]);
  }

  return {
    SLIDER_DEFS,
    SCENARIOS,
    OUTPUT_CARDS,
    fmtExec,
    renderSliders,
    updateSliderTrack,
    renderScenarioTabs,
    renderOutputGrid,
    renderScenarioSummary,
    renderKeyAssumptions,
    renderChart,
  };
})();
