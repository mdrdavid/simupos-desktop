/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNightParking } from "@/context/NightParkingContext";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  Camera,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  ParkingCircle,
  ParkingCircleOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  CheckInVehicleRequest,
  NightParkingPricing,
  NightParkingSlot,
} from "@/src/types/nightParking";

export default function CheckInPage() {
  const router = useRouter();
  const { checkInVehicle, getAvailableSlots, getPricingByVehicleType } =
    useNightParking();
  const { user, currentBranchId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<NightParkingSlot[]>([]);
  const [pricing, setPricing] = useState<NightParkingPricing[]>([]);
  const [assignSlot, setAssignSlot] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CheckInVehicleRequest>({
    vehicleType: "",
    licensePlate: "",
    vehicleModel: "",
    vehicleColor: "",
    customerName: "",
    customerPhone: "",
    pricingId: "",
    slotId: "",
    checkInNotes: "",
    expectedCheckOut: "",
    checkInPhotos: [],
    workerId: user?.id,
    branchId: currentBranchId || "",
  });

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const slots = await getAvailableSlots();
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      }
    };

    fetchSlots();
  }, [getAvailableSlots]);

  // Fetch pricing when vehicle type changes
  useEffect(() => {
    const fetchPricing = async () => {
      if (formData.vehicleType) {
        try {
          const prices = await getPricingByVehicleType(formData.vehicleType);
          setPricing(prices);
          // Auto-select the first active price
          const activePrice = prices.find((p) => p.isActive);
          if (activePrice) {
            setFormData((prev) => ({
              ...prev,
              pricingId: activePrice.id,
            }));
          } else {
            // Clear pricingId if no active pricing is found
            setFormData((prev) => ({
              ...prev,
              pricingId: "",
            }));
          }
        } catch (error) {
          console.error("Failed to fetch pricing:", error);
          // Clear pricingId on error
          setFormData((prev) => ({
            ...prev,
            pricingId: "",
          }));
        }
      } else {
        // Clear pricingId when vehicle type is cleared
        setFormData((prev) => ({
          ...prev,
          pricingId: "",
        }));
        setPricing([]);
      }
    };

    fetchPricing();
  }, [formData.vehicleType, getPricingByVehicleType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof CheckInVehicleRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckIn = async () => {
    // Only require license plate and vehicle type
    if (!formData.licensePlate || !formData.vehicleType) {
      toast.error("Please fill in license plate and vehicle type");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    if (!currentBranchId) {
      toast.error("No branch selected");
      return;
    }

    setLoading(true);
    try {
      const checkInData: CheckInVehicleRequest = {
        vehicleType: formData.vehicleType,
        licensePlate: formData.licensePlate.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        vehicleColor: formData.vehicleColor,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        // Only include slotId if assignSlot is true and slot is selected
        slotId: assignSlot ? formData.slotId : undefined,
        // Only include pricingId if it has a value
        pricingId: formData.pricingId || undefined,
        checkInNotes: formData.checkInNotes,
        expectedCheckOut: formData.expectedCheckOut || undefined,
        checkInPhotos: formData.checkInPhotos,
        workerId: user.id,
        branchId: currentBranchId,
      };

      const response = await checkInVehicle(checkInData);
      toast.success("Vehicle checked in successfully!", {
        description: `Ticket #${response.ticketNumber} generated`,
      });

      // Reset form
      setFormData({
        vehicleType: "",
        licensePlate: "",
        vehicleModel: "",
        vehicleColor: "",
        customerName: "",
        customerPhone: "",
        pricingId: "",
        slotId: "",
        checkInNotes: "",
        expectedCheckOut: "",
        checkInPhotos: [],
        workerId: user.id,
        branchId: currentBranchId,
      });
      setAssignSlot(false);

      // Navigate to records page
      router.push("/night-parking/records");
    } catch (error: any) {
      toast.error("Check-in failed", {
        description: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = ["car", "suv", "truck", "boda", "van", "any"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Check-in Vehicle</h1>
          </div>
          <p className="text-gray-500">
            Register a new vehicle for night parking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Car className="h-5 w-5 text-brand-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* License Plate */}
                <div className="space-y-2">
                  <Label htmlFor="licensePlate" className="text-gray-700">
                    License Plate <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="ABC 123D"
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white"
                    required
                  />
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType" className="text-gray-700">
                      Vehicle Type <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) =>
                        handleSelectChange("vehicleType", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {vehicleTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-gray-900 hover:bg-gray-50"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor" className="text-gray-700">
                      Vehicle Color
                    </Label>
                    <Input
                      id="vehicleColor"
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleInputChange}
                      placeholder="e.g., Red, Blue, Black"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel" className="text-gray-700">
                      Model
                    </Label>
                    <Input
                      id="vehicleModel"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      placeholder="e.g., Toyota Camry"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-gray-700">
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-6">
                    <User className="h-5 w-5 text-brand-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="+256 XXX XXX XXX"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Parking Details */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Parking Details
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={assignSlot}
                        onCheckedChange={setAssignSlot}
                        className="data-[state=checked]:bg-brand-primary"
                      />
                      <span className="text-sm text-gray-600">
                        {assignSlot ? "Assign Slot" : "No Slot"}
                      </span>
                    </div>
                  </div>

                  <div className={`grid gap-4 ${assignSlot ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                    {assignSlot && (
                      <div className="space-y-2">
                        <Label htmlFor="slotId" className="text-gray-700">
                          Parking Slot <span className="text-red-600">*</span>
                        </Label>
                        <Select
                          value={formData.slotId}
                          onValueChange={(value) =>
                            handleSelectChange("slotId", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                            <SelectValue placeholder="Select parking slot" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {availableSlots.map((slot) => (
                              <SelectItem
                                key={slot.id}
                                value={slot.id}
                                className="text-gray-900 hover:bg-gray-50"
                              >
                                {slot.slotNumber} - {slot.vehicleType} (
                                {slot.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {!assignSlot && (
                      <p className="text-sm text-yellow-600 font-medium">
                        Vehicle will be checked in without a specific parking
                        slot assignment
                      </p>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="expectedCheckOut"
                        className="text-gray-700"
                      >
                        Expected Check-out
                      </Label>
                      <Input
                        id="expectedCheckOut"
                        name="expectedCheckOut"
                        type="datetime-local"
                        value={formData.expectedCheckOut}
                        onChange={handleInputChange}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                {pricing.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">Selected Rate</Label>
                    <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                      {pricing
                        .filter((p) => p.id === formData.pricingId)
                        .map((price) => (
                          <div
                            key={price.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <span className="text-gray-900 font-medium">
                                {price.name} ({price.priceType})
                              </span>
                              <p className="text-sm text-gray-500">
                                Base: {formatCurrency(price.basePrice)} •
                                Hourly: {formatCurrency(price.hourlyRate)}
                              </p>
                              {price.description && (
                                <p className="text-sm text-gray-500">
                                  {price.description}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="checkInNotes" className="text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="checkInNotes"
                    name="checkInNotes"
                    value={formData.checkInNotes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or notes..."
                    className="bg-gray-50 border-gray-200 text-gray-900 min-h-[100px]"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg transition-all text-white py-6 text-lg rounded-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Checking in...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Check-in Vehicle
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-primary" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                  <div className="flex items-center gap-2">
                    {assignSlot ? (
                      <ParkingCircle className="h-4 w-4 text-brand-primary" />
                    ) : (
                      <ParkingCircleOff className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-gray-700">Slot Assignment</span>
                  </div>
                  <Badge
                    className={
                      assignSlot
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {assignSlot ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Check-in Time</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-secondary/5 rounded-lg border border-brand-secondary/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-secondary" />
                    <span className="text-gray-700">Today&apos;s Date</span>
                  </div>
                  <Badge className="bg-brand-secondary/10 text-brand-secondary">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-700">Check-in Staff</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    {user?.firstName || "Staff"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Available Slots Preview */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-primary" />
                  Available Slots
                  <Badge className="bg-green-100 text-green-700 ml-2">
                    {
                      availableSlots.filter((s) => s.status === "available")
                        .length
                    }
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableSlots
                    .filter((s) => s.status === "available")
                    .slice(0, 5)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          formData.slotId === slot.id
                            ? "bg-brand-primary/10 border border-brand-primary/30"
                            : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                        } ${!assignSlot ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() =>
                          assignSlot && handleSelectChange("slotId", slot.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">
                              {slot.slotNumber}
                            </span>
                            <p className="text-sm text-gray-500">
                              {slot.vehicleType}
                              {(slot.premiumCharge ?? 0) > 0 && (
                                <span className="text-yellow-600 font-medium ml-2">
                                  +{formatCurrency(slot.premiumCharge ?? 0)}
                                </span>
                              )}
                            </p>
                          </div>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700"
                          >
                            Available
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {availableSlots.filter((s) => s.status === "available")
                    .length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-gray-200 text-gray-500 hover:bg-gray-50"
                      onClick={() => router.push("/night-parking/slots")}
                    >
                      View All{" "}
                      {
                        availableSlots.filter((s) => s.status === "available")
                          .length
                      }{" "}
                      Slots
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Camera Preview */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-brand-primary" />
                  Vehicle Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                  <Camera className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">
                    Camera preview will appear here
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-gray-200 text-gray-500 hover:bg-gray-50"
                    onClick={() => {
                      // In real app, this would capture photo
                      setFormData((prev) => ({
                        ...prev,
                        checkInPhotos: [
                          ...(prev.checkInPhotos || []),
                          "photo-url",
                        ],
                      }));
                      toast.info("Photo capture feature coming soon!");
                    }}
                  >
                    Capture Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
