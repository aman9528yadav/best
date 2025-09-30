

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, Rocket, User, Languages, Bug, Icon as LucideIcon, GitBranch, Sparkles } from 'lucide-react';
import { ref, onValue, set, get } from 'firebase/database';
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
    isDevMode: boolean; // Added to sync with DB
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
    aboutPageContent: AboutPageContent;
    appInfo: { version: string; };
    ownerInfo: { name: string; };
};


type MaintenanceContextType = {
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: (setter: React.SetStateAction<MaintenanceConfig>) => void;
  isLoading: boolean;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const defaultMaintenanceConfig: MaintenanceConfig = {
    globalMaintenance: false,
    isDevMode: false,
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
        show: false,
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
                description: 'Our journey begins! You may face some bugs🐞, but we\'\'\'re improving every day. Thanks for testing 🙏.',
                details: ['Unit converter added', 'Notes app added'],
                icon: 'GitBranch',
                status: 'completed',
            },
            {
                id: 'roadmap-2',
                version: 'Beta 1.2',
                date: '18 Nov, 2024',
                title: 'Calculator & History',
                description: 'Introducing a powerful scientific calculator and persistent history for all your activities.',
                details: ['Scientific calculator', 'Conversion & calculation history'],
                icon: 'GitBranch',
                status: 'completed',
            },
            {
                id: 'roadmap-3',
                version: 'Beta 1.3',
                date: '26 Jan, 2025',
                title: 'Profile & Themes',
                description: 'Personalize your experience with user profiles and custom themes.',
                details: ['User profile page', 'Theme customization'],
                icon: 'GitBranch',
                status: 'completed',
            },
            {
                id: 'roadmap-4',
                version: 'Beta 2.0',
                date: '10 Mar, 2025',
                title: 'AI Features & Cloud Sync',
                description: 'The next big leap! Get ready for AI-powered suggestions and seamless cloud synchronization.',
                details: ['AI unit suggestions', 'Cloud backup & sync'],
                icon: 'Sparkles',
                status: 'upcoming',
            }
        ]
    },
    appInfo: {
        version: "beta 1.5"
    },
    ownerInfo: {
        name: "Aman Yadav"
    }
};

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceConfig, setMaintenanceConfigState] = useState<MaintenanceConfig>(defaultMaintenanceConfig);
  const configRef = ref(rtdb, 'config');

  useEffect(() => {
    const unsubscribe = onValue(configRef, 
      (snapshot) => {
        if (snapshot.exists()) {
            const dbConfig = snapshot.val();
            // Merge database config with defaults to prevent missing properties
            setMaintenanceConfigState(prev => ({ ...defaultMaintenanceConfig, ...prev, ...dbConfig }));
        } else {
            // If no config in DB, create one from the default
            set(configRef, defaultMaintenanceConfig).catch(err => console.error("Error creating default config in DB", err));
            setMaintenanceConfigState(defaultMaintenanceConfig);
        }
        setIsLoading(false);
      }, 
      (error) => {
          console.error("Error fetching maintenance config:", error);
          // Fallback to default config on error
          setMaintenanceConfigState(defaultMaintenanceConfig);
          setIsLoading(false);
      });

    return () => unsubscribe();
  }, []);
  
  const updateMaintenanceConfigInDb = async (newConfig: MaintenanceConfig) => {
    try {
      await set(configRef, newConfig);
    } catch (error) {
      console.error("Error updating maintenance config:", error);
    }
  };

  const setMaintenanceConfig = (setter: React.SetStateAction<MaintenanceConfig>) => {
    setMaintenanceConfigState(prevConfig => {
        const newConfig = typeof setter === 'function' ? setter(prevConfig) : setter;
        updateMaintenanceConfigInDb(newConfig);
        return newConfig;
    });
  };
  
  const setDevMode = (isDev: boolean) => {
    setMaintenanceConfig(prev => ({...prev, isDevMode: isDev}));
  };

  return (
    <MaintenanceContext.Provider value={{ 
        isDevMode: maintenanceConfig.isDevMode, 
        setDevMode, 
        maintenanceConfig, 
        setMaintenanceConfig,
        isLoading,
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
        
        // Developer is allowed to see dev panel and settings even in maintenance mode
        const isAllowedPath = isMaintenancePage || (isDevMode && (pathname.startsWith('/dev') || pathname === '/settings'));

        if (isUnderMaintenance && !isAllowedPath) {
            router.replace('/maintenance');
        }

        if (!isUnderMaintenance && isMaintenancePage) {
            router.replace('/');
        }

    }, [maintenanceConfig, pathname, router, isLoading, isDevMode]);
    
    // While loading, don't render children to prevent components from accessing config prematurely
    if (isLoading) {
        return null;
    }
    
    // If maintenance is on, and we're not on an allowed path, don't render children to prevent content flashing during redirect
    if (maintenanceConfig.globalMaintenance && !pathname.startsWith('/maintenance') && !(isDevMode && (pathname.startsWith('/dev') || pathname === '/settings'))) {
      return null;
    }
    
    return <>{children}</>;
};
