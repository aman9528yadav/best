
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, FileText, Wrench, Info, Tv, Send, FileEdit, Crown, Shield, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useToast } from '@/hooks/use-toast';

export function DevPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isMaintenanceMode,
    setMaintenanceMode,
    maintenanceConfig,
    setMaintenanceConfig,
    resetMaintenanceConfig,
  } = useMaintenance();

  const handleSave = () => {
    setMaintenanceMode(maintenanceConfig.globalMaintenance);
    // setMaintenanceConfig is already updating state on change, but we could explicitly save to a backend here.
    toast({
      title: 'Settings Saved',
      description: 'Your maintenance mode settings have been updated.',
    });
  };
  
  const handleClear = () => {
    resetMaintenanceConfig();
    setMaintenanceMode(false);
    toast({
      title: 'Settings Cleared',
      description: 'Maintenance settings have been reset to default.',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMaintenanceConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaintenanceConfig(prev => ({
      ...prev,
      countdown: { ...prev.countdown, [name]: parseInt(value, 10) || 0 },
    }));
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
                      <Switch
                        id="global-maintenance"
                        checked={maintenanceConfig.globalMaintenance}
                        onCheckedChange={(checked) => setMaintenanceConfig(p => ({ ...p, globalMaintenance: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="individual-pages">
                        Individual Pages in Maintenance
                      </Label>
                      <Textarea
                        id="individual-pages"
                        name="individualPages"
                        value={maintenanceConfig.individualPages.join(', ')}
                        onChange={(e) => setMaintenanceConfig(p => ({...p, individualPages: e.target.value.split(',').map(s => s.trim())}))}
                        placeholder="e.g., /notes, /calculator"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter page paths separated by commas.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="outline" onClick={handleClear}>Clear</Button>
                        <Button onClick={handleSave}>Save</Button>
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
                      <Tv className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Dashboard Banner</CardTitle>
                        <CardDescription>
                          Manage the upcoming update banner.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-banner" className="font-medium">
                          Show Update Banner on Dashboard
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Toggles the countdown banner for all users.
                        </p>
                      </div>
                      <Switch
                        id="show-banner"
                        checked={maintenanceConfig.showDashboardBanner}
                        onCheckedChange={(checked) => setMaintenanceConfig(p => ({ ...p, showDashboardBanner: checked }))}
                      />
                    </div>
                     <div className="space-y-2">
                        <Label>Set Countdown Duration</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="days" className="text-xs text-muted-foreground">Days</Label>
                                <Input id="days" name="days" type="number" value={maintenanceConfig.countdown.days} onChange={handleTimeChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="hours" className="text-xs text-muted-foreground">Hours</Label>
                                <Input id="hours" name="hours" type="number" value={maintenanceConfig.countdown.hours} onChange={handleTimeChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="minutes" className="text-xs text-muted-foreground">Minutes</Label>
                                <Input id="minutes" name="minutes" type="number" value={maintenanceConfig.countdown.minutes} onChange={handleTimeChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="seconds" className="text-xs text-muted-foreground">Seconds</Label>
                                <Input id="seconds" name="seconds" type="number" value={maintenanceConfig.countdown.seconds} onChange={handleTimeChange} />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="banner-category" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Banner Category</Label>
                        <Select value={maintenanceConfig.bannerCategory} onValueChange={(value) => setMaintenanceConfig(p => ({ ...p, bannerCategory: value }))}>
                            <SelectTrigger id="banner-category"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Feature Update">Feature Update</SelectItem>
                                <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="upcoming-feature-details" className="flex items-center gap-2"><FileText className="h-4 w-4" />Upcoming Feature Details</Label>
                        <Textarea id="upcoming-feature-details" name="upcomingFeatureDetails" value={maintenanceConfig.upcomingFeatureDetails} onChange={handleChange} placeholder="Describe what's coming..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="outline" onClick={handleClear}>Clear</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-3" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Global Notification</CardTitle>
                        <CardDescription>
                          Update the broadcast message for all users.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                        <Textarea placeholder="Enter broadcast message..."/>
                        <Button className="w-full">Send Notification</Button>
                    </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            <AccordionItem value="item-4" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FileEdit className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Content Management</CardTitle>
                        <CardDescription>
                          Edit dynamic text and content for various pages.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                 <AccordionContent className="px-4 pb-4">
                     <p className="text-sm text-muted-foreground">Content management options will be available here.</p>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            <AccordionItem value="item-5" asChild>
              <Card>
                 <CardHeader className="p-4">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Premium Info Content</CardTitle>
                        <CardDescription>
                          Edit the content of the premium dialog.
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                 <AccordionContent className="px-4 pb-4">
                     <p className="text-sm text-muted-foreground">Premium content editing options will be available here.</p>
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
                    <Button variant="destructive" className="w-full gap-2">
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
