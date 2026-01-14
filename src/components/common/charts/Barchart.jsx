"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export function BarChartComponent({
  className,
  xAxis,
  yAxis,
  chartConfig
}) {
  return (
    <Card className={cn("border-1 shadow-none bg-[var(--comp-1)]", className)}>
      <CardHeader>
        <CardTitle>{chartConfig.title}</CardTitle>
        <CardDescription>{chartConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          [yAxis.YAxisDataKey]: {
            label: yAxis.YAxisDataLabel,
            color: "var(--chart-1)",
          }
        }}>
          <BarChart
            margin={{ left: 6, right: 20, top: 10, bottom: 0 }}
            accessibilityLayer
            data={xAxis.data}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxis.XAxisDataKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <YAxis
              width={30}
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={yAxis.YAxisDataKey} fill="var(--accent-1)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {Boolean(chartConfig.label1) && <div className="flex gap-2 leading-none font-medium">
          {chartConfig.label1}
        </div>}
        {Boolean(chartConfig.label2) && <div className="text-muted-foreground leading-none">
          {chartConfig.label2}
        </div>}
      </CardFooter>
    </Card>
  )
}