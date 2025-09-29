
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Rocket,
  User,
  Languages,
  Bug,
} from 'lucide-react';
import { useMaintenance } from '@/context/MaintenanceContext';


const CountdownBox = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-accent/70 rounded-lg p-3 w-20 flex flex-col items-center">
    <span className="text-3xl font-bold text-primary">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const updateItems = [
    {
        icon: Wrench,
        title: 'Bug fix and stable',
        date: '10 September, 2025',
        description: 'Here we fix some bugs and make a stable and also give a lag free experience',
        tags: ['Bug Fix', 'Beta 1.3'],
    },
    {
        icon: Rocket,
        title: 'Live sync by email',
        date: '7 September, 2025',
        description: 'Now user can sync data live like history stats etc',
        tags: ['New Feature', 'Beta 1.3'],
    },
    {
        icon: User,
        title: 'Profile Management',
        date: '1 October, 2024',
        description: 'Manage your profile, track stats, and view your premium membership progress.',
        tags: ['New Feature', 'Beta 1.2'],
    },
    {
        icon: Languages,
        title: 'Language Support: Hindi',
        date: '25 September, 2024',
        description: 'The entire app is now available in Hindi.',
        tags: ['New Feature', 'Beta 1.2'],
    }
];

export function WhatsNewPage() {
  const { maintenanceConfig } = useMaintenance();
  const [timeLeft, setTimeLeft] = useState(maintenanceConfig.countdown);

  useEffect(() => {
    setTimeLeft(maintenanceConfig.countdown);
  }, [maintenanceConfig.countdown]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        if(days === 0 && hours === 0 && minutes === 0 && seconds === 0){
             return prevTime;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);


  return (
    <div className="w-full space-y-6 pb-12">
        <Card>
            <CardContent className="p-4 text-center space-y-4">
                 <h2 className="text-lg font-semibold">Next Update In</h2>
                 <div className="flex justify-center gap-3">
                    <CountdownBox value={String(timeLeft.days).padStart(2, '0')} label="DAYS" />
                    <CountdownBox value={String(timeLeft.hours).padStart(2, '0')} label="HOURS" />
                    <CountdownBox value={String(timeLeft.minutes).padStart(2, '0')} label="MINUTES" />
                    <CountdownBox value={String(timeLeft.seconds).padStart(2, '0')} label="SECONDS" />
                </div>
                 <Badge variant="outline" className="text-primary bg-primary/10 border-primary/50">
                    <Bug className="mr-2 h-4 w-4" />
                    Bug Fix
                </Badge>
            </CardContent>
        </Card>
        
        <Card className="bg-accent/50">
            <CardContent className="p-4">
                <h3 className="font-semibold mb-2">What to expect:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>bug fix</li>
                    <li>may be some feature not working</li>
                </ul>
            </CardContent>
        </Card>

        <div className="space-y-4">
            {updateItems.map((item, index) => (
                <Card key={index}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-accent rounded-lg mt-1">
                                <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-start gap-2 mt-4">
                            {item.tags.map(tag => (
                                <Badge key={tag} variant={tag.startsWith('Beta') ? 'secondary' : 'outline'} className={tag.startsWith('New') ? 'text-blue-500 border-blue-500/50 bg-blue-500/10' : 'text-purple-500 border-purple-500/50 bg-purple-500/10'}>{tag}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

    </div>
  );
}

    