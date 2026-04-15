import React from 'react';
import AppLayout from '@/components/AppLayout';
import OverviewKPIs from './components/OverviewKPIs';
import FunctionHeatmap from './components/FunctionHeatmap';
import PriorityInitiatives from './components/PriorityInitiatives';
import InsightBlock from './components/InsightBlock';
import ActivityStrip from './components/ActivityStrip';
import OverviewCTAs from './components/OverviewCTAs';
import AdoptionChart from './components/AdoptionChart';

export default function ExecutiveOverviewPage() {
  return (
    <AppLayout activeRoute="/executive-overview">
      <div className="space-y-8 animate-fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
              KPMG AI Intelligence Hub
            </p>
            <h1 className="font-display text-2xl font-bold text-kpmg-on-surface leading-tight">
              Executive Overview
            </h1>
            <p className="text-sm text-kpmg-on-surface-variant mt-1 font-body">
              Portfolio health as of 15 April 2026 · Updated 2 hours ago
            </p>
          </div>
          <OverviewCTAs />
        </div>

        {/* KPI row */}
        <OverviewKPIs />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {/* Heatmap — 2 cols */}
          <div className="lg:col-span-2">
            <FunctionHeatmap />
          </div>
          {/* Priority initiatives — 1 col */}
          <div className="lg:col-span-1">
            <PriorityInitiatives />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdoptionChart />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <InsightBlock />
            <ActivityStrip />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}