
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { HistoryProvider } from '@/context/HistoryContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { MaintenanceProvider, MaintenanceWrapper } from '@/context/MaintenanceContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { BroadcastListener } from '@/components/broadcast-listener';
import { NotificationProvider } from '@/context/NotificationContext';


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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-sutradhaar"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <MaintenanceProvider>
                <ProfileProvider>
                  <HistoryProvider>
                    <MaintenanceWrapper>
                      {children}
                    </MaintenanceWrapper>
                    <Toaster />
                    <BroadcastListener />
                  </HistoryProvider>
                </ProfileProvider>
              </MaintenanceProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
