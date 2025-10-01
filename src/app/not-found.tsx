
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100/30 via-purple-100/30 to-blue-100/30 text-foreground p-4">
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
                <FileSearch className="h-20 w-20 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
            <p className="text-muted-foreground mt-2">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>
         
          <Button asChild className="w-full gap-2">
            <Link href="/">
                <ArrowLeft className="h-4 w-4" /> Go Back to Homepage
            </Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
