/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  DollarSign,
  Users,
  Plus,
  Filter,
  ArrowUpDown,
  Table,
  User,
  ChefHat,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
  const { orders, tables } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">(
    "newest"
  );

  const statusOptions = [
    { value: "All", label: "All Orders", count: orders.length },
    {
      value: "Open",
      label: "Open",
      count: orders.filter((o) => o.status === "Open").length,
    },
    {
      value: "Preparing",
      label: "Preparing",
      count: orders.filter((o) => o.status === "Preparing").length,
    },
    {
      value: "Ready",
      label: "Ready",
      count: orders.filter((o) => o.status === "Ready").length,
    },
    {
      value: "Completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "Completed").length,
    },
    {
      value: "Cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status === "Cancelled").length,
    },
  ];

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.table.number.toString().includes(searchTerm) ||
        order.waiterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount":
          return b.total - a.total;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Preparing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Ready":
        return "bg-green-50 text-green-700 border-green-200";
      case "Completed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <Users className="h-3 w-3" />;
      case "Preparing":
        return <ChefHat className="h-3 w-3" />;
      case "Ready":
        return <CheckCircle className="h-3 w-3" />;
      case "Completed":
        return <CheckCircle className="h-3 w-3" />;
      case "Cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and track all restaurant orders
          </p>
        </div>
        <Link href="/restaurant/orders/new">
          <Button className="bg-gradient-to-r from-[#41A5A5] to-[#2E8B8B] hover:from-[#2E8B8B] hover:to-[#1A6B6B] text-white shadow-sm hover:shadow-md transition-all duration-300 h-11 px-6">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {orders.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {
                    orders.filter(
                      (o) => !["Completed", "Cancelled"].includes(o.status)
                    ).length
                  }
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Loader className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Filtered Revenue
                </p>
                <p className="text-lg font-bold text-purple-900">
                  UGX {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  Preparing
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {orders.filter((o) => o.status === "Preparing").length}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChefHat className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders, tables, or waiters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-[#41A5A5] transition-colors"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter by Status
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status.value}
                      variant={
                        statusFilter === status.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                      className={cn(
                        "whitespace-nowrap transition-all duration-200",
                        statusFilter === status.value
                          ? "bg-[#41A5A5] hover:bg-[#2E8B8B] text-white shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {status.label}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-2 text-xs",
                          statusFilter === status.value
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {status.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="lg:w-48">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Sort by
                  </span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:border-[#41A5A5] focus:outline-none focus:ring-1 focus:ring-[#41A5A5] transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Highest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "All"
                  ? "No matching orders"
                  : "No orders yet"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "All"
                  ? "No orders match your current search and filter criteria. Try adjusting your filters."
                  : "Get started by creating your first order for a table."}
              </p>
              <Link href="/restaurant/orders/new">
                <Button className="bg-gradient-to-r from-[#41A5A5] to-[#2E8B8B] hover:from-[#2E8B8B] hover:to-[#1A6B6B] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm group cursor-pointer"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#41A5A5] to-[#2E8B8B] rounded-xl flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <Table className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border text-xs font-medium flex items-center gap-1",
                              getStatusColor(order.status)
                            )}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Table className="h-3 w-3" />
                            Table {order.table.number}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.waiterName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        UGX {order.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Items:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200 text-xs"
                          >
                            {item.quantity}x {item.menuItem.name}
                          </Badge>
                        ))}
                        {order.items.length > 3 && (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-500 border-gray-200 text-xs"
                          >
                            +{order.items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Link
                      href={`/restaurant/orders/${order.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-10 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Button>
                    </Link>
                    {order.status !== "Completed" &&
                      order.status !== "Cancelled" && (
                        <Link
                          href={`/restaurant/checkout/${order.id}`}
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            className="w-full h-10 bg-gradient-to-r from-[#41A5A5] to-[#2E8B8B] hover:from-[#2E8B8B] hover:to-[#1A6B6B] text-white shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Checkout
                          </Button>
                        </Link>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
