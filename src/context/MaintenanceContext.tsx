

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, Rocket, User, Languages, Bug } from 'lucide-react';


export type UpdateItem = {
    id: string;
    icon: 'Wrench' | 'Rocket' | 'User' | 'Languages' | 'Bug';
    title: string;
    date: string;
    description: string;
    tags: string[];
};

type Countdown = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export type MaintenanceConfig = {
    globalMaintenance: boolean;
    individualPages: string[];
    countdown: Countdown;
    details: string;
    type: string;
    postUpdateStatus: string;
    successMessage: string;
    failureMessage: string;
    dashboardBanner: {
        show: boolean;
        countdown: Countdown;
        category: string;
        upcomingFeatureDetails: string;
    };
    globalNotification: string;
    updateItems: UpdateItem[];
};


type MaintenanceContextType = {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (isMaintenance: boolean) => void;
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: React.Dispatch<React.SetStateAction<MaintenanceConfig>>;
  resetMaintenanceConfig: () => void;
  addUpdateItem: (item: Omit<UpdateItem, 'id'>) => void;
  editUpdateItem: (item: UpdateItem) => void;
  deleteUpdateItem: (id: string) => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const defaultMaintenanceConfig: MaintenanceConfig = {
    globalMaintenance: false,
    individualPages: [],
    countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    },
    details: 'General improvements and bug fixes.',
    type: 'Security',
    postUpdateStatus: 'In Progress',
    successMessage: 'The update was successful! We will be back shortly.',
    failureMessage: 'The update failed. Please try again later.',
    dashboardBanner: {
        show: true,
        countdown: {
            days: 0,
            hours: 10,
            minutes: 59,
            seconds: 32,
        },
        category: 'Bug Fix',
        upcomingFeatureDetails: '1. bug fix\n2. may be some feature not working',
    },
    globalNotification: '',
    updateItems: [
        {
            id: '1',
            icon: 'Wrench',
            title: 'Bug fix and stable',
            date: '10 September, 2025',
            description: 'Here we fix some bugs and make a stable and also give a lag free experience',
            tags: ['Bug Fix', 'Beta 1.3'],
        },
        {
            id: '2',
            icon: 'Rocket',
            title: 'Live sync by email',
            date: '7 September, 2025',
            description: 'Now user can sync data live like history stats etc',
            tags: ['New Feature', 'Beta 1.3'],
        },
        {
            id: '3',
            icon: 'User',
            title: 'Profile Management',
            date: '1 October, 2024',
            description: 'Manage your profile, track stats, and view your premium membership progress.',
            tags: ['New Feature', 'Beta 1.2'],
        },
        {
            id: '4',
            icon: 'Languages',
            title: 'Language Support: Hindi',
            date: '25 September, 2024',
            description: 'The entire app is now available in Hindi.',
            tags: ['New Feature', 'Beta 1.2'],
        }
    ]
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
      if (savedConfig) {
        setMaintenanceConfig(prev => ({...defaultMaintenanceConfig, ...JSON.parse(savedConfig)}));
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

  const addUpdateItem = (item: Omit<UpdateItem, 'id'>) => {
    setMaintenanceConfig(prev => ({
        ...prev,
        updateItems: [{ ...item, id: new Date().toISOString() }, ...prev.updateItems ]
    }));
  };

  const editUpdateItem = (updatedItem: UpdateItem) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        updateItems: prev.updateItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  };

  const deleteUpdateItem = (id: string) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        updateItems: prev.updateItems.filter(item => item.id !== id)
    }));
  };


  return (
    <MaintenanceContext.Provider value={{ 
        isMaintenanceMode, setMaintenanceMode, 
        isDevMode, setDevMode, 
        maintenanceConfig, setMaintenanceConfig,
        resetMaintenanceConfig,
        addUpdateItem,
        editUpdateItem,
        deleteUpdateItem
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
    const { isMaintenanceMode, maintenanceConfig, isDevMode } = useMaintenance();
    const router = useRouter();
    const pathname = usePathname();

    const allowedPaths = ['/maintenance'];
    if (isDevMode) {
      allowedPaths.push('/dev', '/settings', '/profile/edit', '/dev/manage-updates');
    }
    
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
