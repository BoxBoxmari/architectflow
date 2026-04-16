'use client';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Save, Download, ChevronRight, Info, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import SimulatorOutputChart from './SimulatorOutputChart';
import { calcScenarioVariants, SIM_CONSTANTS, SIM_DEFAULTS, SIM_RANGES, type SimInputs } from '@/lib/simulator/calcOutputs';
import { downloadFile, buildCSV } from '@/lib/exportUtils';

const { HOURLY_COST, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = SIM_CONSTANTS;

// Executive number formatter: $1.2M, $450K, $12K
function fmtExec(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

interface SliderRowProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  color: 'teal' | 'amber';
  onChange: (v: number) => void;
}

function SliderRow({ label, hint, value, min, max, step, format, color, onChange }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor = color === 'teal' ? '#00B8A9' : '#F39C12';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest truncate" style={{ color: '#00205F', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          <div className="group relative flex-shrink-0">
            <Info size={11} className="cursor-help" style={{ color: '#9E9E9E' }} aria-hidden="true" />
            <div
              role="tooltip"
              className="absolute left-0 bottom-full mb-1 w-52 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
              style={{ background: '#00205F', fontFamily: 'Inter, sans-serif' }}
            >
              {hint}
            </div>
          </div>
        </div>
        <span
          className="font-bold tabular-nums flex-shrink-0"
          style={{ color: trackColor, fontFamily: 'Manrope, sans-serif', fontSize: '22px', letterSpacing: '-0.01em' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {format(value)}
        </span>
      </div>
      {/* Oversized 38px tactile slider */}
      <div className="relative w-full" style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, #EBE7E7 ${pct}%, #EBE7E7 100%)`,
          } as React.CSSProperties}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${format(value)} — range ${format(min)} to ${format(max)}`}
        />
      </div>
      <div className="flex justify-between" aria-hidden="true">
        <span className="text-xs" style={{ color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}>{format(min)}</span>
        <span className="text-xs" style={{ color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}>{format(max)}</span>
      </div>
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${trackColor};
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          border: 3px solid #fff;
          transition: box-shadow 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.22);
        }
        input[type='range']::-moz-range-thumb {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${trackColor};
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          border: 3px solid #fff;
        }
      `}</style>
    </div>
  );
}

