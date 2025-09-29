

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type MaintenanceContextType = {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (isMaintenance: boolean) => void;
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMaintenanceMode, setMaintenanceModeState] = useState<boolean>(false);
  const [isDevMode, setDevModeState] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedMaintenance = localStorage.getItem('unitwise_maintenance');
      const savedDevMode = localStorage.getItem('unitwise_dev_mode');
      if (savedMaintenance) {
        setMaintenanceModeState(JSON.parse(savedMaintenance));
      }
      if (savedDevMode) {
        setDevModeState(JSON.parse(savedDevMode));
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const setMaintenanceMode = (isMaintenance: boolean) => {
    setMaintenanceModeState(isMaintenance);
    if (isLoaded) {
      try {
        localStorage.setItem('unitwise_maintenance', JSON.stringify(isMaintenance));
      } catch (error) {
        console.error("Failed to save maintenance mode to localStorage", error);
      }
    }
  };
  
  const setDevMode = (isDev: boolean) => {
    setDevModeState(isDev);
    if (isLoaded) {
      try {
        localStorage.setItem('unitwise_dev_mode', JSON.stringify(isDev));
      } catch (error) {
        console.error("Failed to save dev mode to localStorage", error);
      }
    }
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode, isDevMode, setDevMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceWrapper = ({ children }: { children: ReactNode }) => {
    const { isMaintenanceMode } = useMaintenance();
    const router = useRouter();
    const pathname = usePathname();

    const allowedPaths = ['/maintenance', '/settings', '/profile/edit'];

    useEffect(() => {
        if (isMaintenanceMode && !allowedPaths.includes(pathname)) {
            router.replace('/maintenance');
        }
        if (!isMaintenanceMode && pathname === '/maintenance') {
            router.replace('/');
        }
    }, [isMaintenanceMode, pathname, router]);

    if (isMaintenanceMode && !allowedPaths.includes(pathname)) {
        return null; // Render nothing while redirecting
    }
    
    return <>{children}</>;
};
