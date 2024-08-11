"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { browser: "individual", visitors: 275, fill: "var(--color-individual)" },
  { browser: "business", visitors: 200, fill: "var(--color-business)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  individual: {
    label: "Individual",
    color: "hsl(var(--chart-1))",
  },
  business: {
    label: "Business",
    color: "hsl(var(--chart-2))",
  },
  
} satisfies ChartConfig

export function Approvchart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[13vh] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 15,
            }}
            barSize={10}
          >
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="visitors" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="visitors" layout="vertical" radius={5} barSize={50}/>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
