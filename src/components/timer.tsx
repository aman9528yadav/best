
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TimeInput = ({ label, value, onChange, disabled }: { label: string; value: number; onChange: (value: number) => void; disabled: boolean; }) => (
    <div className="flex flex-col items-center space-y-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <Input
            type="number"
            min="0"
            max={label === 'Hours' ? 99 : 59}
            value={value.toString().padStart(2, '0')}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-20 h-16 text-4xl text-center font-mono bg-accent/50 border-none"
            disabled={disabled}
        />
    </div>
);


export function Timer() {
    const { toast } = useToast();
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);

    const [totalSeconds, setTotalSeconds] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setTotalSeconds((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current!);
        }

        return () => clearInterval(timerRef.current!);
    }, [isActive, isPaused]);

    useEffect(() => {
        if (totalSeconds <= 0 && isActive) {
            handleReset();
            toast({
                title: 'Timer Finished!',
                description: 'Your countdown has ended.',
            });
            // Optional: play a sound
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));
        }
    }, [totalSeconds, isActive, toast]);

    const handleStart = () => {
        const time = hours * 3600 + minutes * 60 + seconds;
        if (time > 0) {
            setTotalSeconds(time);
            setInitialTime(time);
            setIsActive(true);
            setIsPaused(false);
        }
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleReset = () => {
        setIsActive(false);
        setIsPaused(true);
        setTotalSeconds(0);
        setHours(0);
        setMinutes(5);
        setSeconds(0);
    };
    
    const displayHours = Math.floor(totalSeconds / 3600);
    const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
    const displaySeconds = totalSeconds % 60;
    
    const progress = initialTime > 0 ? (totalSeconds / initialTime) * 100 : 0;
    const circumference = 2 * Math.PI * 90; // 90 is the radius
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card>
            <CardContent className="p-4 space-y-6">
                {!isActive ? (
                    <div className="flex justify-center items-center gap-4">
                        <TimeInput label="Hours" value={hours} onChange={setHours} disabled={false} />
                        <span className="text-4xl font-bold">:</span>
                        <TimeInput label="Minutes" value={minutes} onChange={setMinutes} disabled={false} />
                        <span className="text-4xl font-bold">:</span>
                        <TimeInput label="Seconds" value={seconds} onChange={setSeconds} disabled={false} />
                    </div>
                ) : (
                    <div className="relative h-64 w-64 mx-auto flex items-center justify-center">
                        <svg className="absolute top-0 left-0 h-full w-full" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" stroke="hsl(var(--accent))" strokeWidth="12" fill="transparent" />
                            <circle
                                cx="100"
                                cy="100"
                                r="90"
                                stroke="hsl(var(--primary))"
                                strokeWidth="12"
                                fill="transparent"
                                strokeLinecap="round"
                                transform="rotate(-90 100 100)"
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset,
                                    transition: 'stroke-dashoffset 0.5s linear',
                                }}
                            />
                        </svg>
                        <div className="text-center font-mono">
                            <div className="text-5xl font-bold">
                                {String(displayHours).padStart(2, '0')}:{String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-center items-center gap-4 pt-4">
                    {!isActive ? (
                        <Button size="lg" className="w-full" onClick={handleStart}>
                            <Play className="mr-2 h-5 w-5" /> Start
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="lg" onClick={handleReset}>
                                <RotateCcw className="mr-2 h-5 w-5" /> Reset
                            </Button>
                            <Button size="lg" onClick={handlePauseResume}>
                                {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                                {isPaused ? 'Resume' : 'Pause'}
                            </Button>
                        </>
                    )}
                </div>
                 <Button variant="ghost" className="w-full text-muted-foreground gap-2">
                    <Bell className="h-4 w-4" />
                    Set Alarm Sound
                </Button>
            </CardContent>
        </Card>
    );
}
