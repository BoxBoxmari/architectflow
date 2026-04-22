/**
 * current-process-schema.js — Schema and defaults for Current Process Blueprint.
 * Exposes window.CPSchema for use by current-process.js.
 * All labels in English — no domain-specific wording.
 */

window.CPSchema = (() => {
  'use strict';

  const STORAGE_KEY = 'architectflow.currentProcess.v1';

  /* ── Color palette for stakeholders ────────────────────── */
  const COLORS = {
    Blue:   { dark: '#2563EB', light: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
    Teal:   { dark: '#0D9488', light: '#CCFBF1', border: '#5EEAD4', text: '#0F766E' },
    Amber:  { dark: '#D97706', light: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    Purple: { dark: '#7C3AED', light: '#F3F0FF', border: '#DDD6FE', text: '#5B21B6' },
    Green:  { dark: '#16A34A', light: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
    Coral:  { dark: '#DC4A2A', light: '#FFF1EE', border: '#FED7AA', text: '#9A3412' },
    Pink:   { dark: '#DB2777', light: '#FDF2F8', border: '#FBCFE8', text: '#9D174D' },
    Gray:   { dark: '#6B7280', light: '#F9FAFB', border: '#E5E7EB', text: '#374151' },
  };

  /* ── Pain type taxonomy ────────────────────────────────── */
  const PAIN_TYPES = ['BOTTLENECK', 'SLOW DECISION', 'OVERLOAD', 'REPETITIVE', 'DELAY', 'QUALITY', 'OPPORTUNITY LOSS'];

  /* ── Backend categories ────────────────────────────────── */
  const BE_CATS = ['Risk / Compliance', 'IT / Infra', 'Admin', 'Finance', 'HR', 'Legal', 'Knowledge Mgmt', 'CRM', 'Operations'];

  /* ── Tab definitions ───────────────────────────────────── */
  const TABS = [
    { id: 'info',         label: 'Overview' },
    { id: 'steps',        label: 'Steps' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'content',      label: 'Workflow Content' },
  ];

  /* ── Content subtab definitions ─────────────────────────── */
  const CONTENT_SUBTABS = [
    { id: 'actions',     label: 'Actions' },
    { id: 'touchpoints', label: 'Touchpoints' },
    { id: 'pain',        label: 'Pain Points' },
    { id: 'backend',     label: 'Backend / Support' },
  ];

  /* ── Preview layers ─────────────────────────────────────── */
  const LAYERS = [
    { key: 'uml',        label: 'UML Stakeholder Diagram' },
    { key: 'duration',   label: 'Duration Row' },
    { key: 'process',    label: 'Process / Documents' },
    { key: 'touchpoint', label: 'Touchpoints' },
    { key: 'pain',       label: 'Pain Points' },
    { key: 'backend',    label: 'Backend / Support Systems' },
  ];

  /* ── Default empty state ────────────────────────────────── */
  function defaultState() {
    return {
      info: { name: '', desc: '', org: '', owner: '' },
      layers: { uml: true, duration: true, process: true, touchpoint: true, pain: true, backend: true },
      steps: [],
      stakeholders: [],
      actions: {},
      touchpoints: {},
      pain: {},
      backend: {},
    };
  }

  /* ── Unique ID generator ────────────────────────────────── */
  function uid() {
    return 'id' + Math.random().toString(36).slice(2, 8);
  }

  /* ── HTML escaper ───────────────────────────────────────── */
  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    STORAGE_KEY,
    COLORS,
    PAIN_TYPES,
    BE_CATS,
    TABS,
    CONTENT_SUBTABS,
    LAYERS,
    defaultState,
    uid,
    esc,
  };
})();
