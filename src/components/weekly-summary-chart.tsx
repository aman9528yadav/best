"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const weeklySummaryData = [
  { day: 'Tue', value: 20 },
  { day: 'Wed', value: 40 },
  { day: 'Thu', value: 30 },
  { day: 'Fri', value: 50 },
  { day: 'Sat', value: 35 },
  { day: 'Sun', value: 60 },
  { day: 'Mon', value: 80 },
];

export function WeeklySummaryChart() {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={weeklySummaryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} dy={10}  className="text-xs" />
        <YAxis hide={true} />
        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
