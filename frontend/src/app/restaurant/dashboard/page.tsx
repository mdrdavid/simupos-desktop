"use client";

import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  ChefHat,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function RestaurantDashboard() {
  const { stats, activeOrders, tables, ingredients } = useRestaurant();

  const lowStockItems = ingredients.filter(
    (item) => item.currentStock <= item.minStock
  );
  const occupiedTables = tables.filter((table) => table.status === "Occupied");

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12%",
    },
    {
      title: "Revenue",
      value: `UGX ${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+8%",
    },
    {
      title: "Active Tables",
      value: `${occupiedTables.length}/${tables.length}`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: `${Math.round((occupiedTables.length / tables.length) * 100)}% occupied`,
    },
    {
      title: "Avg Order",
      value: `UGX ${stats.averageOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+5%",
    },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "Served":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "Preparing":
        return <ChefHat className="h-3 w-3" />;
      case "Ready":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here&apos;s your restaurant overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50 px-3 py-1.5"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live • Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-gray-600 tracking-wide">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 text-xs"
                      >
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  {stat.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Alerts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Link href="/restaurant/orders/new">
                  <Button className="w-full bg-gradient-to-r from-[#41A5A5] to-[#2E8B8B] hover:from-[#2E8B8B] hover:to-[#1A6B6B] text-white shadow-sm hover:shadow-md transition-all duration-300 h-12">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    New Order
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/restaurant/tables">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Tables
                    </Button>
                  </Link>
                  <Link href="/restaurant/orders">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Orders
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {lowStockItems.length > 0 && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50/30 border-l-4 border-l-orange-400 hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-900">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-orange-800 font-medium">
                    {lowStockItems.length} item
                    {lowStockItems.length > 1 ? "s" : ""} need
                    {lowStockItems.length === 1 ? "s" : ""} restocking
                  </p>
                </div>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-white/50 rounded-lg border border-orange-200"
                    >
                      <span className="text-sm font-medium text-orange-900">
                        {item.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-700 border-orange-200 text-xs"
                      >
                        {item.currentStock} {item.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link href="/restaurant/inventory">
                  <Button
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 bg-white hover:bg-orange-50 hover:border-orange-400 transition-colors mt-2"
                  >
                    Manage Inventory
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Active Orders */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                Active Orders
                {activeOrders.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-50 text-green-700"
                  >
                    {activeOrders.length} active
                  </Badge>
                )}
              </CardTitle>
              <Link href="/restaurant/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No active orders</p>
                  <p className="text-gray-400 text-sm">
                    New orders will appear here
                  </p>
                  <Link href="/restaurant/orders/new">
                    <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B] mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl border border-gray-200/50 transition-all duration-200 group hover:border-gray-300"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center group-hover:shadow-sm transition-shadow">
                          <span className="font-bold text-gray-700 text-sm">
                            T{order.table.number}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              Table {order.table.number}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getOrderStatusColor(order.status)} flex items-center gap-1`}
                            >
                              {getOrderStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              {order.items.length} item
                              {order.items.length > 1 ? "s" : ""}
                            </span>
                            <span>•</span>
                            <span className="font-medium">
                              {order.waiterName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          UGX {order.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
