/**
 * current-process.js — Workspace controller for Current Process Blueprint.
 * Depends on: CPSchema (current-process-schema.js), Toast (toast.js)
 */

const CurrentProcess = (() => {
  'use strict';

  const S = window.CPSchema;
  let state = S.defaultState();
  let activeTab = 'info';
  let contentStep = null;
  let contentSubtab = 'actions';
  let zoom = 1;
  let viewMode = 'detailed'; // 'leadership' | 'detailed'

  /* ── Sample Processes ───────────────────────────────────── */
  function buildSample() {
    const s1 = S.uid(), s2 = S.uid(), s3 = S.uid(), s4 = S.uid();
    const sh1 = S.uid(), sh2 = S.uid(), sh3 = S.uid();
    const sample = S.defaultState();
    sample.info = {
      name: 'Client Onboarding',
      desc: 'End-to-end onboarding for new advisory clients from engagement letter to first deliverable.',
      org: 'KPMG Advisory',
      owner: 'Service Delivery Lead',
    };
    sample.steps = [
      { id: s1, name: 'Engagement Setup',  durTyp: '1–2 days',  durBest: '1 day',  durWorst: '4 days', durDriver: 'Partner availability', artifacts: 'Engagement letter\nConflict check log' },
      { id: s2, name: 'KYC & Compliance',  durTyp: '3–5 days',  durBest: '2 days', durWorst: '10 days', durDriver: 'Client document speed', artifacts: 'KYC form\nRisk assessment\nAML checklist' },
      { id: s3, name: 'Team Briefing',     durTyp: '1 day',     durBest: '0.5 days', durWorst: '2 days', durDriver: 'Availability of project lead', artifacts: 'Kick-off deck\nRACI matrix' },
      { id: s4, name: 'First Deliverable', durTyp: '5–7 days',  durBest: '4 days', durWorst: '14 days', durDriver: 'Scope clarity and data access', artifacts: 'Diagnostic report\nStakeholder briefing note' },
    ];
    sample.stakeholders = [
      { id: sh1, name: 'Partner / Director', label: 'PD', resp: 'Sign-off · Relationship', color: 'Blue' },
      { id: sh2, name: 'Engagement Manager', label: 'EM', resp: 'Coordination · Delivery', color: 'Teal' },
      { id: sh3, name: 'Client Contact',     label: 'CL', resp: 'Approvals · Data access', color: 'Amber' },
    ];
    sample.actions[s1] = {
      [sh1]: { action: 'Signs engagement letter. Reviews conflict check output.', arrow: 'Forwards to EM', isBot: false, botNote: '' },
      [sh2]: { action: 'Opens job code. Creates team channel. Sends welcome email.', arrow: '', isBot: false, botNote: '' },
      [sh3]: { action: 'Countersigns engagement letter. Nominates internal point of contact.', arrow: '', isBot: false, botNote: '' },
    };
    sample.actions[s2] = {
      [sh1]: { action: 'Reviews AML checklist. Approves risk rating.', arrow: '', isBot: false, botNote: '' },
      [sh2]: { action: 'Chases client for outstanding documents. Escalates blockers.', arrow: 'Escalates if >5 days', isBot: true, botNote: 'Often blocked on client response' },
      [sh3]: { action: 'Submits KYC documents. Provides beneficial ownership details.', arrow: '', isBot: false, botNote: '' },
    };
    sample.actions[s3] = {
      [sh1]: { action: 'Sets strategic direction. Confirms scope and success criteria.', arrow: '', isBot: false, botNote: '' },
      [sh2]: { action: 'Runs kick-off session. Distributes RACI matrix.', arrow: 'Shares action log with client', isBot: false, botNote: '' },
      [sh3]: { action: 'Attends kick-off. Confirms data contacts and access levels.', arrow: '', isBot: false, botNote: '' },
    };
    sample.actions[s4] = {
      [sh1]: { action: 'Reviews draft. Approves for release.', arrow: 'Releases to client', isBot: false, botNote: '' },
      [sh2]: { action: 'Manages drafting cycle. Coordinates SME input.', arrow: '', isBot: true, botNote: 'Multiple revision rounds add 2–3 days' },
      [sh3]: { action: 'Provides data. Attends interim check-in.', arrow: '', isBot: false, botNote: '' },
    };
    sample.touchpoints[s1] = [
      { id: S.uid(), app: 'DocuSign',       chip: 'E-sign',    type: 'Async', dir: 'To client',  desc: 'Engagement letter signature workflow' },
      { id: S.uid(), app: 'KPMG Conflicts', chip: 'Internal',  type: 'Sync',  dir: 'Internal',   desc: 'Conflict check system clearance' },
    ];
    sample.touchpoints[s2] = [
      { id: S.uid(), app: 'Outlook',        chip: 'Email',     type: 'Async', dir: 'To client',  desc: 'KYC document request and follow-up' },
      { id: S.uid(), app: 'SharePoint',     chip: 'Portal',    type: 'Async', dir: 'Two-way',    desc: 'Secure document upload portal' },
    ];
    sample.touchpoints[s3] = [
      { id: S.uid(), app: 'Teams / Zoom',   chip: 'Meeting',   type: 'Sync',  dir: 'To client',  desc: 'Kick-off meeting and screen-share session' },
    ];
    sample.touchpoints[s4] = [
      { id: S.uid(), app: 'Outlook',        chip: 'Email',     type: 'Async', dir: 'To client',  desc: 'Draft report distribution for review' },
      { id: S.uid(), app: 'Teams',          chip: 'Chat',      type: 'Sync',  dir: 'Two-way',    desc: 'Real-time feedback and Q&A' },
    ];
    sample.pain[s2] = [
      { id: S.uid(), title: 'KYC delays', types: ['DELAY', 'BOTTLENECK'], sev: 'HIGH', desc: 'Clients slow to provide KYC documents, blocking compliance clearance.', impact: 'Average 3–5 extra days added to onboarding cycle.' },
    ];
    sample.pain[s4] = [
      { id: S.uid(), title: 'Revision cycle', types: ['REPETITIVE', 'OVERLOAD'], sev: 'MED', desc: 'Multiple unstructured feedback rounds on draft deliverable.', impact: 'Adds 2–3 days per engagement; increases write-off risk.' },
    ];
    sample.backend[s2] = [
      { id: S.uid(), name: 'KPMG AML System', cat: 'Risk / Compliance', desc: 'Automated risk scoring and sanction screening.', dep: 'Client data must be complete before submission.' },
    ];
    sample.backend[s4] = [
      { id: S.uid(), name: 'Document Management', cat: 'IT / Infra', desc: 'Versioned storage for all client deliverables.', dep: '' },
    ];
    return sample;
  }

  /* ── DOM helper ─────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  /* ── Save / Load ────────────────────────────────────────── */
  function save() {
    try {
      localStorage.setItem(S.STORAGE_KEY, JSON.stringify(state));
      const badge = $('cp-saved');
      if (badge) { badge.classList.add('show'); setTimeout(() => badge.classList.remove('show'), 1500); }
      renderSummaryStrip();
    } catch (e) { /* quota exceeded */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(S.STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.steps && saved.steps.length > 0) { state = saved; return; }
      }
    } catch (e) { /* parse error */ }
    state = buildSample();
  }

  /* ── Tab Switching ──────────────────────────────────────── */
  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.cp-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    document.querySelectorAll('.cp-tab-pane').forEach(p => p.classList.toggle('active', p.id === 'cp-pane-' + tabId));
    if (tabId === 'info') renderInfo();
    else if (tabId === 'steps') renderSteps();
    else if (tabId === 'stakeholders') renderStakeholders();
    else if (tabId === 'content') renderContent();
  }

  /* ── Render: Info ───────────────────────────────────────── */
  function renderInfo() {
    $('cp-info-name').value = state.info.name || '';
    $('cp-info-desc').value = state.info.desc || '';
    $('cp-info-org').value = state.info.org || '';
    $('cp-info-owner').value = state.info.owner || '';
  }

  /* ── Render: Steps ──────────────────────────────────────── */
  function renderSteps() {
    const el = $('cp-steps-list');
    el.innerHTML = '';
    state.steps.forEach((s, i) => {
      const row = makeItemRow(s, 'step', i);
      const nameSpan = row.querySelector('.cp-item-name');
      nameSpan.textContent = s.name || 'Untitled Step';
      row.querySelector('.cp-item-sub').textContent = s.durTyp || 'No duration set';

      const detail = row.querySelector('.cp-item-detail-inner');
      detail.innerHTML = mkField('Step name', 'text', s.name || '', 'sn-' + s.id, 'Enter step name') +
        mkField('Typical duration', 'text', s.durTyp || '', 'durTyp-' + s.id, 'e.g. 2–3 days') +
        mkField('Best case', 'text', s.durBest || '', 'durBest-' + s.id, 'e.g. 1 day') +
        mkField('Worst case', 'text', s.durWorst || '', 'durWorst-' + s.id, 'e.g. 7 days') +
        mkField('Key driver', 'text', s.durDriver || '', 'durDriver-' + s.id, 'What determines timing?') +
        mkField('Output documents', 'textarea', s.artifacts || '', 'art-' + s.id, 'One document per line...');
      el.appendChild(row);

      // Bind inputs
      const nameInp = detail.querySelector('#sn-' + s.id);
      if (nameInp) nameInp.addEventListener('input', e => {
        s.name = e.target.value;
        nameSpan.textContent = s.name || 'Untitled Step';
        renderPreview(); save();
      });
      ['durTyp', 'durBest', 'durWorst', 'durDriver'].forEach(k => {
        const inp = detail.querySelector('#' + k + '-' + s.id);
        if (inp) inp.addEventListener('input', e => {
          s[k] = e.target.value;
          row.querySelector('.cp-item-sub').textContent = s.durTyp || 'No duration set';
          renderPreview(); save();
        });
      });
      const artTa = detail.querySelector('#art-' + s.id);
      if (artTa) artTa.addEventListener('input', e => { s.artifacts = e.target.value; renderPreview(); save(); });
    });
    setupDrag(el, () => state.steps, () => { renderSteps(); renderContent(); renderPreview(); save(); });
  }

  /* ── Render: Stakeholders ───────────────────────────────── */
  function renderStakeholders() {
    const el = $('cp-stakeholders-list');
    el.innerHTML = '';
    state.stakeholders.forEach((sh, i) => {
      const C = S.COLORS[sh.color] || S.COLORS.Blue;
      const row = makeItemRow(sh, 'stkh', i);

      const nameRow = row.querySelector('.cp-item-name-row');
      // Color dot
      const dot = document.createElement('div');
      dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${C.dark};flex-shrink:0`;
      nameRow.insertBefore(dot, nameRow.firstChild);
      row.querySelector('.cp-item-name').textContent = sh.name || 'New Role';
      row.querySelector('.cp-item-sub').textContent = `${sh.label || '?'} · ${sh.resp || 'No responsibility set'}`;

      const detail = row.querySelector('.cp-item-detail-inner');
      detail.innerHTML = mkField('Role name', 'text', sh.name || '', 'rn-' + sh.id, 'e.g. Project Manager') +
        mkField('Short label', 'text', sh.label || '', 'lbl-' + sh.id, 'e.g. PM') +
        mkField('Responsibilities', 'text', sh.resp || '', 'resp-' + sh.id, 'e.g. Review · Approve · Report') +
        '<div class="cp-field-group"><div class="cp-field-label">Color</div><div class="cp-color-picker" id="cpcp-' + sh.id + '">' +
        Object.keys(S.COLORS).map(cn => '<div class="cp-color-swatch' + (sh.color === cn ? ' selected' : '') + '" data-color="' + cn + '" style="background:' + S.COLORS[cn].dark + '" title="' + cn + '"></div>').join('') +
        '</div></div>';
      el.appendChild(row);

      // Bind
      detail.querySelector('#rn-' + sh.id).addEventListener('input', e => {
        sh.name = e.target.value;
        row.querySelector('.cp-item-name').textContent = sh.name || 'New Role';
        renderPreview(); save();
      });
      detail.querySelector('#lbl-' + sh.id).addEventListener('input', e => {
        sh.label = e.target.value;
        row.querySelector('.cp-item-sub').textContent = `${sh.label || '?'} · ${sh.resp || ''}`;
        renderPreview(); save();
      });
      detail.querySelector('#resp-' + sh.id).addEventListener('input', e => {
        sh.resp = e.target.value;
        row.querySelector('.cp-item-sub').textContent = `${sh.label || '?'} · ${sh.resp || ''}`;
        renderPreview(); save();
      });
      document.getElementById('cpcp-' + sh.id).querySelectorAll('.cp-color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          sh.color = sw.dataset.color;
          dot.style.background = S.COLORS[sh.color].dark;
          document.getElementById('cpcp-' + sh.id).querySelectorAll('.cp-color-swatch').forEach(s2 => s2.classList.toggle('selected', s2.dataset.color === sh.color));
          renderPreview(); save();
        });
      });
    });
    setupDrag(el, () => state.stakeholders, () => { renderStakeholders(); renderPreview(); save(); });
  }

  /* ── Render: Content ────────────────────────────────────── */
  function renderContent() {
    // Step pills
    const pills = $('cp-content-pills');
    pills.innerHTML = '';
    state.steps.forEach(s => {
      const p = document.createElement('button');
      p.className = 'cp-step-pill' + (contentStep === s.id ? ' active' : '');
      p.textContent = s.name || 'Untitled';
      p.addEventListener('click', () => { contentStep = s.id; renderContent(); });
      pills.appendChild(p);
    });
    if (!contentStep && state.steps.length) contentStep = state.steps[0].id;

    const body = $('cp-content-body');
    body.innerHTML = '';
    if (!contentStep) { body.innerHTML = '<div class="cp-empty-cell">Add steps first.</div>'; return; }
    ensureStepData(contentStep);

    if (contentSubtab === 'actions') renderActions(body);
    else if (contentSubtab === 'touchpoints') renderCrudList(body, state.touchpoints[contentStep], 'tp',
      tp => mkField('Application / Tool', 'text', tp.app || '', 'tpapp-' + tp.id, 'e.g. Microsoft Outlook') +
            mkField('Chip label', 'text', tp.chip || '', 'tpchip-' + tp.id, 'e.g. Email') +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
            mkSelect('Interaction type', ['Async', 'Sync', 'Both'], tp.type || 'Async', 'tptype-' + tp.id) +
            mkSelect('Direction', ['Internal', 'To client', 'Two-way'], tp.dir || 'Internal', 'tpdir-' + tp.id) +
            '</div>' +
            mkField('Description', 'textarea', tp.desc || '', 'tpdesc-' + tp.id, 'How is this tool used in this step?'),
      (tp, el) => {
        ['app', 'chip', 'desc'].forEach(k => {
          const inp = el.querySelector('#tp' + k + '-' + tp.id);
          if (inp) inp.addEventListener('input', e => { tp[k] = e.target.value; renderPreview(); save(); });
        });
        const tptype = el.querySelector('#tptype-' + tp.id);
        if (tptype) tptype.addEventListener('change', e => { tp.type = e.target.value; renderPreview(); save(); });
        const tpdir = el.querySelector('#tpdir-' + tp.id);
        if (tpdir) tpdir.addEventListener('change', e => { tp.dir = e.target.value; renderPreview(); save(); });
      },
      () => ({ id: S.uid(), app: '', chip: '', type: 'Async', dir: 'Internal', desc: '' }),
      '+ Add touchpoint');
    else if (contentSubtab === 'pain') renderCrudList(body, state.pain[contentStep], 'pa',
      p => mkField('Title', 'text', p.title || '', 'patit-' + p.id, 'Short name for the issue') +
            '<div class="cp-field-group"><div class="cp-field-label">Issue type</div><div class="cp-pain-types" id="ptypes-' + p.id + '">' +
            S.PAIN_TYPES.map(t => '<button class="cp-ptag-btn' + ((p.types || []).includes(t) ? ' active' : '') + '" data-pt="' + t + '">' + t + '</button>').join('') +
            '</div></div>' +
            '<div class="cp-field-group"><div class="cp-field-label">Severity</div><div class="cp-sev-group" id="psev-' + p.id + '">' +
            ['HIGH', 'MED', 'LOW'].map(s => '<button class="cp-sev-btn cp-sev-btn--' + s + (p.sev === s ? ' active' : '') + '" data-sev="' + s + '">' + s + '</button>').join('') +
            '</div></div>' +
            mkField('Description', 'textarea', p.desc || '', 'padesc-' + p.id, 'Root cause and mechanism') +
            mkField('Impact', 'textarea', p.impact || '', 'painp-' + p.id, 'Consequences, time lost, risks'),
      (p, el) => {
        ['title', 'desc', 'impact'].forEach(k => {
          const n = k === 'title' ? 'patit' : k === 'desc' ? 'padesc' : 'painp';
          const inp = el.querySelector('#' + n + '-' + p.id);
          if (inp) inp.addEventListener('input', e => { p[k] = e.target.value; renderPreview(); save(); });
        });
        el.querySelector('#ptypes-' + p.id)?.querySelectorAll('.cp-ptag-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const t = btn.dataset.pt;
            if (!p.types) p.types = [];
            const idx = p.types.indexOf(t);
            if (idx >= 0) p.types.splice(idx, 1); else p.types.push(t);
            btn.classList.toggle('active', p.types.includes(t));
            renderPreview(); save();
          });
        });
        el.querySelector('#psev-' + p.id)?.querySelectorAll('.cp-sev-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            p.sev = btn.dataset.sev;
            el.querySelector('#psev-' + p.id).querySelectorAll('.cp-sev-btn').forEach(b => b.classList.toggle('active', b.dataset.sev === p.sev));
            renderPreview(); save();
          });
        });
      },
      () => ({ id: S.uid(), title: '', types: [], sev: 'MED', desc: '', impact: '' }),
      '+ Add pain point');
    else if (contentSubtab === 'backend') renderCrudList(body, state.backend[contentStep], 'be',
      b => mkField('System / Team', 'text', b.name || '', 'bename-' + b.id, 'e.g. Risk / CEAC') +
            mkSelect('Category', S.BE_CATS, b.cat || S.BE_CATS[0], 'becat-' + b.id) +
            mkField('Description', 'textarea', b.desc || '', 'bedesc-' + b.id, 'What does this system do at this step?') +
            mkField('Dependency note', 'text', b.dep || '', 'bedep-' + b.id, 'Prerequisites? Leave blank if none.'),
      (b, el) => {
        ['name', 'desc', 'dep'].forEach(k => {
          const n = k === 'name' ? 'bename' : k === 'desc' ? 'bedesc' : 'bedep';
          const inp = el.querySelector('#' + n + '-' + b.id);
          if (inp) inp.addEventListener('input', e => { b[k] = e.target.value; renderPreview(); save(); });
        });
        const cat = el.querySelector('#becat-' + b.id);
        if (cat) cat.addEventListener('change', e => { b.cat = e.target.value; renderPreview(); save(); });
      },
      () => ({ id: S.uid(), name: '', cat: S.BE_CATS[0], desc: '', dep: '' }),
      '+ Add system');
  }

  function ensureStepData(sid) {
    if (!state.actions[sid]) state.actions[sid] = {};
    if (!state.touchpoints[sid]) state.touchpoints[sid] = [];
    if (!state.pain[sid]) state.pain[sid] = [];
    if (!state.backend[sid]) state.backend[sid] = [];
  }

  function renderActions(body) {
    state.stakeholders.forEach(sh => {
      const C = S.COLORS[sh.color] || S.COLORS.Blue;
      const a = (state.actions[contentStep] || {})[sh.id] || { action: '', arrow: '', isBot: false, botNote: '' };
      const wrap = document.createElement('div');
      wrap.className = 'cp-form-section';
      wrap.innerHTML = `<div class="cp-fs-head" style="background:${C.dark}14;border-bottom:1px solid ${C.border}">
        <div style="width:8px;height:8px;border-radius:50%;background:${C.dark};flex-shrink:0"></div>
        <div class="cp-fs-title" style="color:${C.dark}">${S.esc(sh.label || sh.name)}</div>
        <span style="font-size:10px;color:var(--kpmg-on-surface-variant);margin-right:8px;">${S.esc(sh.name)}</span>
        <div class="cp-item-actions">
          <button class="cp-item-expand-btn cp-fs-chevron" title="Toggle details" tabindex="-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>
      <div class="cp-fs-body open"><div class="cp-fs-inner">
        ${mkField('Action', 'textarea', a.action, 'act-' + sh.id, 'What does this role do at this step?')}
        ${mkField('Arrow label', 'text', a.arrow || '', 'arr-' + sh.id, 'e.g. forwards to PM')}
        <div class="cp-field-group"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--kpmg-on-surface-variant)">
          <input type="checkbox" id="bot-${sh.id}" ${a.isBot ? 'checked' : ''} style="width:auto;accent-color:var(--kpmg-accent-negative)">
          <span>Mark as bottleneck</span>
        </label></div>
        ${mkField('Bottleneck note', 'text', a.botNote || '', 'botn-' + sh.id, 'e.g. overloaded (shown inline)')}
      </div></div>`;
      body.appendChild(wrap);

      // Toggle section
      wrap.querySelector('.cp-fs-head').addEventListener('click', () => {
        const b = wrap.querySelector('.cp-fs-body');
        b.classList.toggle('open');
        const svg = wrap.querySelector('.cp-fs-chevron svg');
        if(svg) svg.style.transform = b.classList.contains('open') ? 'rotate(180deg)' : '';
      });

      const ensure = () => {
        if (!state.actions[contentStep]) state.actions[contentStep] = {};
        if (!state.actions[contentStep][sh.id]) state.actions[contentStep][sh.id] = {};
      };
      ['act', 'arr', 'botn'].forEach(pfx => {
        const el = wrap.querySelector('#' + pfx + '-' + sh.id);
        if (!el) return;
        const key = pfx === 'act' ? 'action' : pfx === 'arr' ? 'arrow' : 'botNote';
        el.addEventListener('input', e => { ensure(); state.actions[contentStep][sh.id][key] = e.target.value; renderPreview(); save(); });
      });
      wrap.querySelector('#bot-' + sh.id).addEventListener('change', e => {
        ensure(); state.actions[contentStep][sh.id].isBot = e.target.checked; renderPreview(); save();
      });
    });
    if (!state.stakeholders.length) {
      body.innerHTML = '<div class="cp-empty-cell">Add stakeholders first (Stakeholders tab).</div>';
    }
  }

  function renderCrudList(container, items, prefix, buildFn, bindFn, createFn, addLabel) {
    items.forEach((item, i) => {
      const row = makeItemRow(item, prefix, i);
      row.querySelector('.cp-item-name').textContent = item.title || item.app || item.name || 'New item';
      const detail = row.querySelector('.cp-item-detail-inner');
      detail.innerHTML = buildFn(item);
      bindFn(item, detail);
      container.appendChild(row);
      detail.querySelectorAll('input,textarea').forEach(inp => {
        inp.addEventListener('input', () => {
          row.querySelector('.cp-item-name').textContent = item.title || item.app || item.name || 'New item';
        });
      });
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'cp-add-btn'; addBtn.textContent = addLabel;
    addBtn.addEventListener('click', () => { items.push(createFn()); renderContent(); renderPreview(); save(); });
    container.appendChild(addBtn);
  }

  /* ── Preview ────────────────────────────────────────────── */
  function renderPreview() {
    const pv = $('cp-preview');
    if (!pv) return;
    if (!state.steps.length) {
      pv.innerHTML = '<div class="cp-empty-state"><h3>No steps defined yet</h3><p>Add steps and stakeholders to see the process blueprint preview.</p></div>';
      return;
    }
    const L = state.layers;
    const stepCols = state.steps.map((s, i) => {
      let html = '<th class="cp-step-col"><div class="cp-sh-cell">';
      html += '<span class="cp-sh-num">STEP ' + (i + 1) + '</span>';
      html += '<span class="cp-sh-name">' + S.esc(s.name || 'Untitled') + '</span>';
      html += '</div></th>';
      return html;
    }).join('');

    let rows = '';

    // UML rows
    if (L.uml) {
      state.stakeholders.forEach(sh => {
        const C = S.COLORS[sh.color] || S.COLORS.Blue;
        rows += '<tr>';
        rows += `<td class="cp-label-col cp-row-label cp-uml-label" style="border-left:3px solid ${C.dark}">
          <div class="cp-role-pill" style="color:${C.dark};border-color:${C.border};background:${C.light}">
            <div style="width:6px;height:6px;border-radius:50%;background:${C.dark}"></div>${S.esc(sh.label || sh.name)}
          </div>
          <div class="cp-rl-sub" style="color:rgba(255,255,255,.5)">${S.esc(sh.resp || '')}</div>
        </td>`;
        state.steps.forEach(s => {
          ensureStepData(s.id);
          const a = (state.actions[s.id] || {})[sh.id] || {};
          rows += `<td class="cp-uml-cell" style="border-left:3px solid ${C.dark}10">`;
          if (a.isBot) rows += `<span class="cp-bottleneck-warn">⚠ ${S.esc(a.botNote || 'Bottleneck')}</span>`;
          if (a.action) {
            rows += `<div class="cp-uml-action" style="background:${C.light};border-color:${C.border};color:${C.text}">${S.esc(a.action)}</div>`;
          }
          if (a.arrow) {
            rows += `<div class="cp-uml-arrow"><div class="cp-uml-arrow-line" style="background:${C.dark};color:${C.dark}"></div><span class="cp-uml-arrow-label" style="background:${C.light};color:${C.dark}">${S.esc(a.arrow)}</span></div>`;
          }
          if (!a.action && !a.arrow) rows += '<span class="cp-uml-empty">—</span>';
          rows += '</td>';
        });
        rows += '</tr>';
      });
    }

    // Duration row
    if (L.duration) {
      rows += '<tr class="cp-dv-vis"><td colspan="' + (state.steps.length + 1) + '">VISIBILITY LINE</td></tr>';
      rows += '<tr><td class="cp-label-col cp-row-label cp-dur-label"><div class="cp-rl-name" style="color:rgba(255,255,255,.7)">Duration</div></td>';
      state.steps.forEach(s => {
        const hasWorst = s.durWorst && s.durBest;
        rows += '<td class="cp-dur-cell">';
        rows += `<div class="cp-dur-big${hasWorst && parseInt(s.durWorst) > 5 ? ' warn' : ''}">${S.esc(s.durTyp || '—')}</div>`;
        if (hasWorst) {
          rows += '<div class="cp-dur-breakdown"><div class="cp-dur-row"><span>Best</span><span>' + S.esc(s.durBest) + '</span></div><div class="cp-dur-row"><span>Worst</span><span>' + S.esc(s.durWorst) + '</span></div></div>';
        }
        if (s.durDriver) rows += '<div class="cp-dur-sub">Driver: ' + S.esc(s.durDriver) + '</div>';
        rows += '</td>';
      });
      rows += '</tr>';
    }

    // Process row
    if (L.process) {
      rows += '<tr><td class="cp-label-col cp-row-label cp-proc-label"><div class="cp-rl-name">Documents</div><div class="cp-rl-sub">Output artifacts</div></td>';
      state.steps.forEach(s => {
        rows += '<td class="cp-proc-cell">';
        if (s.artifacts) {
          s.artifacts.split('\n').filter(l => l.trim()).forEach(l => {
            rows += '<div class="cp-artifact-card">' + S.esc(l.trim()) + '</div>';
          });
        } else {
          rows += '<div class="cp-empty-cell">—</div>';
        }
        rows += '</td>';
      });
      rows += '</tr>';
    }

    // Touchpoint row
    if (L.touchpoint) {
      rows += '<tr><td class="cp-label-col cp-row-label cp-tp-label"><div class="cp-rl-name">Touchpoints</div><div class="cp-rl-sub">Tools & channels</div></td>';
      state.steps.forEach(s => {
        ensureStepData(s.id);
        const tps = state.touchpoints[s.id] || [];
        rows += '<td class="cp-tp-cell">';
        if (tps.length) {
          tps.forEach(tp => {
            const chipClass = tp.dir === 'To client' ? 'cp-chip-external' : tp.dir === 'Two-way' ? 'cp-chip-twoway' : 'cp-chip-internal';
            rows += '<div class="cp-tp-card">';
            rows += '<div class="cp-tp-chips">';
            if (tp.chip) rows += '<span class="cp-tp-chip ' + chipClass + '">' + S.esc(tp.chip) + '</span>';
            rows += '</div>';
            if (tp.desc) rows += '<div class="cp-tp-desc">' + S.esc(tp.desc) + '</div>';
            if (tp.type) rows += '<div class="cp-tp-tag">' + S.esc(tp.type) + '</div>';
            rows += '</div>';
          });
        } else {
          rows += '<div class="cp-empty-cell">—</div>';
        }
        rows += '</td>';
      });
      rows += '</tr>';
    }

    // Pain row
    if (L.pain) {
      rows += '<tr class="cp-dv-int"><td colspan="' + (state.steps.length + 1) + '">INTERNAL ANALYSIS</td></tr>';
      rows += '<tr><td class="cp-label-col cp-row-label cp-pain-label"><div class="cp-rl-name">Pain Points</div><div class="cp-rl-sub">Issues & bottlenecks</div></td>';
      state.steps.forEach(s => {
        ensureStepData(s.id);
        const pains = state.pain[s.id] || [];
        rows += '<td class="cp-pain-cell">';
        if (pains.length) {
          pains.forEach(p => {
            const sevColors = { HIGH: '#B91C1C', MED: '#92400E', LOW: '#166534' };
            rows += '<div class="cp-pain-card-preview">';
            rows += '<div class="cp-pain-title">' + (p.sev === 'HIGH' ? '⚠ ' : '') + S.esc(p.title || 'Untitled') + '</div>';
            if ((p.types || []).length) {
              rows += '<div class="cp-pain-tags-row">';
              p.types.forEach(t => rows += '<span class="cp-pain-tag cp-pain-sev-' + (p.sev || 'low').toLowerCase() + '">' + S.esc(t) + '</span>');
              rows += '</div>';
            }
            if (p.desc) rows += '<div class="cp-pain-desc-preview">' + S.esc(p.desc) + '</div>';
            if (p.impact) rows += '<div class="cp-pain-impact">' + S.esc(p.impact) + '</div>';
            rows += '</div>';
          });
        } else {
          rows += '<div class="cp-empty-cell">—</div>';
        }
        rows += '</td>';
      });
      rows += '</tr>';
    }

    // Backend row
    if (L.backend) {
      rows += '<tr><td class="cp-label-col cp-row-label cp-be-label"><div class="cp-rl-name">Backend</div><div class="cp-rl-sub">Support systems</div></td>';
      state.steps.forEach(s => {
        ensureStepData(s.id);
        const bes = state.backend[s.id] || [];
        rows += '<td class="cp-be-cell">';
        if (bes.length) {
          bes.forEach(b => {
            rows += '<div class="cp-be-card">';
            if (b.cat) rows += '<span class="cp-be-badge">' + S.esc(b.cat) + '</span>';
            rows += '<div class="cp-be-desc"><strong>' + S.esc(b.name || '') + '</strong>' + (b.desc ? ' — ' + S.esc(b.desc) : '') + '</div>';
            if (b.dep) rows += '<div class="cp-be-dep">Depends on: ' + S.esc(b.dep) + '</div>';
            rows += '</div>';
          });
        } else {
          rows += '<div class="cp-empty-cell">—</div>';
        }
        rows += '</td>';
      });
      rows += '</tr>';
    }

    pv.innerHTML = '<table class="cp-bp-table"><thead><tr><th class="cp-label-col"></th>' + stepCols + '</tr></thead><tbody>' + rows + '</tbody></table>';
    renderSummaryStrip();
  }

  /* ── Summary Strip ──────────────────────────────────────── */
  function renderSummaryStrip() {
    const ownerEl    = document.getElementById('cp-sum-owner');
    const stepsEl    = document.getElementById('cp-sum-steps');
    const timeEl     = document.getElementById('cp-sum-time');
    const frictionEl = document.getElementById('cp-sum-friction');
    if (!ownerEl) return;

    ownerEl.textContent = state.info.owner || state.info.org || '—';
    stepsEl.textContent = state.steps.length || '—';

    // Aggregate typical durations (numeric days only)
    let totalDays = 0, hasDur = false;
    state.steps.forEach(s => {
      const m = (s.durTyp || '').match(/(\d+)/);
      if (m) { totalDays += parseInt(m[1]); hasDur = true; }
    });
    timeEl.textContent = hasDur ? totalDays + '+ days' : '—';

    // Count pain points across all steps
    let frictionCount = 0;
    Object.values(state.pain).forEach(arr => { frictionCount += (arr || []).length; });
    frictionEl.textContent = frictionCount || '—';
  }

  /* ── Item Row Factory ───────────────────────────────────── */
  function makeItemRow(item, type, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'cp-item-row'; wrap.dataset.id = item.id;
    // draggable is enabled dynamically via the handle mousedown (see setupDrag)
    let expanded = false;
    wrap.innerHTML = `<div class="cp-drag-handle" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
      <div class="cp-item-content">
        <div class="cp-item-name-row"><span class="cp-item-name"></span></div>
        <span class="cp-item-sub"></span>
        <div class="cp-item-detail"><div class="cp-item-detail-inner"></div></div>
      </div>
      <div class="cp-item-actions">
        <button class="cp-item-expand-btn" title="Toggle details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <button class="cp-item-del" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>`;

    const expandBtn = wrap.querySelector('.cp-item-expand-btn');
    const detail = wrap.querySelector('.cp-item-detail');
    expandBtn.addEventListener('click', () => {
      expanded = !expanded;
      detail.classList.toggle('open', expanded);
      const svg = expandBtn.querySelector('svg');
      if(svg) svg.style.transform = expanded ? 'rotate(180deg)' : '';
    });

    wrap.querySelector('.cp-item-del').addEventListener('click', () => {
      wrap.style.opacity = '0'; wrap.style.transform = 'translateX(-10px)'; wrap.style.transition = 'all .2s';
      setTimeout(() => {
        if (type === 'step') {
          state.steps = state.steps.filter(s => s.id !== item.id);
          if (contentStep === item.id) contentStep = state.steps[0]?.id || null;
          renderSteps(); renderContent();
        } else if (type === 'stkh') {
          state.stakeholders = state.stakeholders.filter(s => s.id !== item.id);
          renderStakeholders();
        } else {
          ['touchpoints', 'pain', 'backend'].forEach(k => {
            if (state[k][contentStep]) state[k][contentStep] = state[k][contentStep].filter(x => x.id !== item.id);
          });
          renderContent();
        }
        renderPreview(); save();
      }, 200);
    });
    return wrap;
  }

  /* ── Drag & Drop ────────────────────────────────────────── */
  function setupDrag(container, getArray, onChange) {
    if (container.dataset.dragInit) {
      container._dragOnChange = onChange;
      container._dragGetArray = getArray;
      return;
    }
    container.dataset.dragInit = 'true';
    container._dragOnChange = onChange;
    container._dragGetArray = getArray;

    let dragId = null, overEl = null, activeRow = null;

    // ── Enable draggable only via handle mousedown ──────────
    // Prevents browser from treating text/input clicks as a drag.
    container.addEventListener('mousedown', e => {
      const handle = e.target.closest('.cp-drag-handle');
      const row    = e.target.closest('.cp-item-row');
      if (handle && row) {
        row.draggable = true;
        activeRow = row;
      }
      // Note: do NOT reset draggable=false here on non-handle clicks —
      // that would cancel the drag before dragstart fires.
    });

    // Reset draggable on mouseup (if drag never started)
    document.addEventListener('mouseup', () => {
      if (activeRow) { activeRow.draggable = false; activeRow = null; }
    });

    // ── dragstart ───────────────────────────────────────────
    container.addEventListener('dragstart', e => {
      const row = e.target.closest('.cp-item-row');
      if (!row || !row.draggable) { e.preventDefault(); return; }

      dragId = row.dataset.id;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);

      // Ghost: clone the collapsed card header.
      // KEY: opacity must be > 0 (use 1 + top:-500px) so the browser
      // can render and capture the snapshot for setDragImage.
      // opacity:0 produces a fully transparent ghost and the browser
      // falls back to showing the entire draggable element.
      const ghost = row.cloneNode(true);
      const detail = ghost.querySelector('.cp-item-detail');
      if (detail) detail.remove();
      ghost.classList.remove('dragging');
      ghost.style.cssText = [
        'position:fixed',
        'top:-500px',          // off-screen above viewport — user won't see it
        'left:0',
        'opacity:1',           // MUST be > 0 for browser snapshot to work
        `width:${row.offsetWidth}px`,
        'pointer-events:none',
        'z-index:99999',
        'border-radius:12px',
        'box-shadow:0 8px 28px rgba(0,0,0,.45)',
        'transform:rotate(-1.5deg) scale(1.03)',
        'background:var(--kpmg-surface-container-lowest,#1f2937)',
        'border:1px solid rgba(96,165,250,.4)',
      ].join(';');
      document.body.appendChild(ghost);
      void ghost.offsetWidth; // force reflow so dimensions are accurate
      e.dataTransfer.setDragImage(ghost, Math.round(ghost.offsetWidth / 2), 28);
      // Wait 100ms before removing — browser needs time to capture the snapshot
      setTimeout(() => ghost.remove(), 100);
    });

    // ── dragend ─────────────────────────────────────────────
    container.addEventListener('dragend', () => {
      container.querySelectorAll('.cp-item-row').forEach(r => {
        r.classList.remove('dragging', 'drag-over');
        r.draggable = false;
      });
      dragId = null; overEl = null; activeRow = null;
    });

    // ── dragover (required to allow drop) ───────────────────
    container.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const row = e.target.closest('.cp-item-row');
      if (!row || row.dataset.id === dragId) return;
      if (overEl && overEl !== row) overEl.classList.remove('drag-over');
      overEl = row;
      row.classList.add('drag-over');
    });

    // ── drop ────────────────────────────────────────────────
    container.addEventListener('drop', e => {
      e.preventDefault();
      const targetId = overEl?.dataset.id;
      if (!targetId || targetId === dragId) return;
      const arr = container._dragGetArray();
      const fi = arr.findIndex(x => x.id === dragId);
      const ti = arr.findIndex(x => x.id === targetId);
      if (fi < 0 || ti < 0) return;
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      container._dragOnChange();
    });
  }


  /* ── Field Builders ─────────────────────────────────────── */
  function mkField(label, type, val, id, placeholder) {
    if (type === 'textarea')
      return '<div class="cp-field-group"><div class="cp-field-label">' + label + '</div><textarea class="cp-textarea" id="' + id + '" rows="2" placeholder="' + placeholder + '">' + S.esc(val) + '</textarea></div>';
    return '<div class="cp-field-group"><div class="cp-field-label">' + label + '</div><input class="cp-input" type="text" id="' + id + '" value="' + S.esc(val).replace(/"/g, '&quot;') + '" placeholder="' + placeholder + '"></div>';
  }

  function mkSelect(label, opts, selected, id) {
    const optHtml = opts.map(v => '<option' + (selected === v ? ' selected' : '') + '>' + v + '</option>').join('');
    return '<div class="cp-field-group"><div class="cp-field-label">' + label + '</div><select class="cp-select" id="' + id + '">' + optHtml + '</select></div>';
  }

  /* ── Zoom Controls ──────────────────────────────────────── */
  function initZoom() {
    const outer = $('cp-preview-outer');
    const wrap = $('cp-preview-wrap');
    $('cp-zoom-in')?.addEventListener('click', () => { zoom = Math.min(zoom + 0.1, 3); applyZoom(); });
    $('cp-zoom-out')?.addEventListener('click', () => { zoom = Math.max(zoom - 0.1, 0.2); applyZoom(); });
    $('cp-zoom-fit')?.addEventListener('click', () => {
      const table = $('cp-preview').querySelector('.cp-bp-table');
      if (!table) { zoom = 1; applyZoom(); return; }
      const fit = Math.min((outer.clientWidth - 40) / table.offsetWidth, (outer.clientHeight - 40) / table.offsetHeight, 2);
      zoom = Math.max(0.2, fit); applyZoom();
    });

    outer?.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom = Math.max(0.2, Math.min(3, zoom - (e.deltaY * 0.001))); applyZoom(); }
    }, { passive: false });

    // Pan
    let panning = false, panX = 0, panY = 0, scrollX = 0, scrollY = 0;
    outer?.addEventListener('mousedown', e => { if (e.button !== 0) return; panning = true; panX = e.clientX; panY = e.clientY; scrollX = outer.scrollLeft; scrollY = outer.scrollTop; });
    window.addEventListener('mousemove', e => { if (!panning) return; outer.scrollLeft = scrollX - (e.clientX - panX); outer.scrollTop = scrollY - (e.clientY - panY); });
    window.addEventListener('mouseup', () => panning = false);
  }

  function applyZoom() {
    const wrap = $('cp-preview-wrap');
    if (wrap) wrap.style.transform = 'scale(' + zoom + ')';
    const label = $('cp-zoom-label');
    if (label) label.textContent = Math.round(zoom * 100) + '%';
  }

  /* ── View Controls ──────────────────────────────────────── */
  function initViewControls() {
    const el = $('cp-view-controls');
    if (!el) {
      initLayers();
      return;
    }
    el.innerHTML = '';

    // Mode group: Leadership / Detailed
    const modeGroup = document.createElement('div');
    modeGroup.className = 'cp-view-mode-group';
    ['Leadership', 'Detailed'].forEach(mode => {
      const btn = document.createElement('button');
      btn.className = 'cp-view-mode-btn' + (viewMode === mode.toLowerCase() ? ' active' : '');
      btn.textContent = mode + ' view';
      btn.addEventListener('click', () => {
        viewMode = mode.toLowerCase();
        el.querySelectorAll('.cp-view-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
        if (viewMode === 'leadership') {
          state.layers.pain    = false;
          state.layers.backend = false;
        } else {
          state.layers.pain    = true;
          state.layers.backend = true;
        }
        el.querySelectorAll('.cp-view-toggle-label input').forEach(inp => {
          inp.checked = state.layers[inp.dataset.key] !== false;
        });
        renderPreview(); save();
      });
      modeGroup.appendChild(btn);
    });
    el.appendChild(modeGroup);

    // Individual toggles for pain / backend / touchpoint
    const toggleLayers = [
      { key: 'pain',       label: 'Show pain points' },
      { key: 'backend',    label: 'Show systems' },
      { key: 'touchpoint', label: 'Show touchpoints' },
    ];
    toggleLayers.forEach(l => {
      const label = document.createElement('label');
      label.className = 'cp-view-toggle-label';
      const span = document.createElement('span');
      span.textContent = l.label;
      const inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.dataset.key = l.key;
      inp.checked = state.layers[l.key] !== false;
      inp.addEventListener('change', e => {
        state.layers[l.key] = e.target.checked;
        renderPreview(); save();
      });
      label.appendChild(span);
      label.appendChild(inp);
      el.appendChild(label);
    });
  }

  /* ── Layer Toggles (legacy fallback) ──────────────────── */
  function initLayers() {
    const el = $('cp-layers');
    if (!el) return;
    el.innerHTML = '';
    S.LAYERS.forEach(l => {
      const label = document.createElement('label');
      label.className = 'cp-layer-toggle';
      label.innerHTML = '<input type="checkbox" ' + (state.layers[l.key] ? 'checked' : '') + '> <span>' + l.label + '</span>';
      label.querySelector('input').addEventListener('change', e => { state.layers[l.key] = e.target.checked; renderPreview(); save(); });
      el.appendChild(label);
    });
  }

  /* ── Export PDF ──────────────────────────────────────────── */
  async function exportPDF() {
    const btn = $('cp-export-btn');
    if (!btn) return;
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 0;

      // Colors matching KPMG styling from other sheets
      const NAVY = [0, 32, 95];
      const BLUE = [0, 99, 151];
      const TEAL = [0, 184, 169];
      const AMBER = [243, 156, 18];
      const GREEN = [15, 110, 86];
      const LIGHT_BG = [252, 249, 248];
      const BORDER = [235, 231, 231];
      const TEXT = [28, 27, 27];
      const MUTED = [116, 118, 131];
      const WHITE = [255, 255, 255];
      
      const processName = state.info.name || 'Process Blueprint';
      const processOrg = state.info.org || 'N/A';
      const processOwner = state.info.owner || 'N/A';
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      function addPageHeader() {
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setFontSize(7);
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('KPMG AI Intelligence Hub', margin, 8);
        doc.setFont('helvetica', 'normal');
        doc.text('Process Blueprint — ' + processName, pageW - margin, 8, { align: 'right' });
        y = 20;
      }

      function checkPageBreak(needed) {
        if (y + needed > pageH - 16) { doc.addPage(); addPageHeader(); }
      }

      // Title & Summary
      addPageHeader();
      
      doc.setFontSize(18);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(processName, margin, y + 5);
      
      doc.setFontSize(10);
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(state.info.desc || 'No description provided', margin, y + 12, { maxWidth: pageW - margin * 2 });
      
      y += 24;

      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.roundedRect(margin, y, pageW - margin * 2, 16, 2, 2, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('OWNER', margin + 4, y + 6);
      doc.text('STEPS', margin + 60, y + 6);
      doc.text('ORGANISATION', margin + 116, y + 6);
      doc.text('DATE', margin + 172, y + 6);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
      doc.text(processOwner, margin + 4, y + 12);
      doc.text(state.steps.length.toString(), margin + 60, y + 12);
      doc.text(processOrg, margin + 116, y + 12);
      doc.text(dateStr, margin + 172, y + 12);
      
      y += 24;

      if (state.steps.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text('No steps defined yet.', margin, y);
      } else {
        // Build autoTable headers
        const headRow = ['Layer'];
        state.steps.forEach((step, i) => {
           headRow.push(`STEP ${i+1}\n${step.name}`);
        });

        const bodyData = [];

        // Stakeholders
        state.stakeholders.forEach(sh => {
           const row = [`${sh.label}\n${sh.name}\n${sh.resp}`];
           state.steps.forEach(step => {
              const act = state.actions[step.id]?.[sh.id];
              let cellTxt = '';
              if (act) {
                 cellTxt = act.action;
                 if (act.isBot) cellTxt += '\n\n[!] Bottleneck: ' + (act.botNote || '');
                 if (act.arrow) cellTxt += '\n\n-> ' + act.arrow;
              }
              row.push(cellTxt);
           });
           bodyData.push(row);
        });

        // Duration Layer
        if (state.layers.dur !== false) {
           const durRow = ['Duration'];
           state.steps.forEach(step => {
              let cellTxt = step.durTyp ? `Type: ${step.durTyp}` : '';
              if (step.durBest || step.durWorst) {
                 if (cellTxt) cellTxt += '\n';
                 cellTxt += `Range: ${step.durBest} - ${step.durWorst}`;
              }
              if (step.durDriver) {
                 if (cellTxt) cellTxt += '\n';
                 cellTxt += `Driver: ${step.durDriver}`;
              }
              durRow.push(cellTxt);
           });
           bodyData.push(durRow);
        }

        // Documents Layer
        if (state.layers.docs !== false) {
           const docRow = ['Documents & Inputs'];
           state.steps.forEach(step => {
              docRow.push(step.artifacts || '');
           });
           bodyData.push(docRow);
        }

        // Touchpoints Layer
        if (state.layers.tp !== false) {
           const tpRow = ['Touchpoints'];
           state.steps.forEach(step => {
              const tps = state.touchpoints[step.id] || [];
              const cellTxt = tps.map(tp => `[${tp.chip}] ${tp.type} - ${tp.dir}\nApp: ${tp.app}\n${tp.desc}`).join('\n\n');
              tpRow.push(cellTxt);
           });
           bodyData.push(tpRow);
        }

        // Pain Points Layer
        if (state.layers.pain !== false) {
           const painRow = ['Pain Points'];
           state.steps.forEach(step => {
              const pains = state.pain[step.id] || [];
              const cellTxt = pains.map(p => `[${p.sev}] ${p.title}\nTypes: ${(p.types||[]).join(', ')}\nImpact: ${p.impact}`).join('\n\n');
              painRow.push(cellTxt);
           });
           bodyData.push(painRow);
        }

        // Backend Layer
        if (state.layers.backend !== false) {
           const beRow = ['Backend Systems'];
           state.steps.forEach(step => {
              const bes = state.backend[step.id] || [];
              const cellTxt = bes.map(b => `[${b.cat}] ${b.name}\n${b.desc}\nDep: ${b.dep}`).join('\n\n');
              beRow.push(cellTxt);
           });
           bodyData.push(beRow);
        }

        doc.autoTable({
          startY: y,
          head: [headRow],
          body: bodyData,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 3, textColor: TEXT, lineColor: BORDER, lineWidth: 0.1 },
          headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: LIGHT_BG },
          columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold', textColor: NAVY } },
          didDrawPage: function () { addPageHeader(); },
        });
        
        y = doc.lastAutoTable.finalY + 10;
      }

      // Footer
      var totalPages = doc.internal.getNumberOfPages();
      for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text('Page ' + p + ' of ' + totalPages + '  |  KPMG AI Intelligence Hub', pageW / 2, pageH - 7, { align: 'center' });
      }

      const fileName = processName.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
      doc.save(fileName);

      if (window.Toast) Toast.showToast('success', 'Blueprint PDF downloaded');
    } catch (e) {
      console.error(e);
      if (window.Toast) Toast.showToast('error', 'PDF export failed', { description: e.message });
    } finally {
      if (btn) {
        btn.textContent = 'Export PDF';
        btn.disabled = false;
      }
    }
  }

  /* ── Clear Workspace ────────────────────────────────────── */
  function clearWorkspace() {
    if (!confirm('Clear all data and start fresh?')) return;
    state = S.defaultState();
    contentStep = null;
    save();
    switchTab('info');
    renderPreview();
    if (window.Toast) Toast.showToast('success', 'Workspace cleared');
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (window.AppShell) AppShell.init();
    if (typeof ThemeManager !== 'undefined') ThemeManager.initTheme();
    load();

    // Tabs
    document.querySelectorAll('.cp-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Content subtabs
    document.querySelectorAll('.cp-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        contentSubtab = btn.dataset.st;
        document.querySelectorAll('.cp-subtab').forEach(b => b.classList.toggle('active', b === btn));
        renderContent();
      });
    });

    // Info fields
    ['name', 'desc', 'org', 'owner'].forEach(k => {
      const el = $('cp-info-' + k);
      if (el) el.addEventListener('input', e => {
        state.info[k] = e.target.value;
        const nameInp = $('cp-bp-name');
        if (k === 'name' && nameInp) nameInp.value = e.target.value;
        save();
      });
    });

    // Toolbar name
    const bpName = $('cp-bp-name');
    if (bpName) {
      bpName.value = state.info.name || '';
      bpName.addEventListener('input', e => {
        state.info.name = e.target.value;
        $('cp-info-name').value = e.target.value;
        save();
      });
    }

    // Add buttons
    $('cp-add-step')?.addEventListener('click', () => {
      const id = S.uid();
      state.steps.push({ id, name: 'New Step', durTyp: '', durBest: '', durWorst: '', durDriver: '', artifacts: '' });
      state.actions[id] = {}; state.touchpoints[id] = []; state.pain[id] = []; state.backend[id] = [];
      renderSteps(); renderContent(); renderPreview(); save();
    });

    $('cp-add-stakeholder')?.addEventListener('click', () => {
      const colors = Object.keys(S.COLORS);
      const used = new Set(state.stakeholders.map(s => s.color));
      const available = colors.find(c => !used.has(c)) || colors[0];
      state.stakeholders.push({ id: S.uid(), name: 'New Role', label: 'NR', resp: '', color: available });
      renderStakeholders(); renderPreview(); save();
    });

    // Export & Clear
    $('cp-export-btn')?.addEventListener('click', exportPDF);
    $('cp-clear-btn')?.addEventListener('click', clearWorkspace);
    
    // Toggle Left Panel
    $('cp-toggle-panel')?.addEventListener('click', () => {
      const ws = document.querySelector('.cp-workspace');
      const tb = document.querySelector('.cp-workspace-toolbar');
      if (ws) ws.classList.toggle('left-panel-collapsed');
      if (tb) tb.classList.toggle('left-panel-collapsed');
    });

    initZoom();
    initViewControls();
    renderPreview();

    // Sync toolbar name if state loaded
    const bpName2 = $('cp-bp-name');
    if (bpName2 && state.info.name) bpName2.value = state.info.name;
  }

  const pv = null; // will be resolved at runtime via $

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
