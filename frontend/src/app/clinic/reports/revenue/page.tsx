/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  DollarSign,
  CreditCard,
  Banknote,
} from "lucide-react";
import { addDays, format, subDays, eachDayOfInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import Link from "next/link";

export default function RevenueReportsPage() {
  const { visits, generateReport } = useClinic();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  // Generate revenue data (load asynchronously)
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>({
    totalRevenue: 0,
    totalVisits: 0,
    averagePerVisit: 0,
    paymentMethods: {},
  });

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      try {
        const report = await generateReport(
          "revenue",
          selectedPeriod,
          dateRange?.from,
          dateRange?.to
        );
        if (!mounted) return;
        setRevenueReport(report);
        setRevenueData(
          report?.data ?? {
            totalRevenue: 0,
            totalVisits: 0,
            averagePerVisit: 0,
            paymentMethods: {},
          }
        );
      } catch (error) {
        // keep defaults on error
        console.error("Failed to load revenue report", error);
      }
    }

    loadReport();

    return () => {
      mounted = false;
    };
  }, [generateReport, selectedPeriod, dateRange?.from, dateRange?.to]);

  // Generate daily revenue chart data
  const dailyRevenueData = eachDayOfInterval({
    start: dateRange?.from || subDays(new Date(), 30),
    end: dateRange?.to || new Date(),
  }).map((date) => {
    const dayVisits = visits.filter((visit) => {
      const visitDate = new Date(visit.createdAt);
      return (
        visitDate.toDateString() === date.toDateString() &&
        visit.status === "Completed"
      );
    });

    return {
      date: format(date, "MMM dd"),
      revenue: dayVisits.reduce((sum, visit) => sum + visit.total, 0),
      visits: dayVisits.length,
    };
  });

  // Payment method distribution
  const paymentMethodData = Object.entries(
    revenueData.paymentMethods || {}
  ).map(([method, amount]) => ({
    name: method,
    value: amount as number,
    percentage: (((amount as number) / revenueData.totalRevenue) * 100).toFixed(
      1
    ),
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-600">
            Financial performance and payment analysis
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

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  UGX {revenueData.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-xl font-bold text-blue-600">
                  {revenueData.totalVisits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg per Visit</p>
                <p className="text-xl font-bold text-purple-600">
                  UGX {Math.round(revenueData.averagePerVisit).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue Trend</CardTitle>
          <CardDescription>
            Revenue performance over the selected period
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
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-revenue)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>Revenue breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
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
            <CardTitle>Payment Method Details</CardTitle>
            <CardDescription>
              Detailed breakdown of payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethodData.map((method, index) => (
              <div
                key={method.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-600">
                      {method.percentage}% of total
                    </p>
                  </div>
                </div>
                <p className="font-semibold">
                  UGX {method.value.toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Insights</CardTitle>
          <CardDescription>
            Key performance indicators and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">
                  Peak Performance
                </h4>
              </div>
              <p className="text-sm text-green-700">
                Highest daily revenue: UGX{" "}
                {Math.max(
                  ...dailyRevenueData.map((d) => d.revenue)
                ).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Banknote className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">
                  Most Popular Payment
                </h4>
              </div>
              <p className="text-sm text-blue-700">
                {paymentMethodData.length > 0
                  ? paymentMethodData[0].name
                  : "N/A"}{" "}
                -{" "}
                {paymentMethodData.length > 0
                  ? paymentMethodData[0].percentage
                  : 0}
                % of payments
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Recommendations
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Consider promoting digital payment methods to reduce cash
                handling
              </li>
              <li>
                • Monitor daily revenue trends to identify peak service hours
              </li>
              <li>• Track average visit value to optimize service pricing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
