import React from 'react';
import { AI_CASES, FUNCTIONS } from '@/lib/mockData';

export default function FunctionHeatmap() {
  // Derive heatmap data from the new case dataset
  const rows = FUNCTIONS.map(fn => {
    const fnCases = AI_CASES.filter(c => c.linkedFunctions.includes(fn.id));
    const annualValue = fnCases.reduce((s, c) => s + c.numericMetrics.annualizedReturn, 0);
    return {
      function: fn.name,
      fnId: fn.id,
      total: fnCases.length,
      annualValue,
      // Map status to rough maturity buckets for display
      experimental: fnCases.filter(c => c.maturityLevel === 'Experimental').length,
      emerging:     fnCases.filter(c => c.maturityLevel === 'Emerging').length,
      established:  fnCases.filter(c => c.maturityLevel === 'Established').length,
      mature:       fnCases.filter(c => c.maturityLevel === 'Mature').length,
    };
  });

  const MATURITY_LEVELS = ['Experimental', 'Emerging', 'Established', 'Mature'] as const;

  function getCellColor(count: number, maturity: string): string {
    if (count === 0) return '#F6F3F2';
    const colors: Record<string, string> = {
      Experimental: '#F59E0B',
      Emerging: '#3B82F6',
      Established: '#059669',
      Mature: '#00205F',
    };
    return colors[maturity] || '#F6F3F2';
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-base font-bold text-kpmg-on-surface">Portfolio Coverage Matrix</h2>
          <p className="text-xs text-kpmg-outline mt-0.5 font-body">AI cases by function and maturity level</p>
        </div>
        <div className="flex items-center gap-3">
          {MATURITY_LEVELS.map((m) => {
            const colorMap: Record<string, string> = {
              Experimental: '#F59E0B',
              Emerging: '#3B82F6',
              Established: '#059669',
              Mature: '#00205F',
            };
            return (
              <div key={`legend-${m}`} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colorMap[m] }} />
                <span className="text-xs text-kpmg-outline font-body">{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-4 w-36">
                <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Function</span>
              </th>
              {MATURITY_LEVELS.map((m) => (
                <th key={`th-${m}`} className="pb-3 px-2 text-center">
                  <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">{m}</span>
                </th>
              ))}
              <th className="pb-3 pl-4 text-right">
                <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Total</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const counts: Record<string, number> = {
                Experimental: row.experimental,
                Emerging: row.emerging,
                Established: row.established,
                Mature: row.mature,
              };
              return (
                <tr key={`heatmap-${row.function}`} className="group">
                  <td className="py-2 pr-4">
                    <div>
                      <p className="text-sm font-semibold text-kpmg-on-surface font-body">{row.function}</p>
                      <p className="text-xs text-kpmg-outline font-body">
                        £{(row.annualValue / 1000).toFixed(0)}k value
                      </p>
                    </div>
                  </td>
                  {MATURITY_LEVELS.map((m) => {
                    const count = counts[m];
                    return (
                      <td key={`cell-${row.function}-${m}`} className="px-2 py-2">
                        <div
                          className="w-full h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 cursor-default"
                          style={{
                            backgroundColor: getCellColor(count, m),
                            color: count > 0 ? '#FFFFFF' : '#C4C6D4',
                          }}
                        >
                          {count > 0 ? (
                            <>
                              <span className="font-display text-lg font-extrabold tabular-nums leading-none">{count}</span>
                              <span className="text-xs mt-0.5 opacity-80 font-body">{count === 1 ? 'case' : 'cases'}</span>
                            </>
                          ) : (
                            <span className="text-kpmg-outline-variant text-lg">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="pl-4 py-2 text-right">
                    <span className="font-display text-lg font-bold text-kpmg-primary tabular-nums">{row.total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-kpmg-outline-variant/30">
              <td className="pt-3 pr-4">
                <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Total</span>
              </td>
              {MATURITY_LEVELS.map((m) => {
                const total = rows.reduce((s, r) => {
                  const counts: Record<string, number> = {
                    Experimental: r.experimental,
                    Emerging: r.emerging,
                    Established: r.established,
                    Mature: r.mature,
                  };
                  return s + counts[m];
                }, 0);
                return (
                  <td key={`total-${m}`} className="pt-3 px-2 text-center">
                    <span className="font-display text-base font-bold text-kpmg-on-surface tabular-nums">{total}</span>
                  </td>
                );
              })}
              <td className="pt-3 pl-4 text-right">
                <span className="font-display text-base font-bold text-kpmg-primary tabular-nums">{AI_CASES.length}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}