'use client';
import React, { useState } from 'react';
import { AI_CASES, FUNCTIONS } from '@/lib/mockData';
import { Search, LayoutGrid, List, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

const TECHNIQUE_OPTIONS = ['LLM', 'NLP', 'ML Classification', 'RAG', 'Generative AI'];
const MATURITY_OPTIONS = ['Experimental', 'Emerging', 'Established', 'Mature'];
const VALUE_BAND_OPTIONS = ['< £500k', '£500k–£1M', '£1M–£2M', '> £2M'];

const TECHNIQUE_COLORS: Record<string, string> = {
  LLM: '#00205F',
  NLP: '#006397',
  'ML Classification': '#0F6E56',
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

const MATURITY_COLORS: Record<string, string> = {
  Experimental: '#F59E0B',
  Emerging: '#3B82F6',
  Established: '#0F6E56',
  Mature: '#00205F',
};

function getValueBand(v: number): string {
  if (v < 500000) return '< £500k';
  if (v < 1000000) return '£500k–£1M';
  if (v < 2000000) return '£1M–£2M';
  return '> £2M';
}

export default function CaseLibraryContent() {
  const [search, setSearch] = useState('');
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<string | null>(null);
  const [activeMaturity, setActiveMaturity] = useState<string | null>(null);
  const [activeValueBand, setActiveValueBand] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = AI_CASES.filter(c => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesFn = !activeFunction || c.linkedFunctions.includes(activeFunction);
    const matchesTech = !activeTechnique || c.aiTechnique === activeTechnique;
    const matchesMaturity = !activeMaturity || c.maturityLevel === activeMaturity;
    const matchesValue = !activeValueBand || getValueBand(c.metrics.annualizedReturn) === activeValueBand;
    return matchesSearch && matchesFn && matchesTech && matchesMaturity && matchesValue;
  });

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="bg-white rounded-xl shadow-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cases, codes, descriptions..."
              className="w-full pl-8 pr-4 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 placeholder:text-kpmg-outline transition-all font-body"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-kpmg-outline font-body">{filtered.length} of {AI_CASES.length} cases</span>
            <div className="flex items-center gap-1 border border-kpmg-outline-variant/40 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-kpmg-primary text-white' : 'text-kpmg-outline hover:bg-kpmg-surface-container'}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-kpmg-primary text-white' : 'text-kpmg-outline hover:bg-kpmg-surface-container'}`}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-kpmg-outline font-body mr-1">Function:</span>
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-kpmg-outline font-body mr-1">Technique:</span>
          {TECHNIQUE_OPTIONS.map(t => (
            <button
              key={`lib-tech-${t}`}
              onClick={() => setActiveTechnique(activeTechnique === t ? null : t)}
              className={`kpmg-filter-chip ${activeTechnique === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
          <span className="text-xs font-semibold text-kpmg-outline font-body ml-2 mr-1">Maturity:</span>
          {MATURITY_OPTIONS.map(m => (
            <button
              key={`lib-mat-${m}`}
              onClick={() => setActiveMaturity(activeMaturity === m ? null : m)}
              className={`kpmg-filter-chip ${activeMaturity === m ? 'active' : ''}`}
            >
              {m}
            </button>
          ))}
          <span className="text-xs font-semibold text-kpmg-outline font-body ml-2 mr-1">Value:</span>
          {VALUE_BAND_OPTIONS.map(v => (
            <button
              key={`lib-val-${v}`}
              onClick={() => setActiveValueBand(activeValueBand === v ? null : v)}
              className={`kpmg-filter-chip ${activeValueBand === v ? 'active' : ''}`}
            >
              {v}
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
          <h3 className="font-display text-base font-700 text-kpmg-on-surface mb-2">No cases match your filters</h3>
          <p className="text-sm text-kpmg-outline font-body max-w-sm">
            Try adjusting your search query or removing one of the active filters to broaden the results.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveFunction(null); setActiveTechnique(null); setActiveMaturity(null); setActiveValueBand(null); }}
            className="kpmg-btn-secondary mt-4 text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
            const techColor = TECHNIQUE_COLORS[c.aiTechnique] || '#747683';
            const maturityColor = MATURITY_COLORS[c.maturityLevel] || '#747683';
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
                      className="kpmg-badge flex-shrink-0"
                      style={{ backgroundColor: `${techColor}15`, color: techColor }}
                    >
                      {c.aiTechnique}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-700 text-kpmg-on-surface leading-snug mb-1">{c.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fn?.color || '#747683' }}
                    />
                    <span className="text-xs text-kpmg-outline font-body">{fn?.name}</span>
                    <span className="text-xs text-kpmg-outline-variant font-body">·</span>
                    <span className="text-xs font-medium font-body" style={{ color: maturityColor }}>
                      {c.maturityLevel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-3 flex-1">
                  <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
                </div>

                {/* Metrics row */}
                <div className="px-5 py-3 border-t border-kpmg-outline-variant/20 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-kpmg-outline font-body mb-0.5">Annual Value</p>
                    <p className="font-display text-sm font-700 text-kpmg-primary tabular-nums">
                      £{(c.metrics.annualizedReturn / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-kpmg-outline font-body mb-0.5">Adoption</p>
                    <p className="font-display text-sm font-700 text-kpmg-on-surface tabular-nums">{c.metrics.adoptionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-kpmg-outline font-body mb-0.5">Reusability</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-kpmg-accent-deeper fill-kpmg-accent-deeper" />
                      <p className="font-display text-sm font-700 text-kpmg-on-surface tabular-nums">{c.reusabilityScore}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-kpmg-outline-variant/20 flex items-center gap-2">
                  <Link href="/case-detail" className="flex-1">
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
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Function</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Technique</span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Status</span>
                </th>
                <th className="text-right px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Annual Value</span>
                </th>
                <th className="text-right px-4 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Adoption</span>
                </th>
                <th className="text-right px-5 py-3">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
                const techColor = TECHNIQUE_COLORS[c.aiTechnique] || '#747683';
                const fn = FUNCTIONS.find(f => f.id === c.originatingFunction);
                return (
                  <tr
                    key={`list-row-${c.id}`}
                    className={`border-b border-kpmg-outline-variant/20 hover:bg-kpmg-surface-container-low transition-colors ${idx % 2 === 0 ? '' : 'bg-kpmg-surface-container-low/30'}`}
                  >
                    <td className="px-5 py-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                        </div>
                        <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fn?.color }} />
                        <span className="text-sm text-kpmg-on-surface-variant font-body">{fn?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="kpmg-badge text-xs" style={{ backgroundColor: `${techColor}15`, color: techColor }}>
                        {c.aiTechnique}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="kpmg-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-display text-sm font-700 text-kpmg-primary tabular-nums">
                        £{(c.metrics.annualizedReturn / 1000).toFixed(0)}k
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-display text-sm font-700 text-kpmg-on-surface tabular-nums">{c.metrics.adoptionRate}%</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href="/case-detail">
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