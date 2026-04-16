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
import { calcScenarioVariants, type SimInputs } from '@/lib/simulator/calcOutputs';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-elevated border border-kpmg-outline-variant/40 dark:border-gray-700 p-3">
      <p className="text-xs font-semibold text-kpmg-on-surface-variant dark:text-gray-400 mb-1 font-body">{label}</p>
      <p className="font-display text-base font-bold text-kpmg-primary dark:text-blue-400 tabular-nums">
        ${(payload[0].value / 1000).toFixed(0)}k
      </p>
    </div>
  );
};

export default function SimulatorOutputChart({ inputs }: { inputs: SimInputs }) {
  const variants = calcScenarioVariants(inputs);

  const data = [
    {
      name: 'Current',
      value: variants.currentState.annualizedReturn,
      color: '#006397',
    },
    {
      name: '2× Scale',
      value: variants.scale2x.annualizedReturn,
      color: '#00B8A9',
    },
    {
      name: 'Full Adoption',
      value: variants.fullAdoption.annualizedReturn,
      color: '#0F6E56',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none dark:border dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-kpmg-on-surface dark:text-gray-100">Scenario Value Comparison</h3>
        <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body">Annualised return (USD)</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#C4C6D4" strokeDasharray="3 3" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
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