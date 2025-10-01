
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Info, PartyPopper } from 'lucide-react';
import { useMaintenance } from '@/context/MaintenanceContext';
import Link from 'next/link';

const CountdownBox = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-accent/70 rounded-md p-1.5 w-12 flex flex-col items-center">
    <span className="text-xl font-bold text-primary">{value}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

export function DashboardBanner() {
  const { maintenanceConfig, setMaintenanceConfig } = useMaintenance();
  
  // Safeguard against dashboardBanner being undefined during initial load
  const { show, countdown, category } = maintenanceConfig.dashboardBanner || {};
  
  const [timeLeft, setTimeLeft] = useState(countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(show || false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (maintenanceConfig.dashboardBanner) {
        setIsVisible(maintenanceConfig.dashboardBanner.show);
        setTimeLeft(maintenanceConfig.dashboardBanner.countdown);
    }
  }, [maintenanceConfig.dashboardBanner]);

  useEffect(() => {
    if (!isVisible || !isClient || (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0)) {
        return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
            seconds--;
        } else if (minutes > 0) {
            seconds = 59;
            minutes--;
        } else if (hours > 0) {
            seconds = 59;
            minutes = 59;
            hours--;
        } else if (days > 0) {
            seconds = 59;
            minutes = 59;
            hours = 23;
            days--;
        }
        
        if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isVisible, isClient]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionally update the context/localStorage to keep it dismissed
    setMaintenanceConfig(prev => ({
        ...prev,
        dashboardBanner: {
            ...prev.dashboardBanner,
            show: false,
        }
    }));
  };

  if (!isVisible || !maintenanceConfig.dashboardBanner) {
    return null;
  }
  
  const isTimerFinished = timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0;


  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20">
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full mt-1">
                <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div className='flex-1 space-y-2'>
                <div>
                    <h3 className="font-bold">Next Update Incoming!</h3>
                     <p className="text-xs text-muted-foreground">
                        {isTimerFinished ? "The latest update is live!" : "We're launching new features soon. Check out what's new!"}
                    </p>
                </div>
                
                {isTimerFinished ? (
                    <div className="flex items-center justify-center gap-2 p-4 bg-accent/70 rounded-md text-primary font-semibold">
                       <PartyPopper className="h-5 w-5" />
                       <span>The new update is live!</span>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <CountdownBox value={String(timeLeft.days).padStart(2, '0')} label="DAYS" />
                        <CountdownBox value={String(timeLeft.hours).padStart(2, '0')} label="HOURS" />
                        <CountdownBox value={String(timeLeft.minutes).padStart(2, '0')} label="MINS" />
                        <CountdownBox value={String(timeLeft.seconds).padStart(2, '0')} label="SECS" />
                    </div>
                )}
                
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-primary bg-primary/10 border-primary/50 text-xs shrink-0">
                        {category}
                    </Badge>
                     <Button asChild size="sm" variant="link" className="text-primary pr-0">
                         <Link href="/whats-new">
                            <Info className="mr-2 h-4 w-4" />
                            Learn More
                         </Link>
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
