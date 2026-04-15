'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SimInputs {
  targetUseCaseCount: number;
  activationRate: number;
  targetUserCount: number;
  adoptionRate: number;
  tasksPerUserPerUseCasePerMonth: number;
  avgTimeSavedMinutes: number;
}

const HOURLY_COST = 15;
const WORKING_DAYS_PER_MONTH = 21;
const WORKING_HOURS_PER_DAY = 8;

function calcAnnual(inputs: SimInputs) {
  const activeUseCases = Math.round(inputs.targetUseCaseCount * inputs.activationRate / 100);
  const activeUsers = Math.round(inputs.targetUserCount * inputs.adoptionRate / 100);
  const tasksPerMonth = activeUsers * activeUseCases * inputs.tasksPerUserPerUseCasePerMonth;
  const hoursPerMonth = (tasksPerMonth * inputs.avgTimeSavedMinutes) / 60;
  return hoursPerMonth * HOURLY_COST * 12;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-elevated border border-kpmg-outline-variant/40 p-3">
      <p className="text-xs font-semibold text-kpmg-on-surface-variant mb-1 font-body">{label}</p>
      <p className="font-display text-base font-700 text-kpmg-primary tabular-nums">
        £{(payload[0].value / 1000).toFixed(0)}k
      </p>
    </div>
  );
};

export default function SimulatorOutputChart({ inputs }: { inputs: SimInputs }) {
  const data = [
    {
      name: 'Status Quo',
      value: calcAnnual({ ...inputs, activationRate: Math.max(inputs.activationRate - 30, 10), adoptionRate: Math.max(inputs.adoptionRate - 25, 10) }),
      color: '#C4C6D4',
    },
    {
      name: 'Current',
      value: calcAnnual(inputs),
      color: '#006397',
    },
    {
      name: '2× Scale',
      value: calcAnnual({ ...inputs, targetUseCaseCount: Math.min(inputs.targetUseCaseCount * 2, 12), targetUserCount: Math.min(inputs.targetUserCount * 2, 1000) }),
      color: '#00B8A9',
    },
    {
      name: 'Full Adoption',
      value: calcAnnual({ ...inputs, activationRate: 100, adoptionRate: 95, targetUseCaseCount: 6, targetUserCount: 500 }),
      color: '#0F6E56',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-700 text-kpmg-on-surface">Scenario Value Comparison</h3>
        <span className="text-xs text-kpmg-outline font-body">Annualised return (£)</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#C4C6D4" strokeDasharray="3 3" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}