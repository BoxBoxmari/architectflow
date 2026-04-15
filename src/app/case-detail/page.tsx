import React from 'react';
import AppLayout from '@/components/AppLayout';
import CaseDetailContent from './components/CaseDetailContent';

export default function CaseDetailPage() {
  return (
    <AppLayout activeRoute="/case-library">
      <CaseDetailContent />
    </AppLayout>
  );
}