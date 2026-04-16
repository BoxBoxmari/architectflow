'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Download, Share2, TrendingUp, TrendingDown, Users, Zap, ChevronRight, X, Target, Layers, HelpCircle, CheckCircle2, ArrowUpRight,  } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DrawerContent {
  title: string;
  subtitle: string;
  color: string;
  items: { label: string; detail: string }[];
  insight: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const METRICS = [
  {
    id: 'm1',
    label: 'Use Cases Active',
    value: '47',
    unit: '',
    delta: '+12 this quarter',
    trend: 'up',
    color: '#006397',
  },
  {
    id: 'm2',
    label: 'Adoption Rate',
    value: '68',
    unit: '%',
    delta: '+9pp vs prior period',
    trend: 'up',
    color: '#0F6E56',
  },
  {
    id: 'm3',
    label: 'Value Realised',
    value: '$14.2M',
    unit: '',
    delta: 'Annualised run-rate',
    trend: 'up',
    color: '#0F6E56',
  },
  {
    id: 'm4',
    label: 'Platform Cost',
    value: '$2.1M',
    unit: '',
    delta: '−8% vs budget',
    trend: 'down',
    color: '#45004F',
  },
];

const FOCUS_ITEMS = [
  { label: 'Use Case', trend: 'up', detail: '47 active use cases across 8 functions' },
  { label: 'Adoption', trend: 'up', detail: '68% workforce adoption, target 80% by Q3' },
  { label: 'Value', trend: 'up', detail: '$14.2M annualised value realised' },
  { label: 'Platform Cost', trend: 'down', detail: '$2.1M, 8% under budget' },
];

const ACTION_GROUPS = [
  {
    team: 'AI Function Core Team',
    items: ['Measure use case values', 'Use case portfolio management'],
  },
  {
    team: 'AI Service Line Team',
    items: ['Implementation oversight', 'Testing, Pilot, Appy, Scale'],
  },
  {
    team: 'Employees',
    items: ['Skill training programmes', 'Quality feedback loops', 'Adoption rate tracking'],
  },
];

const SUPPORT_DATA = {
  firmTeams: 'AI Innovation, KDC, L&D, QRM, NITSO',
  tools: 'AI management template package · Functional AI Platform · Copilot · alQChat · Workbench',
};

const QUESTIONS = [
  'Who are best for "AI-enabled workflow" programme?',
  'Your top 3 areas can free up human capacity?',
  'How to speed up AI use case enablement?',
  'How to avoid AI is just "optional"?',
  'How use cases can be 100% adopted daily?',
];

