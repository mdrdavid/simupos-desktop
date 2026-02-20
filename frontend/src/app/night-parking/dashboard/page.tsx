/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  DollarSign,
  Activity,
  ChevronRight,
  ArrowUp,
  Clock,
  Zap,
  Shield,
  AlertCircle,
  ParkingCircle,
  MapPin,
  Receipt,
  Eye,
  Sparkles,
} from "lucide-react";
import { useNightParking } from "@/context/NightParkingContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function NightParkingDashboard() {
  const { businessData } = useAuth();
  const {
    records,
    slots,
    pricings,
    getParkingDashboardStats,
    getSlotOccupancy,
    fetchRecords,
    fetchSlots,
    fetchPricings,
    loading,
    error,
  } = useNightParking();

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
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [slotOccupancy, setSlotOccupancy] = useState<any>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        await Promise.all([
          fetchRecords({ period: "month" }),
          fetchSlots(),
          fetchPricings(),
        ]);
        console.log("Dashboard data fetched successfully");
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [fetchRecords, fetchSlots, fetchPricings]);

  // Fetch dashboard stats and occupancy
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, occupancy] = await Promise.all([
          getParkingDashboardStats(),
          getSlotOccupancy(),
        ]);
        setDashboardStats(stats);
        setSlotOccupancy(occupancy);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    if (records.length > 0) {
      fetchDashboardData();
    }
  }, [records, getParkingDashboardStats, getSlotOccupancy]);

  // Calculate stats based on period
