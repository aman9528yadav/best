
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { isToday, differenceInCalendarDays, startOfDay } from 'date-fns';

export type UserStats = {
  allTimeConversions: number;
  todayConversions: number;
  lastConversionDate: string | null;
  streak: number;
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  skills: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
  stats: UserStats;
};

type ProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateStatsForNewConversion: () => void;
  isLoading: boolean;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultStats: UserStats = {
    allTimeConversions: 0,
    todayConversions: 0,
    lastConversionDate: null,
    streak: 0,
};

const getInitialProfile = (): UserProfile => {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
    skills: [],
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
      instagram: "",
    },
    stats: defaultStats,
  };
};

const guestProfileDefault: UserProfile = {
    name: "Guest User",
    email: "",
    phone: "",
    address: "",
    birthday: "",
    skills: [],
    socialLinks: {
        linkedin: "",
        twitter: "",
        github: "",
        instagram: "",
    },
    stats: defaultStats
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // This effect runs when auth state is resolved.
    if (!authLoading) {
      if (user) {
        // User is logged in, do nothing here. The other useEffect will handle Firestore.
      } else {
        // User is a guest. Load from localStorage.
        try {
          const savedProfile = localStorage.getItem('unitwise_profile');
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            // Ensure stats object is not missing
            if (!parsedProfile.stats) {
              parsedProfile.stats = defaultStats;
            }
            setProfileState(parsedProfile);
          } else {
            setProfileState(guestProfileDefault);
          }
        } catch (error) {
          console.error("Failed to load guest profile from localStorage", error);
          setProfileState(guestProfileDefault);
        } finally {
            setIsLoading(false);
        }
      }
    }
  }, [authLoading, user]);

  useEffect(() => {
    // This effect handles Firestore subscription for logged-in users.
    if (user) {
      setIsLoading(true);
      const docRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(docRef, async (snapshot) => {
        if (snapshot.exists()) {
          const fetchedData = snapshot.data() as UserProfile;
          const today = startOfDay(new Date()).toISOString().split('T')[0];
          
          if (!fetchedData.stats) {
            fetchedData.stats = defaultStats;
          }

          if (fetchedData.stats.lastConversionDate !== today) {
            fetchedData.stats.todayConversions = 0;
          }
          setProfileState(fetchedData);
        } else {
          // Create a new profile for a new user if it doesn't exist
          const newProfile: UserProfile = {
            ...getInitialProfile(),
            email: user.email || '',
            name: user.displayName || 'New User',
          };
          await setDoc(docRef, newProfile);
          setProfileState(newProfile);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error listening to profile changes:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);


  const setProfile = async (newProfileData: UserProfile | ((prevState: UserProfile) => UserProfile)) => {
    const newProfile = typeof newProfileData === 'function' ? newProfileData(profile) : newProfileData;
    setProfileState(newProfile);
    
    if (user) {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, newProfile, { merge: true });
    } else {
        try {
          localStorage.setItem('unitwise_profile', JSON.stringify(newProfile));
        } catch (error) {
          console.error("Failed to save profile to localStorage", error);
        }
    }
  };

  const updateStatsForNewConversion = () => {
    const newStats = {...profile.stats};
    const today = startOfDay(new Date());

    newStats.allTimeConversions = (newStats.allTimeConversions || 0) + 1;

    const lastDate = newStats.lastConversionDate ? startOfDay(new Date(newStats.lastConversionDate)) : null;

    if (lastDate && isToday(lastDate)) {
        newStats.todayConversions = (newStats.todayConversions || 0) + 1;
    } else {
        newStats.todayConversions = 1;
    }
    
    if (lastDate && differenceInCalendarDays(today, lastDate) === 1) {
        newStats.streak = (newStats.streak || 0) + 1;
    } else if (!lastDate || differenceInCalendarDays(today, lastDate) > 1) {
        newStats.streak = 1;
    }

    newStats.lastConversionDate = today.toISOString();
    
    setProfile(prevProfile => ({ ...prevProfile, stats: newStats }));
};


  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateStatsForNewConversion, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
