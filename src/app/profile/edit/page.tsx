
"use client";

import React from 'react';
import { Header } from '@/components/header';
import { EditProfilePage } from '@/components/edit-profile-page';
import { ProfilePageSkeleton } from '@/components/profile-page-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';

export default function EditProfile() {
  const { isLoading } = useProfile();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
            <div className="sticky top-4 z-50 w-full mt-4">
              <div className="flex h-14 items-center px-0">
                 <Button asChild variant="ghost" size="icon" className='h-10 w-10 rounded-full bg-card shadow-sm border'>
                    <Link href="/profile">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                 </Button>
              </div>
            </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {isLoading ? <ProfilePageSkeleton /> : <EditProfilePage />}
        </main>
      </div>
    </div>
  );
}
