
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
  ArrowUpRight,
  Calculator,
  ChevronDown,
  FileText,
  History,
  Newspaper,
  PenSquare,
  Sparkles,
  Wand2,
  Trash2,
  Paintbrush,
  BookText,
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
} from 'lucide-react';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/ad-placeholder';
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

const quickAccessItems = [
  {
    icon: ArrowRightLeft,
    label: 'Converter',
    href: '/converter',
    requiresAuth: false,
  },
  { icon: Calculator, label: 'Calculator', href: '/calculator', requiresAuth: false },
  { icon: BookText, label: 'Notes', href: '/notes', requiresAuth: true },
  { icon: History, label: 'History', href: '/history', requiresAuth: true },
  { icon: Newspaper, label: 'News', href: 'https://aman9528.wixstudio.com/my-site-3', requiresAuth: false },
  { icon: Languages, label: 'Translator', href: '#', requiresAuth: true },
  { icon: Calendar, label: 'Date Calc', href: '/date-calculator', requiresAuth: false },
  { icon: Timer, label: 'Timer', href: '/timer', requiresAuth: false },
  { icon: Hourglass, label: 'Stopwatch', href: '/stopwatch', requiresAuth: false },
  { icon: Settings, label: 'Settings', href: '/settings', requiresAuth: true },
];

const comingSoonItems = [
  {
    icon: Sparkles,
    title: 'Shared Notes',
    description: 'Collaborate with others lets try',
  },
  {
    icon: Wand2,
    title: 'Smart Recipes',
    description: 'Context-aware steps',
  },
];

const iconMap: { [key: string]: LucideIcon } = {
  Wrench,
  Rocket,
  User,
  Languages,
  Bug,
};

export default function DashboardPage() {
  const { maintenanceConfig, isLoading: isMaintenanceLoading } = useMaintenance();
  const { profile, isLoading: isProfileLoading, checkAndUpdateStreak } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isProfileLoading) {
      checkAndUpdateStreak();
    }
  }, [isProfileLoading, checkAndUpdateStreak]);

  const handleQuickAccessClick = (e: React.MouseEvent<HTMLAnchorElement>, item: (typeof quickAccessItems)[0]) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      setShowLoginDialog(true);
    }
  };

  const isPageLoading = isMaintenanceLoading || isProfileLoading || isLoading;

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
        <div className="w-full max-w-[412px] flex flex-col flex-1">
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

  const { appInfo, ownerInfo, updateItems } = maintenanceConfig;
  const { allTimeConversions = 0, todayConversions = 0, streak = 0 } = profile.stats || {};

  const visibleQuickAccessItems = showMore ? quickAccessItems : quickAccessItems.slice(0, 6);
  const whatsNewItems = (updateItems || []).slice(0, 2);


  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
        <div className="space-y-6 pb-8">
           <DashboardBanner />
          <div className="grid grid-cols-3 gap-2 text-center">
            <Card className="bg-accent/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground/80">
                  <Star className="h-4 w-4" />
                  All time
                </div>
                <div className="text-2xl font-bold">{allTimeConversions}</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground/80">
                  <Clock className="h-4 w-4" />
                  Today
                </div>
                <div className="text-2xl font-bold">{todayConversions}</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground/80">
                  <TrendingUp className="h-4 w-4" />
                  Streak
                </div>
                <div className="text-2xl font-bold">{streak}</div>
              </CardContent>
            </Card>
          </div>

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
          
          <AdPlaceholder className="w-full" />

          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Quick Access</h2>
              <Button variant="link" size="sm" className="text-primary pr-0">
                Manage
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {visibleQuickAccessItems.map((item) => (
                <Link 
                  href={item.href || '#'} 
                  key={item.label}
                  onClick={(e) => handleQuickAccessClick(e, item)}
                >
                  <Card className="h-full hover:bg-accent transition-colors">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2">
                      <div className="p-3 bg-accent rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-2 text-primary" onClick={() => setShowMore(!showMore)}>
              {showMore ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              {showMore ? 'Show Less' : 'Show More'}
            </Button>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Coming Soon</h2>
              <Button variant="link" size="sm" className="text-primary pr-0">
                Preview
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {comingSoonItems.map((item) => (
                <Card key={item.title} className="bg-accent/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <item.icon className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {item.title}{' '}
                          <Badge variant="secondary" className="text-primary bg-primary/10">
                            Soon
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          <AdPlaceholder className="w-full" />

          <section>
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
                <Card key={item.id}>
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
              )})}
            </div>
          </section>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="bg-card border rounded-lg p-2">
              <AccordionTrigger className="font-semibold py-2 text-primary no-underline hover:no-underline px-4">
                About
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">App</span>
                    <span className="font-medium">Sutradhaar · Unit Converter</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{appInfo?.version}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Developer</span>
                    <span className="font-medium">{ownerInfo?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Support</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/about">
                           <ExternalLink className="mr-2 h-4 w-4" />
                           About Us
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
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
      </div>
    </div>
  );
}
    
