
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Info } from 'lucide-react';
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
  const { show, countdown, category } = maintenanceConfig.dashboardBanner;
  
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);
  
  useEffect(() => {
    setTimeLeft(countdown);
  }, [countdown]);

  useEffect(() => {
    if (!isVisible) return;
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
        
        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
            return prevTime;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isVisible]);

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

  if (!isVisible) {
    return null;
  }

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
                        We're launching new features soon. Check out what's new!
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <CountdownBox value={String(timeLeft.days).padStart(2, '0')} label="DAYS" />
                    <CountdownBox value={String(timeLeft.hours).padStart(2, '0')} label="HOURS" />
                    <CountdownBox value={String(timeLeft.minutes).padStart(2, '0')} label="MINS" />
                    <CountdownBox value={String(timeLeft.seconds).padStart(2, '0')} label="SECS" />
                </div>
                
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
