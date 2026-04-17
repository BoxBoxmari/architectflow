import React from 'react';
import AppLayout from '@/components/AppLayout';
import ValueSimulatorContent from './components/ValueSimulatorContent';

export default function ValueSimulatorPage() {
  return (
    <AppLayout activeRoute="/value-simulator">
      <main id="main-content" aria-label="Value Simulator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            Strategic Modelling
          </p>
          <h1 className="font-display text-2xl font-bold text-kpmg-on-surface dark:text-gray-100 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Value Simulator
          </h1>
          <p className="text-sm dark:text-gray-400 mt-1 font-body font-semibold text-black">
            Model AI portfolio ROI in real time using the Faster × Deeper activation framework
          </p>
        </div>
        <ValueSimulatorContent />
      </div>
      </main>
    </AppLayout>
  );
}