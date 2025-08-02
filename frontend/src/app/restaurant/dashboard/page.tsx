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
    },
    {
      title: "Revenue",
      value: `UGX ${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Tables",
      value: `${occupiedTables.length}/${tables.length}`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Order",
      value: `UGX ${stats.averageOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your restaurant overview
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/restaurant/orders/new">
              <Button className="w-full bg-[#41A5A5] hover:bg-[#2E8B8B]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
            <Link href="/restaurant/tables">
              <Button variant="outline" className="w-full bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                View Tables
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Active Orders</CardTitle>
          <Link href="/restaurant/orders">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active orders</p>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Table {order.table.number}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        order.status === "Preparing" ? "default" : "secondary"
                      }
                      className="mb-1"
                    >
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium">
                      UGX {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {lowStockItems.length} items are running low on stock
            </p>
            <Link href="/restaurant/inventory">
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 bg-transparent"
              >
                View Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
