'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import ArchitectureCanvas from './components/ArchitectureCanvas';
import { FileDown, Loader2 } from 'lucide-react';
import { AI_CASES } from '@/lib/mockData';
import type { AICase } from '@/lib/mockData';

interface CanvasState {
  selectedCase: AICase | null;
  activeFunction: string | null;
  searchQuery: string;
  filteredCases: typeof AI_CASES;
}

export default function AIArchitectureExplorerPage() {
  const [exporting, setExporting] = useState(false);
  const canvasStateRef = useRef<CanvasState>({
    selectedCase: null,
    activeFunction: null,
    searchQuery: '',
    filteredCases: AI_CASES,
  });

  function handleCanvasStateChange(state: CanvasState) {
    canvasStateRef.current = state;
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const { exportArchitecturePDF } = await import('@/lib/pdfExport');
      const { selectedCase, activeFunction, searchQuery, filteredCases } = canvasStateRef.current;
      await exportArchitecturePDF({
        cases: filteredCases.length > 0 ? filteredCases : AI_CASES,
        selectedCase,
        activeFunction,
        searchQuery,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppLayout activeRoute="/ai-architecture-explorer">
      <main id="main-content" aria-label="AI Architecture Explorer">
      <div className="space-y-6 animate-fade-in">
        {/* Page header — Paper on Stone */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
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
            disabled={exporting}
            aria-label="Export PDF Analysis for meeting use"
            aria-busy={exporting}
            className="flex-shrink-0 self-start flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold font-body transition-all focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #00205F 0%, #00338D 100%)',
              color: '#FFFFFF',
              boxShadow: '0px 4px 16px rgba(0,32,95,0.18)',
              whiteSpace: 'nowrap',
            }}
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <FileDown size={14} aria-hidden="true" />
            )}
            {exporting ? 'Generating PDF…' : 'Export PDF Analysis'}
          </button>
        </div>
        <ArchitectureCanvas onStateChange={handleCanvasStateChange} />
      </div>
      </main>
    </AppLayout>
  );
}