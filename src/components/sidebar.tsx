
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calculator,
  BookText,
  Calendar,
  Timer,
  Hourglass,
  Menu,
  X,
  Sigma,
  BarChart2,
  History,
  Info,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

const sidebarNavItems = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/',
  },
  {
    icon: Sigma,
    label: 'Converter',
    href: '/converter',
  },
  {
    icon: Calculator,
    label: 'Calculator',
    href: '/calculator',
  },
  {
    icon: History,
    label: 'History',
    href: '/history',
  },
  {
    icon: BookText,
    label: 'Notes',
    href: '#',
  },
  {
    icon: Calendar,
    label: 'Date Calc',
    href: '/date-calculator',
  },
  {
    icon: Timer,
    label: 'Timer',
    href: '/timer',
  },
  {
    icon: Hourglass,
    label: 'Stopwatch',
    href: '/stopwatch',
  },
  {
    icon: Info,
    label: 'About',
    href: '/about',
  },
  {
    icon: LogIn,
    label: 'Login',
    href: '/login',
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 flex flex-row items-center justify-between border-b">
           <SheetTitle>Sutradhaar</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>
        <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm hover:bg-accent transition-colors">
                  <Avatar className="h-14 w-14">
                     <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">G</span>
                     </div>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Welcome back,
                    </p>
                    <p className="font-bold text-lg">Guest</p>
                  </div>
                </div>
              </Link>

              <nav className="space-y-2">
                <div className="flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
                  <BarChart2 className="h-4 w-4" />
                  <span>Productivity</span>
                </div>
                <div className="space-y-1">
                    {sidebarNavItems.map((item) => (
                    <Link href={item.href} key={item.label}>
                        <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-base font-medium"
                        onClick={() => setIsOpen(false)}
                        >
                        <item.icon className="h-5 w-5 text-primary" />
                        {item.label}
                        </Button>
                    </Link>
                    ))}
                </div>
              </nav>
            </div>
          </ScrollArea>
          <div className="p-6 border-t text-center text-sm text-muted-foreground">
             <p>Made by Aman Yadav</p>
          </div>
      </SheetContent>
    </Sheet>
  );
}
