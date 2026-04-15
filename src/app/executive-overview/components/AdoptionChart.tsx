'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';

const ADOPTION_DATA = [
  { month: 'Oct 25', audit: 18, tax: 42, law: 5, deal: 10, consulting: 28 },
  { month: 'Nov 25', audit: 22, tax: 51, law: 8, deal: 14, consulting: 34 },
  { month: 'Dec 25', audit: 25, tax: 58, law: 9, deal: 17, consulting: 39 },
  { month: 'Jan 26', audit: 31, tax: 67, law: 14, deal: 22, consulting: 45 },
  { month: 'Feb 26', audit: 38, tax: 74, law: 19, deal: 27, consulting: 52 },
  { month: 'Mar 26', audit: 41, tax: 82, law: 23, deal: 31, consulting: 58 },
  { month: 'Apr 26', audit: 41, tax: 89, law: 27, deal: 28, consulting: 62 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-elevated border border-kpmg-outline-variant/40 p-3 min-w-36">
      <p className="text-xs font-semibold text-kpmg-on-surface-variant mb-2 font-body">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-kpmg-on-surface-variant font-body">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-kpmg-on-surface tabular-nums font-body">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function AdoptionChart() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-base font-bold text-kpmg-on-surface">Adoption Trajectory</h2>
          <p className="text-xs text-kpmg-outline mt-0.5 font-body">Illustrative monthly adoption by function (Oct 2025 – Apr 2026)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={ADOPTION_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-audit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006397" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#006397" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-tax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B8A9" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00B8A9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-law" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#45004F" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#45004F" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-deal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F39C12" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#F39C12" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-consulting" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#C4C6D4" strokeDasharray="3 3" strokeOpacity={0.4} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#747683', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="tax" name="Tax" stroke="#00B8A9" strokeWidth={2} fill="url(#grad-tax)" />
          <Area type="monotone" dataKey="consulting" name="Consulting" stroke="#0F6E56" strokeWidth={2} fill="url(#grad-consulting)" />
          <Area type="monotone" dataKey="audit" name="Audit" stroke="#006397" strokeWidth={2} fill="url(#grad-audit)" />
          <Area type="monotone" dataKey="deal" name="Deal Advisory" stroke="#F39C12" strokeWidth={2} fill="url(#grad-deal)" />
          <Area type="monotone" dataKey="law" name="KPMG Law" stroke="#45004F" strokeWidth={2} fill="url(#grad-law)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}