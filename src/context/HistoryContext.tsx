
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { subDays } from 'date-fns';
import { useProfile } from './ProfileContext';
import { useAuth } from './AuthContext';
import { ref, onValue, set, get, child, remove } from "firebase/database";
import { rtdb } from '@/lib/firebase';

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
  fromUnit: string;
  toUnit: string;
  category: string;
};

export type HistoryItem = ConversionHistoryItem | CalculatorHistoryItem | DateCalculationHistoryItem;

type HistoryContextType = {
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
  isLoading: boolean;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const getInitialHistory = (): HistoryItem[] => {
    try {
        const localHistory = localStorage.getItem('unitwise_history');
        return localHistory ? JSON.parse(localHistory) : [];
    } catch(e) { return []; }
};

const getInitialFavorites = (): FavoriteItem[] => {
    try {
        const localFavorites = localStorage.getItem('unitwise_favorites');
        return localFavorites ? JSON.parse(localFavorites) : [];
    } catch(e) { return []; }
};

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const { updateStats } = useProfile();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    dataLoaded.current = false;
    setIsLoading(true);

    const loadGuestData = () => {
        setHistory(getInitialHistory());
        setFavorites(getInitialFavorites());
        dataLoaded.current = true;
        setIsLoading(false);
    }
    
    if (user) {
        const dbRef = ref(rtdb, `users/${user.uid}`);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const historyData = data.history ? Object.values(data.history).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];
                setHistory(historyData as HistoryItem[]);
                setFavorites(data.favorites ? Object.values(data.favorites) : []);
            } else {
                // If no data in DB, use local data and push it to DB
                const localHistory = getInitialHistory();
                const localFavorites = getInitialFavorites();
                setHistory(localHistory);
                setFavorites(localFavorites);
                const historyAsObject = localHistory.reduce((acc, item) => ({...acc, [item.id]: item}), {});
                const favoritesAsObject = localFavorites.reduce((acc, item) => ({...acc, [item.id]: item}), {});
                set(dbRef, { history: historyAsObject, favorites: favoritesAsObject });
            }
            dataLoaded.current = true;
            setIsLoading(false);
        });
        return () => unsubscribe();
    } else {
        loadGuestData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if(dataLoaded.current && !user) {
        try {
            localStorage.setItem('unitwise_history', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }
  }, [history, user]);

  useEffect(() => {
     if(dataLoaded.current && !user) {
        try {
            localStorage.setItem('unitwise_favorites', JSON.stringify(favorites));
        } catch (e) {
            console.error("Failed to save favorites to localStorage", e);
        }
    }
  }, [favorites, user]);

  const addConversionToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: ConversionHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'conversion' };
    setHistory(prev => [newItem, ...prev]);
    if (user) {
        set(ref(rtdb, `users/${user.uid}/history/${newItem.id}`), newItem);
    }
    updateStats('conversion');
  };

  const addCalculatorToHistory = (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: CalculatorHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'calculator' };
    setHistory(prev => [newItem, ...prev]);
     if (user) {
        set(ref(rtdb, `users/${user.uid}/history/${newItem.id}`), newItem);
    }
    updateStats('calculator');
  };

  const addDateCalculationToHistory = (item: Omit<DateCalculationHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: DateCalculationHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'date_calculation' };
    setHistory(prev => [newItem, ...prev]);
    if (user) {
        set(ref(rtdb, `users/${user.uid}/history/${newItem.id}`), newItem);
    }
    updateStats('date_calculation');
  };

  const addFavorite = (item: Omit<FavoriteItem, 'id' | 'type'>) => {
    const newItem: FavoriteItem = { ...item, id: new Date().getTime().toString(), type: 'favorite' };
    setFavorites(prev => [newItem, ...prev]);
     if (user) {
        set(ref(rtdb, `users/${user.uid}/favorites/${newItem.id}`), newItem);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
     if (user) {
        remove(ref(rtdb, `users/${user.uid}/history/${id}`));
    }
  };

  const deleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
     if (user) {
        remove(ref(rtdb, `users/${user.uid}/favorites/${id}`));
    }
  };
  
  const clearAllHistory = (type: 'conversion' | 'calculator' | 'date_calculation' | 'all') => {
    if (type === 'all') {
      setHistory([]);
      if (user) {
        remove(ref(rtdb, `users/${user.uid}/history`));
      }
      return;
    }

    const itemsToKeep = history.filter(item => item.type !== type);
    const itemsToRemove = history.filter(item => item.type === type);
    setHistory(itemsToKeep);
    if(user) {
        itemsToRemove.forEach(item => remove(ref(rtdb, `users/${user.uid}/history/${item.id}`)));
    }
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    if(user) {
        remove(ref(rtdb, `users/${user.uid}/favorites`));
    }
  };

  return (
    <HistoryContext.Provider value={{ 
        history, 
        favorites, 
        addConversionToHistory,
        addCalculatorToHistory,
        addDateCalculationToHistory,
        addFavorite,
        deleteHistoryItem,
        deleteFavorite,
        clearAllHistory,
        clearAllFavorites,
        isLoading
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
