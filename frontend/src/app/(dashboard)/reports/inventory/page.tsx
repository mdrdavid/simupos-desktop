"use client";

import { useState, useMemo } from "react";
import { useData, DailyInventoryReport } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Loader2, Printer, AlertTriangle, Package, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { generateInventoryReportPDF } from "@/src/utils/exportUtils";
import { Combobox } from "@/components/ui/combobox";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function InventoryReportPage() {
  const { getInventoryReport, loading, items } = useData();
  const { businessData } = useAuth();
  const { currentBranch } = useBranch();
  const [reportData, setReportData] = useState<DailyInventoryReport[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    undefined
  );

  const productOptions = useMemo(() => {
    return items.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [items]);

  const handleFetchReport = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return;
    }
    try {
      const data = await getInventoryReport(
        dateRange.from,
        dateRange.to,
        selectedProductId
      );
      setReportData(data);
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
    }
  };

  const handlePrintReport = () => {
    if (reportData.length > 0 && dateRange?.from && dateRange?.to) {
      generateInventoryReportPDF(
        reportData,
        { from: dateRange.from, to: dateRange.to },
        businessData?.name,
        currentBranch?.name
      );
    }
  };

  // Analysis calculations
  const inventoryStats = useMemo(() => {
    const totalItems = items.length;
    const lowStockItems = items.filter(item => (item.stockQuantity || 0) <= (item.minStockLevel || 0) && (item.stockQuantity || 0) > 0).length;
    const outOfStockItems = items.filter(item => (item.stockQuantity || 0) <= 0).length;
    const totalValue = items.reduce((sum, item) => sum + (item.stockQuantity || 0) * (item.purchasePrice || 0), 0);

    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  }, [items]);

  const movementTrendData = useMemo(() => {
    if (!reportData.length) return [];
    return reportData.map(day => {
      const added = day.items.reduce((sum, item) => sum + item.stockAdded, 0);
      const removed = day.items.reduce((sum, item) => sum + item.stockRemoved, 0);
      return {
        date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Added: added,
        Removed: removed,
      };
    }).reverse();
  }, [reportData]);

  const categoryValueData = useMemo(() => {
    const categories: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.category || "Uncategorized";
      const value = (item.stockQuantity || 0) * (item.purchasePrice || 0);
      categories[cat] = (categories[cat] || 0) + value;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [items]);

  const topMovingItems = useMemo(() => {
    if (!reportData.length) return [];
    const movementMap: Record<string, { name: string, added: number, removed: number, total: number }> = {};

    reportData.forEach(day => {
      day.items.forEach(item => {
        if (!movementMap[item.itemId]) {
          movementMap[item.itemId] = { name: item.itemName, added: 0, removed: 0, total: 0 };
        }
        movementMap[item.itemId].added += item.stockAdded;
        movementMap[item.itemId].removed += item.stockRemoved;
        movementMap[item.itemId].total += (item.stockAdded + item.stockRemoved);
      });
    });

    return Object.values(movementMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [reportData]);

  const stockStatusData = [
    { name: 'Healthy', value: items.length - inventoryStats.lowStockItems - inventoryStats.outOfStockItems, color: '#10B981' },
    { name: 'Low Stock', value: inventoryStats.lowStockItems, color: '#F59E0B' },
    { name: 'Out of Stock', value: inventoryStats.outOfStockItems, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Analysis</h1>
          <p className="text-gray-600">Monitor stock levels, movements and valuation</p>
        </div>
        <Button
          onClick={handlePrintReport}
          variant="outline"
          disabled={reportData.length === 0}
          className="bg-white"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{formatCurrency(inventoryStats.totalValue)}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Package className="h-3 w-3 mr-1" />
              Across {inventoryStats.totalItems} items
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inventoryStats.lowStockItems}</div>
            <div className="flex items-center text-xs text-amber-600 mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs attention
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent replenishment
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-l-4 border-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {reportData.reduce((sum, day) => sum + day.items.reduce((s, i) => s + i.movements, 0), 0)}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              In selected period
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <div className="w-64">
            <Combobox
              options={productOptions}
              value={selectedProductId}
              onChange={setSelectedProductId}
              placeholder="All Products"
            />
          </div>
          <Button onClick={handleFetchReport} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Analyze Movements
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <CardTitle>Stock Movement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {movementTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={movementTrendData}>
                    <defs>
                      <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRemoved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Added" stroke="#10B981" fillOpacity={1} fill="url(#colorAdded)" />
                    <Area type="monotone" dataKey="Removed" stroke="#EF4444" fillOpacity={1} fill="url(#colorRemoved)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No movement data to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            <CardTitle>Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {categoryValueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryValueData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      tick={{fontSize: 12}}
                    />
                    <Tooltip
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No category data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-teal-600" />
            <CardTitle>Stock Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-around h-[300px]">
            <div className="h-full w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-1/2 px-4">
              {stockStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value} items</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <CardTitle>Top Moving Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {topMovingItems.length > 0 ? topMovingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.total} total movements</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-end text-green-600">
                      <div className="flex items-center text-xs font-bold">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        {item.added}
                      </div>
                      <span className="text-[10px] uppercase">In</span>
                    </div>
                    <div className="flex flex-col items-end text-red-600">
                      <div className="flex items-center text-xs font-bold">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        {item.removed}
                      </div>
                      <span className="text-[10px] uppercase">Out</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400">
                  No movements recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Inventory Movement Logs</CardTitle>
          {dateRange?.from && dateRange?.to && (
            <p className="text-sm text-muted-foreground">
              {new Date(dateRange.from).toLocaleDateString()} -{" "}
              {new Date(dateRange.to).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reportData.length > 0 ? (
            reportData.map((dailyReport) => (
              <div key={dailyReport.date} className="mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  {new Date(dailyReport.date).toLocaleDateString()}
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead className="text-right">
                        Opening Stock
                      </TableHead>
                      <TableHead className="text-right">Stock Added</TableHead>
                      <TableHead className="text-right">
                        Stock Removed
                      </TableHead>
                      <TableHead className="text-right">
                        Closing Stock
                      </TableHead>
                      <TableHead className="text-right">Movements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReport.items.map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.barcode}</TableCell>
                        <TableCell className="text-right">
                          {item.openingStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.stockAdded}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.stockRemoved}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.closingStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.movements}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p>No data for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
