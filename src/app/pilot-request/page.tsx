import React from 'react';
import AppLayout from '@/components/AppLayout';
import PilotRequestContent from './components/PilotRequestContent';

export default function PilotRequestPage() {
  return (
    <AppLayout activeRoute="/pilot-request">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <div>
          <p className="text-xs font-semibold text-kpmg-outline tracking-widest uppercase mb-1 font-body" style={{ fontSize: '10px' }}>
            Conversion
          </p>
          <h1 className="font-display text-2xl font-bold text-kpmg-on-surface leading-tight">
            Pilot Request
          </h1>
          <p className="text-sm text-kpmg-on-surface-variant mt-1 font-body">
            Submit a formal request to activate an AI pilot within your function
          </p>
        </div>
        <PilotRequestContent />
      </div>
    </AppLayout>
  );
}