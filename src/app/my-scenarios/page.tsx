'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import MyScenariosContent from './components/MyScenariosContent';

export default function MyScenariosPage() {
  return (
    <AppLayout activeRoute="/my-scenarios">
      <MyScenariosContent />
    </AppLayout>
  );
}
