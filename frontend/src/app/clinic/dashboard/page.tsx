"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  Plus,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { useClinic } from "@/context/ClinicContext";
import Link from "next/link";

export default function ClinicDashboard() {
  const { stats, getLowStockMedicines } = useClinic();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

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

  const lowStockMedicines = getLowStockMedicines();

  const quickActions = [
    {
      title: "New Patient",
      href: "/clinic/patients/new",
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Register new patient",
    },
    {
      title: "Start Visit",
      href: "/clinic/visits/new",
      icon: Activity,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Begin consultation",
    },
    {
      title: "Add Medicine",
      href: "/clinic/pharmacy/stock-entry",
      icon: Plus,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Update inventory",
    },
    {
      title: "View Reports",
      href: "/clinic/reports",
      icon: TrendingUp,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Analytics & insights",
    },
  ];

  // Calculate trends (mock data - you can replace with real data)
  const trends = {
    patients: 12, // percentage increase
    revenue: 8, // percentage increase
    visits: -5, // percentage decrease
  };

  // Mock recent activity data
  const recentActivities = [
    {
      id: 1,
      type: "consultation",
      title: "New consultation completed",
      description: "Patient: Sarah Nakato",
      time: "2 hours ago",
      icon: Stethoscope,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "registration",
      title: "New patient registered",
      description: "Patient: John Mukasa",
      time: "4 hours ago",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      type: "inventory",
      title: "Medicine stock updated",
      description: "Paracetamol restocked",
      time: "6 hours ago",
      icon: Calendar,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

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
                Clinic Dashboard
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Welcome back! Here&apos;s your clinic overview
              </p>
            </div>
          </div>
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

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(
                      selectedPeriod === "today"
                        ? stats.todayPatients
                        : selectedPeriod === "week"
                          ? Math.floor(stats.monthlyPatients * 0.25)
                          : stats.monthlyPatients
                    )}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      trends.patients >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trends.patients >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(trends.patients)}% from last period
                  </div>
                </div>
                <div className="p-3 bg-blue-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-blue-600" />
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
                          ? Math.floor(stats.monthlyRevenue * 0.25)
                          : stats.monthlyRevenue
                    )}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      trends.revenue >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trends.revenue >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(trends.revenue)}% from last period
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
                    Active Visits
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.activeVisits)}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      trends.visits >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trends.visits >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(trends.visits)}% from last period
                  </div>
                </div>
                <div className="p-3 bg-orange-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-orange-600" />
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
                    <AlertTriangle className="h-4 w-4" />
                    Low Stock Items
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatNumber(stats.lowStockMedicines)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Requires immediate attention
                  </p>
                </div>
                <div className="p-3 bg-red-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
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
                      Frequently used clinic operations
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

            {/* Enhanced Top Services */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                    <div>
                      <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Top Services
                      </span>
                      <p className="text-sm text-gray-500 font-normal mt-1">
                        Most performed services this month
                      </p>
                    </div>
                  </CardTitle>
                  <Link href="/clinic/reports">
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
                  {stats.topServices && stats.topServices.length > 0 ? (
                    stats.topServices.slice(0, 5).map((service, index) => (
                      <div
                        key={service.service.id}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-green-50/50 transition-all duration-200 group border border-transparent hover:border-green-100"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-lg ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                                : index === 1
                                  ? "bg-gradient-to-br from-gray-400 to-gray-500"
                                  : index === 2
                                    ? "bg-gradient-to-br from-orange-400 to-orange-500"
                                    : "bg-gradient-to-br from-blue-400 to-blue-500"
                            }`}
                          >
                            <span className="text-sm font-bold text-white">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-gray-800">
                              {service.service.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {service.count} visits •{" "}
                              {formatCurrency(service.revenue)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                  ? "bg-gray-100 text-gray-700"
                                  : index === 2
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {service.service.category}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback when no top services data
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No service data available</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Service usage statistics will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Enhanced Low Stock Alert */}
            {lowStockMedicines.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50/80 to-orange-50/60 border-l-4 border-l-red-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-red-800">
                        Low Stock Alert
                      </CardTitle>
                      <p className="text-sm text-red-600/80 mt-1">
                        {lowStockMedicines.length} items need restocking
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {lowStockMedicines.slice(0, 3).map((medicine) => (
                      <div
                        key={medicine.id}
                        className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-red-200/50 hover:shadow-sm transition-all duration-200 hover:border-red-300"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {medicine.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: {medicine.quantity}{" "}
                            {medicine.unit || "units"}
                          </p>
                        </div>
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-700 hover:bg-red-200 font-medium shadow-sm"
                        >
                          Low Stock
                        </Badge>
                      </div>
                    ))}
                    {lowStockMedicines.length > 3 && (
                      <Link href="/clinic/pharmacy/low-stock">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 bg-white/80 hover:bg-white border-red-200 text-red-700 hover:text-red-800 hover:border-red-300 transition-all duration-200"
                        >
                          View All ({lowStockMedicines.length - 3} more)
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Recent Activity */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Recent Activity
                    </span>
                    <p className="text-sm text-gray-500 font-normal mt-1">
                      Latest clinic operations
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50/50 transition-all duration-200 group border border-transparent hover:border-purple-100"
                      >
                        <div
                          className={`p-2 ${activity.bgColor} rounded-lg mt-1 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
                        >
                          <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate group-hover:text-gray-800">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link href="/clinic/visits">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
                  >
                    View All Activity
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
