/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useData, ProfitAnalysis } from "@/context/DataContext";
import { useBranch } from "@/context/BranchContext";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  AlertCircle,
  Receipt,
} from "lucide-react";

// Enhanced color palette
const COLORS = {
  profit: ["#10B981", "#34D399", "#6EE7B7"], // Green gradient
  expense: ["#EF4444", "#F87171", "#FCA5A5"], // Red gradient
  revenue: ["#3B82F6", "#60A5FA", "#93C5FD"], // Blue gradient
  neutral: ["#6B7280", "#9CA3AF", "#D1D5DB"], // Gray gradient
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-semibold text-gray-900">{data.name}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: data.color }}>
           {data.value.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          {(
            (data.value /
              payload.reduce((sum: number, item: any) => sum + item.value, 0)) *
            100
          ).toFixed(2)}
          % of total
        </p>
      </div>
    );
  }
  return null;
};

const ProfitMetricCard = ({
  title,
  value,
  percentage,
  isPositive,
  icon: Icon,
  description,
}: any) => (
  <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      <Icon
        className={`h-4 w-4 ${isPositive ? "text-green-500" : "text-red-500"}`}
      />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-900">
        {Math.abs(value).toLocaleString()}
      </span>
      {percentage !== null && (
        <span
          className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {isPositive ? "+" : ""}
          {typeof percentage === 'number' ? percentage.toFixed(2) : percentage}%
        </span>
      )}
    </div>
    {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
  </div>
);

export function NetProfitPieChart() {
  const { getProfitAnalysis } = useData();
  const { currentBranch } = useBranch();
  const [profitData, setProfitData] = useState<ProfitAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBranch) {
      setLoading(true);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      try {
        const analysis = await getProfitAnalysis(
          currentBranch.id,
          startDate,
          now,
          true
        );
        setProfitData(analysis);
      } catch (error) {
        console.error("Failed to fetch profit analysis:", error);
        setProfitData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBranch, getProfitAnalysis]);

  // Enhanced chart data with correct properties from your ProfitAnalysis type
  const chartData = profitData
    ? [
        {
          name: "Net Profit",
          value: Math.max(profitData.profit.netProfit, 0),
          color: COLORS.profit[0],
          description: "Revenue after all expenses",
        },
        {
          name: "Total Revenue",
          value: profitData.revenue.totalRevenue,
          color: COLORS.revenue[0],
          description: "Total sales revenue",
        },
        {
          name: "Total Expense",
          value: profitData.costs.totalExpenses,
          color: COLORS.expense[0],
          description: "Operating costs and expenses",
        },
      ].filter((item) => item.value > 0)
    : []; // Filter out zero values

  const totalForPercentage = chartData.reduce(
    (acc, entry) => acc + entry.value,
    0
  );
  const netProfit = profitData?.profit.netProfit || 0;
  const profitMargin = profitData?.profit.netProfitMargin || 0;
  const grossProfit = profitData?.profit.grossProfit || 0;
  const grossProfitMargin = profitData?.profit.grossProfitMargin || 0;
  const totalRevenue = profitData?.revenue.totalRevenue || 0;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profitData || chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-orange-50/30 border-orange-200/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-gray-800">Monthly Financials</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PieChartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Financial Data
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              No financial data available for the selected period.
              {!currentBranch &&
                " Please select a branch to view financial insights."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-emerald-50/20 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <PieChartIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-gray-800">
                Financial Overview
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Profit & revenue breakdown for{" "}
                {currentBranch?.name || "selected branch"}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full ${netProfit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            <div className="flex items-center gap-1 text-sm font-medium">
              {netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {profitMargin > 0 ? "+" : ""}
              {profitMargin.toFixed(2)}% Margin
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Chart */}
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => {
                  if (value === 0 || totalForPercentage === 0) return null;
                  const percentage = (value / totalForPercentage) * 100;
                  return `${name}\n${percentage.toFixed(2)}%`;
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry: any) => (
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <ProfitMetricCard
            title="Net Profit"
            value={netProfit}
            percentage={profitMargin}
            isPositive={netProfit >= 0}
            icon={netProfit >= 0 ? TrendingUp : TrendingDown}
            description="After all expenses"
          />
          <ProfitMetricCard
            title="Gross Profit"
            value={grossProfit}
            percentage={grossProfitMargin}
            isPositive={grossProfit >= 0}
            icon={DollarSign}
            description="Before operating expenses"
          />
          <ProfitMetricCard
            title="Total Revenue"
            value={totalRevenue}
            percentage={null}
            isPositive={true}
            icon={Receipt}
            description="Total sales"
          />
          <ProfitMetricCard
            title="Total Expenses"
            value={profitData.costs.totalExpenses}
            percentage={null}
            isPositive={false}
            icon={TrendingDown}
            description="Operating costs"
          />
        </div>

        {/* Additional Financial Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-700 font-medium">
              Financial Health Score
            </span>
            <span
              className={`font-semibold ${
                profitMargin > 20
                  ? "text-green-600"
                  : profitMargin > 10
                    ? "text-yellow-600"
                    : profitMargin > 0
                      ? "text-orange-600"
                      : "text-red-600"
              }`}
            >
              {profitMargin > 20
                ? "Excellent"
                : profitMargin > 10
                  ? "Good"
                  : profitMargin > 0
                    ? "Fair"
                    : "Poor"}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(Math.max(profitMargin, 0), 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Avg. Sale</p>
            <p className="text-sm font-semibold text-gray-900">
              {Math.floor(
                profitData.revenue.averageSaleValue || 0
              ).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">COGS</p>
            <p className="text-sm font-semibold text-gray-900">
              {Math.floor(profitData.costs.totalCOGS || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Op. Expenses</p>
            <p className="text-sm font-semibold text-gray-900">
               {Math.floor(
                profitData.costs.operatingExpenses || 0
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}