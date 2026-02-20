/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useClinic } from "@/context/ClinicContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  Stethoscope,
  Pill,
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  Download,
  Filter,
  BarChart4,
  PieChart,
  LineChart,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Printer,
  Share2,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format, subDays, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";

export default function ReportsPage() {
  const { stats, generateReport, visits, services, medicines } = useClinic();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("monthly");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate additional statistics
  const totalRevenue = visits.reduce((sum, visit) => sum + visit.total, 0);
  const averageVisitValue =
    visits.length > 0 ? totalRevenue / visits.length : 0;
  const totalServicesUsed = visits.reduce(
    (sum, visit) => sum + visit.services.length,
    0
  );
  const totalMedicinesDispensed = visits.reduce(
    (sum, visit) => sum + visit.medicines.length,
    0
  );

  // Calculate trends (mock data - replace with real calculations)
  const trends = {
    revenue: 12.5,
    patients: 8.2,
    visits: 5.7,
    services: 15.3,
  };

  const reportTypes = [
    {
      id: "revenue",
      title: "Revenue Reports",
      description: "Financial performance, payment analysis, and income trends",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      href: "/clinic/reports/revenue",
      metrics: [
        {
          label: "Total Revenue",
          value: `UGX ${totalRevenue.toLocaleString()}`,
        },
        {
          label: "Avg. Visit Value",
          value: `UGX ${Math.round(averageVisitValue).toLocaleString()}`,
        },
        { label: "Growth", value: `${trends.revenue}%`, trend: "up" as const },
      ],
    },
    {
      id: "services",
      title: "Service Reports",
      description:
        "Most popular services, performance metrics, and utilization",
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      href: "/clinic/reports/services",
      metrics: [
        { label: "Services Used", value: totalServicesUsed.toString() },
        {
          label: "Top Service",
          value: stats.topServices[0]?.service.name || "N/A",
        },
        { label: "Growth", value: `${trends.services}%`, trend: "up" as const },
      ],
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      description:
        "Medicine usage, stock levels, expiry tracking, and pharmacy analytics",
      icon: Pill,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      href: "/clinic/reports/inventory",
      metrics: [
        {
          label: "Medicines Dispensed",
          value: totalMedicinesDispensed.toString(),
        },
        { label: "Low Stock Items", value: stats.lowStockMedicines.toString() },
        {
          label: "Alerts",
          value: stats.lowStockMedicines > 0 ? "Action Needed" : "All Good",
        },
      ],
    },
    {
      id: "staff",
      title: "Staff Performance",
      description:
        "Individual staff metrics, productivity, and efficiency analysis",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      href: "/clinic/reports/staff",
      metrics: [
        { label: "Total Patients", value: stats.monthlyPatients.toString() },
        { label: "Today's Patients", value: stats.todayPatients.toString() },
        { label: "Growth", value: `${trends.patients}%`, trend: "up" as const },
      ],
    },
  ];

  const quickStats = [
    {
      title: "Total Revenue",
      value: `UGX ${totalRevenue.toLocaleString()}`,
      description: "All-time clinic revenue",
      icon: DollarSign,
      change: `${trends.revenue}%`,
      changeType: "positive" as const,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Active Visits",
      value: stats.activeVisits.toString(),
      description: "Currently ongoing visits",
      icon: Activity,
      change: "+3",
      changeType: "positive" as const,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockMedicines.toString(),
      description: "Items needing restock",
      icon: Pill,
      change: stats.lowStockMedicines > 0 ? "Action needed" : "All good",
      changeType:
        stats.lowStockMedicines > 0 ? "negative" : ("positive" as const),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Monthly Patients",
      value: stats.monthlyPatients.toString(),
      description: "Patients this month",
      icon: Users,
      change: `${trends.patients}%`,
      changeType: "positive" as const,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  const chartTypes = [
    { id: "bar", name: "Bar Chart", icon: BarChart4 },
    { id: "line", name: "Line Chart", icon: LineChart },
    { id: "pie", name: "Pie Chart", icon: PieChart },
  ];

  const handleGenerateReport = (
    type: "revenue" | "services" | "inventory" | "staff"
  ) => {
    const report = generateReport(
      type,
      selectedPeriod,
      dateRange?.from,
      dateRange?.to
    );
    // In a real app, this would trigger a download or display the report
    console.log("Generated report:", report);
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and performance analytics for your clinic
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className={`border-0 ${stat.bgColor} border-l-4 ${stat.borderColor}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              stat.changeType === "positive"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {stat.changeType === "positive" ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="flex items-center gap-2"
              >
                <Pill className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Configuration */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900 text-lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Report Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="period" className="text-sm font-semibold">
                    Time Period
                  </Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value: any) => setSelectedPeriod(value)}
                  >
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">📅 Daily</SelectItem>
                      <SelectItem value="weekly">📊 Weekly</SelectItem>
                      <SelectItem value="monthly">📈 Monthly</SelectItem>
                      <SelectItem value="custom">🎯 Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriod === "custom" && (
                  <div className="space-y-3">
                    <Label
                      htmlFor="date-range"
                      className="text-sm font-semibold"
                    >
                      Date Range
                    </Label>
                    <DatePickerWithRange
                      date={dateRange}
                      setDate={setDateRange}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="chart-type" className="text-sm font-semibold">
                    Chart Type
                  </Label>
                  <Select defaultValue="bar">
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((chart) => {
                        const Icon = chart.icon;
                        return (
                          <SelectItem key={chart.id} value={chart.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{chart.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 text-lg">
                  <Sparkles className="h-5 w-5 mr-2 inline" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/80 border-green-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Monthly Summary
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/80 border-green-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/80 border-green-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Report Settings
                </Button>
              </CardContent>
            </Card>

            {/* Date Range Summary */}
            <Card className="border-0 shadow-sm bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg">
                  <Clock className="h-5 w-5 mr-2 inline" />
                  Selected Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Current Date Range
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDateRange()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedPeriod === "custom"
                      ? "Custom selection"
                      : `${selectedPeriod} reports`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.id}
                    className={`border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${report.bgColor} border-l-4 ${report.borderColor}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${report.bgColor} border ${report.borderColor}`}
                        >
                          <Icon className={`h-6 w-6 ${report.color}`} />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {report.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {report.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {report.metrics.map((metric, index) => (
                              <div
                                key={index}
                                className="text-center p-2 bg-white/50 rounded-lg"
                              >
                                <p className="text-xs text-gray-500 mb-1">
                                  {metric.label}
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {metric.value}
                                  </p>
                                  {metric.trend && getTrendIcon(metric.trend)}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                            >
                              <Link href={report.href}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleGenerateReport(report.id as any)
                              }
                              className="bg-white hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity & Insights */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
                <CardTitle className="flex items-center text-purple-900">
                  <TrendingUp className="h-6 w-6 mr-3" />
                  Key Insights & Trends
                </CardTitle>
                <CardDescription>
                  Automated insights from your clinic data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Revenue Growth
                      </h4>
                      <p className="text-sm text-green-700">
                        Your clinic revenue has grown by {trends.revenue}%
                        compared to last month. Consider expanding popular
                        services to maintain this trend.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        Service Performance
                      </h4>
                      <p className="text-sm text-blue-700">
                        {stats.topServices[0]?.service.name ||
                          "General Consultation"}{" "}
                        is your most popular service. It accounts for{" "}
                        {Math.round(
                          ((stats.topServices[0]?.revenue || 0) /
                            totalRevenue) *
                            100
                        )}
                        % of total revenue.
                      </p>
                    </div>
                  </div>

                  {stats.lowStockMedicines > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Pill className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-800">
                          Inventory Alert
                        </h4>
                        <p className="text-sm text-orange-700">
                          You have {stats.lowStockMedicines} medicine(s) running
                          low on stock. Consider placing restock orders to avoid
                          service interruptions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Patient Flow
                      </h4>
                      <p className="text-sm text-gray-700">
                        Average of {Math.round(stats.monthlyPatients / 30)}{" "}
                        patients per day this month. Peak hours are between 9 AM
                        - 12 PM.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Options
                </CardTitle>
                <CardDescription>
                  Download comprehensive reports in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2 bg-white"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">PDF Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2 bg-white"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Excel Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2 bg-white"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">Share Dashboard</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
