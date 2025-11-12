
"use client";

import React from 'react';
import { AdMobBanner } from '@/components/admob-banner';
import { Stopwatch } from '@/components/stopwatch';
import { StopwatchSkeleton } from '@/components/stopwatch-skeleton';
import { useProfile } from '@/context/ProfileContext';

export default function StopwatchPage() {
  const { isLoading } = useProfile();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          <AdMobBanner className="mb-4 w-full" />
          <h1 className="text-2xl font-bold self-start mb-4">Stopwatch</h1>
          {isLoading ? <StopwatchSkeleton /> : <Stopwatch />}
          <AdMobBanner className="mt-4 w-full" />
        </main>
      </div>
    </div>
  );
}
