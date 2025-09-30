
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
    AuthCredential
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
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
      router.push('/welcome');
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/welcome');
    } catch (error: any) {
        console.error("Error signing in with email", error);
        toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
        });
    }
  }
  
  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName: fullName });
        }
        // Manually update the user state to reflect the new display name immediately
        setUser({ ...userCredential.user, displayName: fullName });
        toast({
            title: "Congratulations!",
            description: "Your account has been created successfully.",
        });
        router.push('/welcome');
    } catch (error: any) {
        console.error("Error signing up with email", error);
        toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
        });
    }
  }


  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
      {!loading && children}
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
