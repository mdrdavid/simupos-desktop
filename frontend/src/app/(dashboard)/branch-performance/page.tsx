"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBranchPerformance } from "@/src/hooks/useBranchPerformance";
import { BranchPerformanceComparison } from "@/src/types/branch-performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "month" | "quarter" | "year" | "previous_year";

export default function BranchPerformancePage() {
  const { currentBusinessId } = useAuth();
  const businessId = currentBusinessId;
  const { loading, error, compareBranches } = useBranchPerformance(businessId);
  const [performanceData, setPerformanceData] =
    useState<BranchPerformanceComparison | null>(null);
  const [period, setPeriod] = useState<Period>("month");

  const fetchPerformanceData = useCallback(async () => {
    if (businessId) {
      const data = await compareBranches(period);
      setPerformanceData(data);
    }
  }, [businessId, period, compareBranches]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const renderSummaryCard = (
    title: string,
    value: string | number,
    branchName: string,
    icon: React.ReactNode
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{branchName}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Branch Performance Comparison
            </h1>
            <p className="text-gray-600">
              Analyze and compare the performance of your branches.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="previous_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchPerformanceData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <Card className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-red-600">
            An Error Occurred
          </h3>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <Button
            onClick={fetchPerformanceData}
            className="mt-4"
            variant="destructive"
          >
            Try Again
          </Button>
        </Card>
      ) : performanceData ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Summary for {performanceData.period}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {performanceData.summary.bestPerforming.map((item) =>
                renderSummaryCard(
                  item.metric,
                  item.metric === "Best Profit Margin"
                    ? `${item.value}%`
                    : item.value.toLocaleString(),
                  item.branchName,
                  item.metric === "Highest Revenue" ? (
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  )
                )
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Branch</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Items Sold</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                    <TableHead className="text-right">Profit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.branches.map((branch) => (
                    <TableRow key={branch.branchId}>
                      <TableCell className="font-medium">
                        {branch.branchName}
                      </TableCell>
                      <TableCell className="text-right">
                        {branch.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {branch.totalTransactions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {branch.totalItemsSold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {branch.totalExpenses.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {branch.netProfit.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          branch.profitMargin >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {branch.profitMargin.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="text-center p-8">
          <h3 className="text-lg font-medium">No Data Available</h3>
          <p className="mt-2 text-sm text-gray-600">
            There is no performance data to display for the selected period.
          </p>
        </Card>
      )}
    </div>
  );
}
