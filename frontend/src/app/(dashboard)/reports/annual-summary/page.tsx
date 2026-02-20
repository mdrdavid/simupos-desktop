/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { generateAnnualSummaryReportPDF } from "@/src/utils/exportUtils";
import { Loader2, Printer, TrendingUp, TrendingDown, BarChart3, DollarSign, Wallet } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart as RePieChart, Pie
} from 'recharts';

interface MonthlySummary {
  month: string;
  revenue: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export default function AnnualSummaryReportPage() {
  const { getProfitAnalysis } = useData();
  const { currentBranch } = useBranch();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, grossProfit: 0, expenses: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);
  const { businessData } = useAuth();

  const handlePrintReport = () => {
    if (monthlyData.length > 0) {
        generateAnnualSummaryReportPDF(monthlyData, totals, selectedYear, businessData?.name, currentBranch?.name);
    }
  };

  const handleGenerateReport = async () => {
    if (!currentBranch) return;
    setLoading(true);
    const year = parseInt(selectedYear);
    const data: MonthlySummary[] = [];
    let totalRevenue = 0;
    let totalGrossProfit = 0;
    let totalExpenses = 0;
    let totalNetProfit = 0;

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      try {
        const profitAnalysis = await getProfitAnalysis(currentBranch.id, startDate, endDate);
        const monthName = startDate.toLocaleString('default', { month: 'long' });

        data.push({
          month: monthName,
          revenue: profitAnalysis.revenue.totalRevenue,
          grossProfit: profitAnalysis.profit.grossProfit,
          expenses: profitAnalysis.costs.totalExpenses,
          netProfit: profitAnalysis.profit.netProfit,
        });

        totalRevenue += profitAnalysis.revenue.totalRevenue;
        totalGrossProfit += profitAnalysis.profit.grossProfit;
        totalExpenses += profitAnalysis.costs.totalExpenses;
        totalNetProfit += profitAnalysis.profit.netProfit;

      } catch (error) {
        console.error(`Failed to fetch data for ${startDate.toLocaleString('default', { month: 'long' })}`, error);
        // Push empty data for months with errors to not break the UI
        data.push({ month: startDate.toLocaleString('default', { month: 'long' }), revenue: 0, grossProfit: 0, expenses: 0, netProfit: 0 });
      }
    }
    setMonthlyData(data);
    setTotals({ revenue: totalRevenue, grossProfit: totalGrossProfit, expenses: totalExpenses, netProfit: totalNetProfit });
    setLoading(false);
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annual Summary</h1>
          <p className="text-muted-foreground">Comprehensive financial performance for the year {selectedYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            Generate
          </Button>
          <Button onClick={handlePrintReport} variant="outline" disabled={monthlyData.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
                <p className="text-xs text-muted-foreground">For the year {selectedYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Wallet className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.expenses)}</div>
                <p className="text-xs text-muted-foreground">All operational costs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.grossProfit)}</div>
                <p className="text-xs text-muted-foreground">Margin: {totals.revenue > 0 ? ((totals.grossProfit / totals.revenue) * 100).toFixed(1) : 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <div className={`p-1 rounded-full ${totals.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totals.netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground">After all expenses</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            {/* Main Performance Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Performance Trend</CardTitle>
                <CardDescription>Revenue, Gross Profit and Net Profit across the year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#41A5A5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#41A5A5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 12}}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), ""]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#41A5A5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#22c55e" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Profitability Comparison */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Profitability Ratio</CardTitle>
                <CardDescription>Net Profit vs Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="netProfit" name="Net Profit" fill="#41A5A5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Monthly Breakdown</CardTitle>
              <CardDescription>Exact figures for financial auditing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map(data => (
                    <TableRow key={data.month}>
                      <TableCell className="font-medium">{data.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(data.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(data.grossProfit)}</TableCell>
                      <TableCell className="text-right text-destructive">{formatCurrency(data.expenses)}</TableCell>
                      <TableCell className={`text-right font-semibold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(data.netProfit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>ANNUAL TOTALS</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.grossProfit)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(totals.expenses)}</TableCell>
                    <TableCell className={`text-right ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totals.netProfit)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {monthlyData.length === 0 && !loading && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No data generated</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            Select a year and click &quot;Generate Report&quot; to view your annual financial performance.
          </p>
          <Button onClick={handleGenerateReport} className="mt-6">
            Generate Now
          </Button>
        </Card>
      )}
    </div>
  );
}
