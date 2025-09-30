
"use client"

import { Bar, BarChart, Line, LineChart, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useHistory } from '@/context/HistoryContext';
import { useMemo } from 'react';
import { eachDayOfInterval, format, subDays, isSameDay, eachWeekOfInterval, eachMonthOfInterval, getWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const chartConfig = {
  conversions: {
    label: 'Conversions',
    color: 'hsl(var(--chart-1))',
  },
  calculations: {
    label: 'Calculations',
    color: 'hsl(var(--chart-2))',
  },
};

export function UsageTrendChart({ type = 'bar', period = 'weekly' }: { type: 'bar' | 'line' | 'area', period: 'weekly' | 'monthly' | 'yearly' }) {
  const { history } = useHistory();

  const data = useMemo(() => {
    const conversions = history.filter(item => item.type === 'conversion');
    const calculations = history.filter(item => item.type === 'calculator');
    const today = new Date();

    if (period === 'weekly') {
      const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
      return days.map(day => ({
        name: format(day, 'EEE'),
        conversions: conversions.filter(item => isSameDay(new Date(item.timestamp), day)).length,
        calculations: calculations.filter(item => isSameDay(new Date(item.timestamp), day)).length,
      }));
    }
    
    if (period === 'monthly') {
        const weeks = eachWeekOfInterval({ start: subDays(today, 28), end: today }, { weekStartsOn: 1 });
        return weeks.map(weekStart => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            return {
                name: `Week ${getWeek(weekStart)}`,
                conversions: conversions.filter(item => isWithinInterval(new Date(item.timestamp), { start: weekStart, end: weekEnd })).length,
                calculations: calculations.filter(item => isWithinInterval(new Date(item.timestamp), { start: weekStart, end: weekEnd })).length,
            };
        });
    }

    if (period === 'yearly') {
        const months = eachMonthOfInterval({ start: subDays(today, 365), end: today });
        return months.map(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            return {
                name: format(monthStart, 'MMM'),
                conversions: conversions.filter(item => isWithinInterval(new Date(item.timestamp), { start: monthStart, end: monthEnd })).length,
                calculations: calculations.filter(item => isWithinInterval(new Date(item.timestamp), { start: monthStart, end: monthEnd })).length,
            };
        });
    }

    return [];

  }, [history, period]);

  const ChartComponent = useMemo(() => {
    switch(type) {
      case 'line':
        return LineChart;
      case 'area':
        return AreaChart;
      case 'bar':
      default:
        return BarChart;
    }
  }, [type]);

  const ChartSeries = useMemo(() => {
     const commonProps = {
        strokeWidth: 2,
        dot: false,
      };

    switch(type) {
      case 'line':
        return (
          <>
            <Line type="monotone" dataKey="conversions" stroke={chartConfig.conversions.color} {...commonProps} />
            <Line type="monotone" dataKey="calculations" stroke={chartConfig.calculations.color} {...commonProps} />
          </>
        );
      case 'area':
         return (
          <>
            <Area type="monotone" dataKey="conversions" stackId="1" stroke={chartConfig.conversions.color} fill={chartConfig.conversions.color} fillOpacity={0.4} {...commonProps} />
            <Area type="monotone" dataKey="calculations" stackId="1" stroke={chartConfig.calculations.color} fill={chartConfig.calculations.color} fillOpacity={0.4} {...commonProps} />
          </>
        );
      case 'bar':
      default:
        return (
          <>
            <Bar dataKey="conversions" fill={chartConfig.conversions.color} radius={4} />
            <Bar dataKey="calculations" fill={chartConfig.calculations.color} radius={4} />
          </>
        );
    }
  }, [type]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} className="text-xs" />
        <YAxis axisLine={false} tickLine={false} dx={-10} className="text-xs" />
        <Tooltip
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
        {ChartSeries}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
