import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Memotable = () => {
  const noofrows = 10;
  const [data, setData] = useState<Array<any>>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(noofrows);
  const [activeTab, setActiveTab] = useState("individual"); // default tab is 'individual'

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/MemoData.csv");

      if (!response.ok || !response.body) {
        console.error("Failed to fetch data or response body is null");
        return;
      }

      const reader = response.body.getReader();
      const result = await reader.read(); // raw array buffer
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);
      const parsedData = Papa.parse(csv, { header: true }).data;
      setData(parsedData);
    }
    fetchData();
  }, []);

  // Filter data based on the active tab and then paginate
  const filteredData = data.filter(
    (item) => item.Category?.toLowerCase() === activeTab
  );

  return (
    <div className="border rounded-xl mx-20">
      <Tabs defaultValue="individual" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <Table>
            <TableCaption>List of Individual Memos</TableCaption>
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
              {filteredData.slice(startIndex, endIndex).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item["MemoId"]}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item["Loan Type"]}</TableCell>
                  <TableCell className="text-right">{item.Amount}</TableCell>
                  <TableCell className="text-right">{item["Date Created"]}</TableCell>
                  <TableCell className="text-right">{item.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="business">
          <Table>
            <TableCaption>List of Business Memos</TableCaption>
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
              {filteredData.slice(startIndex, endIndex).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item["MemoId"]}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item["Loan Type"]}</TableCell>
                  <TableCell className="text-right">{item.Amount}</TableCell>
                  <TableCell className="text-right">{item["Date Created"]}</TableCell>
                  <TableCell className="text-right">{item.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={startIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              onClick={() => {
                setStartIndex(Math.max(0, startIndex - noofrows));
                setEndIndex(Math.max(noofrows, endIndex - noofrows));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className={endIndex >= filteredData.length ? "pointer-events-none opacity-50" : "cursor-pointer"}
              onClick={() => {
                setStartIndex(Math.min(filteredData.length - noofrows, startIndex + noofrows));
                setEndIndex(Math.min(filteredData.length, endIndex + noofrows));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Memotable;
