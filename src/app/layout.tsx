

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ProfileProvider } from '@/context/ProfileContext';
import { MaintenanceProvider, MaintenanceWrapper } from '@/context/MaintenanceContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { BroadcastListener } from '@/components/broadcast-listener';
import { NotificationProvider } from '@/context/NotificationContext';
import { CustomThemeHandler } from '@/components/custom-theme-handler';
import { ConditionalBottomNavigation } from '@/components/conditional-bottom-navigation';


export const metadata: Metadata = {
  title: 'Sutradhaar',
  description: 'Smart Unit Converter & Calculator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="theme-sutradhaar">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          themes={['light', 'dark', 'theme-sutradhaar', 'theme-forest', 'theme-ocean', 'theme-sunset', 'custom']}
        >
          <AuthProvider>
            <NotificationProvider>
              <MaintenanceProvider>
                <ProfileProvider>
                  <CustomThemeHandler />
                  <MaintenanceWrapper>
                    {children}
                    <ConditionalBottomNavigation />
                  </MaintenanceWrapper>
                  <Toaster />
                  <BroadcastListener />
                </ProfileProvider>
              </MaintenanceProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
