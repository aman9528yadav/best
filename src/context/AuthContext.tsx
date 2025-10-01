
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    AuthCredential,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from './ProfileContext';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/auth-action?action=login');
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        if (!userCredential.user.emailVerified) {
            router.push(`/verify-email?email=${email}`);
            return userCredential.user;
        }
        router.push('/auth-action?action=login');
        return userCredential.user;
    } catch (error: any) {
        console.error("Error signing in with email", error);
        toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
        });
        return null;
    }
  }
  
  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName: fullName });
            await sendEmailVerification(userCredential.user);
            // Manually trigger a state update for the user to reflect the new display name immediately
            setUser(auth.currentUser); 
        }
        toast({
            title: "Congratulations!",
            description: "Your account has been created. Please check your email to verify your account.",
        });
        router.push(`/verify-email?email=${email}`);
    } catch (error: any) {
        console.error("Error signing up with email", error);
        toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
        });
    }
  }
  
  const resendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({
          title: "Verification Email Sent",
          description: "A new verification link has been sent to your email address.",
        });
      } catch (error: any) {
        console.error("Error resending verification email", error);
        toast({
          title: "Error",
          description: "Could not send verification email. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
        toast({ title: "Not logged in", description: "You need to be logged in to resend a verification email.", variant: "destructive"})
    }
  };


  const changePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!user || !user.email) {
      toast({ title: "Not authenticated", description: "You must be logged in to change your password.", variant: "destructive" });
      return false;
    }
    
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      return true;
    } catch (error: any) {
      console.error("Error changing password", error);
      let description = "An unknown error occurred.";
      if (error.code === 'auth/wrong-password') {
        description = "The current password you entered is incorrect. Please try again.";
      }
       toast({
        title: "Password Change Failed",
        description: description,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Error sending password reset email', error);
      toast({
        title: 'Error',
        description: 'Could not send password reset email. Please try again.',
        variant: 'destructive',
      });
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/auth-action?action=logout');
    } catch (error: any) {
      console.error("Error signing out", error);
       toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail, logout, changePassword, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
