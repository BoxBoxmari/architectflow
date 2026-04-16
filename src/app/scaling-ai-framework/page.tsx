'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Download, Share2, X, ArrowUpRight, TrendingDown, Layers, HelpCircle, Zap, Target, CheckCircle2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DrawerContent {
  title: string;
  subtitle: string;
  color: string;
  items: { label: string; detail: string }[];
  insight: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FOCUS_ITEMS = [
  { label: 'Use Case', trend: 'up' },
  { label: 'Adoption', trend: 'up' },
  { label: 'Value', trend: 'up' },
  { label: 'Platform Cost', trend: 'down' },
];

const ACTION_GROUPS = [
  {
    team: 'AI Function Core Team',
    items: ['Measure use case values', 'Use case portfolio'],
  },
  {
    team: 'AI Service Line Team',
    items: ['Implementation', 'Testing, Pilot, Appy, Scale'],
  },
  {
    team: 'Employees',
    items: ['Skill training', 'Quality feedback', 'Adoption rate'],
  },
];

const SUPPORT_DATA = {
  firmTeams: 'AI Innovation, KDC, L&D, QRM, NITSO',
  tools: 'AI management template package\nFunctional AI Platform, Copilot, alQChat, Workbench',
};

const QUESTIONS = [
  'Who are best for "AI-enabled workflow" program?',
  'Your top 03 areas can free up human capacity?',
  'How to speed up AI use case enablement?',
  'How to avoid AI is just "optional"?',
  'How use cases can be 100% adopted daily?',
];

