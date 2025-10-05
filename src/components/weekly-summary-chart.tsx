
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useProfile } from '@/context/ProfileContext';
import { useMemo } from 'react';
import { eachDayOfInterval, format, subDays, isSameDay } from 'date-fns';

export function WeeklySummaryChart() {
  const { profile } = useProfile();
  const { history } = profile;

  const weeklySummaryData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    const conversionHistory = history.filter(item => item.type === 'conversion');

    return last7Days.map(day => {
      const dayStr = format(day, 'EEE');
      const value = conversionHistory.filter(item => isSameDay(new Date(item.timestamp), day)).length;
      return { day: dayStr, value };
    });
  }, [history]);

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={weeklySummaryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} dy={10}  className="text-xs" />
        <YAxis hide={true} domain={[0, 'dataMax + 5']} />
        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
