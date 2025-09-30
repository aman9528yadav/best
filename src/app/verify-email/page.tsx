"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const { user, resendVerificationEmail, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Try to get email from URL params first, then from auth context
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user, searchParams]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Check for verification status
  useEffect(() => {
    if (authLoading) return;

    const interval = setInterval(async () => {
      await user?.reload();
      if (user?.emailVerified) {
        clearInterval(interval);
        toast({
          title: "Email Verified!",
          description: "Redirecting you to the dashboard...",
        });
        router.push('/auth-action?action=signup');
      }
    }, 3000); // Check every 3 seconds

    if(user && user.emailVerified){
        clearInterval(interval);
        router.push('/auth-action?action=signup');
    }

    return () => clearInterval(interval);
  }, [user, router, toast, authLoading]);

  const handleResend = async () => {
    if (canResend && user) {
      setCanResend(false);
      setResendCooldown(30);
      await resendVerificationEmail();
    }
  };


  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-100/30 via-purple-100/30 to-blue-100/30 text-foreground p-4">
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <MailCheck className="h-20 w-20 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Verify Your Email</h1>
            <p className="text-muted-foreground mt-2">
              A verification link has been sent to <span className="font-bold text-primary">{email || 'your email'}</span>. Please check your inbox and click the link to activate your account.
            </p>
             <p className="text-sm text-muted-foreground mt-4">
                Once verified, you will be automatically redirected.
            </p>
          </div>
         
          <Button onClick={handleResend} disabled={!canResend} className="w-full">
            {canResend ? 'Resend Email' : `Resend in ${resendCooldown}s`}
          </Button>

            <p className="text-sm text-muted-foreground">
                Wrong email? <Link href="/login" className="text-primary font-medium hover:underline">Go back</Link>
            </p>
        </CardContent>
      </Card>
       <Button asChild variant="ghost" className="mt-8 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
