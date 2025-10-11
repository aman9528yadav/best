

"use client";

import React, { useState, useEffect } from 'react';
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
  Volume2,
  MessageSquare,
  Paintbrush,
  Lock,
  Atom,
  LayoutGrid,
  LayoutDashboard,
} from 'lucide-react';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useProfile, HSLColor } from '@/context/ProfileContext';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const themes = [
  { name: 'Sutradhaar', value: 'sutradhaar', isPremium: false },
  { name: 'Forest', value: 'forest', isPremium: true },
  { name: 'Ocean', value: 'ocean', isPremium: true },
  { name: 'Sunset', value: 'sunset', isPremium: true },
  { name: 'Sunrise', value: 'sunrise', isPremium: true },
  { name: 'Twilight', value: 'twilight', isPremium: true },
  { name: 'Aurora', value: 'aurora', isPremium: true },
  { name: 'Custom', value: 'custom', isPremium: true },
];

const appearanceModes = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'System', value: 'system', icon: Laptop },
];

// Helper function to convert HSL to HEX
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Helper function to convert HEX to HSL
const hexToHsl = (hex: string): HSLColor => {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
}


export default function SettingsPage() {
  const { toast } = useToast();
  const { profile, setProfile } = useProfile();
  const { settings, membership } = profile;
  const [saveHistory, setSaveHistory] = useState(settings.saveHistory);
  const [calculatorSounds, setCalculatorSounds] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const { maintenanceConfig, setMaintenanceConfig } = useMaintenance();
  const { isDevMode } = maintenanceConfig;
  const router = useRouter();
  const { user } = useAuth();
  
  const [customTheme, setCustomTheme] = useState(settings.customTheme || {
      background: { h: 0, s: 0, l: 100 },
      foreground: { h: 240, s: 10, l: 3.9 },
      primary: { h: 240, s: 5.9, l: 10 },
      accent: { h: 240, s: 4.8, l: 95.9 },
  });


  useEffect(() => {
    const soundsEnabled = localStorage.getItem('sutradhaar_calculator_sounds') === 'true';
    setCalculatorSounds(soundsEnabled);
    const welcomeEnabled = localStorage.getItem('sutradhaar_show_welcome') === 'true';
    setShowWelcome(welcomeEnabled);
  }, []);
  
  useEffect(() => {
    if (settings.customTheme) {
        setCustomTheme(settings.customTheme);
    }
  }, [settings.customTheme]);

  const handleCustomThemeChange = (colorName: keyof typeof customTheme, hexValue: string) => {
      const newHsl = hexToHsl(hexValue);
      const newCustomTheme = {
        ...customTheme,
        [colorName]: newHsl,
      };
      setCustomTheme(newCustomTheme);
       setProfile(p => ({
        ...p,
        settings: {
            ...p.settings,
            customTheme: newCustomTheme
        }
    }));
  };
  
  const handleCustomThemeSliderChange = (colorName: keyof typeof customTheme, hslKey: 'h' | 's' | 'l', value: number) => {
    const newCustomTheme = {
        ...customTheme,
        [colorName]: {
            ...customTheme[colorName],
            [hslKey]: value
        }
    };
    setCustomTheme(newCustomTheme);
    setProfile(p => ({
        ...p,
        settings: {
            ...p.settings,
            customTheme: newCustomTheme
        }
    }));
  };


  const handleCalculatorSoundsChange = (checked: boolean) => {
    setCalculatorSounds(checked);
    localStorage.setItem('sutradhaar_calculator_sounds', String(checked));
    toast({
      title: `Calculator sounds ${checked ? 'enabled' : 'disabled'}`,
    });
  };

  const handleShowWelcomeChange = (checked: boolean) => {
    setShowWelcome(checked);
    localStorage.setItem('sutradhaar_show_welcome', String(checked));
    toast({
      title: `Welcome screen on startup ${checked ? 'enabled' : 'disabled'}`,
    });
  };

  const handleSaveHistoryChange = (checked: boolean) => {
    setSaveHistory(checked);
    setProfile(p => ({
        ...p,
        settings: {
            ...p.settings,
            saveHistory: checked
        }
    }));
    toast({
      title: `History saving ${checked ? 'enabled' : 'disabled'}`,
    });
  }

  const isOwner = user?.email === 'amanyadavyadav9458@gmail.com';
  const isPremium = membership === 'premium' || membership === 'owner';

  const SettingRow = ({
    label,
    children,
    icon: Icon,
    isLink,
    href
  }: {
    label: string;
    children?: React.ReactNode;
    icon?: React.ElementType;
    isLink?: boolean;
    href?: string;
  }) => {
    const content = (
       <div className="flex items-center justify-between py-4 border-b">
            <Label className="font-medium flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
            </Label>
          {children}
          {isLink && <ChevronRight className="h-5 w-5 text-muted-foreground"/>}
        </div>
    );

    return isLink && href ? <Link href={href}>{content}</Link> : content;
  };

  const handleDevModeChange = (checked: boolean) => {
    if (checked && !isDevMode) {
      setIsPasswordDialogOpen(true);
    } else {
      setMaintenanceConfig(p => ({...p, isDevMode: checked}));
       if (!checked) {
        toast({ title: 'Developer Mode Disabled' });
      }
    }
  };

  const handlePasswordSubmit = () => {
    if (password === (maintenanceConfig.devPassword || 'aman')) {
      setMaintenanceConfig(p => ({...p, isDevMode: true}));
      toast({ title: 'Developer Mode Enabled' });
      router.push('/dev');
    } else {
      toast({ title: 'Incorrect Password', variant: 'destructive' });
    }
    setPassword('');
    setIsPasswordDialogOpen(false);
  };

  const handleOpenDevPanelClick = () => {
    if (isDevMode) {
      router.push('/dev');
    } else {
      setIsPasswordDialogOpen(true);
    }
  };


  return (
    <div className="w-full space-y-6 pb-24">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-accent/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-6">
          <Card>
            <CardContent className="p-4 pt-0">
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
                  onCheckedChange={handleSaveHistoryChange}
                />
              </SettingRow>
              <SettingRow label="Calculator Sounds" icon={Volume2}>
                <Switch
                  checked={calculatorSounds}
                  onCheckedChange={handleCalculatorSoundsChange}
                />
              </SettingRow>
               <SettingRow label="Custom Units" icon={Atom} isLink href="/settings/custom-units" />
              <SettingRow label="Show Welcome Screen" icon={MessageSquare}>
                <Switch
                  checked={showWelcome}
                  onCheckedChange={handleShowWelcomeChange}
                />
              </SettingRow>
              {isOwner && (
                <SettingRow label="Developer Mode" icon={Code}>
                  <Switch
                    checked={isDevMode}
                    onCheckedChange={handleDevModeChange}
                  />
                </SettingRow>
              )}
            </CardContent>
          </Card>
          
           <Card className="mt-6">
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><LayoutDashboard className='h-5 w-5' />Dashboard</CardTitle>
                    <CardDescription>Customize your dashboard layout.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <SettingRow label="Manage Quick Access" icon={LayoutGrid} isLink href="/profile/manage-quick-access" />
                   <SettingRow label="Manage Widgets" icon={LayoutDashboard} isLink href="/profile/manage-widgets" />
                </CardContent>
             </Card>
          
          {isDevMode && isOwner && (
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
                    variant={theme === mode.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme(mode.value)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <mode.icon className="h-4 w-4" />
                    {mode.name}
                  </Button>
                ))}
              </div>
              <SettingRow label="Theme" icon={Palette}>
                <Select
                  value={theme?.includes('theme-') ? theme.substring(6) : (theme === 'custom' ? 'custom' : 'sutradhaar')}
                  onValueChange={(v) => {
                    const selectedTheme = themes.find(t => t.value === v);
                    if (selectedTheme?.isPremium && !isPremium) {
                      toast({ title: "Premium Theme", description: "Upgrade to unlock this theme." });
                      return;
                    }
                    setTheme(v === 'sutradhaar' ? 'sutradhaar' : v === 'custom' ? 'custom' : `theme-${v}`);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((themeItem) => (
                      <SelectItem
                        key={themeItem.value}
                        value={themeItem.value}
                        disabled={themeItem.isPremium && !isPremium}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{themeItem.name}</span>
                          {themeItem.isPremium && !isPremium && <Lock className="h-4 w-4 text-muted-foreground ml-2" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>

           {theme === 'custom' && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5"/>Custom Theme Editor</CardTitle>
                    <CardDescription>Fine-tune the colors for your custom theme.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    {(Object.keys(customTheme) as Array<keyof typeof customTheme>).map(colorName => (
                         <div key={colorName} className="space-y-3 p-4 rounded-lg bg-accent/50">
                            <Label className="font-medium capitalize flex items-center gap-2">
                                {colorName}
                            </Label>
                            <div className="flex items-center gap-2">
                               <Input 
                                 type="color" 
                                 className="h-10 w-12 p-1"
                                 value={hslToHex(customTheme[colorName].h, customTheme[colorName].s, customTheme[colorName].l)}
                                 onChange={(e) => handleCustomThemeChange(colorName, e.target.value)}
                               />
                               <Input 
                                 className="flex-1"
                                 value={hslToHex(customTheme[colorName].h, customTheme[colorName].s, customTheme[colorName].l)}
                                 onChange={(e) => handleCustomThemeChange(colorName, e.target.value)}
                               />
                            </div>
                            <div className="space-y-2">
                                <Label className='text-xs'>Hue: {customTheme[colorName].h}</Label>
                                <Slider value={[customTheme[colorName].h]} max={360} onValueChange={([v]) => handleCustomThemeSliderChange(colorName, 'h', v)} />
                                <Label className='text-xs'>Saturation: {customTheme[colorName].s}%</Label>
                                <Slider value={[customTheme[colorName].s]} max={100} onValueChange={([v]) => handleCustomThemeSliderChange(colorName, 's', v)} />
                                <Label className='text-xs'>Lightness: {customTheme[colorName].l}%</Label>
                                <Slider value={[customTheme[colorName].l]} max={100} onValueChange={([v]) => handleCustomThemeSliderChange(colorName, 'l', v)} />
                            </div>
                         </div>
                    ))}
                </CardContent>
            </Card>
           )}

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
