

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Clock, Shield, Trash, Megaphone, Pencil, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import Link from 'next/link';

export function DevPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    maintenanceConfig,
    setMaintenanceConfig,
    isLoading,
  } = useMaintenance();
  const { globalMaintenance, dashboardBanner, maintenanceCountdown, maintenanceMessage } = maintenanceConfig;

  const handleGlobalMaintenanceChange = (checked: boolean) => {
    setMaintenanceConfig(prev => ({...prev, globalMaintenance: checked }));
    toast({
      title: `Global Maintenance ${checked ? 'Enabled' : 'Disabled'}`,
    });
  };

  const handleClearLocalStorage = () => {
    try {
        localStorage.clear();
        toast({
            title: "Local Storage Cleared",
            description: "All application data stored in your browser has been cleared.",
        });
        window.location.reload();
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not clear local storage.",
            variant: "destructive",
        });
    }
  }

  const handleBannerChange = (field: string, value: any) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        dashboardBanner: {
            ...prev.dashboardBanner,
            [field]: value
        }
    }));
  }
  
  const handleBannerCountdownChange = (field: 'days' | 'hours' | 'minutes' | 'seconds', value: string) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        dashboardBanner: {
            ...prev.dashboardBanner,
            countdown: {
                ...prev.dashboardBanner.countdown,
                [field]: parseInt(value, 10) || 0
            }
        }
    }));
  }

  const handleMaintenanceCountdownChange = (field: 'days' | 'hours' | 'minutes' | 'seconds', value: string) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        maintenanceCountdown: {
            ...prev.maintenanceCountdown,
            [field]: parseInt(value, 10) || 0
        }
    }));
  }

  const handleMaintenanceMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMaintenanceConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }));
  }


  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Developer Panel</h1>
            <p className="text-muted-foreground">Tools for testing and debugging.</p>
          </div>
        </div>

        <main className="flex-1 space-y-4 pb-12">
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
            
            <AccordionItem value="item-1" asChild>
              <Card>
                <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                        <CardDescription>
                          Control app-wide maintenance state.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <Label htmlFor="global-maintenance" className="font-medium">
                          Enable Global Maintenance
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Redirects all users to the maintenance site.
                        </p>
                      </div>
                      {isLoading ? (
                        <div className="animate-pulse bg-muted h-6 w-11 rounded-full"></div>
                      ) : (
                        <Switch
                          id="global-maintenance"
                          checked={globalMaintenance}
                          onCheckedChange={handleGlobalMaintenanceChange}
                        />
                      )}
                    </div>
                    <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label>Maintenance Page Countdown</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Days</Label><Input type="number" value={maintenanceCountdown.days} onChange={e => handleMaintenanceCountdownChange('days', e.target.value)} /></div>
                        <div><Label className="text-xs">Hours</Label><Input type="number" value={maintenanceCountdown.hours} onChange={e => handleMaintenanceCountdownChange('hours', e.target.value)} /></div>
                        <div><Label className="text-xs">Minutes</Label><Input type="number" value={maintenanceCountdown.minutes} onChange={e => handleMaintenanceCountdownChange('minutes', e.target.value)} /></div>
                        <div><Label className="text-xs">Seconds</Label><Input type="number" value={maintenanceCountdown.seconds} onChange={e => handleMaintenanceCountdownChange('seconds', e.target.value)} /></div>
                      </div>
                   </div>
                    <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                        <Label htmlFor="maintenance-message">Maintenance Page Message</Label>
                        <Textarea id="maintenance-message" value={maintenanceMessage} onChange={handleMaintenanceMessageChange} rows={4} />
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            <AccordionItem value="item-2" asChild>
              <Card>
                <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Dashboard Banner</CardTitle>
                        <CardDescription>
                          Control the promotional banner content.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between">
                    <Label htmlFor="show-banner">Show Banner</Label>
                    <Switch id="show-banner" checked={dashboardBanner.show} onCheckedChange={(c) => handleBannerChange('show', c)} />
                  </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label>Banner Countdown Timer</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Days</Label><Input type="number" value={dashboardBanner.countdown.days} onChange={e => handleBannerCountdownChange('days', e.target.value)} /></div>
                        <div><Label className="text-xs">Hours</Label><Input type="number" value={dashboardBanner.countdown.hours} onChange={e => handleBannerCountdownChange('hours', e.target.value)} /></div>
                        <div><Label className="text-xs">Minutes</Label><Input type="number" value={dashboardBanner.countdown.minutes} onChange={e => handleBannerCountdownChange('minutes', e.target.value)} /></div>
                        <div><Label className="text-xs">Seconds</Label><Input type="number" value={dashboardBanner.countdown.seconds} onChange={e => handleBannerCountdownChange('seconds', e.target.value)} /></div>
                      </div>
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="banner-category">Category</Label>
                      <Input id="banner-category" value={dashboardBanner.category} onChange={e => handleBannerChange('category', e.target.value)} />
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="banner-details">Upcoming Feature Details</Label>
                      <Textarea id="banner-details" value={dashboardBanner.upcomingFeatureDetails} onChange={e => handleBannerChange('upcomingFeatureDetails', e.target.value)} />
                   </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-3" asChild>
              <Card>
                <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Pencil className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Content Management</CardTitle>
                        <CardDescription>
                          Edit content for various app pages.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href="/dev/manage-updates">
                      Manage "What's New"
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href="/dev/manage-about">
                      Manage "About" Page
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            <AccordionItem value="item-6" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Security & Data</CardTitle>
                        <CardDescription>
                          Manage developer access and clear local data.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4">
                    <Button variant="destructive" className="w-full gap-2" onClick={handleClearLocalStorage}>
                        <Trash className="h-4 w-4"/>
                        Clear All Local Storage
                    </Button>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
          </Accordion>
        </main>
      </div>
    </div>
  );
}
