
"use client";

import React from 'react';
import { Header } from '@/components/header';
import { AnalyticsPage } from '@/components/analytics-page';
import { AnalyticsPageSkeleton } from '@/components/analytics-page-skeleton';
import { useProfile } from '@/context/ProfileContext';

export default function Analytics() {
  const { isLoading } = useProfile();

  return (
    <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
      <h1 className="text-2xl font-bold self-start mb-4">Analytics</h1>
      {isLoading ? <AnalyticsPageSkeleton /> : <AnalyticsPage />}
    </main>
  );
}
