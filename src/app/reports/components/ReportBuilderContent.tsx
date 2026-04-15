'use client';
import React, { useState } from 'react';
import { AI_CASES } from '@/lib/mockData';
import { calcScenarioVariants, SIM_DEFAULTS, SIM_CONSTANTS } from '@/lib/simulator/calcOutputs';
import { DEMO_CONTEXT } from '@/lib/config/demoContext';
import { toast } from 'sonner';
import { Download, Share2, Eye, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, FileText, CheckCircle2, Shield, Layers } from 'lucide-react';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  included: boolean;
  order: number;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'sec-exec',        title: 'Executive Summary',        description: 'Portfolio health overview and key findings for Partner review',                    included: true,  order: 1 },
  { id: 'sec-portfolio',   title: 'AI Portfolio Overview',    description: 'Active cases, functions covered, and maturity distribution',                       included: true,  order: 2 },
  { id: 'sec-cases',       title: 'Priority Case Profiles',   description: 'Deep-dive on selected high-value AI cases',                                        included: true,  order: 3 },
  { id: 'sec-simulator',   title: 'Value Simulation Results', description: 'ROI modelling outputs and scenario analysis',                                       included: true,  order: 4 },
  { id: 'sec-comparison',  title: 'Scenario Comparison',      description: 'Side-by-side comparison of Current State, 2X Scale-Up, and Full Adoption',         included: true,  order: 5 },
  { id: 'sec-architecture',title: 'Architecture Overview',    description: 'AI Case to Function to Service relationship map',                                   included: false, order: 6 },
  { id: 'sec-governance',  title: 'Governance & Risk Notes',  description: 'Compliance status and review history for included cases',                           included: false, order: 7 },
  { id: 'sec-pilot',       title: 'Pilot Recommendations',    description: 'Suggested next steps and pilot request summary',                                    included: true,  order: 8 },
];

const SCENARIO_OPTIONS = [
  { id: 'current', label: 'Current State' },
  { id: 'scale2x', label: '2X Scale-Up' },
  { id: 'full',    label: 'Full Adoption' },
] as const;

