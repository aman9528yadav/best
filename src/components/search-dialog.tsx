
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, History, BookText, Settings, ArrowRightLeft } from 'lucide-react';
import { useProfile, NoteItem } from '@/context/ProfileContext';
import { useHistory, ConversionHistoryItem, CalculatorHistoryItem } from '@/context/HistoryContext';
import { useRouter } from 'next/navigation';

type SearchResult = {
  type: 'Note' | 'Conversion' | 'Calculation' | 'Page';
  id: string;
  title: string;
  description?: string;
  href: string;
};

const pageIndex: Omit<SearchResult, 'id'>[] = [
    { type: 'Page', title: 'Settings', description: 'Manage app settings', href: '/settings' },
    { type: 'Page', title: 'Theme', description: 'Change the app theme', href: '/settings' },
    { type: 'Page', title: 'About', description: 'Learn about the app', href: '/about' },
    { type: 'Page', title: 'Profile', description: 'View and edit your profile', href: '/profile' },
    { type: 'Page', title: 'History', description: 'View your conversion history', href: '/history' },
];

export function SearchDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { profile } = useProfile();
  const { history } = useHistory();

  const searchResults = useMemo(() => {
    if (!query) return [];
    
    const lowerCaseQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search notes
    profile.notes.forEach((note: NoteItem) => {
      if (note.title.toLowerCase().includes(lowerCaseQuery) || note.content.toLowerCase().includes(lowerCaseQuery)) {
        results.push({
          type: 'Note',
          id: note.id,
          title: note.title || 'Untitled Note',
          description: note.content.substring(0, 50) + '...',
          href: `/notes/${note.id}`,
        });
      }
    });

    // Search history
    history.forEach(item => {
      if (item.type === 'conversion') {
        const conv = item as ConversionHistoryItem;
        const searchText = `${conv.fromValue} ${conv.fromUnit} to ${conv.toValue} ${conv.toUnit}`.toLowerCase();
        if(searchText.includes(lowerCaseQuery)) {
            results.push({
                type: 'Conversion',
                id: conv.id,
                title: `${conv.fromValue} ${conv.fromUnit} → ${conv.toValue} ${conv.toUnit}`,
                description: `Category: ${conv.category}`,
                href: '/history'
            });
        }
      }
      if (item.type === 'calculator') {
        const calc = item as CalculatorHistoryItem;
         if(calc.expression.toLowerCase().includes(lowerCaseQuery) || calc.result.toLowerCase().includes(lowerCaseQuery)) {
            results.push({
                type: 'Calculation',
                id: calc.id,
                title: `${calc.expression} = ${calc.result}`,
                href: '/history'
            });
        }
      }
    });
    
    // Search pages
    pageIndex.forEach(page => {
        if(page.title.toLowerCase().includes(lowerCaseQuery) || page.description?.toLowerCase().includes(lowerCaseQuery)) {
            results.push({ ...page, id: page.href });
        }
    });

    return results;
  }, [query, profile.notes, history]);
  
  const groupedResults = useMemo(() => {
    return searchResults.reduce((acc, result) => {
      const key = result.type === 'Note' ? 'Notes' : result.type === 'Conversion' || result.type === 'Calculation' ? 'History' : 'Pages & Settings';
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [searchResults]);

  const handleSelectResult = (href: string) => {
    router.push(href);
    onOpenChange(false);
    setQuery('');
  };
  
  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => setQuery(''), 200);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 gap-0">
        <div className="flex items-center gap-2 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search notes, history, and settings..."
            className="border-none shadow-none focus-visible:ring-0 text-base p-0 h-auto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {query && Object.entries(groupedResults).length > 0 ? (
            Object.entries(groupedResults).map(([group, items]) => (
              <div key={group} className="mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">{group}</h3>
                <ul className="space-y-1">
                  {items.map(item => (
                    <li key={`${item.type}-${item.id}`} onClick={() => handleSelectResult(item.href)}
                        className="p-2 rounded-md hover:bg-accent cursor-pointer">
                      <div className="font-medium">{item.title}</div>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>{query ? 'No results found.' : 'Search for anything in the app.'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
