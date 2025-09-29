
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

  const activeIndex = React.useRef(0)

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart
          margin={{
            left: 12,
            right: 12,
          }}
          onMouseEnter={(_, index) => {
            activeIndex.current = index
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
            activeIndex={activeIndex.current}
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
              } = props
              const RADIAN = Math.PI / 180
              const sin = Math.sin(-RADIAN * ((startAngle + endAngle) / 2))
              const cos = Math.cos(-RADIAN * ((startAngle + endAngle) / 2))
              const mx = cx! + (outerRadius! + 10) * cos
              const my = cy! + (outerRadius! + 10) * sin
              const ex = mx + (cos >= 0 ? 1 : -1) * 22
              const ey = my

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
                  />
                  <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius! + 6}
                    outerRadius={outerRadius! + 10}
                    fill={fill}
                  />
                  <path
                    d={`M${ex},${ey}L${mx},${my}L${mx},${my}`}
                    stroke={fill}
                    fill="none"
                  />
                  <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={cos >= 0 ? "start" : "end"}
                    fill="hsl(var(--foreground))"
                    className="text-sm"
                  >
                    Rate {((payload.value / totalValue) * 100).toFixed(0)}%
                  </text>
                </g>
              )
            }}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  const { cx, cy } = viewBox;
                  const activeEntry = chartData[activeIndex.current];
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-center"
                    >
                      <tspan
                        x={cx}
                        y={(cy || 0) - 4}
                        className="text-lg font-bold"
                      >
                        {activeEntry.value}
                      </tspan>
                      <tspan
                        x={cx}
                        y={(cy || 0) + 16}
                        className="text-xs text-muted-foreground"
                      >
                        {chartConfig[activeEntry.activity as keyof typeof chartConfig].label}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
  )
}
