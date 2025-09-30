

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

export type UpdateItem = {
    id: string;
    icon: 'Wrench' | 'Rocket' | 'User' | 'Languages' | 'Bug';
    title: string;
    date: string;
    description: string;
    tags: string[];
};

export type RoadmapItem = {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    details: string[];
    icon: 'GitBranch' | 'Sparkles';
    status: 'completed' | 'upcoming';
};

type AboutPageContent = {
    stats: {
        happyUsers: string;
        calculationsDone: string;
    };
    ownerInfo: {
        name: string;
        photoId: string;
    };
    appInfo: {
        version: string;
        build: string;
        channel: string;
        license: string;
    };
    roadmap: RoadmapItem[];
};


type Countdown = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export type MaintenanceConfig = {
    globalMaintenance: boolean;
    isDevMode: boolean;
    dashboardBanner: {
        show: boolean;
        countdown: Countdown;
        category: string;
        upcomingFeatureDetails: string;
    };
    maintenanceCountdown: Countdown;
    maintenanceMessage: string;
    updateItems: UpdateItem[];
    aboutPageContent: AboutPageContent;
};


type MaintenanceContextType = {
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: React.Dispatch<React.SetStateAction<MaintenanceConfig>>;
  isLoading: boolean;
  addUpdateItem: (item: Omit<UpdateItem, 'id'>) => void;
  editUpdateItem: (item: UpdateItem) => void;
  deleteUpdateItem: (id: string) => void;
  addRoadmapItem: (item: Omit<RoadmapItem, 'id'>) => void;
  editRoadmapItem: (item: RoadmapItem) => void;
  deleteRoadmapItem: (id: string) => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const defaultMaintenanceConfig: MaintenanceConfig = {
    globalMaintenance: false,
    isDevMode: false,
    dashboardBanner: {
        show: true,
        countdown: {
            days: 1,
            hours: 10,
            minutes: 59,
            seconds: 32,
        },
        category: 'Bug Fix',
        upcomingFeatureDetails: '1. bug fix\n2. may be some feature not working',
    },
    maintenanceCountdown: {
      days: 0,
      hours: 2,
      minutes: 30,
      seconds: 0,
    },
    maintenanceMessage: "We're currently performing scheduled maintenance to improve our services. We're working as quickly as possible to restore service.",
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
    ],
    aboutPageContent: {
        stats: {
            happyUsers: "500",
            calculationsDone: "10k+"
        },
        ownerInfo: {
            name: "Aman Yadav",
            photoId: "founder-avatar"
        },
        appInfo: {
            version: "beta 1.5",
            build: "Sutradhaar1",
            channel: "Website",
            license: "Yes"
        },
        roadmap: [
            {
                id: 'roadmap-1',
                version: 'Beta 1.1',
                date: '12 Aug, 2024',
                title: 'First Beta Release',
                description: "Our journey begins! You may face some bugs🐞, but we're improving every day. Thanks for testing 🙏.",
                details: ['Unit converter added', 'Notes app added'],
                icon: 'GitBranch',
                status: 'completed',
            },
        ]
    }
};

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(defaultMaintenanceConfig);
  const configRef = ref(rtdb, 'config');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribe = onValue(configRef, 
      (snapshot) => {
        if (snapshot.exists()) {
            const dbConfig = snapshot.val();
            // Deep merge to avoid losing nested defaults
            const mergedConfig = {
                ...defaultMaintenanceConfig,
                ...dbConfig,
                dashboardBanner: {
                    ...defaultMaintenanceConfig.dashboardBanner,
                    ...(dbConfig.dashboardBanner || {})
                },
                maintenanceCountdown: {
                    ...defaultMaintenanceConfig.maintenanceCountdown,
                    ...(dbConfig.maintenanceCountdown || {})
                },
                aboutPageContent: {
                    ...defaultMaintenanceConfig.aboutPageContent,
                    ...(dbConfig.aboutPageContent || {}),
                    roadmap: dbConfig.aboutPageContent?.roadmap || defaultMaintenanceConfig.aboutPageContent.roadmap,
                },
                updateItems: dbConfig.updateItems || defaultMaintenanceConfig.updateItems,
            };
            setMaintenanceConfig(mergedConfig);
        } else {
            set(configRef, defaultMaintenanceConfig).catch(err => console.error("Error creating default config in DB", err));
            setMaintenanceConfig(defaultMaintenanceConfig);
        }
        setIsLoading(false);
        isInitialLoad.current = false;
      }, 
      (error) => {
          console.error("Error fetching maintenance config:", error);
          setMaintenanceConfig(defaultMaintenanceConfig);
          setIsLoading(false);
          isInitialLoad.current = false;
      });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!isLoading && !isInitialLoad.current) {
        set(configRef, maintenanceConfig).catch(error => {
            console.error("Error updating maintenance config:", error);
        });
    }
  }, [maintenanceConfig, isLoading]);
  
  const setDevMode = (isDev: boolean) => {
    setMaintenanceConfig(prev => ({...prev, isDevMode: isDev}));
  };

  const addUpdateItem = (item: Omit<UpdateItem, 'id'>) => {
    const newItem = { ...item, id: `${new Date().toISOString()}-${Math.random()}` };
    setMaintenanceConfig(prev => ({ ...prev, updateItems: [newItem, ...prev.updateItems] }));
  };

  const editUpdateItem = (item: UpdateItem) => {
    setMaintenanceConfig(prev => ({
      ...prev,
      updateItems: prev.updateItems.map(i => (i.id === item.id ? item : i)),
    }));
  };

  const deleteUpdateItem = (id: string) => {
    setMaintenanceConfig(prev => ({
      ...prev,
      updateItems: prev.updateItems.filter(i => i.id !== id),
    }));
  };

  const addRoadmapItem = (item: Omit<RoadmapItem, 'id'>) => {
    const newItem = { ...item, id: `${new Date().toISOString()}-${Math.random()}` };
    setMaintenanceConfig(prev => ({
      ...prev,
      aboutPageContent: { ...prev.aboutPageContent, roadmap: [newItem, ...prev.aboutPageContent.roadmap] },
    }));
  };

  const editRoadmapItem = (item: RoadmapItem) => {
    setMaintenanceConfig(prev => ({
      ...prev,
      aboutPageContent: {
        ...prev.aboutPageContent,
        roadmap: prev.aboutPageContent.roadmap.map(i => (i.id === item.id ? item : i)),
      },
    }));
  };

  const deleteRoadmapItem = (id: string) => {
    setMaintenanceConfig(prev => ({
      ...prev,
      aboutPageContent: {
        ...prev.aboutPageContent,
        roadmap: prev.aboutPageContent.roadmap.filter(i => i.id !== id),
      },
    }));
  };


  return (
    <MaintenanceContext.Provider value={{ 
        isDevMode: maintenanceConfig.isDevMode, 
        setDevMode, 
        maintenanceConfig, 
        setMaintenanceConfig,
        isLoading,
        addUpdateItem,
        editUpdateItem,
        deleteUpdateItem,
        addRoadmapItem,
        editRoadmapItem,
        deleteRoadmapItem,
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
    const { maintenanceConfig, isDevMode, isLoading } = useMaintenance();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return; 

        const isUnderMaintenance = maintenanceConfig.globalMaintenance;
        const isMaintenancePage = pathname === '/maintenance';
        
        const isAllowedPath = isMaintenancePage || (isDevMode && (pathname.startsWith('/dev') || pathname === '/settings'));

        if (isUnderMaintenance && !isAllowedPath) {
            router.replace('/maintenance');
        }

        if (!isUnderMaintenance && isMaintenancePage) {
            router.replace('/');
        }

    }, [maintenanceConfig.globalMaintenance, isDevMode, pathname, router, isLoading]);
    
    if (isLoading) {
        return null;
    }
    
    if (maintenanceConfig.globalMaintenance && !pathname.startsWith('/maintenance') && !(isDevMode && (pathname.startsWith('/dev') || pathname === '/settings'))) {
      return null;
    }
    
    return <>{children}</>;
};

