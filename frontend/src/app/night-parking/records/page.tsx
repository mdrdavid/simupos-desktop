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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNightParking } from "@/context/NightParkingContext";
import {
  Car,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Receipt,
  Clock,
  DollarSign,
  User,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  NightParkingRecord,
  ParkingStatus,
  PaymentStatus,
  PaymentMethod,
  NightParkingPricing,
  NightParkingSlot,
} from "@/src/types/nightParking";

export default function RecordsPage() {
  const router = useRouter();
  const { records, fetchRecords, loading } = useNightParking();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicleType, setFilterVehicleType] = useState("all");
  const [selectedRecord, setSelectedRecord] =
    useState<NightParkingRecord | null>(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Fetch records on mount
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.customerName &&
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.customerPhone &&
        record.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    const matchesVehicleType =
      filterVehicleType === "all" || record.vehicleType === filterVehicleType;

    // Date range filter
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const checkInDate = new Date(record.checkInTime);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      matchesDate = checkInDate >= startDate && checkInDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesVehicleType && matchesDate;
  });

  const getStatusColor = (status: ParkingStatus) => {
    switch (status) {
      case "parked":
        return "bg-blue-500/20 text-blue-400";
      case "checked_out":
        return "bg-green-500/20 text-green-400";
      case "extended":
        return "bg-yellow-500/20 text-yellow-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      case "cancelled":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case "car":
        return "bg-blue-500/20 text-blue-400";
      case "suv":
        return "bg-purple-500/20 text-purple-400";
      case "truck":
        return "bg-orange-500/20 text-orange-400";
      case "boda":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "partial":
        return "bg-blue-500/20 text-blue-400";
      case "credit":
        return "bg-purple-500/20 text-purple-400";
      case "refunded":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const vehicleTypes = ["car", "suv", "truck", "boda", "van", "any"];
  const statuses: ParkingStatus[] = [
    "parked",
    "checked_out",
    "extended",
    "overdue",
    "cancelled",
  ];
  const paymentStatuses: PaymentStatus[] = [
    "pending",
    "partial",
    "paid",
    "credit",
    "refunded",
  ];

  // Add this helper function at the top of your component
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  // Update your formatCurrency function to use safeNumber
  const formatCurrency = (amount: number) => {
    const safeAmount = safeNumber(amount);
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(safeAmount);
  };

  const calculateDuration = (checkInTime: string, checkOutTime?: string) => {
    const start = new Date(checkInTime);
    const end = checkOutTime ? new Date(checkOutTime) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
  };

  const exportRecords = () => {
    // Simple CSV export
    const headers = [
      "Ticket Number",
      "License Plate",
      "Vehicle Type",
      "Check-in Time",
      "Check-out Time",
      "Duration",
      "Total Amount",
      "Amount Paid",
      "Status",
      "Payment Status",
      "Payment Method",
      "Customer Name",
      "Customer Phone",
    ];

    const csvData = filteredRecords.map((record) => [
      record.ticketNumber,
      record.licensePlate,
      record.vehicleType,
      new Date(record.checkInTime).toLocaleString(),
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "",
      calculateDuration(record.checkInTime, record.checkOutTime),
      record.totalAmount,
      record.amountPaid,
      record.status,
      record.paymentStatus,
      record.paymentMethod || "",
      record.customerName || "",
      record.customerPhone || "",
    ]);

    const csv = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parking-records-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Records exported successfully!");
  };

  const handleViewDetails = (record: NightParkingRecord) => {
    setSelectedRecord(record);
  };

  const handleCheckOut = (record: NightParkingRecord) => {
    router.push(`/night-parking/check-out?ticket=${record.ticketNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Parking Records
                </h1>
              </div>
              <p className="text-gray-500">
                View and manage all parking transactions
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={exportRecords}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => router.push("/night-parking/check-in")}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
              >
                <Car className="h-4 w-4 mr-2" />
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
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {records.length}
                </div>
                <div className="text-gray-500">Total Records</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {records.filter((r) => r.status === "parked").length}
                </div>
                <div className="text-gray-500">Currently Parked</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {records.filter((r) => r.status === "checked_out").length}
                </div>
                <div className="text-gray-500">Checked Out</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {records.filter((r) => r.status === "overdue").length}
                </div>
                <div className="text-gray-500">Overdue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search records..."
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={filterVehicleType}
                  onValueChange={setFilterVehicleType}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Vehicle Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-gray-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    // Reset date range
                    setDateRange({ start: "", end: "" });
                    setFilterStatus("all");
                    setFilterVehicleType("all");
                    setSearchTerm("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <Label className="text-gray-600 text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-600 text-sm">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-900 mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 mt-1"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setDateRange({
                      start: yesterday.toISOString().split("T")[0],
                      end: today,
                    });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 24 Hours
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border-0 bg-white shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Ticket
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Vehicle
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Timing
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Amount
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Status
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-mono font-bold text-gray-900">
                          {record.ticketNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.checkInTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {record.licensePlate}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getVehicleTypeColor(
                                record.vehicleType
                              )}
                            >
                              {record.vehicleType}
                            </Badge>
                            {record.customerName && (
                              <span className="text-xs text-gray-500">
                                {record.customerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            In:{" "}
                            {new Date(record.checkInTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          {record.checkOutTime && (
                            <div className="text-sm text-gray-500">
                              Out:{" "}
                              {new Date(record.checkOutTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 font-medium">
                            {calculateDuration(
                              record.checkInTime,
                              record.checkOutTime
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(safeNumber(record.totalAmount))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={getPaymentStatusColor(
                              record.paymentStatus
                            )}
                          >
                            {record.paymentStatus}
                          </Badge>
                          {record.paymentMethod && (
                            <Badge
                              variant="outline"
                              className="border-gray-200 text-gray-500 text-xs"
                            >
                              {record.paymentMethod}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 border-gray-200 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {record.status === "parked" && (
                            <Button
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                              onClick={() => handleCheckOut(record)}
                            >
                              <Receipt className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No records found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {records.length === 0
                      ? "No records in system"
                      : "Try adjusting your search or filters"}
                  </p>
                  {records.length === 0 && (
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/night-parking/check-in")}
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Create First Record
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Record Details Dialog */}
        <Dialog
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        >
          <DialogContent className="bg-white border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRecord && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    Record Details - {selectedRecord.ticketNumber}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-gray-500 text-sm">
                        License Plate
                      </Label>
                      <div className="text-xl font-bold text-gray-900">
                        {selectedRecord.licensePlate}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-sm">
                        Vehicle Type
                      </Label>
                      <Badge
                        className={getVehicleTypeColor(
                          selectedRecord.vehicleType
                        )}
                      >
                        {selectedRecord.vehicleType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-sm">Status</Label>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-500 text-sm">
                        Total Amount
                      </Label>
                      <div className="text-xl font-bold text-brand-primary">
                        {formatCurrency(safeNumber(selectedRecord.totalAmount))}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="bg-gray-50/50">
                      <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                        <Car className="h-5 w-5 text-brand-primary" />
                        Vehicle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">Model</Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.vehicleModel || "Not specified"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-sm">Color</Label>
                          <div className="text-white">
                            {selectedRecord.vehicleColor || "Not specified"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-sm">Slot</Label>
                          <div className="text-white">
                            {selectedRecord.slot?.slotNumber || "Not assigned"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-sm">
                            Premium Charge
                          </Label>
                          <div className="text-white">
                            {formatCurrency(selectedRecord.premiumCharge)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timing Details */}
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="bg-gray-50/50">
                      <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                        <Clock className="h-5 w-5 text-brand-primary" />
                        Timing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Check-in Time
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {new Date(
                              selectedRecord.checkInTime
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Check-out Time
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.checkOutTime
                              ? new Date(
                                  selectedRecord.checkOutTime
                                ).toLocaleString()
                              : "Still parked"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Expected Check-out
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.expectedCheckOut
                              ? new Date(
                                  selectedRecord.expectedCheckOut
                                ).toLocaleString()
                              : "Not set"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Duration
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {calculateDuration(
                              selectedRecord.checkInTime,
                              selectedRecord.checkOutTime
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Details */}
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="bg-gray-50/50">
                      <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                        <User className="h-5 w-5 text-brand-primary" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">Name</Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.customerName || "Not specified"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">Phone</Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.customerPhone || "Not specified"}
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Check-in Worker
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {selectedRecord.checkInBy?.name || "System"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Details */}
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="bg-gray-50/50">
                      <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                        <DollarSign className="h-5 w-5 text-brand-primary" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Amount Paid
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {formatCurrency(selectedRecord.amountPaid)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Discount
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {formatCurrency(selectedRecord.discountAmount)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Commission
                          </Label>
                          <div className="text-gray-900 font-medium">
                            {formatCurrency(selectedRecord.commissionAmount)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-sm">
                            Payment Method
                          </Label>
                          <Badge className="bg-gray-100 text-gray-700">
                            {selectedRecord.paymentMethod || "Cash"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 mt-4">
                        <Label className="text-gray-500 text-sm">
                          Payment Status
                        </Label>
                        <Badge
                          className={getPaymentStatusColor(
                            selectedRecord.paymentStatus
                          )}
                        >
                          {selectedRecord.paymentStatus}
                        </Badge>
                      </div>
                      {(selectedRecord.checkInNotes ||
                        selectedRecord.checkOutNotes) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Label className="text-gray-500 text-sm">Notes</Label>
                          {selectedRecord.checkInNotes && (
                            <div className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <strong>Check-in:</strong>{" "}
                              {selectedRecord.checkInNotes}
                            </div>
                          )}
                          {selectedRecord.checkOutNotes && (
                            <div className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <strong>Check-out:</strong>{" "}
                              {selectedRecord.checkOutNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRecord(null)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Close
                    </Button>
                    {selectedRecord.status === "parked" && (
                      <Button
                        onClick={() => {
                          setSelectedRecord(null);
                          router.push(
                            `/night-parking/check-out?ticket=${selectedRecord.ticketNumber}`
                          );
                        }}
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Check-out
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      filteredRecords.reduce(
                        (sum, record) => sum + safeNumber(record.totalAmount),
                        0
                      )
                    )}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
                </div>
                <div className="p-3 bg-brand-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {
                      filteredRecords.filter((r) => r.status === "parked")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Active Parks</div>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredRecords.length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Filtered Records</div>
                </div>
                <div className="p-3 bg-brand-secondary/10 rounded-full">
                  <FileText className="h-6 w-6 text-brand-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