const DRAWER_CONTENT: Record<string, DrawerContent> = {
  focus: {
    title: 'Focus',
    subtitle: 'Strategic priorities driving AI scaling',
    color: '#7B2FBE',
    items: [
      { label: 'Use Case', detail: 'Active use cases across functions — measure portfolio breadth and depth.' },
      { label: 'Adoption', detail: 'Workforce adoption rate — target 80% by end of Q3.' },
      { label: 'Value', detail: 'Annualised value realised from AI deployments across service lines.' },
      { label: 'Platform Cost', detail: 'Total platform spend — track efficiency and reinvest savings into L&D.' },
    ],
    insight: 'The portfolio is on track. Adoption velocity is the primary lever to unlock the next wave of value.',
  },
  action: {
    title: 'Action',
    subtitle: 'Team responsibilities and execution model',
    color: '#00897B',
    items: [
      { label: 'AI Function Core Team', detail: 'Owns use case measurement and portfolio governance. Weekly cadence with function leads.' },
      { label: 'AI Service Line Team', detail: 'Drives implementation, pilot design, and scale-up. Embedded in each service line.' },
      { label: 'Employee Enablement', detail: 'Skill training via KDC. Quality feedback loops feed directly into model improvement cycles.' },
    ],
    insight: "Clear ownership at each layer prevents the \"everyone's responsible, no one's accountable\" failure mode.",
  },
  support: {
    title: 'Support',
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
    title: 'Question',
    subtitle: 'Board-level questions driving the agenda',
    color: '#C0006A',
    items: [
      { label: 'Q1 — Workflow Programme', detail: 'Identify top roles where AI-enabled workflows reduce manual effort by >30%.' },
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
        <div className="space-y-8 animate-fade-in">

          {/* ── Hero Header ──────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1
                className="font-display font-extrabold leading-tight"
                style={{ fontSize: '2rem', color: '#00205F', letterSpacing: '-0.01em' }}
              >
                Scaling AI Implementation Framework
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold transition-colors"
                style={{ fontSize: '13px', background: 'rgba(196,198,212,0.15)', color: '#6B7280' }}
              >
                <Share2 size={15} />
                Share
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-white transition-all hover:opacity-90"
                style={{ fontSize: '13px', background: 'linear-gradient(135deg, #00205F 0%, #003380 100%)', boxShadow: '0 2px 8px rgba(0,32,95,0.25)' }}
              >
                <Download size={15} />
                Export
              </button>
            </div>
          </div>

          {/* ── Framework Table ───────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0px 1px 4px rgba(0,32,95,0.08), 0px 0px 0px 1px rgba(196,198,212,0.3)' }}
          >
            {/* Column Headers */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* FOCUS header */}
              <button
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase transition-opacity hover:opacity-90"
                style={{ fontSize: '15px', background: '#7B2FBE', letterSpacing: '0.12em' }}
                onClick={() => openDrawer('focus')}
              >
                <Target size={16} className="opacity-80" />
                FOCUS
              </button>
              {/* ACTION header */}
              <button
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase transition-opacity hover:opacity-90"
                style={{ fontSize: '15px', background: '#00897B', letterSpacing: '0.12em' }}
                onClick={() => openDrawer('action')}
              >
                <Zap size={16} className="opacity-80" />
                ACTION
              </button>
              {/* SUPPORT header */}
              <button
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase transition-opacity hover:opacity-90"
                style={{ fontSize: '15px', background: '#1565C0', letterSpacing: '0.12em' }}
                onClick={() => openDrawer('support')}
              >
                <Layers size={16} className="opacity-80" />
                SUPPORT
              </button>
            </div>

            {/* Column Bodies */}
            <div className="grid grid-cols-1 md:grid-cols-3 min-h-[340px]">

              {/* FOCUS body */}
              <div
                className="p-6 flex flex-col justify-center gap-5 cursor-pointer hover:bg-purple-50 transition-colors"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
                onClick={() => openDrawer('focus')}
              >
                {FOCUS_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.trend === 'up' ? (
                      <ArrowUpRight size={28} style={{ color: '#00897B', flexShrink: 0 }} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={28} style={{ color: '#C0006A', flexShrink: 0 }} strokeWidth={2.5} />
                    )}
                    <span
                      className="font-display font-bold"
                      style={{ fontSize: '1.35rem', color: '#111827' }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION body */}
              <div
                className="p-6 flex flex-col gap-5 cursor-pointer hover:bg-teal-50 transition-colors"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
                onClick={() => openDrawer('action')}
              >
                {ACTION_GROUPS.map((group) => (
                  <div key={group.team}>
                    <p
                      className="font-body font-bold mb-2"
                      style={{ fontSize: '13px', color: '#111827' }}
                    >
                      {group.team}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <ArrowUpRight size={13} style={{ color: '#00897B', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} />
                          <span className="font-body text-gray-600" style={{ fontSize: '12px' }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* SUPPORT + QUESTION stacked */}
              <div className="flex flex-col">
                {/* SUPPORT body */}
                <div
                  className="flex-1 p-6 cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(196,198,212,0.3)' }}
                  onClick={() => openDrawer('support')}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Firm Support Teams
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        {SUPPORT_DATA.firmTeams}
                      </p>
                    </div>
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Tools
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {SUPPORT_DATA.tools}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QUESTION header */}
                <button
                  className="flex items-center justify-center gap-2 py-3 px-6 font-body font-extrabold text-white tracking-widest uppercase transition-opacity hover:opacity-90"
                  style={{ fontSize: '14px', background: '#C0006A', letterSpacing: '0.12em' }}
                  onClick={() => openDrawer('question')}
                >
                  <HelpCircle size={15} className="opacity-80" />
                  QUESTION
                </button>

                {/* QUESTION body */}
                <div
                  className="p-5 cursor-pointer hover:bg-pink-50 transition-colors"
                  style={{ background: '#FFFFFF' }}
                  onClick={() => openDrawer('question')}
                >
                  <ol className="space-y-2">
                    {QUESTIONS.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="font-body font-bold flex-shrink-0"
                          style={{ fontSize: '12px', color: '#C0006A', minWidth: '22px' }}
                        >
                          Q{i + 1}
                        </span>
                        <span className="font-body font-semibold" style={{ fontSize: '12px', color: '#C0006A', lineHeight: '1.4' }}>
                          {q}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Contextual Right Drawer ───────────────────────────────────────── */}
      {activeDrawer && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

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
            <div
              className="flex items-start justify-between p-6 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(196,198,212,0.3)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: drawerData.color }} />
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

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {drawerData.items.map((item, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#F6F3F2' }}>
                  <p className="font-body font-bold text-kpmg-on-surface dark:text-gray-100 mb-1.5" style={{ fontSize: '13px' }}>
                    {item.label}
                  </p>
                  <p className="font-body text-kpmg-on-surface-variant dark:text-gray-400" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 flex-shrink-0" style={{ borderTop: '1px solid rgba(196,198,212,0.3)' }}>
              <div
                className="rounded-xl p-4"
                style={{ background: `${drawerData.color}0D`, border: `1px solid ${drawerData.color}20` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={13} style={{ color: drawerData.color }} />
                  <p
                    className="font-body font-bold"
                    style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: drawerData.color }}
                  >
                    Partner Insight
                  </p>
                </div>
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
