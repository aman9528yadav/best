
"use client";

import React from 'react';
import { Header } from '@/components/header';
import { Calculator } from '@/components/calculator';
import { AdMobBanner } from '@/components/admob-banner';
import { CalculatorSkeleton } from '@/components/calculator-skeleton';
import { useHistory } from '@/context/HistoryContext';

export default function CalculatorPage() {
  const { isLoading } = useHistory();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          <AdMobBanner className="mb-4 w-full" />
          <h1 className="text-2xl font-bold self-start mb-4">Calculator</h1>
          {isLoading ? <CalculatorSkeleton /> : <Calculator />}
          <AdMobBanner className="mt-4 w-full" />
        </main>
      </div>
    </div>
  );
}

    