
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
    name: "Aman Yadav",
    email: "amanyadavyadav9458@gmail.com",
    phone: "+91 7037652730",
    address: "Manirampur bewar",
    birthday: "December 5th, 2025",
    skills: ["React", "developed"],
    socialLinks: {
      linkedin: "#",
      twitter: "#",
      github: "#",
      instagram: "#",
    },
    stats: defaultStats,
  };
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Handle guest users (not logged in)
    if (!authLoading && !user) {
      try {
        const savedProfile = localStorage.getItem('unitwise_profile');
        if (savedProfile) {
          setProfileState(JSON.parse(savedProfile));
        } else {
          setProfileState(getInitialProfile());
        }
      } catch (error) {
        console.error("Failed to load profile from localStorage", error);
        setProfileState(getInitialProfile());
      }
      setIsLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    // Handle authenticated users
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(docRef, async (snapshot) => {
        if (snapshot.exists()) {
          const fetchedData = snapshot.data() as UserProfile;
          const today = startOfDay(new Date()).toISOString().split('T')[0];
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


  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (user) {
        // Save to Firestore for logged-in users
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, newProfile, { merge: true });
    } else {
        // Save to localStorage for guests
        try {
          localStorage.setItem('unitwise_profile', JSON.stringify(newProfile));
        } catch (error) {
          console.error("Failed to save profile to localStorage", error);
        }
    }
  };

  const updateStatsForNewConversion = () => {
    setProfileState(prevProfile => {
      const today = startOfDay(new Date());
      const newStats = { ...prevProfile.stats };

      newStats.allTimeConversions += 1;
      
      const lastDate = prevProfile.stats.lastConversionDate ? startOfDay(new Date(prevProfile.stats.lastConversionDate)) : null;
      
      if (lastDate && isToday(lastDate)) {
        newStats.todayConversions += 1;
      } else {
        newStats.todayConversions = 1;
      }

      if (lastDate && differenceInCalendarDays(today, lastDate) === 1) {
        newStats.streak += 1;
      } else if (!lastDate || differenceInCalendarDays(today, lastDate) > 1) {
        newStats.streak = 1;
      }
      
      newStats.lastConversionDate = today.toISOString();

      const updatedProfile = { ...prevProfile, stats: newStats };
      
      // Asynchronously update the database/localStorage
      setProfile(updatedProfile);

      return updatedProfile;
    });
  };


  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateStatsForNewConversion, isLoading }}>
      {!isLoading ? children : null}
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
