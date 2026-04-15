'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AI_CASES, FUNCTIONS } from '@/lib/mockData';
import { CheckCircle2, Rocket, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PilotFormData {
  sponsorName: string;
  sponsorEmail: string;
  targetFunction: string;
  selectedCase: string;
  priority: string;
  launchQuarter: string;
  expectedValueBand: string;
  businessObjective: string;
  stakeholderNotes: string;
}

export default function PilotRequestContent() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PilotFormData>({
    defaultValues: {
      sponsorName: 'Sarah Reynolds',
      sponsorEmail: 'sarah.reynolds@kpmg.com',
      targetFunction: 'fn-tax',
      selectedCase: 'TAX-002',
      priority: 'high',
      launchQuarter: 'Q3 2026',
      expectedValueBand: '£1M–£2M',
      businessObjective: '',
      stakeholderNotes: '',
    },
  });

  const selectedCaseId = watch('selectedCase');
  const selectedCase = AI_CASES.find(c => c.id === selectedCaseId);

  async function onSubmit(data: PilotFormData) {
    setIsSubmitting(true);
    try {
      const refId = `PR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const submission = {
        id: refId,
        timestamp: new Date().toISOString(),
        ...data,
      };
      const existing: unknown[] = JSON.parse(localStorage.getItem('pilotRequests') || '[]');
      existing.unshift(submission);
      localStorage.setItem('pilotRequests', JSON.stringify(existing.slice(0, 20)));
      setSubmissionId(refId);
      toast.success('Pilot request submitted', { description: 'The AI Innovation team will be in touch within 2 business days' });
      setSubmitted(true);
    } catch {
      toast.error('Could not save pilot request');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-kpmg-accent-positive/10 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-kpmg-accent-positive" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-kpmg-on-surface mb-2">Pilot Request Submitted</h2>
        <p className="text-sm text-kpmg-on-surface-variant font-body max-w-sm leading-relaxed mb-2">
          Your request has been received by the KPMG AI Innovation team. Reference: <span className="font-semibold text-kpmg-primary">{submissionId}</span>
        </p>
        <p className="text-sm text-kpmg-outline font-body mb-8">Expected response within 2 business days.</p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          {[
            { id: 'conf-case', label: 'Case Selected', value: selectedCase?.code || '—' },
            { id: 'conf-priority', label: 'Priority', value: 'High' },
            { id: 'conf-quarter', label: 'Launch Target', value: 'Q3 2026' },
          ].map(({ id, label, value }) => (
            <div key={id} className="p-3 rounded-lg bg-kpmg-surface-container text-center">
              <p className="text-xs text-kpmg-outline font-body mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-kpmg-on-surface font-body">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSubmitted(false)} className="kpmg-btn-secondary text-sm">
            Submit Another Request
          </button>
          <Link href="/executive-overview" className="kpmg-btn-primary text-sm">
            Back to Overview
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Context banner */}
      {selectedCase && (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-kpmg-primary/5 border border-kpmg-primary/15">
          <div className="w-9 h-9 rounded-lg bg-kpmg-primary/10 flex items-center justify-center flex-shrink-0">
            <Rocket size={16} className="text-kpmg-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-kpmg-primary uppercase tracking-widest font-body mb-0.5" style={{ fontSize: '10px' }}>
              Selected Case
            </p>
            <p className="text-sm font-extrabold text-kpmg-on-surface font-display">{selectedCase.code} — {selectedCase.title}</p>
            <p className="text-xs text-kpmg-on-surface-variant font-body mt-0.5">
              {selectedCase.source} · {selectedCase.tech} · {selectedCase.status}
            </p>
            <ul className="mt-1 space-y-0.5">
              {selectedCase.metrics.map((m, i) => (
                <li key={`banner-m-${i}`} className="text-xs text-kpmg-outline font-body">• {m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sponsor details */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-5">Sponsor Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Sponsor Name <span className="text-kpmg-accent-negative">*</span>
            </label>
            <input
              type="text"
              {...register('sponsorName', { required: 'Sponsor name is required' })}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            />
            {errors.sponsorName && <p className="text-xs text-kpmg-accent-negative mt-1 font-body">{errors.sponsorName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Sponsor Email <span className="text-kpmg-accent-negative">*</span>
            </label>
            <input
              type="email"
              {...register('sponsorEmail', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            />
            {errors.sponsorEmail && <p className="text-xs text-kpmg-accent-negative mt-1 font-body">{errors.sponsorEmail.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Target Function <span className="text-kpmg-accent-negative">*</span>
            </label>
            <select
              {...register('targetFunction', { required: 'Target function is required' })}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            >
              {FUNCTIONS.map(fn => (
                <option key={`pf-fn-${fn.id}`} value={fn.id}>{fn.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Case selection */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-5">AI Case</h2>
        <div>
          <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
            Selected AI Case <span className="text-kpmg-accent-negative">*</span>
          </label>
          <p className="text-xs text-kpmg-outline font-body mb-2">The primary case this pilot will activate</p>
          <select
            {...register('selectedCase', { required: true })}
            className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
          >
            {AI_CASES.map(c => (
              <option key={`pf-case-${c.id}`} value={c.id}>{c.code} — {c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pilot parameters */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-5">Pilot Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Priority <span className="text-kpmg-accent-negative">*</span>
            </label>
            <select
              {...register('priority', { required: true })}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Target Launch Quarter <span className="text-kpmg-accent-negative">*</span>
            </label>
            <select
              {...register('launchQuarter', { required: true })}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            >
              {['Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].map(q => (
                <option key={`pf-q-${q}`} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Expected Value Band
            </label>
            <select
              {...register('expectedValueBand')}
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body"
            >
              {['< £250k', '£250k–£500k', '£500k–£1M', '£1M–£2M', '> £2M'].map(v => (
                <option key={`pf-vb-${v}`} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business objective & notes */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="font-display text-base font-bold text-kpmg-on-surface mb-5">Business Context</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Business Objective
            </label>
            <textarea
              {...register('businessObjective')}
              rows={3}
              placeholder="Describe the primary business objective this pilot will address..."
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-kpmg-on-surface uppercase tracking-widest font-body mb-1.5" style={{ fontSize: '10px' }}>
              Stakeholder Notes
            </label>
            <textarea
              {...register('stakeholderNotes')}
              rows={3}
              placeholder="Any additional context for the AI Innovation team..."
              className="w-full px-3 py-2 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 transition-all font-body resize-none"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="kpmg-btn-primary text-sm disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Rocket size={14} />
              Submit Pilot Request
            </>
          )}
        </button>
        <Link href="/case-library">
          <span className="kpmg-btn-secondary text-sm cursor-pointer">Back to Case Library</span>
        </Link>
      </div>
    </form>
  );
}