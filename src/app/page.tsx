

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Flame,
    Calculator,
    BookText,
    History,
    Newspaper,
    PenSquare,
    Sparkles,
    Wand2,
    Trash2,
    Paintbrush,
    Rocket,
    Wrench,
    Languages,
    ArrowRightLeft,
    Star,
    Clock,
    TrendingUp,
    Mail,
    ExternalLink,
    ChevronUp,
    Calendar,
    Timer,
    Hourglass,
    Settings,
    Bug,
    User,
    Icon as LucideIcon,
    Share2,
    Bot,
    CheckSquare,
    ChevronDown,
    Info,
    Download,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { AdMobBanner } from '@/components/admob-banner';
import { Header } from '@/components/header';
import { WeeklySummaryChart } from '@/components/weekly-summary-chart';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { useMaintenance } from '@/context/MaintenanceContext';
import { DashboardBanner } from '@/components/dashboard-banner';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RecentNoteWidget } from '@/components/widgets/recent-note-widget';
import { PendingTodosWidget } from '@/components/widgets/pending-todos-widget';

export const quickAccessItems = [
  {
    id: 'converter',
    icon: ArrowRightLeft,
    label: 'Converter',
    href: '/converter',
    requiresAuth: false,
  },
  { id: 'calculator', icon: Calculator, label: 'Calculator', href: '/calculator', requiresAuth: false },
  { id: 'notes', icon: BookText, label: 'Notes', href: '/notes', requiresAuth: true },
  { id: 'todo', icon: CheckSquare, label: 'Todo', href: '/todo', requiresAuth: true },
  { id: 'budget', icon: Wallet, label: 'Budget', href: '/budget-tracker', requiresAuth: true },
  { id: 'history', icon: History, label: 'History', href: '/history', requiresAuth: true },
  { id: 'news', icon: Newspaper, label: 'News', href: 'https://aman9528.wixstudio.com/my-site-3', requiresAuth: false },
  { id: 'translator', icon: Languages, label: 'Translator', href: '#', requiresAuth: true },
];

export const moreAccessItems = [
    { id: 'date-calculator', icon: Calendar, label: 'Date Calc', href: '/date-calculator', requiresAuth: false },
    { id: 'timer', icon: Timer, label: 'Timer', href: '/timer', requiresAuth: false },
    { id: 'stopwatch', icon: Hourglass, label: 'Stopwatch', href: '/stopwatch', requiresAuth: false },
    { id: 'settings', icon: Settings, label: 'Settings', href: '/settings', requiresAuth: true },
];

const iconMap: { [key: string]: LucideIcon } = {
  Wrench,
  Rocket,
  User,
  Languages,
  Bug,
  Sparkles,
  Wand2,
  Share2,
  Bot,
};

const widgetComponents = {
    recentNote: RecentNoteWidget,
    pendingTodos: PendingTodosWidget,
    // miniBudget: MiniBudgetWidget,
};

