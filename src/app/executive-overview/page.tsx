import React from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { Network, Calculator, ArrowRight } from 'lucide-react';
import OverviewKPIs from './components/OverviewKPIs';
import FunctionHeatmap from './components/FunctionHeatmap';
import InsightBlock from './components/InsightBlock';

export default function ExecutiveOverviewPage() {
  return (
    <AppLayout activeRoute="/executive-overview">
      <main id="main-content" aria-label="Executive Overview">
      <div className="space-y-12 animate-fade-in">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <p
            className="font-body text-kpmg-outline dark:text-gray-500 mb-3"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            KPMG Vietnam &amp; Cambodia · Partner Briefing
          </p>
          <h1 className="font-display text-4xl font-extrabold text-kpmg-on-surface dark:text-gray-100 leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
            One AI Foundation.<br />Every Function.
          </h1>
          <p className="text-base text-kpmg-on-surface-variant dark:text-gray-400 font-body leading-relaxed">
            Six AI cases. Five functions. One shared architecture. Each case is a reusable engine —
            not a one-off tool. Value compounds through two levers:{' '}
            <strong className="text-kpmg-on-surface dark:text-gray-200 font-semibold">Faster</strong> (activate more use cases) and{' '}
            <strong className="text-kpmg-on-surface dark:text-gray-200 font-semibold">Deeper</strong> (reach more users).
          </p>
        </div>

        {/* ── Two core stories ────────────────────────────────────────────── */}
        <div>
          <p
            className="font-body text-kpmg-outline dark:text-gray-500 mb-4"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Two stories to explore
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">

            {/* Pure Paper card on Stone canvas — natural lift via shadow */}
            <Link href="/ai-architecture-explorer">
              <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full" style={{ boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,32,95,0.06)' }}>
                    <Network size={20} className="text-kpmg-primary dark:text-blue-400" />
                  </div>
                  <span
                    className="font-body text-kpmg-outline dark:text-gray-500"
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Architecture
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-kpmg-on-surface dark:text-gray-100 mb-2 group-hover:text-kpmg-primary dark:group-hover:text-blue-400 transition-colors leading-snug">
                  How one foundation powers every function
                </h2>
                <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 font-body leading-snug mb-4">
                  Trace how each AI case connects across functions and services — and why the architecture is the asset.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-kpmg-primary dark:text-blue-400 font-body group-hover:gap-2.5 transition-all">
                  Explore the map <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            <Link href="/value-simulator">
              <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full" style={{ boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,184,169,0.08)' }}>
                    <Calculator size={20} className="text-kpmg-accent-faster" />
                  </div>
                  <span
                    className="font-body text-kpmg-outline dark:text-gray-500"
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Value
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-kpmg-on-surface dark:text-gray-100 mb-2 group-hover:text-kpmg-accent-faster transition-colors leading-snug">
                  Why the economic case compounds
                </h2>
                <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 font-body leading-snug mb-4">
                  Model the Faster × Deeper multiplier with transparent assumptions — adjust any input, see the return instantly.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-kpmg-accent-faster font-body group-hover:gap-2.5 transition-all">
                  Run the simulator <ArrowRight size={13} />
                </span>
              </div>
            </Link>

          </div>
        </div>

        {/* ── Portfolio snapshot ──────────────────────────────────────────── */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-kpmg-on-surface dark:text-gray-100">Portfolio at a Glance</h2>
            <p className="font-body text-kpmg-outline dark:text-gray-500 mt-1" style={{ fontSize: '11px' }}>
              Illustrative executive view · Curated sample portfolio
            </p>
          </div>
          <OverviewKPIs />
        </div>

        {/* ── Coverage + insight ──────────────────────────────────────────── */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-kpmg-on-surface dark:text-gray-100">Cross-Function Coverage</h2>
            <p className="font-body text-kpmg-outline dark:text-gray-500 mt-1" style={{ fontSize: '11px' }}>
              How many AI cases reach each function — and which ones
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FunctionHeatmap />
            </div>
            <div className="lg:col-span-1">
              <InsightBlock />
            </div>
          </div>
        </div>

      </div>
      </main>
    </AppLayout>
  );
}