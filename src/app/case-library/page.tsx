import React from 'react';
import AppLayout from '@/components/AppLayout';
import CaseLibraryContent from './components/CaseLibraryContent';

export default function CaseLibraryPage() {
  return (
    <AppLayout activeRoute="/case-library">
      <main id="main-content" aria-label="Case Library">
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            AI Portfolio
          </p>
          <h1 className="font-display text-2xl font-bold text-kpmg-on-surface leading-tight">
            Case Library
          </h1>
          <p className="text-sm text-kpmg-on-surface-variant mt-1 font-body">
            Browse and compare all AI investment cases across the portfolio
          </p>
        </div>
        <CaseLibraryContent />
      </div>
      </main>
    </AppLayout>
  );
}