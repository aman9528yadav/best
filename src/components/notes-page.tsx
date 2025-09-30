
"use client";

import React, { useState, useMemo } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  MoreVertical,
  List,
  LayoutGrid,
  Star,
  Trash,
  Clock,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

type ViewMode = 'list' | 'card';
type SortMode = 'updatedAt' | 'createdAt' | 'title';

export function NotesPage() {
  const { profile, restoreNote, deleteNotePermanently } = useProfile();
  const { notes } = profile;
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('updatedAt');
  const [activeTab, setActiveTab] = useState('all');

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;
    if (activeTab === 'favorites') {
      filtered = notes.filter(note => note.isFavorite && !note.isTrashed);
    } else if (activeTab === 'trash') {
      filtered = notes.filter(note => note.isTrashed);
    } else {
      filtered = notes.filter(note => !note.isTrashed);
    }

    return [...filtered].sort((a, b) => {
      if (sortMode === 'title') {
        return a.title.localeCompare(b.title);
      }
      const dateA = new Date(a[sortMode]).getTime();
      const dateB = new Date(b[sortMode]).getTime();
      return dateB - dateA;
    });
  }, [notes, activeTab, sortMode]);
  
  const handleNoteClick = (noteId: string) => {
      if(activeTab === 'trash') return;
      router.push(`/notes/${noteId}`);
  }

  const NoteItem = ({ note }: { note: typeof notes[0] }) => (
    <Card 
        className="p-4 cursor-pointer hover:bg-accent transition-colors flex flex-col"
        onClick={() => handleNoteClick(note.id)}
    >
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold">{note.title || 'Untitled Note'}</h3>
                {note.isFavorite && !note.isTrashed && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />}
            </div>
          <p className="text-sm text-muted-foreground truncate">{note.content.substring(0, 100)}</p>
        </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
        </div>
        {activeTab === 'trash' && (
            <div className="flex items-center">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the note.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteNotePermanently(note.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => restoreNote(note.id)}><Undo2 className="h-4 w-4" /></Button>
            </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
             <Link href="/notes/new">
                <Plus className="h-6 w-6" />
             </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">All Notes</h1>
            <p className="text-sm text-muted-foreground">{notes.filter(n => !n.isTrashed).length} notes</p>
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
              <DropdownMenuRadioItem value="updatedAt">Date Modified</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="createdAt">Date Created</DropdownMenuRadioItem>
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

      {filteredAndSortedNotes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-muted-foreground">
            {activeTab === 'trash' ? 'Trash is empty' : 'No Notes Yet'}
          </p>
           {activeTab !== 'trash' && <p className="text-sm text-muted-foreground">Click the '+' button to create your first note.</p>}
        </div>
      ) : (
         <div className={`grid gap-3 ${viewMode === 'card' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredAndSortedNotes.map(note => <NoteItem key={note.id} note={note} />)}
        </div>
      )}
    </div>
  );
}
