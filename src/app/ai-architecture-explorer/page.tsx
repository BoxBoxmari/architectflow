import React from 'react';
import AppLayout from '@/components/AppLayout';
import ArchitectureCanvas from './components/ArchitectureCanvas';

export default function AIArchitectureExplorerPage() {
  return (
    <AppLayout activeRoute="/ai-architecture-explorer">
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            Intelligence Architecture
          </p>
          <h1 className="font-display text-2xl font-bold text-kpmg-on-surface dark:text-gray-100 leading-tight">
            AI Architecture Explorer
          </h1>
          <p className="text-sm text-kpmg-on-surface-variant dark:text-gray-400 mt-1 font-body">
            Explore AI Case → Function → Service relationships across the portfolio
          </p>
        </div>
        <ArchitectureCanvas />
      </div>
    </AppLayout>
  );
}