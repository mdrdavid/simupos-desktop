/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Car, User, DollarSign, Save } from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";
import { VehicleType, PaymentStatus } from "@/src/types/washingBay";

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
  notes: string;
  customServicePrice?: number;
  customCommissionAmount?: number;
  overrideCommission?: boolean;
}

export default function NewOrderPage() {
  const router = useRouter();
  const {
    serviceTypes,
    workers,
    createWashOrder,
    fetchServiceTypes,
    fetchWorkers,
    loading,
  } = useWashingBay();
  const { currentBranchId } = useAuth();
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customServicePrice, setCustomServicePrice] = useState(0);
  const [overrideCommission, setOverrideCommission] = useState(false);
  const [customCommissionAmount, setCustomCommissionAmount] = useState(0);
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
    notes: "",
  });

  useEffect(() => {
    fetchServiceTypes();
    fetchWorkers();
  }, []);

  const handleInputChange = (
    field: keyof OrderFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBranchId) {
      console.error("No branch selected");
      return;
    }

    if (!formData.vehicleType) {
      console.error("Vehicle type is required");
      return;
    }

    try {
      const orderData = {
        ...formData,
        vehicleType: formData.vehicleType as VehicleType,
        branchId: currentBranchId,
        // custom pricing fields
        ...(useCustomPrice && { customServicePrice }),
        ...(overrideCommission && {
          customCommissionAmount,
          overrideCommission: true,
        }),
      };

      await createWashOrder(orderData);
      router.push("/washing-bay/orders");
    } catch (error) {
      console.error("Failed to create order:", error);
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
  // const netProfit = selectedService ? selectedService.price - commission : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Wash Order</h1>
          <p className="text-gray-600 mt-1">
            Create a new vehicle washing order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="taxi">Taxi</SelectItem>
                        <SelectItem value="coster">Coster</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <SelectTrigger>
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

            {/* Custom Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Custom Service Price Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="useCustomPrice">
                    Use Custom Service Price
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useCustomPrice"
                      checked={useCustomPrice}
                      onChange={(e) => setUseCustomPrice(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {useCustomPrice && (
                  <div className="space-y-2">
                    <Label htmlFor="customServicePrice">
                      Custom Service Price (UGX)
                    </Label>
                    <Input
                      id="customServicePrice"
                      type="number"
                      placeholder="Enter custom price"
                      value={customServicePrice}
                      onChange={(e) =>
                        setCustomServicePrice(parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="100"
                    />
                    <p className="text-sm text-gray-500">
                      Default price: UGX {selectedService?.price || 0}
                    </p>
                  </div>
                )}

                {/* Custom Commission Toggle */}
                {formData.workerId && (
                  <>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Label htmlFor="overrideCommission">
                        Override Commission
                      </Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="overrideCommission"
                          checked={overrideCommission}
                          onChange={(e) =>
                            setOverrideCommission(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {overrideCommission && (
                      <div className="space-y-2">
                        <Label htmlFor="customCommissionAmount">
                          Custom Commission Amount (UGX)
                        </Label>
                        <Input
                          id="customCommissionAmount"
                          type="number"
                          placeholder="Enter custom commission"
                          value={customCommissionAmount}
                          onChange={(e) =>
                            setCustomCommissionAmount(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          step="100"
                        />
                        <p className="text-sm text-gray-500">
                          Calculated commission: UGX{" "}
                          {commission.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
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
                    UGX{" "}
                    {useCustomPrice
                      ? customServicePrice
                      : selectedService?.price || 0}
                    {useCustomPrice && (
                      <span className="text-xs text-gray-500 ml-1 line-through">
                        {selectedService?.price || 0}
                      </span>
                    )}
                  </span>
                </div>
                {selectedWorker && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission:</span>
                    <span className="font-semibold">
                      UGX{" "}
                      {overrideCommission ? customCommissionAmount : commission}
                      {overrideCommission && (
                        <span className="text-xs text-gray-500 ml-1 line-through">
                          {commission.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className="font-semibold text-green-600">
                    UGX{" "}
                    {(
                      (useCustomPrice
                        ? customServicePrice
                        : selectedService?.price || 0) -
                      (overrideCommission ? customCommissionAmount : commission)
                    ).toLocaleString()}
                  </span>
                </div>

                {!currentBranchId && (
                  <div className="text-red-600 text-xs mt-2">
                    ⚠️ No branch selected. Please select a branch first.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={
                    loading ||
                    !formData.vehicleType ||
                    !formData.serviceTypeId ||
                    !currentBranchId
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