const calculatePeriodStats = () => {
  const now = new Date();
  let filteredRecords = records;

  switch (selectedPeriod) {
    case "today":
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      filteredRecords = records.filter((record) => {
        const checkInTime = new Date(record.checkInTime);
        return checkInTime >= todayStart;
      });
      break;
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredRecords = records.filter((record) => {
        const checkInTime = new Date(record.checkInTime);
        return checkInTime >= weekAgo;
      });
      break;
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredRecords = records.filter((record) => {
        const checkInTime = new Date(record.checkInTime);
        return checkInTime >= monthStart;
      });
      break;
  }

  // Handle NaN by ensuring totalAmount is a valid number
  const totalRevenue = filteredRecords.reduce((sum, record) => {
    const amount = Number(record.totalAmount) || 0; // Convert to number, default to 0 if invalid
    return sum + amount;
  }, 0);

  const parkedVehicles = filteredRecords.filter(
    (record) => record.status === "parked" || record.status === "extended"
  ).length;
  
  const checkedOutVehicles = filteredRecords.filter(
    (record) => record.status === "checked_out"
  ).length;
  
  const overdueVehicles = filteredRecords.filter((record) => {
    if (record.expectedCheckOut && (record.status === "parked" || record.status === "extended")) {
      return new Date(record.expectedCheckOut) < new Date();
    }
    return false;
  }).length;

  return {
    totalRevenue,
    parkedVehicles,
    checkedOutVehicles,
    overdueVehicles,
    totalVehicles: filteredRecords.length,
  };
};

  const periodStats = calculatePeriodStats();

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
      title: "Check-in Vehicle",
      href: "/night-parking/check-in",
      icon: Car,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-500/20",
      iconColor: "text-green-400",
      description: "New arrival",
    },
    {
      title: "Check-out Vehicle",
      href: "/night-parking/check-out",
      icon: Receipt,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      description: "Departure",
    },
    {
      title: "View Slots",
      href: "/night-parking/slots",
      icon: MapPin,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-400",
      description: "Parking slots",
    },
    {
      title: "Manage Pricing",
      href: "/night-parking/pricings",
      icon: DollarSign,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      description: "Rate cards",
    },
  ];

  // Recent activity - last 5 check-ins
  const recentActivity = React.useMemo(() => {
    return records
      .sort(
        (a, b) =>
          new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
      )
      .slice(0, 5);
  }, [records]);

  // Overdue vehicles
  const overdueVehicles = React.useMemo(() => {
    return records.filter((record) => {
      if (record.expectedCheckOut && record.status === "parked") {
        return new Date(record.expectedCheckOut) < new Date();
      }
      return false;
    });
  }, [records]);

  // Popular vehicle types
  const popularVehicleTypes = React.useMemo(() => {
    const typeCounts: Record<string, number> = {};
    records.forEach((record) => {
      typeCounts[record.vehicleType] =
        (typeCounts[record.vehicleType] || 0) + 1;
    });
    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [records]);

  // Show loading state
  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading parking dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
            <Activity className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Failed to load data
          </h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <Button
            onClick={() => {
              console.log("Retrying data fetch...");
              fetchRecords();
              fetchSlots();
              fetchPricings();
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
              <ParkingCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Night Parking Dashboard
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Welcome back! Here&apos;s your parking overview
                {records.length > 0 && (
                  <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">
                    {records.length} records loaded
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCombinedBusiness && (
              <Link href="/washing-bay/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/25 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Washing Bay
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 w-fit border border-gray-200 shadow-sm">
              {(["today", "week", "month"] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/25 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
        {/* Slot Occupancy Overview */}
        {slotOccupancy && (
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
                <div>
                  <span className="text-gray-900">
                    Slot Occupancy
                  </span>
                  <p className="text-sm text-gray-500 font-normal mt-1">
                    Real-time parking slot availability
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {slotOccupancy.totalSlots}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Total Slots</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {slotOccupancy.availableSlots}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Available</div>
                </div>
                <div className="text-center p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                  <div className="text-2xl font-bold text-brand-primary">
                    {slotOccupancy.occupiedSlots}
                  </div>
                  <div className="text-sm text-brand-primary mt-1">Occupied</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="text-2xl font-bold text-yellow-600">
                    {slotOccupancy.occupancyRate}%
                  </div>
                  <div className="text-sm text-yellow-600 mt-1">
                    Occupancy Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(periodStats.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    {records.length} total records
                  </div>
                </div>
                <div className="p-3 bg-brand-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Parked Vehicles
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(periodStats.parkedVehicles)}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-brand-primary">
                    <Zap className="h-3 w-3" />
                    Currently in parking
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Checked Out
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(periodStats.checkedOutVehicles)}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    Completed stays
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Overdue Vehicles
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatNumber(periodStats.overdueVehicles)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Requires attention
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Quick Actions */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
                  <div>
                    <span className="text-gray-900">
                      Quick Actions
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Frequently used parking operations
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
                          className="w-full h-24 flex flex-col gap-3 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-brand-primary/30 bg-gray-50 hover:bg-white group relative overflow-hidden"
                        >
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

            {/* Recent Activity */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="text-gray-900">
                        Recent Activity
                      </span>
                      <p className="text-sm text-gray-500 font-normal mt-1">
                        Latest check-ins ({recentActivity.length} shown)
                      </p>
                    </div>
                  </CardTitle>
                  <Link href="/night-parking/records">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-md ${
                            record.status === "checked_out"
                              ? "bg-gradient-to-br from-green-500 to-green-600"
                              : record.status === "overdue"
                                ? "bg-gradient-to-br from-red-500 to-red-600"
                                : "bg-gradient-to-br from-brand-primary to-brand-secondary"
                          }`}
                        >
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-brand-primary">
                            {record.ticketNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.licensePlate} • {record.vehicleType}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(record.checkInTime).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(record.checkInTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${
                            record.status === "checked_out"
                              ? "bg-green-100 text-green-700"
                              : record.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-brand-primary/10 text-brand-primary"
                          }`}
                        >
                          {record.status.replace("_", " ")}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatCurrency(record.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {records.length === 0
                          ? "No records in system"
                          : "No recent check-ins"}
                      </p>
                      <Link href="/night-parking/check-in">
                        <Button className="mt-2">
                          Check-in Vehicle
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Overdue Vehicles */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="text-gray-900">
                      Overdue Vehicles
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Requires immediate attention ({overdueVehicles.length}{" "}
                      vehicles)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueVehicles.slice(0, 3).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {vehicle.licensePlate.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {vehicle.licensePlate}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vehicle.vehicleType}
                          </p>
                          {vehicle.expectedCheckOut && (
                            <p className="text-xs text-red-600">
                              Since{" "}
                              {new Date(
                                vehicle.expectedCheckOut
                              ).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link href={`/night-parking/records/${vehicle.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {overdueVehicles.length === 0 && (
                    <div className="text-center py-4">
                      <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        No overdue vehicles
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        All vehicles are on time
                      </p>
                    </div>
                  )}
                  {overdueVehicles.length > 3 && (
                    <Link href="/night-parking/overdue">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all duration-200"
                      >
                        View All Overdue ({overdueVehicles.length})
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Popular Vehicle Types */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-secondary rounded-full"></div>
                  <div>
                    <span className="text-gray-900">
                      Popular Vehicle Types
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Most frequent vehicles ({popularVehicleTypes.length}{" "}
                      shown)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularVehicleTypes.map((type, index) => (
                    <div
                      key={type.type}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {type.type.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {type.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {type.count} vehicles
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-primary rounded-full"
                            style={{
                              width: `${(type.count / records.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((type.count / records.length) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {popularVehicleTypes.length === 0 && (
                    <div className="text-center py-4">
                      <Car className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No vehicle data</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {records.length === 0
                          ? "No records available"
                          : "No vehicle type data"}
                      </p>
                    </div>
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
