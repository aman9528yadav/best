import { Menu, Search, Bell, CircleUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Header() {
  return (
    <Card className="sticky top-0 z-50 w-full rounded-full shadow-md">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center space-x-2 md:justify-center">
          <span className="font-bold text-lg">Sutradhaar</span>
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
    </Card>
  );
}
