
"use client";

import React, { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { LogIn, LogOut, UserPlus, CheckCircle } from 'lucide-react';

const actionDetails = {
    login: {
        icon: LogIn,
        title: "Welcome Back!",
        message: "You are now logged in. Redirecting...",
        redirect: "/"
    },
    signup: {
        icon: UserPlus,
        title: "Account Created!",
        message: "Your account has been successfully created. Redirecting...",
        redirect: "/profile/edit"
    },
    logout: {
        icon: LogOut,
        title: "Logging Out",
        message: "You have been successfully logged out. Redirecting...",
        redirect: "/login"
    },
    default: {
        icon: CheckCircle,
        title: "Success!",
        message: "Redirecting...",
        redirect: "/"
    }
};

export default function AuthActionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') as keyof typeof actionDetails | null;

  const details = useMemo(() => {
    return (action && actionDetails[action]) ? actionDetails[action] : actionDetails.default;
  }, [action]);

  const { icon: Icon, title, message, redirect } = details;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirect);
    }, 2000); 

    return () => clearTimeout(timer);
  }, [router, redirect]);

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
                <Icon className="h-24 w-24 text-primary" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground">
                    {message}
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
