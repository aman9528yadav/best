

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ref, onValue, set, remove } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import type { Icon as LucideIcon } from 'lucide-react';


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

export type ComingSoonItem = {
    id: string;
    icon: 'Sparkles' | 'Wand2' | 'Share2' | 'Bot';
    title: string;
    description: string;
};

export type MembershipFeature = {
  id: string;
  feature: string;
  member: boolean;
  premium: boolean;
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

type WelcomeDialogContent = {
    title: string;
    description: string;
};


export type Countdown = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export type MaintenanceCard = {
    title: string;
    description: string;
};

export type AppUpdateConfig = {
    showBanner: boolean;
    version: string;
    url: string;
    releaseNotes: string;
};

export type MaintenanceConfig = {
    globalMaintenance: boolean;
    isDevMode: boolean;
    devPassword?: string;
    dashboardBanner: {
        show: boolean;
        targetDate: string;
        category: string;
        upcomingFeatureDetails: string;
    };
    maintenanceTargetDate: string;
    maintenanceMessage: string;
    maintenanceCards: MaintenanceCard[];
    updateItems: UpdateItem[];
    aboutPageContent: AboutPageContent;
    comingSoonItems: ComingSoonItem[];
    welcomeDialog: WelcomeDialogContent;
    membershipFeatures: MembershipFeature[];
    premiumCriteria: {
        activities: number;
        streak: number;
    };
    appUpdate: AppUpdateConfig;
};


type MaintenanceContextType = {
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: React.Dispatch<React.SetStateAction<MaintenanceConfig>>;
  isLoading: boolean;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const defaultMaintenanceConfig: MaintenanceConfig = {
    globalMaintenance: false,
    isDevMode: false,
    devPassword: 'aman',
    dashboardBanner: {
        show: true,
        targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Bug Fix',
        upcomingFeatureDetails: '1. bug fix\n2. may be some feature not working',
    },
    maintenanceTargetDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    maintenanceMessage: "We're currently performing scheduled maintenance to improve our services. We're working as quickly as possible to restore service.",
    maintenanceCards: [
        { title: "Minimal Downtime", description: "We're working as quickly as possible to restore service." },
        { title: "Better Experience", description: "Coming back with improved features and performance." }
    ],
    updateItems: [
        {
            id: 'update-1-unique',
            icon: 'Wrench',
            title: 'Bug fix and stable',
            date: '10 September, 2025',
            description: 'Here we fix some bugs and make a stable and also give a lag free experience',
            tags: ['Bug Fix', 'Beta 1.3'],
        },
        {
            id: 'update-2-unique',
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
    },
    comingSoonItems: [
        {
            id: 'coming-soon-1',
            icon: 'Sparkles',
            title: 'Shared Notes',
            description: 'Collaborate with others lets try',
        },
        {
            id: 'coming-soon-2',
            icon: 'Wand2',
            title: 'Smart Recipes',
            description: 'Context-aware steps',
        },
    ],
    welcomeDialog: {
        title: "Welcome to Sutradhaar!",
        description: "This is a smart unit converter and calculator app designed to make your life easier. Explore all the features available to you."
    },
    membershipFeatures: [
        { id: 'feat-1', feature: 'Basic Unit Conversions', member: true, premium: true },
        { id: 'feat-2', feature: 'Scientific Calculator', member: true, premium: true },
        { id: 'feat-3', feature: 'Save History', member: true, premium: true },
        { id: 'feat-4', feature: 'Premium Themes', member: false, premium: true },
        { id: 'feat-5', feature: 'Premium Unit Categories', member: false, premium: true },
        { id: 'feat-6', feature: 'Cloud Sync', member: true, premium: true },
        { id: 'feat-7', feature: 'Ad-Free Experience', member: false, premium: true },
    ],
    premiumCriteria: {
        activities: 3000,
        streak: 15,
    },
    appUpdate: {
        showBanner: false,
        version: "1.5.1",
        url: "",
        releaseNotes: "New bug fixes and performance improvements.",
    },
};

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceConfig, setMaintenanceConfigState] = useState<MaintenanceConfig>(defaultMaintenanceConfig);
  const configRef = ref(rtdb, 'config');

  const updateConfigInDb = (config: MaintenanceConfig) => {
    return set(configRef, config).catch(error => {
      console.error("Error updating maintenance config:", error);
    });
  };
  
  const setMaintenanceConfig = (value: React.SetStateAction<MaintenanceConfig>) => {
      setMaintenanceConfigState(prevConfig => {
          const newConfig = typeof value === 'function' ? value(prevConfig) : value;
          updateConfigInDb(newConfig);
          return newConfig;
      });
  }

  useEffect(() => {
    const unsubscribe = onValue(configRef, 
      (snapshot) => {
        if (snapshot.exists()) {
            const dbConfig = snapshot.val();
            const mergedConfig = {
                ...defaultMaintenanceConfig,
                ...dbConfig,
                dashboardBanner: { ...defaultMaintenanceConfig.dashboardBanner, ...(dbConfig.dashboardBanner || {}) },
                maintenanceCards: dbConfig.maintenanceCards || defaultMaintenanceConfig.maintenanceCards,
                aboutPageContent: {
                    ...defaultMaintenanceConfig.aboutPageContent,
                    ...(dbConfig.aboutPageContent || {}),
                    roadmap: dbConfig.aboutPageContent?.roadmap || defaultMaintenanceConfig.aboutPageContent.roadmap,
                },
                comingSoonItems: dbConfig.comingSoonItems || defaultMaintenanceConfig.comingSoonItems,
                welcomeDialog: { ...defaultMaintenanceConfig.welcomeDialog, ...(dbConfig.welcomeDialog || {}) },
                membershipFeatures: dbConfig.membershipFeatures || defaultMaintenanceConfig.membershipFeatures,
                premiumCriteria: { ...defaultMaintenanceConfig.premiumCriteria, ...(dbConfig.premiumCriteria || {}) },
                appUpdate: { ...defaultMaintenanceConfig.appUpdate, ...(dbConfig.appUpdate || {}) },
            };
            setMaintenanceConfigState(mergedConfig);
        } else {
            updateConfigInDb(defaultMaintenanceConfig);
            setMaintenanceConfigState(defaultMaintenanceConfig);
        }
        setIsLoading(false);
      }, 
      (error) => {
          console.error("Error fetching maintenance config:", error);
          setMaintenanceConfigState(defaultMaintenanceConfig); // Fallback to default
          setIsLoading(false);
      });

    return () => unsubscribe();
  }, []);
  
  const setDevMode = (isDev: boolean) => {
    setMaintenanceConfig(prev => ({...prev, isDevMode: isDev }));
  };

  return (
    <MaintenanceContext.Provider value={{ 
        isDevMode: maintenanceConfig.isDevMode, 
        setDevMode, 
        maintenanceConfig, 
        setMaintenanceConfig,
        isLoading
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
