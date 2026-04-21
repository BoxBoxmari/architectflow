/**
 * Value Simulator — Page driver.
 * State, event binding, and export logic only.
 * Render functions and static definitions are in simulator-ui.js (SimulatorUI).
 *
 * Depends on: simulator-core.js, simulator-ui.js, chart-bar.js,
 *             export-utils.js, theme.js, app-shell.js, toast.js
 */

(function () {
  'use strict';

  const { DEFAULTS, calcScenarioVariants } = SimulatorCore;
  const { CONSTANTS } = SimulatorCore;
  const { WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = CONSTANTS;
  const {
    SLIDER_DEFS, SCENARIOS, OUTPUT_CARDS, fmtExec,
    renderSliders, updateSliderTrack,
    renderScenarioTabs, renderOutputGrid,
    renderScenarioSummary, renderKeyAssumptions, renderChart,
  } = SimulatorUI;

  // ── State ─────────────────────────────────────────────────
  let inputs         = { ...DEFAULTS };
  let activeScenario = 'current'; // 'current' | 'scale2x' | 'fulladoption'

  // ── updateAll ─────────────────────────────────────────────
  function updateAll() {
    const variants = calcScenarioVariants(inputs);
    const displayOutputs =
      activeScenario === 'current'      ? variants.currentState.outputs  :
      activeScenario === 'scale2x'      ? variants.scale2x.outputs       :
      variants.fullAdoption.outputs;

    // Hero
    document.getElementById('hero-annualized').textContent = fmtExec(displayOutputs.annualizedReturn);
    document.getElementById('hero-users').textContent      = displayOutputs.activeUsers.toLocaleString();
    document.getElementById('hero-ftes').textContent       = displayOutputs.ftesFreed.toFixed(1);
    document.getElementById('hero-cases').textContent      = displayOutputs.activeUseCases.toString();

    // Hero insight
    const insightEl = document.getElementById('hero-insight');
    if (insightEl) {
      insightEl.textContent =
        'At the current modelled state, AI could release ' +
        displayOutputs.ftesFreed.toFixed(1) +
        ' FTEs per month and create approximately ' +
        fmtExec(displayOutputs.annualizedReturn) +
        ' annual value across ' +
        displayOutputs.activeUsers.toLocaleString() +
        ' active users.';
    }

    // Output cards
    OUTPUT_CARDS.forEach(c => {
      const data  = c.get(displayOutputs, inputs);
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

    renderChart(variants);
    renderScenarioTabs(activeScenario);
    renderScenarioSummary(activeScenario, variants);
    renderKeyAssumptions(inputs, variants);
  }

  // ── Event binding ──────────────────────────────────────────
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

  function bindAssumptionsToggle() {
    var toggle = document.getElementById('assumptions-toggle');
    var body = document.getElementById('assumptions-body');
    if (!toggle || !body) return;

    toggle.addEventListener('click', function () {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      body.classList.toggle('hidden', isExpanded);
      toggle.textContent = isExpanded ? 'Show inputs' : 'Hide inputs';
    });
  }

  function showReady(action) {
    const badge    = document.getElementById('ready-badge');
    const actionEl = document.getElementById('ready-action');
    const timeEl   = document.getElementById('ready-time');
    if (!badge) return;
    const now = new Date();
    actionEl.textContent = action;
    timeEl.textContent   = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' + now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    badge.classList.remove('hidden');
  }

  // ── Exports ───────────────────────────────────────────────
  function handleSave() {
    const variants = calcScenarioVariants(inputs);
    const saved = {
      id:        'scenario-' + Date.now(),
      name:      'Scenario ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      inputs,
      outputs: {
        current:      variants.currentState.outputs,
        scale2x:      variants.scale2x.outputs,
        fullAdoption: variants.fullAdoption.outputs,
      },
    };
    try {
      const existing = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
      existing.unshift(saved);
      localStorage.setItem('savedScenarios', JSON.stringify(existing.slice(0, 10)));
      Toast.showToast('success', 'Working version saved locally', {
        description: 'Stored on this browser for working sessions'
      });
      showReady('Working version saved locally');
    } catch (err) {
      if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        Toast.showToast('error', 'Storage full', { description: 'Clear saved scenarios to free space' });
      } else {
        Toast.showToast('error', 'Could not save scenario');
      }
    }
  }

  function handleExportCSV() {
    const variants = calcScenarioVariants(inputs);
    const o = variants.currentState.outputs;
    const s = variants.scale2x.outputs;
    const f = variants.fullAdoption.outputs;

    const rows = [
      ['KPMG AI Value Case — Scenario Export'],
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
      ['Hourly Cost Rate (USD/hr)', inputs.hourlyRate],
      ['Working Days / Month', WORKING_DAYS_PER_MONTH],
      ['Working Hours / Day', WORKING_HOURS_PER_DAY],
      [],
      ['--- OUTPUTS (ALL SCENARIOS) ---'],
      ['Metric', 'Baseline', 'Scaled Adoption', 'Full Rollout'],
      ['Active Use Cases', o.activeUseCases, s.activeUseCases, f.activeUseCases],
      ['Active Users', o.activeUsers, s.activeUsers, f.activeUsers],
      ['AI-Assisted Tasks / Month', o.tasksPerMonth, s.tasksPerMonth, f.tasksPerMonth],
      ['Hours Released / Month', Math.round(o.hoursPerMonth), Math.round(s.hoursPerMonth), Math.round(f.hoursPerMonth)],
      ['Monthly Cost Savings (USD)', Math.round(o.monthlyCostSavings), Math.round(s.monthlyCostSavings), Math.round(f.monthlyCostSavings)],
      ['Annualised Return (USD)', Math.round(o.annualizedReturn), Math.round(s.annualizedReturn), Math.round(f.annualizedReturn)],
      ['FTEs Freed / Month', o.ftesFreed.toFixed(1), s.ftesFreed.toFixed(1), f.ftesFreed.toFixed(1)],
      ['Time Freed / User / Month (min)', Math.round(o.timePerUserPerMonth), Math.round(s.timePerUserPerMonth), Math.round(f.timePerUserPerMonth)],
      ['Value / User / Month (USD)', Math.round(o.valuePerUserPerMonth), Math.round(s.valuePerUserPerMonth), Math.round(f.valuePerUserPerMonth)],
      ['Daily AI Interactions', o.dailyInteractions, s.dailyInteractions, f.dailyInteractions],
      ['Programme Penetration (%)', Math.round(o.penetration), Math.round(s.penetration), Math.round(f.penetration)],
    ];
    const csv     = ExportUtils.buildCSV(rows);
    const dateStr = new Date().toISOString().slice(0, 10);
    ExportUtils.downloadFile(csv, 'kpmg-ai-value-case-' + dateStr + '.csv', 'text/csv;charset=utf-8;');
    Toast.showToast('success', 'Full model exported', {
      description: 'CSV includes all model inputs, assumptions, and scenario outputs'
    });
    showReady('Full model exported (CSV)');
  }

  function handleExportPDF() {
    var btn = document.getElementById('btn-pdf');
    var btnLabel = document.getElementById('btn-pdf-label');
    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Exporting…';

    try {
      var jsPDF   = window.jspdf.jsPDF;
      var doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageW   = doc.internal.pageSize.getWidth();
      var pageH   = doc.internal.pageSize.getHeight();
      var margin  = 18;
      var contentW = pageW - margin * 2;
      var y = 0;

      var NAVY       = [0, 32, 95];
      var BLUE       = [0, 99, 151];
      var TEAL       = [0, 184, 169];
      var AMBER      = [243, 156, 18];
      var GREEN      = [15, 110, 86];
      var LIGHT_BG   = [252, 249, 248];
      var BORDER     = [235, 231, 231];
      var TEXT       = [28, 27, 27];
      var MUTED      = [116, 118, 131];
      var WHITE      = [255, 255, 255];

      var variants = calcScenarioVariants(inputs);
      var o = variants.currentState.outputs;
      var s = variants.scale2x.outputs;
      var f = variants.fullAdoption.outputs;
      var dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      // ── Helper ─────────────────────────────────────────────
      function addPageHeader() {
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setFontSize(7);
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('KPMG AI Intelligence Hub', margin, 8);
        doc.setFont('helvetica', 'normal');
        doc.text('AI Value Case — Executive briefing summary', pageW - margin, 8, { align: 'right' });
        y = 20;
      }

      function checkPageBreak(needed) {
        if (y + needed > pageH - 16) { doc.addPage(); addPageHeader(); }
      }

      // ── Cover ──────────────────────────────────────────────
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.rect(0, 0, pageW, 55, 'F');
      doc.setFontSize(22); doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]); doc.setFont('helvetica', 'bold');
      doc.text('KPMG', margin, 22);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 200, 240);
      doc.text('AI Intelligence Hub', margin, 30);
      doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
      doc.rect(0, 55, pageW, 3, 'F');
      doc.setFontSize(17); doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]); doc.setFont('helvetica', 'bold');
      doc.text('AI Value Case', margin, 73);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text('Executive briefing summary — ' + dateStr, margin, 83);
      // Hero metric box
      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.roundedRect(margin, 96, contentW, 36, 3, 3, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('INDICATIVE ANNUAL VALUE — BASELINE', margin + 6, 106);
      doc.setFontSize(22); doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      doc.text(fmtExec(o.annualizedReturn) + ' / year', margin + 6, 120);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text(o.activeUsers.toLocaleString() + ' active users  ·  ' + o.ftesFreed.toFixed(1) + ' FTEs freed  ·  ' + o.activeUseCases + ' use cases', margin + 6, 128);
      doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text('Illustrative management view — figures are modelled estimates based on selected inputs.', pageW / 2, pageH - 14, { align: 'center' });

      // ── Page 2: Inputs + Key Assumptions ──────────────────
      doc.addPage(); addPageHeader();

      // Section: Inputs
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Model inputs', margin + 7, y + 6.5);
      y += 14;

      doc.autoTable({
        startY: y,
        head: [['Parameter', 'Value']],
        body: [
          ['Target Use Case Count',           '' + inputs.targetUseCaseCount],
          ['Use Case Activation Rate',         inputs.activationRate + '%'],
          ['Tasks / User / Use Case / Month',  '' + inputs.tasksPerUserPerUseCasePerMonth],
          ['Target User Count',                inputs.targetUserCount.toLocaleString()],
          ['User Adoption Rate',               inputs.adoptionRate + '%'],
          ['Avg Time Saved / Task',            inputs.avgTimeSavedMinutes + ' min'],
        ],
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 4, textColor: TEXT, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: { 0: { cellWidth: contentW * 0.72 }, 1: { cellWidth: contentW * 0.28, fontStyle: 'bold', textColor: TEAL } },
        didDrawPage: function () { addPageHeader(); },
      });
      y = doc.lastAutoTable.finalY + 10;

      // Section: Key Assumptions
      checkPageBreak(40);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Key Assumptions', margin + 7, y + 6.5);
      y += 14;

      doc.autoTable({
        startY: y,
        head: [['Assumption', 'Value']],
        body: [
          ['Hourly cost rate',    '$' + inputs.hourlyRate + '/hr'],
          ['Working days / month', '' + WORKING_DAYS_PER_MONTH],
          ['Working hours / day',  '' + WORKING_HOURS_PER_DAY],
        ],
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 4, textColor: TEXT, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: { 0: { cellWidth: contentW * 0.72 }, 1: { cellWidth: contentW * 0.28, fontStyle: 'bold' } },
        didDrawPage: function () { addPageHeader(); },
      });
      y = doc.lastAutoTable.finalY + 10;

      // ── Page 3+: Scenario Outputs ──────────────────────────
      checkPageBreak(50);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Scenario Outputs', margin + 7, y + 6.5);
      y += 14;

      // Scenario summary cards
      var cardW = (contentW - 6) / 3;
      var scenarios = [
        { label: 'Baseline',         color: NAVY,  outputs: o },
        { label: 'Scaled Adoption',  color: TEAL,  outputs: s },
        { label: 'Full Rollout',     color: GREEN, outputs: f },
      ];
      scenarios.forEach(function (sc, i) {
        var bx = margin + i * (cardW + 3);
        doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
        doc.roundedRect(bx, y, cardW, 28, 2, 2, 'F');
        doc.setFillColor(sc.color[0], sc.color[1], sc.color[2]);
        doc.rect(bx, y, cardW, 2.5, 'F');
        doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(sc.color[0], sc.color[1], sc.color[2]);
        doc.text(sc.label.toUpperCase(), bx + cardW / 2, y + 9, { align: 'center' });
        doc.setFontSize(13); doc.setTextColor(sc.color[0], sc.color[1], sc.color[2]);
        doc.text(fmtExec(sc.outputs.annualizedReturn), bx + cardW / 2, y + 19, { align: 'center' });
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(sc.outputs.ftesFreed.toFixed(1) + ' FTEs · ' + sc.outputs.activeUsers.toLocaleString() + ' users', bx + cardW / 2, y + 25, { align: 'center' });
      });
      y += 36;

      doc.autoTable({
        startY: y,
        head: [['Metric', 'Baseline', 'Scaled Adoption', 'Full Rollout']],
        body: [
          ['Active Use Cases',          '' + o.activeUseCases,                              '' + s.activeUseCases,                              '' + f.activeUseCases],
          ['Active Users',              o.activeUsers.toLocaleString(),                     s.activeUsers.toLocaleString(),                     f.activeUsers.toLocaleString()],
          ['AI Tasks / Month',          Math.round(o.tasksPerMonth).toLocaleString(),       Math.round(s.tasksPerMonth).toLocaleString(),       Math.round(f.tasksPerMonth).toLocaleString()],
          ['Hours Released / Month',    Math.round(o.hoursPerMonth).toLocaleString(),       Math.round(s.hoursPerMonth).toLocaleString(),       Math.round(f.hoursPerMonth).toLocaleString()],
          ['Monthly Cost Savings',      fmtExec(o.monthlyCostSavings),                     fmtExec(s.monthlyCostSavings),                     fmtExec(f.monthlyCostSavings)],
          ['Annualised Return',         fmtExec(o.annualizedReturn),                       fmtExec(s.annualizedReturn),                       fmtExec(f.annualizedReturn)],
          ['FTEs Freed / Month',        o.ftesFreed.toFixed(1),                            s.ftesFreed.toFixed(1),                            f.ftesFreed.toFixed(1)],
          ['Time Freed / User / Mo',    Math.round(o.timePerUserPerMonth) + ' min',        Math.round(s.timePerUserPerMonth) + ' min',        Math.round(f.timePerUserPerMonth) + ' min'],
          ['Value / User / Month',      fmtExec(o.valuePerUserPerMonth),                   fmtExec(s.valuePerUserPerMonth),                   fmtExec(f.valuePerUserPerMonth)],
          ['Daily Interactions',        Math.round(o.dailyInteractions).toLocaleString(),   Math.round(s.dailyInteractions).toLocaleString(),   Math.round(f.dailyInteractions).toLocaleString()],
          ['Programme Penetration',     Math.round(o.penetration) + '%',                   Math.round(s.penetration) + '%',                   Math.round(f.penetration) + '%'],
        ],
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3.5, textColor: TEXT, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: {
          0: { cellWidth: contentW * 0.37 },
          1: { cellWidth: contentW * 0.21, halign: 'right', textColor: NAVY,  fontStyle: 'bold' },
          2: { cellWidth: contentW * 0.21, halign: 'right', textColor: TEAL,  fontStyle: 'bold' },
          3: { cellWidth: contentW * 0.21, halign: 'right', textColor: GREEN, fontStyle: 'bold' },
        },
        didDrawPage: function () { addPageHeader(); },
      });
      y = doc.lastAutoTable.finalY + 6;

      // Footer note
      doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text('KPMG AI Architecture — Illustrative management view. All figures are modelled estimates based on selected inputs.', margin, y + 6);

      // Page numbers
      var totalPages = doc.internal.getNumberOfPages();
      for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text('Page ' + p + ' of ' + totalPages + '  |  KPMG AI Intelligence Hub  |  Value Case', pageW / 2, pageH - 7, { align: 'center' });
      }

      doc.save('KPMG_AI_Value_Case_' + Date.now() + '.pdf');
      Toast.showToast('success', 'Briefing PDF downloaded');
      showReady('Briefing PDF exported');
    } catch (err) {
      console.error('PDF export error:', err);
      Toast.showToast('error', 'PDF export failed', { description: err.message });
    } finally {
      if (btn) btn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Export briefing PDF';
    }
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    ThemeManager.initTheme();
    AppShell.init();

    renderSliders('sliders-faster', SLIDER_DEFS.faster, inputs);
    renderSliders('sliders-deeper', SLIDER_DEFS.deeper, inputs);
    renderOutputGrid();

    bindSliders();
    bindScenarioTabs();
    bindAssumptionsToggle();

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
