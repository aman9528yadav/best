
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { sendPasswordReset } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPasswordReset(email);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Card className="w-full bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Forgot Your Password?</h2>
            <p className="text-sm text-muted-foreground mt-2">
              No problem. Enter your email below and we'll send you a link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              Send Reset Link
            </Button>
          </form>
        </CardContent>
      </Card>
      <Button asChild variant="ghost" className="mt-6 text-muted-foreground">
        <Link href="/login">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
      </Button>
    </div>
  );
}
