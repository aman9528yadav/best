
"use client";

import React, { useState, useEffect } from 'react';
import { LoginPage } from '@/components/login-page';
import { WelcomePage } from '@/app/welcome/page';

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };


  if (isLoggedIn) {
    return <WelcomePage />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground p-4">
        {isLoading ? (
            <div className="w-full max-w-sm mx-auto animate-pulse">
                <div className="bg-white/50 rounded-xl shadow-lg h-[600px]"></div>
            </div>
        ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess}/>
        )}
    </div>
  );
}
