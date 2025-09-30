
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { subDays } from 'date-fns';
import { useProfile } from './ProfileContext';

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
    // For first-time users, populate with some dummy data for a better initial experience
    const today = new Date();
    return [
        {
            id: '1',
            type: 'conversion',
            fromValue: '112',
            fromUnit: 'Meters',
            toValue: '0.112',
            toUnit: 'Kilometers',
            category: 'Length',
            timestamp: subDays(today, 0).toISOString(),
        },
        {
            id: '2',
            type: 'calculator',
            expression: '12 * 5 + 3',
            result: '63',
            timestamp: subDays(today, 1).toISOString(),
        },
        {
            id: '3',
            type: 'conversion',
            fromValue: '2.5',
            fromUnit: 'Kilograms',
            toValue: '5.5115',
            toUnit: 'Pounds',
            category: 'Weight',
            timestamp: subDays(today, 2).toISOString(),
        },
        {
            id: '4',
            type: 'conversion',
            fromValue: '68',
            fromUnit: 'Fahrenheit',
            toValue: '20',
            toUnit: 'Celsius',
            category: 'Temperature',
            timestamp: subDays(today, 3).toISOString(),
        },
    ];
};

const getInitialFavorites = (): FavoriteItem[] => {
    return [
        {
            id: 'fav1',
            type: 'favorite',
            fromUnit: 'Meters',
            toUnit: 'Kilometers',
            category: 'Length',
        },
        {
            id: 'fav2',
            type: 'favorite',
            fromUnit: 'USD',
            toUnit: 'EUR',
            category: 'Currency',
        }
    ];
};

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { updateStatsForNewConversion } = useProfile();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('unitwise_history');
      const savedFavorites = localStorage.getItem('unitwise_favorites');

      setHistory(savedHistory ? JSON.parse(savedHistory) : getInitialHistory());
      setFavorites(savedFavorites ? JSON.parse(savedFavorites) : getInitialFavorites());

    } catch (error) {
      console.error("Failed to load from localStorage", error);
      // Set default initial data on error
      setHistory(getInitialHistory());
      setFavorites(getInitialFavorites());
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('unitwise_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('unitwise_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addConversionToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: ConversionHistoryItem = {
      ...item,
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      type: 'conversion',
    };
    setHistory(prev => [newItem, ...prev]);
    updateStatsForNewConversion();
  };

  const addCalculatorToHistory = (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: CalculatorHistoryItem = {
      ...item,
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      type: 'calculator',
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const addFavorite = (item: Omit<FavoriteItem, 'id' | 'type'>) => {
    const newItem: FavoriteItem = {
      ...item,
      id: new Date().toISOString(),
      type: 'favorite',
    };
    setFavorites(prev => [newItem, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const deleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };
  
  const clearAllHistory = (type: 'conversion' | 'calculator') => {
    setHistory(h => h.filter(item => item.type !== type));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
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
