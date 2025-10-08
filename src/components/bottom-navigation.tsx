

"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Settings, Menu, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './sidebar';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/calculator', icon: Calculator, label: 'Calc' },
  { href: '/analytics', icon: BarChart2, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-center z-50">
        <div className="bg-pink-100/30 backdrop-blur-sm border-pink-200/50 shadow-lg rounded-full flex items-center justify-around w-full max-w-sm mx-4 h-16 self-center px-2">
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
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full w-16 h-16 shadow-lg">
                <Menu className="h-8 w-8" />
              </Button>
            </SheetTrigger>
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
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
         <SidebarContent onLinkClick={() => setIsSidebarOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
