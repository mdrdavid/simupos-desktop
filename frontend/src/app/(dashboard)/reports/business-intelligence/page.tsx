"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData, ProfitAnalysis } from "@/context/DataContext";
import { useBranch } from "@/context/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Loader2, AlertCircle, Printer, Share2, TrendingUp, Calendar, Percent, Landmark, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generatePredictions } from "@/src/utils/predictionUtils";
import { useExpenses } from "@/context/ExpenseContext";
import Link from "next/link";


type Period = "week" | "month" | "quarter";

const BusinessIntelligencePage = () => {
  const { getProfitAnalysis } = useData();
  const { getExpensesByCategory } = useExpenses();
  const { currentBranch } = useBranch();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [profitData, setProfitData] = useState<ProfitAnalysis | null>(null);
  const [expenseData, setExpenseData] = useState<Record<string, number>>({});
  const [predictionData, setPredictionData] = useState<{date: string, "Sales Forecast": number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const periods: { key: Period; label: string }[] = [
    { key: "week", label: "Last 7 Days" },
    { key: "month", label: "Last 30 Days" },
    { key: "quarter", label: "Last 90 Days" },
  ];

  const fetchData = useCallback(async () => {
    if (!currentBranch) {
      setError("No branch selected. Please select a branch first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setDate(now.getDate() - 30);
          break;
        case "quarter":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const [fetchedProfitData, fetchedExpenseData] = await Promise.all([
        getProfitAnalysis(currentBranch.id, startDate, now),
        getExpensesByCategory(selectedPeriod),
      ]);

      setProfitData(fetchedProfitData);
      setExpenseData(fetchedExpenseData);

      if (fetchedProfitData?.breakdown?.dailyProfit?.length > 1) {
        const historicalSales = fetchedProfitData.breakdown.dailyProfit.map(
          (p, index) => ({ x: index, y: p.revenue })
        );
        const futurePredictions = generatePredictions(historicalSales, 7);

        const lastDate = new Date(
          fetchedProfitData.breakdown.dailyProfit[
            fetchedProfitData.breakdown.dailyProfit.length - 1
          ].date
        );
        const formattedPredictions = futurePredictions.map((p, index) => {
          const futureDate = new Date(lastDate);
          futureDate.setDate(lastDate.getDate() + index + 1);
          return {
            date: futureDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            "Sales Forecast": p.y,
          };
        });
        setPredictionData(formattedPredictions);
      } else {
        setPredictionData([]);
      }
    } catch (err) {
      console.error("BI data fetching error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch BI data."
      );
    } finally {
      setLoading(false);
    }
  }, [currentBranch, selectedPeriod, getProfitAnalysis, getExpensesByCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const renderPlaceholder = (message: string) => (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );

  const getSalesTrendData = () => {
    if (!profitData?.breakdown?.dailyProfit?.length) return [];
    const salesData = profitData.breakdown.dailyProfit.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Sales: day.revenue,
      Profit: day.netProfit,
    }));

    return [...salesData, ...predictionData];
  };

  const getFinancialSummaryData = () => {
    if (!profitData) return [];
    return [
      { name: "Revenue", value: profitData.revenue.totalRevenue, fill: "#4CAF50" },
      { name: "COGS", value: profitData.costs.totalCOGS, fill: "#FFC107" },
      { name: "Expenses", value: profitData.costs.totalExpenses, fill: "#F44336" },
      { name: "Profit", value: profitData.profit.netProfit, fill: "#2196F3" },
    ];
  };

  const getExpenseBreakdownData = () => {
    if (Object.keys(expenseData).length === 0) return [];
    const colors = ["#EF5350", "#7E57C2", "#42A5F5", "#66BB6A", "#FFA726", "#FF7043"];
    return Object.entries(expenseData).map(([name, value], index) => ({
      name: `${name}: ${((value / Object.values(expenseData).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%`,
      value,
      fill: colors[index % colors.length],
    }));
  };

  const getTopProductsData = () => {
    if (!profitData?.breakdown?.topProfitableItems?.length) return [];
    return profitData.breakdown.topProfitableItems
      .slice(0, 5)
      .map((item) => ({
        name: item.item.name.length > 15 ? item.item.name.substring(0, 12) + "..." : item.item.name,
        Revenue: item.revenue,
        Profit: item.profit,
      }));
  };

  const getDayOfWeekData = () => {
    if (!profitData?.breakdown?.dailyProfit?.length) return [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = new Array(7).fill(0).map((_, i) => ({
      name: dayNames[i],
      Revenue: 0,
      Profit: 0
    }));

    profitData.breakdown.dailyProfit.forEach(day => {
      const d = new Date(day.date).getDay();
      totals[d].Revenue += day.revenue;
      totals[d].Profit += day.netProfit;
    });

    // Sort to start from Monday
    const mondayFirst = [...totals.slice(1), totals[0]];
    return mondayFirst;
  };

  const getProfitMarginTrendData = () => {
    if (!profitData?.breakdown?.dailyProfit?.length) return [];
    return profitData.breakdown.dailyProfit.map(day => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Margin: day.revenue > 0 ? Number(((day.netProfit / day.revenue) * 100).toFixed(2)) : 0
    }));
  };

  const handlePrintReport = async () => {
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // allow state to update and UI to re-render
    window.print();
    setIsPrinting(false);
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Business Intelligence Report',
        text: 'Check out the latest business intelligence report!',
        url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Business Insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-600">{error}</p>
        <Button onClick={fetchData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600">
            Visualize and analyze your business performance.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handlePrintReport} variant="outline" disabled={isPrinting}>
                {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                <span className="ml-2">Print</span>
            </Button>
            <Button onClick={handleShareReport} variant="outline">
                <Share2 className="h-4 w-4" />
                <span className="ml-2">Share</span>
            </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <Button
                key={p.key}
                variant={selectedPeriod === p.key ? "default" : "outline"}
                onClick={() => setSelectedPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <CardTitle>Sales & Profit Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            {getSalesTrendData().length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={getSalesTrendData()}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfitBI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="Sales" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="Profit" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfitBI)" />
                  <Line type="monotone" dataKey="Sales Forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No sales trend data available.")
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <Landmark className="h-5 w-5 text-teal-600" />
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {getFinancialSummaryData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getFinancialSummaryData()} margin={{top: 20}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {getFinancialSummaryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No financial summary available.")
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-teal-600" />
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {getExpenseBreakdownData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={getExpenseBreakdownData()} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5}>
                     {getExpenseBreakdownData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No expense data for this period.")
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <CardTitle>Day of Week Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {getDayOfWeekData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getDayOfWeekData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No weekly data available.")
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <Percent className="h-5 w-5 text-teal-600" />
            <CardTitle>Profit Margin Trend (%)</CardTitle>
          </CardHeader>
          <CardContent>
            {getProfitMarginTrendData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getProfitMarginTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(val: number) => [`${val}%`, "Margin"]} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="Margin" stroke="#8B5CF6" strokeWidth={3} dot={{r: 4, fill: '#8B5CF6'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No margin trend data available.")
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 shadow-sm border-teal-100">
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            <CardTitle>Top 5 Most Profitable Products</CardTitle>
          </CardHeader>
          <CardContent>
            {getTopProductsData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopProductsData()} layout="vertical" margin={{left: 40, right: 40}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="Profit" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              renderPlaceholder("No top selling products found.")
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/business-growth">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Business Growth & Capital
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Track capital, profit, and business value.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default BusinessIntelligencePage;
