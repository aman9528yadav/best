import { Menu, Search, Bell, CircleUser } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center space-x-2 md:justify-center">
          <span className="font-bold text-lg">UnitWise</span>
        </div>
        <div className="flex items-center justify-end space-x-1">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile">
            <CircleUser className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
