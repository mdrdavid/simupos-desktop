/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChefHat,
  CheckCircle,
  AlertCircle,
  Timer,
  Sparkles,
  Filter,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useRestaurant();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const statusOptions = [
    { value: "All", label: "All Orders", color: "gray" },
    { value: "New", label: "New", color: "red" },
    { value: "Preparing", label: "Preparing", color: "yellow" },
    { value: "Ready", label: "Ready", color: "green" },
  ];

  // Convert orders to kitchen tickets
  const kitchenTickets = useMemo(() => {
    return orders
      .filter(
        (order) => order.status !== "Completed" && order.status !== "Cancelled"
      )
      .map((order) => ({
        id: order.id,
        orderId: order.id,
        tableNumber: order.table.number,
        items: order.items,
        priority:
          order.items.length > 5
            ? "High"
            : order.items.length > 2
              ? "Medium"
              : "Low",
        estimatedTime: order.items.reduce(
          (total, item) => total + item.menuItem.preparationTime,
          0
        ),
        createdAt: order.createdAt,
        status:
          order.status === "Open"
            ? "New"
            : order.status === "Preparing"
              ? "Preparing"
              : "Ready",
        waiterName: order.waiterName,
      }))
      .filter(
        (ticket) => selectedStatus === "All" || ticket.status === selectedStatus
      )
      .sort((a, b) => {
        // Sort by priority and then by creation time
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        if (
          priorityOrder[a.priority as keyof typeof priorityOrder] !==
          priorityOrder[b.priority as keyof typeof priorityOrder]
        ) {
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          );
        }
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [orders, selectedStatus]);

  const getTicketColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-gradient-to-br from-red-50 to-red-100/30 border-l-4 border-l-red-500";
      case "Preparing":
        return "bg-gradient-to-br from-yellow-50 to-yellow-100/30 border-l-4 border-l-yellow-500";
      case "Ready":
        return "bg-gradient-to-br from-green-50 to-green-100/30 border-l-4 border-l-green-500";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100/30 border-l-4 border-l-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <Zap className="h-3 w-3" />;
      case "Medium":
        return <TrendingUp className="h-3 w-3" />;
      case "Low":
        return <Coffee className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
  };

  const getElapsedTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60)
    );
    return diffInMinutes;
  };

  const isOrderOverdue = (ticket: any) => {
    return getElapsedTime(ticket.createdAt) > ticket.estimatedTime;
  };

  const isOrderUrgent = (ticket: any) => {
    const elapsed = getElapsedTime(ticket.createdAt);
    return (
      elapsed > ticket.estimatedTime * 0.7 && elapsed <= ticket.estimatedTime
    );
  };

  // Statistics
  const stats = useMemo(() => {
    const total = kitchenTickets.length;
    const newOrders = kitchenTickets.filter((t) => t.status === "New").length;
    const preparing = kitchenTickets.filter(
      (t) => t.status === "Preparing"
    ).length;
    const ready = kitchenTickets.filter((t) => t.status === "Ready").length;
    const overdue = kitchenTickets.filter((t) => isOrderOverdue(t)).length;

    return { total, newOrders, preparing, ready, overdue };
  }, [kitchenTickets]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Kitchen Display
            </h1>
            <p className="text-gray-600 text-lg">
              Real-time order management and food preparation tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChefHat className="h-5 w-5 text-orange-600" />
            </div>
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 text-sm px-3 py-1.5"
            >
              {kitchenTickets.length} Active Orders
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">New</p>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.newOrders}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">
                    Preparing
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.preparing}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ChefHat className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Ready
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.ready}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.overdue}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    selectedStatus === status.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                  className={cn(
                    "whitespace-nowrap transition-all duration-200",
                    selectedStatus === status.value
                      ? `bg-gradient-to-r from-${status.color}-600 to-${status.color}-700 hover:from-${status.color}-700 hover:to-${status.color}-800 text-white shadow-sm`
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  )}
                >
                  {status.label}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-2 text-xs",
                      selectedStatus === status.value
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {
                      kitchenTickets.filter(
                        (t) =>
                          status.value === "All" || t.status === status.value
                      ).length
                    }
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Tickets */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kitchenTickets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Card className="border-0 shadow-sm max-w-md mx-auto">
                <CardContent className="py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Kitchen is Clear!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    All orders have been processed. New orders will appear here
                    automatically.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Waiting for new orders...
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            kitchenTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={cn(
                  "relative border-0 shadow-sm hover:shadow-md transition-all duration-300 group",
                  getTicketColor(ticket.status)
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                          {ticket.tableNumber}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            Table {ticket.tableNumber}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            by {ticket.waiterName}
                          </div>
                        </div>
                      </CardTitle>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm font-medium flex items-center gap-1 px-2 py-1",
                          getPriorityColor(ticket.priority)
                        )}
                      >
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                      >
                        {ticket.items.length} item
                        {ticket.items.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  {/* Time Indicators */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {getElapsedTime(ticket.createdAt)}m ago
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Timer className="h-4 w-4" />~{ticket.estimatedTime}m
                      </div>
                    </div>

                    {/* Urgent/Overdue Indicators */}
                    {isOrderOverdue(ticket) && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 text-xs animate-pulse"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                    {isOrderUrgent(ticket) && !isOrderOverdue(ticket) && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {ticket.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {item.menuItem.name}
                            </p>
                            <span className="font-bold text-blue-600 text-lg">
                              ×{item.quantity}
                            </span>
                          </div>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-gray-600 mb-1">
                              {item.modifiers.map((mod) => mod.name).join(", ")}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium whitespace-nowrap",
                            item.status === "Pending" &&
                              "bg-red-50 text-red-700 border-red-200",
                            item.status === "Preparing" &&
                              "bg-yellow-50 text-yellow-700 border-yellow-200",
                            item.status === "Ready" &&
                              "bg-green-50 text-green-700 border-green-200"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {ticket.status === "New" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(ticket.orderId, "Preparing")
                        }
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-11"
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}

                    {ticket.status === "Preparing" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(ticket.orderId, "Ready")
                        }
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-11"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Ready
                      </Button>
                    )}

                    {ticket.status === "Ready" && (
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-green-800 mb-1">
                          Ready for Service
                        </p>
                        <p className="text-sm text-green-700">
                          Awaiting server pickup
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
