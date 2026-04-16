'use client';
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import { X, ChevronRight, RotateCcw, Search, Mail, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type SelectedCase = (typeof AI_CASES)[0] | null;

const TECHNIQUE_COLORS: Record<string, string> = {
  'RAG + LLM Re-ranking': '#00205F',
  'RAG-based GenAI Drafting': '#006397',
  'Doc Parsing + LLM + Anomaly Flag': '#0F6E56',
  'LLM Extraction + Template Gen': '#007A73',
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

// Value chips per case (ROI, time saved, etc.)
const VALUE_CHIPS: Record<string, { label: string; value: string; color: string }[]> = {
  'TAX-001': [
    { label: 'ROI', value: '+$1.24M', color: '#0F6E56' },
    { label: 'Time Saved', value: '860 hrs/mo', color: '#006397' },
    { label: 'FTEs Freed', value: '5.1', color: '#00B8A9' },
  ],
  'AUD-001': [
    { label: 'ROI', value: '+$980K', color: '#0F6E56' },
    { label: 'Time Saved', value: '720 hrs/mo', color: '#006397' },
    { label: 'Adoption', value: '68%', color: '#F39C12' },
  ],
  'LAW-001': [
    { label: 'ROI', value: '+$1.1M', color: '#0F6E56' },
    { label: 'Time Saved', value: '540 hrs/mo', color: '#006397' },
    { label: 'FTEs Freed', value: '3.8', color: '#00B8A9' },
  ],
  'DEAL-001': [
    { label: 'ROI', value: '+$2.3M', color: '#0F6E56' },
    { label: 'Time Saved', value: '1.2k hrs/mo', color: '#006397' },
    { label: 'Adoption', value: '82%', color: '#F39C12' },
  ],
  'CON-001': [
    { label: 'ROI', value: '+$760K', color: '#0F6E56' },
    { label: 'Time Saved', value: '4.5k hrs', color: '#006397' },
    { label: 'FTEs Freed', value: '6.2', color: '#00B8A9' },
  ],
};

// Annualized return per case for business value filter
const CASE_VALUE: Record<string, number> = {
  'TAX-001': 1240000,
  'AUD-001': 980000,
  'LAW-001': 1100000,
  'DEAL-001': 2300000,
  'CON-001': 760000,
};

// Node position refs for Bezier connectors
interface NodePos { top: number; height: number }

interface ArchitectureCanvasProps {
  onStateChange?: (state: {
    selectedCase: SelectedCase;
    activeFunction: string | null;
    searchQuery: string;
    filteredCases: typeof AI_CASES;
  }) => void;
}

export default function ArchitectureCanvas({ onStateChange }: ArchitectureCanvasProps) {
  const [selectedCase, setSelectedCase] = useState<SelectedCase>(null);
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [valueFilter, setValueFilter] = useState<boolean>(false);
  const [liveMessage, setLiveMessage] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedCaseRef = useRef<HTMLButtonElement | null>(null);

  // Refs for measuring node positions for Bezier connectors
  const caseNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const fnNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const svcNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const caseColRef = useRef<HTMLDivElement>(null);
  const fnColRef = useRef<HTMLDivElement>(null);
  const svcColRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [casePositions, setCasePositions] = useState<Record<string, NodePos>>({});
  const [fnPositions, setFnPositions] = useState<Record<string, NodePos>>({});
  const [svcPositions, setSvcPositions] = useState<Record<string, NodePos>>({});
  const [colLayout, setColLayout] = useState({ caseRight: 0, fnLeft: 0, fnRight: 0, svcLeft: 0 });

  const filteredCases = AI_CASES.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tech.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFunction = !activeFunction || c.linkedFunctions.includes(activeFunction);
    const matchesValue = !valueFilter || (CASE_VALUE[c.id] ?? 0) >= 1000000;
    return matchesSearch && matchesFunction && matchesValue;
  });

  // Notify parent of live canvas state changes
  useEffect(() => {
    onStateChange?.({ selectedCase, activeFunction, searchQuery, filteredCases });
  }, [selectedCase, activeFunction, searchQuery, filteredCases.length]);

  const activeCase =
    selectedCase || null;

  const activeFunctionIds = activeCase
    ? new Set(activeCase.linkedFunctions)
    : new Set(filteredCases.flatMap((c) => c.linkedFunctions));

  const activeServiceIds = activeCase
    ? new Set(activeCase.linkedServices)
    : new Set(filteredCases.flatMap((c) => c.linkedServices));

  const isTracing = !!selectedCase;

  function handleSelectCase(c: (typeof AI_CASES)[0]) {
    const isSelected = selectedCase?.id === c.id;
    if (isSelected) {
      setDrawerVisible(false);
      setTimeout(() => {
        setSelectedCase(null);
        setSelectingId(null);
        // Return focus to the case node that was active
        lastFocusedCaseRef.current?.focus();
      }, 200);
      setLiveMessage('');
    } else {
      // Remember which case node triggered the drawer
      lastFocusedCaseRef.current = caseNodeRefs.current[c.id] ?? null;
      setSelectingId(c.id);
      setSelectedCase(c);
      setTimeout(() => {
        setDrawerVisible(true);
        setSelectingId(null);
      }, 50);
      setLiveMessage(
        `Tracing ${c.code}: ${c.title}. Technique: ${c.tech}. Status: ${c.status}. Architecture detail panel opened.`,
      );
    }
  }

  function reset() {
    setDrawerVisible(false);
    setTimeout(() => {
      setSelectedCase(null);
      setActiveFunction(null);
      setSearchQuery('');
      setSelectingId(null);
      setValueFilter(false);
    }, 200);
    setLiveMessage('All filters and selections cleared.');
  }

  // Auto-focus the drawer close button when drawer becomes visible
  useEffect(() => {
    if (drawerVisible && drawerCloseRef.current) {
      drawerCloseRef.current.focus();
    }
  }, [drawerVisible]);

  // Measure node positions for Bezier connectors
  const measurePositions = useCallback(() => {
    if (!canvasRef.current || !caseColRef.current || !fnColRef.current || !svcColRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const caseColRect = caseColRef.current.getBoundingClientRect();
    const fnColRect = fnColRef.current.getBoundingClientRect();
    const svcColRect = svcColRef.current.getBoundingClientRect();

    setColLayout({
      caseRight: caseColRect.right - canvasRect.left,
      fnLeft: fnColRect.left - canvasRect.left,
      fnRight: fnColRect.right - canvasRect.left,
      svcLeft: svcColRect.left - canvasRect.left,
    });

    const newCasePos: Record<string, NodePos> = {};
    Object.entries(caseNodeRefs.current).forEach(([id, el]) => {
      if (el) {
        const r = el.getBoundingClientRect();
        newCasePos[id] = { top: r.top - canvasRect.top, height: r.height };
      }
    });
    setCasePositions(newCasePos);

    const newFnPos: Record<string, NodePos> = {};
    Object.entries(fnNodeRefs.current).forEach(([id, el]) => {
      if (el) {
        const r = el.getBoundingClientRect();
        newFnPos[id] = { top: r.top - canvasRect.top, height: r.height };
      }
    });
    setFnPositions(newFnPos);

    const newSvcPos: Record<string, NodePos> = {};
    Object.entries(svcNodeRefs.current).forEach(([id, el]) => {
      if (el) {
        const r = el.getBoundingClientRect();
        newSvcPos[id] = { top: r.top - canvasRect.top, height: r.height };
      }
    });
    setSvcPositions(newSvcPos);
  }, []);

  useLayoutEffect(() => {
    measurePositions();
  }, [filteredCases.length, selectedCase?.id, measurePositions]);

  // Build Bezier paths for Case→Function connectors
  const caseFnPaths: { path: string; caseId: string; fnId: string; active: boolean }[] = [];
  filteredCases.forEach((c) => {
    c.linkedFunctions.forEach((fnId) => {
      const casePos = casePositions[c.id];
      const fnPos = fnPositions[fnId];
      if (!casePos || !fnPos) return;
      const x1 = colLayout.caseRight;
      const y1 = casePos.top + casePos.height / 2;
      const x2 = colLayout.fnLeft;
      const y2 = fnPos.top + fnPos.height / 2;
      const cx = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
      const active = isTracing
        ? selectedCase?.id === c.id && activeFunctionIds.has(fnId)
        : true;
      caseFnPaths.push({ path, caseId: c.id, fnId, active });
    });
  });

  // Build Bezier paths for Function→Service connectors
  const fnSvcPaths: { path: string; fnId: string; svcId: string; active: boolean }[] = [];
  FUNCTIONS.forEach((fn) => {
    SERVICES.filter((s) => s.functionId === fn.id).forEach((svc) => {
      const fnPos = fnPositions[fn.id];
      const svcPos = svcPositions[svc.id];
      if (!fnPos || !svcPos) return;
      const x1 = colLayout.fnRight;
      const y1 = fnPos.top + fnPos.height / 2;
      const x2 = colLayout.svcLeft;
      const y2 = svcPos.top + svcPos.height / 2;
      const cx = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
      const active = isTracing ? activeFunctionIds.has(fn.id) && activeServiceIds.has(svc.id) : true;
      fnSvcPaths.push({ path, fnId: fn.id, svcId: svc.id, active });
    });
  });

  const chips = selectedCase ? (VALUE_CHIPS[selectedCase.id] ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* ARIA live region — announces trace updates to screen readers */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      {/* Filter bar */}
      <div
        role="search"
        aria-label="Filter AI cases"
        className="rounded-2xl px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{
          background: '#FFFFFF',
          boxShadow: '0px 24px 48px rgba(0,32,95,0.06)',
        }}
      >
        <div className="relative w-full sm:flex-1 sm:min-w-40 sm:max-w-56">
          <Search
            size={13}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases or techniques..."
            aria-label="Search AI cases by name or technique"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-kpmg-primary/15 placeholder:text-kpmg-outline transition-all font-body"
            style={{ background: '#EBE7E7', color: '#1C1B1B' }}
          />
        </div>
        <div role="group" aria-label="Filter by function" className="flex items-center gap-2 flex-wrap">
          <span
            className="font-body text-kpmg-outline"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            aria-hidden="true"
          >
            Function:
          </span>
          {FUNCTIONS.map((fn) => (
            <button
              key={`filter-fn-${fn.id}`}
              onClick={() => setActiveFunction(activeFunction === fn.id ? null : fn.id)}
              aria-pressed={activeFunction === fn.id}
              aria-label={`Filter by ${fn.name} function${activeFunction === fn.id ? ' (active)' : ''}`}
              className={`kpmg-filter-chip ${activeFunction === fn.id ? 'active' : ''}`}
            >
              {fn.name}
            </button>
          ))}
        </div>
        {/* Business Value filter */}
        <div className="flex items-center gap-2">
          <span
            className="font-body text-kpmg-outline"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            aria-hidden="true"
          >
            Value:
          </span>
          <button
            onClick={() => setValueFilter(!valueFilter)}
            aria-pressed={valueFilter}
            aria-label={`Show only cases with business value over $1M${valueFilter ? ' (active)' : ''}`}
            className={`kpmg-filter-chip flex items-center gap-1 ${valueFilter ? 'active' : ''}`}
          >
            <TrendingUp size={10} aria-hidden="true" />
            &gt;$1M
          </button>
        </div>
        {(selectedCase || activeFunction || searchQuery || valueFilter) && (
          <button
            onClick={reset}
            aria-label="Reset all filters and selection"
            className="ml-auto flex items-center gap-1.5 text-xs text-kpmg-outline hover:text-kpmg-primary transition-colors font-body"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Trace hint */}
      {!isTracing && (
        <div className="flex items-center gap-2 px-1" aria-live="polite" aria-atomic="true">
          <span className="w-1.5 h-1.5 rounded-full bg-kpmg-accent-faster flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-kpmg-on-surface font-body">
            Select a case to trace its architecture — which functions and services it reaches
          </p>
        </div>
      )}
      {isTracing && selectedCase && (
        <div className="flex items-center gap-2 px-1" aria-live="polite" aria-atomic="true">
          <span className="w-1.5 h-1.5 rounded-full bg-kpmg-accent-faster flex-shrink-0 animate-pulse" aria-hidden="true" />
          <p className="text-xs font-semibold text-kpmg-primary font-body" aria-hidden="true">
            Tracing <span className="font-bold">{selectedCase.code}</span> — {activeFunctionIds.size} functions · {activeServiceIds.size} services reached
          </p>
        </div>
      )}

      {/* Canvas + Drawer */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Canvas — Paper on Stone */}
        <div
          className="flex-1 min-w-0 rounded-2xl overflow-hidden transition-all duration-300"
          role="region"
          aria-label="Architecture canvas — AI Cases, Business Functions, and Service Solutions"
          style={{
            background: '#FCF9F8',
            boxShadow: '0px 24px 48px rgba(0,32,95,0.06)',
          }}
        >
          {/* Column header bar */}
          <div
            className="px-5 py-3 flex items-center gap-4"
            style={{ background: '#F0EDEC' }}
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-accent-faster" />
              <span
                className="font-body text-kpmg-on-surface-variant"
                style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                AI Cases ({filteredCases.length})
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(196,198,212,0.3)' }} />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-primary" />
              <span
                className="font-body text-kpmg-on-surface-variant"
                style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Business Functions
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(196,198,212,0.3)' }} />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-kpmg-outline-variant" />
              <span
                className="font-body text-kpmg-on-surface-variant"
                style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Service Solutions
              </span>
            </div>
          </div>

          {/* Main canvas area with SVG overlay for Bezier connectors */}
          <div className="p-4 overflow-x-auto">
            <div ref={canvasRef} className="relative flex gap-0 w-full" style={{ minHeight: 320 }}>
              {/* SVG Bezier connector overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
                style={{ overflow: 'visible', zIndex: 0 }}
              >
                {/* Case → Function paths */}
                {caseFnPaths.map(({ path, caseId, fnId, active }) => (
                  <path
                    key={`cf-${caseId}-${fnId}`}
                    d={path}
                    fill="none"
                    stroke={active && isTracing ? '#00B8A9' : '#C4C6D4'}
                    strokeWidth={active && isTracing ? 1.5 : 1}
                    strokeOpacity={isTracing ? (active ? 0.85 : 0.15) : 0.35}
                    style={{ transition: 'stroke 300ms ease, stroke-opacity 300ms ease, stroke-width 300ms ease' }}
                  />
                ))}
                {/* Function → Service paths */}
                {fnSvcPaths.map(({ path, fnId, svcId, active }) => (
                  <path
                    key={`fs-${fnId}-${svcId}`}
                    d={path}
                    fill="none"
                    stroke={active && isTracing ? '#006397' : '#C4C6D4'}
                    strokeWidth={active && isTracing ? 1.5 : 1}
                    strokeOpacity={isTracing ? (active ? 0.85 : 0.15) : 0.35}
                    style={{ transition: 'stroke 300ms ease, stroke-opacity 300ms ease, stroke-width 300ms ease' }}
                  />
                ))}
              </svg>

              {/* Cases column — Paper lane */}
              <div
                ref={caseColRef}
                className="flex flex-col gap-3 flex-1 min-w-0 rounded-xl px-3 py-3"
                style={{ background: '#FFFFFF', position: 'relative', zIndex: 1 }}
                role="list"
                aria-label="AI Cases"
              >
                <p
                  className="text-xs font-semibold text-kpmg-on-surface-variant uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                  aria-hidden="true"
                >
                  AI Cases
                </p>
                {filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const isSelecting = selectingId === c.id;
                  const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';
                  const dimmed = isTracing && !isSelected;
                  return (
                    <button
                      key={`case-node-${c.id}`}
                      ref={(el) => { caseNodeRefs.current[c.id] = el; }}
                      role="listitem"
                      onClick={() => handleSelectCase(c)}
                      aria-pressed={isSelected}
                      aria-label={`${c.code}: ${c.title}. Technique: ${c.tech}. Status: ${c.status}. ${isSelected ? 'Selected — press to deselect' : 'Press to trace architecture'}`}
                      style={{
                        transition: 'border-color 250ms ease, background-color 250ms ease, box-shadow 250ms ease, opacity 200ms ease, transform 200ms ease',
                        transform: isSelecting ? 'scale(0.97)' : isSelected ? 'scale(1.01)' : 'scale(1)',
                        opacity: dimmed ? 0.45 : 1,
                        background: isSelected ? '#FFFFFF' : '#FCF9F8',
                        boxShadow: isSelected
                          ? '0px 0px 0px 2px #00B8A9, 0px 24px 48px rgba(0,32,95,0.10)'
                          : 'none',
                        borderRadius: '12px',
                        border: 'none',
                        padding: '12px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-accent-faster focus:ring-offset-1"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className="font-body flex-shrink-0"
                          style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#747683' }}
                        >
                          {c.code}
                        </span>
                        <span
                          className="kpmg-badge text-xs flex-shrink-0"
                          style={{ backgroundColor: `${techColor}15`, color: techColor, whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'right', maxWidth: '120px' }}
                          aria-hidden="true"
                        >
                          {c.tech}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-kpmg-on-surface font-body leading-snug">
                        {c.title}
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1">
                          <span
                            className="inline-block rounded-full px-2 py-0.5 font-body"
                            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: '#00B8A920', color: '#00B8A9' }}
                          >
                            ✓ Tracing
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Gap for SVG connectors — Cases→Functions */}
              <div className="w-10 flex-shrink-0" aria-hidden="true" />

              {/* Functions column — Stone lane */}
              <div
                ref={fnColRef}
                className="flex flex-col gap-3 flex-1 min-w-0 rounded-xl px-3 py-3"
                style={{ background: '#F0EDEC', position: 'relative', zIndex: 1 }}
                role="list"
                aria-label="Functions"
              >
                <p
                  className="text-xs font-semibold text-kpmg-on-surface-variant uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                  aria-hidden="true"
                >
                  Functions
                </p>
                {FUNCTIONS.map((fn) => {
                  const isActive = activeFunctionIds.has(fn.id);
                  const caseCount = AI_CASES.filter((c) => c.linkedFunctions.includes(fn.id)).length;
                  return (
                    <div
                      key={`fn-node-${fn.id}`}
                      ref={(el) => { fnNodeRefs.current[fn.id] = el; }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${fn.name} function. ${caseCount} cases linked.${isTracing ? (isActive ? ' Reached by selected case.' : ' Not reached by selected case.') : ''}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveFunction(activeFunction === fn.id ? null : fn.id);
                        }
                      }}
                      style={{
                        transition: 'opacity 350ms ease, box-shadow 300ms ease, background-color 300ms ease',
                        opacity: isTracing ? (isActive ? 1 : 0.25) : 1,
                        background: isActive && isTracing ? '#FFFFFF' : '#EBE7E7',
                        boxShadow: isActive && isTracing ? '0px 4px 16px rgba(0,32,95,0.08)' : 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'default',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1"
                    >
                      <div
                        className="w-2 h-2 rounded-full mb-2"
                        style={{ backgroundColor: fn.color ?? '#747683' }}
                        aria-hidden="true"
                      />
                      <p
                        className="font-body break-words"
                        style={{ fontSize: '13px', fontWeight: 600, color: '#1C1B1B' }}
                      >
                        {fn.name}
                      </p>
                      <p
                        className="font-body mt-0.5"
                        style={{ fontSize: '11px', color: '#747683' }}
                      >
                        {caseCount} cases
                      </p>
                      {isTracing && isActive && (
                        <span
                          className="inline-block mt-1.5 font-body"
                          style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#00205F' }}
                        >
                          ✓ Reached
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gap for SVG connectors — Functions→Services */}
              <div className="w-10 flex-shrink-0" aria-hidden="true" />

              {/* Services column — Paper lane */}
              <div
                ref={svcColRef}
                className="flex flex-col gap-2 flex-1 min-w-0 rounded-xl px-3 py-3"
                style={{ background: '#FFFFFF', position: 'relative', zIndex: 1 }}
                role="list"
                aria-label="Services"
              >
                <p
                  className="text-xs font-semibold text-kpmg-on-surface-variant uppercase tracking-widest font-body mb-1"
                  style={{ fontSize: '10px' }}
                  aria-hidden="true"
                >
                  Services
                </p>
                {SERVICES.map((svc) => {
                  const isActive = activeServiceIds.has(svc.id);
                  const parentFn = FUNCTIONS.find((fn) => fn.id === svc.functionId);
                  return (
                    <div
                      key={`svc-node-${svc.id}`}
                      ref={(el) => { svcNodeRefs.current[svc.id] = el; }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${svc.name} service${parentFn ? `, under ${parentFn.name}` : ''}.${isTracing ? (isActive ? ' Reached by selected case.' : ' Not reached by selected case.') : ''}`}
                      style={{
                        transition: 'opacity 350ms ease 50ms, box-shadow 300ms ease, background-color 300ms ease',
                        opacity: isTracing ? (isActive ? 1 : 0.18) : 1,
                        background: isActive && isTracing ? '#F0EDEC' : '#FCF9F8',
                        boxShadow: isActive && isTracing ? '0px 2px 8px rgba(0,32,95,0.06)' : 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'default',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-secondary focus:ring-offset-1"
                    >
                      {isActive && isTracing && parentFn && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5 align-middle"
                          style={{ backgroundColor: parentFn.color ?? '#747683' }}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className="font-body"
                        style={{ fontSize: '12px', fontWeight: 500, color: '#1C1B1B' }}
                      >
                        {svc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div
            className="px-5 py-3 flex items-center gap-3 flex-wrap"
            style={{ background: '#F0EDEC' }}
            aria-label="AI Technique legend"
            role="region"
          >
            <span
              className="font-body text-kpmg-on-surface-variant"
              style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              AI Technique:
            </span>
            {Object.entries(TECHNIQUE_COLORS).map(([tech, color]) => (
              <div key={`legend-tech-${tech}`} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-xs text-kpmg-on-surface-variant font-body">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedCase && (
          <div
            key={selectedCase.id}
            ref={drawerRef}
            role="dialog"
            aria-modal="false"
            aria-label={`Case detail: ${selectedCase.code} — ${selectedCase.title}`}
            style={{
              opacity: drawerVisible ? 1 : 0,
              transform: drawerVisible ? 'translateX(0)' : 'translateX(24px)',
              transition: 'opacity 250ms ease, transform 250ms ease',
              maxHeight: 'calc(100vh - 160px)',
              boxShadow: '0px 24px 48px rgba(0, 32, 95, 0.10)',
              background: '#FFFFFF',
            }}
            className="w-full lg:w-80 lg:flex-shrink-0 rounded-2xl overflow-y-auto scrollbar-thin"
          >
            {/* Drawer header */}
            <div
              className="sticky top-0 px-5 py-4 flex items-start justify-between z-10"
              style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(196,198,212,0.25)' }}
            >
              <div>
                <span
                  className="font-body"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#747683' }}
                >
                  {selectedCase.code}
                </span>
                <h3 className="font-display text-base font-bold text-kpmg-on-surface mt-0.5 leading-snug">
                  {selectedCase.title}
                </h3>
              </div>
              <button
                ref={drawerCloseRef}
                onClick={() => {
                  setDrawerVisible(false);
                  setLiveMessage(`Detail panel for ${selectedCase.code} closed.`);
                  setTimeout(() => {
                    setSelectedCase(null);
                    lastFocusedCaseRef.current?.focus();
                  }, 200);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-kpmg-surface-container transition-colors flex-shrink-0 ml-2 focus:outline-none focus:ring-2 focus:ring-kpmg-primary"
                aria-label={`Close detail panel for ${selectedCase.title}`}
              >
                <X size={14} className="text-kpmg-outline" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status + Technique badges */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: STATUS_COLORS[selectedCase.status]?.bg ?? '#F0EDEC',
                      color: STATUS_COLORS[selectedCase.status]?.text ?? '#747683',
                    }}
                    aria-label={`Status: ${selectedCase.status}`}
                  >
                    {selectedCase.status}
                  </span>
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: `${TECHNIQUE_COLORS[selectedCase.tech] || '#747683'}15`,
                      color: TECHNIQUE_COLORS[selectedCase.tech] || '#747683',
                    }}
                    aria-label={`Technique: ${selectedCase.tech}`}
                  >
                    {selectedCase.tech}
                  </span>
                </div>
                <p className="text-xs text-kpmg-outline font-body mt-1">{selectedCase.source}</p>
              </div>

              {/* Value Chips */}
              {chips.length > 0 && (
                <div>
                  <p
                    className="font-body mb-2"
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#747683' }}
                  >
                    Business Value
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, i) => (
                      <div
                        key={`chip-${i}`}
                        className="flex flex-col rounded-xl px-3 py-2"
                        style={{ background: `${chip.color}10`, minWidth: '72px' }}
                      >
                        <span
                          className="font-body"
                          style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: chip.color }}
                        >
                          {chip.label}
                        </span>
                        <span
                          className="font-display font-bold mt-0.5"
                          style={{ fontSize: '15px', color: chip.color }}
                        >
                          {chip.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foundation Reach */}
              <div
                className="p-3 rounded-xl"
                style={{ background: '#00B8A908', border: '1px solid rgba(0,184,169,0.2)' }}
              >
                <p
                  className="font-body mb-1.5"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#00B8A9' }}
                >
                  Foundation Reach
                </p>
                <p className="text-sm font-bold text-kpmg-on-surface font-display">
                  {selectedCase.linkedFunctions.length} functions · {selectedCase.linkedServices.length} services
                </p>
                <p className="text-xs text-kpmg-on-surface-variant font-body mt-1 leading-snug">
                  One architecture pattern — reused across all highlighted functions
                </p>
              </div>

              {/* Key Value Metrics */}
              <div>
                <p
                  className="font-body mb-2"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#747683' }}
                >
                  Key Value Metrics
                </p>
                <ul className="space-y-1.5" aria-label="Key value metrics">
                  {selectedCase.metrics.map((m, i) => (
                    <li key={`dm-${selectedCase.id}-${i}`} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-kpmg-primary mt-1.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-kpmg-on-surface-variant font-body">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reaches */}
              <div>
                <p
                  className="font-body mb-2"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#747683' }}
                >
                  Reaches
                </p>
                <div className="space-y-2" role="list" aria-label="Reached functions and services">
                  {FUNCTIONS.filter((fn) => selectedCase.linkedFunctions.includes(fn.id)).map((fn) => {
                    const fnSvcs = SERVICES.filter(
                      (s) =>
                        s.functionId === fn.id &&
                        selectedCase.linkedServices.includes(s.id),
                    );
                    return (
                      <div
                        key={`reach-fn-${fn.id}`}
                        role="listitem"
                        className="p-2 rounded-lg"
                        style={{ background: '#F0EDEC' }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: fn.color ?? '#747683' }}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold text-kpmg-on-surface font-body">
                            {fn.name}
                          </span>
                        </div>
                        {fnSvcs.map((svc) => (
                          <p
                            key={`reach-svc-${svc.id}`}
                            className="text-xs text-kpmg-outline font-body ml-3"
                          >
                            → {svc.name}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Partner Insight */}
              <div
                className="p-3 rounded-xl"
                style={{ background: '#00205F08', border: '1px solid rgba(0,32,95,0.12)' }}
              >
                <p
                  className="font-body mb-1.5"
                  style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#00205F' }}
                >
                  Partner Insight
                </p>
                <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed">
                  {selectedCase.insight}
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-2 space-y-2">
                <Link href="/value-simulator">
                  <span className="kpmg-btn-primary w-full justify-center text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1">
                    Model the Value
                    <ChevronRight size={13} aria-hidden="true" />
                  </span>
                </Link>
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold font-body transition-colors focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1"
                  style={{ background: '#F0EDEC', color: '#00205F' }}
                  onClick={() => window.open('mailto:ai-innovation@kpmg.com?subject=AI Architecture Inquiry: ' + selectedCase.code, '_blank')}
                  aria-label={`Contact AI Innovation team about ${selectedCase.code}`}
                >
                  <Mail size={13} aria-hidden="true" />
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