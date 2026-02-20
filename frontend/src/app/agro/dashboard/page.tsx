/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  BarChart,
  Leaf,
  AlertTriangle,
  Truck,
  CreditCard,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgroProduct } from "@/context/AgroProductContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function AgroDashboardPage() {
  const { fetchAgroDashboardStats } = useAgroProduct();
  const { currentBranchId } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVariants: 0,
    totalItems: 0,
    totalLowStockItems: 0,
    recentShipments: 0,
    totalTransactions: 0,
    totalTransactionsAmount: 0,
    todayTransactions: 0,
    todayTransactionsAmount: 0,
    regularTransactions: 0,
    regularTransactionsAmount: 0,
    agroSales: 0,
    agroSalesAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (showRefresh = false) => {
    if (currentBranchId) {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const data = await fetchAgroDashboardStats(currentBranchId);
        setStats((prevStats) => ({
          totalProducts: data?.totalProducts ?? prevStats.totalProducts,
          totalVariants: data?.totalVariants ?? prevStats.totalVariants,
          totalItems: data?.totalItems ?? prevStats.totalItems,
          totalLowStockItems:
            data?.totalLowStockItems ?? prevStats.totalLowStockItems,
          recentShipments: data?.recentShipments ?? prevStats.recentShipments,
          totalTransactions:
            data?.totalTransactions ?? prevStats.totalTransactions,
          totalTransactionsAmount:
            data?.totalTransactionsAmount ?? prevStats.totalTransactionsAmount,
          todayTransactions:
            data?.todayTransactions ?? prevStats.todayTransactions,
          todayTransactionsAmount:
            data?.todayTransactionsAmount ?? prevStats.todayTransactionsAmount,
          regularTransactions:
            data?.regularTransactions ?? prevStats.regularTransactions,
          regularTransactionsAmount:
            data?.regularTransactionsAmount ??
            prevStats.regularTransactionsAmount,
          agroSales: data?.agroSales ?? prevStats.agroSales,
          agroSalesAmount: data?.agroSalesAmount ?? prevStats.agroSalesAmount,
        }));
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, [currentBranchId, fetchAgroDashboardStats]);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend,
    format = "number",
  }: {
    title: string;
    value: number;
    subtitle: string;
    icon: any;
    color?: "blue" | "green" | "red" | "purple" | "orange" | "teal";
    trend?: { value: number; isPositive: boolean };
    format?: "number" | "currency";
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-emerald-600",
      red: "from-red-500 to-rose-600",
      purple: "from-purple-500 to-violet-600",
      orange: "from-orange-500 to-amber-600",
      teal: "from-teal-500 to-cyan-600",
    };

    const bgColorClasses = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      red: "bg-red-50 border-red-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200",
      teal: "bg-teal-50 border-teal-200",
    };

    const formattedValue =
      format === "currency"
        ? `${value.toLocaleString()}`
        : value.toLocaleString();

    return (
      <Card
        className={cn(
          "border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          bgColorClasses[color]
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">
            {title}
          </CardTitle>
          <div
            className={cn(
              "p-2 rounded-xl bg-gradient-to-r",
              colorClasses[color]
            )}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {formattedValue}
            </div>
            {trend && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend.value}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
        </CardContent>
      </Card>
    );
  };

  const SkeletonCard = () => (
    <Card className="border-2 border-gray-200/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Agro Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Comprehensive overview of your agricultural business
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Badge
              variant="secondary"
              className="bg-white/80 backdrop-blur-sm border-2 border-teal-200 text-teal-700"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStats(true)}
              disabled={refreshing}
              className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl transition-all duration-300"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              subtitle={`${stats.totalVariants} variants available`}
              icon={Package}
              color="teal"
              trend={{ value: 12, isPositive: true }}
            />

            <StatCard
              title="Total Sales"
              value={stats.totalTransactionsAmount}
              subtitle={`${stats.totalTransactions} total transactions`}
              icon={DollarSign}
              color="green"
              format="currency"
              trend={{ value: 8, isPositive: true }}
            />

            <StatCard
              title="Today's Sales"
              value={stats.todayTransactionsAmount}
              subtitle={`${stats.todayTransactions} transactions today`}
              icon={BarChart}
              color="blue"
              format="currency"
            />

            <StatCard
              title="Low Stock Items"
              value={stats.totalLowStockItems}
              subtitle="Requires immediate attention"
              icon={AlertTriangle}
              color="red"
              trend={{ value: 5, isPositive: false }}
            />

            <StatCard
              title="Recent Shipments"
              value={stats.recentShipments}
              subtitle="Last 7 days"
              icon={Truck}
              color="purple"
              trend={{ value: 15, isPositive: true }}
            />

            <StatCard
              title="Regular Transactions"
              value={stats.regularTransactions}
              subtitle={`UGX ${stats.regularTransactionsAmount.toLocaleString()}`}
              icon={CreditCard}
              color="orange"
            />

            <StatCard
              title="Agro Sales"
              value={stats.agroSales}
              subtitle={`UGX ${stats.agroSalesAmount.toLocaleString()}`}
              icon={Leaf}
              color="green"
              trend={{ value: 25, isPositive: true }}
            />

            {/* Additional Summary Card */}
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Business Health
                </CardTitle>
                <div className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Inventory Value
                    </span>
                    <span className="font-semibold text-teal-700">
                      UGX {(stats.totalItems * 10000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Stock Coverage
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      Good
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sales Growth</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                      +12%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Insights Section */}
        {!loading && (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Performance Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <span>Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div>
                      <p className="font-semibold text-blue-700">
                        Daily Average
                      </p>
                      <p className="text-sm text-blue-600">
                        UGX{" "}
                        {Math.round(
                          stats.todayTransactionsAmount /
                            (stats.todayTransactions || 1)
                        ).toLocaleString()}{" "}
                        per transaction
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div>
                      <p className="font-semibold text-green-700">
                        Agro Performance
                      </p>
                      <p className="text-sm text-green-600">
                        {stats.agroSales} sales contributing{" "}
                        {(
                          (stats.agroSalesAmount /
                            stats.totalTransactionsAmount) *
                            100 || 0
                        ).toFixed(1)}
                        % of revenue
                      </p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-500" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                    <div>
                      <p className="font-semibold text-amber-700">
                        Inventory Health
                      </p>
                      <p className="text-sm text-amber-600">
                        {stats.totalLowStockItems} items need restocking
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50/50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-3" />
                  New Sale
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                >
                  <Truck className="h-4 w-4 mr-3" />
                  Manage Inventory
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl transition-all duration-300"
                >
                  <BarChart className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-300"
                >
                  <Package className="h-4 w-4 mr-3" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State for No Data */}
        {!loading && stats.totalProducts === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Agricultural Products
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first agricultural product to the
                system.
              </p>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
