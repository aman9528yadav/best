
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
    phone: "91-XXXXXXXXXX",
    address: "New Delhi, India",
    birthday: "January 1, 2000",
    skills: ["Learning", "Exploring"],
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
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    dataLoaded.current = false;
    
    const loadGuestData = () => {
        try {
          const savedProfile = localStorage.getItem('unitwise_profile');
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            const stats = { ...defaultStats, ...(parsedProfile.stats || {}) };
            setProfileState({ ...guestProfileDefault, ...parsedProfile, stats });
          } else {
            setProfileState(guestProfileDefault);
          }
        } catch (error) {
          console.error("Failed to load guest profile from localStorage", error);
          setProfileState(guestProfileDefault);
        } finally {
            setIsLoading(false);
            dataLoaded.current = true;
        }
    };
    
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
            name: fetchedData.name || user.displayName || "New User",
            email: user.email || fetchedData.email || "",
            stats,
          };
          setProfileState(fullProfile);

        } else {
          // Create a new profile for a new user if it doesn't exist
          const newProfile: UserProfile = {
            ...guestProfileDefault, // Start with defaults
            email: user.email || '',
            name: user.displayName || 'New User',
            stats: defaultStats,
          };
          await setDoc(docRef, newProfile);
          setProfileState(newProfile);
        }
        setIsLoading(false);
        dataLoaded.current = true;
      }, (error) => {
        console.error("Error listening to profile changes:", error);
        loadGuestData(); // Fallback to guest data on error
      });

      return () => unsubscribe();
    } else {
        loadGuestData();
    }
  }, [user, authLoading]);

  const setProfile = (newProfileData: UserProfile | ((prevState: UserProfile) => UserProfile)) => {
    setProfileState(currentProfile => {
        const updatedProfile = typeof newProfileData === 'function' ? newProfileData(currentProfile) : newProfileData;
        
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

    if (lastOpen && isToday(lastOpen)) {
      return;
    }

    setProfile(prevProfile => {
        const newStats = { ...prevProfile.stats };
        
        if (lastOpen && isYesterday(lastOpen)) {
            newStats.streak = (newStats.streak || 0) + 1;
        } else if (!lastOpen || !isToday(lastOpen)) {
            newStats.streak = 1;
        }

        newStats.lastAppOpenDate = today.toISOString();
        
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
