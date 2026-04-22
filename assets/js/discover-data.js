/**
 * discover-data.js — Data layer for Discover module.
 * Exposes window.DiscoverData for use by discover.js.
 */

window.DiscoverData = (() => {
  'use strict';

  /* ── Cost & capacity constants ─────────────────────────── */
  const HOURLY_RATE = 15;        // USD per hour (blended rate)
  const WORKING_DAYS = 21;       // per month
  const HOURS_PER_DAY = 8;

  /* ── Functions ─────────────────────────────────────────── */
  const FUNCTIONS = [
    { id: 'audit',     name: 'Audit',           headcount: 520 },
    { id: 'tax',       name: 'Tax & Legal',     headcount: 450 },
    { id: 'deal',      name: 'Deal',            headcount: 180 },
    { id: 'consulting',name: 'Consulting',      headcount: 350 },
    { id: 'shared',    name: 'Shared Services', headcount: 300 },
  ];

  /* ── Pain areas ────────────────────────────────────────── */
  const PAINS = [
    { id: 'research',   name: 'Manual research',               desc: 'Searching regulations, precedents, comparables across multiple sources',               color: '#00338D' },
    { id: 'drafting',   name: 'Repetitive drafting',            desc: 'Writing reports, memos, proposals, emails from scratch each time',                     color: '#00B8A9' },
    { id: 'review',     name: 'Quality review burden',          desc: 'High rework rate, manual checking, multi-stage review loops',                           color: '#F39C12' },
    { id: 'turnaround', name: 'Slow turnaround',                desc: 'Clients waiting too long, deadline pressure, sequential bottlenecks',                   color: '#E74C3C' },
    { id: 'knowledge',  name: 'Knowledge trapped in people',    desc: 'Expertise locked in senior heads, hard to train juniors, tribal knowledge',             color: '#8E44AD' },
    { id: 'data',       name: 'Data & compliance processing',   desc: 'Classification, extraction, validation of structured data at volume',                   color: '#2C3E50' },
  ];

  /* ── Workflows keyed by pain id ────────────────────────── */
  const WORKFLOWS = {
    research: [
      { name: 'Tax regulation lookup',       time: 45,  freq: 10, people: 15, save: 40 },
      { name: 'Comparable company search',   time: 60,  freq: 6,  people: 10, save: 45 },
      { name: 'Legal precedent research',    time: 90,  freq: 4,  people: 8,  save: 35 },
      { name: 'Market & industry analysis',  time: 120, freq: 3,  people: 12, save: 30 },
    ],
    drafting: [
      { name: 'Report & memo drafting',          time: 60,  freq: 8,  people: 20, save: 40 },
      { name: 'Email & client correspondence',   time: 15,  freq: 20, people: 25, save: 50 },
      { name: 'Proposal & pitch writing',         time: 180, freq: 2,  people: 10, save: 35 },
      { name: 'Workpaper preparation',            time: 45,  freq: 10, people: 15, save: 40 },
    ],
    review: [
      { name: 'Contract clause review',            time: 90,  freq: 4,  people: 8,  save: 40 },
      { name: 'Engagement quality review',         time: 60,  freq: 6,  people: 12, save: 30 },
      { name: 'Data validation & reconciliation',  time: 30,  freq: 15, people: 10, save: 50 },
      { name: 'Compliance checklist verification', time: 45,  freq: 8,  people: 6,  save: 45 },
    ],
    turnaround: [
      { name: 'Client query response',     time: 30,  freq: 12, people: 20, save: 50 },
      { name: 'Deliverable assembly',      time: 120, freq: 4,  people: 10, save: 35 },
      { name: 'Approval workflow routing',  time: 20,  freq: 15, people: 8,  save: 60 },
    ],
    knowledge: [
      { name: 'Policy & procedure Q&A',        time: 15,  freq: 20, people: 30, save: 60 },
      { name: 'Technical advisory lookup',     time: 45,  freq: 8,  people: 12, save: 40 },
      { name: 'Training content generation',   time: 90,  freq: 3,  people: 5,  save: 35 },
      { name: 'Onboarding knowledge transfer', time: 60,  freq: 2,  people: 8,  save: 40 },
    ],
    data: [
      { name: 'Tax / HS code classification',     time: 30,  freq: 15, people: 10, save: 50 },
      { name: 'Document data extraction',          time: 20,  freq: 25, people: 8,  save: 55 },
      { name: 'Financial data processing',         time: 45,  freq: 10, people: 6,  save: 40 },
      { name: 'Regulatory filing preparation',     time: 60,  freq: 4,  people: 10, save: 35 },
    ],
  };

  /* ── Utility functions ─────────────────────────────────── */
  function formatCurrency(n) {
    if (n >= 1e6) return '$' + (Math.round(n / 1e5) / 10).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (Math.round(n / 100) / 10).toFixed(1) + 'K';
    return '$' + Math.round(n);
  }

  function formatNumber(n) {
    return Math.round(n).toLocaleString();
  }

  function calcHoursSaved(people, freq, timeMin, savePct) {
    return people * freq * timeMin * (savePct / 100) / 60;
  }

  function calcMonthlyCost(hours) {
    return hours * HOURLY_RATE;
  }

  function calcFTE(hours) {
    return hours / (WORKING_DAYS * HOURS_PER_DAY);
  }

  return {
    HOURLY_RATE,
    WORKING_DAYS,
    HOURS_PER_DAY,
    FUNCTIONS,
    PAINS,
    WORKFLOWS,
    formatCurrency,
    formatNumber,
    calcHoursSaved,
    calcMonthlyCost,
    calcFTE,
  };
})();
