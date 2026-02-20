"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Car,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";
import { WashOrderStatus, PaymentStatus } from "@/src/types/washingBay";

export default function OrdersPage() {
  const {
    washOrders,
    fetchWashOrders,
    deleteWashOrder,
    updateWashOrderStatus,
    updateWashOrderPaymentStatus,
    loading,
  } = useWashingBay();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("day");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [periodFilter]);

  const loadOrders = async () => {
    await fetchWashOrders({
      period: periodFilter as "day" | "week" | "month" | "year" | "custom",
    });
  };

  const handleDeleteOrder = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      try {
        await deleteWashOrder(id);
        loadOrders(); // Reload data
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order");
      }
    }
  };

  // Quick status update handler
  const handleQuickStatusUpdate = async (
    orderId: string,
    newStatus: WashOrderStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateWashOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Quick payment status update handler
  const handleQuickPaymentStatusUpdate = async (
    orderId: string,
    newPaymentStatus: PaymentStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateWashOrderPaymentStatus(orderId, newPaymentStatus);
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = washOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "credit":
        return "bg-orange-100 text-orange-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        return "Custom";
      default:
        return period;
    }
  };

  // Status options for quick update
  const statusOptions = [
    {
      value: "pending" as WashOrderStatus,
      label: "Pending",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      value: "in_progress" as WashOrderStatus,
      label: "In Progress",
      icon: RefreshCw,
      color: "text-blue-600",
    },
    {
      value: "completed" as WashOrderStatus,
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "cancelled" as WashOrderStatus,
      label: "Cancelled",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  // Payment status options for quick update
  const paymentStatusOptions = [
    {
      value: "pending" as PaymentStatus,
      label: "Pending",
      color: "text-yellow-600",
    },
    { value: "paid" as PaymentStatus, label: "Paid", color: "text-green-600" },
    {
      value: "credit" as PaymentStatus,
      label: "Credit",
      color: "text-orange-600",
    },
  ];

  if (loading && !washOrders.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wash Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all washing bay orders for{" "}
            {getPeriodLabel(periodFilter).toLowerCase()}
          </p>
        </div>
        <Link href="/washing-bay/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, license plates, models, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl">Order Records</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            Showing {filteredOrders.length} of {washOrders.length} orders
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <Link
                        href={`/washing-bay/orders/${order.id}`}
                        className="min-w-0"
                      >
                        <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer text-base sm:text-lg">
                          {order.orderNumber}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={`${getStatusColor(order.status)} text-xs`}
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          className={`${getPaymentStatusColor(order.paymentStatus)} text-xs`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {order.vehicleType} •{" "}
                            {order.vehicleModel || "No model"}
                            {order.licensePlate && ` • ${order.licensePlate}`}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 flex-shrink-0" />
                          {formatCurrency(order.servicePrice)}
                        </span>
                        {order.customerName && (
                          <span className="truncate">
                            Customer: {order.customerName}
                          </span>
                        )}
                      </div>
                      {order.worker && (
                        <div className="text-xs text-gray-500">
                          Assigned to: {order.worker.name}
                        </div>
                      )}
                    </div>

                    {/* Quick Update Buttons */}
                    <div className="flex flex-col gap-3 mt-3">
                      {/* Status Update Buttons */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          Status:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {statusOptions.map((statusOption) => {
                            const IconComponent = statusOption.icon;
                            const isCurrentStatus =
                              order.status === statusOption.value;
                            const isUpdating = updatingOrderId === order.id;

                            return (
                              <Button
                                key={statusOption.value}
                                variant={
                                  isCurrentStatus ? "default" : "outline"
                                }
                                size="sm"
                                className={`h-8 px-3 text-xs flex items-center gap-1 ${
                                  isCurrentStatus
                                    ? statusOption.color
                                        .replace("text-", "bg-")
                                        .replace("-600", "-500") + " text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                  handleQuickStatusUpdate(
                                    order.id,
                                    statusOption.value
                                  )
                                }
                                disabled={isCurrentStatus || isUpdating}
                              >
                                {isUpdating &&
                                order.status === statusOption.value ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                  <IconComponent className="h-3 w-3" />
                                )}
                                <span>{statusOption.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payment Status Update Buttons */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          Payment:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {paymentStatusOptions.map((paymentOption) => {
                            const isCurrentStatus =
                              order.paymentStatus === paymentOption.value;
                            const isUpdating = updatingOrderId === order.id;

                            return (
                              <Button
                                key={paymentOption.value}
                                variant={
                                  isCurrentStatus ? "default" : "outline"
                                }
                                size="sm"
                                className={`h-8 px-3 text-xs flex items-center gap-1 ${
                                  isCurrentStatus
                                    ? paymentOption.color
                                        .replace("text-", "bg-")
                                        .replace("-600", "-500") + " text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                  handleQuickPaymentStatusUpdate(
                                    order.id,
                                    paymentOption.value
                                  )
                                }
                                disabled={isCurrentStatus || isUpdating}
                              >
                                {isUpdating &&
                                order.paymentStatus === paymentOption.value ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                ) : null}
                                <span>{paymentOption.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end lg:justify-start gap-2 flex-shrink-0">
                  <Link href={`/washing-bay/orders/${order.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Details"
                      className="h-9 w-9"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/washing-bay/orders/${order.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit Order"
                      className="h-9 w-9"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteOrder(order.id)}
                    title="Delete Order"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {washOrders.length === 0
                    ? "No orders found"
                    : "No matching orders"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first wash order"}
                </p>
                <Link href="/washing-bay/orders/new">
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Order
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

