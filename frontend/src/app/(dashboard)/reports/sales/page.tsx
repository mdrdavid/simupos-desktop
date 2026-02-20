/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Share,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  RefreshCw,
  Loader2,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  useData,
  ProfitAnalysis,
  QuickProfitSummary,
  StockMovement,
} from "@/context/DataContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useBranch } from "@/context/BranchContext";
import { formatCurrency } from "@/lib/utils";
import { generateSalesReportPDF } from "@/src/utils/exportUtils";
import Link from "next/link";

export default function ReportsPage() {
  const { toast } = useToast();
  const {
    transactions,
    getProfitAnalysis,
    getQuickProfitSummary,
    getStockMovements,
  } = useData();
  const { currentBranch } = useBranch();
  const [profitData, setProfitData] = useState<ProfitAnalysis | null>(null);
  const [quickSummary, setQuickSummary] = useState<QuickProfitSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  type PeriodKey = "today" | "week" | "month" | "quarter" | "year";
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("today");
  const [productionMovements, setProductionMovements] = useState<
    StockMovement[]
  >([]);
  const [loadingProduction, setLoadingProduction] = useState(false);

  const periods: { key: PeriodKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
    { key: "year", label: "Year" },
  ];

  const loadData = useCallback(async () => {
    if (!currentBranch) return;
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (selectedPeriod) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      const [analysis, summary] = await Promise.all([
        getProfitAnalysis(currentBranch.id, startDate, now, true),
        getQuickProfitSummary(currentBranch.id, selectedPeriod),
      ]);
      setProfitData(analysis);
      setQuickSummary(summary);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load report data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentBranch, getProfitAnalysis, getQuickProfitSummary, selectedPeriod, toast]);

  const loadProductionData = useCallback(async () => {
    if (!currentBranch) return;
    setLoadingProduction(true);
    try {
      const inputMovements = await getStockMovements({
        movementType: "production_input",
      });
      const outputMovements = await getStockMovements({
        movementType: "production_output",
      });
      setProductionMovements([...inputMovements, ...outputMovements]);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load production data.",
        variant: "destructive",
      });
    } finally {
      setLoadingProduction(false);
    }
  }, [currentBranch, getStockMovements, toast]);

  useEffect(() => {
    loadData();
    loadProductionData();
  }, [selectedPeriod, currentBranch, loadData, loadProductionData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadProductionData();
    setRefreshing(false);
  };

  const handleDownloadReport = () => {
    if (profitData) {
      generateSalesReportPDF(profitData, selectedPeriod, currentBranch ?? undefined);
    } else {
      toast({
        title: "No data to export",
        description: "Please select a period with data to generate a report.",
        variant: "destructive",
      });
    }
  };

  const getPaymentBreakdown = () => {
    const breakdown: { cash: number; mtn_momo: number; airtel_money: number } =
      { cash: 0, mtn_momo: 0, airtel_money: 0 };

    transactions.forEach((transaction) => {
      const key = transaction.paymentMethod?.toLowerCase() as
        | "cash"
        | "mtn_momo"
        | "airtel_money";
      if (key in breakdown) {
        breakdown[key] += Number(transaction.amount) || 0;
      }
    });

    return breakdown;
  };

  const paymentBreakdown = getPaymentBreakdown();
  const totalSales = transactions.reduce((sum, t) => sum + t.amount, 0);

  const chartColors = ["#0D9488", "#0891B2", "#4F46E5", "#7C3AED", "#DB2777"];
  const paymentColors: Record<string, string> = {
    cash: "#0D9488",
    mtn_momo: "#EAB308",
    airtel_money: "#EF4444",
  };

  const salesTrendData = profitData?.breakdown?.dailyProfit.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    Revenue: day.revenue,
    Profit: day.netProfit,
  })) || [];

  const topItemsData = profitData?.breakdown?.topProfitableItems.slice(0, 5).map((item) => ({
    name: item.item.name.length > 15 ? item.item.name.substring(0, 12) + "..." : item.item.name,
    Profit: item.profit,
    Revenue: item.revenue,
  })) || [];

  const paymentData = Object.entries(paymentBreakdown)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.replace("_", " ").toUpperCase(),
      value,
      color: paymentColors[name] || "#6366F1",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600">
            Analyze your business performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={loading}
            className="bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => {}} className="bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                className={
                  selectedPeriod !== period.key ? "bg-transparent" : ""
                }
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : profitData && quickSummary ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-teal-100">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(profitData.profit.netProfit)}</div>
                        {typeof profitData.profit.profitGrowth === "number" && (
                            <div className="flex items-center text-sm text-teal-100 mt-1">
                                {profitData.profit.profitGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {profitData.profit.profitGrowth.toFixed(1)}% from last period
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(profitData.revenue.totalRevenue)}</div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {profitData.revenue.totalSales} transactions
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(profitData.costs.totalExpenses)}</div>
                         <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Receipt className="h-3 w-3 mr-1" />
                            Operating costs
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{profitData.profit.netProfitMargin.toFixed(1)}%</div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Net margin
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <LineChartIcon className="h-5 w-5 text-teal-600" />
                        <CardTitle>Sales & Profit Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrendData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 12, fill: '#666'}}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 12, fill: '#666'}}
                                        tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toString()}
                                    />
                                    <Tooltip
                                        formatter={(val: number) => [formatCurrency(val), ""]}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="Revenue" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="Profit" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-teal-600" />
                        <CardTitle>Top Items by Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topItemsData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 12, fill: '#333', fontWeight: 500}}
                                        width={100}
                                    />
                                    <Tooltip
                                        formatter={(val: number) => [formatCurrency(val), "Profit"]}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="Profit" fill="#0D9488" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-teal-600" />
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-around h-[300px]">
                        <div className="h-full w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-1/2 px-4">
                            {paymentData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Profit Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-[300px] space-y-4">
                        <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border border-teal-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-teal-100 rounded-md mr-3 text-teal-700">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-teal-900">Gross Profit</span>
                            </div>
                            <span className="font-bold text-teal-700 text-lg">{formatCurrency(profitData.profit.grossProfit)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-md mr-3 text-red-700">
                                    <TrendingDown className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-red-900">Total Expenses</span>
                            </div>
                            <span className="font-bold text-red-700 text-lg">{formatCurrency(profitData.costs.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-indigo-100 rounded-md mr-3 text-indigo-700">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-indigo-900">Net Profit</span>
                            </div>
                            <span className="font-bold text-indigo-700 text-lg">{formatCurrency(profitData.profit.netProfit)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/reports/transaction-analysis">
                    <Card className="hover:bg-gray-50 transition-colors border-l-4 border-teal-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Detailed Transaction Analysis</CardTitle>
                            <ArrowRight className="h-5 w-5 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Dive deep into sales, items, and payment trends with granular filters.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/reports/business-intelligence">
                    <Card className="hover:bg-gray-50 transition-colors border-l-4 border-indigo-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Business Intelligence</CardTitle>
                            <ArrowRight className="h-5 w-5 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Visualize business performance with advanced charts and predictive analytics.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {productionMovements.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader><CardTitle>Production Report</CardTitle></CardHeader>
                    <CardContent>
                        {loadingProduction ? <Loader2 className="h-6 w-6 animate-spin text-teal-600" /> :
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {productionMovements.map(movement => (
                                    <div key={movement.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-gray-900">{movement.item?.name}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${movement.type === 'production_output' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {movement.type === 'production_output' ? 'OUT' : 'IN'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Quantity:</span>
                                            <span className="font-bold">{Math.abs(movement.quantityChange)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">{movement.reason}</p>
                                    </div>
                                ))}
                            </div>
                        }
                    </CardContent>
                </Card>
            )}

        </>
      ) : (
        <Card>
            <CardContent className="p-6 text-center">
                <p>No data available for the selected period.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
