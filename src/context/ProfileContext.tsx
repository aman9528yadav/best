
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const { user, loading } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
        if (user) {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const fetchedData = docSnap.data() as UserProfile;
                 // Check and reset todayConversions if last conversion was not today
                const today = startOfDay(new Date()).toISOString().split('T')[0];
                if (fetchedData.stats.lastConversionDate !== today) {
                    fetchedData.stats.todayConversions = 0;
                }
                setProfileState(fetchedData);
            } else {
                // Create a new profile for a new user
                const newProfile: UserProfile = {
                    ...getInitialProfile(),
                    email: user.email || '',
                    name: user.displayName || 'New User',
                };
                await setDoc(docRef, newProfile);
                setProfileState(newProfile);
            }
        } else {
            // Load from localStorage for guest users
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
        }
         setIsLoaded(true);
    };

    if(!loading) {
       loadProfile();
    }

  }, [user, loading]);


  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (user) {
        // Save to Firestore for logged-in users
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, newProfile, { merge: true });
    } else {
        // Save to localStorage for guests
        if (isLoaded) {
          try {
            localStorage.setItem('unitwise_profile', JSON.stringify(newProfile));
          } catch (error) {
            console.error("Failed to save profile to localStorage", error);
          }
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
    <ProfileContext.Provider value={{ profile, setProfile, updateStatsForNewConversion }}>
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
