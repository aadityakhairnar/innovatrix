"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Recentac = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/MemoData.csv");
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results : any) => {
            const limitedData = results.data.slice(-6);
            setData(limitedData);
        },
      });
    };

    fetchData();
  }, []);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableCaption className="p-1 m-0 mb-1 ">A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Loan Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} >
              <TableCell className="py-2">{row.Name}</TableCell>
              <TableCell className="py-2">{row["Loan Type"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Recentac;
