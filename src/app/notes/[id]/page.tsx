
"use client";

import { NoteEditor } from "@/components/note-editor";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import type { NoteItem } from "@/context/ProfileContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditNotePage() {
    const router = useRouter();
    const params = useParams();
    const { getNoteById, updateNote, deleteNote, toggleFavoriteNote, restoreNote, deleteNotePermanently } = useProfile();
    const [note, setNote] = useState<NoteItem | null | undefined>(undefined);
    const noteId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (noteId) {
            const foundNote = getNoteById(noteId);
            setNote(foundNote);
        }
    }, [noteId, getNoteById]);

    const handleSave = (title: string, content: string) => {
        if (note) {
            updateNote({ ...note, title, content });
            router.push('/notes');
        }
    };
    
    const handleDelete = () => {
        if (note) {
            deleteNote(note.id);
            router.push('/notes');
        }
    }
    
    const handleDeletePermanently = () => {
        if (note) {
            deleteNotePermanently(note.id);
            router.push('/notes');
        }
    }

    const handleRestore = () => {
        if (note) {
            restoreNote(note.id);
            router.push('/notes');
        }
    }
    
    const handleFavoriteToggle = () => {
        if(note) {
            toggleFavoriteNote(note.id);
        }
    }

    if (note === undefined) {
        return (
             <div className="w-full h-full p-4">
                <Skeleton className="w-1/4 h-8 mb-4" />
                <Skeleton className="w-full h-96" />
            </div>
        );
    }

    if (note === null) {
        return <div>Note not found</div>;
    }

    return (
        <NoteEditor 
            note={note} 
            onSave={handleSave} 
            onDelete={handleDelete}
            onDeletePermanently={handleDeletePermanently}
            onRestore={handleRestore}
            onFavoriteToggle={handleFavoriteToggle}
        />
    );
}
