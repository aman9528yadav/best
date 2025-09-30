
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-foreground p-4">
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <MailCheck className="h-20 w-20 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Verify Your Email</h1>
            <p className="text-muted-foreground mt-2">
              We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or try resending the email from the login page.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
