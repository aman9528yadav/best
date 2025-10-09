
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BudgetTrackerPageSkeleton() {
  return (
    <div className="w-full space-y-6 pb-12">
      <Card>
        <CardContent className="p-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
          <div className="flex justify-between mt-4">
             <Skeleton className="h-10 w-24" />
             <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
