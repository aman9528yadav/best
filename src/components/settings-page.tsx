

"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast';
import {
  Globe,
  Palette,
  Info,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Code,
} from 'lucide-react';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useRouter } from 'next/navigation';

const themes = [
  { name: 'Sutradhaar', value: 'sutradhaar' },
  { name: 'Forest', value: 'forest' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Sunset', value: 'sunset' },
];

const appearanceModes = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'System', value: 'system', icon: Laptop },
];

export function SettingsPage() {
  const { toast } = useToast();
  const [saveHistory, setSaveHistory] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('sutradhaar');
  const [appearance, setAppearance] = useState('system');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const { isDevMode, setDevMode } = useMaintenance();
  const router = useRouter();


  const SettingRow = ({
    label,
    children,
    icon: Icon,
  }: {
    label: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-center justify-between py-4 border-b">
        <Label className="font-medium flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {label}
        </Label>
      {children}
    </div>
  );

  const handleDevModeChange = (checked: boolean) => {
    if (checked && !isDevMode) {
      setIsPasswordDialogOpen(true);
    } else {
      setDevMode(checked);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === 'aman') {
      setDevMode(true);
      toast({ title: 'Developer Mode Enabled' });
      router.push('/dev');
    } else {
      toast({ title: 'Incorrect Password', variant: 'destructive' });
    }
    setPassword('');
    setIsPasswordDialogOpen(false);
  };

  const handleOpenDevPanelClick = () => {
    setIsPasswordDialogOpen(true);
  };


  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-accent/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-6">
          <Card>
            <CardContent className="p-4 pt-6 space-y-2">
              <SettingRow label="Default Region" icon={Globe}>
                <Select defaultValue="International">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="Local">Local (Indian)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="Save History" icon={Info}>
                <Switch
                  checked={saveHistory}
                  onCheckedChange={setSaveHistory}
                />
              </SettingRow>
              <SettingRow label="Developer Mode" icon={Code}>
                <Switch
                  checked={isDevMode}
                  onCheckedChange={handleDevModeChange}
                />
              </SettingRow>
            </CardContent>
          </Card>
          
          {isDevMode && (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Code className='h-5 w-5' />Developer Options</CardTitle>
                    <CardDescription>Configure advanced developer settings for the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleOpenDevPanelClick}>
                        Open Developer Panel
                    </Button>
                </CardContent>
             </Card>
          )}

        </TabsContent>

        <TabsContent value="theme" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                {appearanceModes.map((mode) => (
                  <Button
                    key={mode.value}
                    variant={appearance === mode.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAppearance(mode.value)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <mode.icon className="h-4 w-4" />
                    {mode.name}
                  </Button>
                ))}
              </div>
              <SettingRow label="Theme" icon={Palette}>
                <Select value={currentTheme} onValueChange={setCurrentTheme}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="pt-6">
          <Card>
            <CardContent className="p-4 pt-6 space-y-2">
               <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">App Version</span>
                    <span className="text-muted-foreground">beta 1.5</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">Developer</span>
                    <span className="text-muted-foreground">Aman Yadav</span>
               </div>
               <div className="flex justify-between items-center py-3">
                    <span className="font-medium">Privacy Policy</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Enter Developer Password</AlertDialogTitle>
            <AlertDialogDescription>
                This action requires a password to access developer tools.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
