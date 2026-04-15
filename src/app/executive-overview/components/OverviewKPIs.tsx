import React from 'react';
import { Layers, Users, Zap, Network } from 'lucide-react';
import { AI_CASES } from '@/lib/mockData';

export default function OverviewKPIs() {
  const totalCases = AI_CASES?.length ?? 0;
  const functionsCovered = new Set(AI_CASES.flatMap(c => c.linkedFunctions))?.size ?? 0;
  const totalServices = new Set(AI_CASES.flatMap(c => c.linkedServices))?.size ?? 0;

  // Connections = total case→function links across the portfolio
  const totalConnections = AI_CASES?.reduce((sum, c) => sum + (c?.linkedFunctions?.length ?? 0), 0);

  const kpis = [
    {
      id: 'kpi-cases',
      label: 'AI Cases',
      value: totalCases,
      suffix: '',
      subtext: 'In the shared foundation',
      icon: <Layers size={18} />,
      note: 'Curated portfolio',
      color: '#00205F',
      bgColor: 'rgba(0, 32, 95, 0.06)',
    },
    {
      id: 'kpi-functions',
      label: 'Functions Reached',
      value: functionsCovered,
      suffix: ' of 5',
      subtext: 'Full cross-function coverage',
      icon: <Network size={18} />,
      note: 'Audit · Law · Tax · Deal · Consulting',
      color: '#006397',
      bgColor: 'rgba(0, 99, 151, 0.06)',
    },
    {
      id: 'kpi-services',
      label: 'Services Touched',
      value: totalServices,
      suffix: '',
      subtext: 'Across all five functions',
      icon: <Zap size={18} />,
      note: 'From 12 in the service map',
      color: '#0F6E56',
      bgColor: 'rgba(15, 110, 86, 0.06)',
    },
    {
      id: 'kpi-connections',
      label: 'Case Connections',
      value: totalConnections,
      suffix: '',
      subtext: 'Case → function links',
      icon: <Users size={18} />,
      note: 'Avg. ~4 functions per case',
      color: '#006397',
      bgColor: 'rgba(0, 99, 151, 0.06)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis?.map((kpi) => (
        <div
          key={kpi?.id}
          className="bg-white rounded-xl p-5 shadow-card"
          style={{ borderTop: `3px solid ${kpi?.color}` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: kpi?.bgColor, color: kpi?.color }}
            >
              {kpi?.icon}
            </div>
          </div>
          <div className="tabular-nums">
            <p className="font-display text-2xl font-extrabold leading-none mb-1" style={{ color: kpi?.color }}>
              {kpi?.value}
              <span className="text-base font-semibold">{kpi?.suffix}</span>
            </p>
          </div>
          <p
            className="text-xs font-semibold text-kpmg-on-surface-variant tracking-wide uppercase mb-1 font-body"
            style={{ fontSize: '10px', letterSpacing: '0.06em' }}
          >
            {kpi?.label}
          </p>
          <p className="text-xs text-kpmg-outline font-body">{kpi?.subtext}</p>
          <div className="mt-3 pt-3 border-t border-kpmg-outline-variant/30">
            <span className="text-xs text-kpmg-outline font-body italic">{kpi?.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}