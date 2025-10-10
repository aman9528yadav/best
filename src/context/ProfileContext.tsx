
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { ref, onValue, set, remove } from "firebase/database";
import { rtdb } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { isToday, differenceInCalendarDays, startOfDay, isYesterday } from 'date-fns';
import { useMaintenance } from './MaintenanceContext';
import { useToast } from '@/hooks/use-toast';

export type ActivityType = 'conversion' | 'calculator' | 'date_calculation' | 'note' | 'todo' | 'budget';

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

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  date: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
};

export type Account = {
  id: string;
  name: string;
  balance: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string; // Lucide icon name
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export type BudgetData = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    goals: SavingsGoal[];
}

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

export type CustomUnit = {
    id: string;
    name: string;
    symbol: string;
    categoryId: string;
    factor: number;
    standard: string;
};

export type CustomCategory = {
    id: string;
    name: string;
}

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
  budget: BudgetData;
  activityLog: ActivityLogItem[];
  quickAccessOrder?: QuickAccessItemOrder[];
  photoUrl?: string;
  photoId?: string;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  customUnits: CustomUnit[];
  customCategories: CustomCategory[];
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, accountId: string) => void;
  deleteAllUserData: () => Promise<void>;
  updateStats: (type: ActivityType) => void;
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
  addCustomUnit: (unit: Omit<CustomUnit, 'id'>) => void;
  updateCustomUnit: (unit: CustomUnit) => void;
  deleteCustomUnit: (id: string) => void;
  addCustomCategory: (name: string) => void;
  updateCustomCategory: (category: CustomCategory) => void;
  deleteCustomCategory: (id: string) => void;
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

const defaultSettings: UserSettings = {
    saveHistory: true,
    customTheme: {
        background: { h: 0, s: 0, l: 100 },
        foreground: { h: 240, s: 10, l: 3.9 },
        primary: { h: 240, s: 5.9, l: 10 },
        accent: { h: 240, s: 4.8, l: 95.9 },
    }
};

