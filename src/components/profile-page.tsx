
"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Palette,
  Bell,
  Languages,
  User,
  Shield,
  Download,
  Trash2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useHistory } from '@/context/HistoryContext';
import { isToday, differenceInCalendarDays, startOfDay } from 'date-fns';

const settingsItems = [
  { icon: Palette, label: 'Appearance' },
  { icon: Bell, label: 'Notifications' },
  { icon: Languages, label: 'Language' },
];

const accountItems = [
  { icon: User, label: 'Linked Accounts' },
  { icon: Shield, label: 'Privacy & Security' },
  { icon: Download, label: 'Export Data' },
];


export function ProfilePage() {
  const { history, clearAllHistory, clearAllFavorites } = useHistory();
  
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

  const handleDeleteAllData = () => {
    if(confirm("Are you sure you want to delete all history and favorites? This action cannot be undone.")){
        clearAllHistory('conversion');
        clearAllHistory('calculator');
        clearAllFavorites();
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">
                G
              </span>
            </div>
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Guest</h2>
            <p className="text-sm text-muted-foreground">guest@example.com</p>
          </div>
          <Button>Edit Profile</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              All time
            </div>
            <div className="text-xl font-bold">{allTimeConversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Today
            </div>
            <div className="text-xl font-bold">{todayConversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Streak
            </div>
            <div className="text-xl font-bold">{streak}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {settingsItems.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.label === 'Notifications' ? (
                  <Switch defaultChecked />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="destructive" className="w-full" onClick={handleDeleteAllData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">This will permanently delete all your history and favorites.</p>
        </CardContent>
      </Card>
    </div>
  );
}
