
"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-accent/50">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-5 w-20 mx-auto" />
            <Skeleton className="h-8 w-12 mx-auto" />
          </CardContent>
        </Card>
        <Card className="bg-accent/50">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-8 w-8 mx-auto" />
          </CardContent>
        </Card>
        <Card className="bg-accent/50">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-8 w-8 mx-auto" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>

      <Skeleton className="h-24 w-full" />

      <section>
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
             <Card className="bg-accent/50"><CardContent className="p-3 h-20"></CardContent></Card>
             <Card className="bg-accent/50"><CardContent className="p-3 h-20"></CardContent></Card>
        </div>
      </section>

    </div>
  );
}
