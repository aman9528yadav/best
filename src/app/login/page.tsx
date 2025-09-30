
"use client";

import React, { useState, useEffect } from 'react';
import { LoginPage } from '@/components/login-page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is already logged in, go to dashboard.
        // The /welcome redirect is handled by the auth context on successful login action.
        router.push('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);


  if (loading || user) {
     return (
       <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground p-4">
            <div className="w-full max-w-sm mx-auto animate-pulse">
                <div className="bg-white/50 rounded-xl shadow-lg h-[600px]"></div>
            </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground p-4">
        {isLoading ? (
            <div className="w-full max-w-sm mx-auto animate-pulse">
                <div className="bg-white/50 rounded-xl shadow-lg h-[600px]"></div>
            </div>
        ) : (
            <LoginPage />
        )}
    </div>
  );
}
