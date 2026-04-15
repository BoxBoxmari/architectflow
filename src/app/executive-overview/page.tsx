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
      <div className="space-y-12 animate-fade-in">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-3 font-body"
            style={{ fontSize: '10px' }}
          >
            KPMG Vietnam &amp; Cambodia · Partner Briefing
          </p>
          <h1 className="font-display text-4xl font-extrabold text-kpmg-on-surface leading-tight mb-4">
            One AI Foundation.<br />Every Function.
          </h1>
          <p className="text-base text-kpmg-on-surface-variant font-body leading-relaxed">
            Six AI cases. Five functions. One shared architecture. Each case is a reusable engine —
            not a one-off tool. Value compounds through two levers:{' '}
            <strong className="text-kpmg-on-surface font-semibold">Faster</strong> (activate more use cases) and{' '}
            <strong className="text-kpmg-on-surface font-semibold">Deeper</strong> (reach more users).
          </p>
        </div>

        {/* ── Two core stories ────────────────────────────────────────────── */}
        <div>
          <p
            className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-4 font-body"
            style={{ fontSize: '10px' }}
          >
            Two stories to explore
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">

            <Link href="/ai-architecture-explorer">
              <div className="group p-6 rounded-xl border-2 border-kpmg-outline-variant/40 hover:border-kpmg-primary bg-white hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-kpmg-primary/8 flex items-center justify-center flex-shrink-0">
                    <Network size={20} className="text-kpmg-primary" />
                  </div>
                  <span
                    className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body"
                    style={{ fontSize: '10px' }}
                  >
                    Architecture
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-2 group-hover:text-kpmg-primary transition-colors leading-snug">
                  How one foundation powers every function
                </h2>
                <p className="text-sm text-kpmg-on-surface-variant font-body leading-snug mb-4">
                  Trace how each AI case connects across functions and services — and why the architecture is the asset.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-kpmg-primary font-body group-hover:gap-2.5 transition-all">
                  Explore the map <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            <Link href="/value-simulator">
              <div className="group p-6 rounded-xl border-2 border-kpmg-outline-variant/40 hover:border-kpmg-accent-faster bg-white hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-kpmg-accent-faster/10 flex items-center justify-center flex-shrink-0">
                    <Calculator size={20} className="text-kpmg-accent-faster" />
                  </div>
                  <span
                    className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body"
                    style={{ fontSize: '10px' }}
                  >
                    Value
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-2 group-hover:text-kpmg-accent-faster transition-colors leading-snug">
                  Why the economic case compounds
                </h2>
                <p className="text-sm text-kpmg-on-surface-variant font-body leading-snug mb-4">
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
            <h2 className="font-display text-lg font-bold text-kpmg-on-surface">Portfolio at a Glance</h2>
            <p className="text-xs text-kpmg-outline mt-1 font-body">
              Illustrative executive view · Curated sample portfolio
            </p>
          </div>
          <OverviewKPIs />
        </div>

        {/* ── Coverage + insight ──────────────────────────────────────────── */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-kpmg-on-surface">Cross-Function Coverage</h2>
            <p className="text-xs text-kpmg-outline mt-1 font-body">
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
    </AppLayout>
  );
}