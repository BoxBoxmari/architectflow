'use client';
import React, { useState } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import Link from 'next/link';
import {
  ArrowLeft,
  Calculator,
  FileText,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Star,
  Shield,
  Lightbulb,
  Link2,
  Cpu,
} from 'lucide-react';
import { useParams } from 'react-router-dom';



const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Concept: { bg: '#F0EDEC', text: '#747683', border: '#C4C6D4' },
  'In Development': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  Pilot: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  Active: { bg: '#D1FAE5', text: '#065F46', border: '#059669' },
  Scaled: { bg: '#E0E7FF', text: '#00205F', border: '#00338D' },
};

const MATURITY_COLORS: Record<string, { text: string; bg: string }> = {
  Experimental: { text: '#92400E', bg: '#FEF3C7' },
  Emerging: { text: '#1E40AF', bg: '#DBEAFE' },
  Established: { text: '#065F46', bg: '#D1FAE5' },
  Mature: { text: '#00205F', bg: '#E0E7FF' },
};

const TECHNIQUE_COLORS: Record<string, string> = {
  LLM: '#00205F',
  NLP: '#006397',
  'ML Classification': '#0F6E56',
  RAG: '#00B8A9',
  'Generative AI': '#F39C12',
};

export default function CaseDetailContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'governance'>('overview');
  // Using AF-002 as the default detail view — backend would use route param
  // BACKEND INTEGRATION: Replace with dynamic case lookup using route params: const { id } = useParams()
  const c = AI_CASES[1]; // AF-002 Tax Research Assistant

  const fn = FUNCTIONS.find(f => f.id === c.originatingFunction);
  const linkedFns = FUNCTIONS.filter(f => c.linkedFunctions.includes(f.id));
  const linkedSvcs = SERVICES.filter(s => c.linkedServices.includes(s.id));
  const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
  const maturityStyle = MATURITY_COLORS[c.maturityLevel] || MATURITY_COLORS['Experimental'];
  const techColor = TECHNIQUE_COLORS[c.aiTechnique] || '#747683';

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'architecture', label: 'Architecture & Lineage' },
    { id: 'governance', label: 'Governance' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/case-library">
          <span className="flex items-center gap-1.5 text-sm text-kpmg-outline hover:text-kpmg-primary transition-colors cursor-pointer font-body">
            <ArrowLeft size={14} />
            Case Library
          </span>
        </Link>
        <ChevronRight size={12} className="text-kpmg-outline-variant" />
        <span className="text-sm text-kpmg-on-surface-variant font-body">{c.code}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-sm font-semibold text-kpmg-outline font-body">{c.code}</span>
              <span
                className="kpmg-badge"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {c.status}
              </span>
              <span
                className="kpmg-badge"
                style={{ backgroundColor: maturityStyle.bg, color: maturityStyle.text }}
              >
                {c.maturityLevel}
              </span>
              <span
                className="kpmg-badge"
                style={{ backgroundColor: `${techColor}15`, color: techColor }}
              >
                {c.aiTechnique}
              </span>
            </div>
            <h1 className="font-display text-2xl font-800 text-kpmg-on-surface leading-tight mb-2">{c.title}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fn?.color || '#747683' }} />
              <span className="text-sm text-kpmg-on-surface-variant font-body">Originating: {fn?.name}</span>
            </div>
          </div>

          {/* Score badges */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {[
              { label: 'Value', value: c.valueScore, color: '#0F6E56' },
              { label: 'Readiness', value: c.readinessScore, color: '#006397' },
              { label: 'Reusability', value: c.reusabilityScore, color: '#F39C12' },
            ].map(({ label, value, color }) => (
              <div key={`score-${label}`} className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 font-display text-base font-800 tabular-nums"
                  style={{ borderColor: color, color }}
                >
                  {value}
                </div>
                <span className="text-xs text-kpmg-outline font-body">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-kpmg-outline-variant/20">
          <Link href="/value-simulator">
            <span className="kpmg-btn-primary text-sm cursor-pointer">
              <Calculator size={15} />
              Run Value Simulation
            </span>
          </Link>
          <Link href="/reports">
            <span className="kpmg-btn-secondary text-sm cursor-pointer">
              <FileText size={15} />
              Add to Report
            </span>
          </Link>
          <Link href="/pilot-request">
            <span className="kpmg-btn-secondary text-sm cursor-pointer">
              <Rocket size={15} />
              Request Pilot
            </span>
          </Link>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'metric-annual', label: 'Estimated Annual Value', value: `£${(c.metrics.annualizedReturn / 1000000).toFixed(2)}M`, sub: 'Based on current deployment', color: '#0F6E56', icon: <CheckCircle2 size={16} /> },
          { id: 'metric-hours', label: 'Hours Recovered / Month', value: `${c.metrics.hoursRecoveredPerMonth.toLocaleString()}`, sub: 'Across active users', color: '#006397', icon: <Calculator size={16} /> },
          { id: 'metric-ftes', label: 'FTEs Freed / Month', value: `${c.metrics.ftesFreed.toFixed(1)}`, sub: 'Equivalent capacity released', color: '#00205F', icon: <Star size={16} /> },
          { id: 'metric-adoption', label: 'Adoption Rate', value: `${c.metrics.adoptionRate}%`, sub: c.metrics.adoptionRate >= 70 ? 'Above target threshold' : 'Below 70% target', color: c.metrics.adoptionRate >= 70 ? '#0F6E56' : '#C84B5A', icon: c.metrics.adoptionRate >= 70 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} /> },
        ].map(({ id, label, value, sub, color, icon }) => (
          <div key={id} className="bg-white rounded-xl shadow-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>{label}</span>
              <span style={{ color }}>{icon}</span>
            </div>
            <p className="font-display text-2xl font-800 tabular-nums leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-xs text-kpmg-outline font-body">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-kpmg-outline-variant/30">
        {TABS.map(tab => (
          <button
            key={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px font-body ${
              activeTab === tab.id
                ? 'border-kpmg-primary text-kpmg-primary' :'border-transparent text-kpmg-outline hover:text-kpmg-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {/* Executive summary */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-kpmg-primary" />
                <h2 className="font-display text-base font-700 text-kpmg-on-surface">Executive Summary</h2>
              </div>
              <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">{c.executiveSummary}</p>
            </div>

            {/* Problem statement */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="text-kpmg-accent-deeper" />
                <h2 className="font-display text-base font-700 text-kpmg-on-surface">Problem Statement</h2>
              </div>
              <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">{c.problemStatement}</p>
            </div>

            {/* Linked functions + services */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={16} className="text-kpmg-secondary" />
                <h2 className="font-display text-base font-700 text-kpmg-on-surface">Linked Functions & Services</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>Functions</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedFns.map(fn => (
                      <span
                        key={`detail-fn-${fn.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium font-body border"
                        style={{ borderColor: `${fn.color}40`, backgroundColor: `${fn.color}08`, color: fn.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fn.color }} />
                        {fn.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>Services</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedSvcs.map(svc => (
                      <span
                        key={`detail-svc-${svc.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-kpmg-surface-container text-xs font-medium text-kpmg-on-surface-variant font-body"
                      >
                        {svc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-5">
            {/* Partner insight */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'linear-gradient(135deg, #00205F 0%, #00338D 100%)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-white/70" />
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Partner Insight</p>
              </div>
              <p className="text-sm text-white/90 font-body leading-relaxed">{c.partnerInsight}</p>
            </div>

            {/* Case metadata */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-display text-sm font-700 text-kpmg-on-surface mb-4">Case Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Case Code', value: c.code },
                  { label: 'AI Technique', value: c.aiTechnique },
                  { label: 'Maturity Level', value: c.maturityLevel },
                  { label: 'Status', value: c.status },
                  { label: 'Value Score', value: `${c.valueScore} / 100` },
                  { label: 'Readiness Score', value: `${c.readinessScore} / 100` },
                  { label: 'Reusability Score', value: `${c.reusabilityScore} / 100` },
                ].map(({ label, value }) => (
                  <div key={`meta-${label}`} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-kpmg-outline font-body">{label}</span>
                    <span className="text-xs font-semibold text-kpmg-on-surface font-body text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-display text-sm font-700 text-kpmg-on-surface mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/value-simulator">
                  <span className="kpmg-btn-primary w-full justify-between text-xs cursor-pointer">
                    Run Value Simulation
                    <ChevronRight size={13} />
                  </span>
                </Link>
                <Link href="/scenario-comparison">
                  <span className="kpmg-btn-secondary w-full justify-between text-xs cursor-pointer mt-2 block">
                    Compare Scenarios
                    <ChevronRight size={13} />
                  </span>
                </Link>
                <Link href="/pilot-request">
                  <span className="kpmg-btn-secondary w-full justify-between text-xs cursor-pointer mt-2 block">
                    Request Pilot
                    <ChevronRight size={13} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={16} className="text-kpmg-primary" />
              <h2 className="font-display text-base font-700 text-kpmg-on-surface">Architecture Lineage</h2>
            </div>
            <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed mb-5">{c.architectureLineage}</p>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body" style={{ fontSize: '10px' }}>Shared Components</p>
              {[
                { id: 'comp-km', label: 'KPMG Knowledge Mesh (KM-Core)', type: 'Platform', status: 'Shared' },
                { id: 'comp-vec', label: 'Vector Store Infrastructure', type: 'Infrastructure', status: 'Shared with AF-005' },
                { id: 'comp-nlp', label: 'NLP Summarisation Module', type: 'Module', status: 'Reused in AF-004' },
                { id: 'comp-doc', label: 'Document Ingestion Pipeline', type: 'Pipeline', status: 'Shared with AF-001' },
              ].map(({ id, label, type, status }) => (
                <div key={id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-kpmg-surface-container-low">
                  <div>
                    <p className="text-sm font-medium text-kpmg-on-surface font-body">{label}</p>
                    <p className="text-xs text-kpmg-outline font-body">{type}</p>
                  </div>
                  <span className="kpmg-badge bg-kpmg-accent-faster/10 text-kpmg-accent-faster text-xs flex-shrink-0">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={16} className="text-kpmg-secondary" />
              <h2 className="font-display text-base font-700 text-kpmg-on-surface">Dependencies & Integrations</h2>
            </div>
            <div className="space-y-3">
              {[
                { id: 'dep-m365', label: 'Microsoft 365 Tenant', type: 'Integration', risk: 'Low' },
                { id: 'dep-vstore', label: 'Pinecone Vector Database', type: 'Infrastructure', risk: 'Low' },
                { id: 'dep-llm', label: 'Azure OpenAI Service', type: 'AI Platform', risk: 'Medium' },
                { id: 'dep-auth', label: 'KPMG Identity & Access Management', type: 'Security', risk: 'Low' },
                { id: 'dep-logging', label: 'Audit Logging Service', type: 'Compliance', risk: 'Low' },
              ].map(({ id, label, type, risk }) => (
                <div key={id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-kpmg-surface-container-low">
                  <div>
                    <p className="text-sm font-medium text-kpmg-on-surface font-body">{label}</p>
                    <p className="text-xs text-kpmg-outline font-body">{type}</p>
                  </div>
                  <span
                    className="kpmg-badge text-xs flex-shrink-0"
                    style={{
                      backgroundColor: risk === 'Low' ? '#D1FAE5' : risk === 'Medium' ? '#FEF3C7' : '#FEE2E2',
                      color: risk === 'Low' ? '#065F46' : risk === 'Medium' ? '#92400E' : '#991B1B',
                    }}
                  >
                    {risk} risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-kpmg-primary" />
              <h2 className="font-display text-base font-700 text-kpmg-on-surface">Governance Notes</h2>
            </div>
            <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed mb-5">{c.governanceNotes}</p>
            <div className="space-y-2">
              {[
                { id: 'gov-gdpr', label: 'GDPR Compliance', status: 'Compliant' },
                { id: 'gov-residency', label: 'Data Residency', status: 'Compliant' },
                { id: 'gov-audit', label: 'Audit Trail', status: 'Enabled' },
                { id: 'gov-refresh', label: 'Model Refresh Cycle', status: 'Quarterly' },
                { id: 'gov-review', label: 'Legal & Risk Review', status: 'Q4 2025' },
              ].map(({ id, label, status }) => (
                <div key={id} className="flex items-center justify-between gap-4 py-2 border-b border-kpmg-outline-variant/20 last:border-0">
                  <span className="text-sm text-kpmg-on-surface-variant font-body">{label}</span>
                  <span className="kpmg-badge bg-kpmg-accent-positive/10 text-kpmg-accent-positive text-xs">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="font-display text-base font-700 text-kpmg-on-surface mb-4">Review History</h2>
            <div className="space-y-4">
              {[
                { id: 'rev-001', date: 'Q4 2025', reviewer: 'KPMG Legal & Risk', outcome: 'Approved', notes: 'Full deployment approved with standard data handling controls.' },
                { id: 'rev-002', date: 'Q3 2025', reviewer: 'AI Ethics Board', outcome: 'Approved', notes: 'Model bias assessment completed. No material concerns identified.' },
                { id: 'rev-003', date: 'Q2 2025', reviewer: 'Technology Council', outcome: 'Conditional', notes: 'Approved for pilot pending data residency confirmation.' },
                { id: 'rev-004', date: 'Q1 2025', reviewer: 'Security Review', outcome: 'Approved', notes: 'Penetration testing passed. Encryption at rest and in transit confirmed.' },
              ].map(({ id, date, reviewer, outcome, notes }) => (
                <div key={id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: outcome === 'Approved' ? '#0F6E56' : '#F39C12' }}
                    />
                    <div className="w-px flex-1 bg-kpmg-outline-variant/30 mt-1" />
                  </div>
                  <div className="pb-4 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-kpmg-on-surface font-body">{reviewer}</span>
                      <span className="text-xs text-kpmg-outline font-body">· {date}</span>
                    </div>
                    <p className="text-xs text-kpmg-on-surface-variant font-body leading-relaxed">{notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}