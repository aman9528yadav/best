
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
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground items-center p-4">
      <div className="w-full max-w-[412px]">
        <Header />
        <main className="flex flex-1 flex-col items-center py-6">
          {isLoading ? <ProfilePageSkeleton /> : <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
