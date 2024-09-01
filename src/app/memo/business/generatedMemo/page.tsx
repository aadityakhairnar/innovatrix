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
  CardDescription,
  CardFooter,
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

import { generatePDF } from "@/components/generatePDF";

import CIBILChart from "@/components/homepage/CIBILChart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Incomevsrevenue2 } from "@/components/homepage/Incomevsrevenue2";
import { BlobServiceClient } from "@azure/storage-blob";
import * as Separator from "@radix-ui/react-separator";
import { useToast } from "@/components/ui/use-toast";

interface CompanyDetails {
  company_name: string;
  industry: string;
  description: string;
  annual_revenue: string;
  loan_amount_requested: string;
  loan_purpose: string;
  profile_score: string;
  profile_overview: string;
}

interface FinancialRatios {
  current_ratio: string;
  debt_to_equity: string;
  return_on_assets: string;
  return_on_equity: string;
}

interface HistoricalFinancialData {
  years: string[];
  values: number[]; // assuming the values are numbers
  unit: string;
}

interface HistoricalFinancialAnalysis {
  revenue: HistoricalFinancialData;
  profit_margin: HistoricalFinancialData;
}

interface FinancialAnalysis {
  revenue: string;
  net_income: string;
  total_assets: string;
  total_debt: string;
  total_equity: string;
  financial_ratios: FinancialRatios;
  historical_financial_analysis: HistoricalFinancialAnalysis;
  bank_statement_analysis: string;
  credit_score_analysis: string;
}

interface RiskFactors {
  level: string;
  description: string;
}

interface ExternalRiskFactors {
  market_competition: RiskFactors;
  regulatory_changes: RiskFactors;
  economic_factors: RiskFactors;
}

interface RiskAnalysis {
  risk_level: string;
  risk_factors: string[];
  external_risk_factors: ExternalRiskFactors;
}

interface CollateralAndSecurityAnalysis {
  collateral_value: string;
  adequacy: string;
}

interface SectorAndMarketPositionAnalysis {
  market_share: string;
  growth_rate: string;
  competition_level: string;
}

interface FinalProfileScoreCalculation {
  cumulative_profile_score: string;
  final_recommendation: string;
  recommendation_reason: string;
}

interface ExecutiveSummary {
  button_text: string;
  url: string;
}

