/**
 * discover.js — State machine for guided AI Value Discovery flow.
 * Depends on: DiscoverData (discover-data.js), Toast (toast.js)
 */

const Discover = (() => {
  'use strict';

  const D = window.DiscoverData;
  const STORAGE_KEY = 'architectflow.discover.v1';
  const MAX_STEP = 5;

  let cur = 0;
  let state = {
    fn: '',
    fnName: '',
    hc: 0,
    pains: [],
    workflows: [],
    selectedWFs: [],
    sizing: [],
    portfolio: [],
    wfIdx: 0,
  };

  /* ── DOM Helpers ────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  /* ── Navigation ─────────────────────────────────────────── */
  function show(step) {
    for (let i = 0; i <= MAX_STEP; i++) {
      const el = $('ds' + i);
      if (el) el.classList.toggle('active', i === step);
    }
    cur = step;
    $('discover-back').disabled = cur === 0;
    updateNextBtn();
    const main = $('main-content');
    if (main) main.scrollTop = 0;
  }

  function updateNextBtn() {
    const btn = $('discover-next');
    btn.className = 'module-btn module-btn--primary';
    btn.disabled = true;

    if (cur === 0) {
      btn.disabled = !state.fn;
      btn.textContent = 'Next';
    } else if (cur === 1) {
      btn.disabled = state.pains.length < 1;
      btn.textContent = 'Show Workflows';
    } else if (cur === 2) {
      btn.disabled = state.selectedWFs.length < 1;
      btn.textContent = 'Size It';
      btn.className = 'module-btn module-btn--accent';
    } else if (cur === 3) {
      btn.disabled = false;
      btn.textContent = 'Add to Portfolio';
      btn.className = 'module-btn module-btn--success';
    } else if (cur === 4) {
      btn.disabled = false;
      btn.textContent = 'View Blueprint';
      btn.className = 'module-btn module-btn--primary';
    } else {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
  }

  /* ── Step 0: Function Selection ─────────────────────────── */
  function initFunctions() {
    const grid = $('discover-func-grid');
    if (!grid) return;
    grid.innerHTML = '';
    D.FUNCTIONS.forEach(fn => {
      const card = document.createElement('div');
      card.className = 'discover-func-card';
      card.dataset.fn = fn.id;
      card.dataset.hc = fn.headcount;
      card.dataset.name = fn.name;
      card.innerHTML = `<div class="discover-func-name">${fn.name}</div>
        <div class="discover-func-count">~${fn.headcount} people</div>`;
      card.addEventListener('click', () => pickFunc(card));
      grid.appendChild(card);
    });
  }

  function pickFunc(el) {
    document.querySelectorAll('.discover-func-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.fn = el.dataset.fn;
    state.fnName = el.dataset.name;
    state.hc = parseInt(el.dataset.hc);
    updateNextBtn();
  }

  /* ── Step 1: Pain Areas ─────────────────────────────────── */
  function initPains() {
    const grid = $('discover-pain-grid');
    if (!grid) return;
    grid.innerHTML = '';
    D.PAINS.forEach(p => {
      const card = document.createElement('div');
      card.className = 'discover-pain-card';
      card.dataset.pain = p.id;
      card.innerHTML = `<div class="discover-pain-icon" style="background:${p.color}">${p.name.charAt(0).toUpperCase()}</div>
        <div class="discover-pain-name">${p.name}</div>
        <div class="discover-pain-desc">${p.desc}</div>`;
      card.addEventListener('click', () => togglePain(card));
      grid.appendChild(card);
    });
  }

  function togglePain(el) {
    el.classList.toggle('selected');
    state.pains = [];
    document.querySelectorAll('.discover-pain-card.selected').forEach(c => {
      state.pains.push(c.dataset.pain);
    });
    const pb = $('discover-proof');
    if (state.pains.length >= 2) {
      pb.style.display = '';
      pb.textContent = 'Teams addressing ' + state.pains.length + ' pain areas typically uncover $200K–$500K in annual recoverable value.';
    } else {
      pb.style.display = 'none';
    }
    updateNextBtn();
  }

  /* ── Step 2: Workflow Selection ──────────────────────────── */
  function buildWorkflows() {
    const wfs = [];
    const seen = {};
    state.pains.forEach(p => {
      if (D.WORKFLOWS[p]) {
        D.WORKFLOWS[p].forEach(w => {
          if (!seen[w.name]) {
            seen[w.name] = 1;
            wfs.push(Object.assign({ pain: p }, w));
          }
        });
      }
    });
    state.workflows = wfs;
    state.selectedWFs = [];

    const list = $('discover-wf-list');
    list.innerHTML = '';
    wfs.forEach((w, i) => {
      const card = document.createElement('div');
      card.className = 'discover-wf-card';
      card.dataset.idx = i;
      card.innerHTML = `<div class="discover-wf-check"></div>
        <div class="discover-wf-info">
          <div class="discover-wf-name">${w.name}</div>
          <div class="discover-wf-meta">~${w.time} min/task · ~${w.freq}x/person/month · est. ${w.save}% AI savings</div>
        </div>`;
      card.addEventListener('click', () => toggleWF(card));
      list.appendChild(card);
    });
  }

  function toggleWF(el) {
    el.classList.toggle('selected');
    state.selectedWFs = [];
    document.querySelectorAll('.discover-wf-card.selected').forEach(c => {
      state.selectedWFs.push(parseInt(c.dataset.idx));
    });

    const ins = $('discover-wf-insight');
    if (state.selectedWFs.length > 0) {
      ins.style.display = '';
      let totalHrs = 0;
      state.selectedWFs.forEach(i => {
        const w = state.workflows[i];
        totalHrs += D.calcHoursSaved(w.people, w.freq, w.time, w.save);
      });
      $('discover-wf-insight-num').textContent = D.formatNumber(totalHrs) + ' hrs';
    } else {
      ins.style.display = 'none';
    }
    updateNextBtn();
  }

  /* ── Step 3: Sizing ─────────────────────────────────────── */
  function startSizing() {
    state.wfIdx = 0;
    state.sizing = [];
    loadSizingStep();
  }

  function loadSizingStep() {
    const idx = state.selectedWFs[state.wfIdx];
    const w = state.workflows[idx];
    $('ds3-label').textContent = 'Step 3 — Use case ' + (state.wfIdx + 1) + ' of ' + state.selectedWFs.length;
    $('ds3-title').textContent = w.name;
    $('ds3-sub').textContent = 'Adjust these estimates to match your team\'s reality.';
    $('ds3-rPeople').value = w.people; $('ds3-vPeople').textContent = w.people;
    $('ds3-rFreq').value = w.freq;     $('ds3-vFreq').textContent = w.freq;
    $('ds3-rTime').value = w.time;     $('ds3-vTime').textContent = w.time + ' min';
    $('ds3-rSave').value = w.save;     $('ds3-vSave').textContent = w.save + '%';
    calcLive();

    const btn = $('discover-next');
    btn.textContent = state.wfIdx < state.selectedWFs.length - 1 ? 'Next Use Case' : 'Add to Portfolio';
  }

  function calcLive() {
    const p = +$('ds3-rPeople').value;
    const f = +$('ds3-rFreq').value;
    const t = +$('ds3-rTime').value;
    const s = +$('ds3-rSave').value;
    $('ds3-vPeople').textContent = p;
    $('ds3-vFreq').textContent = f;
    $('ds3-vTime').textContent = t + ' min';
    $('ds3-vSave').textContent = s + '%';

    const hrs = D.calcHoursSaved(p, f, t, s);
    const cost = D.calcMonthlyCost(hrs);
    $('ds3-liveHrs').textContent = D.formatNumber(hrs);
    $('ds3-liveCost').textContent = D.formatCurrency(cost);
    $('ds3-liveYear').textContent = D.formatCurrency(cost * 12);
  }

  function saveSizing() {
    const idx = state.selectedWFs[state.wfIdx];
    const w = state.workflows[idx];
    state.sizing.push({
      name: w.name,
      people: +$('ds3-rPeople').value,
      freq: +$('ds3-rFreq').value,
      time: +$('ds3-rTime').value,
      save: +$('ds3-rSave').value,
    });
  }

  /* ── Step 4: Portfolio ──────────────────────────────────── */
  function buildPortfolio() {
    state.sizing.forEach(s => state.portfolio.push(Object.assign({}, s)));
    renderPortfolio();
  }

  function renderPortfolio() {
    const list = $('discover-port-list');
    list.innerHTML = '';
    let totalHrs = 0, totalCost = 0;

    state.portfolio.forEach((p, i) => {
      const hrs = D.calcHoursSaved(p.people, p.freq, p.time, p.save);
      const cost = D.calcMonthlyCost(hrs);
      totalHrs += hrs;
      totalCost += cost;
      const div = document.createElement('div');
      div.className = 'discover-port-item';
      div.innerHTML = `<div>
        <div class="discover-port-name">${i + 1}. ${p.name}</div>
        <div class="discover-port-meta">${p.people} people · ${p.freq}x/mo · ${p.time} min · ${p.save}% saved</div>
      </div>
      <div>
        <div class="discover-port-val">${D.formatCurrency(cost * 12)}</div>
        <div class="discover-port-val-sub">${D.formatNumber(hrs)} hrs/mo</div>
      </div>`;
      list.appendChild(div);
    });

    $('discover-port-total-num').textContent = D.formatCurrency(totalCost * 12);
    $('discover-port-total-hrs').textContent = D.formatNumber(totalHrs) + ' hours recovered per month';
    $('ds4-title').textContent = state.portfolio.length + ' use case' + (state.portfolio.length > 1 ? 's' : '') + ' identified';
    $('ds4-sub').textContent = 'Your ' + state.fnName + ' team\'s AI value portfolio.';

    const fte = D.calcFTE(totalHrs);
    $('discover-port-proof').textContent = 'That\'s equivalent to ' + fte.toFixed(1) + ' full-time employees freed every month — without adding headcount.';
  }

  /* ── Summary Strip ──────────────────────────────────────── */
  function renderSummaryStrip() {
    const strip = $('discover-summary-strip');
    if (!strip) return;
    if (state.portfolio.length === 0) {
      strip.classList.remove('visible');
      return;
    }
    // Compute total annual value
    let totalCost = 0;
    state.portfolio.forEach(p => {
      const hrs = D.calcHoursSaved(p.people, p.freq, p.time, p.save);
      totalCost += D.calcMonthlyCost(hrs);
    });
    // First workflow name as the "selected workflow" label
    const firstWf = state.portfolio[0];
    const wfName  = firstWf ? firstWf.name : '—';
    const whyText = state.portfolio.length > 1
      ? state.portfolio.length + ' workflows selected across ' + state.fnName
      : 'Highest-impact opportunity in ' + state.fnName;
    const el = id => document.getElementById(id);
    if (el('dss-workflow')) el('dss-workflow').textContent = wfName;
    if (el('dss-why'))      el('dss-why').textContent      = whyText;
    if (el('dss-value'))   el('dss-value').textContent    = D.formatCurrency(totalCost * 12) + '/yr';
    strip.classList.add('visible');
  }

  /* ── Step 5: Blueprint ──────────────────────────────────── */
  function renderBlueprint() {
    $('discover-bp-list').innerHTML = $('discover-port-list').innerHTML;
    let totalHrs = 0, totalCost = 0;
    state.portfolio.forEach(p => {
      const hrs = D.calcHoursSaved(p.people, p.freq, p.time, p.save);
      totalHrs += hrs;
      totalCost += D.calcMonthlyCost(hrs);
    });
    $('discover-bp-title').textContent = state.fnName + ' AI Blueprint';
    $('discover-bp-sub').textContent = state.portfolio.length + ' use cases · ' + D.formatNumber(state.hc) + ' team members';
    $('discover-bp-total-num').textContent = D.formatCurrency(totalCost * 12);
    $('discover-bp-total-hrs').textContent = D.formatNumber(totalHrs) + ' hours/month recovered';
    $('discover-bp-cases').textContent = state.portfolio.length;
    $('discover-bp-fte').textContent = D.calcFTE(totalHrs).toFixed(1);
    renderSummaryStrip();
  }

  /* ── Flow Navigation ────────────────────────────────────── */
  function goNext() {
    if (cur === 0) { show(1); }
    else if (cur === 1) { buildWorkflows(); show(2); }
    else if (cur === 2) { startSizing(); show(3); }
    else if (cur === 3) {
      saveSizing();
      if (state.wfIdx < state.selectedWFs.length - 1) {
        state.wfIdx++;
        loadSizingStep();
        show(3);
      } else {
        buildPortfolio();
        renderSummaryStrip();
        show(4);
      }
    }
    else if (cur === 4) { renderBlueprint(); show(5); }
  }

  function goBack() {
    if (cur === 3 && state.wfIdx > 0) {
      state.wfIdx--;
      state.sizing.pop();
      loadSizingStep();
      return;
    }
    if (cur > 0) show(cur - 1);
  }

  function restart() {
    state.pains = [];
    state.selectedWFs = [];
    state.sizing = [];
    state.wfIdx = 0;
    document.querySelectorAll('.discover-pain-card').forEach(c => c.classList.remove('selected'));
    show(1);
  }

  function downloadBlueprint() {
    let txt = 'AI BLUEPRINT — ' + state.fnName + '\nArchitectFlow AI Intelligence Hub\n';
    txt += '=' + '='.repeat(40) + '\n\n';
    let totalH = 0, totalC = 0;
    state.portfolio.forEach((p, i) => {
      const h = D.calcHoursSaved(p.people, p.freq, p.time, p.save);
      const c = D.calcMonthlyCost(h);
      totalH += h; totalC += c;
      txt += (i + 1) + '. ' + p.name + '\n';
      txt += '   People: ' + p.people + ' | Freq: ' + p.freq + 'x/mo | Time: ' + p.time + ' min | AI savings: ' + p.save + '%\n';
      txt += '   Monthly hours saved: ' + Math.round(h) + ' | Annual value: ' + D.formatCurrency(c * 12) + '\n\n';
    });
    txt += 'TOTAL ANNUAL VALUE: ' + D.formatCurrency(totalC * 12) + '\n';
    txt += 'TOTAL MONTHLY HOURS: ' + Math.round(totalH) + '\n';
    txt += 'FTEs FREED: ' + D.calcFTE(totalH).toFixed(1) + '\n';
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'AI_Blueprint_' + state.fnName.replace(/[^a-zA-Z]/g, '_') + '.txt';
    a.click();
    if (window.Toast) Toast.show('Blueprint downloaded');
  }

  /* ── Persistence ────────────────────────────────────────── */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* quota exceeded — silently ignore */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.portfolio && saved.portfolio.length > 0) {
          state = saved;
          return true;
        }
      }
    } catch (e) { /* parse error — start fresh */ }
    return false;
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (window.AppShell) AppShell.init();
    if (typeof ThemeManager !== 'undefined') ThemeManager.initTheme();
    
    initFunctions();
    initPains();

    // Bind slider inputs
    ['ds3-rPeople', 'ds3-rFreq', 'ds3-rTime', 'ds3-rSave'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', calcLive);
    });

    // Bind navigation buttons
    const nextBtn = $('discover-next');
    const backBtn = $('discover-back');
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (backBtn) backBtn.addEventListener('click', goBack);

    // Bind blueprint actions
    const restartBtn = $('discover-restart');
    if (restartBtn) restartBtn.addEventListener('click', restart);
    const dlBtn = $('discover-download');
    if (dlBtn) dlBtn.addEventListener('click', downloadBlueprint);

    show(0);
  }

  // Auto-init on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, goNext, goBack, restart };
})();
