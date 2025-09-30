
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

    return (
        <div className="flex justify-center w-full">
            <div className="w-full max-w-[412px]">
                <NoteEditor onSave={handleSave} />
            </div>
        </div>
    );
}
