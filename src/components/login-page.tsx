
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.25,44,30.413,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);


export function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
        toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
        return;
    }
    await signInWithEmail(loginEmail, loginPassword);
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
        toast({ title: "Missing Fields", description: "Please fill out all password fields.", variant: "destructive" });
        return;
    }
    if (signupPassword !== signupConfirmPassword) {
        toast({ title: "Passwords Do Not Match", description: "Please ensure your passwords match.", variant: "destructive" });
        return;
    }
    await signUpWithEmail(signupEmail, signupPassword, signupFullName);
  }


  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Card className="w-full bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-200/50 rounded-xl">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-6 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome to Sutradhaar</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  I am Aman Yadav, by loging you can unlock many features like setting notification and ai serch
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email or Username</Label>
                  <Input id="email" type="email" placeholder="name@example.com" className="bg-white/70" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={passwordVisible ? 'text' : 'password'} placeholder="********" className="bg-white/70" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                 <div className="flex items-center justify-between pt-2">
                    <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                    </Link>
                    <Button type="submit" className="gap-2">
                    Login <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
              </form>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 border-t"></div>
              </div>

              <Button variant="outline" className="w-full gap-2 bg-white" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                Sign in with Google
              </Button>

              <p className="text-center text-sm">
                Don't have an account?{' '}
                <Link href="#" className="font-semibold text-primary hover:underline">
                  Sign Up
                </Link>
              </p>
               <p className="text-center text-xs text-muted-foreground px-4">
                By continuing, you agree to our{' '}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy.
                </Link>
              </p>

            </TabsContent>
            <TabsContent value="signup" className="pt-6 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Create your Sutradhaar Account</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Start converting with a personalized workspace
                    </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" type="text" placeholder="Aman Yadav" className="bg-white/70" value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="you@domain.com" className="bg-white/70" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                            <Input id="signup-password" type={passwordVisible ? 'text' : 'password'} placeholder="Create a strong password" className="bg-white/70" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.2 -translate-y-1.2 h-7 w-7 text-muted-foreground" onClick={() => setPasswordVisible(!passwordVisible)}>
                                {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                            <Input id="confirm-password" type={confirmPasswordVisible ? 'text' : 'password'} placeholder="Re-enter your password" className="bg-white/70" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.2 -translate-y-1.2 h-7 w-7 text-muted-foreground" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                                {confirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     <div className="flex items-center justify-between pt-2">
                        <Button variant="link" className="text-muted-foreground">Skip for now</Button>
                        <Button type="submit" className="gap-2">
                             <UserPlus className="h-4 w-4" />
                             Sign Up
                        </Button>
                    </div>
                </form>
                 <p className="text-center text-xs text-muted-foreground px-4">
                    By creating an account, you agree to our{' '}
                    <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                    </Link> and <Link href="#" className="text-primary hover:underline">
                    Terms of Service.
                    </Link>
                </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
       <Button asChild variant="ghost" className="mt-6 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Skip to App
        </Link>
      </Button>
    </div>
  );
}

    