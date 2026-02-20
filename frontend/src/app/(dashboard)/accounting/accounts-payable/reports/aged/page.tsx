/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { AgedPayables } from "@/src/types/accountsPayable";

export default function AgedPayablesReportPage() {
  const router = useRouter();
  const { getAgedPayables, getBills, loading } = useAccountsPayable();
  const [agedPayables, setAgedPayables] = useState<AgedPayables | null>(null);
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getAgedPayables(asOfDate);
      setAgedPayables(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load aged payables report.",
        variant: "destructive",
      });
    }
  }, [getAgedPayables, asOfDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [asOfDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAgeCategoryColor = (category: string) => {
    switch (category) {
      case "current":
        return "text-green-600 bg-green-100";
      case "30":
        return "text-blue-600 bg-blue-100";
      case "60":
        return "text-yellow-600 bg-yellow-100";
      case "90":
        return "text-orange-600 bg-orange-100";
      case "over90":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAgeCategoryIcon = (category: string) => {
    switch (category) {
      case "current":
        return <CheckCircle2 className="h-4 w-4" />;
      case "30":
      case "60":
        return <Clock className="h-4 w-4" />;
      case "90":
      case "over90":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your aged payables report is being prepared for download.",
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading aged payables report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/accounting/accounts-payable")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Aged Payables Report</h1>
            <p className="text-muted-foreground">
              Analysis of outstanding bills by aging period
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Report Date Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Report as of</h3>
              <p className="text-sm text-muted-foreground">
                Select the date for aging analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {agedPayables && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                label: "Current",
                value: agedPayables.current,
                category: "current",
                description: "Not yet due",
              },
              {
                label: "1-30 Days",
                value: agedPayables.days30,
                category: "30",
                description: "1-30 days overdue",
              },
              {
                label: "31-60 Days",
                value: agedPayables.days60,
                category: "60",
                description: "31-60 days overdue",
              },
              {
                label: "61-90 Days",
                value: agedPayables.days90,
                category: "90",
                description: "61-90 days overdue",
              },
              {
                label: "Over 90 Days",
                value: agedPayables.over90,
                category: "over90",
                description: "Over 90 days overdue",
              },
            ].map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center p-3 rounded-full mb-3 ${getAgeCategoryColor(item.category)}`}
                  >
                    {getAgeCategoryIcon(item.category)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formatCurrency(item.value)}
                  </div>
                  <p className="text-sm font-medium mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {((item.value / agedPayables.total) * 100).toFixed(1)}% of
                    total
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Total Outstanding</CardTitle>
              <CardDescription>As of {formatDate(asOfDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {formatCurrency(agedPayables.total)}
                </div>
                <p className="text-muted-foreground">
                  Total amount outstanding across{" "}
                  {agedPayables.agedBills.length} bills
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Aging Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Aging Analysis</CardTitle>
              <CardDescription>
                Breakdown of individual bills by aging category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="grid grid-cols-12 gap-4 p-4 border-b font-semibold text-sm bg-muted/50">
                  <div className="col-span-3">Bill Number</div>
                  <div className="col-span-3">Supplier</div>
                  <div className="col-span-2 text-right">Due Date</div>
                  <div className="col-span-1 text-right">Age</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>
                {agedPayables.agedBills.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      router.push(`/accounts-payable/bills/${item.bill.id}`)
                    }
                  >
                    <div className="col-span-3 font-medium">
                      {item.bill.billNumber}
                    </div>
                    <div className="col-span-3">
                      {item.bill.supplier?.name || "Unknown Supplier"}
                    </div>
                    <div className="col-span-2 text-right">
                      {formatDate(item.bill.dueDate)}
                    </div>
                    <div className="col-span-1 text-right">{item.age} days</div>
                    <div className="col-span-2 text-right font-semibold">
                      {formatCurrency(item.bill.balanceDue)}
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAgeCategoryColor(item.ageCategory)}`}
                      >
                        {item.ageCategory === "current"
                          ? "Current"
                          : item.ageCategory === "30"
                            ? "1-30"
                            : item.ageCategory === "60"
                              ? "31-60"
                              : item.ageCategory === "90"
                                ? "61-90"
                                : "90+"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aging Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of outstanding amounts by aging period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    label: "Current",
                    value: agedPayables.current,
                    color: "bg-green-500",
                    width: (agedPayables.current / agedPayables.total) * 100,
                  },
                  {
                    label: "1-30 Days",
                    value: agedPayables.days30,
                    color: "bg-blue-500",
                    width: (agedPayables.days30 / agedPayables.total) * 100,
                  },
                  {
                    label: "31-60 Days",
                    value: agedPayables.days60,
                    color: "bg-yellow-500",
                    width: (agedPayables.days60 / agedPayables.total) * 100,
                  },
                  {
                    label: "61-90 Days",
                    value: agedPayables.days90,
                    color: "bg-orange-500",
                    width: (agedPayables.days90 / agedPayables.total) * 100,
                  },
                  {
                    label: "Over 90 Days",
                    value: agedPayables.over90,
                    color: "bg-red-500",
                    width: (agedPayables.over90 / agedPayables.total) * 100,
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${item.color}`}></div>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex space-x-4">
                        <span className="font-medium">
                          {formatCurrency(item.value)}
                        </span>
                        <span className="text-muted-foreground w-12 text-right">
                          {item.width.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.width}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
