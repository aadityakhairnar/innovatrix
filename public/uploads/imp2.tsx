"use client";
import Navbar from "@/components/Navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import CIBILChart from "@/components/homepage/CIBILChart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface GeminiResponse {
  profileScore: string;
  historicalAnalysis: string[];
  employmentDetails: {
    employerName: string;
    position: string;
    employmentDuration: string;
  };
  verifiedIncome: string;
  riskAnalysis: {
    riskLevel: string;
    reasons: string[];
  };
}

interface credit_memo {
  profile_overview: string;
  financial_stability_assessment: string;
  loan_feasibility_evaluation: string;
  creditworthiness_assessment: string;
  emi_affordability_analysis: string;
  spending_pattern_analysis: string;
  final_profile_score_calculation: string;
  final_recommendation: string;
}

interface MemoData {
  credit_memo: credit_memo
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Page() {
  const searchParams = useSearchParams();
  const memoId = searchParams.get("memoId");

  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memoId) {
      fetchMemoData(memoId as string);
    }
  }, [memoId]);

  const fetchMemoData = async (memoId: string) => {
    try {
        const response = await fetch('https://loanapplications.blob.core.windows.net/loanapplications/individual_memo_5465/credit_memo.json       ');
        if (!response.ok) {
            throw new Error(`Failed to fetch memo data with ID: ${memoId}`);
        }
        const data = await response.json();
        console.log("Fetched Data: ", data); // Add this line
        setMemoData(data);
    } catch (error: any) {
        console.error("Error fetching memo data:", error);
        setError(error.message || "Failed to load memo data");
    }
};

  console.log(memoData);

  // const chartData =
  //   memoData?.geminiResponse?.historicalAnalysis?.map((value, index) => ({
  //     month: ["January", "February", "March", "April", "May"][index],
  //     desktop: value,
  //   })) || [];

  return (
    <>
      <div>
        <Navbar />
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
                  <BreadcrumbLink href="\memo\individual">
                    Loan Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="\memo\individual\generatedMemo">
                    Generated Memo
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {error ? (
            <p>Error: {error}</p>
          ) : memoData ? (
            <div>
              <div className="mx-20 my-5 flex flex-col justify-between items-center">
                <p className="text-4xl font-semibold">
                  {memoData.credit_memo.profile_overview}
                </p>
                <p>Individual</p>
              </div>
              <div className="grid grid-cols-8 grid-rows-7 h-[75vh] gap-2">
                <Card className="col-span-7 row-span-1">
                  <CardContent className="p-4 flex flex-row justify-around items-center h-full">
                    <p>Loan Amount - {memoData.credit_memo.financial_stability_assessment}</p>
                    <p>Purpose - {memoData.credit_memo.loan_feasibility_evaluation}</p>
                    <p>Loan Term - {memoData.credit_memo.creditworthiness_assessment} Months</p>
                  </CardContent>
                </Card>
                <Card className="col-span-1 row-span-2">
                  <CardContent className="p-4 pb-2 text-2xl font-semibold text-center">
                    Profile Score
                  </CardContent>
                  <CardContent className="text-5xl font-semibold text-center pb-4">
                    {/*memoData.geminiResponse.profileScore*/}
                  </CardContent>
                </Card>
                <Card id="historicalanalysis" className="col-span-7 row-span-3">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle>Historical Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 flex flex-col justify-between">
                    <Card>
                      <CardHeader className=" text-base p-2">
                        <CardTitle className="text-base">Income </CardTitle>
                      </CardHeader>
                      <CardContent className="w-110 p-2">
                        <ChartContainer
                          config={chartConfig}
                          className=" h-[13vh] w-full "
                        >
                          <LineChart
                            accessibilityLayer

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
                <Card id="executive summary" className="col-span-1 row-span-2">
                  <CardContent className="flex flex-col justify-between p-4 h-full text-2xl font-semibold text-center">
                    Executive Summary
                    <Button>Download</Button>
                  </CardContent>
                </Card>
                <Card id="externalriskfactors" className="col-span-2 row-span-2">
                  <CardHeader className="p-2">
                    <CardTitle>Cibil Score</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[70%] p-2">
                    <CIBILChart cibilScore={749} />
                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-2 row-span-2">
                  <CardHeader className="pb-4">
                    <CardTitle>Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Employer Name:{" "}
                      {/*memoData.geminiResponse.employmentDetails.employerName*/}
                    </p>
                    <p>Position: {/*memoData.geminiResponse.employmentDetails.position*/}</p>
                    <p>Employment Duration: {/*memoData.geminiResponse.employmentDetails.employmentDuration*/}</p>
                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-2 row-span-2">
                  <CardHeader className="pb-4">
                    <CardTitle>Verified Income Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Primary Income: {/*memoData.geminiResponse.verifiedIncome*/}</p>
                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-2 row-span-2">
                  <CardHeader className="pb-4">
                    <CardTitle>
                      Risk Analysis - {/*memoData.geminiResponse.riskAnalysis.riskLevel*/}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/*memoData.geminiResponse.riskAnalysis.reasons.map((reason, index) => (
                      <p key={index}>{reason}</p>
                    ))*/}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}
