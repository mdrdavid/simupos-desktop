/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { useBusinessGrowth } from "@/src/hooks/useBusinessGrowth";
import { DashboardData, GrowthReport } from "@/src/types/business-growth";
import { formatCurrency } from "@/lib/utils";
import { CapitalTransactionForm } from "@/components/business-growth/CapitalTransactionForm";
import { CapitalTransactionsTable } from "@/components/business-growth/CapitalTransactionsTable";
import { FinancialYearSettingsForm } from "@/components/business-growth/FinancialYearSettingsForm";

type Period = "month" | "quarter" | "year";

// Color palette for charts.
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const BusinessGrowthPage = () => {
  const [period, setPeriod] = useState<Period>("month");
  const {
    loading,
    error,
    getDashboardData,
    getGrowthMetrics,
    getCapitalTransactions,
    getProfitLossTrendData,
    getCapitalMovementData,
    getExpenseBreakdownData,
    getBusinessValueComposition,
    getGrowthMetricsComparison,
    getCashFlowData,
    getPerformanceVsTargets,
    getKeyMetricsData,
  } = useBusinessGrowth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [reportData, setReportData] = useState<GrowthReport | null>(null);
  const [chartData, setChartData] = useState<{
    profitLossTrend: any[];
    capitalMovement: any[];
    expenseBreakdown: any[];
    businessValueComposition: any[];
    growthMetricsComparison: any[];
    cashFlow: any[];
    performanceVsTargets: any[];
    keyMetrics: any[];
  }>({
    profitLossTrend: [],
    capitalMovement: [],
    expenseBreakdown: [],
    businessValueComposition: [],
    growthMetricsComparison: [],
    cashFlow: [],
    performanceVsTargets: [],
    keyMetrics: [],
  });

  const [isExporting, setIsExporting] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const kpisRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  const fetchAllData = useCallback(async () => {
    setChartsLoading(true);
    try {
      const [
        dashboard,
        report,
        profitLossTrend,
        capitalMovement,
        expenseBreakdown,
        businessValueComposition,
        growthMetricsComparison,
        cashFlow,
        performanceVsTargets,
        keyMetrics,
      ] = await Promise.all([
        getDashboardData(),
        getGrowthMetrics(period, new Date()),
        getProfitLossTrendData(),
        getCapitalMovementData(),
        getExpenseBreakdownData(),
        getBusinessValueComposition(),
        getGrowthMetricsComparison(period),
        getCashFlowData(),
        getPerformanceVsTargets(),
        getKeyMetricsData(),
      ]);

      if (dashboard) setDashboardData(dashboard);
      if (report) setReportData(report);

      setChartData({
        profitLossTrend: profitLossTrend || [],
        capitalMovement: capitalMovement || [],
        expenseBreakdown: expenseBreakdown || [],
        businessValueComposition: businessValueComposition || [],
        growthMetricsComparison: growthMetricsComparison || [],
        cashFlow: cashFlow || [],
        performanceVsTargets: performanceVsTargets || [],
        keyMetrics: keyMetrics || [],
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setChartsLoading(false);
    }
  }, [
    getDashboardData,
    getGrowthMetrics,
    getProfitLossTrendData,
    getCapitalMovementData,
    getExpenseBreakdownData,
    getBusinessValueComposition,
    getGrowthMetricsComparison,
    getCashFlowData,
    getPerformanceVsTargets,
    getKeyMetricsData,
    period,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSuccess = () => {
    fetchAllData();
  };

  const handleExport = async () => {
    if (!dashboardData || !reportData) return;
    setIsExporting(true);

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("Business Growth Report", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(
      `Report Date: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      28,
      {
        align: "center",
      }
    );

    let yPos = 40;

    if (kpisRef.current) {
      const canvas = await html2canvas(kpisRef.current, { scale: 2 } as any);
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(
        imgData,
        "PNG",
        (pageWidth - imgWidth) / 2,
        yPos,
        imgWidth,
        imgHeight
      );
      yPos += imgHeight + 10;
    }

    if (chartsRef.current) {
      const canvas = await html2canvas(chartsRef.current, { scale: 2 } as any);
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (yPos + imgHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }
      doc.addImage(
        imgData,
        "PNG",
        (pageWidth - imgWidth) / 2,
        yPos,
        imgWidth,
        imgHeight
      );
      yPos += imgHeight + 10;
    }

    const transactionsResponse = await getCapitalTransactions({
      page: 1,
      limit: 1000,
    });
    const transactions = transactionsResponse?.transactions || [];

    if (transactions.length > 0) {
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.text("Capital Transactions", 14, yPos);
      yPos += 10;

      (doc as any).autoTable({
        startY: yPos,
        head: [["Date", "Type", "Amount", "Details"]],
        body: transactions.map((tx) => [
          new Date(tx.date).toLocaleDateString(),
          tx.type,
          formatCurrency(tx.amount),
          tx.source || tx.reason || tx.notes || "N/A",
        ]),
        theme: "striped",
        headStyles: { fillColor: [34, 139, 34] },
      });
    }

    doc.save("business-growth-report.pdf");
    setIsExporting(false);
  };

  const lineChartData = reportData
    ? [
        {
          name: "Previous",
          value: reportData.comparison?.previousPeriod.businessValue || 0,
        },
        { name: "Current", value: reportData.metrics.businessValue },
      ]
    : [];

  const barChartData = reportData
    ? [
        {
          name: "Capital",
          value: reportData.metrics.netCapital,
          fill: "#8884d8",
        },
        {
          name: "Profit",
          value: reportData.metrics.netProfit,
          fill: "#82ca9d",
        },
      ]
    : [];

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-600">{error}</p>
        <Button onClick={fetchAllData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          Business Growth & Capital Tracking
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <CapitalTransactionForm onSuccess={handleSuccess} />
          <FinancialYearSettingsForm onSuccess={handleSuccess} />
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div
        ref={kpisRef}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.kpis.netCapital || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.comparison?.capital !== undefined && (
                <span
                  className={
                    dashboardData.comparison.capital >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData.comparison.capital >= 0 ? "+" : ""}
                  {formatCurrency(dashboardData.comparison.capital)} from last
                  month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(dashboardData?.kpis.netProfit || 0) < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatCurrency(dashboardData?.kpis.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.comparison?.profit !== undefined && (
                <span
                  className={
                    dashboardData.comparison.profit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData.comparison.profit >= 0 ? "+" : ""}
                  {formatCurrency(dashboardData.comparison.profit)} from last
                  month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Business Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.kpis.businessValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.comparison?.businessValue !== undefined && (
                <span
                  className={
                    dashboardData.comparison.businessValue >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData.comparison.businessValue >= 0 ? "+" : ""}
                  {formatCurrency(dashboardData.comparison.businessValue)} from
                  last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(dashboardData?.kpis.growthPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {(dashboardData?.kpis.growthPercentage || 0) >= 0 ? "+" : ""}
              {(dashboardData?.kpis.growthPercentage || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center sm:justify-end gap-2 mb-6">
        <Button
          variant={period === "month" ? "default" : "outline"}
          onClick={() => setPeriod("month")}
        >
          Monthly
        </Button>
        <Button
          variant={period === "quarter" ? "default" : "outline"}
          onClick={() => setPeriod("quarter")}
        >
          Quarterly
        </Button>
        <Button
          variant={period === "year" ? "default" : "outline"}
          onClick={() => setPeriod("year")}
        >
          Annual
        </Button>
      </div>

      {/* Charts Loading Indicator */}
      {chartsLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading charts...</span>
        </div>
      )}

      {/* Charts */}
      <div ref={chartsRef} className="space-y-6">
        {/* First Row - 2 charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Value Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capital vs Profit Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - 2 charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: "Revenue",
                      value: reportData?.metrics.totalSales || 0,
                      fill: "#8884d8",
                    },
                    {
                      name: "Expenses",
                      value: Math.abs(reportData?.metrics.totalExpenses || 0),
                      fill: "#ff8042",
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit & Loss Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.profitLossTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#8884d8"
                    name="Net Profit/Loss"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ff8042"
                    name="Expenses"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - 2 charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Capital Movement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.capitalMovement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="injections"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Capital Injections"
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    stackId="1"
                    stroke="#ff8042"
                    fill="#ff8042"
                    name="Capital Withdrawals"
                  />
                  <Line
                    type="monotone"
                    dataKey="netCapital"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="Net Capital"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.expenseBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row - 2 charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.growthMetricsComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="current" fill="#8884d8" name="Current Period" />
                  <Bar
                    dataKey="previous"
                    fill="#82ca9d"
                    name="Previous Period"
                  />
                  <Bar dataKey="target" fill="#ff8042" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="inflows" fill="#82ca9d" name="Cash Inflows" />
                  <Bar dataKey="outflows" fill="#ff8042" name="Cash Outflows" />
                  <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Net Cash Flow"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fifth Row - Performance vs Target Chart */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.performanceVsTargets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value as number)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="actual" fill="#8884d8" name="Actual" />
                  <Bar dataKey="target" fill="#82ca9d" name="Target" />
                  <Bar dataKey="variance" fill="#ff8042" name="Variance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {chartData.keyMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.name}
                </CardTitle>
                {metric.name === "Revenue" && (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
                {metric.name === "Expenses" && (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                )}
                {metric.name === "Profit Margin" && (
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                )}
                {metric.name === "Growth Rate" && (
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="h-[40px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.trend}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={metric.trendColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-6">
        <CapitalTransactionsTable />
      </div>
    </div>
  );
};

export default BusinessGrowthPage;

// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";
// import { useState, useEffect, useCallback, useRef } from "react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import html2canvas from "html2canvas";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ComposedChart,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
// } from "recharts";
// import { Download, Loader2, AlertCircle, TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3, Target, Calendar } from "lucide-react";
// import { useBusinessGrowth } from "@/src/hooks/useBusinessGrowth";
// import { DashboardData, GrowthReport } from "@/src/types/business-growth";
// import { formatCurrency } from "@/lib/utils";
// import { CapitalTransactionForm } from "@/components/business-growth/CapitalTransactionForm";
// import { CapitalTransactionsTable } from "@/components/business-growth/CapitalTransactionsTable";
// import { FinancialYearSettingsForm } from "@/components/business-growth/FinancialYearSettingsForm";

// type Period = "month" | "quarter" | "year";

// // Color palette for charts
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// // Sample data structures - Replace with actual data from your API
// const profitLossData = [
//   { month: "Jul", revenue: 0, expenses: 0, profit: 0 },
//   { month: "Aug", revenue: 155000, expenses: 1500000, profit: -1345000 },
//   { month: "Sep", revenue: 0, expenses: 1000000.03, profit: -1000000.03 },
// ];

// const expenseCategories = [
//   { name: "Salaries", value: 500000 },
//   { name: "Rent", value: 300000 },
//   { name: "Utilities", value: 100000 },
//   { name: "Marketing", value: 100000.03 },
// ];

// const businessValueComposition = [
//   { name: "Net Capital", value: 10000000 },
//   { name: "Retained Earnings", value: -1000000.03 },
// ];

// const capitalMovementData = [
//   { period: "Jul", injections: 0, withdrawals: 0, netCapital: 10000000 },
//   { period: "Aug", injections: 0, withdrawals: 0, netCapital: 10000000 },
//   { period: "Sep", injections: 0, withdrawals: 0, netCapital: 10000000 },
// ];

// const growthComparisonData = [
//   { metric: "Revenue Growth", current: 0, previous: 0, target: 10 },
//   { metric: "Profit Growth", current: -10, previous: -13.45, target: 5 },
//   { metric: "Business Value", current: 3.99, previous: 0, target: 8 },
// ];

// const cashFlowData = [
//   { period: "Jul", inflows: 0, outflows: 0, netCashFlow: 0 },
//   { period: "Aug", inflows: 155000, outflows: 1500000, netCashFlow: -1345000 },
//   { period: "Sep", inflows: 0, outflows: 1000000.03, netCashFlow: -1000000.03 },
// ];

// // Add the missing performanceData
// const performanceData = [
//   { metric: "Revenue", actual: 0, target: 500000, variance: -500000 },
//   { metric: "Profit", actual: -1000000.03, target: 200000, variance: -1200000.03 },
//   { metric: "Business Value", actual: 8999999.97, target: 10500000, variance: -1500000.03 },
//   { metric: "Growth Rate", actual: 3.99, target: 5, variance: -1.01 },
// ];

// const keyMetrics = [
//   {
//     name: "Revenue",
//     value: formatCurrency(0),
//     trend: [{ value: 0 }, { value: 155000 }, { value: 0 }],
//     trendColor: "#82ca9d",
//     icon: DollarSign,
//   },
//   {
//     name: "Expenses",
//     value: formatCurrency(1000000.03),
//     trend: [{ value: 0 }, { value: 1500000 }, { value: 1000000.03 }],
//     trendColor: "#ff8042",
//     icon: TrendingUp,
//   },
//   {
//     name: "Profit Margin",
//     value: "-100%",
//     trend: [{ value: 0 }, { value: -87 }, { value: -100 }],
//     trendColor: "#ff8042",
//     icon: PieChartIcon,
//   },
//   {
//     name: "Growth Rate",
//     value: "+3.99%",
//     trend: [{ value: 0 }, { value: 0 }, { value: 3.99 }],
//     trendColor: "#8884d8",
//     icon: BarChart3,
//   },
// ];

// // Add any other missing data variables
// const businessMetrics = [
//   { name: "ROI", value: -10, target: 15 },
//   { name: "Profit Margin", value: -100, target: 20 },
//   { name: "Revenue Growth", value: 0, target: 25 },
// ];

// const BusinessGrowthPage = () => {
//   const [period, setPeriod] = useState<Period>("month");
//   const {
//     loading,
//     error,
//     getDashboardData,
//     getGrowthMetrics,
//     getCapitalTransactions,
//   } = useBusinessGrowth();
//   const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
//   const [reportData, setReportData] = useState<GrowthReport | null>(null);
//   const [isExporting, setIsExporting] = useState(false);
//   const kpisRef = useRef<HTMLDivElement>(null);
//   const chartsRef = useRef<HTMLDivElement>(null);

//   const fetchData = useCallback(async () => {
//     const [dashboard, report] = await Promise.all([
//       getDashboardData(),
//       getGrowthMetrics(period, new Date()),
//     ]);
//     if (dashboard) setDashboardData(dashboard);
//     if (report) setReportData(report);
//   }, [getDashboardData, getGrowthMetrics, period]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleSuccess = () => {
//     fetchData();
//   };

//   const handleExport = async () => {
//     if (!dashboardData || !reportData) return;
//     setIsExporting(true);

//     const doc = new jsPDF("p", "mm", "a4");
//     const pageWidth = doc.internal.pageSize.getWidth();

//     doc.setFontSize(20);
//     doc.text("Business Growth Report", pageWidth / 2, 20, { align: "center" });
//     doc.setFontSize(12);
//     doc.text(
//       `Report Date: ${new Date().toLocaleDateString()}`,
//       pageWidth / 2,
//       28,
//       {
//         align: "center",
//       }
//     );

//     let yPos = 40;

//     if (kpisRef.current) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const canvas = await html2canvas(kpisRef.current, { scale: 2 } as any);
//       const imgData = canvas.toDataURL("image/png");
//       const imgWidth = 180;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       doc.addImage(
//         imgData,
//         "PNG",
//         (pageWidth - imgWidth) / 2,
//         yPos,
//         imgWidth,
//         imgHeight
//       );
//       yPos += imgHeight + 10;
//     }

//     if (chartsRef.current) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const canvas = await html2canvas(chartsRef.current, { scale: 2 } as any);
//       const imgData = canvas.toDataURL("image/png");
//       const imgWidth = 180;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       if (yPos + imgHeight > doc.internal.pageSize.getHeight() - 20) {
//         doc.addPage();
//         yPos = 20;
//       }
//       doc.addImage(
//         imgData,
//         "PNG",
//         (pageWidth - imgWidth) / 2,
//         yPos,
//         imgWidth,
//         imgHeight
//       );
//       yPos += imgHeight + 10;
//     }

//     const transactionsResponse = await getCapitalTransactions({
//       page: 1,
//       limit: 1000,
//     });
//     const transactions = transactionsResponse?.transactions || [];

//     if (transactions.length > 0) {
//       if (yPos > doc.internal.pageSize.getHeight() - 40) {
//         doc.addPage();
//         yPos = 20;
//       }
//       doc.setFontSize(16);
//       doc.text("Capital Transactions", 14, yPos);
//       yPos += 10;

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       (doc as any).autoTable({
//         startY: yPos,
//         head: [["Date", "Type", "Amount", "Details"]],
//         body: transactions.map((tx) => [
//           new Date(tx.date).toLocaleDateString(),
//           tx.type,
//           formatCurrency(tx.amount),
//           tx.source || tx.reason || tx.notes || "N/A",
//         ]),
//         theme: "striped",
//         headStyles: { fillColor: [34, 139, 34] },
//       });
//     }

//     doc.save("business-growth-report.pdf");
//     setIsExporting(false);
//   };

//   const lineChartData = reportData
//     ? [
//         {
//           name: "Previous",
//           value: reportData.comparison?.previousPeriod.businessValue || 0,
//         },
//         { name: "Current", value: reportData.metrics.businessValue },
//       ]
//     : [];

//   const barChartData = reportData
//     ? [
//         {
//           name: "Capital",
//           value: reportData.metrics.netCapital,
//           fill: "#8884d8",
//         },
//         {
//           name: "Profit",
//           value: reportData.metrics.netProfit,
//           fill: "#82ca9d",
//         },
//       ]
//     : [];

//   if (loading && !dashboardData) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full">
//         <AlertCircle className="h-12 w-12 text-red-500" />
//         <p className="mt-4 text-lg text-red-600">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//         <h1 className="text-2xl font-bold text-center sm:text-left">
//           Business Growth & Capital Tracking
//         </h1>
//         <div className="flex flex-wrap items-center justify-center gap-2">
//           <CapitalTransactionForm onSuccess={handleSuccess} />
//           <FinancialYearSettingsForm onSuccess={handleSuccess} />
//           <Button
//             variant="outline"
//             onClick={handleExport}
//             disabled={isExporting}
//           >
//             {isExporting ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <Download className="mr-2 h-4 w-4" />
//             )}
//             {isExporting ? "Exporting..." : "Export Report"}
//           </Button>
//         </div>
//       </header>

//       {/* KPIs */}
//       <div ref={kpisRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Net Capital</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {formatCurrency(dashboardData?.kpis.netCapital || 0)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {dashboardData?.comparison?.capital !== undefined && (
//                 <span
//                   className={
//                     dashboardData.comparison.capital >= 0
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }
//                 >
//                   {dashboardData.comparison.capital >= 0 ? "+" : ""}
//                   {formatCurrency(dashboardData.comparison.capital)} from last
//                   month
//                 </span>
//               )}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div
//               className={`text-2xl font-bold ${(dashboardData?.kpis.netProfit || 0) < 0 ? "text-red-600" : "text-green-600"}`}
//             >
//               {formatCurrency(dashboardData?.kpis.netProfit || 0)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {dashboardData?.comparison?.profit !== undefined && (
//                 <span
//                   className={
//                     dashboardData.comparison.profit >= 0
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }
//                 >
//                   {dashboardData.comparison.profit >= 0 ? "+" : ""}
//                   {formatCurrency(dashboardData.comparison.profit)} from last
//                   month
//                 </span>
//               )}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Business Value
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {formatCurrency(dashboardData?.kpis.businessValue || 0)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {dashboardData?.comparison?.businessValue !== undefined && (
//                 <span
//                   className={
//                     dashboardData.comparison.businessValue >= 0
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }
//                 >
//                   {dashboardData.comparison.businessValue >= 0 ? "+" : ""}
//                   {formatCurrency(dashboardData.comparison.businessValue)} from
//                   last month
//                 </span>
//               )}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Growth</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div
//               className={`text-2xl font-bold ${(dashboardData?.kpis.growthPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
//             >
//               {(dashboardData?.kpis.growthPercentage || 0) >= 0 ? "+" : ""}
//               {(dashboardData?.kpis.growthPercentage || 0).toFixed(2)}%
//             </div>
//             <p className="text-xs text-muted-foreground">vs previous period</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap justify-center sm:justify-end gap-2 mb-6">
//         <Button
//           variant={period === "month" ? "default" : "outline"}
//           onClick={() => setPeriod("month")}
//         >
//           Monthly
//         </Button>
//         <Button
//           variant={period === "quarter" ? "default" : "outline"}
//           onClick={() => setPeriod("quarter")}
//         >
//           Quarterly
//         </Button>
//         <Button
//           variant={period === "year" ? "default" : "outline"}
//           onClick={() => setPeriod("year")}
//         >
//           Annual
//         </Button>
//       </div>

//       {/* Charts */}
//       <div ref={chartsRef} className="space-y-6">
//         {/* First Row - 2 charts */}
//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Business Value Over Time</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={lineChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="value"
//                     stroke="#8884d8"
//                     activeDot={{ r: 8 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Capital vs Profit Contribution</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={barChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="value" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Second Row - 2 charts */}
//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Revenue vs Expenses</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart
//                   data={[
//                     {
//                       name: "Revenue",
//                       value: reportData?.metrics.totalSales || 0,
//                       fill: "#8884d8",
//                     },
//                     {
//                       name: "Expenses",
//                       value: Math.abs(reportData?.metrics.totalExpenses || 0),
//                       fill: "#ff8042",
//                     },
//                   ]}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="value" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Profit & Loss Trend</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={profitLossData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="profit"
//                     stroke="#8884d8"
//                     name="Net Profit/Loss"
//                     strokeWidth={2}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="revenue"
//                     stroke="#82ca9d"
//                     name="Revenue"
//                     strokeWidth={2}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="expenses"
//                     stroke="#ff8042"
//                     name="Expenses"
//                     strokeWidth={2}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Third Row - 2 charts */}
//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Capital Movement Timeline</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={capitalMovementData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="period" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Area
//                     type="monotone"
//                     dataKey="injections"
//                     stackId="1"
//                     stroke="#82ca9d"
//                     fill="#82ca9d"
//                     name="Capital Injections"
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="withdrawals"
//                     stackId="1"
//                     stroke="#ff8042"
//                     fill="#ff8042"
//                     name="Capital Withdrawals"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="netCapital"
//                     stroke="#8884d8"
//                     strokeWidth={3}
//                     name="Net Capital"
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Expense Breakdown</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={expenseCategories}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) =>
//                       `${name} (${(percent * 100).toFixed(0)}%)`
//                     }
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {expenseCategories.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[index % COLORS.length]}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Fourth Row - 2 charts */}
//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Growth Metrics Comparison</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={growthComparisonData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="metric" />
//                   <YAxis tickFormatter={(value) => `${value}%`} />
//                   <Tooltip formatter={(value: number) => `${value}%`} />
//                   <Legend />
//                   <Bar dataKey="current" fill="#8884d8" name="Current Period" />
//                   <Bar dataKey="previous" fill="#82ca9d" name="Previous Period" />
//                   <Bar dataKey="target" fill="#ff8042" name="Target" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Cash Flow Analysis</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <ComposedChart data={cashFlowData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="period" />
//                   <YAxis
//                     tickFormatter={(value) => formatCurrency(value as number)}
//                   />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="inflows" fill="#82ca9d" name="Cash Inflows" />
//                   <Bar dataKey="outflows" fill="#ff8042" name="Cash Outflows" />
//                   <Line
//                     type="monotone"
//                     dataKey="netCashFlow"
//                     stroke="#8884d8"
//                     strokeWidth={2}
//                     name="Net Cash Flow"
//                   />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Fifth Row - Performance vs Target Chart */}
//         <div className="grid gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Performance vs Targets</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={performanceData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="metric" />
//                   <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="actual" fill="#8884d8" name="Actual" />
//                   <Bar dataKey="target" fill="#82ca9d" name="Target" />
//                   <Bar dataKey="variance" fill="#ff8042" name="Variance" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Key Metrics Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {keyMetrics.map((metric, index) => (
//             <Card key={index}>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   {metric.name}
//                 </CardTitle>
//                 <metric.icon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{metric.value}</div>
//                 <div className="h-[40px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={metric.trend}>
//                       <Line
//                         type="monotone"
//                         dataKey="value"
//                         stroke={metric.trendColor}
//                         strokeWidth={2}
//                         dot={false}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Transactions Table */}
//       <div className="mt-6">
//         <CapitalTransactionsTable />
//       </div>
//     </div>
//   );
// };

// export default BusinessGrowthPage;
