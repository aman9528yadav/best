
"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { useProfile } from "@/context/ProfileContext"
import { isSameMonth, parseISO } from "date-fns"

export function BudgetBreakdownChart() {
    const { profile } = useProfile();
    const { transactions, categories } = profile.budget;
    const now = new Date();

    const chartData = React.useMemo(() => {
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));
        const expensesThisMonth = transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now));

        const spendingByCategory = expensesThisMonth.reduce((acc, t) => {
            const categoryName = categoryMap.get(t.categoryId) || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(spendingByCategory).map(([category, amount], index) => ({
            category,
            amount,
            fill: `hsl(var(--chart-${index + 1}))`
        }));
    }, [transactions, categories, now]);

  const chartConfig = React.useMemo(() => {
    return chartData.reduce((acc, data) => {
      acc[data.category] = {
        label: data.category,
        color: data.fill,
      }
      return acc
    }, {} as any)
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No expenses this month.</p>
        <p className="text-xs">Add some expenses to see your breakdown.</p>
      </div>
    )
  }

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius="60%"
            strokeWidth={5}
          >
          </Pie>
           <ChartLegend
            content={<ChartLegendContent nameKey="category" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
  )
}

