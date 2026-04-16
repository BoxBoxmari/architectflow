'use client';
import React, { useState, useRef } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import { X, ChevronRight, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';

type SelectedCase = (typeof AI_CASES)[0] | null;

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
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const filteredCases = AI_CASES.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tech.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFunction = !activeFunction || c.linkedFunctions.includes(activeFunction);
    return matchesSearch && matchesFunction;
  });

  const activeCase =
    selectedCase || (hoveredCase ? AI_CASES.find((c) => c.id === hoveredCase) : null);

  const activeFunctionIds = activeCase
    ? new Set(activeCase.linkedFunctions)
    : new Set(filteredCases.flatMap((c) => c.linkedFunctions));

  const activeServiceIds = activeCase
    ? new Set(activeCase.linkedServices)
    : new Set(filteredCases.flatMap((c) => c.linkedServices));

  const isTracing = !!(selectedCase || hoveredCase);

  function handleSelectCase(c: (typeof AI_CASES)[0]) {
    const isSelected = selectedCase?.id === c.id;
    if (isSelected) {
      setDrawerVisible(false);
      setTimeout(() => {
        setSelectedCase(null);
        setSelectingId(null);
      }, 200);
    } else {
      setSelectingId(c.id);
      setSelectedCase(c);
      setTimeout(() => {
        setDrawerVisible(true);
        setSelectingId(null);
      }, 50);
    }
  }

  function reset() {
    setDrawerVisible(false);
    setTimeout(() => {
      setSelectedCase(null);
      setHoveredCase(null);
      setActiveFunction(null);
      setSearchQuery('');
      setSelectingId(null);
    }, 200);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none dark:border dark:border-gray-700 px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative w-full sm:flex-1 sm:min-w-40 sm:max-w-56">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases or techniques..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-kpmg-surface-container dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg border border-transparent focus:border-kpmg-outline-variant dark:focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 placeholder:text-kpmg-outline transition-all font-body"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 font-body">Filter:</span>
          {FUNCTIONS.map((fn) => (
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
            className="ml-auto flex items-center gap-1.5 text-xs text-kpmg-outline dark:text-gray-500 hover:text-kpmg-primary dark:hover:text-blue-400 transition-colors font-body"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Trace hint */}
      {!isTracing && (
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-kpmg-accent-faster flex-shrink-0" />
          <p className="text-xs text-kpmg-outline dark:text-gray-500 font-body">
            Select a case to trace its architecture — which functions and services it reaches
          </p>
        </div>
      )}
      {isTracing && selectedCase && (
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-kpmg-accent-faster flex-shrink-0 animate-pulse" />
          <p className="text-xs font-semibold text-kpmg-primary dark:text-blue-400 font-body">
            Tracing <span className="font-bold">{selectedCase.code}</span> — {activeFunctionIds.size} functions · {activeServiceIds.size} services reached
          </p>
        </div>
      )}

      {/* Canvas + Drawer */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Canvas */}
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none dark:border dark:border-gray-700 overflow-hidden transition-all duration-300">
          <div className="p-5 border-b border-kpmg-outline-variant/30 dark:border-gray-700 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-accent-faster" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant dark:text-gray-400 font-body">
                AI Cases ({filteredCases.length})
              </span>
            </div>
            <div className="flex-1 h-px bg-kpmg-outline-variant/30 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-primary" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant dark:text-gray-400 font-body">
                Functions
              </span>
            </div>
            <div className="flex-1 h-px bg-kpmg-outline-variant/30 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-outline-variant" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant dark:text-gray-400 font-body">
                Services
              </span>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {/* Cases column */}
              <div className="flex flex-col gap-3 w-44">
                <p
                  className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                >
                  AI Cases
                </p>
                {filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const isHovered = hoveredCase === c.id;
                  const isSelecting = selectingId === c.id;
                  const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';
                  return (
                    <button
                      key={`case-node-${c.id}`}
                      onClick={() => handleSelectCase(c)}
                      onMouseEnter={() => setHoveredCase(c.id)}
                      onMouseLeave={() => setHoveredCase(null)}
                      style={{
                        transition: 'border-color 250ms ease, background-color 250ms ease, box-shadow 250ms ease, opacity 200ms ease, transform 200ms ease',
                        transform: isSelecting ? 'scale(0.97)' : isSelected ? 'scale(1.01)' : 'scale(1)',
                        opacity: isTracing && !isSelected ? 0.55 : 1,
                      }}
                      className={[
                        'text-left p-3 rounded-xl border-2 w-full node-card-hover',
                        isSelected
                          ? 'border-kpmg-accent-faster bg-kpmg-accent-faster/5 shadow-card-hover'
                          : isHovered
                            ? 'border-kpmg-outline-variant dark:border-gray-600 bg-kpmg-surface-container-low dark:bg-gray-700 shadow-card'
                            : 'border-transparent bg-kpmg-surface-container-low dark:bg-gray-700/60',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-kpmg-outline dark:text-gray-400 font-body flex-shrink-0">
                          {c.code}
                        </span>
                        <span
                          className="kpmg-badge text-xs flex-shrink-0 max-w-[100px] truncate"
                          style={{ backgroundColor: `${techColor}15`, color: techColor }}
                          title={c.tech}
                        >
                          {c.tech}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-kpmg-on-surface dark:text-gray-200 font-body leading-snug">
                        {c.title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Connector: Cases → Functions */}
              <div className="relative w-12 flex-shrink-0 self-stretch">
                <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-px bg-kpmg-outline-variant/30 dark:bg-gray-600" />
                <div
                  className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-0.5"
                  style={{
                    backgroundColor: '#00B8A9',
                    opacity: isTracing ? 0.7 : 0,
                    transition: 'opacity 400ms ease',
                  }}
                />
              </div>

              {/* Functions column */}
              <div className="flex flex-col gap-3 w-36">
                <p
                  className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                >
                  Functions
                </p>
                {FUNCTIONS.map((fn) => {
                  const isActive = activeFunctionIds.has(fn.id);
                  return (
                    <div
                      key={`fn-node-${fn.id}`}
                      style={{
                        transition: 'opacity 350ms ease, border-color 300ms ease, background-color 300ms ease, box-shadow 300ms ease',
                      }}
                      className={[
                        'p-3 rounded-xl border-2 fn-node-active',
                        isActive
                          ? isTracing
                            ? 'border-kpmg-primary bg-kpmg-primary/8 dark:bg-blue-900/20 dark:border-blue-500 opacity-100 shadow-card'
                            : 'border-kpmg-primary bg-kpmg-primary/5 dark:bg-blue-900/10 dark:border-blue-600 opacity-100' :'border-transparent bg-kpmg-surface-container dark:bg-gray-700/40 opacity-25',
                      ].join(' ')}
                    >
                      <div
                        className="w-2 h-2 rounded-full mb-2"
                        style={{ backgroundColor: fn.color ?? '#747683' }}
                      />
                      <p className="text-sm font-semibold text-kpmg-on-surface dark:text-gray-200 font-body break-words">
                        {fn.name}
                      </p>
                      <p className="text-xs text-kpmg-outline dark:text-gray-500 font-body mt-0.5">
                        {AI_CASES.filter((c) => c.linkedFunctions.includes(fn.id)).length} cases
                      </p>
                      {isTracing && isActive && (
                        <span className="inline-block mt-1.5 text-xs font-semibold text-kpmg-primary dark:text-blue-400 font-body" style={{ fontSize: '10px' }}>
                          ✓ Reached
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Connector: Functions → Services */}
              <div className="relative w-12 flex-shrink-0 self-stretch">
                <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-px bg-kpmg-outline-variant/30 dark:bg-gray-600" />
                <div
                  className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-0.5"
                  style={{
                    backgroundColor: '#006397',
                    opacity: isTracing ? 0.7 : 0,
                    transition: 'opacity 400ms ease 100ms',
                  }}
                />
              </div>

              {/* Services column */}
              <div className="flex flex-col gap-2 w-44">
                <p
                  className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                >
                  Services
                </p>
                {SERVICES.map((svc) => {
                  const isActive = activeServiceIds.has(svc.id);
                  const parentFn = FUNCTIONS.find(fn => fn.id === svc.functionId);
                  return (
                    <div
                      key={`svc-node-${svc.id}`}
                      style={{
                        transition: 'opacity 350ms ease 50ms, border-color 300ms ease, background-color 300ms ease, box-shadow 300ms ease',
                      }}
                      className={[
                        'px-3 py-2 rounded-lg border svc-node-active',
                        isActive
                          ? isTracing
                            ? 'border-kpmg-outline-variant dark:border-gray-600 bg-white dark:bg-gray-700 opacity-100 shadow-card'
                            : 'border-kpmg-outline-variant dark:border-gray-600 bg-white dark:bg-gray-700 opacity-100' :'border-transparent bg-kpmg-surface-container dark:bg-gray-700/40 opacity-20',
                      ].join(' ')}
                    >
                      {isActive && isTracing && parentFn && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5 align-middle"
                          style={{ backgroundColor: parentFn.color ?? '#747683' }}
                        />
                      )}
                      <span className="text-xs font-medium text-kpmg-on-surface dark:text-gray-200 font-body">
                        {svc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-kpmg-outline-variant/30 dark:border-gray-700 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body flex-shrink-0">AI Technique:</span>
            {Object.entries(TECHNIQUE_COLORS).map(([tech, color]) => (
              <div key={`legend-tech-${tech}`} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-kpmg-on-surface-variant dark:text-gray-400 font-body">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedCase && (
          <div
            key={selectedCase.id}
            ref={drawerRef}
            style={{
              opacity: drawerVisible ? 1 : 0,
              transform: drawerVisible ? 'translateX(0)' : 'translateX(24px)',
              transition: 'opacity 250ms ease, transform 250ms ease',
              maxHeight: 'calc(100vh - 160px)',
            }}
            className="w-full lg:w-80 lg:flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-drawer dark:shadow-none dark:border dark:border-gray-700 overflow-y-auto scrollbar-thin"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-kpmg-outline-variant/30 dark:border-gray-700 px-5 py-4 flex items-start justify-between z-10">
              <div>
                <span className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 font-body">
                  {selectedCase.code}
                </span>
                <h3 className="font-display text-base font-bold text-kpmg-on-surface dark:text-gray-100 mt-0.5 leading-snug">
                  {selectedCase.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setDrawerVisible(false);
                  setTimeout(() => setSelectedCase(null), 200);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-kpmg-surface-container dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-2"
                aria-label="Close drawer"
              >
                <X size={14} className="text-kpmg-outline dark:text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Source + Technique */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[selectedCase.status]?.bg ?? '#F0EDEC',
                      color: STATUS_COLORS[selectedCase.status]?.text ?? '#747683',
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
                <p className="text-xs text-kpmg-outline dark:text-gray-500 font-body mt-1">{selectedCase.source}</p>
              </div>

              {/* Reuse summary */}
              <div className="p-3 rounded-lg bg-kpmg-accent-faster/5 dark:bg-teal-900/20 border border-kpmg-accent-faster/20 dark:border-teal-700/30">
                <p
                  className="text-xs font-semibold text-kpmg-accent-faster uppercase tracking-widest font-body mb-1.5"
                  style={{ fontSize: '10px' }}
                >
                  Foundation Reach
                </p>
                <p className="text-sm font-bold text-kpmg-on-surface dark:text-gray-100 font-display">
                  {selectedCase.linkedFunctions.length} functions · {selectedCase.linkedServices.length} services
                </p>
                <p className="text-xs text-kpmg-on-surface-variant dark:text-gray-400 font-body mt-1 leading-snug">
                  One architecture pattern — reused across all highlighted functions
                </p>
              </div>

              {/* Key value metrics */}
              <div>
                <p
                  className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 uppercase tracking-widest font-body mb-2"
                  style={{ fontSize: '10px' }}
                >
                  Key Value Metrics
                </p>
                <ul className="space-y-1.5">
                  {selectedCase.metrics.map((m, i) => (
                    <li key={`dm-${selectedCase.id}-${i}`} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-kpmg-primary dark:bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-kpmg-on-surface-variant dark:text-gray-400 font-body">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Linked functions grouped with services */}
              <div>
                <p
                  className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 uppercase tracking-widest font-body mb-2"
                  style={{ fontSize: '10px' }}
                >
                  Reaches
                </p>
                <div className="space-y-2">
                  {FUNCTIONS.filter((fn) =>
                    selectedCase.linkedFunctions.includes(fn.id),
                  ).map((fn) => {
                    const fnSvcs = SERVICES.filter(
                      (s) =>
                        s.functionId === fn.id &&
                        selectedCase.linkedServices.includes(s.id),
                    );
                    return (
                      <div
                        key={`reach-fn-${fn.id}`}
                        className="p-2 rounded-lg bg-kpmg-surface-container-low dark:bg-gray-700/50 border border-kpmg-primary/10 dark:border-blue-900/30"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: fn.color ?? '#747683' }}
                          />
                          <span className="text-xs font-semibold text-kpmg-on-surface dark:text-gray-200 font-body">
                            {fn.name}
                          </span>
                        </div>
                        {fnSvcs.map((svc) => (
                          <p
                            key={`reach-svc-${svc.id}`}
                            className="text-xs text-kpmg-outline dark:text-gray-500 font-body ml-3"
                          >
                            → {svc.name}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Partner insight */}
              <div className="p-3 rounded-lg bg-kpmg-primary/5 dark:bg-blue-900/20 border border-kpmg-primary/15 dark:border-blue-800/30">
                <p
                  className="text-xs font-semibold text-kpmg-primary dark:text-blue-400 uppercase tracking-widest font-body mb-1.5"
                  style={{ fontSize: '10px' }}
                >
                  Partner Insight
                </p>
                <p className="text-xs text-kpmg-on-surface-variant dark:text-gray-400 font-body leading-relaxed">
                  {selectedCase.insight}
                </p>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Link href="/value-simulator">
                  <span className="kpmg-btn-primary w-full justify-center text-xs cursor-pointer">
                    Model the Value
                    <ChevronRight size={13} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}