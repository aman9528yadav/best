
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type MaintenanceContextType = {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (isMaintenance: boolean) => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMaintenanceMode, setMaintenanceModeState] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedMaintenance = localStorage.getItem('unitwise_maintenance');
      if (savedMaintenance) {
        setMaintenanceModeState(JSON.parse(savedMaintenance));
      }
    } catch (error) {
      console.error("Failed to load maintenance mode from localStorage", error);
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

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode }}>
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

    useEffect(() => {
        if (isMaintenanceMode && pathname !== '/maintenance') {
            router.replace('/maintenance');
        }
        if (!isMaintenanceMode && pathname === '/maintenance') {
            router.replace('/');
        }
    }, [isMaintenanceMode, pathname, router]);

    if (isMaintenanceMode && pathname !== '/maintenance') {
        return null; // Render nothing while redirecting
    }
    
    return <>{children}</>;
};
