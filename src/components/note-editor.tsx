
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Undo,
  Redo,
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
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import type { NoteItem } from '@/context/ProfileContext';

interface NoteEditorProps {
  note?: NoteItem;
  onSave: (title: string, content: string) => void;
  onDelete?: (permanently: boolean) => void;
  onFavoriteToggle?: () => void;
}

type HistoryStack = {
  content: string;
  cursor: number;
};

export function NoteEditor({ note, onSave, onDelete, onFavoriteToggle }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [history, setHistory] = useState<HistoryStack[]>([{ content: note?.content || '', cursor: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isFavorite = note?.isFavorite || false;

  useEffect(() => {
    const timeout = setTimeout(() => {
        const newHistoryEntry = { content: content, cursor: textareaRef.current?.selectionStart || 0 };
        const newHistory = [...history.slice(0, historyIndex + 1), newHistoryEntry];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, 500);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const prevState = history[historyIndex - 1];
      setContent(prevState.content);
       if (textareaRef.current) {
         setTimeout(() => textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = prevState.cursor, 0);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextState = history[historyIndex + 1];
      setContent(nextState.content);
       if (textareaRef.current) {
        setTimeout(() => textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = nextState.cursor, 0);
      }
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'strike') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const symbol = format === 'bold' ? '**' : format === 'italic' ? '*' : format === 'underline' ? '__' : '~~';
    const newText = `${content.substring(0, start)}${symbol}${selectedText}${symbol}${content.substring(end)}`;
    setContent(newText);
  };
  
  const applyList = (type: 'unordered' | 'ordered') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lines = content.substring(0, start).split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];

    const symbol = type === 'unordered' ? '- ' : '1. ';
    
    lines[currentLineIndex] = symbol + currentLine;
    const newText = lines.join('\n');
    setContent(newText);
  };

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
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleUndo} disabled={historyIndex === 0}><Undo className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={handleRedo} disabled={historyIndex === history.length - 1}><Redo className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onSave(title, content)}><Save className="h-5 w-5" /></Button>
          {note && onDelete && onFavoriteToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onFavoriteToggle} className="gap-2">
                  <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                  {isFavorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(false)} className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" /> Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none border-none focus-visible:ring-0 text-base p-0"
        />
      </main>
      <footer className="p-2 flex justify-center">
        <div className="bg-card border shadow-sm rounded-full flex items-center gap-1 p-1">
            <Button variant="ghost" size="icon" onClick={() => applyFormatting('bold')}><Bold className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormatting('italic')}><Italic className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormatting('underline')}><Underline className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormatting('strike')}><Strikethrough className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" onClick={() => applyList('unordered')}><List className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" onClick={() => applyList('ordered')}><ListOrdered className="h-5 w-5"/></Button>
        </div>
      </footer>
    </div>
  );
}
