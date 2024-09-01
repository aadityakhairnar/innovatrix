"use client";
import Navbar from "@/components/Navbar";
import { generatePDF } from "@/components/generatePDF";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import CIBILChart from "@/components/homepage/CIBILChart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Incomevsrevenue2 } from "@/components/homepage/Incomevsrevenue2";
import { BlobServiceClient } from "@azure/storage-blob";
import * as Separator from '@radix-ui/react-separator';
import { useToast } from "@/components/ui/use-toast";

interface ApplicantDetails {
  name: string;
  age: number;
  gender: string;
  marital_status: string;
  occupation: string;
  company: string;
  employment_duration_years: number;
  annual_income: number;
  loan_amount_requested: number;
  loan_purpose: string;
  loan_term_years: number;
  profile_score: number;
  profile_summary: string;
}

interface ExistingLoan {
  loan_type: string;
  loan_amount: number;
}

interface SixMonthAnalysis {
  months: string[];
  income: number[];
  expenses: number[];
}

interface FinancialAnalysis {
  monthly_income: number;
  monthly_expenses: number;
  monthly_emi_obligations: number;
  cibil_score: number;
  creditworthiness: string;
  debt_to_income_ratio: string;
  existing_loans: ExistingLoan[];
  income_sources_verified: boolean;
  spending_pattern_analysis: string;
  bank_statement_analysis: string;
  six_month_analysis: SixMonthAnalysis;
}

interface ExternalRiskFactors {
  economic_conditions: string;
  industry_risk: string;
  personal_liabilities: string;
  interest_rate_fluctuations: string;
  inflation_risk: string;
  geopolitical_risk: string;
  health_risk: string;
  family_dependents: string;
  housing_market_risk: string;
  employment_volatility: string;
}

interface RiskAnalysis {
  risk_level: string;
  risk_factors: string[];
  external_risk_factors: ExternalRiskFactors;
}

interface LoanEvaluation {
  loan_type: string;
  requested_amount: number;
  purpose_of_loan: string;
  feasibility_of_loan: string;
  final_recommendation: string;
  recommendation_reason: string;
}

