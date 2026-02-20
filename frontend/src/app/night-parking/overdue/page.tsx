/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNightParking } from "@/context/NightParkingContext";
import {
  AlertCircle,
  Car,
  Clock,
  Phone,
  User,
  DollarSign,
  Receipt,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function OverduePage() {
  const router = useRouter();
  const { records, fetchRecords, getOverdueVehicles } =
    useNightParking();
  const [searchTerm, setSearchTerm] = useState("");
  const [overdueVehicles, setOverdueVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [contacting, setContacting] = useState<string | null>(null);

  // Fetch overdue vehicles
  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const overdue = await getOverdueVehicles();
        setOverdueVehicles(overdue);
      } catch (error) {
        console.error("Failed to fetch overdue vehicles:", error);
      }
    };

    fetchOverdue();
    fetchRecords();
  }, [getOverdueVehicles, fetchRecords]);

  // Filter overdue vehicles
  const filteredOverdue = overdueVehicles.filter((vehicle) => {
    return (
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverPhone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const calculateOverdueHours = (expectedCheckOut: string) => {
    const expected = new Date(expectedCheckOut);
    const now = new Date();
    const hours = (now.getTime() - expected.getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.floor(hours));
  };

  const calculatePenalty = (vehicle: any) => {
    const overdueHours = calculateOverdueHours(vehicle.expectedCheckOut);
    // UGX 5000 per hour penalty
    const penaltyRate = 5000;
    return overdueHours * penaltyRate;
  };

  const handleContactDriver = async (vehicle: any) => {
    if (!vehicle.driverPhone) {
      toast.error("No phone number available for this driver");
      return;
    }

    setContacting(vehicle.id);
    try {
      // Simulate API call to send notification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Notification sent to driver!", {
        description: `Contacted ${vehicle.driverName || "driver"} at ${vehicle.driverPhone}`,
      });
    } catch (error) {
      toast.error("Failed to contact driver");
    } finally {
      setContacting(null);
    }
  };

  const handleCheckOut = (vehicle: any) => {
    router.push(`/night-parking/check-out?ticket=${vehicle.ticketNumber}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSeverityColor = (overdueHours: number) => {
    if (overdueHours < 2) return "bg-yellow-500/20 text-yellow-400";
    if (overdueHours < 6) return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Overdue Vehicles
                </h1>
              </div>
              <p className="text-gray-500">
                Monitor and manage vehicles that have exceeded their parking duration
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => router.push("/night-parking/records")}
              >
                View All Records
              </Button>
              <Button
                onClick={() => router.push("/night-parking/check-in")}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
              >
                New Check-in
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {overdueVehicles.length}
                </div>
                <div className="text-gray-500">Total Overdue</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {overdueVehicles.filter((v) => calculateOverdueHours(v.expectedCheckOut) > 6).length}
                </div>
                <div className="text-gray-500">Severe (6hrs)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {formatCurrency(
                    overdueVehicles.reduce((sum, v) => sum + calculatePenalty(v), 0)
                  )}
                </div>
                <div className="text-gray-500">Total Penalty Due</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {records.filter((r) => r.status === "parked").length}
                </div>
                <div className="text-gray-500">Currently Parked</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search overdue vehicles..."
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Vehicles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Overdue List */}
          <div>
            <Card className="border-0 bg-white shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Overdue Vehicles ({filteredOverdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOverdue.map((vehicle) => {
                    const overdueHours = calculateOverdueHours(
                      vehicle.expectedCheckOut
                    );
                    const penalty = calculatePenalty(vehicle);

                    return (
                      <div
                        key={vehicle.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${
                          selectedVehicle?.id === vehicle.id
                            ? "bg-red-50 border-red-200 shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 border-transparent"
                        }`}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                              <Car className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {vehicle.licensePlate}
                              </div>
                              <div className="text-sm text-gray-500 font-mono">
                                {vehicle.ticketNumber}
                              </div>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(overdueHours)}>
                            {overdueHours}h overdue
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Driver</div>
                            <div className="text-sm text-gray-900 font-medium flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-400" />
                              {vehicle.driverName || "Unknown"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Penalty</div>
                            <div className="text-sm text-red-600 font-bold flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(penalty)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactDriver(vehicle);
                            }}
                            disabled={contacting === vehicle.id}
                          >
                            {contacting === vehicle.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-primary"></div>
                            ) : (
                              <>
                                <Phone className="h-3 w-3 mr-1" />
                                Contact
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckOut(vehicle);
                            }}
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Check-out
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredOverdue.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No overdue vehicles found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {overdueVehicles.length === 0
                          ? "All vehicles are on time!"
                          : "Try adjusting your search"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Vehicle Details */}
          <div>
            {selectedVehicle ? (
              <Card className="border-0 bg-white shadow-md h-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Car className="h-5 w-5 text-brand-primary" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedVehicle.licensePlate}
                        </div>
                        <div className="text-gray-500 font-mono">
                          Ticket: {selectedVehicle.ticketNumber}
                        </div>
                      </div>
                      <Badge
                        className={
                          getSeverityColor(
                            calculateOverdueHours(selectedVehicle.expectedCheckOut)
                          )
                        }
                      >
                        {calculateOverdueHours(selectedVehicle.expectedCheckOut)}h
                        overdue
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-sm">
                          Vehicle Type
                        </Label>
                        <div className="text-gray-900 font-medium">{selectedVehicle.vehicleType}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-sm">Color</Label>
                        <div className="text-gray-900 font-medium">
                          {selectedVehicle.vehicleColor || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-primary" />
                      Timing Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Check-in Time</div>
                          <div className="text-gray-900 font-medium">
                            {new Date(selectedVehicle.checkInTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">
                            Expected Check-out
                          </div>
                          <div className="text-gray-900 font-medium">
                            {new Date(
                              selectedVehicle.expectedCheckOut
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Overdue Duration</div>
                          <div className="text-orange-600 font-bold">
                            {calculateOverdueHours(selectedVehicle.expectedCheckOut)}{" "}
                            hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-brand-primary" />
                      Driver Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Driver Name</div>
                          <div className="text-gray-900 font-medium">
                            {selectedVehicle.driverName || "Not specified"}
                          </div>
                        </div>
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Phone Number</div>
                          <div className="text-gray-900 font-medium">
                            {selectedVehicle.driverPhone || "Not specified"}
                          </div>
                        </div>
                        <Phone className="h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  {/* Penalty Calculation */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-brand-primary" />
                      Penalty Calculation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Original Amount</span>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(selectedVehicle.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-red-600">Penalty Charges</span>
                        <span className="text-red-600 font-bold">
                          {formatCurrency(calculatePenalty(selectedVehicle))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-brand-primary text-white rounded-lg shadow-md">
                        <span className="font-semibold">Total Due</span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(
                            (selectedVehicle.totalAmount || 0) +
                              calculatePenalty(selectedVehicle)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => handleContactDriver(selectedVehicle)}
                      disabled={contacting === selectedVehicle.id}
                    >
                      {contacting === selectedVehicle.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Driver
                        </>
                      )}
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md"
                      onClick={() => handleCheckOut(selectedVehicle)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Process Check-out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 bg-white shadow-md h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Vehicle
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Click on any overdue vehicle from the list to view detailed
                    information and take action.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-primary/10 rounded-xl">
                  <Phone className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    Bulk Notification
                  </div>
                  <p className="text-sm text-gray-500">
                    Send reminders to all overdue vehicles
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-gray-200 text-gray-600"
                onClick={() => {
                  toast.info("Bulk notification feature coming soon!");
                }}
              >
                Send Bulk SMS
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    Quick Check-out
                  </div>
                  <p className="text-sm text-gray-500">
                    Process departure for selected vehicle
                  </p>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                disabled={!selectedVehicle}
                onClick={() =>
                  selectedVehicle && handleCheckOut(selectedVehicle)
                }
              >
                Check-out Selected
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    Report Issue
                  </div>
                  <p className="text-sm text-gray-500">
                    Report abandoned or problematic vehicles
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => {
                  toast.info("Issue reporting feature coming soon!");
                }}
              >
                Report Vehicle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}