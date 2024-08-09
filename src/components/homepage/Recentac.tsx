import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
 const Recentac = () => {
    return (
        <div>
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell>Paid</TableCell>
                    <TableCell>Credit Card</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

        </div>
    );
 }
 
 export default Recentac;  