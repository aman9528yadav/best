
"use client";

import React, { useState, useEffect } from 'react';
import { TodoPage } from '@/components/todo-page';
import { TodoPageSkeleton } from '@/components/todo-page-skeleton';
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

export default function Todos() {
  const { user, loading: authLoading } = useAuth();
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
    <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
      {isPageLoading ? (
        <TodoPageSkeleton />
      ) : user ? (
        <TodoPage />
      ) : (
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Authentication Required</AlertDialogTitle>
              <AlertDialogDescription>
                You need to be logged in to manage your todos. Please log in to continue.
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
  );
}
