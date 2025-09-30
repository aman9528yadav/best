
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, Shield, Hourglass, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useToast } from '@/hooks/use-toast';
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

const CountdownBox = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-accent/70 rounded-lg p-3 w-20 flex flex-col items-center">
    <span className="text-3xl font-bold text-primary">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export function MaintenancePage() {
  const router = useRouter();
  const { setDevMode, maintenanceConfig } = useMaintenance();
  const [clickCount, setClickCount] = useState(0);
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');

  const [timeLeft, setTimeLeft] = useState(maintenanceConfig.countdown);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setTimeLeft(maintenanceConfig.countdown);
  }, [maintenanceConfig.countdown]);


  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
             return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isClient]);

  const handleIconClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= 5) {
      setIsPasswordDialogOpen(true);
      setClickCount(0); // Reset after activation
    } else if (newClickCount > 2) {
      const clicksRemaining = 5 - newClickCount;
      toast({
        description: `You are ${clicksRemaining} step${clicksRemaining > 1 ? 's' : ''} away from being a developer.`,
      });
    }

    // Reset if time between clicks is too long
    setTimeout(() => {
        if(clickCount < 5) setClickCount(0);
    }, 2000)
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


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-8 left-8 text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-accent/70 p-4 rounded-full" onClick={handleIconClick}>
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">We&apos;ll Be Back Soon!</h1>
            <Badge variant="outline" className="text-primary bg-primary/10 border-primary/50">
              <Shield className="mr-2 h-4 w-4" />
              {maintenanceConfig.type} Update
            </Badge>
            <p className="text-muted-foreground">
              {maintenanceConfig.details}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <CountdownBox value={String(timeLeft.days).padStart(2, '0')} label="DAYS" />
            <CountdownBox value={String(timeLeft.hours).padStart(2, '0')} label="HOURS" />
            <CountdownBox value={String(timeLeft.minutes).padStart(2, '0')} label="MINUTES" />
            <CountdownBox value={String(timeLeft.seconds).padStart(2, '0')} label="SECONDS" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <Card className="bg-accent/50 border-none">
              <CardContent className="p-4 flex items-start gap-4">
                <Hourglass className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Minimal Downtime</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;re working as quickly as possible to restore service
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/50 border-none">
              <CardContent className="p-4 flex items-start gap-4">
                <Zap className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Better Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Coming back with improved features and performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Or, go to the{' '}
              <Link href="/" className="text-primary hover:underline">
                homepage
              </Link>
              .
            </p>
            <p>
              Need immediate assistance? Contact Aman at:{' '}
              <a
                href="mailto:amanyadavyadav9458@gmail.com"
                className="text-primary hover:underline"
              >
                amanyadavyadav9458@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Enter Developer Password</AlertDialogTitle>
            <AlertDialogDescription>
                This action requires a password to enable developer mode and access the dev panel.
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
