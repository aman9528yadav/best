
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { UnitConverter } from '@/components/unit-converter';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { UnitConverterSkeleton } from '@/components/unit-converter-skeleton';

export default function ConverterPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); 
      return () => clearTimeout(timer);
    }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground items-center p-4">
      <div className="w-full max-w-[412px]">
        <Header />
        <main className="flex flex-1 flex-col items-center py-6">
          <AdPlaceholder className="mb-4 w-full" />
          <h1 className="text-2xl font-bold self-start mb-4">Unit Converter</h1>
          {isLoading ? <UnitConverterSkeleton /> : <UnitConverter />}
          <AdPlaceholder className="mt-4 w-full" />
        </main>
      </div>
    </div>
  );
}
