
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Save,
  Trash2,
  Star,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  ArrowLeft,
  Undo2,
  Undo,
  Redo,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import type { NoteItem } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: NoteItem;
  onSave: (title: string, content: string) => void;
  onDelete?: () => void;
  onDeletePermanently?: () => void;
  onRestore?: () => void;
  onFavoriteToggle?: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onDeletePermanently, onRestore, onFavoriteToggle }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const editorRef = useRef<HTMLDivElement>(null);
  
  const isFavorite = note?.isFavorite || false;
  const isTrashed = note?.isTrashed || false;

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };
  
  const handleSave = () => {
    onSave(title, content);
  }

  // Set initial content for the editor but only when the note ID changes
  useEffect(() => {
    if (editorRef.current && note?.content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = note.content;
      setContent(note.content);
    }
  }, [note?.id, note?.content]);


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <Input 
            placeholder="Untitled Note" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="text-lg font-bold border-none focus-visible:ring-0 shadow-none p-0 h-auto"
            readOnly={isTrashed}
          />
        </div>
        <div className="flex items-center gap-1">
          {!isTrashed && (
            <>
              <Button variant="ghost" size="icon" onClick={() => execCommand('undo')}><Undo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand('redo')}><Redo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleSave}><Save className="h-5 w-5" /></Button>
            </>
          )}
          {note && (onDelete || onDeletePermanently) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isTrashed ? (
                  <>
                    <DropdownMenuItem onClick={onRestore} className="gap-2">
                      <Undo2 className="h-4 w-4" /> Restore
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 text-destructive">
                           <Trash2 className="h-4 w-4" /> Delete Permanently
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this note.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={onDeletePermanently}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={onFavoriteToggle} className="gap-2">
                      <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                      {isFavorite ? 'Unfavorite' : 'Favorite'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete && onDelete()} className="gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" /> Move to Trash
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div
          ref={editorRef}
          onInput={handleContentChange}
          className={cn(
            'note-content w-full h-full outline-none text-base',
            isTrashed ? 'cursor-not-allowed' : ''
          )}
          suppressContentEditableWarning={true}
          contentEditable={!isTrashed}
        >
        </div>
        {isTrashed && content === '' && (
          <div className="text-muted-foreground">This note is in the trash and is empty.</div>
        )}
      </main>
      {!isTrashed && (
        <footer className="p-2 flex justify-center">
            <div className="bg-card border shadow-sm rounded-full flex items-center gap-1 p-1">
                <Button variant="ghost" size="icon" onClick={() => execCommand('bold')}><Bold className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => execCommand('italic')}><Italic className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => execCommand('underline')}><Underline className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => execCommand('strikeThrough')}><Strikethrough className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')}><List className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')}><ListOrdered className="h-5 w-5"/></Button>
            </div>
        </footer>
      )}
    </div>
  );
}
