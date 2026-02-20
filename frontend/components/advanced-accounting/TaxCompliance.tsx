import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdvancedAccounting } from "@/context/AdvancedAccountingContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const mockVatTransactions = [
  { id: "VAT001", date: "2023-10-01", amount: 18000, type: "Output VAT" },
  { id: "VAT002", date: "2023-10-05", amount: 12000, type: "Input VAT" },
  { id: "VAT003", date: "2023-10-15", amount: 25000, type: "Output VAT" },
];

export default function TaxCompliance() {
  const { submitToEFRIS, loading } = useAdvancedAccounting();
  const [transactionId, setTransactionId] = useState("");

  const handleSubmitEFRIS = async () => {
    if (!transactionId) return;
    try {
        await submitToEFRIS(transactionId);
        toast({ title: "Submitted to EFRIS", description: "Transaction successfully submitted." });
    } catch (error) {
      console.error("EFRIS submission error:", error);
        toast({ title: "Error", description: "Failed to submit to EFRIS", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Compliance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">VAT Tracking</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount (UGX)</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVatTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.amount.toLocaleString()}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">EFRIS Integration (Uganda)</h3>
          <div className="p-4 border rounded-md space-y-4">
            <p>Submit a transaction to EFRIS for an e-invoice.</p>
            <div className="flex items-center space-x-2">
                <Label htmlFor="efris-tx-id" className="min-w-fit">Transaction ID:</Label>
                <Input id="efris-tx-id" placeholder="Enter Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                <Button onClick={handleSubmitEFRIS} disabled={loading}>Submit to EFRIS</Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Tax Reports</h3>
          <div className="flex items-center space-x-2">
            <p>Export your tax data for compliance reporting.</p>
            <Button variant="outline">Export Tax Report (PDF)</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}