"use client"
import Navbar from "@/components/Navbar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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
import { Button } from "@/components/ui/button";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 700, mobile: 140 },
]

const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

export default function Page() {
  

    return (
      <>
          <div>
                <Navbar/>
                <div className="mx-20 my-5 flex flex-col">
                    <div className="my-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/memo">Memo</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="\memo\individual">Loan Application</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="\memo\individual\generatedMemo">Generated Memo</BreadcrumbLink>
                        </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    </div>
                <div className="mx-20 my-5 flex flex-col justify-between items-center">
                    <p className="text-4xl font-semibold">Innovatech Solutions Ltd.</p>
                    <p>Individual</p>
                </div>
                <div className="grid grid-cols-8 grid-rows-7 h-[75vh] gap-2">
                    <Card className="col-span-7 row-span-2">
                        <CardContent className="p-4">
                            Innovatech Solutions Ltd. is a leading software development firm specializing in bespoke enterprise software solutions. Founded in 2010, the company has steadily grown to become a notable player in the tech industry, servicing a diverse clientele across multiple sectors.
                        </CardContent>
                        <CardFooter className="flex justify-between p-4">
                            <p>Loan Amount - $500000</p>
                            <p>Purpose - Expansion</p>
                        </CardFooter>
                    </Card>
                    <Card className="col-span-1 row-span-2">
                        <CardContent className="p-4 text-2xl font-semibold text-center">
                            Profile Score
                        </CardContent>
                        <CardContent className="text-5xl font-semibold text-center">
                            7.82
                        </CardContent>
                    </Card>
                    <Card id="historicalanalysis" className="col-span-3 row-span-5">
                        <CardHeader className="p-4 pb-1">
                            <CardTitle>Historical Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 flex flex-col justify-between h-[85%]">
                        <Card>
                            <CardHeader className=" text-base p-2">
                                <CardTitle className="text-base">Revenue</CardTitle>
                            </CardHeader>
                            <CardContent className="w-110 p-2">
                                <ChartContainer config={chartConfig} className=" h-[13vh] w-full ">
                                <LineChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                    left: 12,
                                    right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Line
                                    dataKey="desktop"
                                    type="natural"
                                    stroke="var(--color-desktop)"
                                    strokeWidth={2}
                                    dot={{
                                        fill: "var(--color-desktop)",
                                    }}
                                    activeDot={{
                                        r: 6,
                                    }}
                                    />
                                </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                                <CardHeader className=" text-base p-2">
                                    <CardTitle className=" text-base">Line Chart - Dots</CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <ChartContainer config={chartConfig} className=" h-[13vh] w-full ">
                                    <LineChart
                                        width={undefined}
                                        height={undefined}
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                        left: 12,
                                        right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Line
                                        dataKey="desktop"
                                        type="natural"
                                        stroke="var(--color-desktop)"
                                        strokeWidth={2}
                                        dot={{
                                            fill: "var(--color-desktop)",
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                        />
                                    </LineChart>
                                    </ChartContainer>
                                </CardContent>
                        </Card>
                        
                        </CardContent>
                    </Card>
                    <Card id="externalriskfactors"  className="col-span-5 row-span-3">
                        <CardHeader>
                            <CardTitle>External risk Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                    </Card>
                    <Card id="sectoranalysis" className="col-span-4 row-span-2">
                        <CardHeader className="pb-4">
                            <CardTitle>Sector Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>The software development sector is projected to grow at an annual rate of 10% over the next five years. Innovatech faces stiff competition but stands out due to its innovative approach and diverse service offerings.</p>
                        </CardContent>
                    </Card>
                    <Card id="executive summary" className="col-span-1 row-span-2">
                        <CardContent className="flex flex-col justify-between p-4 h-full text-2xl font-semibold text-center">
                            Executive Summary
                            <Button>
                                Download
                            </Button>
                        </CardContent>
                    </Card>             
                </div>
              </div>
          </div>
      </>
    );
  }
  