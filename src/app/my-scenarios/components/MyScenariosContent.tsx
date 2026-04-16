'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookMarked,
  Search,
  Trash2,
  Download,
  RotateCcw,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Plus,
  ChevronRight,
  FileText,
  BarChart3,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { downloadFile, buildCSV } from '@/lib/exportUtils';
import { type SimInputs, type SimOutputs } from '@/lib/simulator/calcOutputs';

interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  inputs: SimInputs;
  outputs: {
    current: SimOutputs;
    scale2x: SimOutputs;
    fullAdoption: SimOutputs;
  };
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest-return', label: 'Highest return' },
  { value: 'most-users', label: 'Most users' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${Math.round(val).toLocaleString()}`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ScenarioCard({
  scenario,
  onDelete,
  onExportCSV,
  onRename,
}: {
  scenario: SavedScenario;
  onDelete: (id: string) => void;
  onExportCSV: (scenario: SavedScenario) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(scenario.name);
  const cur = scenario.outputs.current;

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== scenario.name) {
      onRename(scenario.id, trimmed);
    } else {
      setDraftName(scenario.name);
    }
    setEditing(false);
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-kpmg-outline-variant dark:border-gray-800 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      style={{ borderColor: 'rgba(196,198,212,0.4)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setDraftName(scenario.name); setEditing(false); }
              }}
              className="w-full text-sm font-semibold font-body text-kpmg-on-surface dark:text-gray-100 bg-kpmg-surface-container dark:bg-gray-800 border border-kpmg-primary rounded-lg px-2 py-1 outline-none"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-semibold font-body text-kpmg-on-surface dark:text-gray-100 text-left hover:text-kpmg-primary dark:hover:text-blue-400 transition-colors truncate block w-full"
              title="Click to rename"
            >
              {scenario.name}
            </button>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className="text-kpmg-outline dark:text-gray-500 flex-shrink-0" />
            <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body" title={formatFullDate(scenario.timestamp)}>
              {formatRelativeTime(scenario.timestamp)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(scenario.id)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-kpmg-outline dark:text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Delete scenario"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5 bg-kpmg-surface-container dark:bg-gray-800 rounded-xl px-3 py-2.5">
          <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body leading-tight">Annual Return</span>
          <span className="text-sm font-bold font-display text-kpmg-primary dark:text-blue-400 tabular-nums">
            {formatCurrency(cur.annualizedReturn)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 bg-kpmg-surface-container dark:bg-gray-800 rounded-xl px-3 py-2.5">
          <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body leading-tight">Active Users</span>
          <span className="text-sm font-bold font-display text-kpmg-on-surface dark:text-gray-100 tabular-nums">
            {cur.activeUsers.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 bg-kpmg-surface-container dark:bg-gray-800 rounded-xl px-3 py-2.5">
          <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body leading-tight">FTEs Freed</span>
          <span className="text-sm font-bold font-display text-kpmg-on-surface dark:text-gray-100 tabular-nums">
            {cur.ftesFreed.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Input summary */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: `${scenario.inputs.targetUseCaseCount} use cases`, color: '#00B8A9' },
          { label: `${scenario.inputs.adoptionRate}% adoption`, color: '#006397' },
          { label: `${scenario.inputs.targetUserCount.toLocaleString()} users`, color: '#00205F' },
        ].map(tag => (
          <span
            key={tag.label}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium"
            style={{ backgroundColor: `${tag.color}14`, color: tag.color }}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t dark:border-gray-800" style={{ borderColor: 'rgba(196,198,212,0.3)' }}>
        <Link
          href={`/value-simulator?scenario=${scenario.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-body text-kpmg-primary dark:text-blue-400 bg-kpmg-primary/8 hover:bg-kpmg-primary/14 transition-colors"
        >
          <RotateCcw size={12} />
          Reload
        </Link>
        <button
          onClick={() => onExportCSV(scenario)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-body text-kpmg-outline dark:text-gray-400 bg-kpmg-surface-container dark:bg-gray-800 hover:bg-kpmg-surface-container-high dark:hover:bg-gray-700 transition-colors"
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default function MyScenariosContent() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadScenarios();
  }, []);

  function loadScenarios() {
    try {
      const raw = localStorage.getItem('savedScenarios');
      if (!raw) { setScenarios([]); return; }
      const parsed: unknown[] = JSON.parse(raw);
      // Migrate legacy entries (no id/name) and ensure structure
      const migrated: SavedScenario[] = parsed.map((item: unknown, idx: number) => {
        const s = item as Record<string, unknown>;
        return {
          id: (s.id as string) || `scenario-${Date.now()}-${idx}`,
          name: (s.name as string) || `Scenario ${new Date(s.timestamp as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          timestamp: s.timestamp as string,
          inputs: s.inputs as SimInputs,
          outputs: s.outputs as SavedScenario['outputs'],
        };
      });
      setScenarios(migrated);
      // Write back migrated data
      localStorage.setItem('savedScenarios', JSON.stringify(migrated));
    } catch {
      setScenarios([]);
    }
  }

  const handleDelete = useCallback((id: string) => {
    setScenarios(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('savedScenarios', JSON.stringify(updated));
      toast.success('Scenario deleted');
      return updated;
    });
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    setScenarios(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, name } : s);
      localStorage.setItem('savedScenarios', JSON.stringify(updated));
      toast.success('Scenario renamed');
      return updated;
    });
  }, []);

  const handleExportCSV = useCallback((scenario: SavedScenario) => {
    const { current: cur, scale2x: s2x, fullAdoption: full } = scenario.outputs;
    const rows: (string | number)[][] = [
      ['KPMG AI Value Simulator — Scenario Export'],
      ['Scenario Name', scenario.name],
      ['Saved', new Date(scenario.timestamp).toLocaleString()],
      [],
      ['--- INPUTS ---'],
      ['Parameter', 'Value'],
      ['Target Use Case Count', scenario.inputs.targetUseCaseCount],
      ['Use Case Activation Rate (%)', scenario.inputs.activationRate],
      ['Target User Count', scenario.inputs.targetUserCount],
      ['User Adoption Rate (%)', scenario.inputs.adoptionRate],
      ['Tasks / User / Use Case / Month', scenario.inputs.tasksPerUserPerUseCasePerMonth],
      ['Avg Time Saved / Task (min)', scenario.inputs.avgTimeSavedMinutes],
      [],
      ['--- OUTPUTS ---'],
      ['Metric', 'Current State', '2× Scale-Up', 'Full Adoption'],
      ['Active Use Cases', cur.activeUseCases, s2x.activeUseCases, full.activeUseCases],
      ['Active Users', cur.activeUsers, s2x.activeUsers, full.activeUsers],
      ['Tasks / Month', cur.tasksPerMonth, s2x.tasksPerMonth, full.tasksPerMonth],
      ['Hours Recovered / Month', Math.round(cur.hoursPerMonth), Math.round(s2x.hoursPerMonth), Math.round(full.hoursPerMonth)],
      ['Monthly Cost Savings (USD)', Math.round(cur.monthlyCostSavings), Math.round(s2x.monthlyCostSavings), Math.round(full.monthlyCostSavings)],
      ['Annualised Return (USD)', Math.round(cur.annualizedReturn), Math.round(s2x.annualizedReturn), Math.round(full.annualizedReturn)],
      ['FTEs Freed / Month', cur.ftesFreed.toFixed(1), s2x.ftesFreed.toFixed(1), full.ftesFreed.toFixed(1)],
      ['Programme Penetration (%)', Math.round(cur.penetration), Math.round(s2x.penetration), Math.round(full.penetration)],
    ];
    const csv = buildCSV(rows);
    const safeName = scenario.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    downloadFile(csv, `kpmg-scenario-${safeName}.csv`, 'text/csv;charset=utf-8;');
    toast.success('CSV exported', { description: scenario.name });
  }, []);

  function handleExportAllCSV() {
    if (scenarios.length === 0) return;
    const rows: (string | number)[][] = [
      ['KPMG AI Value Simulator — All Scenarios Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Scenario Name', 'Saved At', 'Use Cases', 'Adoption %', 'Users', 'Active Users', 'Annual Return (USD)', 'FTEs Freed', 'Penetration %'],
      ...scenarios.map(s => [
        s.name,
        new Date(s.timestamp).toLocaleString(),
        s.inputs.targetUseCaseCount,
        s.inputs.adoptionRate,
        s.inputs.targetUserCount,
        s.outputs.current.activeUsers,
        Math.round(s.outputs.current.annualizedReturn),
        s.outputs.current.ftesFreed.toFixed(1),
        Math.round(s.outputs.current.penetration),
      ]),
    ];
    const csv = buildCSV(rows);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `kpmg-all-scenarios-${dateStr}.csv`, 'text/csv;charset=utf-8;');
    toast.success('All scenarios exported');
  }

  function handleClearAll() {
    if (!confirm('Delete all saved scenarios? This cannot be undone.')) return;
    localStorage.removeItem('savedScenarios');
    setScenarios([]);
    toast.success('All scenarios cleared');
  }

  // Filter + sort
  const filtered = scenarios
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sort === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sort === 'highest-return') return b.outputs.current.annualizedReturn - a.outputs.current.annualizedReturn;
      if (sort === 'most-users') return b.outputs.current.activeUsers - a.outputs.current.activeUsers;
      return 0;
    });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,32,95,0.10) 0%, rgba(0,99,151,0.12) 100%)' }}>
              <BookMarked size={16} className="text-kpmg-primary dark:text-blue-400" />
            </div>
            <h1 className="font-display text-xl font-bold text-kpmg-on-surface dark:text-gray-100">My Scenarios</h1>
          </div>
          <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 font-body">
            Saved Value Simulator states — reload, rename, or export any scenario.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {scenarios.length > 0 && (
            <>
              <button
                onClick={handleExportAllCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-body text-kpmg-outline dark:text-gray-400 bg-white dark:bg-gray-900 border border-kpmg-outline-variant dark:border-gray-700 hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors"
                style={{ borderColor: 'rgba(196,198,212,0.5)' }}
              >
                <Download size={13} />
                Export All
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-body text-red-500 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={13} />
                Clear All
              </button>
            </>
          )}
          <Link
            href="/value-simulator"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-body text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #00205F 0%, #006397 100%)' }}
          >
            <Plus size={13} />
            New Scenario
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: <BookMarked size={14} className="text-kpmg-primary dark:text-blue-400" />,
              label: 'Saved',
              value: scenarios.length,
              suffix: scenarios.length === 1 ? 'scenario' : 'scenarios',
            },
            {
              icon: <TrendingUp size={14} style={{ color: '#00B8A9' }} />,
              label: 'Best Return',
              value: formatCurrency(Math.max(...scenarios.map(s => s.outputs.current.annualizedReturn))),
              suffix: 'annualised',
            },
            {
              icon: <Users size={14} style={{ color: '#006397' }} />,
              label: 'Max Users',
              value: Math.max(...scenarios.map(s => s.outputs.current.activeUsers)).toLocaleString(),
              suffix: 'active users',
            },
            {
              icon: <DollarSign size={14} style={{ color: '#0F6E56' }} />,
              label: 'Avg Return',
              value: formatCurrency(scenarios.reduce((acc, s) => acc + s.outputs.current.annualizedReturn, 0) / scenarios.length),
              suffix: 'per scenario',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border px-4 py-3 flex flex-col gap-1"
              style={{ borderColor: 'rgba(196,198,212,0.4)' }}
            >
              <div className="flex items-center gap-1.5">
                {stat.icon}
                <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body">{stat.label}</span>
              </div>
              <span className="font-display text-lg font-bold text-kpmg-on-surface dark:text-gray-100 tabular-nums leading-tight">{stat.value}</span>
              <span className="text-xs text-kpmg-on-surface-variant dark:text-gray-500 font-body">{stat.suffix}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      {scenarios.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search scenarios…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm font-body bg-white dark:bg-gray-900 border rounded-xl text-kpmg-on-surface dark:text-gray-100 placeholder-kpmg-outline dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-kpmg-primary/30 transition-shadow"
              style={{ borderColor: 'rgba(196,198,212,0.5)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline dark:text-gray-500 pointer-events-none" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="pl-8 pr-8 py-2.5 text-sm font-body bg-white dark:bg-gray-900 border rounded-xl text-kpmg-on-surface dark:text-gray-100 outline-none focus:ring-2 focus:ring-kpmg-primary/30 appearance-none cursor-pointer transition-shadow"
              style={{ borderColor: 'rgba(196,198,212,0.5)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {scenarios.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,32,95,0.07) 0%, rgba(0,99,151,0.09) 100%)' }}
          >
            <BookMarked size={28} className="text-kpmg-primary dark:text-blue-400 opacity-60" />
          </div>
          <div className="text-center max-w-xs">
            <p className="font-display text-base font-semibold text-kpmg-on-surface dark:text-gray-100 mb-1">No saved scenarios yet</p>
            <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 font-body">
              Open the Value Simulator, configure your inputs, and click <strong>Save</strong> to store a scenario here.
            </p>
          </div>
          <Link
            href="/value-simulator"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #00205F 0%, #006397 100%)' }}
          >
            <BarChart3 size={15} />
            Open Value Simulator
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        /* No search results */
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search size={24} className="text-kpmg-outline dark:text-gray-500 opacity-50" />
          <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 font-body">
            No scenarios match <strong>"{search}"</strong>
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-xs font-semibold font-body text-kpmg-primary dark:text-blue-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Result count */}
          <p className="text-xs text-kpmg-outline dark:text-gray-500 font-body -mt-2">
            {filtered.length} {filtered.length === 1 ? 'scenario' : 'scenarios'}
            {search ? ` matching "${search}"` : ''}
          </p>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onDelete={handleDelete}
                onExportCSV={handleExportCSV}
                onRename={handleRename}
              />
            ))}
          </div>
        </>
      )}

      {/* Quick links footer */}
      <div
        className="flex flex-wrap items-center gap-3 pt-4 border-t"
        style={{ borderColor: 'rgba(196,198,212,0.3)' }}
      >
        <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body">Quick links:</span>
        {[
          { href: '/value-simulator', label: 'Value Simulator', icon: <BarChart3 size={11} /> },
          { href: '/scenario-comparison', label: 'Scenario Comparison', icon: <FileText size={11} /> },
          { href: '/reports', label: 'Report Builder', icon: <FileText size={11} /> },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1 text-xs font-semibold font-body text-kpmg-primary dark:text-blue-400 hover:underline"
          >
            {link.icon}
            {link.label}
            <ChevronRight size={10} />
          </Link>
        ))}
      </div>
    </div>
  );
}
