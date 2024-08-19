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
import CIBILChart from "@/components/homepage/CIBILChart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Incomevsrevenue from "@/components/homepage/Incomevsrevenue";

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
  monthlyEMI: string;
  recommendation: string;
  recommendationReason: string;
}

interface MemoData {
  applicantName: string;
  loanAmount: string;
  loanPurpose: string;
  loanTerm: string;
  cibilScore: number;
  geminiResponse: GeminiResponse;
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
      const response = await fetch(`https://loanapplications.blob.core.windows.net/inputpdfs/${memoId}/data.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memo data with ID: ${memoId}`);
      }
      const data = await response.json();
      setMemoData(data);
    } catch (error: any) {
      console.error('Error fetching memo data:', error);
      setError(error.message || 'Failed to load memo data');
    }
  };
    console.log(memoData);


  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ]

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
                  {memoData.applicantName}
                </p>
                <p>Individual</p>
              </div>
              <div className="grid grid-cols-8 grid-rows-12 h-[75vh] gap-2">
                <Card className="col-span-6 row-span-3">
                  <CardContent className="p-4 pb-0 flex flex-row justify-around items-center text-md font-medium">
                    <p>The applicant, aaditya, is a 21-year-old male, married, and employed as a Senior Software Engineer at ABC Technologies Pvt Ltd for the past 5 years. He has a declared annual income of INR 12,00,000 and is seeking a home loan of INR 10,00,000 for a stated purpose of \"timepass\".</p>
                  </CardContent>
                  <CardContent className="p-4 pt-2 flex flex-row justify-between items-center">
                    <p>Loan Amount - {memoData.loanAmount}</p>
                    <p>Purpose - {memoData.loanPurpose}</p>
                    <p>Loan Term - {memoData.loanTerm} Months</p>
                  </CardContent>
                </Card>
                <Card className="col-span-1 row-span-4">
                  <CardContent className="p-4 pb-2 text-2xl font-semibold text-center">
                    Profile Score
                  </CardContent>
                  <CardContent className="text-6xl font-semibold text-center pb-4">
                    {memoData.geminiResponse.profileScore}
                  </CardContent>
                </Card>
                <Card id="executive summary" className="col-span-1 row-span-4">
                  <CardContent className="flex flex-col justify-between p-4 pb-6 h-full text-2xl font-semibold text-center">
                    Executive Summary
                    <Button>Download</Button>
                  </CardContent>
                </Card>
                
                
                <Card id="historicalanalysis" className="col-span-4 row-span-6">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle>Historical Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                      <Incomevsrevenue/>
                  </CardContent> 
                </Card>
                <Card id="externalriskfactors" className="col-span-2 row-span-6">
                  <CardHeader className="p-2">
                    <CardTitle>Cibil Score</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 h-32">
                    <CIBILChart cibilScore={memoData.cibilScore} />
                  </CardContent>
                  <CardFooter>The applicant has a CIBIL score of 749, indicating a good credit history.</CardFooter>
                </Card>
                <Card id="sectoranalysis" className="col-span-2 row-span-5">
                  <CardHeader className="pb-4">
                    <CardTitle>Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Employer Name:
                    </p>
                    <p>
                      {memoData.geminiResponse.employmentDetails.employerName}
                    </p>
                    <p>Position:</p>
                    <p> 
                      {memoData.geminiResponse.employmentDetails.position}
                    </p>
                    <p>Employment Duration: </p>
                      
                    <p>{memoData.geminiResponse.employmentDetails.employmentDuration}</p>
                  </CardContent>
                </Card>
                
                
                <Card id="sectoranalysis" className="col-span-4 row-span-3">
                  <CardHeader className="pb-4">
                    <CardTitle>Verified Income Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Primary Income: {memoData.geminiResponse.verifiedIncome}</p>
                    <p>Monthly EMI: {memoData.geminiResponse.monthlyEMI}</p>
                    <p>Our Recommendation: {memoData.geminiResponse.recommendation}</p>
                    <p>Reason: {memoData.geminiResponse.recommendationReason}</p>
                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-4 row-span-3">
                  <CardHeader className="pb-4">
                    <CardTitle>
                      Risk Analysis - {memoData.geminiResponse.riskAnalysis.riskLevel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col text-wrap">
                    {memoData.geminiResponse.riskAnalysis.reasons.map((reason, index) => (
                      <p key={index}>{reason}</p>
                    ))}
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