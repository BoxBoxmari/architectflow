'use client';
import React, { useState } from 'react';
import { AI_CASES, FUNCTIONS, SERVICES } from '@/lib/mockData';
import Link from 'next/link';
import {
  ArrowLeft,
  Calculator,
  FileText,
  Rocket,
  ChevronRight,
  Lightbulb,
  Link2,
  Cpu,
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Concept: { bg: '#F0EDEC', text: '#747683', border: '#C4C6D4' },
  'In Development': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  Pilot: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  Active: { bg: '#D1FAE5', text: '#065F46', border: '#059669' },
  Scaled: { bg: '#E0E7FF', text: '#00205F', border: '#00338D' },
};

const TECHNIQUE_COLORS: Record<string, string> = {
  'RAG + LLM Re-ranking': '#00205F',
  'RAG-based GenAI Drafting': '#006397',
  'Doc Parsing + LLM + Anomaly Flag': '#0F6E56',
  'LLM Extraction + Template Gen': '#00B8A9',
  'LLM Clause Extraction + Risk Class': '#45004F',
  'Multi-doc Parsing + Risk Scoring': '#F39C12',
};

interface CaseDetailContentProps {
  caseId?: string;
}

export default function CaseDetailContent({ caseId }: CaseDetailContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'governance'>('overview');

  // Resolve case: prefer explicit caseId prop, fall back to first case
  const c = (caseId ? AI_CASES.find(ac => ac.id === caseId) : undefined) ?? AI_CASES[0];

  const fn = FUNCTIONS.find(f => f.id === c.originatingFunction);
  const linkedFns = FUNCTIONS.filter(f => c.linkedFunctions.includes(f.id));
  const linkedSvcs = SERVICES.filter(s => c.linkedServices.includes(s.id));
  const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Concept'];
  const techColor = TECHNIQUE_COLORS[c.tech] || '#747683';

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
                style={{ backgroundColor: `${techColor}15`, color: techColor }}
              >
                {c.tech}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-kpmg-on-surface leading-tight mb-2">{c.title}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fn?.color || '#747683' }} />
              <span className="text-sm text-kpmg-on-surface-variant font-body">{c.source}</span>
            </div>
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

      {/* Key value metrics */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-3" style={{ fontSize: '10px' }}>Key Value Metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {c.metrics.map((m, i) => (
            <div
              key={`kvm-${c.id}-${i}`}
              className="flex items-start gap-2 p-3 rounded-lg bg-kpmg-surface-container-low border border-kpmg-outline-variant/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-kpmg-primary mt-1.5 flex-shrink-0" />
              <span className="text-sm font-semibold text-kpmg-on-surface font-body">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-kpmg-outline-variant/30">
        {TABS.map(tab => (
          <button
            key={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px font-body ${
              activeTab === tab.id
                ? 'border-kpmg-primary text-kpmg-primary' : 'border-transparent text-kpmg-outline hover:text-kpmg-on-surface'
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
                <h2 className="font-display text-base font-bold text-kpmg-on-surface">Executive Summary</h2>
              </div>
              <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">{c.executiveSummary}</p>
            </div>

            {/* Linked functions + services */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={16} className="text-kpmg-secondary" />
                <h2 className="font-display text-base font-bold text-kpmg-on-surface">Linked Functions & Services</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-kpmg-outline uppercase tracking-widest font-body mb-2" style={{ fontSize: '10px' }}>Functions</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedFns.map(lf => (
                      <span
                        key={`detail-fn-${lf.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium font-body border"
                        style={{ borderColor: `${lf.color}40`, backgroundColor: `${lf.color}08`, color: lf.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lf.color }} />
                        {lf.name}
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
              <p className="text-sm text-white/90 font-body leading-relaxed">{c.insight}</p>
            </div>

            {/* Case metadata */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-4">Case Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Case Code', value: c.code },
                  { label: 'Source Domain', value: c.source },
                  { label: 'AI Technique', value: c.tech },
                  { label: 'Status', value: c.status },
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
              <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-3">Quick Actions</h3>
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
        <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={16} className="text-kpmg-primary" />
            <h2 className="font-display text-base font-bold text-kpmg-on-surface">Architecture Lineage</h2>
          </div>
          <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">{c.architectureLineage}</p>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
          <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-4">Governance Notes</h2>
          <p className="text-sm text-kpmg-on-surface-variant font-body leading-relaxed">{c.governanceNotes}</p>
        </div>
      )}
    </div>
  );
}