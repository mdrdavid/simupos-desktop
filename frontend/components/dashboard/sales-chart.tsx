"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

export function SalesChart() {
  const { dashboardData, loading, error } = useDashboard();

  const chartData =
    dashboardData?.weeklySales.map((sale) => ({
      name: new Date(sale.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      sales: sale.total,
    })) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Sales Overview</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Weekly sales performance
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <TrendingUp className="h-3 w-3 mr-1" />
          +12.5%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200"
              />
              <XAxis dataKey="name" className="text-gray-500" fontSize={12} />
              <YAxis
                className="text-gray-500"
                fontSize={12}
                tickFormatter={(value) =>
                  `UGX ${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  `UGX ${value.toLocaleString()}`,
                  "Sales",
                ]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#4CAF50", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