interface LoanDecision {
  applicant_details: ApplicantDetails;
  financial_analysis: FinancialAnalysis;
  risk_analysis: RiskAnalysis;
  loan_evaluation: LoanEvaluation;
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
  const { toast } = useToast()
  const [loanDecision, setLoanDecision] = useState<LoanDecision | null>(null);
  const [chartData, setChartData] = useState<{ month: string; income: number; expense: number }[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memoId) {
      fetchMemoData(memoId as string);
    }
  }, [memoId]);

  const fetchMemoData = async (memoId: string) => {
    try {
      const response = await fetch(`https://loanapplications.blob.core.windows.net/loanapplications/${memoId}/credit_memo.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memo data with ID: ${memoId}`);
      }
      const data = await response.json();
      setLoanDecision(data);

      // Assuming six_month_analysis contains months, income, and expenses arrays
      const chartData = data.financial_analysis.six_month_analysis.months.map((month: string, index: number) => ({
        month,
        income: data.financial_analysis.six_month_analysis.income[index],
        expense: data.financial_analysis.six_month_analysis.expenses[index],
      }));
      setChartData(chartData);
    } catch (error: any) {
      console.error('Error fetching memo data:', error);
      setError(error.message || 'Failed to load memo data');
    }
  };

  const handleLoanDecision = async (status: string) => {
    if (loanDecision) {
      try {
        const updatedLoanDecision = {
          ...loanDecision,
          loan_evaluation: {
            ...loanDecision.loan_evaluation,
            loan_status: status,  // Add the loan status to the evaluation
          },
        };

        setLoanDecision(updatedLoanDecision);

        // Save the updated loan decision back to Azure
        await saveLoanDecisionToAzureWithSDK(updatedLoanDecision, memoId);

        toast({
          title: "Success",
          description: "Application status has been saved successfully.",
        }); // Debugging line
      } catch (error: any) {
        console.error("Error in handling loan decision:", error.message || error);
        setError("Failed to process loan decision.");
      }
    } else {
      console.error("loanDecision is null, cannot update status.");
      setError("LoanDecision data is not available.");
    }
  };

  const saveLoanDecisionToAzureWithSDK = async (updatedLoanDecision: LoanDecision, memoId: string | null) => {
    if (!memoId) return;

    try {
      const sasToken = process.env.NEXT_PUBLIC_SAS_TOKEN;
      const blobServiceClient = new BlobServiceClient(`https://loanapplications.blob.core.windows.net?${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient("loanapplications");
      const blockBlobClient = containerClient.getBlockBlobClient(`${memoId}/credit_memo.json`);

      const data = JSON.stringify(updatedLoanDecision);
      const response = await blockBlobClient.upload(data, data.length, {
        blobHTTPHeaders: {
          blobContentType: "application/json",
        },
      });

      console.log("Loan decision successfully updated and saved to Azure with SDK:", response.requestId);
    } catch (error: any) {
      console.error("Error saving loan decision with SDK:", error.message || error);
    }
  };

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
                  <BreadcrumbLink href="/memo/individual">
                    Loan Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/memo/individual/generatedMemo">
                    Generated Memo
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {error ? (
            <p>Error: {error}</p>
          ) : loanDecision ? (
            <div id="pdf-content">
              <div className="mx-20 my-5 flex flex-col justify-between items-center">
                <p className="text-4xl font-semibold">
                  {loanDecision.applicant_details.name}
                </p>
                <p>Individual</p>
              </div>
              <div className="grid grid-cols-8 grid-rows-18 h-[75vh] gap-2">
                <Card className="col-span-6 row-span-3">
                  <CardContent className="p-4 pb-0 flex flex-row justify-around items-center text-lg font-medium">
                    <p>{loanDecision.applicant_details.profile_summary}</p>
                  </CardContent>
                  <CardContent className="p-4 pt-2 flex flex-row justify-between items-center">
                    <p>Loan Amount - {loanDecision.applicant_details.annual_income}</p>
                    <p>Purpose - {loanDecision.applicant_details.loan_purpose}</p>
                    <p>Loan Term - {loanDecision.applicant_details.loan_term_years} Years</p>
                  </CardContent>
                </Card>
                <Card className="col-span-1 row-span-4">
                  <CardContent className="p-4 pb-2 text-2xl font-semibold text-center">
                    Profile Score
                  </CardContent>
                  <CardContent className="text-6xl font-semibold text-center pb-4">
                    {loanDecision.applicant_details.profile_score}
                  </CardContent>
                </Card>
                <Card id="executive summary" className="col-span-1 row-span-4">
                  <CardContent className="flex flex-col justify-between p-4 pb-6 h-full text-2xl font-semibold text-center">
                    Executive Summary
                    <Button onClick={() => loanDecision && generatePDF(loanDecision)}>Download</Button>
                  </CardContent>
                </Card>
                
                
                <Card id="historicalanalysis" className="col-span-4 row-span-6">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle>Historical Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Incomevsrevenue2 chartData={chartData} />
                  </CardContent> 
                </Card>
                <Card id="externalriskfactors" className="col-span-2 row-span-6">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle>Cibil Score</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 h-32">
                    <CIBILChart cibilScore={loanDecision.financial_analysis.cibil_score} />
                  </CardContent>
                  <CardFooter className="flex flex-col"><p className="text-5xl font-semibold">{loanDecision.financial_analysis.cibil_score}</p>
                    <p className="text-xl font-semibold">Credit Worthiness :</p>
                    <p className="text-3xl font-semibold">{loanDecision.financial_analysis.creditworthiness}</p>
                  </CardFooter>
                </Card>
                <Card id="sectoranalysis" className="col-span-2 row-span-5">
                  <CardHeader className="pb-4">
                    <CardTitle>Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">
                      Employer Name:
                    </p>
                    <p className="text-xl font-semibold">
                      {loanDecision.applicant_details.company}
                    </p>
                    <p className="text-lg font-medium">Position:</p>
                    <p className="text-xl font-semibold"> 
                      {loanDecision.applicant_details.occupation}
                    </p>
                    <p className="text-lg font-medium">Employment Duration: </p>
                      
                    <p className="text-xl font-semibold">{loanDecision.applicant_details.employment_duration_years} Years</p>
                  </CardContent>
                </Card>
                
                
                <Card id="sectoranalysis" className="col-span-4 row-span-3">
                  <CardHeader className="pb-4">
                    <CardTitle>Verified Income Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-row gap-2 justify-between text-wrap text-center ">
                    <Card className="p-2"><p className="text-md font-medium">Primary Monthly Income:</p> 
                    <p className="text-2xl font-semibold p-2">{loanDecision.financial_analysis.monthly_income}</p></Card>
                    <Card className="p-2"><p className="text-md font-medium">Monthly EMI Obligations:</p> 
                    <p className="text-2xl font-semibold p-2">{loanDecision.financial_analysis.monthly_emi_obligations}</p></Card>
                    <Card className="p-2"><p className="text-md font-medium">Debt To Income Ratio:</p> 
                    <p className="text-2xl font-semibold p-2">{loanDecision.financial_analysis.debt_to_income_ratio}</p></Card>
                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-4 row-span-3">
                  <CardHeader className="pb-4">
                    <CardTitle>
                      Risk Analysis - {loanDecision.risk_analysis.risk_level}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-row gap-2 justify-between text-wrap text-center ">
                    <Card className="w-1/3 p-2"><p className="text-md font-medium">{loanDecision.risk_analysis.risk_factors[0]}</p></Card>
                    <Card className="w-1/3 p-2"><p className="text-md font-medium">{loanDecision.risk_analysis.risk_factors[1]}</p></Card>
                    <Card className="w-1/3 p-2"><p className="text-md font-medium">{loanDecision.risk_analysis.external_risk_factors.family_dependents}</p></Card>

                  </CardContent>
                </Card>
                <Card id="sectoranalysis" className="col-span-8 row-span-2 mb-20">
                  <CardHeader className="pb-4">
                    <CardTitle>
                      Loan Evaluation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-2 text-wrap">
                    <Card className="p-2"><p className="p-2 pb-0 text-md font-medium text-center">Loan Type :</p> 
                    <p className="p-2 text-xl font-semibold text-center">{loanDecision.loan_evaluation.loan_type}</p></Card>
                    <Card className="p-4"><p className="p-2 pb-0 text-md font-medium text-center">Requested Amount :</p>
                    <p className="p-2 text-xl font-semibold text-center">{loanDecision.loan_evaluation.requested_amount}</p></Card>
                    <Card className="p-4"><p className="p-2 pb-0 text-md font-medium text-center">Purpose of Loan :</p>
                    <p className="p-2 text-xl font-semibold text-center">{loanDecision.loan_evaluation.purpose_of_loan}</p></Card>
                    <Card className="p-4"><p className="p-2 pb-0 text-md font-medium text-center">Final Recommendation :</p> 
                    <p className="p-2 text-xl font-semibold text-center">{loanDecision.loan_evaluation.final_recommendation}</p></Card>
                    
                    <Card className="p-4  col-span-1"><p className="p-2  pb-0 text-md font-medium text-center">Feasibilty :</p>
                    <p className="p-2 text-xl font-semibold text-center text-wrap">{loanDecision.loan_evaluation.feasibility_of_loan}</p></Card>
                    
                    <Card className="p-4  col-span-2"><p className="p-2 pb-0 text-md font-medium text-center">Recommendation Reason :</p>
                    <p className="p-2 text-xl font-semibold text-center">{loanDecision.loan_evaluation.recommendation_reason}</p></Card>
                    <Card className="p-4 col-span-1 flex flex-col gap-6 items-center">
                      <CardTitle className="p-4">Loan Status</CardTitle>
                      <Button onClick={() => handleLoanDecision("Accepted")} className="w-[70%]">Accept Application</Button>
                      <Button onClick={() => handleLoanDecision("Rejected")} className="w-[70%]" >Reject Application</Button>
                    </Card>
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
