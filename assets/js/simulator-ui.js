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
      { key: 'targetUseCaseCount',            label: 'Target Use Case Count',         hint: 'Total number of AI use cases targeted for activation',           format: v => '' + v,                color: '#00B8A9' },
      { key: 'activationRate',                label: 'Use Case Activation Rate',      hint: 'Percentage of targeted use cases that will be activated',        format: v => v + '%',               color: '#00B8A9' },
      { key: 'tasksPerUserPerUseCasePerMonth', label: 'Tasks / User / Use Case / Mo', hint: 'Average tasks each user performs per use case per month',        format: v => '' + v,                color: '#00B8A9' },
    ],
    deeper: [
      { key: 'targetUserCount',               label: 'Target User Count',             hint: 'Total number of staff targeted to use AI tools',                 format: v => v.toLocaleString(),   color: '#F39C12' },
      { key: 'adoptionRate',                  label: 'User Adoption Rate',            hint: 'Percentage of targeted users who actively use the tools',        format: v => v + '%',               color: '#F39C12' },
      { key: 'avgTimeSavedMinutes',           label: 'Avg Time Saved / Task',         hint: 'Average minutes saved per AI-assisted task',                    format: v => v + 'm',               color: '#F39C12' },
    ],
  };

  const SCENARIOS = [
    { id: 'current',      label: 'Current State', color: '#006397' },
    { id: 'scale2x',      label: '2× Scale-Up',   color: '#00B8A9' },
    { id: 'fulladoption', label: 'Full Adoption',  color: '#0F6E56' },
  ];

  const OUTPUT_CARDS = [
    { id: 'out-active-cases',  label: 'ACTIVE USE CASES',        get: (o, i) => ({ value: o.activeUseCases.toString(),                    suffix: 'of ' + i.targetUseCaseCount }),         color: '#00B8A9' },
    { id: 'out-active-users',  label: 'ACTIVE USERS',            get: (o, i) => ({ value: o.activeUsers.toLocaleString(),                  suffix: 'of ' + i.targetUserCount.toLocaleString() }), color: '#F39C12' },
    { id: 'out-hours',         label: 'HOURS RECOVERED / MO',    get: (o)    => ({ value: Math.round(o.hoursPerMonth).toLocaleString(),     suffix: 'hrs' }),                                color: '#00B8A9' },
    { id: 'out-tasks',         label: 'AI TASKS / MONTH',        get: (o)    => ({ value: Math.round(o.tasksPerMonth).toLocaleString(),     suffix: 'tasks' }),                              color: '#F39C12' },
    { id: 'out-ftes',          label: 'FTES FREED / MONTH',      get: (o)    => ({ value: o.ftesFreed.toFixed(1),                           suffix: 'FTEs' }),                               color: '#0F6E56' },
    { id: 'out-value-user',    label: 'VALUE / USER / MONTH',    get: (o)    => ({ value: fmtExec(o.valuePerUserPerMonth),                  suffix: '' }),                                   color: '#0F6E56' },
    { id: 'out-time-user',     label: 'TIME FREED / USER / MO',  get: (o)    => ({ value: Math.round(o.timePerUserPerMonth).toLocaleString(),suffix: 'min' }),                              color: '#45004F' },
    { id: 'out-daily',         label: 'DAILY AI INTERACTIONS',   get: (o)    => ({ value: Math.round(o.dailyInteractions).toLocaleString(), suffix: '/day' }),                              color: '#00205F' },
    { id: 'out-penetration',   label: 'PROGRAMME PENETRATION',   get: (o)    => ({ value: Math.round(o.penetration).toString(),             suffix: '%' }),                                  color: '#00205F' },
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
      { label: 'Hourly cost rate',    value: '$' + CONSTANTS.HOURLY_COST + '/hr' },
      { label: 'Working days/month',  value: '' + CONSTANTS.WORKING_DAYS_PER_MONTH },
      { label: 'Working hours/day',   value: '' + CONSTANTS.WORKING_HOURS_PER_DAY },
      { label: 'Active use cases',    value: o.activeUseCases + ' of ' + inputs.targetUseCaseCount },
      { label: 'Active users',        value: o.activeUsers.toLocaleString() + ' of ' + inputs.targetUserCount.toLocaleString() },
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
      { name: 'Current',       value: variants.currentState.annualizedReturn, color: '#006397' },
      { name: '2× Scale',      value: variants.scale2x.annualizedReturn,      color: '#00B8A9' },
      { name: 'Full Adoption', value: variants.fullAdoption.annualizedReturn,  color: '#0F6E56' },
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
