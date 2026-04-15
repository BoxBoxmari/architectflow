import React from 'react';
import Link from 'next/link';
import { Network, Calculator, FileText } from 'lucide-react';

export default function OverviewCTAs() {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link href="/ai-architecture-explorer">
        <span className="kpmg-btn-secondary text-xs gap-1.5 cursor-pointer">
          <Network size={14} />
          <span className="hidden sm:inline">Architecture</span>
        </span>
      </Link>
      <Link href="/value-simulator">
        <span className="kpmg-btn-secondary text-xs gap-1.5 cursor-pointer">
          <Calculator size={14} />
          <span className="hidden sm:inline">Simulator</span>
        </span>
      </Link>
      <Link href="/reports">
        <span className="kpmg-btn-primary text-xs gap-1.5 cursor-pointer">
          <FileText size={14} />
          <span className="hidden sm:inline">Report</span>
        </span>
      </Link>
    </div>
  );
}