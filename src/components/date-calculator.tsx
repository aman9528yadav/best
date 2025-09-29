
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CalendarIcon, ArrowDown, Copy, Share2 } from 'lucide-react';
import {
  format,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  add,
  sub,
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ResultBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl font-bold text-primary">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

function DateDifferenceCalculator() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [result, setResult] = useState({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    totalDays: 0,
  });

  const handleCalculateDifference = () => {
    if (startDate && endDate) {
        if(endDate < startDate) {
            toast({
                title: "Invalid Dates",
                description: "End date cannot be earlier than start date.",
                variant: "destructive"
            });
            return;
        }

      const totalDays = differenceInDays(endDate, startDate);
      const years = differenceInYears(endDate, startDate);
      const months = differenceInMonths(endDate, startDate) % 12;
      
      let tempDate = add(startDate, { years: years, months: months });
      const days = differenceInDays(endDate, tempDate);
      
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;

      setResult({
        years,
        months,
        weeks,
        days: remainingDays,
        totalDays,
      });
    }
  };
  
  const handleCopy = () => {
    const resultString = `${result.years} Years, ${result.months} Months, ${result.weeks} Weeks, ${result.days} Days (Total: ${result.totalDays} days)`;
    navigator.clipboard.writeText(resultString);
    toast({ title: 'Copied to clipboard!' });
  };


  return (
     <Card>
        <CardContent className="p-4 space-y-6">
             <h2 className="text-lg font-semibold text-center">Time Between Dates</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal h-12 mt-1"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex justify-center">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal h-12 mt-1"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleCalculateDifference}>Calculate</Button>

            <div className="bg-accent/50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                     <h3 className="font-semibold text-accent-foreground">Result</h3>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                            <Copy className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                        </Button>
                     </div>
                </div>
               
                <div className="flex justify-around text-center">
                    <ResultBox value={result.years} label="Years" />
                    <ResultBox value={result.months} label="Months" />
                    <ResultBox value={result.weeks} label="Weeks" />
                    <ResultBox value={result.days} label="Days" />
                </div>
                <div className="text-center font-medium text-muted-foreground pt-2">
                    Total Days: {result.totalDays}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}


export function DateCalculator() {
  return (
    <div className="w-full">
      <Tabs defaultValue="difference" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-accent/50 mb-4">
          <TabsTrigger value="difference">Difference</TabsTrigger>
          <TabsTrigger value="add-sub">Add/Sub</TabsTrigger>
          <TabsTrigger value="age">Age</TabsTrigger>
          <TabsTrigger value="work-days">Work Days</TabsTrigger>
          <TabsTrigger value="countdown">Countdown</TabsTrigger>
        </TabsList>
        <TabsContent value="difference">
            <DateDifferenceCalculator />
        </TabsContent>
         <TabsContent value="add-sub">
            <Card><CardContent className="p-4">Add/Subtract feature coming soon!</CardContent></Card>
        </TabsContent>
        <TabsContent value="age">
            <Card><CardContent className="p-4">Age Calculator feature coming soon!</CardContent></Card>
        </TabsContent>
         <TabsContent value="work-days">
            <Card><CardContent className="p-4">Work Days Calculator feature coming soon!</CardContent></Card>
        </TabsContent>
         <TabsContent value="countdown">
            <Card><CardContent className="p-4">Countdown feature coming soon!</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
