'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import ArchitectureCanvas from './components/ArchitectureCanvas';
import { FileDown } from 'lucide-react';

export default function AIArchitectureExplorerPage() {
  function handleExportPDF() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <AppLayout activeRoute="/ai-architecture-explorer">
      <div className="space-y-6 animate-fade-in">
        {/* Page header — Paper on Stone */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="font-body mb-1"
              style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#747683' }}
            >
              Intelligence Architecture
            </p>
            <h1 className="font-display text-2xl font-bold text-kpmg-on-surface leading-tight">
              AI Architecture Explorer
            </h1>
            <p className="text-sm text-kpmg-on-surface mt-1 font-body">
              Explore AI Case → Business Function → Service Solution relationships across the portfolio
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            aria-label="Export PDF Analysis for meeting use"
            className="flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold font-body transition-all focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1"
            style={{
              background: 'linear-gradient(135deg, #00205F 0%, #00338D 100%)',
              color: '#FFFFFF',
              boxShadow: '0px 4px 16px rgba(0,32,95,0.18)',
            }}
          >
            <FileDown size={14} aria-hidden="true" />
            Export PDF Analysis
          </button>
        </div>
        <ArchitectureCanvas />
      </div>
    </AppLayout>
  );
}