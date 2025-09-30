

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, Rocket, User, Languages, Bug, Icon as LucideIcon, GitBranch, Sparkles } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';


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
  isMaintenanceMode: boolean;
  setMaintenanceMode: (isMaintenance: boolean) => void;
  isDevMode: boolean;
  setDevMode: (isDev: boolean) => void;
  maintenanceConfig: MaintenanceConfig;
  setMaintenanceConfig: (setter: React.SetStateAction<MaintenanceConfig>) => void;
  resetMaintenanceConfig: () => void;
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
                description: 'Our journey begins! You may face some bugs🐞, but we\'re improving every day. Thanks for testing 🙏.',
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDevMode, setDevModeState] = useState<boolean>(false);
  const [maintenanceConfig, setMaintenanceConfigState] = useState<MaintenanceConfig>(defaultMaintenanceConfig);
  const configDocRef = doc(db, 'config', 'maintenance');

  useEffect(() => {
    try {
      const savedDevMode = localStorage.getItem('unitwise_dev_mode');
      if (savedDevMode) {
        setDevModeState(JSON.parse(savedDevMode));
      }
    } catch (error) {
      console.error("Failed to load dev mode from localStorage", error);
    }
    
    const initializeAndListen = async () => {
      try {
        const docSnap = await getDoc(configDocRef);
        if (!docSnap.exists()) {
          await setDoc(configDocRef, defaultMaintenanceConfig);
        }
      } catch (error) {
        console.error("Error initializing maintenance config:", error);
      }
      
      const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
          if (docSnap.exists()) {
              setMaintenanceConfigState({ ...defaultMaintenanceConfig, ...docSnap.data() });
          } else {
              setMaintenanceConfigState(defaultMaintenanceConfig);
          }
          setIsLoaded(true);
      }, (error) => {
          console.error("Error fetching maintenance config:", error);
          setMaintenanceConfigState(defaultMaintenanceConfig);
          setIsLoaded(true);
      });

      return unsubscribe;
    };
    
    const unsubscribePromise = initializeAndListen();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if(unsubscribe) unsubscribe();
      });
    };
  }, []);
  
  const updateMaintenanceConfigInDb = async (newConfig: MaintenanceConfig) => {
    try {
      await setDoc(configDocRef, newConfig);
    } catch (error) {
      console.error("Error updating maintenance config:", error);
    }
  };

  const handleSetConfig = (setter: React.SetStateAction<MaintenanceConfig>) => {
    const newConfig = typeof setter === 'function' ? setter(maintenanceConfig) : setter;
    updateMaintenanceConfigInDb(newConfig);
  };
  
  const setMaintenanceMode = (isMaintenance: boolean) => {
    handleSetConfig(prev => ({ ...prev, globalMaintenance: isMaintenance }));
  };
  
  const setDevMode = (isDev: boolean) => {
    setDevModeState(isDev);
     try {
        localStorage.setItem('unitwise_dev_mode', JSON.stringify(isDev));
      } catch (error) {
        console.error("Failed to save dev mode to localStorage", error);
      }
  };

  const resetMaintenanceConfig = () => {
    handleSetConfig(defaultMaintenanceConfig);
  }

  const addUpdateItem = (item: Omit<UpdateItem, 'id'>) => {
    handleSetConfig(prev => ({
        ...prev,
        updateItems: [{ ...item, id: new Date().toISOString() }, ...prev.updateItems ]
    }));
  };

  const editUpdateItem = (updatedItem: UpdateItem) => {
     handleSetConfig(prev => ({
        ...prev,
        updateItems: prev.updateItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  };

  const deleteUpdateItem = (id: string) => {
     handleSetConfig(prev => ({
        ...prev,
        updateItems: prev.updateItems.filter(item => item.id !== id)
    }));
  };

  const addRoadmapItem = (item: Omit<RoadmapItem, 'id'>) => {
    handleSetConfig(prev => ({
      ...prev,
      aboutPageContent: {
        ...prev.aboutPageContent,
        roadmap: [{ ...item, id: new Date().toISOString() }, ...prev.aboutPageContent.roadmap]
      }
    }));
  };

  const editRoadmapItem = (updatedItem: RoadmapItem) => {
    handleSetConfig(prev => ({
      ...prev,
      aboutPageContent: {
        ...prev.aboutPageContent,
        roadmap: prev.aboutPageContent.roadmap.map(item => item.id === updatedItem.id ? updatedItem : item)
      }
    }));
  };

  const deleteRoadmapItem = (id: string) => {
    handleSetConfig(prev => ({
      ...prev,
      aboutPageContent: {
        ...prev.aboutPageContent,
        roadmap: prev.aboutPageContent.roadmap.filter(item => item.id !== id)
      }
    }));
  };

  return (
    <MaintenanceContext.Provider value={{ 
        isMaintenanceMode: maintenanceConfig.globalMaintenance, setMaintenanceMode, 
        isDevMode, setDevMode, 
        maintenanceConfig, setMaintenanceConfig: handleSetConfig,
        resetMaintenanceConfig,
        addUpdateItem,
        editUpdateItem,
        deleteUpdateItem,
        addRoadmapItem,
        editRoadmapItem,
        deleteRoadmapItem
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
      allowedPaths.push('/dev', '/settings', '/profile/edit', '/dev/manage-updates', '/dev/manage-about');
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

    
