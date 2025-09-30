
"use client";

import { Skeleton } from '@/components/ui/skeleton';

export function NotesPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-16 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-10" />
      </div>

      <div>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="text-center py-20">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto mt-2" />
      </div>
    </div>
  );
}
