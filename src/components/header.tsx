
"use client";

import { Menu, Search, Bell, CircleUser, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export function Header() {
  const { setDevMode } = useMaintenance();
  const [clickCount, setClickCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { notifications, markAllAsRead, unreadCount, removeNotification } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogoClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 5) {
      setDevMode(true);
      setClickCount(0); // Reset after activation
    }

    // Reset if time between clicks is too long
    setTimeout(() => {
        setClickCount(0);
    }, 1500)
  };

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleNotificationOpen = (open: boolean) => {
    if (open) {
      markAllAsRead();
    }
  };

  return (
    <>
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
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            
            <DropdownMenu onOpenChange={handleNotificationOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
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

            <Button variant="ghost" size="icon" aria-label="Profile" onClick={handleProfileClick}>
                <CircleUser className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
       <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to access your profile. Would you like to go to the login page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
