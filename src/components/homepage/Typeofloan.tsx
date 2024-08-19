"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"

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
  { browser: "Home_Loan", Applications: 187, fill: "var(--color-Home_Loan)" },
  { browser: "Personal_Loan", Applications: 200, fill: "var(--color-Personal_Loan)" },
  { browser: "Mortgage_Loan", Applications: 275, fill: "var(--color-Mortgage_Loan)" },
  { browser: "Car_Loan", Applications: 173, fill: "var(--color-Car_Loan)" },
  { browser: "Education_Loan", Applications: 90, fill: "var(--color-Education_Loan)" },
]

const chartConfig = {
  Applications: {
    label: "Applications",
  },
  Home_Loan: {
    label: "Home Loan",
    color: "hsl(var(--chart-1))",
  },
  Personal_Loan: {
    label: "Personal Loan",
    color: "hsl(var(--chart-2))",
  },
  Mortgage_Loan: {
    label: "Mortgage Loan",
    color: "hsl(var(--chart-1))",
  },
  Car_Loan: {
    label: "Car Loan",
    color: "hsl(var(--chart-2))",
  },
  Education_Loan: {
    label: "Education Loan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Typeofloan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Types of Individual loans processed</CardTitle>

      </CardHeader>
      <CardContent className="p-2">
        <ChartContainer config={chartConfig}  className="h-[34vh] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="browser"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="Applications"
              strokeWidth={2}
              radius={8}

              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    opacity={40}
                    stroke={"#000000"}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                    
                  />
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