const DRAWER_CONTENT: Record<string, DrawerContent> = {
  focus: {
    title: 'Focus Quadrant',
    subtitle: 'Strategic priorities driving AI scaling',
    color: '#7B2FBE',
    items: [
      { label: 'Use Case Portfolio', detail: '47 active use cases; 12 new this quarter across Tax, Audit, and Advisory.' },
      { label: 'Adoption Trajectory', detail: '68% workforce adoption. Target 80% by end of Q3 2025.' },
      { label: 'Value Realisation', detail: '$14.2M annualised run-rate. Top contributors: Audit automation (+$5.1M) and Tax AI (+$3.8M).' },
      { label: 'Platform Cost Efficiency', detail: '$2.1M spend, 8% under budget. Savings reinvested into L&D programmes.' },
    ],
    insight: 'The portfolio is on track. Adoption velocity is the primary lever to unlock the next $5M in value.',
  },
  action: {
    title: 'Action Quadrant',
    subtitle: 'Team responsibilities and execution model',
    color: '#006397',
    items: [
      { label: 'AI Function Core Team', detail: 'Owns use case measurement and portfolio governance. Weekly cadence with function leads.' },
      { label: 'AI Service Line Team', detail: 'Drives implementation, pilot design, and scale-up. Embedded in each service line.' },
      { label: 'Employee Enablement', detail: 'Skill training via KDC. Quality feedback loops feed directly into model improvement cycles.' },
    ],
    insight: "Clear ownership at each layer prevents the \"everyone's responsible, no one's accountable\" failure mode.",
  },
  support: {
    title: 'Support Ecosystem',
    subtitle: 'Firm infrastructure enabling AI at scale',
    color: '#00205F',
    items: [
      { label: 'AI Innovation', detail: 'Central CoE providing architecture standards, model governance, and innovation pipeline.' },
      { label: 'KDC (Knowledge & Development)', detail: 'Delivers AI literacy programmes and role-specific upskilling paths.' },
      { label: 'QRM & NITSO', detail: 'Risk management and IT security oversight for all AI deployments.' },
      { label: 'Tooling Stack', detail: 'Functional AI Platform, Copilot, alQChat, Workbench — unified under one governance framework.' },
    ],
    insight: 'The support ecosystem is the invisible infrastructure. Without it, adoption stalls at the pilot stage.',
  },
  question: {
    title: 'Strategic Questions',
    subtitle: 'Board-level questions driving the agenda',
    color: '#C0006A',
    items: [
      { label: 'Q1 — Workflow Programme', detail: 'Identify top 10 roles where AI-enabled workflows reduce manual effort by >30%.' },
      { label: 'Q2 — Human Capacity', detail: 'Map the top 3 functions where AI can free 20%+ of capacity for higher-value work.' },
      { label: 'Q3 — Use Case Velocity', detail: 'Reduce time-to-production for new use cases from 14 weeks to 8 weeks.' },
      { label: 'Q4 — Avoiding Optionality', detail: 'Embed AI usage into performance frameworks and team KPIs.' },
      { label: 'Q5 — Daily Adoption', detail: 'Design habit-forming workflows so AI tools are used in every client engagement.' },
    ],
    insight: 'These five questions are the CEO test. If leadership can answer them confidently, AI scaling is on track.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScalingAIFrameworkPage() {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  const openDrawer = (key: string) => setActiveDrawer(key);
  const closeDrawer = () => setActiveDrawer(null);

  const drawerData = activeDrawer ? DRAWER_CONTENT[activeDrawer] : null;

  return (
    <AppLayout activeRoute="/scaling-ai-framework">
      <main id="main-content" aria-label="Scaling AI Implementation Framework">
        <div className="space-y-10 animate-fade-in">

          {/* ── Hero Header ──────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <p
                className="font-body mb-3"
                style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4C6D4' }}
              >
                KPMG VIETNAM &amp; CAMBODIA · AI STRATEGY
              </p>
              <h1
                className="font-display font-extrabold text-kpmg-on-surface dark:text-gray-100 leading-tight mb-3"
                style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}
              >
                Scaling AI Implementation<br />Framework
              </h1>
              <p className="font-body text-kpmg-on-surface-variant dark:text-gray-400" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                A structured model for accelerating AI adoption across Focus, Action, Support, and strategic Questions — from pilot to firm-wide scale.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-kpmg-on-surface-variant dark:text-gray-400 hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors"
                style={{ fontSize: '13px', background: 'rgba(196,198,212,0.15)' }}
              >
                <Share2 size={15} />
                Share with Board
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-white transition-all hover:opacity-90"
                style={{ fontSize: '13px', background: 'linear-gradient(135deg, #00205F 0%, #003380 100%)', boxShadow: '0 2px 8px rgba(0,32,95,0.25)' }}
              >
                <Download size={15} />
                Export Analysis
              </button>
            </div>
          </div>

          {/* ── Executive Summary Metrics ─────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6"
                style={{ boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}
              >
                <p
                  className="font-body mb-3"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4C6D4' }}
                >
                  {m.label}
                </p>
                <p
                  className="font-display font-extrabold leading-none mb-2"
                  style={{ fontSize: '3rem', color: m.color, letterSpacing: '-0.03em' }}
                >
                  {m.value}
                  {m.unit && <span style={{ fontSize: '1.5rem' }}>{m.unit}</span>}
                </p>
                <div className="flex items-center gap-1.5">
                  {m.trend === 'up' ? (
                    <TrendingUp size={13} style={{ color: '#0F6E56' }} />
                  ) : (
                    <TrendingDown size={13} style={{ color: '#45004F' }} />
                  )}
                  <span
                    className="font-body"
                    style={{ fontSize: '11px', color: m.trend === 'up' ? '#0F6E56' : '#45004F', fontWeight: 600 }}
                  >
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Stage: Framework Grid ────────────────────────────────── */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-kpmg-on-surface dark:text-gray-100">
                  Implementation Framework
                </h2>
                <p className="font-body text-kpmg-outline dark:text-gray-500 mt-1" style={{ fontSize: '11px' }}>
                  Click any quadrant to explore deep-dive insights
                </p>
              </div>
              <span
                className="font-body px-3 py-1 rounded-full"
                style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(0,32,95,0.06)', color: '#00205F' }}
              >
                Q2 2025
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* FOCUS — left column, full height */}
              <div
                className="lg:row-span-2 rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(160deg, #7B2FBE 0%, #5A1F8A 100%)',
                  boxShadow: '0px 2px 8px rgba(123,47,190,0.20)',
                }}
                onClick={() => openDrawer('focus')}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-white opacity-80" />
                    <span
                      className="font-body text-white"
                      style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}
                    >
                      Focus
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3
                  className="font-display font-bold text-white mb-6 leading-tight"
                  style={{ fontSize: '1.25rem' }}
                >
                  Strategic Priorities
                </h3>
                <div className="space-y-4">
                  {FOCUS_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                      >
                        {item.trend === 'up' ? (
                          <ArrowUpRight size={15} className="text-white" />
                        ) : (
                          <TrendingDown size={15} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white" style={{ fontSize: '1rem' }}>
                          {item.label}
                        </p>
                        <p className="font-body text-white opacity-70" style={{ fontSize: '11px' }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION — top right */}
              <div
                className="lg:col-span-2 rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #006397 0%, #004E78 100%)',
                  boxShadow: '0px 2px 8px rgba(0,99,151,0.18)',
                }}
                onClick={() => openDrawer('action')}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-white opacity-80" />
                    <span
                      className="font-body text-white"
                      style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}
                    >
                      Action
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3
                  className="font-display font-bold text-white mb-5 leading-tight"
                  style={{ fontSize: '1.1rem' }}
                >
                  Team Execution Model
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ACTION_GROUPS.map((group) => (
                    <div
                      key={group.team}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.10)' }}
                    >
                      <p className="font-body font-bold text-white mb-3" style={{ fontSize: '12px' }}>
                        {group.team}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <ArrowUpRight size={11} className="text-white opacity-70 mt-0.5 flex-shrink-0" />
                            <span className="font-body text-white opacity-80" style={{ fontSize: '11px' }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUPPORT + QUESTION — bottom right, split */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* SUPPORT */}
                <div
                  className="rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: 'white',
                    boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)',
                  }}
                  onClick={() => openDrawer('support')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,32,95,0.08)' }}
                      >
                        <Layers size={14} style={{ color: '#00205F' }} />
                      </div>
                      <span
                        className="font-body"
                        style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00205F' }}
                      >
                        Support
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-kpmg-outline opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-kpmg-on-surface mb-4" style={{ fontSize: '1rem' }}>
                    Firm Infrastructure
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-body font-bold text-kpmg-on-surface mb-1" style={{ fontSize: '12px' }}>
                        Firm Support Teams
                      </p>
                      <p className="font-body text-kpmg-on-surface-variant" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                        {SUPPORT_DATA.firmTeams}
                      </p>
                    </div>
                    <div
                      className="h-px"
                      style={{ background: 'rgba(196,198,212,0.3)' }}
                    />
                    <div>
                      <p className="font-body font-bold text-kpmg-on-surface mb-1" style={{ fontSize: '12px' }}>
                        Tools
                      </p>
                      <p className="font-body text-kpmg-on-surface-variant" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                        {SUPPORT_DATA.tools}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QUESTION */}
                <div
                  className="rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(160deg, #C0006A 0%, #8C004D 100%)',
                    boxShadow: '0px 2px 8px rgba(192,0,106,0.18)',
                  }}
                  onClick={() => openDrawer('question')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={16} className="text-white opacity-80" />
                      <span
                        className="font-body text-white"
                        style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}
                      >
                        Question
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
                    Board Agenda
                  </h3>
                  <ol className="space-y-2">
                    {QUESTIONS.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="font-body font-bold text-white flex-shrink-0"
                          style={{ fontSize: '11px', opacity: 0.6, minWidth: '18px' }}
                        >
                          Q{i + 1}
                        </span>
                        <span className="font-body text-white" style={{ fontSize: '11px', opacity: 0.9, lineHeight: '1.4' }}>
                          {q}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>
            </div>
          </div>

          {/* ── Partner Insight Strip ─────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(0,32,95,0.03)',
              border: '1px solid rgba(0,32,95,0.08)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,32,95,0.08)' }}
              >
                <CheckCircle2 size={20} style={{ color: '#00205F' }} />
              </div>
              <div className="flex-1">
                <p className="font-body font-bold text-kpmg-on-surface mb-1" style={{ fontSize: '13px' }}>
                  Partner Insight
                </p>
                <p className="font-body text-kpmg-on-surface-variant" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  The firms that scale AI fastest share one trait: they treat adoption as a <strong>change management programme</strong>, not a technology rollout. The framework above is your operating model.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users size={14} className="text-kpmg-outline" />
                <span className="font-body text-kpmg-outline" style={{ fontSize: '11px' }}>
                  AI Innovation Lead · KPMG Vietnam
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Contextual Right Drawer ───────────────────────────────────────── */}
      {/* Overlay */}
      {activeDrawer && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out ${
          activeDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: '420px',
          maxWidth: '100vw',
          boxShadow: '-8px 0 40px rgba(0,32,95,0.10)',
        }}
      >
        {drawerData && (
          <>
            {/* Drawer header */}
            <div
              className="flex items-start justify-between p-6 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(196,198,212,0.3)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: drawerData.color }}
                  />
                  <span
                    className="font-body"
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: drawerData.color }}
                  >
                    {drawerData.title}
                  </span>
                </div>
                <h2 className="font-display font-bold text-kpmg-on-surface dark:text-gray-100" style={{ fontSize: '1.1rem' }}>
                  {drawerData.subtitle}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors flex-shrink-0 mt-0.5"
                aria-label="Close drawer"
              >
                <X size={16} className="text-kpmg-outline" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {drawerData.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: '#F6F3F2' }}
                >
                  <p className="font-body font-bold text-kpmg-on-surface dark:text-gray-100 mb-1.5" style={{ fontSize: '13px' }}>
                    {item.label}
                  </p>
                  <p className="font-body text-kpmg-on-surface-variant dark:text-gray-400" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Drawer insight footer */}
            <div
              className="p-6 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(196,198,212,0.3)' }}
            >
              <div
                className="rounded-xl p-4"
                style={{ background: `${drawerData.color}0D`, border: `1px solid ${drawerData.color}20` }}
              >
                <p
                  className="font-body font-bold mb-1.5"
                  style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: drawerData.color }}
                >
                  Partner Insight
                </p>
                <p className="font-body text-kpmg-on-surface dark:text-gray-200" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                  {drawerData.insight}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
