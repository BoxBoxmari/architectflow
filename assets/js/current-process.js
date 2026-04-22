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

  /* ── DOM helper ─────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  /* ── Save / Load ────────────────────────────────────────── */
  function save() {
    try {
      localStorage.setItem(S.STORAGE_KEY, JSON.stringify(state));
      const badge = $('cp-saved');
      if (badge) { badge.classList.add('show'); setTimeout(() => badge.classList.remove('show'), 1500); }
    } catch (e) { /* quota exceeded */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(S.STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.steps) state = saved;
      }
    } catch (e) { /* parse error */ }
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
    setupDrag(el, state.steps, () => { renderSteps(); renderContent(); renderPreview(); save(); });
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
    setupDrag(el, state.stakeholders, () => { renderStakeholders(); renderPreview(); save(); });
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
        <span style="font-size:10px;color:var(--kpmg-on-surface-variant)">${S.esc(sh.name)}</span>
        <span class="cp-fs-chevron">▾</span>
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
        wrap.querySelector('.cp-fs-chevron').textContent = b.classList.contains('open') ? '▴' : '▾';
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
      if (s.durTyp) html += '<span class="cp-sh-dur">' + S.esc(s.durTyp) + '</span>';
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
              p.types.forEach(t => rows += '<span class="cp-pain-tag" style="background:rgba(200,75,90,0.1);color:' + (sevColors[p.sev] || '#666') + '">' + S.esc(t) + '</span>');
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
            if (b.cat) rows += '<span class="cp-be-badge" style="background:rgba(243,156,18,0.1);color:#92400E;border-color:rgba(243,156,18,0.3)">' + S.esc(b.cat) + '</span>';
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
  }

  /* ── Item Row Factory ───────────────────────────────────── */
  function makeItemRow(item, type, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'cp-item-row'; wrap.dataset.id = item.id; wrap.draggable = true;
    let expanded = false;
    wrap.innerHTML = `<div class="cp-drag-handle" title="Drag to reorder">⠿</div>
      <div class="cp-item-content">
        <div class="cp-item-name-row"><span class="cp-item-name"></span></div>
        <span class="cp-item-sub"></span>
        <div class="cp-item-detail"><div class="cp-item-detail-inner"></div></div>
      </div>
      <button class="cp-item-expand-btn" title="Expand">▾</button>
      <button class="cp-item-del" title="Delete">✕</button>`;

    const expandBtn = wrap.querySelector('.cp-item-expand-btn');
    const detail = wrap.querySelector('.cp-item-detail');
    expandBtn.addEventListener('click', () => {
      expanded = !expanded;
      detail.classList.toggle('open', expanded);
      expandBtn.textContent = expanded ? '▴' : '▾';
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
  function setupDrag(container, dataArr, onChange) {
    let dragId = null, overEl = null;
    container.addEventListener('dragstart', e => {
      const row = e.target.closest('.cp-item-row');
      if (!row) return;
      dragId = row.dataset.id;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);
    });
    container.addEventListener('dragend', () => {
      container.querySelectorAll('.cp-item-row').forEach(r => r.classList.remove('dragging', 'drag-over'));
      dragId = null; overEl = null;
    });
    container.addEventListener('dragover', e => {
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      const row = e.target.closest('.cp-item-row');
      if (!row || row.dataset.id === dragId) return;
      if (overEl && overEl !== row) overEl.classList.remove('drag-over');
      overEl = row; row.classList.add('drag-over');
    });
    container.addEventListener('drop', e => {
      e.preventDefault();
      const targetId = overEl?.dataset.id;
      if (!targetId || targetId === dragId) return;
      const fi = dataArr.findIndex(x => x.id === dragId);
      const ti = dataArr.findIndex(x => x.id === targetId);
      if (fi < 0 || ti < 0) return;
      const [item] = dataArr.splice(fi, 1);
      dataArr.splice(ti, 0, item);
      onChange();
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
      const table = pv.querySelector('.cp-bp-table');
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

  /* ── Layer Toggles ──────────────────────────────────────── */
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

  /* ── Export HTML ─────────────────────────────────────────── */
  function exportHTML() {
    const preview = $('cp-preview').innerHTML;
    const name = state.info.name || 'Process Blueprint';
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${S.esc(name)}</title>
<style>body{font-family:'Inter',system-ui,sans-serif;background:#FAFAFA;padding:24px;min-width:900px}
.cp-bp-table{border-collapse:collapse;border:1px solid #D8D8D4;border-radius:10px;overflow:hidden;table-layout:fixed}
.cp-bp-table th,.cp-bp-table td{border:0.5px solid #D8D8D4;vertical-align:top;padding:0}
.cp-label-col{width:112px}.cp-step-col{min-width:200px;width:200px}</style>
</head><body>
<div style="margin-bottom:16px"><h1 style="font-size:18px;font-weight:600">${S.esc(name)}</h1>${state.info.org ? '<div style="font-size:11px;color:#6B6B6B;margin-top:2px">' + S.esc(state.info.org) + '</div>' : ''}</div>
<div style="overflow-x:auto">${preview}</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name.replace(/[^a-zA-Z0-9]/g, '_') + '-blueprint.html';
    a.click();
    if (window.Toast) Toast.show('Blueprint exported');
  }

  /* ── Clear Workspace ────────────────────────────────────── */
  function clearWorkspace() {
    if (!confirm('Clear all data and start fresh?')) return;
    state = S.defaultState();
    contentStep = null;
    save();
    switchTab('info');
    renderPreview();
    if (window.Toast) Toast.show('Workspace cleared');
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
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
    $('cp-export-btn')?.addEventListener('click', exportHTML);
    $('cp-clear-btn')?.addEventListener('click', clearWorkspace);

    initZoom();
    initLayers();
    renderPreview();
  }

  const pv = null; // will be resolved at runtime via $

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
