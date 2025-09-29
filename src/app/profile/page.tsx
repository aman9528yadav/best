
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProfilePage } from '@/components/profile-page';
import { ProfilePageSkeleton } from '@/components/profile-page-skeleton';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function Profile() {
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
        <Card className="sticky top-4 z-50 w-full rounded-full shadow-md mt-4">
            <div className="flex h-14 items-center px-4">
                <Button asChild variant="ghost" size="icon" aria-label="Back">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1 text-center font-bold text-lg">
                    Profile
                </div>
                <Button variant="ghost" size="icon" aria-label="More options">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </Card>
        <main className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {isLoading ? <ProfilePageSkeleton /> : <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
