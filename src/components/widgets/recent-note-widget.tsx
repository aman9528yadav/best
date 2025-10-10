
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, ChevronRight } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function RecentNoteWidget() {
    const { profile } = useProfile();
    const router = useRouter();

    const recentNote = useMemo(() => {
        if (!profile.notes || profile.notes.length === 0) return null;
        
        const nonTrashedNotes = profile.notes.filter(note => !note.isTrashed);
        if (nonTrashedNotes.length === 0) return null;

        return nonTrashedNotes.reduce((latest, note) => {
            return new Date(note.updatedAt) > new Date(latest.updatedAt) ? note : latest;
        });
    }, [profile.notes]);

    if (!recentNote) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <span>Recent Note</span>
                        <BookText className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No recent notes. Create one to see it here!</p>
                    <Button className="w-full" onClick={() => router.push('/notes/new')}>Create Note</Button>
                </CardContent>
            </Card>
        );
    }
    
    const snippet = recentNote.content
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100);

    return (
        <Card>
            <CardHeader>
                 <CardTitle className="text-base font-medium flex items-center justify-between">
                    <span>Recent Note</span>
                    <BookText className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <h3 className="font-semibold">{recentNote.title || "Untitled Note"}</h3>
                    <p className="text-sm text-muted-foreground">{snippet}...</p>
                    <Button asChild variant="secondary" size="sm" className="w-full">
                        <Link href={`/notes/${recentNote.id}`}>
                            Open Note <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
