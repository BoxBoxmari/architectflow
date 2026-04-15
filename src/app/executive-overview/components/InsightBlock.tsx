import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function InsightBlock() {
  return (
    <div
      className="rounded-xl p-5"
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
          <p className="text-sm font-bold text-white font-display mt-0.5">Portfolio Momentum Signal</p>
        </div>
      </div>
      <p className="text-sm text-white/80 font-body leading-relaxed">
        Tax Research Assistant (TAX-002) has reached scaled status with 244 active users — the portfolio flagship.
        Expansion to KPMG Law is the recommended next move. CON-001 eliminates post-meeting admin firm-wide with zero modification needed.
      </p>
      <div className="mt-4 pt-3 border-t border-white/15">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/50 font-body">Fastest growing</p>
            <p className="text-sm font-semibold text-white font-body">CON-001 Meeting Converter</p>
          </div>
          <div>
            <p className="text-xs text-white/50 font-body">Needs attention</p>
            <p className="text-sm font-semibold text-kpmg-accent-negative font-body">DEAL-001 DD Scanner</p>
          </div>
        </div>
      </div>
    </div>
  );
}