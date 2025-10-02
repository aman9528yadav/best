
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { ref, onValue, set, remove } from "firebase/database";
import { rtdb } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { isToday, differenceInCalendarDays, startOfDay, isYesterday } from 'date-fns';

export type ActivityType = 'conversion' | 'calculator' | 'date_calculation' | 'note';

export type ActivityLogItem = {
    timestamp: string;
    type: ActivityType;
};

export type UserStats = {
  allTimeActivities: number;
  todayActivities: number;
  lastActivityDate: string | null;
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
  activityLog: ActivityLogItem[];
  photoUrl?: string;
  photoId?: string;
};

type ProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile | ((prevState: UserProfile) => UserProfile)) => void;
  updateStats: (type: ActivityType) => void;
  checkAndUpdateStreak: () => void;
  isLoading: boolean;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => NoteItem;
  updateNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  deleteNotePermanently: (id: string) => void;
  restoreNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  getNoteById: (id: string) => NoteItem | undefined;
  deleteAllUserData: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultStats: UserStats = {
    allTimeActivities: 0,
    todayActivities: 0,
    lastActivityDate: null,
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
    activityLog: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
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
    notes: [],
    activityLog: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, logout } = useAuth();
  
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
            const activityLog = parsedProfile.activityLog || [];
            setProfileState({ ...guestProfileDefault, ...parsedProfile, stats, notes, activityLog });
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
      const userRef = ref(rtdb, `users/${user.uid}/profile`);
      
      const unsubscribe = onValue(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const fetchedData = snapshot.val() as Partial<UserProfile>;
          
          const stats = { ...defaultStats, ...(fetchedData.stats || {}) };
          const notes = fetchedData.notes || [];
          const activityLog = fetchedData.activityLog || [];

          const fullProfile = {
            ...getInitialProfile(),
            ...fetchedData,
            name: fetchedData.name || user.displayName || "New User",
            email: user.email || fetchedData.email || "",
            stats,
            notes,
            activityLog,
          };
          setProfileState(fullProfile);

        } else {
          const newProfile: UserProfile = {
            ...guestProfileDefault,
            email: user.email || '',
            name: user.displayName || 'New User',
            stats: defaultStats,
            notes: [],
            activityLog: [],
            photoUrl: user.photoURL || guestProfileDefault.photoUrl,
            photoId: guestProfileDefault.photoId
          };
          await set(userRef, newProfile);
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
            const userRef = ref(rtdb, `users/${user.uid}/profile`);
            set(userRef, updatedProfile).catch(error => {
                 console.error("Failed to save profile to Realtime DB", error);
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
    updateStats('note');
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
    if (!dataLoaded.current) return;

    setProfile(prevProfile => {
        const today = startOfDay(new Date());
        const lastOpen = prevProfile.stats.lastAppOpenDate ? startOfDay(new Date(prevProfile.stats.lastAppOpenDate)) : null;

        if (lastOpen && isToday(lastOpen)) {
            return prevProfile;
        }
        
        const newStats = { ...prevProfile.stats };
        
        if (lastOpen && isYesterday(lastOpen)) {
            newStats.streak = (newStats.streak || 0) + 1;
        } else if (!lastOpen || !isToday(lastOpen)) {
            newStats.streak = 1;
        }

        if(!lastOpen || !isToday(lastOpen)) {
           newStats.daysActive = (newStats.daysActive || 0) + 1;
        }

        newStats.lastAppOpenDate = today.toISOString();
        
        return { ...prevProfile, stats: newStats };
    });
  };

  const updateStats = (type: ActivityType) => {
    setProfile(prevProfile => {
      const todayISO = new Date().toISOString();
      const newStats = { ...prevProfile.stats };
      const newActivityLog = [...prevProfile.activityLog, { timestamp: todayISO, type }];

      newStats.allTimeActivities = (newStats.allTimeActivities || 0) + 1;

      const lastActivityDate = newStats.lastActivityDate;
      if (lastActivityDate && isToday(new Date(lastActivityDate))) {
        newStats.todayActivities = (newStats.todayActivities || 0) + 1;
      } else {
        newStats.todayActivities = 1;
      }
      
      newStats.lastActivityDate = todayISO;

      return {
        ...prevProfile,
        stats: newStats,
        activityLog: newActivityLog,
      };
    });
  };
  
  const deleteAllUserData = async () => {
    if (user) {
        const userRef = ref(rtdb, `users/${user.uid}`);
        await remove(userRef);
    }
    // Clear all local storage keys used by the app
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('unitwise_')) {
            localStorage.removeItem(key);
        }
    });
    // Reset state to default and log out
    setProfileState(getInitialProfile());
    logout();
  };

  return (
    <ProfileContext.Provider value={{ 
        profile, 
        setProfile, 
        updateStats, 
        checkAndUpdateStreak, 
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        deleteNotePermanently,
        restoreNote,
        toggleFavoriteNote,
        getNoteById,
        deleteAllUserData,
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
