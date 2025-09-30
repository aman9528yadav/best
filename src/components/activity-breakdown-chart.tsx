
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

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
} from "@/components/ui/chart"
import { useHistory } from "@/context/HistoryContext"

const chartConfig = {
  conversions: {
    label: "Conversions",
    color: "hsl(var(--chart-1))",
  },
  calculator: {
    label: "Calculator",
    color: "hsl(var(--chart-2))",
  },
  date: {
    label: "Date Calcs",
    color: "hsl(var(--chart-3))",
  },
  notes: {
    label: "Notes",
    color: "hsl(var(--chart-4))",
  },
}

export function ActivityBreakdownChart() {
    const { history } = useHistory();
  const chartData = React.useMemo(() => {
    const conversions = history.filter((h) => h.type === "conversion").length
    const calculator = history.filter((h) => h.type === "calculator").length
    // Assuming you'll add date and notes history later
    const date = 19; // Dummy data
    const notes = 3; // Dummy data
    return [
      { activity: "conversions", value: conversions, fill: "var(--color-conversions)" },
      { activity: "calculator", value: calculator, fill: "var(--color-calculator)" },
      { activity: "date", value: date, fill: "var(--color-date)" },
      { activity: "notes", value: notes, fill: "var(--color-notes)" },
    ]
  }, [history]);

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart
          onMouseEnter={(_, index) => {
            setActiveIndex(index)
          }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="activity"
            innerRadius="60%"
            strokeWidth={5}
            activeIndex={activeIndex}
            activeShape={(props: PieSectorDataItem) => {
              const {
                cx,
                cy,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
                value
              } = props
              
              return (
                <g>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    className="outline-none"
                  />
                   <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius! + 6}
                    outerRadius={outerRadius! + 10}
                    fill={fill}
                    className="outline-none"
                  />
                   <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-center outline-none"
                  >
                    <tspan
                      x={cx}
                      y={(cy || 0) - 10}
                      className="text-2xl font-bold"
                    >
                      {value}
                    </tspan>
                    <tspan
                      x={cx}
                      y={(cy || 0) + 12}
                      className="text-xs text-muted-foreground"
                    >
                     {chartConfig[payload.activity as keyof typeof chartConfig].label}
                    </tspan>
                  </text>
                </g>
              )
            }}
          >
          </Pie>
        </PieChart>
      </ChartContainer>
  )
}
