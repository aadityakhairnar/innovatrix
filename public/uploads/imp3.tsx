"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CIBILChart from "@/components/homepage/CIBILChart";

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
  credit_memo: credit_memo;
}

export default function Page() {
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemoData();
  }, []);

  const fetchMemoData = async () => {
    try {
      const response = await fetch(
        'https://loanapplications.blob.core.windows.net/loanapplications/individual_memo_5465/credit_memo.json'
      );
      console.log("Response Status:", response.status);

      if (!response.ok) {
        console.error("Fetch failed with status:", response.status);
        throw new Error("Failed to fetch memo data.");
      }

      const data = await response.json();
      console.log("Fetched Data: ", data); // For debugging
      setMemoData(data);
    } catch (error: any) {
      console.error("Error fetching memo data:", error);
      setError(error.message || "Failed to load memo data");
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
                    <p>
                      Loan Amount -{" "}
                      {memoData.credit_memo.financial_stability_assessment}
                    </p>
                    <p>
                      Purpose - {memoData.credit_memo.loan_feasibility_evaluation}
                    </p>
                    <p>
                      Loan Term -{" "}
                      {memoData.credit_memo.creditworthiness_assessment} Months
                    </p>
                  </CardContent>
                </Card>
                <Card className="col-span-1 row-span-2">
                  <CardContent className="p-4 pb-2 text-2xl font-semibold text-center">
                    Profile Score
                  </CardContent>
                  <CardContent className="text-5xl font-semibold text-center pb-4">
                    {/* Add content here if necessary */}
                  </CardContent>
                </Card>
                {/* Additional content goes here */}
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
