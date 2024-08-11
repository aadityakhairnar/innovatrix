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
      const response = await fetch("/MemoData.csv");

      // Check if response.body is null
      if (!response.body) {
        console.error("Response body is null");
        return;
      }

      const reader = response.body.getReader();
      const result = await reader.read(); // raw array buffer
      const decoder = new TextDecoder("utf-8");
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
                    <Link href="\memo\individual">
                  <Button className="flex flex-row gap-2">
                      <p>For Individual</p>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                  </Button>
                    </Link>
                    <Link href="/memo/business">
                  <Button className="flex flex-row gap-2">
                      For Business
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                  </Button>
                    </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="border rounded-xl mx-20">
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
