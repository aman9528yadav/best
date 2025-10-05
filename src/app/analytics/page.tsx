
"use client";

import React from 'react';
import { Header } from '@/components/header';
import { AnalyticsPage } from '@/components/analytics-page';
import { AnalyticsPageSkeleton } from '@/components/analytics-page-skeleton';
import { useProfile } from '@/context/ProfileContext';

export default function Analytics() {
  const { isLoading } = useProfile();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          <h1 className="text-2xl font-bold self-start mb-4">Analytics</h1>
          {isLoading ? <AnalyticsPageSkeleton /> : <AnalyticsPage />}
        </main>
      </div>
    </div>
  );
}
