/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNightParking } from "@/context/NightParkingContext";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  Search,
  Receipt,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  NightParkingRecord,
  CheckOutVehicleRequest,
  ExtendStayRequest,
  PaymentMethod,
  PaymentStatus,
  ParkingStatus,
} from "@/src/types/nightParking";
import ThermalReceipt from "@/components/pos/thermal-receipt";

export default function CheckOutPage() {
  const router = useRouter();
  const {
    checkOutVehicle,
    extendStay,
    getActiveRecordByLicensePlate,
    getRecordByTicketNumber,
    records,
    loading,
  } = useNightParking();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"ticket" | "license">("ticket");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRecord, setCurrentRecord] = useState<NightParkingRecord | null>(
    null
  );
  const [checkingOut, setCheckingOut] = useState(false);
  const [extending, setExtending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // Calculate charges
  const calculateCharges = (record: NightParkingRecord) => {
    if (!record) return { total: 0, base: 0, extra: 0, duration: "0h" };

    const checkInTime = new Date(record.checkInTime);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // Safely handle NaN values
    const totalAmount = Number(record.totalAmount);
    const basePrice = Number(record.pricing?.basePrice);

    // Use basePrice if available, otherwise use totalAmount, default to 0
    const baseAmount =
      isNaN(totalAmount) || totalAmount <= 0
        ? isNaN(basePrice) || basePrice <= 0
          ? 0
          : basePrice
        : totalAmount;

    let extraAmount = 0;

    // Calculate extra charges if over the minimum hours
    if (record.pricing?.minHours && hoursDiff > record.pricing.minHours) {
      const extraHours = Math.ceil(hoursDiff - record.pricing.minHours);
      const hourlyRate = Number(record.pricing?.hourlyRate) || 0;
      extraAmount = extraHours * hourlyRate;
    }

    // Ensure no NaN values
    const premiumCharge = Number(record.premiumCharge) || 0;
    const totalAmountCalculated = baseAmount + extraAmount + premiumCharge;

    const duration = `${Math.floor(hoursDiff)}h ${Math.floor(
      (hoursDiff % 1) * 60
    )}m`;

    return {
      total: isNaN(totalAmountCalculated) ? 0 : totalAmountCalculated,
      base: isNaN(baseAmount) ? 0 : baseAmount,
      extra: isNaN(extraAmount) ? 0 : extraAmount,
      duration,
    };
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a ticket number or license plate");
      return;
    }

    try {
      let record = null;
      if (activeTab === "ticket") {
        record = await getRecordByTicketNumber(searchTerm);
      } else {
        record = await getActiveRecordByLicensePlate(searchTerm);
      }

      if (record) {
        setCurrentRecord(record);
        const charges = calculateCharges(record);
        setAmountPaid(charges.total);
        toast.success("Record found!");
      } else {
        toast.error(
          activeTab === "ticket"
            ? "Ticket number not found"
            : "No active record for this license plate"
        );
        setCurrentRecord(null);
        setAmountPaid(0);
      }
    } catch (error: any) {
      toast.error("Search failed", {
        description: error.message || "An error occurred",
      });
      setCurrentRecord(null);
      setAmountPaid(0);
    }
  };

  const handleCheckOut = async () => {
    if (!currentRecord || !user?.id) {
      toast.error("No record selected or user not authenticated");
      return;
    }

    if (amountPaid <= 0) {
      toast.error("Please enter payment amount");
      return;
    }

    setCheckingOut(true);
    try {
      const checkOutData: CheckOutVehicleRequest = {
        recordId: currentRecord.id,
        checkOutNotes: "",
        checkOutPhotos: [],
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        workerId: user.id,
      };

      const response = await checkOutVehicle(checkOutData);
      
      const receiptCharges = calculateCharges(response || currentRecord);
      
      const finalAmount = Number(amountPaid) || Number(response?.totalAmount) || receiptCharges.total || 0;
      
      const safeAmount = isNaN(finalAmount) || finalAmount <= 0 ? receiptCharges.total : finalAmount;
      
      // Map payment method from night parking format to thermal receipt format
      const mapPaymentMethod = (method: PaymentMethod): "cash" | "mtn_momo" | "airtel_money" | "bank_transfer" | "credit_card" => {
        switch (method) {
          case "mobile_money":
            return "mtn_momo";
          case "credit_card":
            return "credit_card";
          case "bank_transfer":
            return "bank_transfer";
          default:
            return "cash";
        }
      };

      // Prepare transaction data for ThermalReceipt
      const transactionData = {
        id: response.id || currentRecord.id,
        transactionId: response.ticketNumber || currentRecord.ticketNumber,
        timestamp: response.checkOutTime || new Date().toISOString(),
        amount: safeAmount,
        customerName: currentRecord.customerName || undefined,
        customerPhone: currentRecord.customerPhone || undefined,
        paymentMethod: mapPaymentMethod(paymentMethod),
        items: [
          {
            id: currentRecord.id,
            name: `Night Parking - ${currentRecord.vehicleType.toUpperCase()} (${receiptCharges.duration})`,
            quantity: 1,
            price: safeAmount,
          },
        ],
        isCustomAmount: false,
      };

      setLastTransaction(transactionData);
      setShowReceipt(true);
      
      toast.success("Vehicle checked out successfully!", {
        description: `Receipt #${response.ticketNumber} generated`,
      });
    } catch (error: any) {
      toast.error("Check-out failed", {
        description: error.message || "An error occurred",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleExtendStay = async () => {
    if (!currentRecord || !user?.id) {
      toast.error("No record selected");
      return;
    }

    setExtending(true);
    try {
      const extendData: ExtendStayRequest = {
        recordId: currentRecord.id,
        additionalHours: 12, // Extend by 12 hours
        workerId: user.id,
        notes: "Extended stay",
      };

      const response = await extendStay(extendData);
      toast.success("Stay extended successfully!");

      // Refresh current record
      if (activeTab === "ticket") {
        const updated = await getRecordByTicketNumber(searchTerm);
        setCurrentRecord(updated);
        if (updated) {
          const charges = calculateCharges(updated);
          setAmountPaid(charges.total);
        }
      } else {
        const updated = await getActiveRecordByLicensePlate(searchTerm);
        setCurrentRecord(updated);
        if (updated) {
          const charges = calculateCharges(updated);
          setAmountPaid(charges.total);
        }
      }
    } catch (error: any) {
      toast.error("Extension failed", {
        description: error.message || "An error occurred",
      });
    } finally {
      setExtending(false);
    }
  };

  const charges = calculateCharges(currentRecord!);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods: PaymentMethod[] = [
    "cash",
    "mobile_money",
    "credit_card",
    "bank_transfer",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Check-out Vehicle</h1>
          </div>
          <p className="text-gray-500">
            Process vehicle departure and generate receipt
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search & Actions */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-md mb-6">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Search className="h-5 w-5 text-brand-primary" />
                  Search Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={(v: any) => setActiveTab(v)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger
                      value="ticket"
                      className="data-[state=active]:bg-white"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      By Ticket Number
                    </TabsTrigger>
                    <TabsTrigger
                      value="license"
                      className="data-[state=active]:bg-white"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      By License Plate
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="ticket" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Ticket Number</Label>
                      <div className="flex gap-2">
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Enter ticket number"
                          className="bg-gray-50 border-gray-200 text-gray-900"
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={loading}
                          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="license" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">License Plate</Label>
                      <div className="flex gap-2">
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Enter license plate"
                          className="bg-gray-50 border-gray-200 text-gray-900"
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={loading}
                          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            {currentRecord && (
              <Card className="border-0 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Car className="h-5 w-5 text-brand-primary" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">License Plate</Label>
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-900 font-mono font-semibold">
                        {currentRecord.licensePlate}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Ticket Number</Label>
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-900 font-mono">
                        {currentRecord.ticketNumber}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Vehicle Type</Label>
                      <Badge className="bg-brand-primary/10 text-brand-primary">
                        {currentRecord.vehicleType}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Color</Label>
                      <Badge className="bg-gray-100 text-gray-600">
                        {currentRecord.vehicleColor || "Not specified"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Status</Label>
                      <Badge
                        className={
                          currentRecord.status === "parked"
                            ? "bg-green-100 text-green-700"
                            : currentRecord.status === "checked_out"
                              ? "bg-brand-primary/10 text-brand-primary"
                              : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {currentRecord.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-primary" />
                      Timing Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Check-in Time</Label>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-900">
                          {new Date(currentRecord.checkInTime).toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Duration</Label>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-900 font-medium">
                          {charges.duration}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-brand-primary" />
                      Payment Information
                    </h3>

                    {/* Payment Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Base Charge</span>
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(charges.base)}
                        </span>
                      </div>
                      {charges.extra > 0 && (
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <span className="text-yellow-700">Extra Charges</span>
                          <span className="text-yellow-700 font-semibold">
                            {formatCurrency(charges.extra)}
                          </span>
                        </div>
                      )}
                      {currentRecord.premiumCharge > 0 && (
                        <div className="flex justify-between items-center p-3 bg-brand-secondary/5 rounded-lg border border-brand-secondary/10">
                          <span className="text-brand-secondary">
                            Premium Charge
                          </span>
                          <span className="text-brand-secondary font-semibold">
                            {formatCurrency(currentRecord.premiumCharge)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-4 bg-brand-primary text-white rounded-lg shadow-md">
                        <span className="font-semibold">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(charges.total)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Payment Method</Label>
                        <select
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as PaymentMethod)
                          }
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        >
                          {paymentMethods.map((method) => (
                            <option key={method} value={method}>
                              {method.replace("_", " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">
                          Amount Paid (UGX)
                        </Label>
                        <Input
                          type="number"
                          value={amountPaid}
                          onChange={(e) =>
                            setAmountPaid(Number(e.target.value))
                          }
                          placeholder="Enter amount"
                          className="bg-gray-50 border-gray-200 text-gray-900 p-2.5"
                        />
                      </div>
                    </div>

                    {/* Change Calculation */}
                    {amountPaid > charges.total && (
                      <div className="p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-brand-primary font-medium">Change</span>
                          <span className="text-brand-primary font-bold">
                            {formatCurrency(amountPaid - charges.total)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Button
                      onClick={handleExtendStay}
                      disabled={extending}
                      variant="outline"
                      className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 py-6"
                    >
                      {extending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-2"></div>
                          Extending...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5 mr-2" />
                          Extend Stay (12hrs)
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCheckOut}
                      disabled={checkingOut || amountPaid <= 0}
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg transition-all text-white py-6"
                    >
                      {checkingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Check-out & Print Receipt
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-primary" />
                  Check-out Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-primary" />
                    <span className="text-gray-700">Current Time</span>
                  </div>
                  <Badge className="bg-brand-primary/10 text-brand-primary">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Today&apos;s Date</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-secondary/5 rounded-lg border border-brand-secondary/10">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-secondary" />
                    <span className="text-gray-700">Check-out Staff</span>
                  </div>
                  <Badge className="bg-brand-secondary/10 text-brand-secondary">
                    {user?.firstName || "Staff"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-700">Parked Vehicles</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    {records.filter((r) => r.status === "parked").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Check-outs */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-brand-primary" />
                  Recent Check-outs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records
                    .filter((r) => r.status === "checked_out")
                    .slice(0, 4)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="p-3 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-900 font-semibold text-sm">
                            {record.licensePlate}
                          </span>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {record.paymentMethod}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            {formatCurrency(record.totalAmount)}
                          </span>
                          <span className="text-gray-400">
                            {new Date(
                              record.checkOutTime || Date.now()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  {records.filter((r) => r.status === "checked_out").length ===
                    0 && (
                    <div className="text-center py-4">
                      <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No recent check-outs
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => router.push("/night-parking/check-in")}
                >
                  <Car className="h-4 w-4 mr-2 text-brand-primary" />
                  New Check-in
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => router.push("/night-parking/records")}
                >
                  <Receipt className="h-4 w-4 mr-2 text-brand-secondary" />
                  View All Records
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => router.push("/night-parking/overdue")}
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Overdue Vehicles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      {lastTransaction && (
        <ThermalReceipt
          transaction={lastTransaction}
          open={showReceipt}
          onOpenChange={(open) => {
            setShowReceipt(open);
            if (!open) {
              setCurrentRecord(null);
              setSearchTerm("");
              setAmountPaid(0);
              setPaymentMethod("cash");
              setLastTransaction(null);
              router.push("/night-parking/records");
            }
          }}
        />
      )}
    </div>
  );
}
