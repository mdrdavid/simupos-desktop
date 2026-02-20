"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { formatCurrency } from "@/lib/utils";
import { generateDailySalesReportPDF } from "@/src/utils/exportUtils";
import { Loader2, Printer, LineChart, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface DailySale {
  date: string;
  total: number;
}

export default function DailySalesReportPage() {
  const { getTransactions } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { businessData } = useAuth();
  const { currentBranch } = useBranch();

  const handlePrintReport = () => {
    if (dailySales.length > 0 && dateRange?.from && dateRange?.to) {
        generateDailySalesReportPDF(dailySales, total, { from: dateRange.from, to: dateRange.to }, businessData?.name, currentBranch?.name);
    }
  };

  const handleFetchReport = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return;
    }
    setLoading(true);
    try {
      const transactions = await getTransactions({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });

      const salesByDay = new Map<string, number>();
      transactions.forEach((transaction) => {
        const date = new Date(transaction.timestamp).toLocaleDateString('en-GB');
        const currentTotal = salesByDay.get(date) || 0;
        const transactionAmount = Number(transaction.amount) || 0;
        salesByDay.set(date, currentTotal + transactionAmount);
      });

      const result = Array.from(salesByDay.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

      setDailySales(result);

      const grandTotal = result.reduce((sum, day) => sum + day.total, 0);
      setTotal(grandTotal);

    } catch (error) {
      console.error("Failed to fetch daily sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  const avgDailySale = dailySales.length > 0 ? total / dailySales.length : 0;
  const maxDailySale = dailySales.length > 0 ? Math.max(...dailySales.map(d => d.total)) : 0;

  const dayOfWeekData = useMemo(() => {
    if (dailySales.length === 0) return [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = days.map(day => ({ day, total: 0, count: 0 }));

    dailySales.forEach(sale => {
      const dateParts = sale.date.split('/');
      const date = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
      const dayIndex = date.getDay();
      data[dayIndex].total += sale.total;
      data[dayIndex].count += 1;
    });

    return data.map(d => ({
      ...d,
      avg: d.count > 0 ? d.total / d.count : 0
    }));
  }, [dailySales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Sales Report</h1>
          <p className="text-muted-foreground">Detailed breakdown of sales performance by day</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports/sales-forecast" passHref>
            <Button variant="outline" size="sm">
              <LineChart className="h-4 w-4 mr-2" />
              Forecast
            </Button>
          </Link>
          <Button onClick={handlePrintReport} variant="outline" size="sm" disabled={dailySales.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button onClick={handleFetchReport} disabled={loading} className="bg-brand-primary hover:bg-brand-secondary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {dailySales.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Period Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(total)}</div>
                <p className="text-xs text-muted-foreground">Selected range</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Daily Sale</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgDailySale)}</div>
                <p className="text-xs text-muted-foreground">Per operational day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Daily Sale</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(maxDailySale)}</div>
                <p className="text-xs text-muted-foreground">Peak performance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Analyzed</CardTitle>
                <Calendar className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailySales.length}</div>
                <p className="text-xs text-muted-foreground">Active sales days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#41A5A5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#41A5A5" stopOpacity={0}/>
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
                        formatter={(val: number) => [formatCurrency(val), "Total Sales"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#41A5A5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toString()} />
                      <Tooltip formatter={(val: number) => [formatCurrency(val), "Total"]} />
                      <Bar dataKey="total" fill="#41A5A5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySales.map((sale) => (
                    <TableRow key={sale.date}>
                      <TableCell className="font-medium">{sale.date}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(sale.total)}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {total > 0 ? ((sale.total / total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>GRAND TOTAL</TableCell>
                    <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {dailySales.length === 0 && !loading && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No sales data found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            Adjust your date range and click `&quot;Generate Report`&quot; to see your daily sales analysis.
          </p>
          <Button onClick={handleFetchReport} className="mt-6 bg-brand-primary">
            Generate Now
          </Button>
        </Card>
      )}
    </div>
  );
}
