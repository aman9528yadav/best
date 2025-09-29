
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
        }
    }, [totalSeconds, isActive]);

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

`