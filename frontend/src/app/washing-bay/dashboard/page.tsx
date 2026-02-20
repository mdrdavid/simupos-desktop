/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Car,
  TrendingUp,
  Activity,
  Plus,
  ChevronRight,
  ArrowUp,
  Sparkles,
  Clock,
  Zap,
  Wrench,
  CreditCard,
  ParkingCircle,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function WashingBayDashboard() {
  const { businessData } = useAuth();
  const {
    washOrders,
    workers,
    serviceTypes,
    getDailySummary,
    fetchWashOrders,
    fetchWorkers,
    fetchServiceTypes,
    loading,
    error,
  } = useWashingBay();

  // Check if business type is washingbay_nightparking
  const businessType =
    businessData?.businessType ||
    businessData?.type ||
    businessData?.business_type ||
    "";
  const isCombinedBusiness =
    businessType.toLowerCase().trim() === "washingbay_nightparking";
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [stats, setStats] = useState({
    todayOrders: 0,
    weeklyOrders: 0,
    monthlyOrders: 0,
    activeWorkers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    creditOrders: 0,
  });

  // Fixed data fetching with proper error handling and loading states
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        await Promise.all([
          fetchWashOrders({ period: "month" }), // Fetch all orders for the month
          fetchWorkers(),
          fetchServiceTypes(),
        ]);
        console.log("Dashboard data fetched successfully");
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        // Error is already handled in the context
      }
    };

    fetchData();
  }, [fetchWashOrders, fetchWorkers, fetchServiceTypes]);

  // Calculate stats whenever the data changes
  useEffect(() => {
    console.log("Calculating stats with washOrders:", washOrders.length);

    if (washOrders.length === 0 && workers.length === 0) {
      console.log("No data available for stats calculation");
      return;
    }

    const now = new Date();

    // Today's orders (from start of today to now)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = washOrders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= todayStart;
    });

    // Weekly orders (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyOrders = washOrders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= weekAgo;
    });

    // Monthly orders (from 1st to last day of current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthlyOrders = washOrders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    const activeWorkers = workers.filter((worker) => worker.isActive).length;
    const pendingOrders = washOrders.filter(
      (order) => order.status === "pending" || order.status === "in_progress"
    ).length;
    const completedOrders = washOrders.filter(
      (order) => order.status === "completed"
    ).length;
    const creditOrders = washOrders.filter(
      (order) => order.paymentStatus === "credit"
    ).length;

    // Calculate revenues with proper number validation
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (Number(order.servicePrice) || 0),
      0
    );

    const weeklyRevenue = weeklyOrders.reduce(
      (sum, order) => sum + (Number(order.servicePrice) || 0),
      0
    );

    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + (Number(order.servicePrice) || 0),
      0
    );

    const newStats = {
      todayOrders: todayOrders.length,
      weeklyOrders: weeklyOrders.length,
      monthlyOrders: monthlyOrders.length,
      activeWorkers,
      pendingOrders,
      completedOrders,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      creditOrders,
    };

    setStats(newStats);
  }, [washOrders, workers]);
  // Recent Orders - Only show today's orders, sorted by most recent
  const recentOrders = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = washOrders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= todayStart;
    });

    return todayOrders
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      .slice(0, 5);
  }, [washOrders]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-UG").format(num);
  };

  const quickActions = [
    {
      title: "New Wash Order",
      href: "/washing-bay/orders/new",
      icon: Plus,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Create new order",
    },
    {
      title: "Manage Workers",
      href: "/washing-bay/workers",
      icon: Users,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Worker management",
    },
    {
      title: "Service Types",
      href: "/washing-bay/services",
      icon: Wrench,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Manage services",
    },
    {
      title: "View Reports",
      href: "/washing-bay/reports",
      icon: TrendingUp,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Analytics & insights",
    },
  ];

  const activeWorkersList = workers
    .filter((worker) => worker.isActive)
    .slice(0, 3);

  // Show loading state
  if (loading && washOrders.length === 0 && workers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && washOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
            <Activity className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Failed to load data
          </h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button
            onClick={() => {
              console.log("Retrying data fetch...");
              fetchWashOrders();
              fetchWorkers();
              fetchServiceTypes();
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Washing Bay Dashboard
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Welcome back! Here&apos;s your washing bay overview
                {washOrders.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {washOrders.length} orders loaded
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCombinedBusiness && (
              <Link href="/night-parking/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <ParkingCircle className="h-4 w-4" />
                  Night Parking
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 w-fit border border-gray-200/50 shadow-sm">
              {(["today", "week", "month"] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(
                      selectedPeriod === "today"
                        ? stats.todayOrders
                        : selectedPeriod === "week"
                          ? stats.weeklyOrders
                          : stats.monthlyOrders
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    {washOrders.length} total orders
                  </div>
                </div>
                <div className="p-3 bg-blue-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(
                      selectedPeriod === "today"
                        ? stats.todayRevenue
                        : selectedPeriod === "week"
                          ? stats.weeklyRevenue
                          : stats.monthlyRevenue
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    Total:{" "}
                    {formatCurrency(
                      washOrders.reduce(
                        (sum, order) => sum + (Number(order.servicePrice) || 0),
                        0
                      )
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Active Workers
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.activeWorkers)}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    {workers.length} total workers
                  </div>
                </div>
                <div className="p-3 bg-orange-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-red-50/30 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit Orders
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatNumber(stats.creditOrders)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Requires follow-up
                  </p>
                </div>
                <div className="p-3 bg-red-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Quick Actions
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Frequently used washing bay operations
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.title} href={action.href}>
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 bg-white/80 hover:bg-white group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div
                            className={`p-3 rounded-xl ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="space-y-1 relative z-10">
                            <span className="text-sm font-semibold text-gray-900 block">
                              {action.title}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              {action.description}
                            </span>
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                    <div>
                      <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Today&apos;s Orders
                      </span>
                      <p className="text-sm text-gray-500 font-normal mt-1">
                        Orders placed today ({recentOrders.length} shown)
                      </p>
                    </div>
                  </CardTitle>
                  <Link href="/washing-bay/orders">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-green-50/50 transition-all duration-200 group border border-transparent hover:border-green-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-lg ${
                            order.status === "completed"
                              ? "bg-gradient-to-br from-green-400 to-green-500"
                              : order.status === "in_progress"
                                ? "bg-gradient-to-br from-blue-400 to-blue-500"
                                : "bg-gradient-to-br from-yellow-400 to-yellow-500"
                          }`}
                        >
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-gray-800">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.vehicleType} •{" "}
                            {order.vehicleModel || "No model"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()} at{" "}
                            {new Date(order.orderDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatCurrency(order.servicePrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No orders today</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {washOrders.length === 0
                          ? "No orders in system"
                          : "No orders placed today"}
                      </p>
                      <Link href="/washing-bay/orders/new">
                        <Button className="mt-2">Create New Order</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Active Workers */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Active Workers
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Currently available staff ({activeWorkersList.length}{" "}
                      shown)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeWorkersList.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/50 hover:shadow-sm transition-all duration-200 hover:border-blue-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {worker.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {worker.commissionType === "percentage"
                              ? `${worker.commissionValue}% commission`
                              : `${formatCurrency(worker.commissionValue)} fixed`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium shadow-sm"
                      >
                        Active
                      </Badge>
                    </div>
                  ))}
                  {activeWorkersList.length === 0 && (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No active workers</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {workers.length === 0
                          ? "No workers configured"
                          : "All workers are inactive"}
                      </p>
                    </div>
                  )}
                  {workers.length > 3 && (
                    <Link href="/washing-bay/workers">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 bg-white/80 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800 hover:border-blue-300 transition-all duration-200"
                      >
                        View All Workers ({workers.length})
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Types Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Service Types
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Available washing services (
                      {serviceTypes.slice(0, 4).length} shown)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceTypes.slice(0, 4).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50/50 transition-all duration-200 group border border-transparent hover:border-purple-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.vehicleType} • {service.washType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(service.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.estimatedDuration}min
                        </p>
                      </div>
                    </div>
                  ))}
                  {serviceTypes.length === 0 && (
                    <div className="text-center py-4">
                      <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No services configured
                      </p>
                      <Link href="/washing-bay/services">
                        <Button size="sm" className="mt-2">
                          Create Service Types
                        </Button>
                      </Link>
                    </div>
                  )}
                  {serviceTypes.length > 4 && (
                    <Link href="/washing-bay/services">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
                      >
                        View All Services ({serviceTypes.length})
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
