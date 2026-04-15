'use client';
import React, { useState } from 'react';
import { AI_CASES } from '@/lib/mockData';
import { calcScenarioVariants, SIM_DEFAULTS, SIM_CONSTANTS } from '@/lib/simulator/calcOutputs';
import { toast } from 'sonner';
import { Download, Share2, Eye, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, FileText, CheckCircle2 } from 'lucide-react';

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

// Scenario options for the report
const SCENARIO_OPTIONS = [
  { id: 'current', label: 'Current State' },
  { id: 'scale2x', label: '2X Scale-Up' },
  { id: 'full',    label: 'Full Adoption' },
] as const;

export default function ReportBuilderContent() {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [selectedCases, setSelectedCases] = useState<string[]>(['TAX-001', 'TAX-002', 'LAW-001']);
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'scale2x' | 'full'>('scale2x');
  const [reportTitle, setReportTitle] = useState('KPMG AI Portfolio Review — Q2 2026');
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

  function handleExport() {
    setExporting(true);

    const variants = calcScenarioVariants(SIM_DEFAULTS);
    const scenarioOutputs =
      selectedScenario === 'current' ? variants.currentState.outputs :
      selectedScenario === 'scale2x' ? variants.scale2x.outputs :
      variants.fullAdoption.outputs;
    const scenarioLabel =
      selectedScenario === 'current' ? 'Current State' :
      selectedScenario === 'scale2x' ? '2× Scale-Up' : 'Full Adoption';

    const sortedSections = [...sections].sort((a, b) => a.order - b.order).filter(s => s.included);
    const selectedCaseObjects = AI_CASES.filter(c => selectedCases.includes(c.id));
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const sectionHTML = sortedSections.map((section, idx) => {
      let content = `<p style="color:#666;font-size:12px;font-style:italic;">${section.description}</p>`;

      if (section.id === 'sec-exec') {
        content = `<p>This report summarises the KPMG AI portfolio status as of Q2 2026. The portfolio comprises ${AI_CASES.length} AI cases across ${new Set(AI_CASES.flatMap(c => c.linkedFunctions)).size} functions. The Tax Research Assistant (TAX-002) has achieved scaled status with 244 active users — the portfolio flagship.</p>`;
      } else if (section.id === 'sec-portfolio') {
        content = `<table><tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Cases</td><td>${AI_CASES.length}</td></tr>
          <tr><td>Functions Covered</td><td>${new Set(AI_CASES.flatMap(c => c.linkedFunctions)).size}</td></tr>
          <tr><td>Active / Scaled</td><td>${AI_CASES.filter(c => ['Active','Scaled'].includes(c.status)).length}</td></tr>
        </table>`;
      } else if (section.id === 'sec-cases') {
        content = selectedCaseObjects.map(c =>
          `<div style="margin-bottom:12px;padding:10px;background:#f8f8f8;border-radius:6px;">
            <strong>${c.code} — ${c.title}</strong><br/>
            <span style="color:#666;font-size:11px;">${c.source} · ${c.tech}</span>
            <ul style="margin:6px 0 0;padding-left:16px;">${c.metrics.map(m => `<li style="font-size:12px;">${m}</li>`).join('')}</ul>
          </div>`
        ).join('');
      } else if (section.id === 'sec-simulator') {
        content = `<table><tr><th>Metric</th><th>${scenarioLabel}</th></tr>
          <tr><td>Annualised Return</td><td>£${(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M</td></tr>
          <tr><td>Monthly Cost Savings</td><td>£${Math.round(scenarioOutputs.monthlyCostSavings).toLocaleString()}</td></tr>
          <tr><td>Hours Recovered / Month</td><td>${Math.round(scenarioOutputs.hoursPerMonth).toLocaleString()} hrs</td></tr>
          <tr><td>FTEs Freed / Month</td><td>${scenarioOutputs.ftesFreed.toFixed(1)}</td></tr>
          <tr><td>Active Users</td><td>${scenarioOutputs.activeUsers}</td></tr>
          <tr><td>Active Use Cases</td><td>${scenarioOutputs.activeUseCases}</td></tr>
          <tr><td>Hourly Cost Rate</td><td>£${SIM_CONSTANTS.HOURLY_COST}/hr</td></tr>
        </table>`;
      } else if (section.id === 'sec-pilot') {
        content = `<p>Initiate a formal pilot request for the 2X Scale-Up scenario, targeting Tax and Consulting functions as the primary activation cohort. Estimated 90-day pilot with active use cases from the selected portfolio.</p>`;
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
<div class="subtitle">Prepared by Sarah Reynolds, Partner · ${dateStr} · CONFIDENTIAL — Internal Use Only</div>
${sectionHTML}
<div class="footer">© 2026 KPMG International. All rights reserved. · ArchitectFlow AI Intelligence Hub</div>
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

  // Compute scenario outputs from shared formula
  const variants = calcScenarioVariants(SIM_DEFAULTS);
  const scenarioOutputs =
    selectedScenario === 'current' ? variants.currentState.outputs :
    selectedScenario === 'scale2x' ? variants.scale2x.outputs :
    variants.fullAdoption.outputs;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const includedSections = sortedSections.filter(s => s.included);
  const selectedCaseObjects = AI_CASES.filter(c => selectedCases.includes(c.id));

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
            <span className="text-xs text-kpmg-outline font-body">{includedSections.length} sections · {selectedCaseObjects.length} cases</span>
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
                <p className="text-xs text-kpmg-outline font-body">Prepared by Sarah Reynolds, Partner · 15 April 2026</p>
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

                {section.id === 'sec-exec' && (
                  <div className="p-4 rounded-lg bg-kpmg-surface-container-low">
                    <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">
                      This report summarises the KPMG AI portfolio status as of Q2 2026. The portfolio comprises{' '}
                      {AI_CASES.length} AI cases across {new Set(AI_CASES.flatMap(c => c.linkedFunctions)).size} functions.
                      The Tax Research Assistant (TAX-002) has achieved scaled status with 244 active users — the portfolio flagship.
                    </p>
                  </div>
                )}

                {section.id === 'sec-portfolio' && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'prev-cases', label: 'Total Cases', value: `${AI_CASES.length}` },
                      { id: 'prev-fns', label: 'Functions', value: `${new Set(AI_CASES.flatMap(c => c.linkedFunctions)).size}` },
                      { id: 'prev-active', label: 'Active / Scaled', value: `${AI_CASES.filter(c => ['Active','Scaled'].includes(c.status)).length}` },
                    ].map(({ id, label, value }) => (
                      <div key={id} className="p-3 rounded-lg bg-kpmg-primary/5 text-center">
                        <p className="font-display text-lg font-extrabold text-kpmg-primary tabular-nums">{value}</p>
                        <p className="text-xs text-kpmg-outline font-body">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'sec-cases' && selectedCaseObjects.length > 0 && (
                  <div className="space-y-2">
                    {selectedCaseObjects.map(c => (
                      <div key={`prev-case-${c.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-kpmg-surface-container-low">
                        <span className="text-xs font-semibold text-kpmg-outline font-body w-20 flex-shrink-0 pt-0.5">{c.code}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-kpmg-on-surface font-body">{c.title}</p>
                          <p className="text-xs text-kpmg-outline font-body">{c.source} · {c.tech}</p>
                          <ul className="mt-1 space-y-0.5">
                            {c.metrics.map((m, i) => (
                              <li key={`pm-${c.id}-${i}`} className="text-xs text-kpmg-on-surface-variant font-body">• {m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'sec-simulator' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'sim-annual', label: 'Annualised Return', value: `£${(scenarioOutputs.annualizedReturn / 1000000).toFixed(2)}M` },
                      { id: 'sim-ftes', label: 'FTEs Freed / Month', value: `${scenarioOutputs.ftesFreed.toFixed(1)}` },
                      { id: 'sim-hours', label: 'Hours Recovered / Month', value: `${Math.round(scenarioOutputs.hoursPerMonth).toLocaleString()}` },
                      { id: 'sim-users', label: 'Active Users', value: `${scenarioOutputs.activeUsers}` },
                    ].map(({ id, label, value }) => (
                      <div key={id} className="p-3 rounded-lg bg-kpmg-surface-container-low">
                        <p className="text-xs text-kpmg-outline font-body mb-0.5">{label}</p>
                        <p className="font-display text-base font-bold text-kpmg-on-surface tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'sec-pilot' && (
                  <div className="p-4 rounded-lg border border-kpmg-accent-faster/30 bg-kpmg-accent-faster/5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-kpmg-accent-faster" />
                      <p className="text-sm font-semibold text-kpmg-on-surface font-body">Recommended Next Step</p>
                    </div>
                    <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">
                      Initiate a formal pilot request for the 2X Scale-Up scenario, targeting Tax and Consulting functions
                      as the primary activation cohort. Estimated 90-day pilot with active use cases from the selected portfolio.
                    </p>
                  </div>
                )}

                {!['sec-exec', 'sec-portfolio', 'sec-cases', 'sec-simulator', 'sec-pilot'].includes(section.id) && (
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
              <p className="text-xs text-kpmg-outline font-body">© 2026 KPMG International. All rights reserved.</p>
              <p className="text-xs text-kpmg-outline font-body">ArchitectFlow AI Intelligence Hub</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}