import React from 'react';
import AppLayout from '@/components/AppLayout';
import ScenarioComparisonContent from './components/ScenarioComparisonContent';

export default function ScenarioComparisonPage() {
  return (
    <AppLayout activeRoute="/scenario-comparison">
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            Strategic Decision Support
          </p>
          <h1 className="font-display text-2xl font-700 text-kpmg-on-surface leading-tight">
            Scenario Comparison
          </h1>
          <p className="text-sm text-kpmg-on-surface-variant mt-1 font-body">
            Compare strategic AI adoption paths side by side to identify the optimal investment decision
          </p>
        </div>
        <ScenarioComparisonContent />
      </div>
    </AppLayout>
  );
}