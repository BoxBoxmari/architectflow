'use client';
import React, { useState, useRef } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import { X, ExternalLink, ChevronRight, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';

type SelectedCase = typeof AI_CASES[0] | null;

const TECHNIQUE_COLORS: Record<string, string> = {
  'RAG + LLM Re-ranking': '#00205F',
  'RAG-based GenAI Drafting': '#006397',
  'Doc Parsing + LLM + Anomaly Flag': '#0F6E56',
  'LLM Extraction + Template Gen': '#00B8A9',
  'LLM Clause Extraction + Risk Class': '#45004F',
  'Multi-doc Parsing + Risk Scoring': '#F39C12',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Concept: { bg: '#F0EDEC', text: '#747683' },
  'In Development': { bg: '#FEF3C7', text: '#92400E' },
  Pilot: { bg: '#DBEAFE', text: '#1E40AF' },
  Active: { bg: '#D1FAE5', text: '#065F46' },
  Scaled: { bg: '#E0E7FF', text: '#00205F' },
};

export default function ArchitectureCanvas() {
  const [selectedCase, setSelectedCase] = useState<SelectedCase>(null);
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  const filteredCases = AI_CASES.filter(c => {
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tech.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFunction = !activeFunction || c.linkedFunctions.includes(activeFunction);
    return matchesSearch && matchesFunction;
  });

  const activeCase = selectedCase || (hoveredCase ? AI_CASES.find(c => c.id === hoveredCase) : null);

  const activeFunctionIds = activeCase
    ? new Set(activeCase.linkedFunctions)
    : new Set(filteredCases.flatMap(c => c.linkedFunctions));

  const activeServiceIds = activeCase
    ? new Set(activeCase.linkedServices)
    : new Set(filteredCases.flatMap(c => c.linkedServices));

  function reset() {
    setSelectedCase(null);
    setHoveredCase(null);
    setActiveFunction(null);
    setSearchQuery('');
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-card px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cases or techniques..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 placeholder:text-kpmg-outline transition-all font-body"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-kpmg-outline font-body">Filter:</span>
          {FUNCTIONS.map(fn => (
            <button
              key={`filter-fn-${fn.id}`}
              onClick={() => setActiveFunction(activeFunction === fn.id ? null : fn.id)}
              className={`kpmg-filter-chip ${activeFunction === fn.id ? 'active' : ''}`}
            >
              {fn.name}
            </button>
          ))}
        </div>
        {(selectedCase || hoveredCase || activeFunction || searchQuery) && (
          <button
            onClick={reset}
            className="ml-auto flex items-center gap-1.5 text-xs text-kpmg-outline hover:text-kpmg-primary transition-colors font-body"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Canvas + Drawer */}
      <div className="flex gap-4 min-h-0">
        {/* Canvas */}
        <div className="flex-1 bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300">
          <div className="p-5 border-b border-kpmg-outline-variant/30 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-accent-faster" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">AI Cases ({filteredCases.length})</span>
            </div>
            <div className="flex-1 h-px bg-kpmg-outline-variant/30" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-primary" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">Functions</span>
            </div>
            <div className="flex-1 h-px bg-kpmg-outline-variant/30" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-outline-variant" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">Services</span>
            </div>
          </div>

          <div className="p-5 overflow-x-auto">
            <div className="flex gap-6 min-w-max">
              {/* Cases column */}
              <div className="flex flex-col gap-3 w-52">
                <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-1" style={{ fontSize: '10px' }}>AI Cases</p>
                {filteredCases.map(c => {
                  const isSelected = selectedCase?.id === c.id;
                  const isHovered = hoveredCase === c.id;
                  const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';
                  return (
                    <button
                      key={`case-node-${c.id}`}
                      onClick={() => setSelectedCase(isSelected ? null : c)}
                      onMouseEnter={() => setHoveredCase(c.id)}
                      onMouseLeave={() => setHoveredCase(null)}
                      className={`
                        text-left p-3 rounded-xl border-2 transition-all duration-150 node-card-hover w-full
                        ${isSelected
                          ? 'border-kpmg-accent-faster bg-kpmg-accent-faster/5 shadow-card-hover'
                          : isHovered
                            ? 'border-kpmg-outline-variant bg-kpmg-surface-container-low shadow-card'
                            : 'border-transparent bg-kpmg-surface-container-low hover:border-kpmg-outline-variant'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                        <span
                          className="kpmg-badge text-xs flex-shrink-0"
                          style={{ backgroundColor: `${techColor}15`, color: techColor }}
                        >
                          {c.tech}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-kpmg-on-surface font-body leading-snug">{c.title}</p>
                    </button>
                  );
                })}
              </div>

              {/* Connector */}
              <div className="flex gap-6 items-start">
                <div className="relative w-12 flex items-center justify-center">
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-kpmg-outline-variant/30" />
                </div>

                {/* Functions column */}
                <div className="flex flex-col gap-3 w-44">
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-1" style={{ fontSize: '10px' }}>Functions</p>
                  {FUNCTIONS.map(fn => {
                    const isActive = activeFunctionIds.has(fn.id);
                    return (
                      <div
                        key={`fn-node-${fn.id}`}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-150
                          ${isActive
                            ? 'border-kpmg-primary bg-kpmg-primary/5' :'border-transparent bg-kpmg-surface-container opacity-40'
                          }
                        `}
                      >
                        <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: fn.color }} />
                        <p className="text-sm font-semibold text-kpmg-on-surface font-body">{fn.name}</p>
                        <p className="text-xs text-kpmg-outline font-body mt-0.5">
                          {AI_CASES.filter(c => c.linkedFunctions.includes(fn.id)).length} cases
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Connector */}
                <div className="relative w-12 flex items-center justify-center">
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-kpmg-outline-variant/30" />
                </div>

                {/* Services column */}
                <div className="flex flex-col gap-2 w-56">
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-1" style={{ fontSize: '10px' }}>Services</p>
                  {SERVICES.map(svc => {
                    const isActive = activeServiceIds.has(svc.id);
                    return (
                      <div
                        key={`svc-node-${svc.id}`}
                        className={`
                          px-3 py-2 rounded-lg border transition-all duration-150
                          ${isActive
                            ? 'border-kpmg-outline-variant bg-white'
                            : 'border-transparent bg-kpmg-surface-container opacity-30'
                          }
                        `}
                      >
                        <p className="text-xs font-medium text-kpmg-on-surface font-body">{svc.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-kpmg-outline-variant/30 flex items-center gap-4 flex-wrap">
            <span className="text-xs text-kpmg-outline font-body">AI Technique:</span>
            {Object.entries(TECHNIQUE_COLORS).map(([tech, color]) => (
              <div key={`legend-tech-${tech}`} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-kpmg-on-surface-variant font-body">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedCase && (
          <div
            ref={drawerRef}
            className="w-80 flex-shrink-0 bg-white rounded-xl shadow-drawer overflow-y-auto scrollbar-thin animate-slide-in-right"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            <div className="sticky top-0 bg-white border-b border-kpmg-outline-variant/30 px-5 py-4 flex items-start justify-between z-10">
              <div>
                <span className="text-xs font-semibold text-kpmg-outline font-body">{selectedCase.code}</span>
                <h3 className="font-display text-base font-bold text-kpmg-on-surface mt-0.5 leading-snug">{selectedCase.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-kpmg-surface-container transition-colors flex-shrink-0 ml-2"
                aria-label="Close drawer"
              >
                <X size={14} className="text-kpmg-outline" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Source + Technique */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: STATUS_COLORS[selectedCase.status]?.bg || '#F0EDEC',
                      color: STATUS_COLORS[selectedCase.status]?.text || '#747683',
                    }}
                  >
                    {selectedCase.status}
                  </span>
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: `${TECHNIQUE_COLORS[selectedCase.tech] || '#747683'}15`,
                      color: TECHNIQUE_COLORS[selectedCase.tech] || '#747683',
                    }}
                  >
                    {selectedCase.tech}
                  </span>
                </div>
                <p className="text-xs text-kpmg-outline font-body mt-1">{selectedCase.source}</p>
              </div>

              {/* Key value metrics */}
              <div>
                <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>
                  Key Value Metrics
                </p>
                <ul className="space-y-1.5">
                  {selectedCase.metrics.map((m, i) => (
                    <li key={`dm-${selectedCase.id}-${i}`} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-kpmg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-kpmg-on-surface-variant font-body">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Linked functions grouped with services */}
              <div>
                <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>
                  Reaches
                </p>
                <div className="space-y-2">
                  {FUNCTIONS.filter(fn => selectedCase.linkedFunctions.includes(fn.id)).map(fn => {
                    const fnSvcs = SERVICES.filter(s => s.functionId === fn.id && selectedCase.linkedServices.includes(s.id));
                    return (
                      <div key={`reach-fn-${fn.id}`} className="p-2 rounded-lg bg-kpmg-surface-container-low">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fn.color }} />
                          <span className="text-xs font-semibold text-kpmg-on-surface font-body">{fn.name}</span>
                        </div>
                        {fnSvcs.map(svc => (
                          <p key={`reach-svc-${svc.id}`} className="text-xs text-kpmg-outline font-body ml-3">→ {svc.name}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Partner insight */}
              <div className="p-3 rounded-lg bg-kpmg-primary/5 border border-kpmg-primary/15">
                <p className="text-xs font-semibold text-kpmg-primary uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
                  Partner Insight
                </p>
                <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed">
                  {selectedCase.insight}
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <Link href={`/cases/${selectedCase.id}`}>
                  <span className="kpmg-btn-primary w-full justify-center text-xs cursor-pointer">
                    Open Full Profile
                    <ChevronRight size={13} />
                  </span>
                </Link>
                <button className="kpmg-btn-secondary w-full justify-center text-xs">
                  <ExternalLink size={13} />
                  Contact AI Innovation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}