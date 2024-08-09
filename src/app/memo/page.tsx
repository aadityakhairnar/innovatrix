"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Papa from "papaparse";
import { useEffect, useState } from 'react';
import Link from "next/link";

export default function Page() {
  const [data, setData] = useState<Array<any>>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/MemoData.csv');
      const reader = response.body.getReader();
      const result = await reader.read(); // raw array buffer
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      const parsedData = Papa.parse(csv, { header: true }).data;
      console.log(parsedData);
      setData(parsedData);
    }
    fetchData();
  }, []);

  return (
    <>
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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="mx-20 my-5 flex flex-row justify-between items-center">
          <p className=" text-4xl">Memos</p>
          <div >
            <Card className="flex flex-row items-center">
              <CardHeader>
                  <CardTitle>New Memo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-row gap-4 p-4">
                  <Button>
                    <Link href="\memo\individual">
                      For Individual
                    </Link>
                  </Button>
                  <Button>
                    <Link href="/business">
                      For Business
                    </Link>
                  </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="border rounded-xl">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Memo Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date Created</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item["Memo Id"]}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item["Loan Type"]}</TableCell>
                  <TableCell className="text-right">{item.Amount}</TableCell>
                  <TableCell className="text-right">{item["Date Created"]}</TableCell>
                  <TableCell className="text-right">{item.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
