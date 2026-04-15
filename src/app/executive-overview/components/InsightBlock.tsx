import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InsightBlock() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Partner insight card */}
      <div
        className="rounded-xl p-5 flex-1"
        style={{ background: 'linear-gradient(135deg, #00205F 0%, #00338D 100%)' }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/60 tracking-widest uppercase font-body" style={{ fontSize: '10px' }}>
              Partner Insight
            </p>
            <p className="text-sm font-bold text-white font-display mt-0.5">The Reuse Principle</p>
          </div>
        </div>
        <p className="text-sm text-white/80 font-body leading-relaxed">
          Each case in this portfolio is not a one-off tool — it is a reusable engine.
          TAX-001 classifies against any legal corpus. AUD-001 processes any document type.
          DEAL-001 scans any data room. The architecture is the asset.
        </p>
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/50 font-body">Highest reach</p>
              <p className="text-sm font-semibold text-white font-body">CON-001 · 5 functions</p>
            </div>
            <div>
              <p className="text-xs text-white/50 font-body">Flagship case</p>
              <p className="text-sm font-semibold text-white font-body">TAX-002 · 244 users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation prompt */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <p className="text-xs text-kpmg-outline font-body mb-3">Explore the full story</p>
        <div className="space-y-2">
          <Link href="/ai-architecture-explorer">
            <span className="flex items-center justify-between w-full text-sm font-semibold text-kpmg-primary hover:text-kpmg-secondary transition-colors font-body cursor-pointer py-1">
              Architecture Explorer
              <ArrowRight size={14} />
            </span>
          </Link>
          <div className="h-px bg-kpmg-outline-variant/30" />
          <Link href="/value-simulator">
            <span className="flex items-center justify-between w-full text-sm font-semibold text-kpmg-primary hover:text-kpmg-secondary transition-colors font-body cursor-pointer py-1">
              Value Simulator
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}