export default function DashboardPage() {
  const { maintenanceConfig, isLoading: isMaintenanceLoading } = useMaintenance();
  const { profile, isLoading: isProfileLoading, checkAndUpdateStreak } = useProfile();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    toast({
      title: "Welcome to your Dashboard!",
      description: "You can find all your tools and stats here.",
    });
  }, [toast]);

  useEffect(() => {
    const welcomeSetting = localStorage.getItem('sutradhaar_show_welcome');
    if (welcomeSetting === null || welcomeSetting === 'true') {
        setShowWelcomeDialog(true);
    }
  }, []);


  const handleWelcomeConfirm = (dontShowAgain: boolean) => {
    setShowWelcomeDialog(false);
    if (dontShowAgain) {
      localStorage.setItem('sutradhaar_show_welcome', 'false');
    } else {
       localStorage.setItem('sutradhaar_show_welcome', 'true');
    }
  };


  useEffect(() => {
    if (!isProfileLoading) {
      checkAndUpdateStreak();
    }
  }, [isProfileLoading, checkAndUpdateStreak]);

  const handleQuickAccessClick = (e: React.MouseEvent, item: { requiresAuth: boolean }) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      setShowLoginDialog(true);
    }
  };

  const isPageLoading = isMaintenanceLoading || isProfileLoading;
  
  const userQuickAccessItems = useMemo(() => {
    if (!profile.quickAccessOrder || profile.quickAccessOrder.length === 0) {
      return quickAccessItems;
    }
    
    // Start with a map of the default items for quick lookup
    const defaultItemsMap = new Map(quickAccessItems.map(item => [item.id, item]));
    
    // Create a Set of all default item IDs
    const defaultItemIds = new Set(quickAccessItems.map(item => item.id));

    // Get the user's ordered and filtered items
    const orderedUserItems = profile.quickAccessOrder
      .map(orderItem => {
        const itemDetails = defaultItemsMap.get(orderItem.id);
        if (itemDetails && !orderItem.hidden) {
          return itemDetails;
        }
        return null;
      })
      .filter(item => item !== null) as (typeof quickAccessItems);
      
    const orderedUserItemIds = new Set(orderedUserItems.map(item => item.id));

    // Get any default items that are not in the user's order list
    const remainingDefaultItems = quickAccessItems.filter(item => !orderedUserItemIds.has(item.id));

    // Combine them, so user's order is first, then any new default items are added at the end
    return [...orderedUserItems, ...remainingDefaultItems];

  }, [profile.quickAccessOrder]);
  
  const orderedWidgets = useMemo(() => {
    if (!profile.dashboardWidgets) return [];
    return profile.dashboardWidgets.filter(w => !w.hidden);
  }, [profile.dashboardWidgets]);


  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
          <div className="p-4 pt-0">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    )
  }

  const { appInfo, ownerInfo, updateItems, comingSoonItems, welcomeDialog } = maintenanceConfig;
  const { allTimeActivities = 0, todayActivities = 0, streak = 0 } = profile.stats || {};

  const whatsNewItems = (updateItems || []).slice(0, 3);
  const displayedComingSoonItems = (comingSoonItems || []);


  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground pb-24">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DashboardBanner />
          </motion.div>
        
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 text-center">
            <Card>
              <CardContent className="p-3 space-y-1">
                <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                <div className="text-2xl font-bold">{allTimeActivities}</div>
                <div className="text-xs text-muted-foreground">All time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 space-y-1">
                <Calendar className="h-5 w-5 text-green-500 mx-auto" />
                <div className="text-2xl font-bold">{todayActivities}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 space-y-1">
                <Flame className="h-5 w-5 text-red-500 mx-auto" />
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                  Weekly Summary
              </CardTitle>
              <Button asChild variant="link" size="sm" className="text-primary pr-0">
                  <Link href="/analytics">View Analytics</Link>
              </Button>
              </CardHeader>
              <CardContent>
                <WeeklySummaryChart />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Quick Access</h2>
              <Button asChild variant="link" size="sm" className="text-primary pr-0">
                <Link href="/profile/manage-quick-access">Manage</Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {userQuickAccessItems.map((item) => (
                <Link 
                  href={item.href || '#'} 
                  key={item.label}
                  onClick={(e) => handleQuickAccessClick(e, item)}
                  className="flex flex-col items-center gap-2"
                >
                    <div className="p-4 rounded-full flex items-center justify-center bg-accent">
                        <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                </Link>
              ))}
               <div className="flex flex-col items-center gap-2" onClick={() => setShowMore(!showMore)}>
                  <div className={cn("p-4 rounded-full flex items-center justify-center cursor-pointer", showMore ? "bg-primary text-primary-foreground" : "bg-accent text-primary")}>
                      {showMore ? <ChevronUp className="h-5 w-5"/> : <Sparkles className="h-5 w-5"/>}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">More</span>
              </div>
            </div>
             <AnimatePresence>
                {showMore && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-4 gap-4 text-center pt-4">
                            {moreAccessItems.map(item => (
                                <Link 
                                    href={item.href || '#'} 
                                    key={item.label}
                                    onClick={(e) => handleQuickAccessClick(e, item)}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="p-4 rounded-full flex items-center justify-center bg-accent">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.section>
          
           <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">My Widgets</h2>
              <Button asChild variant="link" size="sm" className="text-primary pr-0">
                <Link href="/profile/manage-widgets">Manage</Link>
              </Button>
            </div>
            <div className="space-y-4">
               {orderedWidgets.map(widget => {
                 const WidgetComponent = widgetComponents[widget.id];
                 return WidgetComponent ? <WidgetComponent key={widget.id} /> : null;
               })}
            </div>
          </motion.section>


           <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">What&apos;s New</h2>
              <Button asChild variant="link" size="sm" className="text-primary pr-0">
                <Link href="/whats-new">See all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {whatsNewItems.map((item) => {
                const ItemIcon = iconMap[item.icon] || Bug;
                return (
                <motion.div key={item.id} whileHover={{ y: -2, scale: 1.02 }}>
                    <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                        <div className="p-2.5 bg-accent rounded-lg">
                        <ItemIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                        <div className="font-medium">{item.title}</div>
                        <p className="text-sm text-muted-foreground">
                            {item.description}
                        </p>
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
              )})}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h2 className="font-semibold mb-2">Coming Soon</h2>
            <ScrollArea className="w-full">
              <div className="flex space-x-3 pb-4">
                {displayedComingSoonItems.map((item) => {
                  const ItemIcon = iconMap[item.icon] || Sparkles;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="w-48 shrink-0"
                    >
                      <Card className="h-full bg-primary/10 border-primary/20">
                        <CardContent className="p-3 flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <ItemIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {item.title}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <h2 className="font-semibold mb-2">About Sutradhaar</h2>
            <motion.div whileHover={{ y: -2, scale: 1.02 }}>
              <Card>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent rounded-lg">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Version {appInfo.version}</h3>
                      <p className="text-sm text-muted-foreground">
                        Built by {ownerInfo.name}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="link" size="sm" className="text-primary">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        </main>
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to access this feature. Please log in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>Go to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <WelcomeDialog 
        open={showWelcomeDialog} 
        onOpenChange={setShowWelcomeDialog} 
        onConfirm={handleWelcomeConfirm}
        title={welcomeDialog.title}
        description={welcomeDialog.description}
      />
      </div>
    </div>
  );
}
