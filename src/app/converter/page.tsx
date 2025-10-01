
"use client";

import React from 'react';
import { Header } from '@/components/header';
import { UnitConverter } from '@/components/unit-converter';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { UnitConverterSkeleton } from '@/components/unit-converter-skeleton';

export default function ConverterPage() {
    const isLoading = false;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          <AdPlaceholder className="mb-4 w-full" />
          <h1 className="text-2xl font-bold self-start mb-4">Unit Converter</h1>
          {isLoading ? <UnitConverterSkeleton /> : <UnitConverter />}
          <AdPlaceholder className="mt-4 w-full" />
        </main>
      </div>
    </div>
  );
}

    