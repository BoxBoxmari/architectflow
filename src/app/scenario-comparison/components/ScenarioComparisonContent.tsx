'use client';
import React, { useState } from 'react';
import { calcScenarioVariants, SIM_DEFAULTS, type SimOutputs } from '@/lib/simulator/calcOutputs';
import { TrendingUp, TrendingDown, Minus, ChevronRight, FileText, Rocket, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { downloadFile, buildCSV } from '@/lib/exportUtils';

const SCENARIO_COLORS = ['#747683', '#00B8A9', '#0F6E56'];
const SCENARIO_BG = ['#F6F3F2', 'rgba(0,184,169,0.06)', 'rgba(15,110,86,0.06)'];
const SCENARIO_BORDER = ['#C4C6D4', '#00B8A9', '#0F6E56'];

const SCENARIOS = [
  { id: 'current', label: 'Current State',  tag: 'Baseline',    badge: null },
  { id: 'scale2x', label: '2X Scale-Up',    tag: 'Recommended', badge: 'Preferred' },
  { id: 'full',    label: 'Full Adoption',  tag: 'Optimised',   badge: 'High effort' },
] as const;

function DeltaBadge({ value, baseline }: { value: number; baseline: number }) {
  if (baseline === 0) return null;
  const delta = ((value - baseline) / baseline) * 100;
  if (Math.abs(delta) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-kpmg-surface-container text-kpmg-outline text-xs font-semibold font-body">
        <Minus size={10} />
        Baseline
      </span>
    );
  }
  const isPositive = delta > 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold font-body"
      style={{
        backgroundColor: isPositive ? 'rgba(15,110,86,0.1)' : 'rgba(200,75,90,0.1)',
        color: isPositive ? '#0F6E56' : '#C84B5A',
      }}
    >
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPositive ? '+' : ''}{delta.toFixed(0)}%
    </span>
  );
}

