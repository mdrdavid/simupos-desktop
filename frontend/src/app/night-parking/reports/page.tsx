/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNightParking } from "@/context/NightParkingContext";
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  Car,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { records, fetchRecords, getMonthlyRevenueReport } = useNightParking();
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch data
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Fetch monthly report when year/month changes
  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        const report = await getMonthlyRevenueReport(
          selectedYear,
          selectedMonth
        );
        setMonthlyReport(report);
      } catch (error) {
        console.error("Failed to fetch monthly report:", error);
      }
    };

    fetchMonthlyReport();
  }, [selectedYear, selectedMonth, getMonthlyRevenueReport]);

  // Filter records by date range
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.checkInTime);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    return recordDate >= startDate && recordDate <= endDate;
  });

  // Calculate statistics
  const calculateStats = () => {
    // Helper function to safely convert to number
    const safeNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };

    const totalRevenue = filteredRecords.reduce(
      (sum, record) => sum + safeNumber(record.totalAmount),
      0
    );
    const totalVehicles = filteredRecords.length;
    const parkedVehicles = filteredRecords.filter(
      (r) => r.status === "parked"
    ).length;
    const checkedOutVehicles = filteredRecords.filter(
      (r) => r.status === "checked_out"
    ).length;
    const averageRevenue = totalVehicles > 0 ? totalRevenue / totalVehicles : 0;

    // Vehicle type distribution
    const vehicleTypeCounts: Record<string, number> = {};
    filteredRecords.forEach((record) => {
      vehicleTypeCounts[record.vehicleType] =
        (vehicleTypeCounts[record.vehicleType] || 0) + 1;
    });

    // Revenue by vehicle type
    const revenueByVehicle: Record<string, number> = {};
    filteredRecords.forEach((record) => {
      const revenue = safeNumber(record.totalAmount);
      revenueByVehicle[record.vehicleType] =
        (revenueByVehicle[record.vehicleType] || 0) + revenue;
    });

    // Hourly distribution
    const hourlyDistribution = Array(24).fill(0);
    filteredRecords.forEach((record) => {
      const hour = new Date(record.checkInTime).getHours();
      hourlyDistribution[hour]++;
    });

    return {
      totalRevenue,
      totalVehicles,
      parkedVehicles,
      checkedOutVehicles,
      averageRevenue,
      vehicleTypeCounts,
      revenueByVehicle,
      hourlyDistribution,
    };
  };
  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportReport = () => {
    const reportData = {
      period: `${dateRange.start} to ${dateRange.end}`,
      totalRevenue: stats.totalRevenue,
      totalVehicles: stats.totalVehicles,
      vehicleTypes: stats.vehicleTypeCounts,
      revenueByVehicle: stats.revenueByVehicle,
      records: filteredRecords.map((r) => ({
        ticket: r.ticketNumber,
        licensePlate: r.licensePlate,
        vehicleType: r.vehicleType,
        checkIn: r.checkInTime,
        checkOut: r.checkOutTime,
        amount: r.totalAmount,
        status: r.status,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parking-report-${dateRange.start}-to-${dateRange.end}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Parking Reports & Analytics
                </h1>
              </div>
              <p className="text-gray-500">
                Generate insights and analytics from parking operations
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={exportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button
                onClick={() => {
                  setDateRange({
                    start: new Date().toISOString().split("T")[0],
                    end: new Date().toISOString().split("T")[0],
                  });
                  toast.success("Report period reset to today");
                }}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
            </div>
          </div>
        </div>

        {/* Report Controls */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="p-6">
            <Tabs value={reportType} onValueChange={setReportType}>
              <TabsList className="grid w-full md:w-auto grid-cols-3 bg-gray-100 mb-6">
                <TabsTrigger
                  value="daily"
                  className="data-[state=active]:bg-white"
                >
                  Daily Report
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="data-[state=active]:bg-white"
                >
                  Monthly Report
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="data-[state=active]:bg-white"
                >
                  Custom Report
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-gray-700">Report Date</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({
                          start: e.target.value,
                          end: e.target.value,
                        })
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setDateRange({
                          start: yesterday.toISOString().split("T")[0],
                          end: yesterday.toISOString().split("T")[0],
                        });
                      }}
                    >
                      Yesterday
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-700">Month</Label>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) =>
                        setSelectedMonth(parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {months.map((month, index) => (
                          <SelectItem
                            key={month}
                            value={(index + 1).toString()}
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700">Year</Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        const today = new Date();
                        setSelectedMonth(today.getMonth() + 1);
                        setSelectedYear(today.getFullYear());
                      }}
                    >
                      Current Month
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-700">Start Date</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">End Date</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date();
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        setDateRange({
                          start: lastWeek.toISOString().split("T")[0],
                          end: today.toISOString().split("T")[0],
                        });
                      }}
                    >
                      Last 7 Days
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-gray-500">Total Revenue</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.totalVehicles}
                </div>
                <div className="text-gray-500">Total Vehicles</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {formatCurrency(stats.averageRevenue)}
                </div>
                <div className="text-gray-500">Avg. per Vehicle</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {stats.parkedVehicles}
                </div>
                <div className="text-gray-500">Currently Parked</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Charts */}
          <div className="space-y-6">
            {/* Revenue Chart */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-brand-primary" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {stats.hourlyDistribution.map((count, hour) => (
                    <div
                      key={hour}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-brand-primary to-brand-secondary rounded-t-lg"
                        style={{
                          height: `${(count / Math.max(...stats.hourlyDistribution)) * 80}%`,
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-gray-500 text-sm italic">
                  Hourly vehicle check-ins ({filteredRecords.length} total)
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Type Distribution */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <Car className="h-5 w-5 text-brand-primary" />
                  Vehicle Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.vehicleTypeCounts).map(
                    ([type, count]) => {
                      const percentage = (count / stats.totalVehicles) * 100;
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium capitalize">
                              {type}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Revenue by Vehicle Type */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-brand-primary" />
                  Revenue by Vehicle Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.revenueByVehicle).map(
                    ([type, revenue]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              type === "car"
                                ? "bg-blue-50"
                                : type === "motorcycle"
                                  ? "bg-green-50"
                                  : "bg-purple-50"
                            }`}
                          >
                            <Car className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 capitalize">
                              {type}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stats.vehicleTypeCounts[type] || 0} vehicles
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(revenue)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {((revenue / stats.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Report (if viewing monthly) */}
            {reportType === "monthly" && monthlyReport && (
              <Card className="border-0 bg-white shadow-md">
                <CardHeader className="bg-brand-primary/5">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-brand-primary" />
                    {months[selectedMonth - 1]} {selectedYear} Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                      <span className="text-brand-primary font-medium">Total Revenue</span>
                      <span className="text-gray-900 font-bold">
                        {formatCurrency(monthlyReport.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-600">Total Vehicles</span>
                      <span className="text-gray-900 font-semibold">
                        {monthlyReport.totalVehicles || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-600">Average Daily</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(monthlyReport.averageDailyRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <span className="text-yellow-700">Peak Day</span>
                      <span className="text-gray-900 font-semibold">
                        {monthlyReport.peakDay || "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-brand-primary" />
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">Check-out Rate</div>
                    <div className="text-xl font-bold text-gray-900">
                      {stats.totalVehicles > 0
                        ? (
                            (stats.checkedOutVehicles / stats.totalVehicles) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">Avg. Stay</div>
                    <div className="text-xl font-bold text-gray-900">4.5h</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">Peak Hour</div>
                    <div className="text-xl font-bold text-gray-900">
                      {stats.hourlyDistribution.indexOf(
                        Math.max(...stats.hourlyDistribution)
                      )}
                      :00
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">Busiest Day</div>
                    <div className="text-xl font-bold text-gray-900">Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 bg-white shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-brand-primary" />
              Recent Activity ({filteredRecords.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Time
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Vehicle
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Type
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Amount
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 10).map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="text-gray-900 font-medium">
                          {new Date(record.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.checkInTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {record.licensePlate}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {record.ticketNumber}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-gray-100 text-gray-600">
                          {record.vehicleType}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(record.totalAmount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            record.status === "checked_out"
                              ? "bg-green-100 text-green-700"
                              : "bg-brand-primary/10 text-brand-primary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No records in selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
