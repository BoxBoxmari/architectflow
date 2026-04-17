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

function fmtExecShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,32,95,0.12)', border: 'none' }}
    >
      <p
        className="uppercase font-bold mb-1"
        style={{ fontSize: '10px', letterSpacing: '0.06em', color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </p>
      <p
        className="tabular-nums font-bold"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#00205F', letterSpacing: '-0.01em' }}
      >
        {fmtExecShort(payload[0].value)}
      </p>
      <p style={{ fontSize: '11px', color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}>Annualised Return</p>
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
    <div className="rounded-2xl p-5" style={{ background: '#FFFFFF' }}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-bold"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#00205F' }}
        >
          Scenario Value Comparison
        </h3>
        <span
          className="uppercase font-bold"
          style={{ fontSize: '9px', letterSpacing: '0.07em', color: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}
        >
          ANNUALISED RETURN
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#EBE7E7" strokeDasharray="3 3" strokeOpacity={0.8} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#9E9E9E', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9E9E9E', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => fmtExecShort(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,32,95,0.04)' }} />
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