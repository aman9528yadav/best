
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
} from 'lucide-react';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { Header } from '@/components/header';
import { WeeklySummaryChart } from '@/components/weekly-summary-chart';
import { useHistory } from '@/context/HistoryContext';
import { isToday, differenceInCalendarDays, startOfDay } from 'date-fns';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

const quickAccessItems = [
  {
    icon: ArrowRightLeft,
    label: 'Converter',
    href: '/converter',
  },
  { icon: Calculator, label: 'Calculator', href: '/calculator' },
  { icon: BookText, label: 'Notes' },
  { icon: History, label: 'History', href: '/history' },
  { icon: Newspaper, label: 'News' },
  { icon: Languages, label: 'Translator' },
  { icon: Calendar, label: 'Date Calc' },
  { icon: Timer, label: 'Timer' },
  { icon: Hourglass, label: 'Stopwatch' },
  { icon: Settings, label: 'Settings', href: '/settings' },
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

const whatsNewItems = [
  {
    icon: Wrench,
    title: 'Bug fix and stable',
    description: 'Here we fix some bugs and make a stable and also give a lag free experience',
  },
  {
    icon: Rocket,
    title: 'Live sync by email',
    description: 'Now user can sync data live like history stats etc',
  },
];

const discoverItems = [
  {
    icon: PenSquare,
    title: 'Custom Units',
    description:
      'A premium feature for power users. Add your own units to existing categories or create entirely new categories for specialized conversions.',
  },
  {
    icon: Paintbrush,
    title: 'Theme Editor',
    description:
      "Make the app truly yours. As a Premium Member, you can use the Theme Editor to change the app's colors to match your style.",
  },
  {
    icon: FileText,
    title: 'Rich Text Editing',
    description:
      'Create detailed notes with titles, categories, and rich text formatting like bold, italics, lists, and different colors. You can even attach images.',
  },
];

export default function DashboardPage() {
  const { history } = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const conversionHistory = useMemo(() => history.filter(item => item.type === 'conversion'), [history]);

  const allTimeConversions = useMemo(() => conversionHistory.length, [conversionHistory]);

  const todayConversions = useMemo(() => {
    return conversionHistory.filter(item => isToday(new Date(item.timestamp))).length;
  }, [conversionHistory]);

  const streak = useMemo(() => {
    if (conversionHistory.length === 0) return 0;

    const sortedDates = [...new Set(conversionHistory.map(item => startOfDay(new Date(item.timestamp)).getTime()))].sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
    let currentStreak = 0;
    const today = startOfDay(new Date());

    const mostRecentDate = new Date(sortedDates[0]);

    if(isToday(mostRecentDate) || differenceInCalendarDays(today, mostRecentDate) === 1) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const date1 = new Date(sortedDates[i]);
            const date2 = new Date(sortedDates[i+1]);
            if (differenceInCalendarDays(date1, date2) === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    
    return currentStreak;
  }, [conversionHistory]);

  const visibleQuickAccessItems = showMore ? quickAccessItems : quickAccessItems.slice(0, 6);


  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="p-4 pt-0">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
         {isLoading ? (
          <DashboardSkeleton />
        ) : (
        <div className="space-y-6 pb-8">
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
              <Button variant="link" size="sm" className="text-primary pr-0">
                View Analytics
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
                <Link href={item.href || '#'} key={item.label}>
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
              {whatsNewItems.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="p-2.5 bg-accent rounded-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Discover Sutradhaar</h2>
              <Button variant="link" size="sm" className="text-primary pr-0">
                See all
              </Button>
            </div>
            <div className="space-y-3">
              {discoverItems.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-3 flex items-start gap-3">
                     <div className="p-2.5 bg-accent rounded-lg">
                       <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className='ml-auto'>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
                    <span className="font-medium">beta 1.5</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Developer</span>
                    <span className="font-medium">Aman Yadav</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Support</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        About Us
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        )}
      </main>
      </div>
    </div>
  );
}

    