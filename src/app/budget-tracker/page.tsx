
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { BudgetTrackerPage } from '@/components/budget-tracker-page';
import { BudgetTrackerPageSkeleton } from '@/components/budget-tracker-page-skeleton';
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
import { useProfile } from '@/context/ProfileContext';

export default function BudgetTracker() {
  const { user, loading: authLoading } from 'useAuth';
  const { isLoading: profileLoading } = useProfile();
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

  const isPageLoading = authLoading || profileLoading;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
          {isPageLoading ? (
            <BudgetTrackerPageSkeleton />
          ) : user ? (
            <BudgetTrackerPage />
          ) : (
            <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                  <AlertDialogDescription>
                    You need to be logged in to manage your budget. Please log in to continue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGoToLogin}>Go to Login</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </main>
      </div>
    </div>
  );
}
