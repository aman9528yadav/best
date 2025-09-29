
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProfilePage } from '@/components/profile-page';
import { ProfilePageSkeleton } from '@/components/profile-page-skeleton';

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
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          {isLoading ? <ProfilePageSkeleton /> : <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
