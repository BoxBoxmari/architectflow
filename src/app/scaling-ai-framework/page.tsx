'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Download, ArrowUpRight, TrendingDown, Layers, HelpCircle, Zap, Target } from 'lucide-react';

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScalingAIFrameworkPage() {
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
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {/* FOCUS header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#7B2FBE', letterSpacing: '0.12em' }}
              >
                <Target size={16} className="opacity-80" />
                FOCUS
              </div>
              {/* ACTION header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#00897B', letterSpacing: '0.12em' }}
              >
                <Zap size={16} className="opacity-80" />
                ACTION
              </div>
              {/* SUPPORT header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#1565C0', letterSpacing: '0.12em' }}
              >
                <Layers size={16} className="opacity-80" />
                SUPPORT
              </div>
            </div>

            {/* Column Bodies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 min-h-[340px]">

              {/* FOCUS body */}
              <div
                className="p-6 flex flex-col justify-center gap-5"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
              >
                {FOCUS_ITEMS?.map((item) => (
                  <div key={item?.label} className="flex items-center gap-3">
                    {item?.trend === 'up' ? (
                      <ArrowUpRight size={28} style={{ color: '#00897B', flexShrink: 0 }} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={28} style={{ color: '#C0006A', flexShrink: 0 }} strokeWidth={2.5} />
                    )}
                    <span
                      className="font-display font-bold"
                      style={{ fontSize: '1.35rem', color: '#111827' }}
                    >
                      {item?.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION body */}
              <div
                className="p-6 flex flex-col gap-5"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
              >
                {ACTION_GROUPS?.map((group) => (
                  <div key={group?.team}>
                    <p
                      className="font-body font-bold mb-2"
                      style={{ fontSize: '13px', color: '#111827' }}
                    >
                      {group?.team}
                    </p>
                    <ul className="space-y-1">
                      {group?.items?.map((item) => (
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
                  className="flex-1 p-6"
                  style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(196,198,212,0.3)' }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Firm Support Teams
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        {SUPPORT_DATA?.firmTeams}
                      </p>
                    </div>
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Tools
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {SUPPORT_DATA?.tools}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QUESTION header */}
                <div
                  className="flex items-center justify-center gap-2 py-3 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                  style={{ fontSize: '14px', background: '#C0006A', letterSpacing: '0.12em' }}
                >
                  <HelpCircle size={15} className="opacity-80" />
                  QUESTION
                </div>

                {/* QUESTION body */}
                <div
                  className="p-5"
                  style={{ background: '#FFFFFF' }}
                >
                  <ol className="space-y-2">
                    {QUESTIONS?.map((q, i) => (
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
    </AppLayout>
  );
}
