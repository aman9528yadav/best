
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { isToday, differenceInCalendarDays, startOfDay, isYesterday } from 'date-fns';

export type UserStats = {
  allTimeConversions: number;
  todayConversions: number;
  lastConversionDate: string | null;
  lastAppOpenDate: string | null;
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
  setProfile: (profile: UserProfile | ((prevState: UserProfile) => UserProfile)) => void;
  updateStatsForNewConversion: () => void;
  checkAndUpdateStreak: () => void;
  isLoading: boolean;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultStats: UserStats = {
    allTimeConversions: 0,
    todayConversions: 0,
    lastConversionDate: null,
    lastAppOpenDate: null,
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
            // Ensure stats object is not missing and has all properties
            const stats = { ...defaultStats, ...(parsedProfile.stats || {}) };
            setProfileState({ ...parsedProfile, stats });
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
          const fetchedData = snapshot.data() as Partial<UserProfile>;
          const today = startOfDay(new Date()).toISOString().split('T')[0];
          
          const stats = { ...defaultStats, ...(fetchedData.stats || {}) };

          if (stats.lastConversionDate !== today) {
            stats.todayConversions = 0;
          }

          const fullProfile = {
            ...getInitialProfile(),
            ...fetchedData,
            name: fetchedData.name || user.displayName || "New User", // Prioritize fetched name, then auth name
            stats,
          };
          setProfileState(fullProfile);

        } else {
          // Create a new profile for a new user if it doesn't exist
          const newProfile: UserProfile = {
            ...getInitialProfile(),
            email: user.email || '',
            name: user.displayName || 'New User', // Use the displayName from AuthContext
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
    
    // Use a functional update for the state to avoid race conditions
    setProfileState(currentProfile => {
        const updatedProfile = typeof newProfileData === 'function' ? newProfileData(currentProfile) : newProfileData;
        
        // Now save to persistence layer
        if (user) {
            const docRef = doc(db, 'users', user.uid);
            setDoc(docRef, updatedProfile, { merge: true });
        } else {
            try {
              localStorage.setItem('unitwise_profile', JSON.stringify(updatedProfile));
            } catch (error) {
              console.error("Failed to save profile to localStorage", error);
            }
        }
        return updatedProfile;
    });
  };

  const checkAndUpdateStreak = () => {
    const today = startOfDay(new Date());
    const lastOpen = profile.stats.lastAppOpenDate ? startOfDay(new Date(profile.stats.lastAppOpenDate)) : null;

    // Only run this logic once per day
    if (lastOpen && isToday(lastOpen)) {
      return;
    }

    setProfile(prevProfile => {
        const newStats = { ...prevProfile.stats };
        
        // Update streak
        if (lastOpen && isYesterday(lastOpen)) {
            newStats.streak = (newStats.streak || 0) + 1;
        } else if (!lastOpen || !isToday(lastOpen)) {
            // Reset streak if last open was not yesterday or today
            newStats.streak = 1;
        }

        newStats.lastAppOpenDate = today.toISOString();
        
        // Reset today's conversions if it's a new day
        const lastConversion = prevProfile.stats.lastConversionDate ? startOfDay(new Date(prevProfile.stats.lastConversionDate)) : null;
        if (!lastConversion || !isToday(lastConversion)) {
            newStats.todayConversions = 0;
        }

        return { ...prevProfile, stats: newStats };
    });
  };


  const updateStatsForNewConversion = () => {
    setProfile(prevProfile => {
        const newStats = {...prevProfile.stats};
        const todayISO = startOfDay(new Date()).toISOString();

        newStats.allTimeConversions = (newStats.allTimeConversions || 0) + 1;
        
        const lastConversionDate = newStats.lastConversionDate;
        if (lastConversionDate && startOfDay(new Date(lastConversionDate)).toISOString().split('T')[0] === todayISO.split('T')[0]) {
             newStats.todayConversions = (newStats.todayConversions || 0) + 1;
        } else {
             newStats.todayConversions = 1;
        }
        newStats.lastConversionDate = todayISO;

        return { ...prevProfile, stats: newStats };
    });
  };


  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateStatsForNewConversion, checkAndUpdateStreak, isLoading }}>
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
