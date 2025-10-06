
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

const formatTime = (time: number) => {
  const milliseconds = `0${time % 1000}`.slice(-3, -1);
  const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
  const minutes = `0${Math.floor((time / (1000 * 60)) % 60)}`.slice(-2);
  return `${minutes}:${seconds}.${milliseconds}`;
};

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLapTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const handleLap = () => {
    if (isRunning) {
      const lapTime = time - lastLapTimeRef.current;
      setLaps(prevLaps => [lapTime, ...prevLaps]);
      lastLapTimeRef.current = time;
    }
  };
  
  const overallTime = time;
  const currentLapTime = time - lastLapTimeRef.current;

  return (
    <Card>
      <CardContent className="p-4 space-y-6">
        <div className="text-center font-mono space-y-2">
           <p className="text-7xl font-bold tracking-tight">{formatTime(overallTime)}</p>
           <p className="text-2xl text-muted-foreground">{laps.length > 0 && formatTime(currentLapTime)}</p>
        </div>

        <div className="flex justify-center items-center gap-4 pt-4">
          <Button variant="outline" size="lg" onClick={handleReset} disabled={!isRunning && time === 0}>
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
          <Button size="lg" onClick={handleStartPause} className="w-32">
            {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
           <Button variant="outline" size="lg" onClick={handleLap} disabled={!isRunning}>
            <Flag className="mr-2 h-5 w-5" /> Lap
          </Button>
        </div>
        
        {laps.length > 0 && (
            <ScrollArea className="h-48 w-full rounded-md border p-2">
                <div className="space-y-2">
                {laps.map((lap, index) => (
                    <div key={index} className="flex justify-between items-center bg-accent/50 p-2 rounded-md font-mono text-sm">
                        <span className="text-muted-foreground">Lap {laps.length - index}</span>
                        <span className="font-semibold">{formatTime(lap)}</span>
                    </div>
                ))}
                </div>
            </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
