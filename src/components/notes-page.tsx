
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreVertical, List, LayoutGrid, Check } from 'lucide-react';

type ViewMode = 'list' | 'card';
type SortMode = 'date-modified' | 'date-created' | 'title';

export function NotesPage() {
  const [notes] = useState([]); // Placeholder for notes state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('date-modified');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">All Notes</h1>
            <p className="text-sm text-muted-foreground">{notes.length} notes</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>View as</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <DropdownMenuRadioItem value="list" className="gap-2">
                    <List /> List
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="card" className="gap-2">
                    <LayoutGrid /> Card
                </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                 <DropdownMenuRadioItem value="date-modified">Date Modified</DropdownMenuRadioItem>
                 <DropdownMenuRadioItem value="date-created">Date Created</DropdownMenuRadioItem>
                 <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-accent/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="trash">Trash</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-muted-foreground">No Notes Yet</p>
          <p className="text-sm text-muted-foreground">Click the button to create your first note.</p>
        </div>
      )}

      {/* Note items will be rendered here based on viewMode and sortMode */}
    </div>
  );
}