export default function ScenarioComparisonContent() {
  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  // Use default inputs to compute all three canonical scenarios
  const variants = calcScenarioVariants(SIM_DEFAULTS);
  const allOutputs: SimOutputs[] = [
    variants.currentState.outputs,
    variants.scale2x.outputs,
    variants.fullAdoption.outputs,
  ];
  const baselineOutputs = allOutputs[0];

  function handleExport() {
    const [cur, s2x, full] = allOutputs;
    const dateStr = new Date().toISOString().slice(0, 10);
    const rows: (string | number)[][] = [
      ['KPMG AI Scenario Comparison — Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Metric', 'Current State', '2× Scale-Up', 'Full Adoption'],
      ['Annualised Return (USD)', Math.round(cur.annualizedReturn), Math.round(s2x.annualizedReturn), Math.round(full.annualizedReturn)],
      ['Monthly Cost Savings (USD)', Math.round(cur.monthlyCostSavings), Math.round(s2x.monthlyCostSavings), Math.round(full.monthlyCostSavings)],
      ['Hours Recovered / Month', Math.round(cur.hoursPerMonth), Math.round(s2x.hoursPerMonth), Math.round(full.hoursPerMonth)],
      ['FTEs Freed / Month', cur.ftesFreed.toFixed(1), s2x.ftesFreed.toFixed(1), full.ftesFreed.toFixed(1)],
      ['AI-Assisted Tasks / Month', Math.round(cur.tasksPerMonth), Math.round(s2x.tasksPerMonth), Math.round(full.tasksPerMonth)],
      ['Active Users', cur.activeUsers, s2x.activeUsers, full.activeUsers],
      ['Active Use Cases', cur.activeUseCases, s2x.activeUseCases, full.activeUseCases],
      ['Programme Penetration (%)', Math.round(cur.penetration), Math.round(s2x.penetration), Math.round(full.penetration)],
      ['Value / User / Month (USD)', Math.round(cur.valuePerUserPerMonth), Math.round(s2x.valuePerUserPerMonth), Math.round(full.valuePerUserPerMonth)],
      ['Daily AI Interactions', Math.round(cur.dailyInteractions), Math.round(s2x.dailyInteractions), Math.round(full.dailyInteractions)],
      [],
      ['--- ASSUMPTIONS ---'],
      ['Input', 'Current State', '2× Scale-Up', 'Full Adoption'],
      ['Target Use Cases', SIM_DEFAULTS.targetUseCaseCount, Math.min(variants.currentState.activeUseCases * 2, 120), SIM_DEFAULTS.targetUseCaseCount],
      ['Activation Rate (%)', SIM_DEFAULTS.activationRate, 100, 100],
      ['Target Users', SIM_DEFAULTS.targetUserCount, Math.min(variants.currentState.activeUsers * 2, 1800), SIM_DEFAULTS.targetUserCount],
      ['Adoption Rate (%)', SIM_DEFAULTS.adoptionRate, 100, 100],
      ['Tasks / User / Use Case / Month', SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth, SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth, SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth],
      ['Avg Time Saved / Task (min)', SIM_DEFAULTS.avgTimeSavedMinutes, SIM_DEFAULTS.avgTimeSavedMinutes, SIM_DEFAULTS.avgTimeSavedMinutes],
    ];
    downloadFile(buildCSV(rows), `kpmg-scenario-comparison-${dateStr}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Comparison exported', { description: 'CSV downloaded with all three scenario variants' });
  }

  const METRICS = [
    {
      id: 'metric-annual',
      label: 'Annualised Return',
      icon: <TrendingUp size={14} />,
      format: (v: number) => `$${(v / 1000000).toFixed(2)}M`,
      getValue: (o: SimOutputs) => o.annualizedReturn,
      highlight: true,
    },
    {
      id: 'metric-monthly',
      label: 'Monthly Cost Savings',
      icon: <TrendingUp size={14} />,
      format: (v: number) => `$${Math.round(v).toLocaleString()}`,
      getValue: (o: SimOutputs) => o.monthlyCostSavings,
      highlight: false,
    },
    {
      id: 'metric-hours',
      label: 'Hours Recovered / Month',
      icon: <Info size={14} />,
      format: (v: number) => `${Math.round(v).toLocaleString()} hrs`,
      getValue: (o: SimOutputs) => o.hoursPerMonth,
      highlight: false,
    },
    {
      id: 'metric-ftes',
      label: 'FTEs Freed / Month',
      icon: <Info size={14} />,
      format: (v: number) => `${v.toFixed(1)}`,
      getValue: (o: SimOutputs) => o.ftesFreed,
      highlight: false,
    },
    {
      id: 'metric-tasks',
      label: 'AI-Assisted Tasks / Month',
      icon: <Info size={14} />,
      format: (v: number) => `${Math.round(v).toLocaleString()}`,
      getValue: (o: SimOutputs) => o.tasksPerMonth,
      highlight: false,
    },
    {
      id: 'metric-users',
      label: 'Active Users',
      icon: <Info size={14} />,
      format: (v: number) => `${Math.round(v).toLocaleString()}`,
      getValue: (o: SimOutputs) => o.activeUsers,
      highlight: false,
    },
    {
      id: 'metric-penetration',
      label: 'Programme Penetration',
      icon: <Info size={14} />,
      format: (v: number) => `${Math.round(v)}%`,
      getValue: (o: SimOutputs) => o.penetration,
      highlight: false,
    },
    {
      id: 'metric-value-user',
      label: 'Value / User / Month',
      icon: <Info size={14} />,
      format: (v: number) => `$${Math.round(v)}`,
      getValue: (o: SimOutputs) => o.valuePerUserPerMonth,
      highlight: false,
    },
    {
      id: 'metric-daily',
      label: 'Daily AI Interactions',
      icon: <Info size={14} />,
      format: (v: number) => `${Math.round(v).toLocaleString()}/day`,
      getValue: (o: SimOutputs) => o.dailyInteractions,
      highlight: false,
    },
  ];

  const ASSUMPTION_ROWS = [
    {
      id: 'assump-cases',
      label: 'Target Use Cases',
      values: [
        `${SIM_DEFAULTS.targetUseCaseCount}`,
        `${Math.min(variants.currentState.activeUseCases * 2, 120)}`,
        `${SIM_DEFAULTS.targetUseCaseCount}`,
      ],
    },
    {
      id: 'assump-activation',
      label: 'Activation Rate',
      values: [`${SIM_DEFAULTS.activationRate}%`, '100%', '100%'],
    },
    {
      id: 'assump-users',
      label: 'Target Users',
      values: [
        `${SIM_DEFAULTS.targetUserCount}`,
        `${Math.min(variants.currentState.activeUsers * 2, 1800)}`,
        `${SIM_DEFAULTS.targetUserCount}`,
      ],
    },
    {
      id: 'assump-adoption',
      label: 'Adoption Rate',
      values: [`${SIM_DEFAULTS.adoptionRate}%`, '100%', '100%'],
    },
    {
      id: 'assump-tasks',
      label: 'Tasks / User / Use Case / Month',
      values: Array(3).fill(`${SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth}`),
    },
    {
      id: 'assump-time',
      label: 'Avg Time Saved / Task',
      values: Array(3).fill(`${SIM_DEFAULTS.avgTimeSavedMinutes} min`),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scenario header cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((s, idx) => {
          const o = allOutputs[idx];
          const color = SCENARIO_COLORS[idx];
          const bg = SCENARIO_BG[idx];
          const border = SCENARIO_BORDER[idx];
          const variant = idx === 0 ? variants.currentState : idx === 1 ? variants.scale2x : variants.fullAdoption;
          return (
            <div
              key={`scen-card-${s.id}`}
              className="rounded-xl p-5 border-2 transition-all duration-150"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-widest font-body"
                    style={{ fontSize: '10px', color }}
                  >
                    {s.tag}
                  </span>
                  <h3 className="font-display text-base font-bold text-kpmg-on-surface mt-0.5">{s.label}</h3>
                </div>
                {s.badge === 'Preferred' && (
                  <span className="kpmg-badge bg-kpmg-accent-faster/15 text-kpmg-accent-faster text-xs">Preferred</span>
                )}
                {s.badge === 'High effort' && (
                  <span className="kpmg-badge bg-kpmg-accent-deeper/15 text-kpmg-accent-deeper text-xs">High effort</span>
                )}
              </div>
              <p className="text-xs text-kpmg-on-surface-variant font-body mb-4 leading-relaxed">
                {idx === 0 && `${variant.activeUsers} active users · ${variant.activeUseCases} active use cases`}
                {idx === 1 && `${variant.activeUsers} active users · ${variant.activeUseCases} active use cases (2× scale)`}
                {idx === 2 && `${variant.activeUsers} users · ${variant.activeUseCases} use cases (full activation)`}
              </p>
              <div>
                <p className="text-xs text-kpmg-outline font-body mb-1">Annualised Return</p>
                <p className="font-display text-2xl font-extrabold tabular-nums" style={{ color }}>
                  ${(o.annualizedReturn / 1000000).toFixed(2)}M
                </p>
                {idx > 0 && (
                  <DeltaBadge value={o.annualizedReturn} baseline={baselineOutputs.annualizedReturn} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics comparison table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-kpmg-outline-variant/30">
          <h2 className="font-display text-base font-bold text-kpmg-on-surface">Output Metrics Comparison</h2>
          <p className="text-xs text-kpmg-outline mt-0.5 font-body">Delta values shown vs Current State baseline</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kpmg-outline-variant/20">
                <th className="text-left px-6 py-3 w-56">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Metric</span>
                </th>
                {SCENARIOS.map((s, idx) => (
                  <th key={`th-scen-${s.id}`} className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold font-body" style={{ color: SCENARIO_COLORS[idx] }}>{s.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, mIdx) => (
                <tr
                  key={metric.id}
                  className={`border-b border-kpmg-outline-variant/20 transition-colors cursor-pointer ${
                    highlightedMetric === metric.id ? 'bg-kpmg-primary/4' : mIdx % 2 === 0 ? 'bg-white' : 'bg-kpmg-surface-container-low/30'
                  } hover:bg-kpmg-surface-container-low`}
                  onMouseEnter={() => setHighlightedMetric(metric.id)}
                  onMouseLeave={() => setHighlightedMetric(null)}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-kpmg-outline">{metric.icon}</span>
                      <span className={`text-sm font-body ${metric.highlight ? 'font-bold text-kpmg-on-surface' : 'font-medium text-kpmg-on-surface-variant'}`}>
                        {metric.label}
                      </span>
                    </div>
                  </td>
                  {allOutputs.map((o, idx) => {
                    const val = metric.getValue(o);
                    const baseVal = metric.getValue(baselineOutputs);
                    return (
                      <td key={`cell-${metric.id}-${idx}`} className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-display tabular-nums ${metric.highlight ? 'text-lg font-extrabold' : 'text-sm font-bold'}`} style={{ color: SCENARIO_COLORS[idx] }}>
                            {metric.format(val)}
                          </span>
                          {idx > 0 && <DeltaBadge value={val} baseline={baseVal} />}
                          {idx === 0 && <span className="text-xs text-kpmg-outline font-body">—</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions comparison */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-kpmg-outline-variant/30">
          <h2 className="font-display text-base font-bold text-kpmg-on-surface">Assumption Differences</h2>
          <p className="text-xs text-kpmg-outline mt-0.5 font-body">Input parameters that drive each scenario</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kpmg-outline-variant/20">
                <th className="text-left px-6 py-3 w-56">
                  <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Input</span>
                </th>
                {SCENARIOS.map((s, idx) => (
                  <th key={`assump-th-${s.id}`} className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold font-body" style={{ color: SCENARIO_COLORS[idx] }}>{s.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSUMPTION_ROWS.map((row, rIdx) => (
                <tr
                  key={row.id}
                  className={`border-b border-kpmg-outline-variant/20 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-kpmg-surface-container-low/30'}`}
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-kpmg-on-surface-variant font-body">{row.label}</span>
                  </td>
                  {row.values.map((v, vIdx) => (
                    <td key={`assump-val-${row.id}-${vIdx}`} className="px-4 py-3 text-center">
                      <span className="font-display text-sm font-bold tabular-nums" style={{ color: SCENARIO_COLORS[vIdx] }}>{v}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation synthesis */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'linear-gradient(135deg, #00205F 0%, #006397 100%)' }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>
              Recommendation Synthesis
            </p>
            <h2 className="font-display text-xl font-extrabold text-white mb-3 leading-tight">
              2X Scale-Up is the preferred strategic path
            </h2>
            <p className="text-sm text-white/80 font-body leading-relaxed max-w-2xl">
              The 2X Scale-Up scenario delivers a{' '}
              <span className="font-semibold text-kpmg-accent-faster">
                ${((allOutputs[1].annualizedReturn - allOutputs[0].annualizedReturn) / 1000000).toFixed(2)}M
              </span>{' '}
              uplift over Current State by doubling active users and use cases within firm-wide capacity limits.
              Full Adoption offers the highest ceiling but requires 100% activation across all targeted users — recommended
              as a 12-month horizon target after 2X Scale-Up is stabilised.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { id: 'syn-roi', label: 'ROI Uplift vs Baseline', value: `+${(((allOutputs[1].annualizedReturn - allOutputs[0].annualizedReturn) / Math.max(allOutputs[0].annualizedReturn, 1)) * 100).toFixed(0)}%` },
                { id: 'syn-ftes', label: 'Additional FTEs Freed', value: `+${(allOutputs[1].ftesFreed - allOutputs[0].ftesFreed).toFixed(1)}` },
                { id: 'syn-users', label: 'Additional Active Users', value: `+${allOutputs[1].activeUsers - allOutputs[0].activeUsers}` },
              ].map(({ id, label, value }) => (
                <div key={id}>
                  <p className="text-xs text-white/50 font-body mb-1">{label}</p>
                  <p className="font-display text-xl font-extrabold text-kpmg-accent-faster tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-kpmg-primary hover:bg-kpmg-surface-container-low transition-all duration-150 active:scale-95 font-body">
              <FileText size={14} />
              Export Report
            </button>
            <Link href="/pilot-request">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition-all duration-150 active:scale-95 font-body cursor-pointer w-full justify-center">
                <Rocket size={14} />
                Request Pilot
                <ChevronRight size={13} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}