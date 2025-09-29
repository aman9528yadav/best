
"use client";

import { Menu, Search, Bell, CircleUser, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { setDevMode } = useMaintenance();
  const [clickCount, setClickCount] = useState(0);
  const { toast } = useToast();

  const handleLogoClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 5) {
      setDevMode(true);
      toast({
        title: "Developer Mode Enabled",
        description: "You've unlocked developer options.",
      });
      setClickCount(0); // Reset after activation
    } else if (newClickCount > 2) {
      const clicksRemaining = 5 - newClickCount;
      toast({
        description: `You are ${clicksRemaining} step${clicksRemaining > 1 ? 's' : ''} away from being a developer.`,
      });
    }

    // Reset if time between clicks is too long
    setTimeout(() => {
        setClickCount(0);
    }, 1500)
  };

  return (
    <Card className="sticky top-4 z-50 w-full rounded-full shadow-md mt-4">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-2">
          <Sidebar />
        </div>
        <div className="flex flex-1 items-center justify-center space-x-2 md:justify-center">
          <span className="font-bold text-lg cursor-pointer" onClick={handleLogoClick}>Sutradhaar</span>
        </div>
        <div className="flex items-center justify-end space-x-1">
          <Button asChild variant="ghost" size="icon" aria-label="Home">
            <Link href="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Profile">
            <Link href="/profile">
              <CircleUser className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