export default function ReportBuilderContent() {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [selectedCases, setSelectedCases] = useState<string[]>(['TAX-001', 'TAX-002', 'LAW-001']);
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'scale2x' | 'full'>('scale2x');
  const [reportTitle, setReportTitle] = useState(DEMO_CONTEXT.defaults.reportTitle);
  const [exporting, setExporting] = useState(false);

  function toggleSection(id: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, included: !s.included } : s));
  }

  function moveSection(id: string, dir: 'up' | 'down') {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === sorted.length - 1) return prev;
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      const newSorted = [...sorted];
      const temp = newSorted[idx].order;
      newSorted[idx] = { ...newSorted[idx], order: newSorted[swapIdx].order };
      newSorted[swapIdx] = { ...newSorted[swapIdx], order: temp };
      return newSorted;
    });
  }

  function toggleCase(id: string) {
    setSelectedCases(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  // ─── Computed data ────────────────────────────────────────────────────────
  const variants = calcScenarioVariants(SIM_DEFAULTS);
  const scenarioOutputs =
    selectedScenario === 'current' ? variants.currentState.outputs :
    selectedScenario === 'scale2x' ? variants.scale2x.outputs :
    variants.fullAdoption.outputs;
  const scenarioLabel =
    selectedScenario === 'current' ? 'Current State' :
    selectedScenario === 'scale2x' ? '2× Scale-Up' : 'Full Adoption';

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const includedSections = sortedSections.filter(s => s.included);
  const selectedCaseObjects = AI_CASES.filter(c => selectedCases.includes(c.id));

  const totalAnnualizedReturn = selectedCaseObjects.reduce((sum, c) => sum + c.numericMetrics.annualizedReturn, 0);
  const totalHoursRecovered = selectedCaseObjects.reduce((sum, c) => sum + c.numericMetrics.hoursRecoveredPerMonth, 0);
  const scaledCases = AI_CASES.filter(c => c.status === 'Scaled');
  const activeCases = AI_CASES.filter(c => ['Active', 'Scaled'].includes(c.status));
  const uniqueFunctions = new Set(AI_CASES.flatMap(c => c.linkedFunctions)).size;

  // ─── Scenario comparison data for preview ────────────────────────────────
  const cs = variants.currentState.outputs;
  const s2 = variants.scale2x.outputs;
  const fa = variants.fullAdoption.outputs;

  // ─── PDF Export ───────────────────────────────────────────────────────────
  function handleExport() {
    setExporting(true);

    const allVariants = calcScenarioVariants(SIM_DEFAULTS);
    const exportOutputs =
      selectedScenario === 'current' ? allVariants.currentState.outputs :
      selectedScenario === 'scale2x' ? allVariants.scale2x.outputs :
      allVariants.fullAdoption.outputs;

    const exportSortedSections = [...sections].sort((a, b) => a.order - b.order).filter(s => s.included);
    const exportCaseObjects = AI_CASES.filter(c => selectedCases.includes(c.id));
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const exportTotalAnnualized = exportCaseObjects.reduce((sum, c) => sum + c.numericMetrics.annualizedReturn, 0);
    const exportTotalHours = exportCaseObjects.reduce((sum, c) => sum + c.numericMetrics.hoursRecoveredPerMonth, 0);
    const exportTotalFTEs = exportCaseObjects.reduce((sum, c) => sum + c.numericMetrics.ftesFreed, 0);
    const exportActiveCases = AI_CASES.filter(c => ['Active', 'Scaled'].includes(c.status));
    const exportScaledCases = AI_CASES.filter(c => c.status === 'Scaled');

    const sectionHTML = exportSortedSections.map((section, idx) => {
      let content = '';

      if (section.id === 'sec-exec') {
        content = `
          <p style="margin-bottom:10px;">This report summarises the ${DEMO_CONTEXT.firm.name} AI portfolio status as of ${DEMO_CONTEXT.firm.reportingPeriod}. The portfolio comprises <strong>${AI_CASES.length} AI cases</strong> across <strong>${uniqueFunctions} functions</strong>, with <strong>${exportActiveCases.length} cases</strong> at Active or Scaled status.</p>
          <p style="margin-bottom:10px;">${exportScaledCases.map(c => `${c.code} ${c.title}`).join(', ')} ${exportScaledCases.length === 1 ? 'has' : 'have'} achieved Scaled status. The selected ${exportCaseObjects.length} case${exportCaseObjects.length !== 1 ? 's' : ''} in this report represent a combined annualised return of <strong>£${(exportTotalAnnualized / 1000000).toFixed(2)}M</strong> and <strong>${Math.round(exportTotalHours).toLocaleString()} hours recovered per month</strong>.</p>
          <p>Under the <strong>${scenarioLabel}</strong> scenario, the simulator projects an annualised return of <strong>£${(exportOutputs.annualizedReturn / 1000000).toFixed(2)}M</strong> with <strong>${exportOutputs.activeUsers} active users</strong> across <strong>${exportOutputs.activeUseCases} active use cases</strong>.</p>
          <table style="margin-top:12px;">
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Portfolio Cases</td><td>${AI_CASES.length}</td></tr>
            <tr><td>Functions Covered</td><td>${uniqueFunctions}</td></tr>
            <tr><td>Active / Scaled Cases</td><td>${exportActiveCases.length}</td></tr>
            <tr><td>Selected Cases (This Report)</td><td>${exportCaseObjects.length}</td></tr>
            <tr><td>Combined Annualised Return (Selected)</td><td>£${(exportTotalAnnualized / 1000000).toFixed(2)}M</td></tr>
            <tr><td>Hours Recovered / Month (Selected)</td><td>${Math.round(exportTotalHours).toLocaleString()} hrs</td></tr>
            <tr><td>FTEs Freed / Month (Selected)</td><td>${exportTotalFTEs.toFixed(1)}</td></tr>
          </table>`;
      } else if (section.id === 'sec-portfolio') {
        const maturityCounts: Record<string, number> = {};
        AI_CASES.forEach(c => { maturityCounts[c.maturityLevel] = (maturityCounts[c.maturityLevel] || 0) + 1; });
        content = `
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Cases</td><td>${AI_CASES.length}</td></tr>
            <tr><td>Functions Covered</td><td>${uniqueFunctions}</td></tr>
            <tr><td>Active / Scaled</td><td>${exportActiveCases.length}</td></tr>
            <tr><td>In Pilot</td><td>${AI_CASES.filter(c => c.status === 'Pilot').length}</td></tr>
            <tr><td>In Development</td><td>${AI_CASES.filter(c => c.status === 'In Development').length}</td></tr>
            <tr><td>Concept Stage</td><td>${AI_CASES.filter(c => c.status === 'Concept').length}</td></tr>
          </table>
          <p style="margin-top:10px;font-weight:bold;font-size:12px;">Maturity Distribution</p>
          <table>
            <tr><th>Maturity Level</th><th>Count</th></tr>
            ${Object.entries(maturityCounts).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
          </table>`;
      } else if (section.id === 'sec-cases') {
        content = exportCaseObjects.map(c => `
          <div style="margin-bottom:16px;padding:12px;background:#f8f8f8;border-radius:6px;border-left:3px solid #006397;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <strong style="font-size:13px;">${c.code} — ${c.title}</strong>
              <span style="font-size:10px;background:#e0e7ff;color:#00205F;padding:2px 6px;border-radius:3px;">${c.status}</span>
            </div>
            <p style="color:#555;font-size:11px;margin-bottom:6px;">${c.source} · ${c.tech} · Maturity: ${c.maturityLevel}</p>
            <p style="font-size:12px;margin-bottom:8px;">${c.executiveSummary}</p>
            <p style="font-size:11px;font-style:italic;color:#006397;margin-bottom:8px;">"${c.partnerInsight}"</p>
            <table style="margin-bottom:0;">
              <tr><th>Metric</th><th>Value</th></tr>
              <tr><td>Annualised Return</td><td>£${(c.numericMetrics.annualizedReturn / 1000000).toFixed(2)}M</td></tr>
              <tr><td>Hours Recovered / Month</td><td>${c.numericMetrics.hoursRecoveredPerMonth.toLocaleString()} hrs</td></tr>
              <tr><td>FTEs Freed / Month</td><td>${c.numericMetrics.ftesFreed.toFixed(1)}</td></tr>
              <tr><td>Adoption Rate</td><td>${c.numericMetrics.adoptionRate}%</td></tr>
              <tr><td>Value Score</td><td>${c.valueScore}/100</td></tr>
              <tr><td>Readiness Score</td><td>${c.readinessScore}/100</td></tr>
              <tr><td>Reusability Score</td><td>${c.reusabilityScore}/100</td></tr>
            </table>
            <p style="margin-top:8px;font-size:11px;"><strong>Key Metrics:</strong> ${c.metrics.join(' · ')}</p>
          </div>`).join('');
      } else if (section.id === 'sec-simulator') {
        content = `
          <p style="margin-bottom:10px;">Scenario: <strong>${scenarioLabel}</strong> — based on simulator assumptions below.</p>
          <table>
            <tr><th>Output Metric</th><th>${scenarioLabel}</th></tr>
            <tr><td>Annualised Return</td><td>£${(exportOutputs.annualizedReturn / 1000000).toFixed(2)}M</td></tr>
            <tr><td>Monthly Cost Savings</td><td>£${Math.round(exportOutputs.monthlyCostSavings).toLocaleString()}</td></tr>
            <tr><td>Hours Recovered / Month</td><td>${Math.round(exportOutputs.hoursPerMonth).toLocaleString()} hrs</td></tr>
            <tr><td>FTEs Freed / Month</td><td>${exportOutputs.ftesFreed.toFixed(1)}</td></tr>
            <tr><td>Active Users</td><td>${exportOutputs.activeUsers}</td></tr>
            <tr><td>Active Use Cases</td><td>${exportOutputs.activeUseCases}</td></tr>
            <tr><td>Tasks / Month</td><td>${exportOutputs.tasksPerMonth.toLocaleString()}</td></tr>
            <tr><td>Daily Interactions</td><td>${exportOutputs.dailyInteractions.toLocaleString()}</td></tr>
            <tr><td>Value / User / Month</td><td>£${Math.round(exportOutputs.valuePerUserPerMonth).toLocaleString()}</td></tr>
          </table>
          <p style="margin-top:12px;font-weight:bold;font-size:12px;">Simulator Assumptions</p>
          <table>
            <tr><th>Assumption</th><th>Value</th></tr>
            <tr><td>Target Use Case Count</td><td>${SIM_DEFAULTS.targetUseCaseCount}</td></tr>
            <tr><td>Activation Rate</td><td>${SIM_DEFAULTS.activationRate}%</td></tr>
            <tr><td>Target User Count</td><td>${SIM_DEFAULTS.targetUserCount}</td></tr>
            <tr><td>Adoption Rate</td><td>${SIM_DEFAULTS.adoptionRate}%</td></tr>
            <tr><td>Tasks / User / Use Case / Month</td><td>${SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth}</td></tr>
            <tr><td>Avg Time Saved / Task</td><td>${SIM_DEFAULTS.avgTimeSavedMinutes} min</td></tr>
            <tr><td>Blended Hourly Cost Rate</td><td>£${SIM_CONSTANTS.HOURLY_COST}/hr</td></tr>
          </table>`;
      } else if (section.id === 'sec-comparison') {
        const cso = allVariants.currentState.outputs;
        const s2o = allVariants.scale2x.outputs;
        const fao = allVariants.fullAdoption.outputs;
        content = `
          <table>
            <tr><th>Metric</th><th>Current State</th><th>2× Scale-Up</th><th>Full Adoption</th></tr>
            <tr><td>Annualised Return</td><td>£${(cso.annualizedReturn / 1000000).toFixed(2)}M</td><td>£${(s2o.annualizedReturn / 1000000).toFixed(2)}M</td><td>£${(fao.annualizedReturn / 1000000).toFixed(2)}M</td></tr>
            <tr><td>Monthly Cost Savings</td><td>£${Math.round(cso.monthlyCostSavings).toLocaleString()}</td><td>£${Math.round(s2o.monthlyCostSavings).toLocaleString()}</td><td>£${Math.round(fao.monthlyCostSavings).toLocaleString()}</td></tr>
            <tr><td>Hours Recovered / Month</td><td>${Math.round(cso.hoursPerMonth).toLocaleString()}</td><td>${Math.round(s2o.hoursPerMonth).toLocaleString()}</td><td>${Math.round(fao.hoursPerMonth).toLocaleString()}</td></tr>
            <tr><td>FTEs Freed / Month</td><td>${cso.ftesFreed.toFixed(1)}</td><td>${s2o.ftesFreed.toFixed(1)}</td><td>${fao.ftesFreed.toFixed(1)}</td></tr>
            <tr><td>Active Users</td><td>${cso.activeUsers}</td><td>${s2o.activeUsers}</td><td>${fao.activeUsers}</td></tr>
            <tr><td>Active Use Cases</td><td>${cso.activeUseCases}</td><td>${s2o.activeUseCases}</td><td>${fao.activeUseCases}</td></tr>
            <tr><td>Tasks / Month</td><td>${cso.tasksPerMonth.toLocaleString()}</td><td>${s2o.tasksPerMonth.toLocaleString()}</td><td>${fao.tasksPerMonth.toLocaleString()}</td></tr>
            <tr><td>Daily Interactions</td><td>${cso.dailyInteractions}</td><td>${s2o.dailyInteractions}</td><td>${fao.dailyInteractions}</td></tr>
          </table>`;
      } else if (section.id === 'sec-architecture') {
        content = `
          <p style="margin-bottom:10px;">The following AI cases are included in this report and their architecture lineage:</p>
          ${exportCaseObjects.map(c => `
            <div style="margin-bottom:10px;padding:8px;background:#f8f8f8;border-radius:4px;">
              <strong>${c.code} — ${c.title}</strong> (${c.aiTechnique})<br/>
              <span style="font-size:11px;color:#666;">${c.architectureLineage}</span>
            </div>`).join('')}`;
      } else if (section.id === 'sec-governance') {
        content = exportCaseObjects.map(c => `
          <div style="margin-bottom:12px;padding:10px;background:#f8f8f8;border-radius:6px;">
            <strong>${c.code} — ${c.title}</strong>
            <p style="font-size:12px;margin-top:4px;color:#444;">${c.governanceNotes}</p>
          </div>`).join('');
      } else if (section.id === 'sec-pilot') {
        const topCase = [...exportCaseObjects].sort((a, b) => b.valueScore - a.valueScore)[0];
        const primaryFunctions = [...new Set(exportCaseObjects.flatMap(c => c.linkedFunctions))].slice(0, 3);
        content = `
          <p style="margin-bottom:10px;">Based on the <strong>${scenarioLabel}</strong> scenario analysis and the selected case portfolio, the following pilot pathway is recommended:</p>
          <table>
            <tr><th>Recommendation</th><th>Detail</th></tr>
            <tr><td>Lead Case</td><td>${topCase ? `${topCase.code} — ${topCase.title} (Value Score: ${topCase.valueScore}/100)` : 'TBD'}</td></tr>
            <tr><td>Target Scenario</td><td>${scenarioLabel}</td></tr>
            <tr><td>Projected Annualised Return</td><td>£${(exportOutputs.annualizedReturn / 1000000).toFixed(2)}M</td></tr>
            <tr><td>Target Active Users</td><td>${exportOutputs.activeUsers}</td></tr>
            <tr><td>Target Active Use Cases</td><td>${exportOutputs.activeUseCases}</td></tr>
            <tr><td>Primary Functions</td><td>${primaryFunctions.join(', ')}</td></tr>
            <tr><td>Estimated Pilot Duration</td><td>90 days</td></tr>
          </table>
          <p style="margin-top:10px;">Initiate a formal pilot request via the ArchitectFlow Pilot Request module. The selected cases are ready for activation cohort assignment.</p>`;
      } else {
        content = `<p style="color:#666;font-size:12px;font-style:italic;">${section.description}</p>`;
      }

      return `<div style="margin-bottom:24px;">
        <h2 style="color:#006397;font-size:14px;border-bottom:1px solid #e0e0e0;padding-bottom:4px;margin-bottom:10px;">
          <span style="color:#999;margin-right:8px;">0${idx + 1}</span>${section.title}
        </h2>
        ${content}
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${reportTitle}</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 40px; font-size: 13px; line-height: 1.5; }
  h1 { color: #00205F; font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #00205F; color: white; padding: 7px 10px; text-align: left; font-size: 12px; }
  td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  tr:nth-child(even) td { background: #f8f8f8; }
  .footer { margin-top: 32px; font-size: 11px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 12px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>${reportTitle}</h1>
<div class="subtitle">Prepared by ${DEMO_CONTEXT.user.name}, ${DEMO_CONTEXT.user.role} · ${dateStr} · CONFIDENTIAL — Internal Use Only</div>
${sectionHTML}
<div class="footer">© 2026 ${DEMO_CONTEXT.firm.name} International. All rights reserved. · ArchitectFlow ${DEMO_CONTEXT.firm.product}</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    setExporting(false);
    if (!win) {
      toast.error('Pop-up blocked', { description: 'Please allow pop-ups to export PDF' });
    } else {
      toast.success('PDF ready', { description: 'Print dialog opened — save as PDF' });
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard', { description: url });
    }).catch(() => {
      toast.error('Could not copy link');
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Builder controls */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-5">
        {/* Report title */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>
            Report Title
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={e => setReportTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body text-kpmg-on-surface"
          />
        </div>

        {/* Sections */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-4">Report Sections</h3>
          <div className="space-y-2">
            {sortedSections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 ${
                  section.included ? 'border-kpmg-outline-variant/40 bg-kpmg-surface-container-low' : 'border-transparent bg-kpmg-surface-container opacity-60'
                }`}
              >
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} className="p-0.5 rounded hover:bg-kpmg-surface-container-high transition-colors disabled:opacity-30" aria-label="Move section up">
                    <ChevronUp size={12} className="text-kpmg-outline" />
                  </button>
                  <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sortedSections.length - 1} className="p-0.5 rounded hover:bg-kpmg-surface-container-high transition-colors disabled:opacity-30" aria-label="Move section down">
                    <ChevronDown size={12} className="text-kpmg-outline" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-kpmg-on-surface font-body truncate">{section.title}</p>
                  <p className="text-xs text-kpmg-outline font-body truncate">{section.description}</p>
                </div>
                <button onClick={() => toggleSection(section.id)} className="flex-shrink-0 transition-colors" aria-label={section.included ? 'Exclude section' : 'Include section'}>
                  {section.included
                    ? <ToggleRight size={20} className="text-kpmg-primary" />
                    : <ToggleLeft size={20} className="text-kpmg-outline" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Case selection */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-4">Include Cases</h3>
          <div className="space-y-2">
            {AI_CASES.map(c => (
              <label key={`report-case-${c.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-kpmg-surface-container-low cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCases.includes(c.id)}
                  onChange={() => toggleCase(c.id)}
                  className="w-4 h-4 rounded border-kpmg-outline-variant accent-kpmg-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-kpmg-outline font-body">{c.code}</span>
                    <span
                      className="kpmg-badge text-xs"
                      style={{
                        backgroundColor: c.status === 'Scaled' ? '#E0E7FF' : c.status === 'Active' ? '#D1FAE5' : '#F0EDEC',
                        color: c.status === 'Scaled' ? '#00205F' : c.status === 'Active' ? '#065F46' : '#747683',
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-kpmg-on-surface font-body truncate">{c.title}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Scenario selection */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-3">Include Scenario</h3>
          <div className="space-y-2">
            {SCENARIO_OPTIONS.map(s => (
              <label key={`report-scen-${s.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-kpmg-surface-container-low cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="scenario"
                  value={s.id}
                  checked={selectedScenario === s.id}
                  onChange={() => setSelectedScenario(s.id as typeof selectedScenario)}
                  className="w-4 h-4 accent-kpmg-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-kpmg-on-surface font-body">{s.label}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export actions */}
        <div className="space-y-2">
          <button onClick={handleExport} disabled={exporting} className="kpmg-btn-primary w-full justify-center text-sm disabled:opacity-70">
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={14} />
                Export as PDF
              </>
            )}
          </button>
          <button onClick={handleShare} className="kpmg-btn-secondary w-full justify-center text-sm">
            <Share2 size={14} />
            Copy Share Link
          </button>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="bg-white rounded-xl shadow-card overflow-hidden sticky top-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-kpmg-outline-variant/30 bg-kpmg-surface-container-low">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-kpmg-outline" />
              <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">Live Preview</span>
            </div>
            <span className="text-xs text-kpmg-outline font-body">{includedSections.length} sections · {selectedCaseObjects.length} cases · {scenarioLabel}</span>
          </div>

          {/* Report preview */}
          <div className="p-8 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
            {/* KPMG header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-kpmg-primary">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-kpmg-primary flex items-center justify-center">
                    <span className="text-white font-display text-xs font-extrabold">K</span>
                  </div>
                  <span className="font-display text-sm font-bold text-kpmg-primary tracking-tight">KPMG</span>
                </div>
                <h1 className="font-display text-xl font-extrabold text-kpmg-on-surface leading-tight mb-1">{reportTitle}</h1>
                <p className="text-xs text-kpmg-outline font-body">Prepared by {DEMO_CONTEXT.user.name}, {DEMO_CONTEXT.user.role} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-kpmg-outline font-body">CONFIDENTIAL — Internal Use Only</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-kpmg-outline font-body mb-1">Classification</p>
                <span className="kpmg-badge bg-kpmg-primary/10 text-kpmg-primary">Internal</span>
              </div>
            </div>

            {/* Sections preview */}
            {includedSections.map((section, idx) => (
              <div key={`preview-${section.id}`} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-display text-xs font-bold text-kpmg-outline tabular-nums">0{idx + 1}</span>
                  <h2 className="font-display text-base font-bold text-kpmg-on-surface">{section.title}</h2>
                </div>

                {/* Executive Summary */}
                {section.id === 'sec-exec' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-kpmg-surface-container-low">
                      <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">
                        This report summarises the {DEMO_CONTEXT.firm.name} AI portfolio status as of {DEMO_CONTEXT.firm.reportingPeriod}. The portfolio comprises{' '}
                        <strong>{AI_CASES.length} AI cases</strong> across <strong>{uniqueFunctions} functions</strong>, with{' '}
                        <strong>{activeCases.length} cases</strong> at Active or Scaled status.{' '}
                        {scaledCases.length > 0 && (
                          <span>{scaledCases.map(c => `${c.code} ${c.title}`).join(', ')} {scaledCases.length === 1 ? 'has' : 'have'} achieved Scaled status.</span>
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Portfolio Cases', value: `${AI_CASES.length}` },
                        { label: 'Selected Cases', value: `${selectedCaseObjects.length}` },
                        { label: 'Combined Return', value: `£${(totalAnnualizedReturn / 1000000).toFixed(1)}M` },
                        { label: 'Hrs Recovered / Mo', value: `${Math.round(totalHoursRecovered).toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg bg-kpmg-primary/5 text-center">
                          <p className="font-display text-base font-extrabold text-kpmg-primary tabular-nums">{value}</p>
                          <p className="text-xs text-kpmg-outline font-body">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-kpmg-surface-container border border-kpmg-outline-variant/20">
                      <p className="text-xs font-semibold text-kpmg-outline font-body mb-1 uppercase tracking-wider">Scenario: {scenarioLabel}</p>
                      <p className="text-sm text-kpmg-on-surface-variant font-body">
                        Annualised return <strong>£${(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M</strong> · {scenarioOutputs.activeUsers} active users · {scenarioOutputs.activeUseCases} active use cases · {scenarioOutputs.ftesFreed.toFixed(1)} FTEs freed/month
                      </p>
                    </div>
                  </div>
                )}

                {/* Portfolio Overview */}
                {section.id === 'sec-portfolio' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total Cases', value: `${AI_CASES.length}` },
                        { label: 'Functions', value: `${uniqueFunctions}` },
                        { label: 'Active / Scaled', value: `${activeCases.length}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg bg-kpmg-primary/5 text-center">
                          <p className="font-display text-lg font-extrabold text-kpmg-primary tabular-nums">{value}</p>
                          <p className="text-xs text-kpmg-outline font-body">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Pilot', 'In Development', 'Concept'] as const).map(status => (
                        <div key={status} className="p-2 rounded-lg bg-kpmg-surface-container text-center">
                          <p className="font-display text-sm font-bold text-kpmg-on-surface tabular-nums">{AI_CASES.filter(c => c.status === status).length}</p>
                          <p className="text-xs text-kpmg-outline font-body">{status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Profiles — real executiveSummary, partnerInsight, numericMetrics */}
                {section.id === 'sec-cases' && selectedCaseObjects.length > 0 && (
                  <div className="space-y-3">
                    {selectedCaseObjects.map(c => (
                      <div key={`prev-case-${c.id}`} className="p-4 rounded-lg bg-kpmg-surface-container-low border-l-2 border-kpmg-primary">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-xs font-semibold text-kpmg-outline font-body">{c.code}</span>
                            <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.title}</p>
                            <p className="text-xs text-kpmg-outline font-body">{c.source} · {c.tech}</p>
                          </div>
                          <span
                            className="kpmg-badge text-xs flex-shrink-0"
                            style={{
                              backgroundColor: c.status === 'Scaled' ? '#E0E7FF' : c.status === 'Active' ? '#D1FAE5' : '#F0EDEC',
                              color: c.status === 'Scaled' ? '#00205F' : c.status === 'Active' ? '#065F46' : '#747683',
                            }}
                          >{c.status}</span>
                        </div>
                        <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed mb-2">{c.executiveSummary}</p>
                        <p className="text-xs text-kpmg-primary font-body italic mb-2">&ldquo;{c.partnerInsight}&rdquo;</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: 'Annualised Return', value: `£${(c.numericMetrics.annualizedReturn / 1000000).toFixed(2)}M` },
                            { label: 'Hrs Recovered / Mo', value: `${c.numericMetrics.hoursRecoveredPerMonth.toLocaleString()}` },
                            { label: 'FTEs Freed / Mo', value: `${c.numericMetrics.ftesFreed.toFixed(1)}` },
                            { label: 'Adoption Rate', value: `${c.numericMetrics.adoptionRate}%` },
                          ].map(({ label, value }) => (
                            <div key={label} className="p-2 rounded bg-white">
                              <p className="text-xs text-kpmg-outline font-body">{label}</p>
                              <p className="text-sm font-bold text-kpmg-on-surface font-display tabular-nums">{value}</p>
                            </div>
                          ))}
                        </div>
                        <ul className="mt-2 space-y-0.5">
                          {c.metrics.map((m, i) => (
                            <li key={`pm-${c.id}-${i}`} className="text-xs text-kpmg-on-surface-variant font-body">• {m}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Value Simulation — live outputs + assumptions */}
                {section.id === 'sec-simulator' && (
                  <div className="space-y-3">
                    <p className="text-xs text-kpmg-outline font-body">Scenario: <strong className="text-kpmg-on-surface">{scenarioLabel}</strong></p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Annualised Return', value: `£${(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M` },
                        { label: 'FTEs Freed / Month', value: `${scenarioOutputs.ftesFreed.toFixed(1)}` },
                        { label: 'Hours Recovered / Month', value: `${Math.round(scenarioOutputs.hoursPerMonth).toLocaleString()}` },
                        { label: 'Active Users', value: `${scenarioOutputs.activeUsers}` },
                        { label: 'Active Use Cases', value: `${scenarioOutputs.activeUseCases}` },
                        { label: 'Monthly Cost Savings', value: `£${Math.round(scenarioOutputs.monthlyCostSavings).toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg bg-kpmg-surface-container-low">
                          <p className="text-xs text-kpmg-outline font-body mb-0.5">{label}</p>
                          <p className="font-display text-base font-bold text-kpmg-on-surface tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-kpmg-surface-container border border-kpmg-outline-variant/20">
                      <p className="text-xs font-semibold text-kpmg-outline font-body mb-2 uppercase tracking-wider">Simulator Assumptions</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {[
                          { label: 'Target Use Cases', value: `${SIM_DEFAULTS.targetUseCaseCount}` },
                          { label: 'Activation Rate', value: `${SIM_DEFAULTS.activationRate}%` },
                          { label: 'Target Users', value: `${SIM_DEFAULTS.targetUserCount}` },
                          { label: 'Adoption Rate', value: `${SIM_DEFAULTS.adoptionRate}%` },
                          { label: 'Tasks / User / UC / Mo', value: `${SIM_DEFAULTS.tasksPerUserPerUseCasePerMonth}` },
                          { label: 'Avg Time Saved', value: `${SIM_DEFAULTS.avgTimeSavedMinutes} min` },
                          { label: 'Hourly Cost Rate', value: `£${SIM_CONSTANTS.HOURLY_COST}/hr` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between text-xs font-body">
                            <span className="text-kpmg-outline">{label}</span>
                            <span className="font-semibold text-kpmg-on-surface">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scenario Comparison — all three variants */}
                {section.id === 'sec-comparison' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Current State', outputs: cs },
                        { label: '2× Scale-Up', outputs: s2 },
                        { label: 'Full Adoption', outputs: fa },
                      ].map(({ label, outputs }) => (
                        <div key={label} className="p-3 rounded-lg bg-kpmg-surface-container-low border border-kpmg-outline-variant/20">
                          <p className="text-xs font-semibold text-kpmg-outline font-body mb-2 uppercase tracking-wider">{label}</p>
                          <p className="font-display text-base font-extrabold text-kpmg-primary tabular-nums">£{(outputs.annualizedReturn / 1000000).toFixed(2)}M</p>
                          <p className="text-xs text-kpmg-outline font-body">annualised</p>
                          <div className="mt-2 space-y-1">
                            {[
                              { k: 'Users', v: `${outputs.activeUsers}` },
                              { k: 'Use Cases', v: `${outputs.activeUseCases}` },
                              { k: 'FTEs Freed', v: `${outputs.ftesFreed.toFixed(1)}` },
                              { k: 'Hrs / Mo', v: `${Math.round(outputs.hoursPerMonth).toLocaleString()}` },
                            ].map(({ k, v }) => (
                              <div key={k} className="flex justify-between text-xs font-body">
                                <span className="text-kpmg-outline">{k}</span>
                                <span className="font-semibold text-kpmg-on-surface">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Architecture Overview */}
                {section.id === 'sec-architecture' && (
                  <div className="space-y-2">
                    {selectedCaseObjects.length > 0 ? selectedCaseObjects.map(c => (
                      <div key={`arch-${c.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-kpmg-surface-container-low">
                        <Layers size={14} className="text-kpmg-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.code} — {c.title}</p>
                          <p className="text-xs text-kpmg-outline font-body">{c.aiTechnique}</p>
                          <p className="text-xs text-kpmg-on-surface-variant font-body mt-1">{c.architectureLineage}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 rounded-lg bg-kpmg-surface-container">
                        <p className="text-xs text-kpmg-outline font-body italic">No cases selected.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Governance & Risk Notes */}
                {section.id === 'sec-governance' && (
                  <div className="space-y-2">
                    {selectedCaseObjects.length > 0 ? selectedCaseObjects.map(c => (
                      <div key={`gov-${c.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-kpmg-surface-container-low">
                        <Shield size={14} className="text-kpmg-outline mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.code} — {c.title}</p>
                          <p className="text-xs text-kpmg-on-surface-variant font-body mt-1">{c.governanceNotes}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 rounded-lg bg-kpmg-surface-container">
                        <p className="text-xs text-kpmg-outline font-body italic">No cases selected.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pilot Recommendations — dynamic based on selected cases + scenario */}
                {section.id === 'sec-pilot' && (() => {
                  const topCase = [...selectedCaseObjects].sort((a, b) => b.valueScore - a.valueScore)[0];
                  return (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg border border-kpmg-accent-faster/30 bg-kpmg-accent-faster/5">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={14} className="text-kpmg-accent-faster" />
                          <p className="text-sm font-semibold text-kpmg-on-surface font-body">Recommended Next Step</p>
                        </div>
                        <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">
                          Initiate a formal pilot request for the <strong>{scenarioLabel}</strong> scenario.
                          {topCase && <> Lead with <strong>{topCase.code} — {topCase.title}</strong> (Value Score: {topCase.valueScore}/100).</>}
                          {' '}Projected annualised return: <strong>£{(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M</strong> with <strong>{scenarioOutputs.activeUsers} active users</strong> across <strong>{scenarioOutputs.activeUseCases} use cases</strong>.
                        </p>
                      </div>
                      {selectedCaseObjects.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Lead Case', value: topCase ? `${topCase.code}` : 'TBD' },
                            { label: 'Target Scenario', value: scenarioLabel },
                            { label: 'Projected Return', value: `£${(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M` },
                            { label: 'Pilot Duration', value: '90 days' },
                          ].map(({ label, value }) => (
                            <div key={label} className="p-2 rounded-lg bg-kpmg-surface-container-low">
                              <p className="text-xs text-kpmg-outline font-body">{label}</p>
                              <p className="text-sm font-bold text-kpmg-on-surface font-display">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Generic placeholder for any section without specific preview */}
                {!['sec-exec', 'sec-portfolio', 'sec-cases', 'sec-simulator', 'sec-comparison', 'sec-architecture', 'sec-governance', 'sec-pilot'].includes(section.id) && (
                  <div className="p-4 rounded-lg bg-kpmg-surface-container">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-kpmg-outline" />
                      <p className="text-xs text-kpmg-outline font-body italic">{section.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-kpmg-outline-variant/30 flex items-center justify-between">
              <p className="text-xs text-kpmg-outline font-body">© 2026 {DEMO_CONTEXT.firm.name} International. All rights reserved.</p>
              <p className="text-xs text-kpmg-outline font-body">ArchitectFlow {DEMO_CONTEXT.firm.product}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}