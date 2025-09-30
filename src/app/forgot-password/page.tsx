
"use client";

import React from 'react';
import { ForgotPasswordPage } from '@/components/forgot-password-page';

export default function ForgotPassword() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground p-4">
        <ForgotPasswordPage />
    </div>
  );
}
