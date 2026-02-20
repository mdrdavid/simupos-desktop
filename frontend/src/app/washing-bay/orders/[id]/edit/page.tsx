/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Car, User, DollarSign } from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";
import {
  VehicleType,
  PaymentStatus,
  WashOrderStatus,
} from "@/src/types/washingBay";

interface OrderFormData {
  vehicleType: VehicleType | "";
  licensePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  serviceTypeId: string;
  workerId: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  status: WashOrderStatus;
  notes: string;
}

interface OrderFormErrors {
  vehicleType?: string;
  serviceTypeId?: string;
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const {
    washOrders,
    serviceTypes,
    workers,
    fetchWashOrders,
    fetchServiceTypes,
    fetchWorkers,
    updateWashOrderStatus,
    loading,
  } = useWashingBay();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState<OrderFormData>({
    vehicleType: "",
    licensePlate: "",
    vehicleModel: "",
    vehicleColor: "",
    serviceTypeId: "",
    workerId: "",
    customerName: "",
    customerPhone: "",
    paymentStatus: "pending",
    amountPaid: 0,
    status: "pending",
    notes: "",
  });

  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWashOrders();
    fetchServiceTypes();
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (washOrders.length > 0 && orderId) {
      const order = washOrders.find((o) => o.id === orderId);
      if (order) {
        setFormData({
          vehicleType: order.vehicleType,
          licensePlate: order.licensePlate || "",
          vehicleModel: order.vehicleModel || "",
          vehicleColor: order.vehicleColor || "",
          serviceTypeId: order.serviceTypeId,
          workerId: order.workerId || "",
          customerName: order.customerName || "",
          customerPhone: order.customerPhone || "",
          paymentStatus: order.paymentStatus,
          amountPaid: order.amountPaid,
          status: order.status,
          notes: order.notes || "",
        });
      }
    }
  }, [washOrders, orderId]);

  const validateForm = (): boolean => {
    const newErrors: OrderFormErrors = {};

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = "Service type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof OrderFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof OrderFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleStatusUpdate = async (newStatus: WashOrderStatus) => {
    try {
      await updateWashOrderStatus(orderId, newStatus);
      // Refresh the order data
      fetchWashOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll just update the status as the main edit functionality
      // You can expand this to update other fields as needed
      await handleStatusUpdate(formData.status);
      router.push(`/washing-bay/orders/${orderId}`);
    } catch (error: any) {
      console.error("Failed to update order:", error);
      alert(`Failed to update order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = serviceTypes.find(
    (s) => s.id === formData.serviceTypeId
  );
  const selectedWorker = workers.find((w: any) => w.id === formData.workerId);

  const calculateCommission = () => {
    if (!selectedService || !selectedWorker) return 0;

    if (selectedWorker.commissionType === "percentage") {
      return (selectedService.price * selectedWorker.commissionValue) / 100;
    } else {
      return selectedWorker.commissionValue;
    }
  };

  const commission = calculateCommission();
  const netProfit = selectedService ? selectedService.price - commission : 0;

  if (loading && !formData.vehicleType) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/washing-bay/orders/${orderId}`)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Wash Order</h1>
          <p className="text-gray-600 mt-1">Update order details and status</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Order Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: WashOrderStatus) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: PaymentStatus) =>
                        handleInputChange("paymentStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value: VehicleType) =>
                        handleInputChange("vehicleType", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.vehicleType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-sm">
                        {errors.vehicleType}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      placeholder="e.g., UAB 123A"
                      value={formData.licensePlate}
                      onChange={(e) =>
                        handleInputChange("licensePlate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                    <Input
                      id="vehicleModel"
                      placeholder="e.g., Toyota RAV4"
                      value={formData.vehicleModel}
                      onChange={(e) =>
                        handleInputChange("vehicleModel", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Color</Label>
                    <Input
                      id="vehicleColor"
                      placeholder="e.g., Red"
                      value={formData.vehicleColor}
                      onChange={(e) =>
                        handleInputChange("vehicleColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Service Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceTypeId">Service Type *</Label>
                  <Select
                    value={formData.serviceTypeId}
                    onValueChange={(value) =>
                      handleInputChange("serviceTypeId", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.serviceTypeId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes
                        .filter((s: any) => s.isActive)
                        .map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.vehicleType} (
                            {service.washType}) - UGX {service.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceTypeId && (
                    <p className="text-red-500 text-sm">
                      {errors.serviceTypeId}
                    </p>
                  )}
                </div>

                {selectedService && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">
                      {selectedService.name}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {selectedService.vehicleType} • {selectedService.washType}{" "}
                      • {selectedService.estimatedDuration} minutes
                    </p>
                    {selectedService.description && (
                      <p className="text-sm text-blue-600 mt-1">
                        {selectedService.description}
                      </p>
                    )}
                  </div>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      placeholder="Enter phone number"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions or notes..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Worker Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="workerId">Assign Worker</Label>
                  <Select
                    value={formData.workerId}
                    onValueChange={(value) =>
                      handleInputChange("workerId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers
                        .filter((w: any) => w.isActive)
                        .map((worker: any) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} (
                            {worker.commissionType === "percentage"
                              ? `${worker.commissionValue}%`
                              : `UGX ${worker.commissionValue}`}
                            )
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.paymentStatus !== "pending" && (
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid (UGX)</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      placeholder="0"
                      value={formData.amountPaid}
                      onChange={(e) =>
                        handleInputChange(
                          "amountPaid",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="100"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Price:</span>
                  <span className="font-semibold">
                    UGX {selectedService?.price || 0}
                  </span>
                </div>

                {selectedWorker && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission:</span>
                    <span className="font-semibold">
                      UGX {commission.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className="font-semibold text-green-600">
                    UGX {netProfit.toLocaleString()}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Updating..." : "Update Order"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Status Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={formData.status === "in_progress"}
                >
                  Mark as In Progress
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-green-600 hover:text-green-700"
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={formData.status === "completed"}
                >
                  Mark as Completed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={formData.status === "cancelled"}
                >
                  Cancel Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
