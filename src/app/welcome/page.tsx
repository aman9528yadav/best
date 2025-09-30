
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { HandshakeIcon } from '@/components/ui/icons';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000); 

    return () => clearTimeout(timer);
  }, [router]);
  
  const displayName = user?.displayName || profile.name || 'Guest';

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <HandshakeIcon className="h-24 w-24 text-primary" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold">Welcome, {displayName}!</h1>
                <p className="text-muted-foreground">
                    You are now logged in. Redirecting to your dashboard...
                </p>
            </motion.div>

             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute bottom-16 text-sm text-muted-foreground"
            >
                Made by Aman, Made in India
            </motion.div>
        </main>
      </div>
    </div>
  );
}
