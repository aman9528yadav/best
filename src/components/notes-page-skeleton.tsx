
"use client";

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function NotesPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-16 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>

      <div>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
