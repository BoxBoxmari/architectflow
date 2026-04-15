import React from 'react';
import Link from 'next/link';
import { AI_CASES } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Concept: { bg: '#F0EDEC', text: '#747683' },
  'In Development': { bg: '#FEF3C7', text: '#92400E' },
  Pilot: { bg: '#DBEAFE', text: '#1E40AF' },
  Active: { bg: '#D1FAE5', text: '#065F46' },
  Scaled: { bg: '#E0E7FF', text: '#00205F' },
};

export default function PriorityInitiatives() {
  const sorted = [...AI_CASES].sort((a, b) => b.valueScore - a.valueScore);

  return (
    <div className="bg-white rounded-xl shadow-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-base font-700 text-kpmg-on-surface">Priority Initiatives</h2>
          <p className="text-xs text-kpmg-outline mt-0.5 font-body">Ranked by value score</p>
        </div>
        <Link href="/case-library">
          <span className="text-xs font-semibold text-kpmg-secondary hover:text-kpmg-primary transition-colors font-body cursor-pointer">
            View all
          </span>
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {sorted.map((c, idx) => {
          const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
          return (
            <Link key={`priority-${c.id}`} href="/case-detail">
              <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-kpmg-surface-container-low transition-all duration-150 cursor-pointer">
                <span className="font-display text-lg font-800 text-kpmg-outline-variant tabular-nums w-6 text-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                    <span
                      className="kpmg-badge text-xs"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-kpmg-on-surface truncate font-body">{c.title}</p>
                  <p className="text-xs text-kpmg-outline font-body mt-0.5">
                    £{(c.metrics.annualizedReturn / 1000).toFixed(0)}k pa · {c.metrics.adoptionRate}% adoption
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-16 bg-kpmg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.valueScore}%`,
                          backgroundColor: c.valueScore >= 80 ? '#0F6E56' : c.valueScore >= 60 ? '#006397' : '#F39C12',
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-kpmg-on-surface-variant tabular-nums font-body">{c.valueScore}</span>
                  </div>
                  <ArrowRight size={12} className="text-kpmg-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}