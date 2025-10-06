

"use client";

import { Menu, Search, Bell, CircleUser, Home, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { SearchDialog } from './search-dialog';
import { useProfile } from '@/context/ProfileContext';
import { Card } from './ui/card';

export function Header() {
  const { setDevMode } = useMaintenance();
  const [clickCount, setClickCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const { notifications, markAllAsRead, unreadCount, removeNotification } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const displayName = user ? (user.displayName || profile.name) : 'Guest';
  const avatarUrl = user?.photoURL || profile.photoUrl;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const handleLogoClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 5) {
      setDevMode(true);
      toast({ title: 'Developer Mode Enabled' });
      setClickCount(0); // Reset after activation
    }

    // Reset if time between clicks is too long
    setTimeout(() => {
        setClickCount(0);
    }, 1500)
  };

  const handleNotificationOpen = (open: boolean) => {
    if (open) {
      markAllAsRead();
    }
  };

  return (
    <>
      <header className="sticky top-4 z-50 w-full mt-4">
        <Card className="p-2">
            <div className="flex h-14 items-center px-2">
              <div className="flex items-center gap-3">
                 <Link href="/profile">
                    <Avatar>
                        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary-foreground">{avatarFallback}</span>
                            </div>
                         )}
                         <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                 </Link>
                 <div>
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <h1 className="font-bold text-lg" onClick={handleLogoClick}>{displayName}</h1>
                 </div>
              </div>
              
              <div className="flex flex-1 items-center justify-end space-x-1">
                <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
                
                <DropdownMenu onOpenChange={handleNotificationOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notification => (
                                <DropdownMenuItem key={notification.id} onSelect={(e) => e.preventDefault()} className="flex items-start gap-2 relative pr-8">
                                    <div className='flex-1'>
                                        <p className="font-medium">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.body}</p>
                                        <p className="text-xs text-muted-foreground/80 text-right mt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6"
                                      onClick={() => removeNotification(notification.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem>No new notifications</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
        </Card>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
