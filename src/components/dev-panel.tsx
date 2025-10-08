

"use client";

import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Clock, Shield, Trash, Megaphone, Pencil, ChevronRight, Send, KeyRound, MessageSquare, Timer, Calendar, Gem, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMaintenance, Countdown } from '@/context/MaintenanceContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import Link from 'next/link';
import { ref, set, remove, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProfile } from '@/context/ProfileContext';
import { format, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const appPages = [
    { name: 'Dashboard', path: '/' },
    { name: 'Converter', path: '/converter' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Date Calculator', path: '/date-calculator' },
    { name: 'Timer', path: '/timer' },
    { name: 'Stopwatch', path: '/stopwatch' },
    { name: 'History', path: '/history' },
    { name: 'Notes', path: '/notes' },
    { name: 'Todo', path: '/todo' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
    { name: 'About', path: '/about' },
    { name: 'What\'s New', path: '/whats-new' },
    { name: 'Membership', path: '/membership' },
];

export function DevPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    maintenanceConfig,
    setMaintenanceConfig,
    isLoading,
  } = useMaintenance();
  const { globalMaintenance, pageMaintenance, dashboardBanner, maintenanceMessage, devPassword, welcomeDialog, maintenanceTargetDate, premiumCriteria, maintenanceCards, appUpdate } = maintenanceConfig;
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const { clearAllHistory } = useProfile();
  const [passwordState, setPasswordState] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');
    const listener = onValue(messageRef, (snapshot) => {
        if(snapshot.exists()) {
            setBroadcastMessage(snapshot.val().text || '');
        } else {
            setBroadcastMessage('');
        }
    });

    return () => {
        off(messageRef, 'value', listener);
    }
  }, []);


  const handleGlobalMaintenanceChange = (checked: boolean) => {
    setMaintenanceConfig(prev => ({...prev, globalMaintenance: checked }));
    toast({
      title: `Global Maintenance ${checked ? 'Enabled' : 'Disabled'}`,
    });
  };

  const handlePageMaintenanceChange = (path: string, checked: boolean) => {
    setMaintenanceConfig(prev => ({
        ...prev,
        pageMaintenance: {
            ...prev.pageMaintenance,
            [path]: checked
        }
    }));
    toast({
        title: `Maintenance for ${path} ${checked ? 'Enabled' : 'Disabled'}`,
    });
  };

  const handleClearLocalStorage = () => {
    try {
        localStorage.clear();
        clearAllHistory('all');
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
  
  const handleMaintenanceTargetDateChange = (value: string) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        maintenanceTargetDate: new Date(value).toISOString()
    }));
  };
  
  const handleMaintenanceMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMaintenanceConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }));
  }

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      toast({ title: 'Cannot send empty message', variant: 'destructive' });
      return;
    }
    const messageRef = ref(rtdb, 'broadcast/message');
    set(messageRef, {
      text: broadcastMessage,
      timestamp: new Date().toISOString(),
    })
    .then(() => {
      toast({ title: 'Broadcast Sent!' });
    })
    .catch((error) => {
      toast({ title: 'Broadcast Failed', description: error.message, variant: 'destructive' });
    });
  };

  const handleClearBroadcast = () => {
    const messageRef = ref(rtdb, 'broadcast/message');
    remove(messageRef)
      .then(() => {
        toast({ title: 'Broadcast message cleared from database.' });
        setBroadcastMessage('');
      })
      .catch((error) => {
        toast({
          title: 'Error Clearing Broadcast',
          description: error.message,
          variant: 'destructive',
        });
      });
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordState(prev => ({ ...prev, [name]: value }));
  }

  const handleChangeDevPassword = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordState;
    if (currentPassword !== (devPassword || 'aman')) {
        toast({ title: "Incorrect Current Password", variant: "destructive" });
        return;
    }
    if (newPassword !== confirmNewPassword) {
        toast({ title: "New passwords do not match", variant: "destructive" });
        return;
    }
    if (newPassword.length < 4) {
        toast({ title: "Password is too short", variant: "destructive" });
        return;
    }

    setMaintenanceConfig(prev => ({ ...prev, devPassword: newPassword }));
    toast({ title: "Developer password updated successfully!" });
    setPasswordState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };
  
  const handleWelcomeDialogChange = (field: 'title' | 'description', value: string) => {
    setMaintenanceConfig(prev => ({
        ...prev,
        welcomeDialog: {
            ...prev.welcomeDialog,
            [field]: value
        }
    }));
  }
  
  const handlePremiumCriteriaChange = (field: 'activities' | 'streak', value: string) => {
    setMaintenanceConfig(prev => ({
        ...prev,
        premiumCriteria: {
            ...prev.premiumCriteria,
            [field]: parseInt(value) || 0
        }
    }));
  };
  
  const handleMaintenanceCardChange = (index: number, field: 'title' | 'description', value: string) => {
    setMaintenanceConfig(prev => {
        const newCards = [...prev.maintenanceCards];
        newCards[index] = { ...newCards[index], [field]: value };
        return { ...prev, maintenanceCards: newCards };
    });
  };
  
   const handleAppUpdateChange = (field: keyof typeof appUpdate, value: any) => {
     setMaintenanceConfig(prev => ({
        ...prev,
        appUpdate: {
            ...prev.appUpdate,
            [field]: value
        }
    }));
  };


  const formatDateTimeForInput = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
      return '';
    }
  };

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
                        <Label>Page-Specific Maintenance</Label>
                        {appPages.map(page => (
                           <div key={page.path} className="flex items-center justify-between">
                                <Label htmlFor={`page-maintenance-${page.path}`} className="text-sm font-normal">{page.name}</Label>
                                <Switch
                                    id={`page-maintenance-${page.path}`}
                                    checked={!!pageMaintenance[page.path]}
                                    onCheckedChange={(checked) => handlePageMaintenanceChange(page.path, checked)}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="bg-accent/50 p-4 rounded-lg space-y-4">
                      <Label>Maintenance Page Countdown</Label>
                       <Input
                            type="datetime-local"
                            value={formatDateTimeForInput(maintenanceTargetDate)}
                            onChange={(e) => handleMaintenanceTargetDateChange(e.target.value)}
                        />
                   </div>
                    <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                        <Label htmlFor="maintenance-message">Maintenance Page Message</Label>
                        <Textarea id="maintenance-message" value={maintenanceMessage} onChange={handleMaintenanceMessageChange} rows={4} />
                    </div>
                    {maintenanceCards.map((card, index) => (
                         <div key={index} className="bg-accent/50 p-4 rounded-lg space-y-2">
                            <Label htmlFor={`card-title-${index}`}>Card {index + 1} Title</Label>
                            <Input id={`card-title-${index}`} value={card.title} onChange={(e) => handleMaintenanceCardChange(index, 'title', e.target.value)} />
                             <Label htmlFor={`card-desc-${index}`}>Card {index + 1} Description</Label>
                            <Textarea id={`card-desc-${index}`} value={card.description} onChange={(e) => handleMaintenanceCardChange(index, 'description', e.target.value)} rows={2} />
                        </div>
                    ))}
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
                   <div className="bg-accent/50 p-4 rounded-lg space-y-4">
                        <Label htmlFor="banner-target-date">Banner Countdown Target</Label>
                        <Input
                            id="banner-target-date"
                            type="datetime-local"
                            value={formatDateTimeForInput(dashboardBanner.targetDate)}
                            onChange={(e) => handleBannerChange('targetDate', new Date(e.target.value).toISOString())}
                        />
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

            <AccordionItem value="item-8" asChild>
              <Card>
                <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">App Update</CardTitle>
                        <CardDescription>
                          Manage APK download banner.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between">
                        <Label htmlFor="show-app-update">Show Download Banner</Label>
                        <Switch id="show-app-update" checked={appUpdate.showBanner} onCheckedChange={(c) => handleAppUpdateChange('showBanner', c)} />
                    </div>
                    <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="app-version">App Version</Label>
                      <Input id="app-version" value={appUpdate.version} onChange={e => handleAppUpdateChange('version', e.target.value)} placeholder="e.g., 1.5.1" />
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="app-url">Download URL</Label>
                      <Input id="app-url" value={appUpdate.url} onChange={e => handleAppUpdateChange('url', e.target.value)} placeholder="https://example.com/app.apk" />
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="app-release-notes">Release Notes</Label>
                      <Textarea id="app-release-notes" value={appUpdate.releaseNotes} onChange={e => handleAppUpdateChange('releaseNotes', e.target.value)} />
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
                   <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href="/dev/manage-coming-soon">
                      Manage "Coming Soon"
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                   <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href="/dev/manage-membership">
                      Manage Membership
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
             <AccordionItem value="item-5" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Welcome Dialog</CardTitle>
                        <CardDescription>
                          Edit the welcome dialog content.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-4">
                     <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="welcome-title">Title</Label>
                      <Input id="welcome-title" value={welcomeDialog.title} onChange={e => handleWelcomeDialogChange('title', e.target.value)} />
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="welcome-description">Description</Label>
                      <Textarea id="welcome-description" value={welcomeDialog.description} onChange={e => handleWelcomeDialogChange('description', e.target.value)} />
                   </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
             <AccordionItem value="item-7" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Gem className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Premium Criteria</CardTitle>
                        <CardDescription>
                          Set goals for premium membership upgrade.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-4">
                     <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="premium-activities">All-Time Activities Goal</Label>
                      <Input id="premium-activities" type="number" value={premiumCriteria.activities} onChange={e => handlePremiumCriteriaChange('activities', e.target.value)} />
                   </div>
                   <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                      <Label htmlFor="premium-streak">Streak Goal (days)</Label>
                      <Input id="premium-streak" type="number" value={premiumCriteria.streak} onChange={e => handlePremiumCriteriaChange('streak', e.target.value)} />
                   </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-4" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Broadcast Message</CardTitle>
                        <CardDescription>
                          Send a real-time message to all users.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4 space-y-4">
                    <Textarea 
                      placeholder="Type your broadcast message here..." 
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full gap-2" onClick={handleClearBroadcast}>
                          <Trash className="h-4 w-4" />
                          Clear
                      </Button>
                      <Button className="w-full gap-2" onClick={handleSendBroadcast}>
                        <Send className="h-4 w-4" />
                        Send Broadcast
                      </Button>
                    </div>
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
                <AccordionContent className="px-4 pb-4 space-y-6">
                    <div className="space-y-4">
                        <Label className='flex items-center gap-2'><KeyRound className='h-4 w-4'/>Change Developer Password</Label>
                        <Input name="currentPassword" type="password" placeholder="Current Password" value={passwordState.currentPassword} onChange={handlePasswordInputChange}/>
                        <Input name="newPassword" type="password" placeholder="New Password" value={passwordState.newPassword} onChange={handlePasswordInputChange}/>
                        <Input name="confirmNewPassword" type="password" placeholder="Confirm New Password" value={passwordState.confirmNewPassword} onChange={handlePasswordInputChange}/>
                        <Button className="w-full" onClick={handleChangeDevPassword}>Change Password</Button>
                    </div>
                    <div className="space-y-4">
                        <Label className='flex items-center gap-2'><Trash className='h-4 w-4'/>Clear Local Data</Label>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full gap-2">
                                    <Trash className="h-4 w-4"/>
                                    Clear All Local Storage
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will clear all local storage, including history, profile, and settings for guest users. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearLocalStorage}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
          </Accordion>
        </main>
      </div>
    </div>
  );
}
