import React from 'react';
import { notFound } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import CaseDetailContent from '@/app/case-detail/components/CaseDetailContent';
import { AI_CASES } from '@/lib/mockData';

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return AI_CASES.map(c => ({ id: c.id }));
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const caseExists = AI_CASES.some(c => c.id === id);
  if (!caseExists) notFound();

  return (
    <AppLayout activeRoute="/case-library">
      <CaseDetailContent caseId={id} />
    </AppLayout>
  );
}
