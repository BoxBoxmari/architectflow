import React from 'react';
import { TrendingUp, Layers, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import { AI_CASES } from '@/lib/mockData';

export default function OverviewKPIs() {
  const activeCases = AI_CASES?.filter(c => c?.status === 'Active' || c?.status === 'Scaled')?.length;
  const functionsCovered = new Set(AI_CASES.flatMap(c => c.linkedFunctions))?.size;
  const totalAnnualValue = AI_CASES?.reduce((sum, c) => sum + c?.numericMetrics?.annualizedReturn, 0);
  const avgAdoption = Math.round(AI_CASES?.reduce((sum, c) => sum + c?.numericMetrics?.adoptionRate, 0) / AI_CASES?.length);
  const pilotCases = AI_CASES?.filter(c => c?.status === 'Pilot' || c?.status === 'In Development')?.length;

  const kpis = [
    {
      id: 'kpi-active-cases',
      label: 'Active AI Cases',
      value: activeCases,
      suffix: '',
      subtext: `${pilotCases} in pilot or development`,
      icon: <Layers size={18} />,
      trend: '+2 this quarter',
      trendPositive: true,
      alert: false,
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
      trend: '+1 since Q1',
      trendPositive: true,
      alert: false,
      color: '#006397',
      bgColor: 'rgba(0, 99, 151, 0.06)',
    },
    {
      id: 'kpi-annual-value',
      label: 'Est. Annual Value',
      value: `£${(totalAnnualValue / 1000000)?.toFixed(1)}M`,
      suffix: '',
      subtext: 'Across active deployments',
      icon: <DollarSign size={18} />,
      trend: '+£0.8M vs Q1',
      trendPositive: true,
      alert: false,
      color: '#0F6E56',
      bgColor: 'rgba(15, 110, 86, 0.06)',
      isString: true,
    },
    {
      id: 'kpi-adoption',
      label: 'Adoption Index',
      value: avgAdoption,
      suffix: '%',
      subtext: 'Target: 70% by Q3 2026',
      icon: <TrendingUp size={18} />,
      trend: '−3pts vs target',
      trendPositive: false,
      alert: true,
      color: '#C84B5A',
      bgColor: 'rgba(200, 75, 90, 0.06)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis?.map((kpi) => (
        <div
          key={kpi?.id}
          className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200"
          style={{ borderTop: `3px solid ${kpi?.color}` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: kpi?.bgColor, color: kpi?.color }}
            >
              {kpi?.icon}
            </div>
            {kpi?.alert && (
              <AlertTriangle size={14} className="text-kpmg-accent-negative mt-0.5" />
            )}
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
            <span className={`text-xs font-semibold font-body ${kpi?.trendPositive ? 'text-kpmg-accent-positive' : 'text-kpmg-accent-negative'}`}>
              {kpi?.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}