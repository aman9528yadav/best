
"use client";

import { NoteEditor } from "@/components/note-editor";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

export default function NewNotePage() {
    const router = useRouter();
    const { addNote } = useProfile();

    const handleSave = (title: string, content: string) => {
        const newNote = addNote({
            title,
            content,
            isFavorite: false,
            isTrashed: false,
        });
        router.push(`/notes/${newNote.id}`);
    };

    return <NoteEditor onSave={handleSave} />;
}
