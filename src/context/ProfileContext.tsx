
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
  daysActive: number;
};

export type NoteItem = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
    isTrashed: boolean;
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
  notes: NoteItem[];
};

type ProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile | ((prevState: UserProfile) => UserProfile)) => void;
  updateStatsForNewConversion: () => void;
  checkAndUpdateStreak: () => void;
  isLoading: boolean;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => NoteItem;
  updateNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  deleteNotePermanently: (id: string) => void;
  restoreNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  getNoteById: (id: string) => NoteItem | undefined;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultStats: UserStats = {
    allTimeConversions: 0,
    todayConversions: 0,
    lastConversionDate: null,
    lastAppOpenDate: null,
    streak: 0,
    daysActive: 0,
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
    notes: [],
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
    stats: defaultStats,
    notes: []
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  // Ref to track if initial data load is complete
  const dataLoaded = useRef(false);

  // Effect to load and sync profile data
  useEffect(() => {
    if (authLoading) return;
    
    dataLoaded.current = false;
    
    const loadGuestData = () => {
        try {
          const savedProfile = localStorage.getItem('unitwise_profile');
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            // Ensure stats and notes have default values if missing
            const stats = { ...defaultStats, ...(parsedProfile.stats || {}) };
            const notes = parsedProfile.notes || [];
            setProfileState({ ...guestProfileDefault, ...parsedProfile, stats, notes });
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
          const notes = fetchedData.notes || [];

          if (stats.lastConversionDate !== today) {
            stats.todayConversions = 0;
          }

          const fullProfile = {
            ...getInitialProfile(),
            ...fetchedData,
            name: fetchedData.name || user.displayName || "New User",
            email: user.email || fetchedData.email || "",
            stats,
            notes,
          };
          setProfileState(fullProfile);

        } else {
          const newProfile: UserProfile = {
            ...guestProfileDefault,
            email: user.email || '',
            name: user.displayName || 'New User',
            stats: defaultStats,
            notes: [],
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
            setDoc(docRef, updatedProfile, { merge: true }).catch(error => {
                 console.error("Failed to save profile to Firestore", error);
            });
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
  
  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): NoteItem => {
    const newNote: NoteItem = {
      ...note,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(p => ({ ...p, notes: [newNote, ...p.notes] }));
    return newNote;
  };
  
  const updateNote = (noteToUpdate: NoteItem) => {
    const updatedNote = { ...noteToUpdate, updatedAt: new Date().toISOString() };
    setProfile(p => ({ ...p, notes: p.notes.map(n => n.id === updatedNote.id ? updatedNote : n) }));
  };

  const deleteNote = (id: string) => {
    setProfile(p => ({
        ...p,
        notes: p.notes.map(n => n.id === id ? {...n, isTrashed: true, updatedAt: new Date().toISOString()} : n)
    }));
  };
  
  const deleteNotePermanently = (id: string) => {
    setProfile(p => ({ ...p, notes: p.notes.filter(n => n.id !== id) }));
  };

  const restoreNote = (id: string) => {
    setProfile(p => ({
        ...p,
        notes: p.notes.map(n => n.id === id ? {...n, isTrashed: false, updatedAt: new Date().toISOString()} : n)
    }));
  };

  const toggleFavoriteNote = (id: string) => {
    setProfile(p => ({
        ...p,
        notes: p.notes.map(n => n.id === id ? {...n, isFavorite: !n.isFavorite} : n)
    }));
  };
  
  const getNoteById = (id: string): NoteItem | undefined => {
      return profile.notes.find(n => n.id === id);
  }

  const checkAndUpdateStreak = () => {
    // Only run if data has been loaded
    if (!dataLoaded.current) return;

    setProfile(prevProfile => {
        const today = startOfDay(new Date());
        const lastOpen = prevProfile.stats.lastAppOpenDate ? startOfDay(new Date(prevProfile.stats.lastAppOpenDate)) : null;

        // If we already updated today, do nothing.
        if (lastOpen && isToday(lastOpen)) {
            return prevProfile;
        }
        
        const newStats = { ...prevProfile.stats };
        
        if (lastOpen && isYesterday(lastOpen)) {
            newStats.streak += 1;
            newStats.daysActive += 1;
        } else if (!lastOpen || !isToday(lastOpen)) { // First time open or missed a day
            newStats.streak = 1;
            newStats.daysActive += 1;
        }

        newStats.lastAppOpenDate = today.toISOString();
        
        // Reset today's conversion count if it's a new day
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
        const todayISO = new Date().toISOString();

        newStats.allTimeConversions = (newStats.allTimeConversions || 0) + 1;
        
        const lastConversionDate = newStats.lastConversionDate;
        if (lastConversionDate && isToday(new Date(lastConversionDate))) {
             newStats.todayConversions = (newStats.todayConversions || 0) + 1;
        } else {
             newStats.todayConversions = 1;
        }
        newStats.lastConversionDate = todayISO;

        return { ...prevProfile, stats: newStats };
    });
  };

  return (
    <ProfileContext.Provider value={{ 
        profile, 
        setProfile, 
        updateStatsForNewConversion, 
        checkAndUpdateStreak, 
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        deleteNotePermanently,
        restoreNote,
        toggleFavoriteNote,
        getNoteById,
    }}>
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
