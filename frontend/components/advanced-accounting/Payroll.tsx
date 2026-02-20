/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdvancedAccounting } from "@/context/AdvancedAccountingContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const mockEmployees = [
  { id: "EMP001", name: "John Doe", salary: 3000000, deductions: 450000, netPay: 2550000 },
  { id: "EMP002", name: "Jane Smith", salary: 4500000, deductions: 675000, netPay: 3825000 },
];

export default function Payroll() {
  const { processPayroll, generatePayslip, loading } = useAdvancedAccounting();
  const { currentBranchId } = useAuth();
  const [payPeriod, setPayPeriod] = useState("");

  const handleRunPayroll = async () => {
    if (!currentBranchId || !payPeriod) return;
    try {
        await processPayroll({
            branchId: currentBranchId,
            payPeriod: new Date(payPeriod).toISOString(),
            employeeIds: [], // Process all if empty usually
        });
        toast({ title: "Payroll Processed", description: "The payroll run has been completed." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to process payroll.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Module</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Employee Salary Management</h3>
           <div className="flex items-center space-x-2 mb-4">
                <Input placeholder="Filter by employee name..." />
                <Button>Filter</Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add New Employee</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new employee.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" placeholder="e.g. John Doe" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="salary" className="text-right">Salary (UGX)</Label>
                                <Input id="salary" type="number" placeholder="e.g. 3000000" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">Save Employee</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gross Salary (UGX)</TableHead>
                <TableHead>Deductions (UGX)</TableHead>
                <TableHead>Net Pay (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.salary.toLocaleString()}</TableCell>
                  <TableCell>{emp.deductions.toLocaleString()}</TableCell>
                  <TableCell>{emp.netPay.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold mb-2">Payroll Run</h3>
          <div className="p-4 border rounded-md space-y-4">
            <p className="mb-2">Run payroll for the selected period for all active employees.</p>
            <div className="flex items-center space-x-2">
                <Input type="month" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} />
                <Button onClick={handleRunPayroll} disabled={loading}>Run Payroll</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold mb-2">Generate Pay Slips</h3>
             <div className="p-4 border rounded-md">
                <p className="mb-2">Generate a PDF pay slip for an employee.</p>
                <div className="flex items-center space-x-2">
                    <Input placeholder="Enter Employee ID" />
                    <Button variant="outline">Generate Pay Slip (PDF)</Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}