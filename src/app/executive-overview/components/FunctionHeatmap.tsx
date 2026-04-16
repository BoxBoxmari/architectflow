import React from 'react';
import { AI_CASES, FUNCTIONS } from '@/lib/mockData';

// Map each case to a simple reach-count per function — no fake maturity buckets
export default function FunctionHeatmap() {
  const rows = FUNCTIONS.map(fn => {
    const fnCases = AI_CASES.filter(c => c.linkedFunctions.includes(fn.id));
    return {
      function: fn.name,
      fnId: fn.id,
      color: fn.color,
      total: fnCases.length,
      cases: fnCases,
    };
  });

  const maxTotal = Math.max(...rows.map(r => r.total), 1);

  function getBarColor(fnId: string): string {
    const colorMap: Record<string, string> = {
      'fn-audit': '#006397',
      'fn-law': '#45004F',
      'fn-tax': '#00B8A9',
      'fn-deal': '#F39C12',
      'fn-consulting': '#0F6E56',
    };
    return colorMap[fnId] || '#00205F';
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none dark:border dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display text-base font-bold text-kpmg-on-surface dark:text-gray-100">AI Cases by Function</h2>
          <p className="text-xs text-kpmg-outline dark:text-gray-500 mt-0.5 font-body">Cases reaching each function — click Architecture Explorer to trace the full flow</p>
        </div>
        <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body italic">6 cases · 5 functions</span>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const barPct = (row.total / maxTotal) * 100;
          const barColor = getBarColor(row.fnId);
          return (
            <div key={`heatmap-${row.fnId}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="text-sm font-semibold text-kpmg-on-surface dark:text-gray-200 font-body">{row.function}</span>
                </div>
                <span className="font-display text-sm font-bold tabular-nums" style={{ color: barColor }}>
                  {row.total} {row.total === 1 ? 'case' : 'cases'}
                </span>
              </div>
              <div className="h-2 bg-kpmg-surface-container dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barPct}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {row.cases.map(c => (
                  <span
                    key={`chip-${c.id}`}
                    className="text-xs px-2 py-0.5 rounded-full font-body font-medium"
                    style={{ backgroundColor: `${barColor}12`, color: barColor }}
                  >
                    {c.code}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}