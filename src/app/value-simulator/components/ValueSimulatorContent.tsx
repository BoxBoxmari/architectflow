'use client';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Save, Download, ChevronRight, Info, TrendingUp, Users, Clock, DollarSign, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import SimulatorOutputChart from './SimulatorOutputChart';
import { calcScenarioVariants, SIM_CONSTANTS, SIM_DEFAULTS, SIM_RANGES, type SimInputs } from '@/lib/simulator/calcOutputs';

const { HOURLY_COST, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = SIM_CONSTANTS;

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
          <span className="text-sm font-medium text-kpmg-on-surface font-body truncate">{label}</span>
          <div className="group relative flex-shrink-0">
            <Info size={12} className="text-kpmg-outline cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 w-48 px-2.5 py-1.5 bg-kpmg-on-surface text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-elevated font-body">
              {hint}
            </div>
          </div>
        </div>
        <span className="font-display text-base font-bold tabular-nums flex-shrink-0" style={{ color: trackColor }}>
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-track w-full"
          style={{
            '--val': `${pct}%`,
            background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, #EBE7E7 ${pct}%, #EBE7E7 100%)`,
          } as React.CSSProperties}
          aria-label={label}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-kpmg-outline font-body">{format(min)}</span>
        <span className="text-xs text-kpmg-outline font-body">{format(max)}</span>
      </div>
    </div>
  );
}

