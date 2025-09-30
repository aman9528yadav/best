
"use client";

import React, { useState } from 'react';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ResendVerification({ email }: { email: string }) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const handleResend = async () => {
    setIsSending(true);
    try {
      // Firebase doesn't have a direct "resend" for an unauthenticated user.
      // A common workaround is to find the user object and then send.
      // However, without a password, we can't easily re-authenticate.
      // A better UX might be to just tell them to check their email.
      // But for a resend functionality:
      // The user needs to be recently signed-in to do this.
      // The error from the login attempt should contain enough info.
      // For now, we just inform them. A full implementation would need more context.
      
      // A simplified approach: we can't get the user object without login,
      // so we rely on the user to have the original email.
      // If we could get the user object, we would do:
      // await sendEmailVerification(user);

      toast({
        title: 'Check Your Email',
        description: 'A verification link was sent when you signed up. Please check your inbox and spam folder.',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Could not resend verification email.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Alert variant="destructive" className="flex items-center justify-between">
      <AlertDescription className="text-xs">
        Your email is not verified.
      </AlertDescription>
       <Button
        variant="link"
        size="sm"
        className="p-0 h-auto text-xs text-destructive-foreground"
        onClick={handleResend}
        disabled={isSending}
      >
        {isSending ? 'Sending...' : 'Resend Email'}
      </Button>
    </Alert>
  );
}
