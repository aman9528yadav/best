
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

export type FavoriteItem = {
  id: string;
  type: 'favorite';
  fromUnit: string;
  toUnit: string;
  category: string;
};

export type HistoryItem = ConversionHistoryItem | CalculatorHistoryItem;

type HistoryContextType = {
  history: HistoryItem[];
  favorites: FavoriteItem[];
  addConversionToHistory: (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addCalculatorToHistory: (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => void;
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'type'>) => void;
  deleteHistoryItem: (id: string) => void;
  deleteFavorite: (id: string) => void;
  clearAllHistory: (type: 'conversion' | 'calculator') => void;
  clearAllFavorites: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const getInitialHistory = (): HistoryItem[] => {
    const today = new Date();
    return [
        { id: '1', type: 'conversion', fromValue: '112', fromUnit: 'Meters', toValue: '0.112', toUnit: 'Kilometers', category: 'Length', timestamp: subDays(today, 0).toISOString() },
        { id: '2', type: 'calculator', expression: '12 * 5 + 3', result: '63', timestamp: subDays(today, 1).toISOString() },
    ];
};

const getInitialFavorites = (): FavoriteItem[] => {
    return [
        { id: 'fav1', type: 'favorite', fromUnit: 'Meters', toUnit: 'Kilometers', category: 'Length' },
    ];
};

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const { updateStatsForNewConversion } = useProfile();
  const { user, loading: authLoading } = useAuth();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading) {
        if(user) {
            // Logged-in user: sync with RTDB
            const dbRef = ref(rtdb, `users/${user.uid}`);
            const unsubscribe = onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setHistory(data.history ? Object.values(data.history) : []);
                    setFavorites(data.favorites ? Object.values(data.favorites) : []);
                } else {
                    // No data in DB, use local or initial
                    const localHistory = localStorage.getItem('unitwise_history');
                    const localFavorites = localStorage.getItem('unitwise_favorites');
                    const initialHistory = localHistory ? JSON.parse(localHistory) : getInitialHistory();
                    const initialFavorites = localFavorites ? JSON.parse(localFavorites) : getInitialFavorites();
                    setHistory(initialHistory);
                    setFavorites(initialFavorites);
                    // Push local/initial data to DB
                    set(dbRef, { history: initialHistory.reduce((acc, item) => ({...acc, [item.id]: item}), {}), favorites: initialFavorites.reduce((acc, item) => ({...acc, [item.id]: item}), {}) });
                }
                setIsLoaded(true);
            });
            return () => unsubscribe();
        } else {
            // Guest user: use localStorage
            const localHistory = localStorage.getItem('unitwise_history');
            const localFavorites = localStorage.getItem('unitwise_favorites');
            setHistory(localHistory ? JSON.parse(localHistory) : getInitialHistory());
            setFavorites(localFavorites ? JSON.parse(localFavorites) : getInitialFavorites());
            setIsLoaded(true);
        }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if(isLoaded && !user) {
        localStorage.setItem('unitwise_history', JSON.stringify(history));
    }
  }, [history, isLoaded, user]);

  useEffect(() => {
     if(isLoaded && !user) {
        localStorage.setItem('unitwise_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded, user]);

  const addConversionToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: ConversionHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'conversion' };
    setHistory(prev => [newItem, ...prev]);
    if (user) {
        set(ref(rtdb, `users/${user.uid}/history/${newItem.id}`), newItem);
    }
    updateStatsForNewConversion();
  };

  const addCalculatorToHistory = (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: CalculatorHistoryItem = { ...item, id: new Date().getTime().toString(), timestamp: new Date().toISOString(), type: 'calculator' };
    setHistory(prev => [newItem, ...prev]);
     if (user) {
        set(ref(rtdb, `users/${user.uid}/history/${newItem.id}`), newItem);
    }
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
  
  const clearAllHistory = (type: 'conversion' | 'calculator') => {
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
        addFavorite,
        deleteHistoryItem,
        deleteFavorite,
        clearAllHistory,
        clearAllFavorites
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
