

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { ref, onValue, set, remove } from "firebase/database";
import { rtdb } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { isToday, differenceInCalendarDays, startOfDay, isYesterday } from 'date-fns';

export type ActivityType = 'conversion' | 'calculator' | 'date_calculation' | 'note' | 'todo';

export type ActivityLogItem = {
    timestamp: string;
    type: ActivityType;
};

export type ConversionHistoryItem = {
  id: string;
  type: 'conversion';
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
  timestamp: string; // Use ISO string for serialization
};

export type CalculatorHistoryItem = {
  id: string;
  type: 'calculator';
  expression: string;
  result: string;
  timestamp: string; // Use ISO string for serialization
};

export type DateCalculationHistoryItem = {
  id: string;
  type: 'date_calculation';
  calculationType: string;
  details: any;
  timestamp: string;
};

export type FavoriteItem = {
  id: string;
  type: 'favorite';
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
};

export type HistoryItem = ConversionHistoryItem | CalculatorHistoryItem | DateCalculationHistoryItem;

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

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  targetDate?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
};

export type QuickAccessItemOrder = {
  id: string;
  hidden: boolean;
};

export type HSLColor = {
    h: number;
    s: number;
    l: number;
};

export type CustomTheme = {
    background: HSLColor;
    foreground: HSLColor;
    primary: HSLColor;
    accent: HSLColor;
};

export type UserSettings = {
    saveHistory: boolean;
    customTheme?: CustomTheme;
};

export type Membership = 'guest' | 'member' | 'premium' | 'owner';

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
  membership: Membership;
  settings: UserSettings;
  stats: UserStats;
  notes: NoteItem[];
  todos: TodoItem[];
  activityLog: ActivityLogItem[];
  quickAccessOrder?: QuickAccessItemOrder[];
  photoUrl?: string;
  photoId?: string;
  history: HistoryItem[];
  favorites: FavoriteItem[];
};

type ProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile | ((prevState: UserProfile) => UserProfile)) => void;
  checkAndUpdateStreak: () => void;
  isLoading: boolean;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => NoteItem;
  updateNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  deleteNotePermanently: (id: string) => void;
  restoreNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  getNoteById: (id: string) => NoteItem | undefined;
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  updateTodo: (todo: TodoItem) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  deleteAllUserData: () => void;
  updateStats: (type: ActivityType) => void;
  // History methods
  history: HistoryItem[];
  favorites: FavoriteItem[];
  addConversionToHistory: (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addCalculatorToHistory: (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addDateCalculationToHistory: (item: Omit<DateCalculationHistoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'type'>) => void;
  deleteHistoryItem: (id: string) => void;
  deleteFavorite: (id: string) => void;
  clearAllHistory: (type: 'conversion' | 'calculator' | 'date_calculation' | 'all') => void;
  clearAllFavorites: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PREMIUM_ACTIVITIES_GOAL = 3000;
const PREMIUM_STREAK_GOAL = 15;

const defaultStats: UserStats = {
    allTimeActivities: 0,
    todayActivities: 0,
    lastActivityDate: null,
    lastAppOpenDate: null,
    streak: 0,
    daysActive: 0,
};

const defaultSettings: UserSettings = {
    saveHistory: true,
    customTheme: {
        background: { h: 0, s: 0, l: 100 },
        foreground: { h: 240, s: 10, l: 3.9 },
        primary: { h: 240, s: 5.9, l: 10 },
        accent: { h: 240, s: 4.8, l: 95.9 },
    }
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
    membership: 'guest',
    settings: defaultSettings,
    stats: defaultStats,
    notes: [],
    todos: [],
    activityLog: [],
    quickAccessOrder: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
    history: [],
    favorites: [],
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
    membership: 'guest',
    settings: defaultSettings,
    stats: defaultStats,
    notes: [],
    todos: [],
    activityLog: [],
    quickAccessOrder: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
    history: [],
    favorites: [],
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, logout } = useAuth();
  
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    
    dataLoaded.current = false;
    
    const loadGuestData = () => {
        try {
          const savedProfile = localStorage.getItem('sutradhaar_profile');
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            const stats = { ...defaultStats, ...(parsedProfile.stats || {}) };
            const settings = { ...defaultSettings, ...(parsedProfile.settings || {}), customTheme: { ...defaultSettings.customTheme, ...(parsedProfile.settings?.customTheme || {}) } };
            const notes = parsedProfile.notes || [];
            const todos = parsedProfile.todos || [];
            const activityLog = parsedProfile.activityLog || [];
            const history = parsedProfile.history || [];
            const favorites = parsedProfile.favorites || [];
            setProfileState({ ...guestProfileDefault, ...parsedProfile, settings, stats, notes, todos, activityLog, history, favorites });
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
          const settings = { ...defaultSettings, ...(fetchedData.settings || {}), customTheme: { ...defaultSettings.customTheme, ...(fetchedData.settings?.customTheme || {}) } };
          const notes = fetchedData.notes || [];
          const todos = fetchedData.todos || [];
          const activityLog = fetchedData.activityLog || [];
          const history = fetchedData.history ? Object.values(fetchedData.history).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as HistoryItem[] : [];
          const favorites = fetchedData.favorites ? Object.values(fetchedData.favorites) as FavoriteItem[] : [];

          let membership = user.email === 'amanyadavyadav9458@gmail.com' ? 'owner' : (fetchedData.membership || 'member');
          // Check for premium upgrade
          if (membership === 'member' && stats.allTimeActivities >= PREMIUM_ACTIVITIES_GOAL && stats.streak >= PREMIUM_STREAK_GOAL) {
            membership = 'premium';
          }


          const fullProfile = {
            ...getInitialProfile(),
            ...fetchedData,
            name: fetchedData.name || user.displayName || "New User",
            email: user.email || fetchedData.email || "",
            membership,
            settings,
            stats,
            notes,
            todos,
            activityLog,
            history,
            favorites,
          };
          setProfileState(fullProfile);

        } else {
           const membership = user.email === 'amanyadavyadav9458@gmail.com' ? 'owner' : 'member';
          const newProfile: UserProfile = {
            ...guestProfileDefault,
            email: user.email || '',
            name: user.displayName || 'New User',
            membership,
            settings: defaultSettings,
            stats: defaultStats,
            notes: [],
            todos: [],
            activityLog: [],
            quickAccessOrder: [],
            photoUrl: user.photoURL || guestProfileDefault.photoUrl,
            photoId: guestProfileDefault.photoId,
            history: [],
            favorites: [],
          };
          await set(userRef, newProfile);
          setProfileState(newProfile);
        }
        setIsLoading(false);
        dataLoaded.current = true;
      }, (error) => {
        console.error("Error listening to profile changes:", error);
        loadGuestData();
      });

      return () => unsubscribe();
    } else {
        loadGuestData();
    }
  }, [user, authLoading]);

  const setProfile = (newProfileData: UserProfile | ((prevState: UserProfile) => UserProfile)) => {
    setProfileState(currentProfile => {
        let updatedProfile = typeof newProfileData === 'function' ? newProfileData(currentProfile) : newProfileData;
        
        // Premium check logic
        if (updatedProfile.membership === 'member' && updatedProfile.stats.allTimeActivities >= PREMIUM_ACTIVITIES_GOAL && updatedProfile.stats.streak >= PREMIUM_STREAK_GOAL) {
            updatedProfile = { ...updatedProfile, membership: 'premium' };
        }
        
        if (user) {
            const userRef = ref(rtdb, `users/${user.uid}/profile`);
            const dbProfile = {...updatedProfile};
            // @ts-ignore
            dbProfile.history = (dbProfile.history || []).reduce((acc, item) => ({...acc, [item.id]: item}), {});
            // @ts-ignore
            dbProfile.favorites = (dbProfile.favorites || []).reduce((acc, item) => ({...acc, [item.id]: item}), {});
            set(userRef, dbProfile).catch(error => {
                 console.error("Failed to save profile to Realtime DB", error);
            });
        } else {
            try {
              localStorage.setItem('sutradhaar_profile', JSON.stringify(updatedProfile));
            } catch (error) {
              console.error("Failed to save profile to localStorage", error);
            }
        }
        return updatedProfile;
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
  
  const addTodo = (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
        ...todo,
        id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
    };
    setProfile(p => ({ ...p, todos: [newTodo, ...(p.todos || [])] }));
    updateStats('todo');
  };

  const updateTodo = (todoToUpdate: TodoItem) => {
    setProfile(p => ({ ...p, todos: (p.todos || []).map(t => t.id === todoToUpdate.id ? todoToUpdate : t) }));
  };

  const toggleTodo = (id: string) => {
    setProfile(p => ({
        ...p,
        todos: (p.todos || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
    updateStats('todo');
  };

  const deleteTodo = (id: string) => {
    setProfile(p => ({ ...p, todos: (p.todos || []).filter(t => t.id !== id) }));
  };


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
  
  const deleteAllUserData = async () => {
    if (user) {
        const userRef = ref(rtdb, `users/${user.uid}`);
        await remove(userRef);
    }
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('unitwise_') || key.startsWith('sutradhaar_')) {
            localStorage.removeItem(key);
        }
    });
    setProfileState(getInitialProfile());
    logout();
  };
  
  const addConversionToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    if (!profile.settings.saveHistory) return;
    const newItem: ConversionHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'conversion' };
    setProfile(p => ({...p, history: [newItem, ...p.history]}));
    updateStats('conversion');
  };

  const addCalculatorToHistory = (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    if (!profile.settings.saveHistory) return;
    const newItem: CalculatorHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'calculator' };
    setProfile(p => ({...p, history: [newItem, ...p.history]}));
    updateStats('calculator');
  };
  
  const addDateCalculationToHistory = (item: Omit<DateCalculationHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    if (!profile.settings.saveHistory) return;
    const newItem: DateCalculationHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'date_calculation' };
    setProfile(p => ({...p, history: [newItem, ...p.history]}));
    updateStats('date_calculation');
  };

  const addFavorite = (item: Omit<FavoriteItem, 'id' | 'type'>) => {
    const newItem: FavoriteItem = { ...item, id: new Date().getTime().toString(), type: 'favorite' };
    setProfile(p => ({...p, favorites: [newItem, ...p.favorites]}));
  };

  const deleteHistoryItem = (id: string) => {
    setProfile(p => ({...p, history: p.history.filter(item => item.id !== id)}));
  };

  const deleteFavorite = (id: string) => {
    setProfile(p => ({...p, favorites: p.favorites.filter(item => item.id !== id)}));
  };
  
  const clearAllHistory = (type: 'conversion' | 'calculator' | 'date_calculation' | 'all') => {
    if (type === 'all') {
      setProfile(p => ({...p, history: []}));
      return;
    }
    setProfile(p => ({...p, history: p.history.filter(item => item.type !== type)}));
  };

  const clearAllFavorites = () => {
    setProfile(p => ({...p, favorites: []}));
  };

  return (
    <ProfileContext.Provider value={{ 
        profile, 
        setProfile, 
        checkAndUpdateStreak, 
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        deleteNotePermanently,
        restoreNote,
        toggleFavoriteNote,
        getNoteById,
        addTodo,
        updateTodo,
        toggleTodo,
        deleteTodo,
        deleteAllUserData,
        updateStats,
        history: profile.history,
        favorites: profile.favorites,
        addConversionToHistory,
        addCalculatorToHistory,
        addDateCalculationToHistory,
        addFavorite,
        deleteHistoryItem,
        deleteFavorite,
        clearAllHistory,
        clearAllFavorites,
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
