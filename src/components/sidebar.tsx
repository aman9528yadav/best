"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Home,
  ArrowRightLeft,
  Calculator,
  BookText,
  Calendar,
  Timer,
  Hourglass,
  Menu,
  X,
  Sigma,
  LogIn,
  BarChart2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
    icon: BookText,
    label: 'Notes',
    href: '#',
  },
  {
    icon: Calendar,
    label: 'Date Calc',
    href: '#',
  },
  {
    icon: Timer,
    label: 'Timer',
    href: '#',
  },
  {
    icon: Hourglass,
    label: 'Stopwatch',
    href: '#',
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
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex h-full flex-col bg-background text-foreground">
          <SheetHeader className="p-4 flex flex-row justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-8">
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm">
              <Avatar className="h-14 w-14">
                <AvatarImage asChild src="https://github.com/shadcn.png">
                   <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">G</span>
                   </div>
                </AvatarImage>
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  Welcome back,
                </p>
                <p className="font-bold text-lg">Guest</p>
                <Link href="#" className="text-sm text-primary">
                  Login
                </Link>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
                <span>Productivity</span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/20" />
                <div className="space-y-2 pl-3">
                    {sidebarNavItems.map((item) => (
                    <Link href={item.href} key={item.label}>
                        <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-base bg-accent hover:bg-primary/20 hover:text-primary"
                        onClick={() => setIsOpen(false)}
                        >
                        <item.icon className="h-5 w-5 text-primary" />
                        {item.label}
                        </Button>
                    </Link>
                    ))}
                </div>
              </div>
            </nav>
          </div>
          <div className="p-6 border-t text-center text-sm text-muted-foreground space-y-4">
            <div>
              <p className="font-bold text-foreground">Sutradhaar</p>
              <p>Made by Aman Yadav</p>
            </div>
            <Button variant="outline" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
