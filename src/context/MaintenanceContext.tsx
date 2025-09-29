

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type MaintenanceConfig = {
    globalMaintenance: boolean;
    individualPages: string[];
    countdown: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
    details: string;
    type: string;
    postUpdateStatus: string;
    successMessage: string;
    failureMessage: string;
};


type MaintenanceContextType = {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (isMaintenance: boolean) => void;
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: React.Dispatch<React.SetStateAction<MaintenanceConfig>>;
  resetMaintenanceConfig: () => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const defaultMaintenanceConfig: MaintenanceConfig = {
    globalMaintenance: false,
    individualPages: [],
    countdown: {
        days: 0,
        hours: 10,
        minutes: 59,
        seconds: 32,
    },
    details: 'General improvements and bug fixes.',
    type: 'Security',
    postUpdateStatus: 'In Progress',
    successMessage: 'The update was successful! We will be back shortly.',
    failureMessage: 'The update failed. Please try again later.',
};

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMaintenanceMode, setMaintenanceModeState] = useState<boolean>(false);
  const [isDevMode, setDevModeState] = useState<boolean>(false);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(defaultMaintenanceConfig);


  useEffect(() => {
    try {
      const savedMaintenance = localStorage.getItem('unitwise_maintenance');
      const savedDevMode = localStorage.getItem('unitwise_dev_mode');
      const savedConfig = localStorage.getItem('unitwise_maintenance_config');
      
      if (savedMaintenance) setMaintenanceModeState(JSON.parse(savedMaintenance));
      if (savedDevMode) setDevModeState(JSON.parse(savedDevMode));
      if (savedConfig) setMaintenanceConfig(JSON.parse(savedConfig));

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
        localStorage.setItem('unitwise_maintenance_config', JSON.stringify({ ...maintenanceConfig, globalMaintenance: isMaintenance }));
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

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('unitwise_maintenance_config', JSON.stringify(maintenanceConfig));
      } catch (error) {
        console.error("Failed to save maintenance config to localStorage", error);
      }
    }
  }, [maintenanceConfig, isLoaded]);

  const resetMaintenanceConfig = () => {
    setMaintenanceConfig(defaultMaintenanceConfig);
  }

  return (
    <MaintenanceContext.Provider value={{ 
        isMaintenanceMode, setMaintenanceMode, 
        isDevMode, setDevMode, 
        maintenanceConfig, setMaintenanceConfig,
        resetMaintenanceConfig
    }}>
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
    const { isMaintenanceMode, maintenanceConfig } = useMaintenance();
    const router = useRouter();
    const pathname = usePathname();

    const allowedPaths = ['/maintenance', '/settings', '/profile/edit', '/dev'];
    
    const isIndividuallyMaintained = maintenanceConfig.individualPages.includes(pathname);

    useEffect(() => {
        const isPathAllowed = allowedPaths.includes(pathname);

        if ((isMaintenanceMode || isIndividuallyMaintained) && !isPathAllowed) {
            router.replace('/maintenance');
        }
        if (!isMaintenanceMode && !isIndividuallyMaintained && pathname === '/maintenance') {
            router.replace('/');
        }
    }, [isMaintenanceMode, isIndividuallyMaintained, pathname, router, allowedPaths]);

    if ((isMaintenanceMode || isIndividuallyMaintained) && !allowedPaths.includes(pathname)) {
        return null; // Render nothing while redirecting
    }
    
    return <>{children}</>;
};
