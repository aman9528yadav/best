
"use client";

import React, { useState, useEffect } from 'react';
import { WhatsNewPage } from '@/components/whats-new-page';
import { WhatsNewPageSkeleton } from '@/components/whats-new-page-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WhatsNew() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
            <div className="sticky top-4 z-50 w-full mt-4">
              <div className="flex h-14 items-center px-0">
                 <Button asChild variant="ghost" size="icon" className='h-10 w-10 rounded-full bg-card shadow-sm border'>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                 </Button>
                 <h1 className="text-xl font-bold ml-4">What&apos;s New</h1>
              </div>
            </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {isLoading ? <WhatsNewPageSkeleton /> : <WhatsNewPage />}
        </main>
      </div>
    </div>
  );
}

    