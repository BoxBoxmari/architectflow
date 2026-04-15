import React from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { Network, Calculator } from 'lucide-react';
import OverviewKPIs from './components/OverviewKPIs';
import FunctionHeatmap from './components/FunctionHeatmap';
import InsightBlock from './components/InsightBlock';

export default function ExecutiveOverviewPage() {
  return (
    <AppLayout activeRoute="/executive-overview">
      <div className="space-y-10 animate-fade-in">
        {/* Page header — honest executive framing */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-2 font-body" style={{ fontSize: '10px' }}>
            KPMG Vietnam &amp; Cambodia · Partner Briefing
          </p>
          <h1 className="font-display text-3xl font-extrabold text-kpmg-on-surface leading-tight mb-3">
            AI Foundation Portfolio
          </h1>
          <p className="text-base text-kpmg-on-surface-variant font-body leading-relaxed">
            A curated set of six AI cases built on a shared foundation — each reusable across functions and services.
            The value case compounds through two levers: <strong className="text-kpmg-on-surface font-semibold">Faster</strong> (more use cases activated) and{' '}
            <strong className="text-kpmg-on-surface font-semibold">Deeper</strong> (more users adopting them).
          </p>
        </div>

        {/* Navigation CTAs — the two core stories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Link href="/ai-architecture-explorer">
            <div className="group p-5 rounded-xl border-2 border-kpmg-outline-variant/40 hover:border-kpmg-primary bg-white hover:shadow-card-hover transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-kpmg-primary/8 flex items-center justify-center">
                  <Network size={18} className="text-kpmg-primary" />
                </div>
                <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>
                  Story 1
                </span>
              </div>
              <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-1 group-hover:text-kpmg-primary transition-colors">
                AI Architecture Explorer
              </h2>
              <p className="text-sm text-kpmg-on-surface-variant font-body leading-snug">
                How one shared foundation powers multiple cases across every function and service.
              </p>
            </div>
          </Link>

          <Link href="/value-simulator">
            <div className="group p-5 rounded-xl border-2 border-kpmg-outline-variant/40 hover:border-kpmg-accent-faster bg-white hover:shadow-card-hover transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-kpmg-accent-faster/10 flex items-center justify-center">
                  <Calculator size={18} className="text-kpmg-accent-faster" />
                </div>
                <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>
                  Story 2
                </span>
              </div>
              <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-1 group-hover:text-kpmg-accent-faster transition-colors">
                AI Value Simulator
              </h2>
              <p className="text-sm text-kpmg-on-surface-variant font-body leading-snug">
                Why the economic case compounds through Faster × Deeper — modelled transparently.
              </p>
            </div>
          </Link>
        </div>

        {/* Portfolio snapshot */}
        <div>
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-kpmg-on-surface">Portfolio Snapshot</h2>
            <p className="text-xs text-kpmg-outline mt-0.5 font-body">Illustrative executive view · Curated sample portfolio</p>
          </div>
          <OverviewKPIs />
        </div>

        {/* Coverage matrix + insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FunctionHeatmap />
          </div>
          <div className="lg:col-span-1">
            <InsightBlock />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}