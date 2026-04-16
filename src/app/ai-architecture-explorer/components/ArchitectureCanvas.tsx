'use client';
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import { X, RotateCcw, Search, Mail, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type SelectedCase = (typeof AI_CASES)[0] | null;

const TECHNIQUE_COLORS: Record<string, string> = {
  'RAG + LLM (Knowledge Agent)': '#00205F',
  'LLM + Document Translation + Layout Preservation': '#006397',
  'Document Extraction + Semi-structured Parsing': '#0F6E56',
  'LLM Simulation + Scenario Reasoning': '#45004F',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Concept: { bg: '#F0EDEC', text: '#747683' },
  'In Development': { bg: '#FEF3C7', text: '#92400E' },
  Pilot: { bg: '#DBEAFE', text: '#1E40AF' },
  Active: { bg: '#D1FAE5', text: '#065F46' },
  Scaled: { bg: '#E0E7FF', text: '#00205F' },
};

const CASE_MATURITY: Record<string, string> = {
  'TAX-001':  'SCALE',
  'KDC-001':  'SCALE',
  'KDC-002':  'APPLY → SCALE',
  'CONS-001': 'INSPIRE → APPLY',
};

const CASE_VALUE: Record<string, string> = {
  'TAX-001':  '~5 FTE',
  'KDC-001':  'Cost / Cycle',
  'KDC-002':  'Accuracy / Efficiency',
  'CONS-001': 'New Revenue / Capability',
};

function buildValueChips(caseId: string): { label: string; value: string; color: string }[] {
  const maturity = CASE_MATURITY[caseId];
  const value    = CASE_VALUE[caseId];
  const fnCount  = AI_CASES.find((c) => c.id === caseId)?.linkedFunctions.length ?? 0;
  if (!maturity && !value) return [];
  return [
    { label: 'Value',     value: value    ?? '—', color: '#0F6E56' },
    { label: 'Maturity',  value: maturity ?? '—', color: '#006397' },
    { label: 'Functions', value: String(fnCount), color: '#00B8A9' },
  ];
}

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
  const [scaleFilter, setScaleFilter] = useState<boolean>(false);
  const [liveMessage, setLiveMessage] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedCaseRef = useRef<HTMLButtonElement | null>(null);

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
    const matchesScale = !scaleFilter || CASE_MATURITY[c.id] === 'SCALE';
    return matchesSearch && matchesFunction && matchesScale;
  });

  useEffect(() => {
    onStateChange?.({ selectedCase, activeFunction, searchQuery, filteredCases });
  }, [selectedCase, activeFunction, searchQuery, filteredCases.length]);

  const activeCase = selectedCase || null;

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
        lastFocusedCaseRef.current?.focus();
      }, 200);
      setLiveMessage('');
    } else {
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
      setScaleFilter(false);
    }, 200);
    setLiveMessage('All filters and selections cleared.');
  }

  useEffect(() => {
    if (drawerVisible && drawerCloseRef.current) {
      drawerCloseRef.current.focus();
    }
  }, [drawerVisible]);

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

  const fnSvcPaths: { path: string; fnId: string; svcId: string; active: boolean }[] = [];

  // Build fn→svc edge pairs from exact reach data to correctly handle shared service nodes
  // (e.g. "Professional Training" reached from both fn-tax and fn-law in CONS-001)
  const fnSvcEdgeSet = new Set<string>();
  const fnSvcEdges: { fnId: string; svcId: string; active: boolean }[] = [];

  if (isTracing && selectedCase) {
    // Active edges: exact reach pairs from the selected case
    (selectedCase.reach ?? []).forEach(({ fnId, svcId }) => {
      const key = `${fnId}::${svcId}`;
      if (!fnSvcEdgeSet.has(key)) {
        fnSvcEdgeSet.add(key);
        fnSvcEdges.push({ fnId, svcId, active: true });
      }
    });
    // Inactive edges: all other reach pairs in the full dataset
    AI_CASES.forEach((c) => {
      (c.reach ?? []).forEach(({ fnId, svcId }) => {
        const key = `${fnId}::${svcId}`;
        if (!fnSvcEdgeSet.has(key)) {
          fnSvcEdgeSet.add(key);
          fnSvcEdges.push({ fnId, svcId, active: false });
        }
      });
    });
  } else {
    // Not tracing: draw all reach pairs from visible cases
    filteredCases.forEach((c) => {
      (c.reach ?? []).forEach(({ fnId, svcId }) => {
        const key = `${fnId}::${svcId}`;
        if (!fnSvcEdgeSet.has(key)) {
          fnSvcEdgeSet.add(key);
          fnSvcEdges.push({ fnId, svcId, active: true });
        }
      });
    });
  }

  fnSvcEdges.forEach(({ fnId, svcId, active }) => {
    const fnPos = fnPositions[fnId];
    const svcPos = svcPositions[svcId];
    if (!fnPos || !svcPos) return;
    const x1 = colLayout.fnRight;
    const y1 = fnPos.top + fnPos.height / 2;
    const x2 = colLayout.svcLeft;
    const y2 = svcPos.top + svcPos.height / 2;
    const cx = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    fnSvcPaths.push({ path, fnId, svcId, active });
  });

  const chips = selectedCase ? buildValueChips(selectedCase.id) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* ARIA live region */}
      <div role="status" aria-live="assertive" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div
        role="search"
        aria-label="Filter AI cases"
        className="rounded-2xl px-4 py-3 flex flex-col gap-3"
        style={{ background: '#FFFFFF', boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}
      >
        {/* Row 1: Search + Reset */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={13} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#747683' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases or techniques…"
              aria-label="Search AI cases by name or technique"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-kpmg-outline transition-all"
              style={{ background: '#F0EDEC', color: '#1C1B1B', fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.01em' }}
            />
          </div>
          {(selectedCase || activeFunction || searchQuery || scaleFilter) && (
            <button
              onClick={reset}
              aria-label="Reset all filters and selection"
              className="flex-shrink-0 flex items-center gap-1.5 transition-colors"
              style={{ fontSize: '11px', color: '#747683', fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              <RotateCcw size={11} aria-hidden="true" />
              Reset
            </button>
          )}
        </div>

        {/* Row 2: Function filter chips */}
        <div role="group" aria-label="Filter by function" className="flex items-center gap-1.5 flex-wrap">
          <span
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', flexShrink: 0 }}
            aria-hidden="true"
          >
            Function
          </span>
          {FUNCTIONS.map((fn) => (
            <button
              key={`filter-fn-${fn.id}`}
              onClick={() => setActiveFunction(activeFunction === fn.id ? null : fn.id)}
              aria-pressed={activeFunction === fn.id}
              aria-label={`Filter by ${fn.name} function${activeFunction === fn.id ? ' (active)' : ''}`}
              className={`kpmg-filter-chip ${activeFunction === fn.id ? 'active' : ''}`}
              style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
            >
              {fn.name}
            </button>
          ))}
          {/* Maturity filter inline */}
          <span
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', flexShrink: 0, marginLeft: '4px' }}
            aria-hidden="true"
          >
            Maturity
          </span>
          <button
            onClick={() => setScaleFilter(!scaleFilter)}
            aria-pressed={scaleFilter}
            aria-label={`Show only cases at SCALE maturity${scaleFilter ? ' (active)' : ''}`}
            className={`kpmg-filter-chip flex items-center gap-1 ${scaleFilter ? 'active' : ''}`}
            style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
          >
            <TrendingUp size={10} aria-hidden="true" />
            SCALE
          </button>
        </div>
      </div>

      {/* ── Trace hint ─────────────────────────────────────────────────────── */}
      {!isTracing && (
        <div className="flex items-start gap-2 px-1" aria-live="polite" aria-atomic="true">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#00B8A9' }} aria-hidden="true" />
          <p style={{ fontSize: '11px', color: '#747683', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            Select a case to trace its architecture — which functions and services it reaches
          </p>
        </div>
      )}
      {isTracing && selectedCase && (
        <div className="flex items-start gap-2 px-1" aria-live="polite" aria-atomic="true">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 animate-pulse" style={{ backgroundColor: '#00B8A9' }} aria-hidden="true" />
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#00205F', fontFamily: 'var(--font-body)' }} aria-hidden="true">
            Tracing <span style={{ fontWeight: 700 }}>{selectedCase.code}</span> — {activeFunctionIds.size} functions · {activeServiceIds.size} services reached
          </p>
        </div>
      )}

      {/* ── Canvas + Drawer ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-0">

        {/* Canvas */}
        <div
          className="flex-1 min-w-0 rounded-2xl overflow-hidden transition-all duration-300"
          role="region"
          aria-label="Architecture canvas — AI Cases, Business Functions, and Service Solutions"
          style={{ background: '#FCF9F8', boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}
        >
          {/* Column header bar */}
          <div
            className="px-4 py-2.5 flex items-center gap-2 border-b overflow-x-auto"
            style={{ background: '#F0EDEC', borderColor: 'rgba(196,198,212,0.3)' }}
            aria-hidden="true"
          >
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00B8A9' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444652', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                AI Cases ({filteredCases.length})
              </span>
            </div>
            <div className="flex-1 h-px min-w-4" style={{ background: 'rgba(196,198,212,0.4)' }} />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00205F' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444652', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Business Functions
              </span>
            </div>
            <div className="flex-1 h-px min-w-4" style={{ background: 'rgba(196,198,212,0.4)' }} />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4C6D4' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444652', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Service Solutions
              </span>
            </div>
          </div>

          {/* Main canvas area */}
          <div className="p-3 overflow-x-auto">
            <div ref={canvasRef} className="relative flex gap-0" style={{ minHeight: 320, minWidth: 640 }}>
              {/* SVG Bezier connector overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
                style={{ overflow: 'visible', zIndex: 0 }}
              >
                {caseFnPaths.map(({ path, caseId, fnId, active }) => (
                  <path
                    key={`cf-${caseId}-${fnId}`}
                    d={path}
                    fill="none"
                    stroke={active && isTracing ? '#00B8A9' : '#C4C6D4'}
                    strokeWidth={active && isTracing ? 1.5 : 0.75}
                    strokeOpacity={isTracing ? (active ? 0.9 : 0.12) : 0.3}
                    style={{ transition: 'stroke 300ms ease, stroke-opacity 300ms ease, stroke-width 300ms ease' }}
                  />
                ))}
                {fnSvcPaths.map(({ path, fnId, svcId, active }) => (
                  <path
                    key={`fs-${fnId}-${svcId}`}
                    d={path}
                    fill="none"
                    stroke={active && isTracing ? '#006397' : '#C4C6D4'}
                    strokeWidth={active && isTracing ? 1.5 : 0.75}
                    strokeOpacity={isTracing ? (active ? 0.9 : 0.12) : 0.3}
                    style={{ transition: 'stroke 300ms ease, stroke-opacity 300ms ease, stroke-width 300ms ease' }}
                  />
                ))}
              </svg>

              {/* ── Cases column ─────────────────────────────────────────── */}
              <div
                ref={caseColRef}
                className="flex flex-col gap-2.5 rounded-xl px-2.5 py-3"
                style={{ background: '#FFFFFF', position: 'relative', zIndex: 1, boxShadow: '0px 0px 0px 1px rgba(196,198,212,0.2)', width: '34%', minWidth: 160, flexShrink: 0 }}
                role="list"
                aria-label="AI Cases"
              >
                <p
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '2px' }}
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
                        opacity: dimmed ? 0.38 : 1,
                        background: isSelected ? '#FFFFFF' : '#FAFAFA',
                        boxShadow: isSelected
                          ? '0px 0px 0px 1.5px #00B8A9, 0px 8px 24px rgba(0,32,95,0.10)'
                          : '0px 0px 0px 1px rgba(196,198,212,0.35)',
                        borderRadius: '10px',
                        border: 'none',
                        padding: '10px 10px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-accent-faster focus:ring-offset-1"
                    >
                      {/* Case ID row */}
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <span
                          style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', flexShrink: 0, paddingTop: '2px' }}
                        >
                          {c.code}
                        </span>
                        {/* Technique badge — pill, compact */}
                        <span
                          style={{
                            backgroundColor: `${techColor}12`,
                            color: techColor,
                            fontSize: '8px',
                            fontWeight: 600,
                            letterSpacing: '0.01em',
                            fontFamily: 'var(--font-body)',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textAlign: 'center',
                            maxWidth: '90px',
                            lineHeight: '1.35',
                            display: 'inline-block',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            border: `1px solid ${techColor}22`,
                          }}
                          aria-hidden="true"
                        >
                          {c.tech}
                        </span>
                      </div>
                      {/* Case title */}
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#1C1B1B', fontFamily: 'var(--font-display)', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                        {c.title}
                      </p>
                      {isSelected && (
                        <div className="mt-1.5">
                          <span
                            style={{ display: 'inline-block', borderRadius: '4px', padding: '2px 6px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(0,184,169,0.1)', color: '#00B8A9', fontFamily: 'var(--font-body)' }}
                          >
                            ✓ Tracing
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Gap for SVG connectors */}
              <div className="w-8 flex-shrink-0" aria-hidden="true" />

              {/* ── Functions column ─────────────────────────────────────── */}
              <div
                ref={fnColRef}
                className="flex flex-col gap-2.5 rounded-xl px-2.5 py-3"
                style={{ background: '#F6F3F2', position: 'relative', zIndex: 1, width: '28%', minWidth: 140, flexShrink: 0 }}
                role="list"
                aria-label="Functions"
              >
                <p
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '2px' }}
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
                        opacity: isTracing ? (isActive ? 1 : 0.22) : 1,
                        background: isActive && isTracing ? '#FFFFFF' : '#EBE7E7',
                        boxShadow: isActive && isTracing
                          ? `0px 0px 0px 1.5px ${fn.color ?? '#747683'}40, 0px 4px 12px rgba(0,32,95,0.07)`
                          : '0px 0px 0px 1px rgba(196,198,212,0.25)',
                        borderRadius: '10px',
                        padding: '10px 10px',
                        cursor: 'default',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: fn.color ?? '#747683' }}
                          aria-hidden="true"
                        />
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#1C1B1B', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: '1.3' }}>
                          {fn.name}
                        </p>
                      </div>
                      <p style={{ fontSize: '10px', color: '#747683', fontFamily: 'var(--font-body)', fontWeight: 400, paddingLeft: '14px' }}>
                        {caseCount} {caseCount === 1 ? 'case' : 'cases'}
                      </p>
                      {isTracing && isActive && (
                        <span
                          style={{ display: 'inline-block', marginTop: '5px', marginLeft: '14px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#00205F', fontFamily: 'var(--font-body)' }}
                        >
                          ✓ Reached
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gap for SVG connectors */}
              <div className="w-8 flex-shrink-0" aria-hidden="true" />

              {/* ── Services column ──────────────────────────────────────── */}
              <div
                ref={svcColRef}
                className="flex flex-col gap-1.5 rounded-xl px-2.5 py-3"
                style={{ background: '#FFFFFF', position: 'relative', zIndex: 1, boxShadow: '0px 0px 0px 1px rgba(196,198,212,0.2)', flex: 1, minWidth: 140 }}
                role="list"
                aria-label="Services"
              >
                <p
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '2px' }}
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
                        opacity: isTracing ? (isActive ? 1 : 0.15) : 1,
                        background: isActive && isTracing ? '#F0EDEC' : 'transparent',
                        boxShadow: isActive && isTracing ? '0px 1px 4px rgba(0,32,95,0.06)' : 'none',
                        borderRadius: '7px',
                        padding: '5px 8px',
                        cursor: 'default',
                        borderLeft: isActive && isTracing && parentFn ? `2px solid ${parentFn.color ?? '#747683'}` : '2px solid transparent',
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-kpmg-secondary focus:ring-offset-1"
                    >
                      <span
                        style={{ fontSize: '10px', fontWeight: isActive && isTracing ? 500 : 400, color: isActive && isTracing ? '#1C1B1B' : '#747683', fontFamily: 'var(--font-body)', lineHeight: '1.35', display: 'block', wordBreak: 'break-word' }}
                      >
                        {svc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Legend ─────────────────────────────────────────────────────── */}
          <div
            className="px-4 py-3 flex items-start gap-2 flex-wrap border-t"
            style={{ background: '#F6F3F2', borderColor: 'rgba(196,198,212,0.25)' }}
            aria-label="AI Technique legend"
            role="region"
          >
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', flexShrink: 0, paddingTop: '2px' }}>
              AI Technique
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {Object.entries(TECHNIQUE_COLORS).map(([tech, color]) => (
                <div key={`legend-tech-${tech}`} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: '10px', color: '#444652', fontFamily: 'var(--font-body)', fontWeight: 400, lineHeight: '1.3' }}>{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Detail Drawer ───────────────────────────────────────────────── */}
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
              boxShadow: '0px 24px 48px rgba(0,32,95,0.10)',
              background: '#FFFFFF',
              border: '1px solid rgba(196,198,212,0.3)',
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
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)' }}
                >
                  {selectedCase.code}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#1C1B1B', marginTop: '3px', lineHeight: '1.3', letterSpacing: '-0.02em' }}>
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
                <X size={14} style={{ color: '#747683' }} aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status + Technique badges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: STATUS_COLORS[selectedCase.status]?.bg ?? '#F0EDEC',
                      color: STATUS_COLORS[selectedCase.status]?.text ?? '#747683',
                      fontSize: '10px',
                    }}
                    aria-label={`Status: ${selectedCase.status}`}
                  >
                    {selectedCase.status}
                  </span>
                  <span
                    className="kpmg-badge"
                    style={{
                      backgroundColor: `${TECHNIQUE_COLORS[selectedCase.tech] || '#747683'}12`,
                      color: TECHNIQUE_COLORS[selectedCase.tech] || '#747683',
                      border: `1px solid ${TECHNIQUE_COLORS[selectedCase.tech] || '#747683'}22`,
                      fontSize: '10px',
                    }}
                    aria-label={`Technique: ${selectedCase.tech}`}
                  >
                    {selectedCase.tech}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#747683', fontFamily: 'var(--font-body)' }}>{selectedCase.source}</p>
              </div>

              {/* Value Chips */}
              {chips.length > 0 && (
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>
                    Portfolio Value
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, i) => (
                      <div
                        key={`chip-${i}`}
                        className="flex flex-col rounded-xl px-3 py-2"
                        style={{ background: `${chip.color}0D`, border: `1px solid ${chip.color}20`, minWidth: '72px' }}
                      >
                        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: chip.color, fontFamily: 'var(--font-body)' }}>
                          {chip.label}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: chip.color, fontFamily: 'var(--font-display)', marginTop: '2px', letterSpacing: '-0.01em' }}>
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
                style={{ background: 'rgba(0,184,169,0.05)', border: '1px solid rgba(0,184,169,0.18)' }}
              >
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00B8A9', fontFamily: 'var(--font-body)', marginBottom: '6px' }}>
                  Foundation Reach
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1B1B', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  {selectedCase.linkedFunctions.length} functions · {selectedCase.linkedServices.length} services
                </p>
                <p style={{ fontSize: '11px', color: '#747683', fontFamily: 'var(--font-body)', marginTop: '4px', lineHeight: '1.45' }}>
                  One architecture pattern — reused across all highlighted functions
                </p>
              </div>

              {/* Key Value Metrics */}
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>
                  Key Value Metrics
                </p>
                <ul className="space-y-1.5" aria-label="Key value metrics">
                  {selectedCase.metrics.map((m, i) => (
                    <li key={`dm-${selectedCase.id}-${i}`} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#00205F', marginTop: '5px' }} aria-hidden="true" />
                      <span style={{ fontSize: '11px', color: '#444652', fontFamily: 'var(--font-body)', lineHeight: '1.5' }}>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reaches */}
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#747683', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>
                  Reaches
                </p>
                <div className="space-y-2" role="list" aria-label="Reached functions and services">
                  {FUNCTIONS.filter((fn) => selectedCase.linkedFunctions.includes(fn.id)).map((fn) => {
                    // Use reach pairs for accurate fn→svc mapping (handles shared service nodes)
                    const fnSvcIds = (selectedCase.reach ?? [])
                      .filter((r) => r.fnId === fn.id)
                      .map((r) => r.svcId);
                    const fnSvcs = SERVICES.filter((s) => fnSvcIds.includes(s.id));
                    return (
                      <div
                        key={`reach-fn-${fn.id}`}
                        role="listitem"
                        className="p-2.5 rounded-lg"
                        style={{ background: '#F6F3F2', borderLeft: `2px solid ${fn.color ?? '#747683'}` }}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1C1B1B', fontFamily: 'var(--font-body)' }}>
                            {fn.name}
                          </span>
                        </div>
                        {fnSvcs.map((svc) => (
                          <p
                            key={`reach-svc-${svc.id}`}
                            style={{ fontSize: '10px', color: '#747683', fontFamily: 'var(--font-body)', paddingLeft: '4px', lineHeight: '1.5' }}
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
                className="p-3.5 rounded-xl"
                style={{ background: 'rgba(0,32,95,0.04)', border: '1px solid rgba(0,32,95,0.10)' }}
              >
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00205F', fontFamily: 'var(--font-body)', marginBottom: '6px' }}>
                  Partner Insight
                </p>
                <p style={{ fontSize: '11px', color: '#444652', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>
                  {selectedCase.insight}
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-1 space-y-2">
                <Link href="/value-simulator">
                </Link>
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-kpmg-primary focus:ring-offset-1"
                  style={{ background: '#F0EDEC', color: '#00205F', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)' }}
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