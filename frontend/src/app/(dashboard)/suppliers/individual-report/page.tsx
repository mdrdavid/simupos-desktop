/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  FileType,
  Loader2,
} from "lucide-react";
import { useSupplier } from "@/context/SupplierContext";
import type { Supplier } from "@/src/types/supplier";
import { SupplierReport } from "@/src/types/supplier";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface ReportData {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  suspendedSuppliers: number;
  totalOutstanding: number;
  avgPaymentTerms: number;
  suppliersByCategory: Record<string, number>;
  topSuppliersByOutstanding: Supplier[];
  recentlyAdded: Supplier[];
  paymentTermsDistribution: Record<string, number>;
}

export default function SupplierReportsPage() {
  const router = useRouter();
  const { suppliers, getSupplierReport } = useSupplier();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [reportData, setReportData] = useState<SupplierReport | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedSupplier) {
      toast({
        title: "No Supplier Selected",
        description: "Please select a supplier to generate a report.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await getSupplierReport(selectedSupplier);
      setReportData(data);
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    if (!selectedSupplier) {
      toast({
        title: "No Supplier Selected",
        description: "Please select a supplier first before exporting.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const headers = await getAuthHeaders();
      // Fetch the exported file directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/suppliers/supplier/${selectedSupplier}/report/export?format=${format}`,
        {
          headers: headers,
        }
      );

      // Get the blob from the response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      let filename = `supplier-report-${selectedSupplier}`;
      switch (format) {
        case "csv":
          filename += ".csv";
          break;
        case "pdf":
          filename += ".pdf";
          break;
        case "excel":
          filename += ".xlsx";
          break;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };
  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
      }).format(0);
    }

    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Report</h1>
        {reportData && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileType className="w-4 h-4" />
              )}
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("excel")}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              PDF
            </Button>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Supplier</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading report...</span>
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{reportData.supplier.name} - Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">Total Purchases</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalPurchases)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">Total Paid</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalPaid)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">Outstanding Balance</h3>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(reportData.summary.outstandingBalance)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">Total Orders</h3>
                <p className="text-2xl font-bold">
                  {reportData.summary.totalOrders}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({reportData.orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reportData.orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No orders found
                    </p>
                  ) : (
                    reportData.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border-b p-4 hover:bg-muted/50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.date)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Total:{" "}
                            </span>
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Paid:{" "}
                            </span>
                            {formatCurrency(order.amountPaid)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payments ({reportData.payments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reportData.payments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No payments found
                    </p>
                  ) : (
                    reportData.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border-b p-4 hover:bg-muted/50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{payment.reference}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(payment.date)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Method: {payment.paymentMethod}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
