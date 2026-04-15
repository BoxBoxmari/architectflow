'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import { X, ExternalLink, ChevronRight, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';

type SelectedCase = typeof AI_CASES[0] | null;

const TECHNIQUE_COLORS: Record<string, string> = {
  LLM: '#00205F',
  NLP: '#006397',
  'ML Classification': '#0F6E56',
  'Computer Vision': '#45004F',
  RAG: '#00B8A9',
  'Generative AI': '#F39C12',
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
      c.aiTechnique.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFunction = !activeFunction || c.linkedFunctions.includes(activeFunction);
    return matchesSearch && matchesFunction;
  });

  const activeCaseIds = new Set(filteredCases.map(c => c.id));
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
        <div className={`flex-1 bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 ${selectedCase ? 'mr-0' : ''}`}>
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
                  const techColor = TECHNIQUE_COLORS[c.aiTechnique] || '#747683';
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
                          {c.aiTechnique}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-kpmg-on-surface font-body leading-snug">{c.title}</p>
                    </button>
                  );
                })}
              </div>

              {/* SVG Connectors + Functions */}
              <div className="flex gap-6 items-start">
                {/* SVG lines — simplified visual connectors */}
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
                        <div
                          className="w-2 h-2 rounded-full mb-2"
                          style={{ backgroundColor: fn.color }}
                        />
                        <p className="text-sm font-semibold text-kpmg-on-surface font-body">{fn.name}</p>
                        <p className="text-xs text-kpmg-outline font-body mt-0.5">
                          {AI_CASES.filter(c => c.linkedFunctions.includes(fn.id)).length} cases
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* SVG lines */}
                <div className="relative w-12 flex items-center justify-center">
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-kpmg-outline-variant/30" />
                </div>

                {/* Services column */}
                <div className="flex flex-col gap-2 w-52">
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
              {/* Status + Technique */}
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
                    backgroundColor: `${TECHNIQUE_COLORS[selectedCase.aiTechnique] || '#747683'}15`,
                    color: TECHNIQUE_COLORS[selectedCase.aiTechnique] || '#747683',
                  }}
                >
                  {selectedCase.aiTechnique}
                </span>
                <span className="kpmg-badge bg-kpmg-surface-container text-kpmg-on-surface-variant">
                  {selectedCase.maturityLevel}
                </span>
              </div>

              {/* Value metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Annual Value', value: `£${(selectedCase.metrics.annualizedReturn / 1000).toFixed(0)}k` },
                  { label: 'Adoption', value: `${selectedCase.metrics.adoptionRate}%` },
                  { label: 'FTEs Freed', value: `${selectedCase.metrics.ftesFreed.toFixed(1)}` },
                  { label: 'Value Score', value: `${selectedCase.valueScore}/100` },
                ].map(({ label, value }) => (
                  <div key={`drawer-metric-${label}`} className="kpmg-metric-tile">
                    <p className="text-xs text-kpmg-outline font-body mb-1">{label}</p>
                    <p className="font-display text-base font-bold text-kpmg-on-surface tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              {/* Linked services */}
              <div>
                <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>
                  Linked Services
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCase.linkedServices.map(svcId => {
                    const svc = SERVICES.find(s => s.id === svcId);
                    return svc ? (
                      <span
                        key={`drawer-svc-${svcId}`}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-kpmg-surface-container text-xs font-medium text-kpmg-on-surface-variant font-body"
                      >
                        {svc.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Partner insight */}
              <div className="p-3 rounded-lg bg-kpmg-primary/5 border border-kpmg-primary/15">
                <p className="text-xs font-semibold text-kpmg-primary uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
                  Partner Insight
                </p>
                <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed">
                  {selectedCase.partnerInsight}
                </p>
              </div>

              {/* Governance */}
              <div>
                <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
                  Governance Notes
                </p>
                <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed">
                  {selectedCase.governanceNotes}
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