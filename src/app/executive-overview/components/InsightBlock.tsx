import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InsightBlock() {
  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Partner insight card */}
      <div
        className="rounded-xl p-6 flex-1"
        style={{ background: 'linear-gradient(135deg, #00205F 0%, #00338D 100%)' }}
      >
        <p
          className="text-xs font-semibold text-white/50 tracking-widest uppercase font-body mb-3"
          style={{ fontSize: '10px' }}
        >
          The Core Principle
        </p>
        <h3 className="font-display text-base font-bold text-white mb-3 leading-snug">
          The architecture is the asset — not the use case.
        </h3>
        <p className="text-sm text-white/80 font-body leading-relaxed">
          TAX-001 classifies against any legal corpus. AUD-001 processes any document type.
          DEAL-001 scans any data room. Change the corpus, keep the engine.
          That is why six cases reach all five functions.
        </p>
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50 font-body mb-0.5">Widest reach</p>
            <p className="text-sm font-semibold text-white font-body">CON-001 · 5 functions</p>
          </div>
          <div>
            <p className="text-xs text-white/50 font-body mb-0.5">Largest user base</p>
            <p className="text-sm font-semibold text-white font-body">TAX-002 · 244 users</p>
          </div>
        </div>
      </div>

      {/* Navigation prompt */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none dark:border dark:border-gray-700 p-5">
        <p className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 tracking-widest uppercase font-body mb-3" style={{ fontSize: '10px' }}>
          Continue the story
        </p>
        <div className="space-y-1">
          <Link href="/ai-architecture-explorer">
            <span className="flex items-center justify-between w-full text-sm font-semibold text-kpmg-primary dark:text-blue-400 hover:text-kpmg-secondary dark:hover:text-blue-300 transition-colors font-body cursor-pointer py-2">
              See the architecture map
              <ArrowRight size={14} />
            </span>
          </Link>
          <div className="h-px bg-kpmg-outline-variant/30 dark:bg-gray-700" />
          <Link href="/value-simulator">
            <span className="flex items-center justify-between w-full text-sm font-semibold text-kpmg-primary dark:text-blue-400 hover:text-kpmg-secondary dark:hover:text-blue-300 transition-colors font-body cursor-pointer py-2">
              Model the value case
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

    </div>
  );
}