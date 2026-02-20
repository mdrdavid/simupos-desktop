/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Share,
  Calendar,
  Sparkles,
  PieChart,
  Table as TableIcon,
  ChefHat,
  Target,
  Award,
  Zap,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function RestaurantReports() {
  const { orders, menuItems, tables } = useRestaurant();
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [activeTab, setActiveTab] = useState("sales");

  const periods = [
    { value: "today", label: "📊 Today" },
    { value: "week", label: "📈 This Week" },
    { value: "month", label: "🗓️ This Month" },
    { value: "quarter", label: "🎯 This Quarter" },
    { value: "year", label: "🌟 This Year" },
  ];

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "Completed"),
    [orders]
  );

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, order) => sum + order.total, 0),
    [completedOrders]
  );

  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top selling items
  const topItems = useMemo(() => {
    const itemSales = new Map();
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem.id;
        if (itemSales.has(key)) {
          const existing = itemSales.get(key);
          itemSales.set(key, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.price,
          });
        } else {
          itemSales.set(key, {
            item: item.menuItem,
            quantity: item.quantity,
            revenue: item.price,
          });
        }
      });
    });

    return Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [completedOrders]);

  // Table utilization
  const tableStats = useMemo(
    () =>
      tables
        .map((table) => {
          const tableOrders = completedOrders.filter(
            (order) => order.tableId === table.id
          );
          const tableRevenue = tableOrders.reduce(
            (sum, order) => sum + order.total,
            0
          );
          const utilization =
            (tableOrders.length / completedOrders.length) * 100 || 0;

          return {
            table,
            ordersCount: tableOrders.length,
            revenue: tableRevenue,
            utilization,
          };
        })
        .sort((a, b) => b.revenue - a.revenue),
    [tables, completedOrders]
  );

  // Category performance
  const categoryPerformance = useMemo(() => {
    const categorySales = new Map();
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.menuItem.category;
        if (categorySales.has(category)) {
          const existing = categorySales.get(category);
          categorySales.set(category, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.price,
          });
        } else {
          categorySales.set(category, {
            category,
            quantity: item.quantity,
            revenue: item.price,
          });
        }
      });
    });

    return Array.from(categorySales.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [completedOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting report...");
  };

  const handleShare = () => {
    // Share functionality would be implemented here
    console.log("Sharing report...");
  };

  const getPerformanceColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Performance Reports
            </h1>
            <p className="text-gray-600 text-lg">
              Comprehensive analytics and insights for your restaurant
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Report Period</p>
                  <p className="text-sm text-gray-600">
                    Select the time range for your analysis
                  </p>
                </div>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 border-gray-300 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    +12% from last period
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {totalOrders}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {completedOrders.length} completed
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(averageOrderValue)}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">+8% increase</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Tables Served
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {tableStats.filter((t) => t.ordersCount > 0).length}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    of {tables.length} total
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="sales"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  Sales
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Award className="h-4 w-4" />
                  Top Items
                </TabsTrigger>
                <TabsTrigger
                  value="tables"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <TableIcon className="h-4 w-4" />
                  Tables
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <PieChart className="h-4 w-4" />
                  Categories
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="sales" className="mt-6 space-y-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Sales Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Revenue Breakdown
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Subtotal",
                          value: completedOrders.reduce(
                            (sum, order) => sum + order.subtotal,
                            0
                          ),
                          color: "bg-blue-500",
                        },
                        {
                          label: "Tax (18%)",
                          value: completedOrders.reduce(
                            (sum, order) => sum + order.tax,
                            0
                          ),
                          color: "bg-purple-500",
                        },
                        {
                          label: "Service Charge",
                          value: completedOrders.reduce(
                            (sum, order) => sum + order.serviceCharge,
                            0
                          ),
                          color: "bg-green-500",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-gray-700 font-medium">
                            {item.label}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/30 rounded-lg border border-green-200">
                        <span className="font-bold text-green-900">
                          Total Revenue
                        </span>
                        <span className="font-bold text-green-900 text-lg">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Order Statistics
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Completed Orders",
                          value: totalOrders,
                          icon: CheckCircle,
                        },
                        {
                          label: "Cancelled Orders",
                          value: orders.filter((o) => o.status === "Cancelled")
                            .length,
                          icon: XCircle,
                        },
                        {
                          label: "Average Order Value",
                          value: averageOrderValue,
                          icon: TrendingUp,
                        },
                        {
                          label: "Items per Order",
                          value:
                            totalOrders > 0
                              ? (
                                  completedOrders.reduce(
                                    (sum, order) => sum + order.items.length,
                                    0
                                  ) / totalOrders
                                ).toFixed(1)
                              : 0,
                          icon: Package,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">{item.label}</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {typeof item.value === "number" && item.value > 1000
                              ? formatCurrency(item.value)
                              : item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="mt-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Top Performing Items
                  <Badge
                    variant="secondary"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {topItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No sales data available for this period
                      </p>
                    </div>
                  ) : (
                    topItems.map((item, index) => {
                      const maxRevenue = Math.max(
                        ...topItems.map((i) => i.revenue)
                      );
                      return (
                        <div
                          key={item.item.id}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                  : index === 1
                                    ? "bg-gradient-to-br from-gray-500 to-gray-600"
                                    : index === 2
                                      ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                              )}
                            >
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {item.item.name}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                >
                                  {item.item.category}
                                </Badge>
                                <span>{item.quantity} sold</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-500",
                                    getPerformanceColor(
                                      item.revenue,
                                      maxRevenue
                                    )
                                  )}
                                  style={{
                                    width: `${(item.revenue / maxRevenue) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">
                              {formatCurrency(item.revenue)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} units
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="mt-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-blue-600" />
                  Table Performance
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {tableStats.filter((t) => t.ordersCount > 0).length} active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tableStats.map((stat) => (
                    <div
                      key={stat.table.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                          {stat.table.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            Table {stat.table.number}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{stat.table.zone} Zone</span>
                            <span>•</span>
                            <span>{stat.table.capacity} seats</span>
                            <span>•</span>
                            <span>
                              {stat.utilization.toFixed(1)}% utilization
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                getPerformanceColor(
                                  stat.revenue,
                                  Math.max(...tableStats.map((t) => t.revenue))
                                )
                              )}
                              style={{
                                width: `${(stat.revenue / Math.max(...tableStats.map((t) => t.revenue))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {formatCurrency(stat.revenue)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {stat.ordersCount} orders
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryPerformance.map((category, index) => {
                    const maxRevenue = Math.max(
                      ...categoryPerformance.map((c) => c.revenue)
                    );
                    return (
                      <div
                        key={category.category}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                              index === 0
                                ? "bg-gradient-to-br from-purple-500 to-purple-600"
                                : index === 1
                                  ? "bg-gradient-to-br from-green-500 to-green-600"
                                  : index === 2
                                    ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                            )}
                          >
                            {category.category.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {category.category}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{category.quantity} items sold</span>
                              <span>•</span>
                              <span>
                                {(
                                  (category.revenue / totalRevenue) *
                                  100
                                ).toFixed(1)}
                                % of total
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full transition-all duration-500",
                                  getPerformanceColor(
                                    category.revenue,
                                    maxRevenue
                                  )
                                )}
                                style={{
                                  width: `${(category.revenue / maxRevenue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {formatCurrency(category.revenue)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {category.quantity} units
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Insights */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">
                  Best Performing Table
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  Table {tableStats[0]?.table.number || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {tableStats[0]
                    ? formatCurrency(tableStats[0].revenue)
                    : "No data"}
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Top Selling Item</p>
                <p className="text-lg font-bold text-green-900 truncate">
                  {topItems[0]?.item.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {topItems[0] ? `${topItems[0].quantity} sold` : "No data"}
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Best Category</p>
                <p className="text-lg font-bold text-blue-900">
                  {categoryPerformance[0]?.category || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {categoryPerformance[0]
                    ? formatCurrency(categoryPerformance[0].revenue)
                    : "No data"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add missing icon components
const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Package = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);
