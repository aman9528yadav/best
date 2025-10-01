
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SettingsPage } from '@/components/settings-page';
import { SettingsPageSkeleton } from '@/components/settings-page-skeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMaintenance } from '@/context/MaintenanceContext';

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: maintenanceLoading } = useMaintenance();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginDialog(true);
    }
  }, [user, authLoading]);

  const handleGoToLogin = () => {
    router.push('/login');
  };
  
  const handleCancel = () => {
    router.push('/');
  }

  const isPageLoading = authLoading || maintenanceLoading;

  if (isPageLoading) {
    return (
       <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
        <div className="w-full max-w-[412px] flex flex-col flex-1">
          <div className="p-4 pt-0">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
            <h1 className="text-2xl font-bold self-start mb-4">Settings</h1>
            <SettingsPageSkeleton />
          </main>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
       <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to access settings. Please log in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToLogin}>Go to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
           <h1 className="text-2xl font-bold self-start mb-4">Settings</h1>
          <SettingsPage />
        </main>
      </div>
    </div>
  );
}
