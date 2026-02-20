/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  Users,
  Car,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  BarChart,
  Activity,
  CreditCard,
  Package,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";

// Helper function to safely convert to number
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function ReportsPage() {
  const {
    getDailySummary,
    generateDailySummary,
    getProfitAnalytics,
    getWorkerCommissions,
    fetchWorkers,
    workers,
  } = useWashingBay();

  const [dateRange, setDateRange] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [commissions, setCommissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<
    "overview" | "daily" | "profit" | "commissions"
  >("overview");

  useEffect(() => {
    loadReports();
  }, [dateRange, selectedDate, activeTab]);

  const loadReports = async () => {
    try {
      setIsLoading(true);

      // Calculate date range for analytics
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Load data based on active tab
      switch (activeTab) {
        case "overview":
          await loadOverviewData(startDate, endDate);
          break;
        case "daily":
          await loadDailySummary();
          break;
        case "profit":
          await loadProfitAnalytics(startDate, endDate);
          break;
        case "commissions":
          await loadCommissionsData(startDate, endDate);
          break;
      }

      await fetchWorkers();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOverviewData = async (startDate: Date, endDate: Date) => {
    try {
      // Load daily summary for today
      const daily = await getDailySummary();
      setDailySummary(daily);

      // Load profit analytics
      const profitData = await getProfitAnalytics({
        period: dateRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setAnalytics(profitData);

      // Load commissions data
      const commissionsData = await getWorkerCommissions({
        period: dateRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setCommissions(commissionsData);
    } catch (error) {
      console.error("Error loading overview data:", error);
    }
  };

  const loadDailySummary = async () => {
    try {
      const summary = await getDailySummary(selectedDate);
      setDailySummary(summary);
    } catch (error) {
      console.error("Error loading daily summary:", error);
    }
  };

  const loadProfitAnalytics = async (startDate: Date, endDate: Date) => {
    try {
      const profitData = await getProfitAnalytics({
        period: dateRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setAnalytics(profitData);
    } catch (error) {
      console.error("Error loading profit analytics:", error);
    }
  };

  const loadCommissionsData = async (startDate: Date, endDate: Date) => {
    try {
      const commissionsData = await getWorkerCommissions({
        period: dateRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setCommissions(commissionsData);
    } catch (error) {
      console.error("Error loading commissions data:", error);
    }
  };

  const handleGenerateDailySummary = async () => {
    try {
      await generateDailySummary(selectedDate);
      await loadDailySummary(); // Reload the summary
    } catch (error) {
      console.error("Error generating daily summary:", error);
    }
  };

  const handleRefresh = async () => {
    await loadReports();
  };

  const formatCurrency = (amount: number) => {
    const safeAmount = safeNumber(amount);
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(safeAmount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-UG").format(safeNumber(num));
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "day":
        return "Today";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      default:
        return dateRange;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive washing bay performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: Activity },
            { id: "daily", name: "Daily Summary", icon: Calendar },
            { id: "profit", name: "Profit Analytics", icon: BarChart },
            { id: "commissions", name: "Commissions", icon: CreditCard },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Date Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="day">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {activeTab === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          )}
        </div>

        {activeTab === "daily" && (
          <Button onClick={handleGenerateDailySummary} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary?.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Today</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(dailySummary?.completedOrders || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNumber(dailySummary?.totalOrders || 0)} total
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Net Profit
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary?.totalNetProfit || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Today</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Unpaid Commissions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        commissions?.summary?.unpaidCommission || 0
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {commissions?.summary?.unpaidCount || 0} pending
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profit Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Profit Breakdown ({getDateRangeLabel()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.summary ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(analytics.summary.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3">
                      <span>Material Costs</span>
                      <span className="text-red-600">
                        -{formatCurrency(analytics.summary.totalMaterialCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Commission Costs</span>
                      <span className="text-red-600">
                        -{formatCurrency(analytics.summary.totalCommission)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 border-t border-gray-200">
                      <span className="font-bold">Net Profit</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(analytics.summary.totalNetProfit)}
                      </span>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {analytics.summary.orderCount} orders processed
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No profit data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Commission Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commissions?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            commissions.summary.paidCommission || 0
                          )}
                        </p>
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-xs text-gray-500">
                          {commissions.summary.paidCount || 0} commissions
                        </p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(
                            commissions.summary.unpaidCommission || 0
                          )}
                        </p>
                        <p className="text-sm text-gray-600">Unpaid</p>
                        <p className="text-xs text-gray-500">
                          {commissions.summary.unpaidCount || 0} pending
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Commission</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            commissions.summary.totalCommission || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Records</span>
                        <span>{commissions.summary.totalCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No commission data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Daily Summary Tab */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daily Summary - {selectedDate}</CardTitle>
              <Badge variant={dailySummary ? "default" : "secondary"}>
                {dailySummary ? "Generated" : "Not Generated"}
              </Badge>
            </CardHeader>
            <CardContent>
              {dailySummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(dailySummary.totalOrders)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dailySummary.completedOrders} completed
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(dailySummary.creditAmount)} in credit
                    </p>
                  </div>

                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Net Profit
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary.totalNetProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      After all costs
                    </p>
                  </div>

                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Material Costs
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary.totalMaterialCost)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Commission Costs
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dailySummary.totalCommission)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Credit Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(dailySummary.creditOrders)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(dailySummary.creditAmount)} total
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Summary Generated
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Generate a daily summary to view detailed insights for{" "}
                    {selectedDate}
                  </p>
                  <Button onClick={handleGenerateDailySummary}>
                    Generate Daily Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profit Analytics Tab */}
      {activeTab === "profit" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit Analytics - {getDateRangeLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(analytics.summary.totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(analytics.summary.totalNetProfit)}
                      </p>
                      <p className="text-sm text-gray-600">Net Profit</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(analytics.summary.totalCommission)}
                      </p>
                      <p className="text-sm text-gray-600">Commissions</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">
                        {analytics.summary.orderCount}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  {analytics.breakdown && analytics.breakdown.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Daily Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Date</th>
                              <th className="text-right py-2">Orders</th>
                              <th className="text-right py-2">Revenue</th>
                              <th className="text-right py-2">Profit</th>
                              <th className="text-right py-2">Margin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.breakdown.map((day: any) => (
                              <tr key={day.date} className="border-b">
                                <td className="py-2">
                                  {new Date(day.date).toLocaleDateString()}
                                </td>
                                <td className="text-right py-2">
                                  {day.orderCount}
                                </td>
                                <td className="text-right py-2">
                                  {formatCurrency(day.revenue)}
                                </td>
                                <td className="text-right py-2">
                                  {formatCurrency(day.netProfit)}
                                </td>
                                <td className="text-right py-2">
                                  {day.revenue > 0
                                    ? Math.round(
                                        (day.netProfit / day.revenue) * 100
                                      )
                                    : 0}
                                  %
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No profit analytics data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === "commissions" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Report - {getDateRangeLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(
                          commissions.summary?.paidCommission || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Paid Commissions</p>
                      <p className="text-xs text-gray-500">
                        {commissions.summary?.paidCount || 0} records
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(
                          commissions.summary?.unpaidCommission || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unpaid Commissions
                      </p>
                      <p className="text-xs text-gray-500">
                        {commissions.summary?.unpaidCount || 0} pending
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(
                          commissions.summary?.totalCommission || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Total Commission</p>
                      <p className="text-xs text-gray-500">
                        {commissions.summary?.totalCount || 0} total
                      </p>
                    </div>
                  </div>

                  {/* Worker Breakdown */}
                  {commissions.commissions &&
                    commissions.commissions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4">
                          Commission by Worker
                        </h3>
                        <div className="space-y-3">
                          {workers.map((worker) => {
                            const workerCommissions =
                              commissions.commissions.filter(
                                (c: any) => c.workerId === worker.id
                              );
                            const total = workerCommissions.reduce(
                              (sum: number, c: any) =>
                                sum + safeNumber(c.commissionAmount),
                              0
                            );
                            const unpaid = workerCommissions
                              .filter((c: any) => !c.isPaid)
                              .reduce(
                                (sum: number, c: any) =>
                                  sum + safeNumber(c.commissionAmount),
                                0
                              );

                            if (workerCommissions.length === 0) return null;

                            return (
                              <div
                                key={worker.id}
                                className="flex justify-between items-center p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{worker.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {workerCommissions.length} commissions
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {formatCurrency(total)}
                                  </p>
                                  {unpaid > 0 && (
                                    <p className="text-sm text-orange-600">
                                      {formatCurrency(unpaid)} unpaid
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No commission data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
