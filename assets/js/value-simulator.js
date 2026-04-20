/**
 * Value Simulator — Page driver.
 * Initializes state, renders UI, binds events, manages scenarios/exports.
 */

(function () {
  'use strict';

  const { CONSTANTS, DEFAULTS, RANGES, calcOutputs, calcScenarioVariants } = SimulatorCore;
  const { HOURLY_COST, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = CONSTANTS;

  // ── State ─────────────────────────────────────────────────
  let inputs = { ...DEFAULTS };
  let activeScenario = 'current'; // 'current' | 'scale2x' | 'fulladoption'
  let lastAction = '';

  // ── Formatters ────────────────────────────────────────────
  function fmtExec(value) {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(1) + 'K';
    return '$' + Math.round(value);
  }

  // ── Slider definitions ────────────────────────────────────
  const SLIDER_DEFS = {
    faster: [
      { key: 'targetUseCaseCount', label: 'Target Use Case Count', hint: 'Total number of AI use cases targeted for activation', format: v => '' + v, color: '#00B8A9' },
      { key: 'activationRate', label: 'Use Case Activation Rate', hint: 'Percentage of targeted use cases that will be activated', format: v => v + '%', color: '#00B8A9' },
      { key: 'tasksPerUserPerUseCasePerMonth', label: 'Tasks / User / Use Case / Mo', hint: 'Average tasks each user performs per use case per month', format: v => '' + v, color: '#00B8A9' },
    ],
    deeper: [
      { key: 'targetUserCount', label: 'Target User Count', hint: 'Total number of staff targeted to use AI tools', format: v => v.toLocaleString(), color: '#F39C12' },
      { key: 'adoptionRate', label: 'User Adoption Rate', hint: 'Percentage of targeted users who actively use the tools', format: v => v + '%', color: '#F39C12' },
      { key: 'avgTimeSavedMinutes', label: 'Avg Time Saved / Task', hint: 'Average minutes saved per AI-assisted task', format: v => v + 'm', color: '#F39C12' },
    ],
  };

  const SCENARIOS = [
    { id: 'current', label: 'Current State', color: '#006397' },
    { id: 'scale2x', label: '2× Scale-Up', color: '#00B8A9' },
    { id: 'fulladoption', label: 'Full Adoption', color: '#0F6E56' },
  ];

  const OUTPUT_CARDS = [
    { id: 'out-active-cases', label: 'ACTIVE USE CASES', get: (o, i) => ({ value: o.activeUseCases.toString(), suffix: 'of ' + i.targetUseCaseCount }), color: '#00B8A9' },
    { id: 'out-active-users', label: 'ACTIVE USERS', get: (o, i) => ({ value: o.activeUsers.toLocaleString(), suffix: 'of ' + i.targetUserCount.toLocaleString() }), color: '#F39C12' },
    { id: 'out-hours', label: 'HOURS RECOVERED / MO', get: (o) => ({ value: Math.round(o.hoursPerMonth).toLocaleString(), suffix: 'hrs' }), color: '#00B8A9' },
    { id: 'out-tasks', label: 'AI TASKS / MONTH', get: (o) => ({ value: Math.round(o.tasksPerMonth).toLocaleString(), suffix: 'tasks' }), color: '#F39C12' },
    { id: 'out-ftes', label: 'FTES FREED / MONTH', get: (o) => ({ value: o.ftesFreed.toFixed(1), suffix: 'FTEs' }), color: '#0F6E56' },
    { id: 'out-value-user', label: 'VALUE / USER / MONTH', get: (o) => ({ value: fmtExec(o.valuePerUserPerMonth), suffix: '' }), color: '#0F6E56' },
    { id: 'out-time-user', label: 'TIME FREED / USER / MO', get: (o) => ({ value: Math.round(o.timePerUserPerMonth).toLocaleString(), suffix: 'min' }), color: '#45004F' },
    { id: 'out-daily', label: 'DAILY AI INTERACTIONS', get: (o) => ({ value: Math.round(o.dailyInteractions).toLocaleString(), suffix: '/day' }), color: '#00205F' },
    { id: 'out-penetration', label: 'PROGRAMME PENETRATION', get: (o) => ({ value: Math.round(o.penetration).toString(), suffix: '%' }), color: '#00205F' },
  ];

  // ── Rendering ─────────────────────────────────────────────
  function renderSliders(containerId, defs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = defs.map(d => {
      const r = RANGES[d.key];
      return `
        <div class="slider-row" data-slider="${d.key}">
          <div class="slider-header">
            <div style="display:flex;align-items:center;gap:6px;min-width:0;">
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
    // Set thumb color via CSS custom property
    inputEl.style.setProperty('--thumb-color', color);
  }

  function renderScenarioTabs() {
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
        <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
          <span class="output-card-value tabular-nums" data-out-value="${c.id}" style="color:${c.color};"></span>
          <span class="output-card-suffix" data-out-suffix="${c.id}"></span>
        </div>
      </div>
    `).join('');
  }

  function renderScenarioSummary() {
    const container = document.getElementById('scenario-summary');
    if (!container) return;
    const variants = calcScenarioVariants(inputs);
    const scenarioMap = {
      current: variants.currentState.outputs,
      scale2x: variants.scale2x.outputs,
      fulladoption: variants.fullAdoption.outputs,
    };

    container.innerHTML = SCENARIOS.map(s => {
      const o = scenarioMap[s.id];
      const isActive = activeScenario === s.id;
      return `
        <button class="scenario-summary-btn ${isActive ? 'active-scenario' : ''}" data-scenario-summary="${s.id}"
          style="${isActive ? 'outline-color:' + s.color + ';' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span class="scenario-label" style="color:${s.color};">${s.label}</span>
            ${isActive ? '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + ';"></span>' : ''}
          </div>
          <p class="scenario-value">${fmtExec(o.annualizedReturn)}</p>
          <p class="scenario-detail">${o.ftesFreed.toFixed(1)} FTEs · ${o.activeUsers.toLocaleString()} users</p>
        </button>`;
    }).join('');
  }

  function renderKeyAssumptions() {
    const container = document.getElementById('key-assumptions');
    if (!container) return;
    const variants = calcScenarioVariants(inputs);
    const o = variants.currentState.outputs;
    const items = [
      { label: 'Hourly cost rate', value: '$' + CONSTANTS.HOURLY_COST + '/hr' },
      { label: 'Working days/month', value: '' + CONSTANTS.WORKING_DAYS_PER_MONTH },
      { label: 'Working hours/day', value: '' + CONSTANTS.WORKING_HOURS_PER_DAY },
      { label: 'Active use cases', value: o.activeUseCases + ' of ' + inputs.targetUseCaseCount },
      { label: 'Active users', value: o.activeUsers.toLocaleString() + ' of ' + inputs.targetUserCount.toLocaleString() },
    ];
    container.innerHTML = items.map(i => `
      <div class="ka-row">
        <span class="ka-label">${i.label}</span>
        <span class="ka-value tabular-nums">${i.value}</span>
      </div>
    `).join('');
  }

  function updateAll() {
    const variants = calcScenarioVariants(inputs);
    const displayOutputs =
      activeScenario === 'current' ? variants.currentState.outputs :
      activeScenario === 'scale2x' ? variants.scale2x.outputs :
      variants.fullAdoption.outputs;

    // Hero
    document.getElementById('hero-annualized').textContent = fmtExec(displayOutputs.annualizedReturn);
    document.getElementById('hero-monthly').textContent = fmtExec(displayOutputs.monthlyCostSavings);
    document.getElementById('hero-users').textContent = displayOutputs.activeUsers.toLocaleString();
    document.getElementById('hero-ftes').textContent = displayOutputs.ftesFreed.toFixed(1);
    document.getElementById('hero-cases').textContent = displayOutputs.activeUseCases.toString();

    // Output cards
    OUTPUT_CARDS.forEach(c => {
      const data = c.get(displayOutputs, inputs);
      const valEl = document.querySelector(`[data-out-value="${c.id}"]`);
      const sufEl = document.querySelector(`[data-out-suffix="${c.id}"]`);
      if (valEl) valEl.textContent = data.value;
      if (sufEl) sufEl.textContent = data.suffix;
    });

    // Slider displays
    [...SLIDER_DEFS.faster, ...SLIDER_DEFS.deeper].forEach(d => {
      const display = document.querySelector(`[data-display="${d.key}"]`);
      if (display) display.textContent = d.format(inputs[d.key]);
      const inputEl = document.querySelector(`[data-input="${d.key}"]`);
      if (inputEl) {
        inputEl.value = inputs[d.key];
        updateSliderTrack(inputEl, d.color);
      }
    });

    // Chart
    ChartBar.render('chart-container', [
      { name: 'Current', value: variants.currentState.annualizedReturn, color: '#006397' },
      { name: '2× Scale', value: variants.scale2x.annualizedReturn, color: '#00B8A9' },
      { name: 'Full Adoption', value: variants.fullAdoption.annualizedReturn, color: '#0F6E56' },
    ]);

    // Scenario tabs + summary
    renderScenarioTabs();
    renderScenarioSummary();
    renderKeyAssumptions();
  }

  // ── Event Binding ─────────────────────────────────────────
  function bindSliders() {
    document.querySelectorAll('[data-input]').forEach(el => {
      const key = el.getAttribute('data-input');
      el.addEventListener('input', () => {
        inputs[key] = Number(el.value);
        updateAll();
      });
    });
  }

  function bindScenarioTabs() {
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-scenario]');
      if (tab) {
        activeScenario = tab.getAttribute('data-scenario');
        updateAll();
        return;
      }
      const summary = e.target.closest('[data-scenario-summary]');
      if (summary) {
        activeScenario = summary.getAttribute('data-scenario-summary');
        updateAll();
      }
    });
  }

  function showReady(action) {
    lastAction = action;
    const badge = document.getElementById('ready-badge');
    const actionEl = document.getElementById('ready-action');
    const timeEl = document.getElementById('ready-time');
    if (!badge) return;
    const now = new Date();
    actionEl.textContent = action;
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' + now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    badge.style.display = '';
  }

  // ── Exports ───────────────────────────────────────────────
  function handleSave() {
    const variants = calcScenarioVariants(inputs);
    const saved = {
      id: 'scenario-' + Date.now(),
      name: 'Scenario ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      inputs: inputs,
      outputs: {
        current: variants.currentState.outputs,
        scale2x: variants.scale2x.outputs,
        fullAdoption: variants.fullAdoption.outputs,
      },
    };
    try {
      const existing = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
      existing.unshift(saved);
      localStorage.setItem('savedScenarios', JSON.stringify(existing.slice(0, 10)));
      Toast.showToast('success', 'Scenario saved', { description: 'Stored locally — available in Scenario Comparison' });
      showReady('Scenario saved');
    } catch (err) {
      Toast.showToast('error', 'Could not save scenario');
    }
  }

  function handleExportCSV() {
    const variants = calcScenarioVariants(inputs);
    const o = variants.currentState.outputs;
    const s = variants.scale2x.outputs;
    const f = variants.fullAdoption.outputs;

    const rows = [
      ['KPMG AI Value Simulator — Scenario Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['--- INPUTS ---'],
      ['Parameter', 'Value'],
      ['Target Use Case Count', inputs.targetUseCaseCount],
      ['Use Case Activation Rate (%)', inputs.activationRate],
      ['Target User Count', inputs.targetUserCount],
      ['User Adoption Rate (%)', inputs.adoptionRate],
      ['Tasks / User / Use Case / Month', inputs.tasksPerUserPerUseCasePerMonth],
      ['Avg Time Saved / Task (min)', inputs.avgTimeSavedMinutes],
      [],
      ['--- KEY ASSUMPTIONS ---'],
      ['Hourly Cost Rate (USD/hr)', HOURLY_COST],
      ['Working Days / Month', WORKING_DAYS_PER_MONTH],
      ['Working Hours / Day', WORKING_HOURS_PER_DAY],
      [],
      ['--- OUTPUTS (ALL SCENARIOS) ---'],
      ['Metric', 'Current State', '2× Scale-Up', 'Full Adoption'],
      ['Active Use Cases', o.activeUseCases, s.activeUseCases, f.activeUseCases],
      ['Active Users', o.activeUsers, s.activeUsers, f.activeUsers],
      ['AI-Assisted Tasks / Month', o.tasksPerMonth, s.tasksPerMonth, f.tasksPerMonth],
      ['Hours Recovered / Month', Math.round(o.hoursPerMonth), Math.round(s.hoursPerMonth), Math.round(f.hoursPerMonth)],
      ['Monthly Cost Savings (USD)', Math.round(o.monthlyCostSavings), Math.round(s.monthlyCostSavings), Math.round(f.monthlyCostSavings)],
      ['Annualised Return (USD)', Math.round(o.annualizedReturn), Math.round(s.annualizedReturn), Math.round(f.annualizedReturn)],
      ['FTEs Freed / Month', o.ftesFreed.toFixed(1), s.ftesFreed.toFixed(1), f.ftesFreed.toFixed(1)],
      ['Time Freed / User / Month (min)', Math.round(o.timePerUserPerMonth), Math.round(s.timePerUserPerMonth), Math.round(f.timePerUserPerMonth)],
      ['Value / User / Month (USD)', Math.round(o.valuePerUserPerMonth), Math.round(s.valuePerUserPerMonth), Math.round(f.valuePerUserPerMonth)],
      ['Daily AI Interactions', o.dailyInteractions, s.dailyInteractions, f.dailyInteractions],
      ['Programme Penetration (%)', Math.round(o.penetration), Math.round(s.penetration), Math.round(f.penetration)],
    ];
    const csv = ExportUtils.buildCSV(rows);
    const dateStr = new Date().toISOString().slice(0, 10);
    ExportUtils.downloadFile(csv, 'kpmg-ai-value-simulator-' + dateStr + '.csv', 'text/csv;charset=utf-8;');
    Toast.showToast('success', 'CSV downloaded', { description: 'All three scenario variants included' });
    showReady('CSV exported');
  }

  function handleExportPDF() {
    const variants = calcScenarioVariants(inputs);
    const o = variants.currentState.outputs;
    const s = variants.scale2x.outputs;
    const f = variants.fullAdoption.outputs;
    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const scenarioRows = [
      ['Active Use Cases', o.activeUseCases, s.activeUseCases, f.activeUseCases],
      ['Active Users', o.activeUsers, s.activeUsers, f.activeUsers],
      ['Tasks / Month', o.tasksPerMonth.toLocaleString(), s.tasksPerMonth.toLocaleString(), f.tasksPerMonth.toLocaleString()],
      ['Hours Recovered / Month', Math.round(o.hoursPerMonth).toLocaleString(), Math.round(s.hoursPerMonth).toLocaleString(), Math.round(f.hoursPerMonth).toLocaleString()],
      ['Monthly Cost Savings', fmtExec(o.monthlyCostSavings), fmtExec(s.monthlyCostSavings), fmtExec(f.monthlyCostSavings)],
      ['Annualised Return', fmtExec(o.annualizedReturn), fmtExec(s.annualizedReturn), fmtExec(f.annualizedReturn)],
      ['FTEs Freed / Month', o.ftesFreed.toFixed(1), s.ftesFreed.toFixed(1), f.ftesFreed.toFixed(1)],
      ['Programme Penetration', Math.round(o.penetration) + '%', Math.round(s.penetration) + '%', Math.round(f.penetration) + '%'],
    ];
    const tableRows = scenarioRows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>' +
      '<title>KPMG AI Value Simulator — ' + dateStr + '</title>' +
      '<style>' +
      'body{font-family:Arial,sans-serif;color:#1a1a2e;margin:40px;font-size:13px;}' +
      'h1{color:#00205F;font-size:20px;margin-bottom:4px;}' +
      '.subtitle{color:#666;font-size:12px;margin-bottom:24px;}' +
      'h2{color:#006397;font-size:14px;margin:20px 0 8px;border-bottom:1px solid #e0e0e0;padding-bottom:4px;}' +
      'table{width:100%;border-collapse:collapse;margin-bottom:16px;}' +
      'th{background:#00205F;color:white;padding:8px 10px;text-align:left;font-size:12px;}' +
      'td{padding:7px 10px;border-bottom:1px solid #f0f0f0;}' +
      'tr:nth-child(even) td{background:#f8f8f8;}' +
      '.footer{margin-top:32px;font-size:11px;color:#999;border-top:1px solid #e0e0e0;padding-top:12px;}' +
      '@media print{body{margin:20px;}}' +
      '</style></head><body>' +
      '<h1>KPMG AI Value Simulator</h1>' +
      '<div class="subtitle">Scenario Export — Generated ' + dateStr + '</div>' +
      '<h2>Inputs</h2><table>' +
      '<tr><th>Parameter</th><th>Value</th></tr>' +
      '<tr><td>Target Use Case Count</td><td>' + inputs.targetUseCaseCount + '</td></tr>' +
      '<tr><td>Use Case Activation Rate</td><td>' + inputs.activationRate + '%</td></tr>' +
      '<tr><td>Target User Count</td><td>' + inputs.targetUserCount.toLocaleString() + '</td></tr>' +
      '<tr><td>User Adoption Rate</td><td>' + inputs.adoptionRate + '%</td></tr>' +
      '<tr><td>Tasks / User / Use Case / Month</td><td>' + inputs.tasksPerUserPerUseCasePerMonth + '</td></tr>' +
      '<tr><td>Avg Time Saved / Task</td><td>' + inputs.avgTimeSavedMinutes + ' min</td></tr>' +
      '</table>' +
      '<h2>Key Assumptions</h2><table>' +
      '<tr><th>Assumption</th><th>Value</th></tr>' +
      '<tr><td>Hourly cost rate (USD)</td><td>$' + HOURLY_COST + '/hr</td></tr>' +
      '<tr><td>Working days / month</td><td>' + WORKING_DAYS_PER_MONTH + '</td></tr>' +
      '<tr><td>Working hours / day</td><td>' + WORKING_HOURS_PER_DAY + '</td></tr>' +
      '</table>' +
      '<h2>Scenario Outputs</h2><table>' +
      '<tr><th>Metric</th><th>Current State</th><th>2× Scale-Up</th><th>Full Adoption</th></tr>' +
      tableRows +
      '</table>' +
      '<div class="footer">KPMG AI Architecture — Confidential. For internal use only. All figures are illustrative estimates based on modelled assumptions.</div>' +
      '<script>window.onload=function(){window.print();}<\/script>' +
      '</body></html>';

    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var win = window.open(url, '_blank');
    if (!win) {
      Toast.showToast('error', 'Pop-up blocked', { description: 'Please allow pop-ups to export PDF' });
    } else {
      Toast.showToast('success', 'PDF ready', { description: 'Print dialog opened — save as PDF' });
      showReady('PDF exported');
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    ThemeManager.initTheme();
    AppShell.init();

    renderSliders('sliders-faster', SLIDER_DEFS.faster);
    renderSliders('sliders-deeper', SLIDER_DEFS.deeper);
    renderOutputGrid();

    bindSliders();
    bindScenarioTabs();

    document.getElementById('btn-save').addEventListener('click', handleSave);
    document.getElementById('btn-csv').addEventListener('click', handleExportCSV);
    document.getElementById('btn-pdf').addEventListener('click', handleExportPDF);

    updateAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
