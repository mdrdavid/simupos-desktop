/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  Download,
  Stethoscope,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import Link from "next/link";

export default function ServiceReportsPage() {
  const { visits, services, generateReport } = useClinic();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");

  // Generate service report (loaded asynchronously)
  const [serviceReport, setServiceReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    async function loadReport() {
      setLoadingReport(true);
      try {
        const report = await generateReport(
          "services",
          selectedPeriod,
          dateRange?.from,
          dateRange?.to
        );
        if (!cancelled) setServiceReport(report);
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    }
    loadReport();
    return () => {
      cancelled = true;
    };
  }, [generateReport, selectedPeriod, dateRange?.from, dateRange?.to]);

  const serviceData = serviceReport?.data?.services || [];

  // Service category distribution
  const categoryStats = services.reduce(
    (acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryData = Object.entries(categoryStats).map(
    ([category, count]) => ({
      name: category,
      value: count,
      percentage: ((count / services.length) * 100).toFixed(1),
    })
  );

  // Top services chart data
  const topServicesChartData = serviceData.slice(0, 10).map((item: any) => ({
    name:
      item.service.name.length > 15
        ? item.service.name.substring(0, 15) + "..."
        : item.service.name,
    revenue: item.revenue,
    count: item.count,
    category: item.service.category,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const totalServiceRevenue = serviceData.reduce(
    (sum: any, item: any) => sum + item.revenue,
    0
  );
  const totalServiceCount = serviceData.reduce(
    (sum: any, item: any) => sum + item.count,
    0
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clinic/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
          <p className="text-gray-600">
            Service performance and popularity analysis
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select
                value={selectedPeriod}
                onValueChange={(value: any) => setSelectedPeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Service Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  UGX {totalServiceRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Services Provided</p>
                <p className="text-xl font-bold text-blue-600">
                  {totalServiceCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-xl font-bold text-purple-600">
                  {services.filter((s) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services by Revenue</CardTitle>
          <CardDescription>
            Most profitable services in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Categories</CardTitle>
            <CardDescription>
              Distribution of services by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-600">
                      {category.percentage}% of services
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{category.value} services</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Service List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance Details</CardTitle>
          <CardDescription>Complete breakdown of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceData.map((item: any, index: any) => (
              <div
                key={item.service.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{item.service.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline">{item.service.category}</Badge>
                      <span className="text-sm text-gray-600">
                        UGX {item.service.fee.toLocaleString()} per service
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    UGX {item.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.count} times provided
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Service Insights</CardTitle>
          <CardDescription>
            Key performance indicators and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Top Performer</h4>
              </div>
              <p className="text-sm text-green-700">
                {serviceData.length > 0 ? serviceData[0].service.name : "N/A"} -
                UGX{" "}
                {serviceData.length > 0
                  ? serviceData[0].revenue.toLocaleString()
                  : 0}{" "}
                revenue
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Most Popular</h4>
              </div>
              <p className="text-sm text-blue-700">
                {serviceData.length > 0
                  ? serviceData.sort((a: any, b: any) => b.count - a.count)[0]
                      ?.service.name
                  : "N/A"}{" "}
                -
                {serviceData.length > 0
                  ? serviceData.sort((a: any, b: any) => b.count - a.count)[0]
                      ?.count
                  : 0}{" "}
                times
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Recommendations
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Focus marketing efforts on high-revenue services</li>
              <li>• Consider bundling popular services for better value</li>
              <li>• Review pricing for underperforming services</li>
              <li>• Train staff on promoting profitable services</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
