'use client';
import React, { useState } from 'react';
import { AI_CASES, FUNCTIONS } from '@/lib/mockData';
import { Search, LayoutGrid, List, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

export default function CaseLibraryContent() {
  const [search, setSearch] = useState('');
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = AI_CASES.filter(c => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.source.toLowerCase().includes(search.toLowerCase());
    const matchesFn = !activeFunction || c.linkedFunctions.includes(activeFunction);
    return matchesSearch && matchesFn;
  });

  return (
    <div className="space-y-5">
      {/* Search + filters — Pure Paper card */}
      <div
        className="bg-white rounded-2xl p-4 space-y-3"
        style={{ boxShadow: '0px 1px 3px rgba(0,32,95,0.04), 0px 0px 0px 1px rgba(196,198,212,0.25)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cases, codes, sources..."
              className="w-full pl-8 pr-4 py-2 text-sm bg-kpmg-surface-container rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 placeholder:text-kpmg-outline transition-all font-body"
              style={{ borderBottom: '1.5px solid #C4C6D4' }}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-kpmg-outline font-body">{filtered.length} of {AI_CASES.length} cases</span>
            <div className="flex items-center gap-1 rounded-xl p-0.5" style={{ border: '1px solid rgba(196,198,212,0.4)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-navy-gradient text-white' : 'text-kpmg-outline hover:bg-kpmg-surface-container'}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-navy-gradient text-white' : 'text-kpmg-outline hover:bg-kpmg-surface-container'}`}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Function filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-kpmg-outline mr-1" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Function:</span>
          {FUNCTIONS.map(fn => (
            <button
              key={`lib-fn-${fn.id}`}
              onClick={() => setActiveFunction(activeFunction === fn.id ? null : fn.id)}
              className={`kpmg-filter-chip ${activeFunction === fn.id ? 'active' : ''}`}
            >
              {fn.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-kpmg-surface-container flex items-center justify-center mb-4">
            <Search size={20} className="text-kpmg-outline" />
          </div>
          <h3 className="font-display text-base font-bold text-kpmg-on-surface mb-2">No cases match your filters</h3>
          <p className="text-sm text-kpmg-outline font-body max-w-sm">
            Try adjusting your search query or removing one of the active filters to broaden the results.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveFunction(null); }}
            className="kpmg-btn-secondary mt-4 text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
            const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';
            const fn = FUNCTIONS.find(f => f.id === c.originatingFunction);

            return (
              <div
                key={`case-card-${c.id}`}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col group"
              >
                {/* Card header */}
                <div className="p-5 pb-3 border-b border-kpmg-outline-variant/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                      <span
                        className="kpmg-badge"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {c.status}
                      </span>
                    </div>
                    <span
                      className="kpmg-badge flex-shrink-0 text-xs"
                      style={{ backgroundColor: `${techColor}15`, color: techColor }}
                    >
                      {c.tech}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-kpmg-on-surface leading-snug mb-1">{c.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fn?.color || '#747683' }}
                    />
                    <span className="text-xs text-kpmg-outline font-body">{c.source}</span>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="px-5 py-3 flex-1">
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>Key Metrics</p>
                  <ul className="space-y-1">
                    {c.metrics.map((m, i) => (
                      <li key={`metric-${c.id}-${i}`} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-kpmg-primary mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-kpmg-on-surface-variant font-body">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-kpmg-outline-variant/20 flex items-center gap-2">
                  <Link href={`/cases/${c.id}`} className="flex-1">
                    <span className="kpmg-btn-primary w-full justify-center text-xs cursor-pointer">
                      Open Profile
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                  <Link href="/scenario-comparison">
                    <span className="kpmg-btn-secondary text-xs cursor-pointer">Compare</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kpmg-outline-variant/30">
                <th className="text-left px-5 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Case</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Source</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Technique</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Status</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Key Metrics</span>
                </th>
                <th className="text-right px-5 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
                const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';
                const fn = FUNCTIONS.find(f => f.id === c.originatingFunction);
                return (
                  <tr
                    key={`list-row-${c.id}`}
                    className={`border-b border-kpmg-outline-variant/20 hover:bg-kpmg-surface-container-low transition-colors ${idx % 2 === 0 ? '' : 'bg-kpmg-surface-container-low/30'}`}
                  >
                    <td className="px-5 py-3">
                      <div>
                        <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                        <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fn?.color }} />
                        <span className="text-sm text-kpmg-on-surface-variant font-body">{c.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="kpmg-badge text-xs" style={{ backgroundColor: `${techColor}15`, color: techColor }}>
                        {c.tech}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="kpmg-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5">
                        {c.metrics.slice(0, 2).map((m, i) => (
                          <li key={`lm-${c.id}-${i}`} className="text-xs text-kpmg-on-surface-variant font-body">• {m}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/cases/${c.id}`}>
                        <span className="kpmg-btn-secondary text-xs cursor-pointer">Open</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}