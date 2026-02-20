"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function SalesChart() {
  const { weeklySales, loading, error } = useDashboardStats();

  const chartData =
    weeklySales?.map((sale) => ({
      name: new Date(sale.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      sales: sale.total,
      fullDate: new Date(sale.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    })) || [];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Overview
          </CardTitle>
          <p className="text-sm text-red-500 mt-1">
            Failed to load weekly sales data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-200">
        <div>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Sales Overview
          </CardTitle>
          <p className="text-sm text-blue-600 mt-1">Weekly sales performance</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +12.5%
        </Badge>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-blue-100"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                className="text-gray-500"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-gray-500"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `UGX ${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  `UGX ${value.toLocaleString()}`,
                  "Sales",
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Date: ${payload[0].payload.fullDate}`;
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="none"
                fill="url(#salesGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#4CAF50",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
