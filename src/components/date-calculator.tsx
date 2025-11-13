
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarIcon,
  ArrowDown,
  ArrowRight,
  Copy,
  Share2,
  Minus,
  Plus,
  ArrowUpDown,
} from 'lucide-react';
import {
  format,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  add,
  sub,
  intervalToDuration,
  isWeekend,
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Label } from './ui/label';
import { useProfile } from '@/context/ProfileContext';

const ResultBox = ({ value, label }: { value: string | number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl font-bold text-primary">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

function DateDifferenceCalculator() {
  const { toast } = useToast();
  const { addDateCalculationToHistory } = useProfile();
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
      if (endDate < startDate) {
        toast({
          title: 'Invalid Dates',
          description: 'End date cannot be earlier than start date.',
          variant: 'destructive',
        });
        return;
      }

      const duration = intervalToDuration({ start: startDate, end: endDate });
      const totalDays = differenceInDays(endDate, startDate);
      const weeks = Math.floor((duration.days || 0) / 7);
      const remainingDays = (duration.days || 0) % 7;

      const newResult = {
        years: duration.years || 0,
        months: duration.months || 0,
        weeks: weeks,
        days: remainingDays,
        totalDays,
      };

      setResult(newResult);
      addDateCalculationToHistory({
        calculationType: 'Difference',
        details: {
          startDate: format(startDate, 'PPP'),
          endDate: format(endDate, 'PPP'),
          result: newResult
        }
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
        <h2 className="text-lg font-semibold text-center">
          Time Between Dates
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className="w-full justify-start text-left font-normal h-12 mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className="w-full justify-start text-left font-normal h-12 mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleCalculateDifference}
        >
          Calculate
        </Button>

        <div className="bg-accent/50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-accent-foreground">Result</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
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

function AddSubtractCalculator() {
  const { toast } = useToast();
  const { addDateCalculationToHistory } = useProfile();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [resultDate, setResultDate] = useState<Date>(new Date());
  const [operation, setOperation] = useState<'add' | 'sub'>('add');
  const [duration, setDuration] = useState({ years: 0, months: 0, weeks: 0, days: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDuration(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  useEffect(() => {
    let newDate = startDate;
    if (operation === 'add') {
      newDate = add(startDate, duration);
    } else {
      newDate = sub(startDate, duration);
    }
    setResultDate(newDate);
    addDateCalculationToHistory({
      calculationType: 'Add/Subtract',
      details: {
        startDate: format(startDate, 'PPP'),
        operation,
        duration,
        resultDate: format(newDate, 'PPP')
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, duration, operation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(format(resultDate, 'PPP'));
    toast({ title: 'Copied to clipboard!' });
  };

  return (
     <Card>
      <CardContent className="p-4 space-y-6">
        <h2 className="text-lg font-semibold text-center">Add or Subtract Dates</h2>
        <div className="space-y-4">
           <div>
            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className="w-full justify-start text-left font-normal h-12 mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={(d) => setStartDate(d || new Date())} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear() + 10} />
              </PopoverContent>
            </Popover>
          </div>

          <div className='flex items-center justify-center gap-4'>
             <Button variant={operation === 'add' ? 'default' : 'outline'} onClick={() => setOperation('add')}><Plus className='h-4 w-4 mr-2'/>Add</Button>
             <Button variant={operation === 'sub' ? 'default' : 'outline'} onClick={() => setOperation('sub')}><Minus className='h-4 w-4 mr-2'/>Subtract</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div><Label>Years</Label><Input type="number" name="years" value={duration.years || ''} onChange={handleInputChange} placeholder="0"/></div>
             <div><Label>Months</Label><Input type="number" name="months" value={duration.months || ''} onChange={handleInputChange} placeholder="0"/></div>
             <div><Label>Weeks</Label><Input type="number" name="weeks" value={duration.weeks || ''} onChange={handleInputChange} placeholder="0"/></div>
             <div><Label>Days</Label><Input type="number" name="days" value={duration.days || ''} onChange={handleInputChange} placeholder="0"/></div>
          </div>
        </div>

        <div className="bg-accent/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-accent-foreground">Result Date</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-2xl font-bold text-primary">{format(resultDate, 'PPP')}</p>
          <p className="text-sm text-muted-foreground">{format(resultDate, 'eeee')}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AgeCalculator() {
    const { addDateCalculationToHistory } = useProfile();
    const [birthDate, setBirthDate] = useState<Date | undefined>(new Date(2000, 0, 1));
    const [age, setAge] = useState({ years: 0, months: 0, days: 0 });
    const [summary, setSummary] = useState({ totalMonths: 0, totalWeeks: 0, totalDays: 0 });

    useEffect(() => {
        if(birthDate) {
            const today = new Date();
            const duration = intervalToDuration({ start: birthDate, end: today });
            const ageResult = { years: duration.years || 0, months: duration.months || 0, days: duration.days || 0 };
            setAge(ageResult);

            const totalDays = differenceInDays(today, birthDate);
            const totalMonths = differenceInMonths(today, birthDate);
            const totalWeeks = Math.floor(totalDays / 7);
            const summaryResult = { totalMonths, totalWeeks, totalDays };
            setSummary(summaryResult);
            addDateCalculationToHistory({
              calculationType: 'Age',
              details: {
                birthDate: format(birthDate, 'PPP'),
                age: ageResult,
                summary: summaryResult
              }
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [birthDate]);

    return (
         <Card>
            <CardContent className="p-4 space-y-6">
                 <h2 className="text-lg font-semibold text-center">Age Calculator</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Your Date of Birth</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal h-12 mt-1">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="bg-accent/50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-accent-foreground">Your Age Is</h3>
                    <div className="flex justify-around text-center">
                        <ResultBox value={age.years} label="Years" />
                        <ResultBox value={age.months} label="Months" />
                        <ResultBox value={age.days} label="Days" />
                    </div>
                </div>
                
                 <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-accent-foreground">Age Summary</h3>
                    <div className="flex justify-between text-sm py-1 border-b"><span className="text-muted-foreground">Total Months</span><span>{summary.totalMonths}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b"><span className="text-muted-foreground">Total Weeks</span><span>{summary.totalWeeks}</span></div>
                    <div className="flex justify-between text-sm py-1"><span className="text-muted-foreground">Total Days</span><span>{summary.totalDays}</span></div>
                </div>

            </CardContent>
        </Card>
    )
}

function WorkDaysCalculator() {
    const { toast } = useToast();
    const { addDateCalculationToHistory } = useProfile();
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(add(new Date(), {days: 7}));
    const [workDays, setWorkDays] = useState(0);

    const calculateWorkDays = () => {
        if (startDate && endDate) {
            if (endDate < startDate) {
                toast({ title: "Invalid Dates", description: "End date cannot be before start date.", variant: "destructive" });
                return;
            }
            // date-fns v3 does not have differenceInBusinessDays, so we calculate it manually
            let count = 0;
            let currentDate = startDate;
            while(currentDate <= endDate) {
                if(!isWeekend(currentDate)) {
                    count++;
                }
                currentDate = add(currentDate, { days: 1});
            }

            setWorkDays(count);
            addDateCalculationToHistory({
              calculationType: 'Workdays',
              details: {
                startDate: format(startDate, 'PPP'),
                endDate: format(endDate, 'PPP'),
                workDays: count
              }
            });
        }
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-6">
                <h2 className="text-lg font-semibold text-center">Work Days Calculator</h2>
                 <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-left font-normal h-12 mt-1"><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear() + 10} /></PopoverContent></Popover>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-left font-normal h-12 mt-1"><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear() + 10} /></PopoverContent></Popover>
                    </div>
                </div>
                 <Button size="lg" className="w-full" onClick={calculateWorkDays}>Calculate Work Days</Button>
                <div className="bg-accent/50 p-4 rounded-lg text-center">
                    <h3 className="font-semibold text-accent-foreground mb-2">Total Working Days</h3>
                    <p className="text-4xl font-bold text-primary">{workDays}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function CountdownCalculator() {
    const { addDateCalculationToHistory } = useProfile();
    const [targetDate, setTargetDate] = useState<Date>(add(new Date(), {days: 30}));
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            if(targetDate > now) {
                const duration = intervalToDuration({ start: now, end: targetDate });
                setTimeLeft({
                    days: duration.days || 0,
                    hours: duration.hours || 0,
                    minutes: duration.minutes || 0,
                    seconds: duration.seconds || 0
                });
            } else {
                 setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <Card>
            <CardContent className="p-4 space-y-6">
                <h2 className="text-lg font-semibold text-center">Countdown to a Date</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Date & Time</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal h-12 mt-1">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={targetDate} onSelect={(d) => setTargetDate(d || new Date())} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear() + 10} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="bg-accent/50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-accent-foreground text-center">Time Remaining</h3>
                    <div className="flex justify-around text-center">
                        <ResultBox value={String(timeLeft.days).padStart(2, '0')} label="Days" />
                        <ResultBox value={String(timeLeft.hours).padStart(2, '0')} label="Hours" />
                        <ResultBox value={String(timeLeft.minutes).padStart(2, '0')} label="Minutes" />
                        <ResultBox value={String(timeLeft.seconds).padStart(2, '0')} label="Seconds" />
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
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <TabsList className="inline-flex h-auto p-1 bg-accent/50 mb-4">
                <TabsTrigger value="difference">Difference</TabsTrigger>
                <TabsTrigger value="add-sub">Add/Sub</TabsTrigger>
                <TabsTrigger value="age">Age</TabsTrigger>
                <TabsTrigger value="work-days">Work Days</TabsTrigger>
                <TabsTrigger value="countdown">Countdown</TabsTrigger>
            </TabsList>
             <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="difference">
          <DateDifferenceCalculator />
        </TabsContent>
        <TabsContent value="add-sub">
          <AddSubtractCalculator />
        </TabsContent>
        <TabsContent value="age">
          <AgeCalculator />
        </TabsContent>
        <TabsContent value="work-days">
          <WorkDaysCalculator />
        </TabsContent>
        <TabsContent value="countdown">
          <CountdownCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