export default function ValueSimulatorContent() {
  const [inputs, setInputs] = useState<SimInputs>(SIM_DEFAULTS);
  const [activeScenario, setActiveScenario] = useState<'current' | 'scale2x' | 'fulladoption'>('current');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [readyToBrief, setReadyToBrief] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const set = useCallback(<K extends keyof SimInputs>(key: K, val: SimInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, []);

  const variants = calcScenarioVariants(inputs);
  const outputs = variants.currentState.outputs;
  const scale2xOutputs = variants.scale2x.outputs;
  const fullAdoptionOutputs = variants.fullAdoption.outputs;

  const displayOutputs = activeScenario === 'current' ? outputs : activeScenario === 'scale2x' ? scale2xOutputs : fullAdoptionOutputs;

  function handleSave() {
    const saved = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      timestamp: new Date().toISOString(),
      inputs,
      outputs: {
        current: variants.currentState.outputs,
        scale2x: variants.scale2x.outputs,
        fullAdoption: variants.fullAdoption.outputs,
      },
    };
    try {
      const existing: unknown[] = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
      existing.unshift(saved);
      localStorage.setItem('savedScenarios', JSON.stringify(existing.slice(0, 10)));
      toast.success('Scenario saved', { description: 'Stored locally — available in Scenario Comparison' });
      const now = new Date();
      setLastSavedAt(now);
      setReadyToBrief(true);
      setLastAction('Scenario saved');
    } catch {
      toast.error('Could not save scenario');
    }
  }

  function handleExportCSV() {
    const rows: (string | number)[][] = [
      ['KPMG AI Value Simulator — Scenario Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['--- INPUTS ---'],
      ['Parameter', 'Value'],
      ['Target Use Case Count', inputs.targetUseCaseCount],
      ['Use Case Activation Rate (%)', inputs.activationRate],
      ['Target User Count', inputs.targetUserCount],
      ['User Adoption Rate (%)', inputs.adoptionRate],
      ['Tasks / User / Use Case / Month', inputs.tasksPerUserPerUseCasePerMonth],
      ['Avg Time Saved / Task (min)', inputs.avgTimeSavedMinutes],
      [],
      ['--- KEY ASSUMPTIONS ---'],
      ['Hourly Cost Rate (USD/hr)', HOURLY_COST],
      ['Working Days / Month', WORKING_DAYS_PER_MONTH],
      ['Working Hours / Day', WORKING_HOURS_PER_DAY],
      [],
      ['--- OUTPUTS (ALL SCENARIOS) ---'],
      ['Metric', 'Current State', '2× Scale-Up', 'Full Adoption'],
      ['Active Use Cases', outputs.activeUseCases, scale2xOutputs.activeUseCases, fullAdoptionOutputs.activeUseCases],
      ['Active Users', outputs.activeUsers, scale2xOutputs.activeUsers, fullAdoptionOutputs.activeUsers],
      ['AI-Assisted Tasks / Month', outputs.tasksPerMonth, scale2xOutputs.tasksPerMonth, fullAdoptionOutputs.tasksPerMonth],
      ['Hours Recovered / Month', Math.round(outputs.hoursPerMonth), Math.round(scale2xOutputs.hoursPerMonth), Math.round(fullAdoptionOutputs.hoursPerMonth)],
      ['Monthly Cost Savings (USD)', Math.round(outputs.monthlyCostSavings), Math.round(scale2xOutputs.monthlyCostSavings), Math.round(fullAdoptionOutputs.monthlyCostSavings)],
      ['Annualised Return (USD)', Math.round(outputs.annualizedReturn), Math.round(scale2xOutputs.annualizedReturn), Math.round(fullAdoptionOutputs.annualizedReturn)],
      ['FTEs Freed / Month', outputs.ftesFreed.toFixed(1), scale2xOutputs.ftesFreed.toFixed(1), fullAdoptionOutputs.ftesFreed.toFixed(1)],
      ['Time Freed / User / Month (min)', Math.round(outputs.timePerUserPerMonth), Math.round(scale2xOutputs.timePerUserPerMonth), Math.round(fullAdoptionOutputs.timePerUserPerMonth)],
      ['Value / User / Month (USD)', Math.round(outputs.valuePerUserPerMonth), Math.round(scale2xOutputs.valuePerUserPerMonth), Math.round(fullAdoptionOutputs.valuePerUserPerMonth)],
      ['Daily AI Interactions', outputs.dailyInteractions, scale2xOutputs.dailyInteractions, fullAdoptionOutputs.dailyInteractions],
      ['Programme Penetration (%)', Math.round(outputs.penetration), Math.round(scale2xOutputs.penetration), Math.round(fullAdoptionOutputs.penetration)],
    ];
    const csv = buildCSV(rows);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `kpmg-ai-value-simulator-${dateStr}.csv`, 'text/csv;charset=utf-8;');
    toast.success('CSV downloaded', { description: 'All three scenario variants included' });
    const now = new Date();
    setLastSavedAt(now);
    setReadyToBrief(true);
    setLastAction('CSV exported');
  }

  function handleExportPDF() {
    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const scenarioRows = [
      ['Active Use Cases', outputs.activeUseCases, scale2xOutputs.activeUseCases, fullAdoptionOutputs.activeUseCases],
      ['Active Users', outputs.activeUsers, scale2xOutputs.activeUsers, fullAdoptionOutputs.activeUsers],
      ['Tasks / Month', outputs.tasksPerMonth.toLocaleString(), scale2xOutputs.tasksPerMonth.toLocaleString(), fullAdoptionOutputs.tasksPerMonth.toLocaleString()],
      ['Hours Recovered / Month', Math.round(outputs.hoursPerMonth).toLocaleString(), Math.round(scale2xOutputs.hoursPerMonth).toLocaleString(), Math.round(fullAdoptionOutputs.hoursPerMonth).toLocaleString()],
      ['Monthly Cost Savings', fmtExec(outputs.monthlyCostSavings), fmtExec(scale2xOutputs.monthlyCostSavings), fmtExec(fullAdoptionOutputs.monthlyCostSavings)],
      ['Annualised Return', fmtExec(outputs.annualizedReturn), fmtExec(scale2xOutputs.annualizedReturn), fmtExec(fullAdoptionOutputs.annualizedReturn)],
      ['FTEs Freed / Month', outputs.ftesFreed.toFixed(1), scale2xOutputs.ftesFreed.toFixed(1), fullAdoptionOutputs.ftesFreed.toFixed(1)],
      ['Programme Penetration', `${Math.round(outputs.penetration)}%`, `${Math.round(scale2xOutputs.penetration)}%`, `${Math.round(fullAdoptionOutputs.penetration)}%`],
    ];
    const tableRows = scenarioRows.map(([label, cur, s2x, full]) =>
      `<tr><td>${label}</td><td>${cur}</td><td>${s2x}</td><td>${full}</td></tr>`
    ).join('');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>KPMG AI Value Simulator — ${dateStr}</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 40px; font-size: 13px; }
  h1 { color: #00205F; font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
  h2 { color: #006397; font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #00205F; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  tr:nth-child(even) td { background: #f8f8f8; }
  .highlight { background: #e8f4f8 !important; font-weight: bold; }
  .footer { margin-top: 32px; font-size: 11px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 12px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>KPMG AI Value Simulator</h1>
<div class="subtitle">Scenario Export — Generated ${dateStr}</div>

<h2>Inputs</h2>
<table>
  <tr><th>Parameter</th><th>Value</th></tr>
  <tr><td>Target Use Case Count</td><td>${inputs.targetUseCaseCount}</td></tr>
  <tr><td>Use Case Activation Rate</td><td>${inputs.activationRate}%</td></tr>
  <tr><td>Target User Count</td><td>${inputs.targetUserCount.toLocaleString()}</td></tr>
  <tr><td>User Adoption Rate</td><td>${inputs.adoptionRate}%</td></tr>
  <tr><td>Tasks / User / Use Case / Month</td><td>${inputs.tasksPerUserPerUseCasePerMonth}</td></tr>
  <tr><td>Avg Time Saved / Task</td><td>${inputs.avgTimeSavedMinutes} min</td></tr>
</table>

<h2>Key Assumptions</h2>
<table>
  <tr><th>Assumption</th><th>Value</th></tr>
  <tr><td>Hourly cost rate (USD)</td><td>$${HOURLY_COST}/hr</td></tr>
  <tr><td>Working days / month</td><td>${WORKING_DAYS_PER_MONTH}</td></tr>
  <tr><td>Working hours / day</td><td>${WORKING_HOURS_PER_DAY}</td></tr>
</table>

<h2>Scenario Outputs</h2>
<table>
  <tr><th>Metric</th><th>Current State</th><th>2× Scale-Up</th><th>Full Adoption</th></tr>
  ${tableRows}
</table>

<div class="footer">KPMG AI Architecture — Confidential. For internal use only. All figures are illustrative estimates based on modelled assumptions.</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      toast.error('Pop-up blocked', { description: 'Please allow pop-ups to export PDF' });
    } else {
      toast.success('PDF ready', { description: 'Print dialog opened — save as PDF' });
      const now = new Date();
      setLastSavedAt(now);
      setReadyToBrief(true);
      setLastAction('PDF exported');
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const SCENARIO_VIEWS = [
    { id: 'current' as const, label: 'Current State', color: '#006397' },
    { id: 'scale2x' as const, label: '2× Scale-Up', color: '#00B8A9' },
    { id: 'fulladoption' as const, label: 'Full Adoption', color: '#0F6E56' },
  ];

  // Helper: get scenario outputs
  const getScenarioOutputs = (id: string) =>
    id === 'current' ? outputs : id === 'scale2x' ? scale2xOutputs : fullAdoptionOutputs;

  return (
    // Stone Base canvas
    <div className="min-h-screen" style={{ background: '#FCF9F8' }}>
      {/* ── HERO METRIC ROW — Summary-First Principle ── */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{ background: 'linear-gradient(135deg, #00205F 0%, #003580 100%)' }}
      >
        {/* Scenario selector inside hero */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SCENARIO_VIEWS.map(sv => (
            <button
              key={`sv-${sv.id}`}
              onClick={() => setActiveScenario(sv.id)}
              aria-pressed={activeScenario === sv.id}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-150"
              style={
                activeScenario === sv.id
                  ? { background: sv.color, color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }
                  : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }
              }
            >
              {sv.label}
            </button>
          ))}
        </div>

        {/* Hero metric — 56px Manrope Bold */}
        <div className="mb-2">
          <p
            className="uppercase font-bold mb-3"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}
          >
            ESTIMATED ANNUALISED RETURN
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              className="tabular-nums font-bold"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: '56px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {fmtExec(displayOutputs.annualizedReturn)}
            </span>
            <span
              className="font-bold"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              / YEAR
            </span>
          </div>
        </div>

        {/* Supporting hero metrics */}
        <div className="flex flex-wrap gap-6 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div>
            <p className="uppercase font-bold mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>MONTHLY SAVINGS</p>
            <p className="tabular-nums font-bold" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '26px', color: '#00B8A9', letterSpacing: '-0.02em' }}>
              {fmtExec(displayOutputs.monthlyCostSavings)}
            </p>
          </div>
          <div>
            <p className="uppercase font-bold mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>ACTIVE USERS</p>
            <p className="tabular-nums font-bold" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '26px', color: '#F39C12', letterSpacing: '-0.02em' }}>
              {displayOutputs.activeUsers.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="uppercase font-bold mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>FTES FREED / MO</p>
            <p className="tabular-nums font-bold" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '26px', color: '#0F6E56', letterSpacing: '-0.02em' }}>
              {displayOutputs.ftesFreed.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="uppercase font-bold mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>ACTIVE USE CASES</p>
            <p className="tabular-nums font-bold" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '26px', color: '#00B8A9', letterSpacing: '-0.02em' }}>
              {displayOutputs.activeUseCases}
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Assumptions Panel — Paper on Stone */}
        <div
          className="order-1 lg:order-none lg:col-span-4 xl:col-span-3 rounded-2xl p-6 space-y-6 h-fit"
          style={{ background: '#FFFFFF' }}
        >
          <div>
            <h2
              className="font-bold mb-1"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#00205F' }}
            >
              Assumptions
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9E9E9E' }}>
              Adjust sliders to model scenarios in real time
            </p>
          </div>

          {/* FASTER axis */}
          <div>
            <p
              className="mb-4 uppercase font-bold"
              style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#00B8A9', fontFamily: 'Inter, sans-serif' }}
            >
              FASTER — Use Case Axis
            </p>
            <div className="space-y-6">
              <SliderRow
                label="Target Use Case Count"
                hint="Total number of AI use cases targeted for activation in this scenario"
                value={inputs.targetUseCaseCount}
                min={SIM_RANGES.targetUseCaseCount.min}
                max={SIM_RANGES.targetUseCaseCount.max}
                step={SIM_RANGES.targetUseCaseCount.step}
                format={v => `${v}`}
                color="teal"
                onChange={v => set('targetUseCaseCount', v)}
              />
              <SliderRow
                label="Use Case Activation Rate"
                hint="Percentage of targeted use cases that will be successfully activated"
                value={inputs.activationRate}
                min={SIM_RANGES.activationRate.min}
                max={SIM_RANGES.activationRate.max}
                step={SIM_RANGES.activationRate.step}
                format={v => `${v}%`}
                color="teal"
                onChange={v => set('activationRate', v)}
              />
              <SliderRow
                label="Tasks / User / Use Case / Mo"
                hint="Average number of tasks each active user performs per use case per month"
                value={inputs.tasksPerUserPerUseCasePerMonth}
                min={SIM_RANGES.tasksPerUserPerUseCasePerMonth.min}
                max={SIM_RANGES.tasksPerUserPerUseCasePerMonth.max}
                step={SIM_RANGES.tasksPerUserPerUseCasePerMonth.step}
                format={v => `${v}`}
                color="teal"
                onChange={v => set('tasksPerUserPerUseCasePerMonth', v)}
              />
            </div>
          </div>

          {/* DEEPER axis */}
          <div className="pt-5" style={{ borderTop: '1px solid #EBE7E7' }}>
            <p
              className="mb-4 uppercase font-bold"
              style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#F39C12', fontFamily: 'Inter, sans-serif' }}
            >
              DEEPER — Adoption Axis
            </p>
            <div className="space-y-6">
              <SliderRow
                label="Target User Count"
                hint="Total number of KPMG staff targeted to use AI tools in this scenario"
                value={inputs.targetUserCount}
                min={SIM_RANGES.targetUserCount.min}
                max={SIM_RANGES.targetUserCount.max}
                step={SIM_RANGES.targetUserCount.step}
                format={v => v.toLocaleString()}
                color="amber"
                onChange={v => set('targetUserCount', v)}
              />
              <SliderRow
                label="User Adoption Rate"
                hint="Percentage of targeted users who actively use the AI tools"
                value={inputs.adoptionRate}
                min={SIM_RANGES.adoptionRate.min}
                max={SIM_RANGES.adoptionRate.max}
                step={SIM_RANGES.adoptionRate.step}
                format={v => `${v}%`}
                color="amber"
                onChange={v => set('adoptionRate', v)}
              />
              <SliderRow
                label="Avg Time Saved / Task"
                hint="Average minutes saved per AI-assisted task compared to manual completion"
                value={inputs.avgTimeSavedMinutes}
                min={SIM_RANGES.avgTimeSavedMinutes.min}
                max={SIM_RANGES.avgTimeSavedMinutes.max}
                step={SIM_RANGES.avgTimeSavedMinutes.step}
                format={v => `${v}m`}
                color="amber"
                onChange={v => set('avgTimeSavedMinutes', v)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-2" style={{ borderTop: '1px solid #EBE7E7' }}>
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-150"
              style={{ background: '#00205F', color: '#fff', fontFamily: 'Inter, sans-serif' }}
              aria-label="Save current scenario to local storage for Scenario Comparison"
            >
              <Save size={14} aria-hidden="true" />
              Save Scenario
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-150"
                style={{ background: '#EBE7E7', color: '#00205F', fontFamily: 'Inter, sans-serif' }}
                aria-label="Export scenario data as CSV file"
              >
                <Download size={14} aria-hidden="true" />
                CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-150"
                style={{ background: '#EBE7E7', color: '#00205F', fontFamily: 'Inter, sans-serif' }}
                aria-label="Export scenario data as PDF report"
              >
                <FileText size={14} aria-hidden="true" />
                PDF
              </button>
            </div>

            {readyToBrief && lastSavedAt && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(15,110,86,0.06)', border: '1px solid rgba(15,110,86,0.15)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#0F6E56' }} />
                  <span className="font-bold uppercase" style={{ fontSize: '10px', letterSpacing: '0.06em', color: '#0F6E56', fontFamily: 'Inter, sans-serif' }}>Ready to Brief</span>
                </div>
                <p style={{ fontSize: '12px', color: '#0F6E56', fontFamily: 'Inter, sans-serif' }}>{lastAction}</p>
                <p className="tabular-nums mt-0.5" style={{ fontSize: '11px', color: '#0F6E56', opacity: 0.7, fontFamily: 'Inter, sans-serif' }}>
                  {lastSavedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  {' · '}
                  {lastSavedAt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Output Metrics — Paper cards on Stone */}
        <div className="order-2 lg:order-none lg:col-span-5 xl:col-span-6 space-y-4">

          {/* Output metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'out-active-cases',
                label: 'ACTIVE USE CASES',
                value: displayOutputs.activeUseCases.toString(),
                suffix: `of ${inputs.targetUseCaseCount}`,
                color: '#00B8A9',
                axis: 'FASTER',
              },
              {
                id: 'out-active-users',
                label: 'ACTIVE USERS',
                value: displayOutputs.activeUsers.toLocaleString(),
                suffix: `of ${inputs.targetUserCount.toLocaleString()}`,
                color: '#F39C12',
                axis: 'DEEPER',
              },
              {
                id: 'out-hours',
                label: 'HOURS RECOVERED / MO',
                value: Math.round(displayOutputs.hoursPerMonth).toLocaleString(),
                suffix: 'hrs',
                color: '#00B8A9',
                axis: 'FASTER',
              },
              {
                id: 'out-tasks',
                label: 'AI TASKS / MONTH',
                value: Math.round(displayOutputs.tasksPerMonth).toLocaleString(),
                suffix: 'tasks',
                color: '#F39C12',
                axis: 'DEEPER',
              },
              {
                id: 'out-ftes',
                label: 'FTES FREED / MONTH',
                value: displayOutputs.ftesFreed.toFixed(1),
                suffix: 'FTEs',
                color: '#0F6E56',
                axis: 'FINANCIAL',
              },
              {
                id: 'out-value-user',
                label: 'VALUE / USER / MONTH',
                value: fmtExec(displayOutputs.valuePerUserPerMonth),
                suffix: '',
                color: '#0F6E56',
                axis: 'FINANCIAL',
              },
              {
                id: 'out-time-user',
                label: 'TIME FREED / USER / MO',
                value: Math.round(displayOutputs.timePerUserPerMonth).toLocaleString(),
                suffix: 'min',
                color: '#45004F',
                axis: 'INSIGHT',
              },
              {
                id: 'out-daily',
                label: 'DAILY AI INTERACTIONS',
                value: Math.round(displayOutputs.dailyInteractions).toLocaleString(),
                suffix: '/day',
                color: '#00205F',
                axis: 'INSIGHT',
              },
              {
                id: 'out-penetration',
                label: 'PROGRAMME PENETRATION',
                value: `${Math.round(displayOutputs.penetration)}`,
                suffix: '%',
                color: '#00205F',
                axis: 'INSIGHT',
              },
            ].map(({ id, label, value, suffix, color }) => (
              <div
                key={id}
                className="rounded-2xl p-4"
                style={{ background: '#FFFFFF' }}
              >
                <p
                  className="uppercase font-bold mb-2"
                  style={{ fontSize: '9px', letterSpacing: '0.07em', color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}
                >
                  {label}
                </p>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span
                    className="tabular-nums font-bold"
                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: '28px', color, letterSpacing: '-0.02em', lineHeight: 1.1 }}
                  >
                    {value}
                  </span>
                  {suffix && (
                    <span
                      className="font-bold"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9E9E9E', letterSpacing: '0.02em' }}
                    >
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <SimulatorOutputChart inputs={inputs} />
        </div>

        {/* RIGHT: Strategic Summary — Paper on Stone */}
        <div className="order-3 lg:order-none lg:col-span-3 xl:col-span-3 space-y-4">

          {/* Scenario Summary */}
          <div className="rounded-2xl p-5" style={{ background: '#FFFFFF' }}>
            <h3
              className="font-bold mb-4"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: '#00205F' }}
            >
              Scenario Summary
            </h3>
            <div className="space-y-3">
              {SCENARIO_VIEWS.map(sv => {
                const svOutputs = getScenarioOutputs(sv.id);
                const isActive = activeScenario === sv.id;
                return (
                  <button
                    key={`sum-${sv.id}`}
                    onClick={() => setActiveScenario(sv.id)}
                    className="w-full text-left p-3 rounded-xl transition-all duration-150"
                    style={
                      isActive
                        ? { background: `rgba(0,0,0,0.03)`, outline: `2px solid ${sv.color}` }
                        : { background: '#FCF9F8' }
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="font-bold uppercase"
                        style={{ fontSize: '10px', letterSpacing: '0.06em', color: sv.color, fontFamily: 'Inter, sans-serif' }}
                      >
                        {sv.label}
                      </span>
                      {isActive && <span className="w-2 h-2 rounded-full" style={{ background: sv.color }} />}
                    </div>
                    <p
                      className="tabular-nums font-bold"
                      style={{ fontFamily: 'Manrope, sans-serif', fontSize: '22px', color: '#00205F', letterSpacing: '-0.02em' }}
                    >
                      {fmtExec(svOutputs.annualizedReturn)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9E9E9E', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                      {svOutputs.ftesFreed.toFixed(1)} FTEs · {svOutputs.activeUsers.toLocaleString()} users
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Assumptions — Submerged utility */}
          <div className="rounded-2xl p-5" style={{ background: '#FFFFFF' }}>
            <h3
              className="font-bold mb-3"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: '#00205F' }}
            >
              Key Assumptions
            </h3>
            <div className="space-y-2.5">
              {[
                { id: 'ka-cost', label: 'Hourly cost rate', value: `$${SIM_CONSTANTS.HOURLY_COST}/hr` },
                { id: 'ka-days', label: 'Working days/month', value: `${SIM_CONSTANTS.WORKING_DAYS_PER_MONTH}` },
                { id: 'ka-hrs', label: 'Working hours/day', value: `${SIM_CONSTANTS.WORKING_HOURS_PER_DAY}` },
                { id: 'ka-cases', label: 'Active use cases', value: `${outputs.activeUseCases} of ${inputs.targetUseCaseCount}` },
                { id: 'ka-users', label: 'Active users', value: `${outputs.activeUsers.toLocaleString()} of ${inputs.targetUserCount.toLocaleString()}` },
              ].map(({ id, label, value }) => (
                <div key={id} className="flex items-center justify-between gap-2">
                  <span style={{ fontSize: '12px', color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                  <span className="tabular-nums font-bold" style={{ fontSize: '12px', color: '#00205F', fontFamily: 'Inter, sans-serif' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link href="/ai-architecture-explorer">
            <span
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-150"
              style={{ background: '#00205F', color: '#fff', fontFamily: 'Inter, sans-serif' }}
            >
              Explore Architecture
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}