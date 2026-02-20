/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Car,
  User,
  DollarSign,
  Clock,
  Wrench,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { washOrders, fetchWashOrders, loading } = useWashingBay();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchWashOrders();
  }, []);

  useEffect(() => {
    if (washOrders.length > 0 && orderId) {
      const foundOrder = washOrders.find((o) => o.id === orderId);
      setOrder(foundOrder);
    }
  }, [washOrders, orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Order Not Found
        </h3>
        <p className="text-gray-600 mb-4">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/washing-bay/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/washing-bay/orders")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">Order details and information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/washing-bay/orders/${order.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Order Status
                  </label>
                  <div className="mt-2">
                    <Badge
                      className={`text-sm ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Payment Status
                  </label>
                  <div className="mt-2">
                    <Badge
                      className={`text-sm ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Vehicle Type
                  </label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {order.vehicleType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    License Plate
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.licensePlate || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Vehicle Model
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.vehicleModel || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Color
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.vehicleColor || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.serviceType ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Service Type
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.serviceType.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Wash Type
                      </label>
                      <p className="text-gray-900 capitalize">
                        {order.serviceType.washType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Duration
                      </label>
                      <p className="text-gray-900">
                        {order.serviceType.estimatedDuration} minutes
                      </p>
                    </div>
                  </div>
                  {order.serviceType.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <p className="text-gray-900">
                        {order.serviceType.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  Service information not available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Customer Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.customer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{order.customer.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Customer Name
                    </label>
                    <p className="text-gray-900">
                      {order.customerName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <p className="text-gray-900">
                      {order.customerPhone || "Not provided"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Price:</span>
                <span className="font-semibold">
                  {formatCurrency(order.servicePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Material Cost:</span>
                <span className="font-semibold">
                  {formatCurrency(order.materialCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission:</span>
                <span className="font-semibold">
                  {formatCurrency(order.commissionAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Net Profit:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(order.netProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">
                  {formatCurrency(order.amountPaid)}
                </span>
              </div>
              {order.paymentStatus === "credit" && (
                <div className="flex justify-between text-orange-600">
                  <span>Credit Balance:</span>
                  <span className="font-semibold">
                    {formatCurrency(order.servicePrice - order.amountPaid)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Worker Information */}
          {order.worker && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Worker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    {order.worker.name}
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>
                      Commission:{" "}
                      {order.worker.commissionType === "percentage"
                        ? `${order.worker.commissionValue}%`
                        : formatCurrency(order.worker.commissionValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Order Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.orderDate)}
                </span>
              </div>
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order.completedAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/washing-bay/orders/${order.id}/edit`}
                className="w-full"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order Details
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              {order.paymentStatus !== "paid" && (
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
