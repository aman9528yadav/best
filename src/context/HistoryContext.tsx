"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ConversionHistoryItem = {
  id: string;
  type: 'conversion';
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
  timestamp: Date;
};

export type CalculatorHistoryItem = {
  id: string;
  type: 'calculator';
  expression: string;
  result: string;
  timestamp: Date;
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

const dummyHistory: HistoryItem[] = [
  {
    id: '1',
    type: 'conversion',
    fromValue: '112',
    fromUnit: 'm',
    toValue: '0.112',
    toUnit: 'km',
    category: 'Length',
    timestamp: new Date(Date.now() - 39 * 60 * 1000),
  },
  {
    id: '2',
    type: 'calculator',
    expression: '12 * 5 + 3',
    result: '63',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'conversion',
    fromValue: '2.5',
    fromUnit: 'kg',
    toValue: '5.51',
    toUnit: 'lb',
    category: 'Weight',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

const dummyFavorites: FavoriteItem[] = [
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

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [history, setHistory] = useState<HistoryItem[]>(dummyHistory);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(dummyFavorites);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('unitwise_history');
      const savedFavorites = localStorage.getItem('unitwise_favorites');

      if (savedHistory) {
        const parsedHistory: HistoryItem[] = JSON.parse(savedHistory);
        parsedHistory.forEach(item => item.timestamp = new Date(item.timestamp));
        setHistory(parsedHistory);
      }
      
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
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
      timestamp: new Date(),
      type: 'conversion',
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const addCalculatorToHistory = (item: Omit<CalculatorHistoryItem, 'id' | 'timestamp' | 'type'>) => {
    const newItem: CalculatorHistoryItem = {
      ...item,
      id: new Date().toISOString(),
      timestamp: new Date(),
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
