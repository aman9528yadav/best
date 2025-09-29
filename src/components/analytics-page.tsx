
"use client";

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useHistory } from '@/context/HistoryContext';
import { isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { UsageTrendChart } from './usage-trend-chart';
import { ActivityBreakdownChart } from './activity-breakdown-chart';

const StatCard = ({
  title,
  value,
  change,
  description,
}: {
  title: string;
  value: string | number;
  change?: number;
  description: string;
}) => {
    const isPositive = change !== undefined && change >= 0;
    return (
        <Card>
            <CardHeader className="p-3 pb-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className="text-3xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                    {change !== undefined && (
                        <div className={ `flex items-center mr-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                           {isPositive ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
                           {Math.abs(change)}%
                        </div>
                    )}
                    <span>{description}</span>
                </div>
            </CardContent>
        </Card>
    );
};


const DayOverDayComparison = ({ label, value }: { label: string, value: number }) => {
    const isPositive = value >= 0;
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{value}
            </span>
        </div>
    );
};


export function AnalyticsPage() {
    const { history, favorites } = useHistory();
    const [showMoreStats, setShowMoreStats] = useState(false);
    const [usageTrendType, setUsageTrendType] = useState('bar');
    const [usageTrendPeriod, setUsageTrendPeriod] = useState('weekly');

    const analyticsData = useMemo(() => {
        const today = new Date();
        const conversions = history.filter(h => h.type === 'conversion');
        const calculatorOps = history.filter(h => h.type === 'calculator');
        
        const conversionsToday = conversions.filter(c => isToday(new Date(c.timestamp))).length;
        const conversionsYesterday = conversions.filter(c => isYesterday(new Date(c.timestamp))).length;

        const calculatorOpsToday = calculatorOps.filter(c => isToday(new Date(c.timestamp))).length;
        const calculatorOpsYesterday = calculatorOps.filter(c => isYesterday(new Date(c.timestamp))).length;
        
        const calcPercentageChange = (todayCount: number, yesterdayCount: number) => {
            if (yesterdayCount === 0) return todayCount > 0 ? 100 : 0;
            return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
        };

        return {
            totalConversions: {
                value: conversions.length,
                change: calcPercentageChange(conversionsToday, conversionsYesterday)
            },
            calculatorOps: {
                value: calculatorOps.length,
                change: calcPercentageChange(calculatorOpsToday, calculatorOpsYesterday)
            },
            dateCalculations: { value: 19, change: -100 }, // Dummy data
            currentStreak: { value: '0', description: 'Best Streak: 3 days' }, // Dummy data
            savedNotes: { value: 3, change: 0 }, // Dummy data
            recycleBin: { value: 5, description: 'Items in bin' }, // Dummy data
            favoriteConversions: { value: favorites.length, description: 'Your top conversions' },
        };
    }, [history, favorites]);

    const lastActivities = history.slice(0, 2).map(item => {
        let title = '';
        if (item.type === 'conversion') title = 'Unit Conversion';
        if (item.type === 'calculator') title = 'Calculator';
        
        return {
            id: item.id,
            title,
            time: formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }),
        }
    });

    const allStats = [
        { id: 'totalConversions', title: 'Total Conversions', value: analyticsData.totalConversions.value, change: analyticsData.totalConversions.change, description: 'vs prev day' },
        { id: 'calculatorOps', title: 'Calculator Ops', value: analyticsData.calculatorOps.value, change: analyticsData.calculatorOps.change, description: 'vs prev day' },
        { id: 'dateCalculations', title: 'Date Calculations', value: analyticsData.dateCalculations.value, change: analyticsData.dateCalculations.change, description: 'vs prev day' },
        { id: 'currentStreak', title: 'Current Streak', value: analyticsData.currentStreak.value, description: analyticsData.currentStreak.description },
        { id: 'savedNotes', title: 'Saved Notes', value: analyticsData.savedNotes.value, change: analyticsData.savedNotes.change, description: 'vs prev day' },
        { id: 'recycleBin', title: 'Recycle Bin', value: analyticsData.recycleBin.value, description: analyticsData.recycleBin.description },
        { id: 'favoriteConversions', title: 'Favorite Conversions', value: analyticsData.favoriteConversions.value, description: analyticsData.favoriteConversions.description },
    ];

    const visibleStats = showMoreStats ? allStats : allStats.slice(0, 4);

    return (
        <div className="w-full space-y-6 pb-12">
            <div className="grid grid-cols-2 gap-4">
                {visibleStats.map(stat => (
                     // @ts-ignore
                    <StatCard key={stat.id} {...stat} />
                ))}
            </div>
            <Button variant="ghost" className="w-full text-primary" onClick={() => setShowMoreStats(!showMoreStats)}>
                {showMoreStats ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                {showMoreStats ? 'Show Less' : 'Show More'}
            </Button>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Usage Trend</CardTitle>
                        <Select value={usageTrendPeriod} onValueChange={setUsageTrendPeriod}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={usageTrendType} onValueChange={setUsageTrendType} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-accent/50 h-auto p-1">
                            <TabsTrigger value="bar">Bar</TabsTrigger>
                            <TabsTrigger value="line">Line</TabsTrigger>
                            <TabsTrigger value="area">Area</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="h-[200px] mt-4">
                        <UsageTrendChart type={usageTrendType as any} period={usageTrendPeriod} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-56">
                    <ActivityBreakdownChart />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Day-over-Day Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <DayOverDayComparison label="Conversions" value={-2} />
                    <DayOverDayComparison label="Calculator" value={0} />
                    <DayOverDayComparison label="Date Calcs" value={-3} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Last Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {lastActivities.map(activity => (
                         <div key={activity.id} className="p-3 bg-accent/50 rounded-lg">
                            <p className="font-medium text-sm text-accent-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}
