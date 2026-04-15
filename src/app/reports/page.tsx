import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReportBuilderContent from './components/ReportBuilderContent';

export default function ReportsPage() {
  return (
    <AppLayout activeRoute="/reports">
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            Executive Output
          </p>
          <h1 className="font-display text-2xl font-700 text-kpmg-on-surface leading-tight">
            Report Builder
          </h1>
          <p className="text-sm text-kpmg-on-surface-variant mt-1 font-body">
            Compose and export board-ready AI portfolio leave-behinds
          </p>
        </div>
        <ReportBuilderContent />
      </div>
    </AppLayout>
  );
}