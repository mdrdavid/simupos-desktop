/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useWashingBay } from "@/context/WashingBayContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { WorkerAnalytics } from "@/src/types/washingBay";

export default function WorkerPerformancePage() {
  const {
    workerPerformanceAnalytics,
    fetchWorkerPerformanceAnalytics,
    workers,
    loading,
  } = useWashingBay();

  const [filters, setFilters] = useState({
    period: "month" as "day" | "week" | "month" | "custom",
    startDate: "",
    endDate: "",
    workerId: "",
  });

  useEffect(() => {
    fetchWorkerPerformanceAnalytics();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchWorkerPerformanceAnalytics(newFilters);
  };

  const handleExport = () => {
    // Simple CSV export functionality
    if (!workerPerformanceAnalytics) return;

    const headers = [
      "Worker Name",
      "Employee ID",
      "Total Orders",
      "Completed Orders",
      "Completion Rate",
      "Total Revenue",
      "Total Profit",
      "Average Order Value",
      "Total Commission",
      "Paid Commission",
      "Pending Commission",
      "Commission Efficiency",
    ];

    const data = workerPerformanceAnalytics.workerAnalytics.map((worker) => [
      worker.worker.name,
      worker.worker.employeeId || "N/A",
      worker.statistics.totalOrders,
      worker.statistics.completedOrders,
      `${worker.statistics.completionRate}%`,
      worker.statistics.totalRevenue,
      worker.statistics.totalProfit,
      worker.statistics.averageOrderValue,
      worker.statistics.totalCommission,
      worker.statistics.paidCommission,
      worker.statistics.pendingCommission,
      `${worker.statistics.commissionEfficiency.toFixed(2)}%`,
    ]);

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worker-performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !workerPerformanceAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading worker performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Worker Performance Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track and analyze worker performance metrics
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Period
                  </label>
                  <Select
                    value={filters.period}
                    onValueChange={(value: any) =>
                      handleFilterChange("period", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.period === "custom" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Worker
                  </label>
                  <Select
                    value={filters.workerId || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "workerId",
                        value === "all" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Workers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workers</SelectItem>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Summary */}
        {workerPerformanceAnalytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Branch Summary
                <Badge variant="secondary" className="ml-2">
                  {workerPerformanceAnalytics.summary.period.type.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      workerPerformanceAnalytics.summary.branchStatistics
                        .totalWorkers
                    }
                  </p>
                  <p className="text-sm text-gray-600">Active Workers</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      workerPerformanceAnalytics.summary.branchStatistics
                        .completedOrders
                    }
                  </p>
                  <p className="text-sm text-gray-600">Completed Orders</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      workerPerformanceAnalytics.summary.branchStatistics
                        .totalRevenue
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {workerPerformanceAnalytics.summary.branchStatistics.completionRate.toFixed(
                      1
                    )}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Worker Performance Grid */}
        {workerPerformanceAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workerPerformanceAnalytics.workerAnalytics.map(
              (workerAnalytic) => (
                <WorkerPerformanceCard
                  key={workerAnalytic.worker.id}
                  workerAnalytic={workerAnalytic}
                />
              )
            )}
          </div>
        )}

        {workerPerformanceAnalytics?.workerAnalytics.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                No worker performance data found for the selected filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Worker Performance Card Component
function WorkerPerformanceCard({
  workerAnalytic,
}: {
  workerAnalytic: WorkerAnalytics;
}) {
  const { worker, statistics } = workerAnalytic;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{worker.name}</CardTitle>
          <Badge
            variant={worker.isActive ? "default" : "secondary"}
            className={worker.isActive ? "bg-green-100 text-green-800" : ""}
          >
            {worker.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        {worker.employeeId && (
          <p className="text-sm text-gray-600">ID: {worker.employeeId}</p>
        )}
        <p className="text-sm text-gray-600">
          {worker.commissionType === "percentage"
            ? `${worker.commissionValue}% commission`
            : `${formatCurrency(worker.commissionValue)} fixed`}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-lg font-bold text-gray-900">
              {statistics.totalOrders}
            </p>
            <p className="text-xs text-gray-600">Total Orders</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-lg font-bold text-gray-900">
              {statistics.completedOrders}
            </p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium">
              {statistics.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(statistics.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Revenue
            </span>
            <span className="font-medium">
              {formatCurrency(statistics.totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Profit
            </span>
            <span className="font-medium">
              {formatCurrency(statistics.totalProfit)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Avg. Order
            </span>
            <span className="font-medium">
              {formatCurrency(statistics.averageOrderValue)}
            </span>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Commission</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(statistics.totalCommission)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Paid
            </span>
            <span className="font-medium text-green-600">
              {formatCurrency(statistics.paidCommission)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-600" />
              Pending
            </span>
            <span className="font-medium text-orange-600">
              {formatCurrency(statistics.pendingCommission)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Commission Efficiency</span>
            <span className="font-medium">
              {statistics.commissionEfficiency.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
