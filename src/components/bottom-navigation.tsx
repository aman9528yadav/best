
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Plus, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/notes', icon: FileText, label: 'Files' },
  { href: '/analytics', icon: BarChart2, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-center z-50">
      <div className="bg-card shadow-lg rounded-full flex items-center justify-around w-full max-w-sm mx-4 h-16 self-center px-2">
        {navItems.slice(0, 2).map((item) => (
          <Link href={item.href} key={item.href} className="flex-1">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        ))}

        <div className="flex-shrink-0 -mt-8">
            <Button size="icon" className="rounded-full w-16 h-16 shadow-lg">
                <Plus className="h-8 w-8" />
            </Button>
        </div>

        {navItems.slice(2).map((item) => (
          <Link href={item.href} key={item.href} className="flex-1">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