interface LoanUnderwritingData {
  company_details: CompanyDetails;
  financial_analysis: FinancialAnalysis;
  risk_analysis: RiskAnalysis;
  collateral_and_security_analysis: CollateralAndSecurityAnalysis;
  sector_and_market_position_analysis: SectorAndMarketPositionAnalysis;
  final_profile_score_calculation: FinalProfileScoreCalculation;
  executive_summary: ExecutiveSummary;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit Margin",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Page() {
  const searchParams = useSearchParams();
  const memo_id = searchParams.get("memo_id");
  const { toast } = useToast();
  const [LoanUnderwritingData, setLoanUnderwritingData] =
    useState<LoanUnderwritingData | null>(null);
  const [chartData, setChartData] = useState<
    { month: string; income: number; expense: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memo_id) {
      setIsLoading(true);
      fetchMemoData(memo_id).finally(() => setIsLoading(false));
    }
  }, [memo_id]);

  const fetchMemoData = async (memo_id: string) => {
    try {
      console.log("Fetching memo data...");
      const response = await fetch(
        `https://loanapplications.blob.core.windows.net/loanapplications/${memo_id}/credit_memo.json`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch memo data with ID: ${memo_id}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setLoanUnderwritingData(data);

      // Assuming six_month_analysis contains months, income, and expenses arrays
      // const chartData = data.financial_analysis.six_month_analysis.months.map(
      //   (month: string, index: number) => ({
      //     month,
      //     income: data.financial_analysis.six_month_analysis.income[index],
      //     expense: data.financial_analysis.six_month_analysis.expenses[index],
      //   })
      // );
      console.log("Processed chart data:", chartData);
      setChartData(chartData);
    } catch (error: any) {
      console.error("Error fetching memo data:", error);
      setError(error.message || "Failed to load memo data");
    }
  };

  const handleLoanUnderwritingData = async (status: string) => {
    if (LoanUnderwritingData) {
      try {
        const updatedLoanUnderwritingData = {
          ...LoanUnderwritingData,
          final_profile_score_calculation: {
            ...LoanUnderwritingData.final_profile_score_calculation,
            loan_status: status, // Add the loan status to the evaluation
          },
        };

        setLoanUnderwritingData(updatedLoanUnderwritingData);

        // Save the updated loan decision back to Azure
        await saveLoanUnderwritingDataToAzureWithSDK(
          updatedLoanUnderwritingData,
          memo_id
        );

        toast({
          title: "Success",
          description: "Application status has been saved successfully.",
        });
      } catch (error: any) {
        console.error("Error in handling loan decision:", error.message || error);
        setError("Failed to process loan decision.");
      }
    } else {
      console.error("LoanUnderwritingData is null, cannot update status.");
      setError("LoanUnderwritingData data is not available.");
    }
  };

  const saveLoanUnderwritingDataToAzureWithSDK = async (
    updatedLoanUnderwritingData: LoanUnderwritingData,
    memo_id: string | null
  ) => {
    if (!memo_id) return;

    try {
      const sasToken = process.env.NEXT_PUBLIC_SAS_TOKEN;
      const blobServiceClient = new BlobServiceClient(
        `https://loanapplications.blob.core.windows.net?${sasToken}`
      );
      const containerClient =
        blobServiceClient.getContainerClient("loanapplications");
      const blockBlobClient = containerClient.getBlockBlobClient(
        `${memo_id}/credit_memo.json`
      );

      const data = JSON.stringify(updatedLoanUnderwritingData);
      const response = await blockBlobClient.upload(data, data.length, {
        blobHTTPHeaders: {
          blobContentType: "application/json",
        },
      });

      console.log(
        "Loan decision successfully updated and saved to Azure with SDK:",
        response.requestId
      );
    } catch (error: any) {
      console.error("Error saving loan decision with SDK:", error.message || error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
                  <BreadcrumbLink href="\memo\business">Loan Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="\memo\business\generatedMemo">Generated Memo</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mx-20 my-5 flex flex-col justify-between items-center">
            <p className="text-4xl font-semibold">{LoanUnderwritingData?.company_details.company_name}</p>
            <p>Business</p>
          </div>
          <div className="grid grid-cols-8 grid-rows-7 h-[75vh] gap-2">
            <Card className="col-span-7 row-span-2">
              <CardContent className="p-4 text-md font-medium">
                {LoanUnderwritingData?.company_details.description}
              </CardContent>
              <CardFooter className="flex justify-between p-4">
                <p>Loan Amount - ${LoanUnderwritingData?.company_details.loan_amount_requested}</p>
                <p>Purpose - {LoanUnderwritingData?.company_details.loan_purpose}</p>
              </CardFooter>
            </Card>
            <Card className="col-span-1 row-span-2">
              <CardContent className="p-4 text-2xl font-semibold text-center">
                Profile Score
              </CardContent>
              <CardContent className="text-5xl font-semibold text-center text-warning-secondary">
                {LoanUnderwritingData?.company_details.profile_score}
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
                          left: 14,
                          right: 14,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 4)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                          dataKey="revenue"
                          type="natural"
                          stroke="var(--color-revenue)"
                          strokeWidth={2}
                          dot={{
                            fill: "var(--color-revenue)",
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
                          left: 14,
                          right: 14,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 4)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                          dataKey="profit"
                          type="natural"
                          stroke="var(--color-profit)"
                          strokeWidth={2}
                          dot={{
                            fill: "var(--color-profit)",
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
            <Card id="externalriskfactors" className="col-span-5 row-span-3">
              <CardHeader>
                <CardTitle>External risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-row gap-2">
                <CardContent className="flex flex-col justify-center text-center gap-1">
                  <p className="text-md font-medium">Market Competition</p>
                  <p className="text-3xl font-semibold text-warning-secondary">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.market_competition.level}
                  </p>
                  <p className="text-md font-medium">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.market_competition.description}
                  </p>
                </CardContent>
                <CardContent className="flex flex-col justify-center gap-1">
                  <p className="text-md font-medium text-center">Regulatory Changes</p>
                  <p className="text-3xl font-semibold text-warning-secondary text-center">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.regulatory_changes.level}
                  </p>
                  <p className="text-md font-medium text-center">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.regulatory_changes.description}
                  </p>
                </CardContent>
                <CardContent className="flex flex-col justify-center text-center gap-1">
                  <p className="text-md font-medium">Economic Factors</p>
                  <p className="text-3xl font-semibold text-warning-secondary">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.economic_factors.level}
                  </p>
                  <p className="text-md font-medium">
                    {LoanUnderwritingData?.risk_analysis.external_risk_factors.economic_factors.description}
                  </p>
                </CardContent>
              </CardContent>
            </Card>
            <Card id="sectoranalysis" className="col-span-4 row-span-2">
              <CardHeader className="pb-4">
                <CardTitle>Sector Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{LoanUnderwritingData?.sector_and_market_position_analysis.growth_rate}</p>
                <p>{LoanUnderwritingData?.sector_and_market_position_analysis.competition_level}</p>
                <p>{LoanUnderwritingData?.sector_and_market_position_analysis.market_share}</p>
              </CardContent>
            </Card>
            <Card id="executive summary" className="col-span-1 row-span-4">
              <CardContent className="flex flex-col justify-between p-4 pb-6 h-full text-2xl font-semibold text-center">
                Executive Summary
                <Button onClick={() => LoanUnderwritingData && generatePDF(LoanUnderwritingData)}>
                  Download
                </Button>
              </CardContent>
            </Card>
            <Card className="p-4 col-span-1 flex flex-row w-full gap-6 items-center">
              <CardTitle className="p-4">Loan Status</CardTitle>
              <Button onClick={() => handleLoanUnderwritingData("Accepted")} className="w-[70%]">
                Accept Application
              </Button>
              <Button onClick={() => handleLoanUnderwritingData("Rejected")} className="w-[70%]">
                Reject Application
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
