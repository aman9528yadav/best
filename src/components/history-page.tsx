"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Filter, Link as LinkIcon, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ConversionHistoryItem = {
  id: string;
  type: 'conversion';
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
  timestamp: Date;
};

type CalculatorHistoryItem = {
  id: string;
  type: 'calculator';
  expression: string;
  result: string;
  timestamp: Date;
};

type FavoriteItem = {
  id: string;
  type: 'favorite';
  fromUnit: string;
  toUnit: string;
  category: string;
};

type HistoryItem = ConversionHistoryItem | CalculatorHistoryItem;

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
]

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState('conversions');
  const [history, setHistory] = useState<HistoryItem[]>(dummyHistory);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(dummyFavorites);
  const [filter, setFilter] = useState('All');
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  const clearHistory = () => {
    if (activeTab === 'conversions') {
      setHistory(h => h.filter(item => item.type !== 'conversion'));
    } else if (activeTab === 'calculator') {
      setHistory(h => h.filter(item => item.type !== 'calculator'));
    } else if (activeTab === 'favorites') {
      setFavorites([]);
    }
  };
  
  const deleteItem = (id: string) => {
    setHistory(h => h.filter(item => item.id !== id));
    setFavorites(f => f.filter(item => item.id !== id));
  };


  const filteredHistory = history.filter(item => {
    if (activeTab === 'conversions' && item.type === 'conversion') {
      if (filter === 'All') return true;
      return item.category === filter;
    }
     if (activeTab === 'calculator' && item.type === 'calculator') {
      return true;
    }
    return false;
  });

  const conversionCategories = ['All', ...Array.from(new Set(history.filter(h => h.type === 'conversion').map((h: any) => h.category)))];

  const renderHistoryItem = (item: HistoryItem) => {
    if (item.type === 'conversion') {
      return (
        <Card key={item.id} className="bg-accent/70 border-none p-4">
          <div className="flex justify-between items-start text-xs text-accent-foreground/80 mb-2">
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3 w-3" />
              <span>{item.category}</span>
            </div>
            <span>{isClient ? formatDistanceToNow(item.timestamp, { addSuffix: true }) : '...'}</span>
          </div>
          <div className="text-lg font-medium text-accent-foreground mb-3">
            <span>{item.fromValue} {item.fromUnit}</span>
            <span className="mx-2">→</span>
            <span>{item.toValue} {item.toUnit}</span>
          </div>
          <div className="flex justify-end items-center gap-2">
             <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-foreground/80">
                <RotateCw className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-foreground/80" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </Card>
      );
    }
    if (item.type === 'calculator') {
      return (
        <Card key={item.id} className="bg-accent/70 border-none p-4">
          <div className="flex justify-end items-start text-xs text-accent-foreground/80 mb-2">
            <span>{isClient ? formatDistanceToNow(item.timestamp, { addSuffix: true }) : '...'}</span>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm">{item.expression}</div>
            <div className="text-xl font-bold text-accent-foreground mb-3">{item.result}</div>
          </div>
          <div className="flex justify-end items-center gap-2">
             <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-foreground/80">
                <RotateCw className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-foreground/80" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </Card>
      );
    }
    return null;
  };
  
  const renderFavoriteItem = (item: FavoriteItem) => (
    <Card key={item.id} className="bg-accent/70 border-none p-4">
        <div className="flex justify-between items-start text-xs text-accent-foreground/80 mb-2">
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3 w-3" />
              <span>{item.category}</span>
            </div>
        </div>
        <div className="text-lg font-medium text-accent-foreground mb-3">
            <span>{item.fromUnit}</span>
            <span className="mx-2">→</span>
            <span>{item.toUnit}</span>
        </div>
        <div className="flex justify-end items-center gap-2">
             <Button variant="ghost" size="icon" className="h-7 w-7 text-accent-foreground/80" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
             </Button>
        </div>
    </Card>
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearHistory}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-accent/50">
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="conversions" className="space-y-4 pt-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[120px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {conversionCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(renderHistoryItem)
            ) : (
              <p className="text-muted-foreground text-center py-8">No conversion history.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="calculator" className="space-y-4 pt-4">
           <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(renderHistoryItem)
            ) : (
              <p className="text-muted-foreground text-center py-8">No calculator history.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="favorites" className="space-y-4 pt-4">
           <div className="space-y-3">
            {favorites.length > 0 ? (
              favorites.map(renderFavoriteItem)
            ) : (
              <p className="text-muted-foreground text-center py-8">No favorites yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