export default function ValueSimulatorContent() {
  const [inputs, setInputs] = useState<SimInputs>(SIM_DEFAULTS);
  const [activeScenario, setActiveScenario] = useState<'current' | 'scale2x' | 'fulladoption'>('current');

  const set = useCallback(<K extends keyof SimInputs>(key: K, val: SimInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, []);

  // All scenario variants from shared formula
  const variants = calcScenarioVariants(inputs);
  const outputs = variants.currentState.outputs;
  const scale2xOutputs = variants.scale2x.outputs;
  const fullAdoptionOutputs = variants.fullAdoption.outputs;

  const displayOutputs = activeScenario === 'current' ? outputs : activeScenario === 'scale2x' ? scale2xOutputs : fullAdoptionOutputs;

  function handleSave() {
    toast.success('Scenario saved to your workspace', { description: 'Available in Scenario Comparison' });
  }

  function handleExport() {
    toast.success('Export initiated', { description: 'Your simulation report will be ready shortly' });
  }

  const SCENARIO_VIEWS = [
    { id: 'current' as const, label: 'Current State', color: '#006397' },
    { id: 'scale2x' as const, label: '2× Scale-Up', color: '#00B8A9' },
    { id: 'fulladoption' as const, label: 'Full Adoption', color: '#0F6E56' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Assumptions panel */}
      <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-xl shadow-card p-6 space-y-6 h-fit">
        <div>
          <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-1">Assumptions</h2>
          <p className="text-xs text-kpmg-outline font-body">Adjust sliders to model different scenarios in real time</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest font-body mb-3" style={{ fontSize: '10px', color: '#00B8A9' }}>
            FASTER — Use Case Axis
          </p>
          <div className="space-y-5">
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
              label="Tasks / User / Use Case / Month"
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

        <div className="border-t border-kpmg-outline-variant/30 pt-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest font-body mb-3" style={{ fontSize: '10px', color: '#F39C12' }}>
            DEEPER — Adoption Axis
          </p>
          <div className="space-y-5">
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
              label="Avg Time Saved / Task (min)"
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

        <div className="border-t border-kpmg-outline-variant/30 pt-4 space-y-2">
          <button onClick={handleSave} className="kpmg-btn-primary w-full justify-center text-sm">
            <Save size={14} />
            Save Scenario
          </button>
          <button onClick={handleExport} className="kpmg-btn-secondary w-full justify-center text-sm">
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* Center: Outputs panel */}
      <div className="lg:col-span-5 xl:col-span-6 space-y-5">
        {/* Scenario selector */}
        <div className="bg-white rounded-xl shadow-card p-2 flex gap-1">
          {SCENARIO_VIEWS.map(sv => (
            <button
              key={`sv-${sv.id}`}
              onClick={() => setActiveScenario(sv.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-150 font-body ${
                activeScenario === sv.id ? 'text-white shadow-elevated' : 'text-kpmg-on-surface-variant hover:bg-kpmg-surface-container'
              }`}
              style={activeScenario === sv.id ? { backgroundColor: sv.color } : {}}
            >
              {sv.label}
            </button>
          ))}
        </div>

        {/* Headline metric */}
        <div
          className="rounded-xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #00205F 0%, #006397 100%)' }}
        >
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest font-body mb-1" style={{ fontSize: '10px' }}>
            Estimated Annualised Return
          </p>
          <p className="font-display text-4xl font-extrabold tabular-nums mb-1">
            £{(displayOutputs.annualizedReturn / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-white/70 font-body">
            £{Math.round(displayOutputs.monthlyCostSavings).toLocaleString()} per month · {displayOutputs.activeUsers.toLocaleString()} active users
          </p>
        </div>

        {/* Output metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: 'out-active-cases',
              icon: <Zap size={15} />,
              label: 'Active Use Cases',
              value: displayOutputs.activeUseCases.toString(),
              suffix: `of ${inputs.targetUseCaseCount}`,
              color: '#00B8A9',
            },
            {
              id: 'out-active-users',
              icon: <Users size={15} />,
              label: 'Active Users',
              value: displayOutputs.activeUsers.toLocaleString(),
              suffix: `of ${inputs.targetUserCount}`,
              color: '#006397',
            },
            {
              id: 'out-hours',
              icon: <Clock size={15} />,
              label: 'Hours Recovered / Month',
              value: Math.round(displayOutputs.hoursPerMonth).toLocaleString(),
              suffix: 'hrs',
              color: '#00B8A9',
            },
            {
              id: 'out-tasks',
              icon: <Zap size={15} />,
              label: 'AI-Assisted Tasks / Month',
              value: Math.round(displayOutputs.tasksPerMonth).toLocaleString(),
              suffix: 'tasks',
              color: '#006397',
            },
            {
              id: 'out-ftes',
              icon: <Users size={15} />,
              label: 'FTEs Freed / Month',
              value: displayOutputs.ftesFreed.toFixed(1),
              suffix: 'FTEs',
              color: '#0F6E56',
            },
            {
              id: 'out-time-user',
              icon: <Clock size={15} />,
              label: 'Time Freed / User / Month',
              value: Math.round(displayOutputs.timePerUserPerMonth).toLocaleString(),
              suffix: 'min',
              color: '#45004F',
            },
            {
              id: 'out-value-user',
              icon: <DollarSign size={15} />,
              label: 'Value / User / Month',
              value: `£${Math.round(displayOutputs.valuePerUserPerMonth).toLocaleString()}`,
              suffix: '',
              color: '#F39C12',
            },
            {
              id: 'out-daily',
              icon: <BarChart3 size={15} />,
              label: 'Daily AI Interactions',
              value: Math.round(displayOutputs.dailyInteractions).toLocaleString(),
              suffix: '/day',
              color: '#006397',
            },
            {
              id: 'out-penetration',
              icon: <TrendingUp size={15} />,
              label: 'Programme Penetration',
              value: `${Math.round(displayOutputs.penetration)}`,
              suffix: '%',
              color: '#00205F',
            },
          ].map(({ id, icon, label, value, suffix, color }) => (
            <div key={id} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
                {icon}
                <span className="text-xs font-semibold text-kpmg-outline font-body">{label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl font-extrabold tabular-nums" style={{ color }}>{value}</span>
                {suffix && <span className="text-xs text-kpmg-outline font-body">{suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <SimulatorOutputChart inputs={inputs} />
      </div>

      {/* Right: Strategic summary */}
      <div className="lg:col-span-3 xl:col-span-3 space-y-5">
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-4">Scenario Summary</h3>
          <div className="space-y-4">
            {SCENARIO_VIEWS.map(sv => {
              const svOutputs = sv.id === 'current' ? outputs : sv.id === 'scale2x' ? scale2xOutputs : fullAdoptionOutputs;
              const isActive = activeScenario === sv.id;
              return (
                <button
                  key={`sum-${sv.id}`}
                  onClick={() => setActiveScenario(sv.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-150 ${
                    isActive ? 'border-kpmg-primary bg-kpmg-primary/4' : 'border-transparent bg-kpmg-surface-container-low hover:border-kpmg-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold font-body" style={{ color: sv.color }}>{sv.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sv.color }} />}
                  </div>
                  <p className="font-display text-lg font-extrabold tabular-nums text-kpmg-on-surface">
                    £{(svOutputs.annualizedReturn / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-kpmg-outline font-body mt-0.5">
                    {svOutputs.ftesFreed.toFixed(1)} FTEs · {svOutputs.activeUsers} users
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-3">Key Assumptions</h3>
          <div className="space-y-2">
            {[
              { id: 'ka-cost', label: 'Hourly cost rate', value: `£${HOURLY_COST}/hr` },
              { id: 'ka-days', label: 'Working days/month', value: `${WORKING_DAYS_PER_MONTH}` },
              { id: 'ka-hrs', label: 'Working hours/day', value: `${WORKING_HOURS_PER_DAY}` },
              { id: 'ka-cases', label: 'Active use cases', value: `${outputs.activeUseCases} of ${inputs.targetUseCaseCount}` },
              { id: 'ka-users', label: 'Active users', value: `${outputs.activeUsers} of ${inputs.targetUserCount}` },
            ].map(({ id, label, value }) => (
              <div key={id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-kpmg-outline font-body">{label}</span>
                <span className="text-xs font-semibold text-kpmg-on-surface font-body tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/ai-architecture-explorer">
            <span className="kpmg-btn-primary w-full justify-between text-sm cursor-pointer">
              Explore Architecture
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}