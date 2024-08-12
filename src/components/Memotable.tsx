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
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const Memotable = () => {
  const noofrows = 10;
  const [data, setData] = useState<Array<any>>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(noofrows);
  const [activeTab, setActiveTab] = useState("individual"); // default tab is 'individual'
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  // Sorting function
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const directionMultiplier = direction === 'asc' ? 1 : -1;
  
    // Special handling for numerical fields like "Amount"
    if (key === "Amount") {
      const aAmount = parseFloat(a[key]) || 0;
      const bAmount = parseFloat(b[key]) || 0;
      return (aAmount - bAmount) * directionMultiplier;
    }
  
    // Default sorting for other fields (assumed to be strings)
    if (a[key] < b[key]) return -1 * directionMultiplier;
    if (a[key] > b[key]) return 1 * directionMultiplier;
    return 0;
  });
  

  // Function to handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
                <TableHead className="w-[100px]">
                  <div className="flex flex-grow-0 flex-row items-center text-nowrap"> 
                  Memo Id
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("MemoId")}
                    >
                    {sortConfig?.key === "MemoId" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex flex-grow-0 flex-row items-center text-nowrap">
                  Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Name")}
                  >
                    {sortConfig?.key === "Name" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
                <TableHead>
                <div className="flex flex-row items-center text-nowrap">
                  Loan Type
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Loan Type")}
                  >
                    {sortConfig?.key === "Loan Type" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
                <TableHead>
                <div className="flex  flex-row items-center text-nowrap">
                  Amount
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Amount")}
                  >
                    {sortConfig?.key === "Amount" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
                <TableHead>
                <div className="flex flex-row items-center text-nowrap">
                  Date Created
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Date Created")}
                  >
                    {sortConfig?.key === "Date Created" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
                <TableHead >
                <div className="flex flex-row items-center text-nowrap">
                  Status
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Status")}
                  >
                    {sortConfig?.key === "Status" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.slice(startIndex, endIndex).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item["MemoId"]}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item["Loan Type"]}</TableCell>
                  <TableCell className="text-left">{item.Amount}</TableCell>
                  <TableCell className="text-left">{item["Date Created"]}</TableCell>
                  <TableCell className="text-left">{item.Status}</TableCell>
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
                <TableHead className="w-[100px]">
                  Memo Id
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("MemoId")}
                  >
                    {sortConfig?.key === "MemoId" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Name")}
                  >
                    {sortConfig?.key === "Name" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  Loan Type
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Loan Type")}
                  >
                    {sortConfig?.key === "Loan Type" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  Amount
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Amount")}
                  >
                    {sortConfig?.key === "Amount" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  Date Created
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Date Created")}
                  >
                    {sortConfig?.key === "Date Created" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  Status
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("Status")}
                  >
                    {sortConfig?.key === "Status" && sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.slice(startIndex, endIndex).map((item, index) => (
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
              className={endIndex >= sortedData.length ? "pointer-events-none opacity-50" : "cursor-pointer"}
              onClick={() => {
                setStartIndex(Math.min(sortedData.length - noofrows, startIndex + noofrows));
                setEndIndex(Math.min(sortedData.length, endIndex + noofrows));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Memotable;
