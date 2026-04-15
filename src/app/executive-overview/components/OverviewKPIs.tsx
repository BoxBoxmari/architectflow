import React from 'react';
import { TrendingUp, Layers, DollarSign, Zap } from 'lucide-react';
import { AI_CASES } from '@/lib/mockData';

export default function OverviewKPIs() {
  const activeCases = AI_CASES?.filter(c => c?.status === 'Active' || c?.status === 'Scaled')?.length ?? 0;
  const functionsCovered = new Set(AI_CASES.flatMap(c => c.linkedFunctions))?.size ?? 0;
  const totalAnnualValue = AI_CASES?.reduce((sum, c) => sum + (c?.numericMetrics?.annualizedReturn ?? 0), 0);
  const avgAdoption = Math.round(
    AI_CASES?.reduce((sum, c) => sum + (c?.numericMetrics?.adoptionRate ?? 0), 0) / Math.max(AI_CASES?.length, 1)
  );

  const kpis = [
    {
      id: 'kpi-active-cases',
      label: 'Active AI Cases',
      value: activeCases,
      suffix: '',
      subtext: `${AI_CASES?.length} total in portfolio`,
      icon: <Layers size={18} />,
      note: 'Active or scaled',
      color: '#00205F',
      bgColor: 'rgba(0, 32, 95, 0.06)',
    },
    {
      id: 'kpi-functions',
      label: 'Functions Covered',
      value: functionsCovered,
      suffix: ' of 5',
      subtext: 'Full portfolio coverage',
      icon: <Zap size={18} />,
      note: 'Cross-functional reach',
      color: '#006397',
      bgColor: 'rgba(0, 99, 151, 0.06)',
    },
    {
      id: 'kpi-annual-value',
      label: 'Est. Annual Value',
      value: `£${(totalAnnualValue / 1000000)?.toFixed(1)}M`,
      suffix: '',
      subtext: 'Scenario-based estimate',
      icon: <DollarSign size={18} />,
      note: 'Illustrative, not audited',
      color: '#0F6E56',
      bgColor: 'rgba(15, 110, 86, 0.06)',
      isString: true,
    },
    {
      id: 'kpi-adoption',
      label: 'Avg Adoption Index',
      value: avgAdoption,
      suffix: '%',
      subtext: 'Across active deployments',
      icon: <TrendingUp size={18} />,
      note: 'Sample portfolio average',
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
            {kpi?.isString ? (
              <p className="font-display text-2xl font-extrabold text-kpmg-on-surface leading-none mb-1" style={{ color: kpi?.color }}>
                {kpi?.value}
              </p>
            ) : (
              <p className="font-display text-2xl font-extrabold leading-none mb-1" style={{ color: kpi?.color }}>
                {kpi?.value}<span className="text-base font-semibold">{kpi?.suffix}</span>
              </p>
            )}
          </div>
          <p className="text-xs font-semibold text-kpmg-on-surface-variant tracking-wide uppercase mb-1 font-body" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
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