const defaultBudgetData: BudgetData = {
    accounts: [{ id: 'default-cash', name: 'Cash', balance: 0 }, { id: 'default-bank', name: 'Bank', balance: 1000 }],
    categories: [
        { id: 'cat-income', name: 'Income', icon: 'Landmark' },
        { id: 'cat-food', name: 'Food & Drink', icon: 'Utensils' },
        { id: 'cat-transport', name: 'Transport', icon: 'Bus' },
        { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag' },
        { id: 'cat-bills', name: 'Bills & Utilities', icon: 'FileText' },
        { id: 'cat-health', name: 'Health', icon: 'HeartPulse' },
        { id: 'cat-fun', name: 'Entertainment', icon: 'Ticket' },
        { id: 'cat-housing', name: 'Housing', icon: 'Home' },
        { id: 'cat-personal', name: 'Personal Care', icon: 'Coins' },
        { id: 'cat-work', name: 'Work', icon: 'Briefcase' },
        { id: 'cat-education', name: 'Education', icon: 'School'},
    ],
    transactions: [],
    goals: [],
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
    budget: defaultBudgetData,
    activityLog: [],
    quickAccessOrder: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
    history: [],
    favorites: [],
    customUnits: [],
    customCategories: [],
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
    budget: defaultBudgetData,
    activityLog: [],
    quickAccessOrder: [],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTkwNzk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photoId: 'user-avatar-1',
    history: [],
    favorites: [],
    customUnits: [],
    customCategories: [],
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { maintenanceConfig } = useMaintenance();
  const { toast } = useToast();
  const prevMembershipRef = useRef<Membership>();
  
  useEffect(() => {
    if (authLoading) return;
  
    const mergeWithDefaults = (parsedProfile: Partial<UserProfile>): UserProfile => {
      const stats = { ...defaultStats, ...(parsedProfile.stats || {}) };
      const settings = { ...defaultSettings, ...(parsedProfile.settings || {}), customTheme: { ...defaultSettings.customTheme, ...(parsedProfile.settings?.customTheme || {}) } };
      const budgetData = parsedProfile.budget || defaultBudgetData;
      const budget = {
        ...defaultBudgetData,
        ...budgetData,
        goals: budgetData.goals ? (Array.isArray(budgetData.goals) ? budgetData.goals : Object.values(budgetData.goals)) : [],
      };
      const history = parsedProfile.history ? (Array.isArray(parsedProfile.history) ? parsedProfile.history : Object.values(parsedProfile.history)) : [];
      const favorites = parsedProfile.favorites ? (Array.isArray(parsedProfile.favorites) ? parsedProfile.favorites : Object.values(parsedProfile.favorites)) : [];
      const customUnits = parsedProfile.customUnits ? (Array.isArray(parsedProfile.customUnits) ? parsedProfile.customUnits : Object.values(parsedProfile.customUnits)) : [];
      const customCategories = parsedProfile.customCategories ? (Array.isArray(parsedProfile.customCategories) ? parsedProfile.customCategories : Object.values(parsedProfile.customCategories)) : [];
  
      return {
        ...guestProfileDefault,
        ...parsedProfile,
        settings,
        stats,
        budget,
        history,
        favorites,
        customUnits,
        customCategories,
        notes: parsedProfile.notes || [],
        todos: parsedProfile.todos || [],
        activityLog: parsedProfile.activityLog || [],
      };
    };
  
    let unsubscribe: (() => void) | undefined;
  
    if (user) {
      const cachedProfileRaw = localStorage.getItem(`sutradhaar_profile_${user.uid}`);
      if (cachedProfileRaw) {
        setProfileState(mergeWithDefaults(JSON.parse(cachedProfileRaw)));
      }
      setIsLoading(!cachedProfileRaw);
  
      const userRef = ref(rtdb, `users/${user.uid}/profile`);
      unsubscribe = onValue(userRef, (snapshot) => {
        let finalProfile;
        if (snapshot.exists()) {
          const fetchedData = snapshot.val() as Partial<UserProfile>;
          const mergedProfile = mergeWithDefaults(fetchedData);
          
          let membership = user.email === 'amanyadavyadav9458@gmail.com' ? 'owner' : (mergedProfile.membership || 'member');
          const { activities, streak } = maintenanceConfig.premiumCriteria;
          if (membership === 'member' && mergedProfile.stats.allTimeActivities >= activities && mergedProfile.stats.streak >= streak) {
            membership = 'premium';
          }
  
          finalProfile = {
            ...mergedProfile,
            name: mergedProfile.name || user.displayName || "New User",
            email: user.email || mergedProfile.email || "",
            membership,
          };
        } else {
           const membership = user.email === 'amanyadavyadav9458@gmail.com' ? 'owner' : 'member';
           finalProfile = mergeWithDefaults({
              email: user.email || '',
              name: user.displayName || 'New User',
              membership,
              photoUrl: user.photoURL || guestProfileDefault.photoUrl,
           });
           set(userRef, finalProfile);
        }
        setProfileState(finalProfile);
        localStorage.setItem(`sutradhaar_profile_${user.uid}`, JSON.stringify(finalProfile));
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching profile:", error);
        setIsLoading(false);
      });
    } else {
      const savedProfileRaw = localStorage.getItem('sutradhaar_profile');
      if (savedProfileRaw) {
        setProfileState(mergeWithDefaults(JSON.parse(savedProfileRaw)));
      } else {
        setProfileState(guestProfileDefault);
      }
      setIsLoading(false);
    }
  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, authLoading, maintenanceConfig.premiumCriteria]);

  useEffect(() => {
    if (!isLoading && profile.membership !== prevMembershipRef.current) {
        if (profile.membership === 'premium' && prevMembershipRef.current === 'member') {
            toast({
                title: "Congratulations! 💎",
                description: "You've been upgraded to a Premium Member.",
            });
        }
        prevMembershipRef.current = profile.membership;
    }
}, [profile.membership, isLoading, toast]);

  const setProfile = (newProfileData: UserProfile | ((prevState: UserProfile) => UserProfile)) => {
    setProfileState(currentProfile => {
        let updatedProfile = typeof newProfileData === 'function' ? newProfileData(currentProfile) : newProfileData;
        
        const { activities, streak } = maintenanceConfig.premiumCriteria;
        if (updatedProfile.membership === 'member' && updatedProfile.stats.allTimeActivities >= activities && updatedProfile.stats.streak >= streak) {
            updatedProfile = { ...updatedProfile, membership: 'premium' };
        }
        
        if (user) {
            const userRef = ref(rtdb, `users/${user.uid}/profile`);
            const dbProfile = {...updatedProfile};
            
            const toObjectReducer = (acc:any, item:any) => ({...acc, [item.id]: item});

            if (dbProfile.history && Array.isArray(dbProfile.history)) {
                // @ts-ignore
                dbProfile.history = dbProfile.history.reduce(toObjectReducer, {});
            }
            if (dbProfile.favorites && Array.isArray(dbProfile.favorites)) {
                // @ts-ignore
                dbProfile.favorites = dbProfile.favorites.reduce(toObjectReducer, {});
            }
            if (dbProfile.budget && dbProfile.budget.goals) {
                const goalsArray = Array.isArray(dbProfile.budget.goals) ? dbProfile.budget.goals : Object.values(dbProfile.budget.goals);
                 // @ts-ignore
                dbProfile.budget.goals = goalsArray.reduce(toObjectReducer, {});
            }
             if (dbProfile.customUnits && Array.isArray(dbProfile.customUnits)) {
                 // @ts-ignore
                dbProfile.customUnits = dbProfile.customUnits.reduce(toObjectReducer, {});
             }
             if (dbProfile.customCategories && Array.isArray(dbProfile.customCategories)) {
                // @ts-ignore
                dbProfile.customCategories = dbProfile.customCategories.reduce(toObjectReducer, {});
             }
            
            set(userRef, dbProfile).catch(error => console.error("Failed to save profile to Realtime DB", error));
            localStorage.setItem(`sutradhaar_profile_${user.uid}`, JSON.stringify(updatedProfile));
        } else {
            localStorage.setItem('sutradhaar_profile', JSON.stringify(updatedProfile));
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
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setProfile(p => {
        const newTransaction: Transaction = {
            ...transaction,
            id: new Date().getTime().toString(),
        };
        const newTransactions = [newTransaction, ...p.budget.transactions];
        
        const account = p.budget.accounts.find(acc => acc.id === transaction.accountId);
        if (!account) return p;

        const newBalance = transaction.type === 'income' ? account.balance + transaction.amount : account.balance - transaction.amount;
        const newAccounts = p.budget.accounts.map(acc => acc.id === transaction.accountId ? { ...acc, balance: newBalance } : acc);

        return { ...p, budget: { ...p.budget, transactions: newTransactions, accounts: newAccounts } };
    });
    updateStats('budget');
  };

  const updateTransaction = (transaction: Transaction) => {
    setProfile(p => {
        const oldTransaction = p.budget.transactions.find(t => t.id === transaction.id);
        if (!oldTransaction) return p;

        const newTransactions = p.budget.transactions.map(t => t.id === transaction.id ? transaction : t);

        // Revert old transaction amount from its account
        const oldAccount = p.budget.accounts.find(acc => acc.id === oldTransaction.accountId);
        if (!oldAccount) return p; // Should not happen

        let intermediateAccounts = p.budget.accounts;
        const oldAccountBalance = oldTransaction.type === 'income' ? oldAccount.balance - oldTransaction.amount : oldAccount.balance + oldTransaction.amount;
        intermediateAccounts = intermediateAccounts.map(acc => acc.id === oldTransaction.accountId ? { ...acc, balance: oldAccountBalance } : acc);

        // Apply new transaction amount to its account
        const newAccount = intermediateAccounts.find(acc => acc.id === transaction.accountId);
        if (!newAccount) return p;

        const newAccountBalance = transaction.type === 'income' ? newAccount.balance + transaction.amount : newAccount.balance - transaction.amount;
        const finalAccounts = intermediateAccounts.map(acc => acc.id === transaction.accountId ? { ...acc, balance: newAccountBalance } : acc);

        return { ...p, budget: { ...p.budget, transactions: newTransactions, accounts: finalAccounts }};
    });
  };

  const deleteTransaction = (id: string) => {
    setProfile(p => {
        const transactionToDelete = p.budget.transactions.find(t => t.id === id);
        if (!transactionToDelete) return p;

        const newTransactions = p.budget.transactions.filter(t => t.id !== id);

        const account = p.budget.accounts.find(acc => acc.id === transactionToDelete.accountId);
        if (!account) return p;

        const newBalance = transactionToDelete.type === 'income' ? account.balance - transactionToDelete.amount : account.balance + transactionToDelete.amount;
        const newAccounts = p.budget.accounts.map(acc => acc.id === transactionToDelete.accountId ? { ...acc, balance: newBalance } : acc);

        return { ...p, budget: { ...p.budget, transactions: newTransactions, accounts: newAccounts } };
    });
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: new Date().getTime().toString() };
    setProfile(p => ({ ...p, budget: { ...p.budget, accounts: [...p.budget.accounts, newAccount] }}));
  };

  const updateAccount = (accountToUpdate: Account) => {
    setProfile(p => ({ ...p, budget: { ...p.budget, accounts: p.budget.accounts.map(acc => acc.id === accountToUpdate.id ? accountToUpdate : acc) }}));
  };

  const deleteAccount = (id: string) => {
    setProfile(p => ({ ...p, budget: { ...p.budget, accounts: p.budget.accounts.filter(acc => acc.id !== id), transactions: p.budget.transactions.filter(t => t.accountId !== id) }}));
  };
  
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: new Date().getTime().toString() };
    setProfile(p => ({ ...p, budget: { ...p.budget, categories: [...p.budget.categories, newCategory] }}));
  };

  const updateCategory = (categoryToUpdate: Category) => {
    setProfile(p => ({ ...p, budget: { ...p.budget, categories: p.budget.categories.map(cat => cat.id === categoryToUpdate.id ? categoryToUpdate : cat) }}));
  };

  const deleteCategory = (id: string) => {
    setProfile(p => ({ ...p, budget: { ...p.budget, categories: p.budget.categories.filter(cat => cat.id !== id), transactions: p.budget.transactions.map(t => t.categoryId === id ? { ...t, categoryId: '' } : t) }}));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = { ...goal, id: new Date().getTime().toString(), currentAmount: 0 };
    setProfile(p => ({ ...p, budget: { ...p.budget, goals: [...p.budget.goals, newGoal] }}));
  };

  const updateSavingsGoal = (goalToUpdate: SavingsGoal) => {
    setProfile(p => ({ ...p, budget: { ...p.budget, goals: p.budget.goals.map(g => g.id === goalToUpdate.id ? goalToUpdate : g) }}));
  };

  const deleteSavingsGoal = (id: string) => {
    setProfile(p => {
        const goalsArray = Array.isArray(p.budget.goals) ? p.budget.goals : Object.values(p.budget.goals);
        const updatedGoals = goalsArray.filter(g => g.id !== id);
        return { ...p, budget: { ...p.budget, goals: updatedGoals }};
    });
  };

  const contributeToGoal = (goalId: string, amount: number, accountId: string) => {
    addTransaction({
      type: 'expense',
      amount,
      description: `Contribution to goal`,
      categoryId: '',
      accountId,
      date: new Date().toISOString(),
      recurring: 'none',
    });
    setProfile(p => {
        const goalsArray = Array.isArray(p.budget.goals) ? p.budget.goals : Object.values(p.budget.goals);
        const newGoals = goalsArray.map(g => 
            g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
        );
        return { ...p, budget: { ...p.budget, goals: newGoals }};
    });
  };


  const checkAndUpdateStreak = () => {
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
        if(key.startsWith('sutradhaar_')) {
            localStorage.removeItem(key);
        }
    });
    setProfileState(getInitialProfile());
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
  
  const addCustomUnit = (unit: Omit<CustomUnit, 'id'>) => {
    const newUnit: CustomUnit = { ...unit, id: new Date().getTime().toString() };
    setProfile(p => ({ ...p, customUnits: [...(p.customUnits || []), newUnit] }));
  }

  const updateCustomUnit = (unitToUpdate: CustomUnit) => {
    setProfile(p => ({ ...p, customUnits: (p.customUnits || []).map(u => u.id === unitToUpdate.id ? unitToUpdate : u) }));
  }

  const deleteCustomUnit = (id: string) => {
    setProfile(p => ({ ...p, customUnits: (p.customUnits || []).filter(u => u.id !== id) }));
  }
  
  const addCustomCategory = (name: string) => {
    const newCategory: CustomCategory = { name, id: new Date().getTime().toString() };
    setProfile(p => ({ ...p, customCategories: [...(p.customCategories || []), newCategory] }));
  }

  const updateCustomCategory = (categoryToUpdate: CustomCategory) => {
    setProfile(p => ({ ...p, customCategories: (p.customCategories || []).map(c => c.id === categoryToUpdate.id ? categoryToUpdate : c) }));
  }

  const deleteCustomCategory = (id: string) => {
    setProfile(p => ({ ...p, customCategories: (p.customCategories || []).filter(c => c.id !== id) }));
  }

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
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
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
        addCustomUnit,
        updateCustomUnit,
        deleteCustomUnit,
        addCustomCategory,
        updateCustomCategory,
        deleteCustomCategory,
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
