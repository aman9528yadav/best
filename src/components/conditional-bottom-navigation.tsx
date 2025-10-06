
"use client";

import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';

export function ConditionalBottomNavigation() {
  const pathname = usePathname();

  const hideOnRoutes = ['/login', '/notes/new', '/notes/', '/forgot-password', '/verify-email', '/auth-action'];

  const shouldHide = hideOnRoutes.some(route => {
    if (route.endsWith('/')) {
        return pathname.startsWith(route) && pathname.split('/').length > 2;
    }
    return pathname === route;
  });

  if (shouldHide) {
    return null;
  }

  return <BottomNavigation />;
}
