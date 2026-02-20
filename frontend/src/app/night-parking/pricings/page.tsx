/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNightParking } from "@/context/NightParkingContext";
import { useAuth } from "@/context/AuthContext";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Car,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  NightParkingPricing,
  CreatePricingRequest,
} from "@/src/types/nightParking";

export default function PricingsPage() {
  const { pricings, createPricing, updatePricing, fetchPricings } =
    useNightParking();
  const { currentBranchId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterVehicleType, setFilterVehicleType] = useState("all");
  const [newPricingDialog, setNewPricingDialog] = useState(false);
  const [editPricing, setEditPricing] = useState<NightParkingPricing | null>(
    null
  );

  // New pricing form state
  const [newPricing, setNewPricing] = useState<CreatePricingRequest>({
    vehicleType: "car",
    name: "",
    description: "",
    priceType: "nightly",
    basePrice: 0,
    hourlyRate: 0,
    minHours: 1,
    discountPercentage: 0,
    discountAfterDays: 0,
    commissionValue: 0,
    commissionType: "percentage",
    isActive: true,
    branchId: currentBranchId || "",
  });

  // Filter pricings
  const filteredPricings = pricings.filter((pricing) => {
    const matchesSearch =
      pricing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pricing.description &&
        pricing.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pricing.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pricing.priceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || pricing.priceType === filterType;
    const matchesVehicleType =
      filterVehicleType === "all" || pricing.vehicleType === filterVehicleType;

    return matchesSearch && matchesType && matchesVehicleType;
  });

  const handleCreatePricing = async () => {
    if (
      !newPricing.name ||
      !newPricing.vehicleType ||
      !newPricing.priceType ||
      newPricing.basePrice <= 0
    ) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    if (!currentBranchId) {
      toast.error("No branch selected");
      return;
    }

    try {
      await createPricing({
        ...newPricing,
        branchId: currentBranchId,
      });

      toast.success("Pricing created successfully!");
      setNewPricingDialog(false);
      setNewPricing({
        vehicleType: "car",
        name: "",
        description: "",
        priceType: "nightly",
        basePrice: 0,
        hourlyRate: 0,
        minHours: 1,
        discountPercentage: 0,
        discountAfterDays: 0,
        commissionValue: 0,
        commissionType: "percentage",
        isActive: true,
        branchId: currentBranchId,
      });
      setEditPricing(null);

      // Refresh pricings
      fetchPricings();
    } catch (error: any) {
      toast.error("Failed to create pricing", {
        description: error.message,
      });
    }
  };

  const handleUpdatePricing = async (
    id: string,
    data: Partial<NightParkingPricing>
  ) => {
    try {
      await updatePricing(id, data);
      toast.success("Pricing updated successfully!");
      fetchPricings();
    } catch (error: any) {
      toast.error("Failed to update pricing", {
        description: error.message,
      });
    }
  };

  const handleEditClick = (pricing: NightParkingPricing) => {
    setEditPricing(pricing);
    setNewPricing({
      vehicleType: pricing.vehicleType,
      name: pricing.name,
      description: pricing.description || "",
      priceType: pricing.priceType,
      basePrice: pricing.basePrice,
      hourlyRate: pricing.hourlyRate,
      minHours: pricing.minHours,
      discountPercentage: pricing.discountPercentage,
      discountAfterDays: pricing.discountAfterDays,
      commissionValue: pricing.commissionValue,
      commissionType: pricing.commissionType,
      isActive: pricing.isActive,
      branchId: pricing.branchId,
    });
    setNewPricingDialog(true);
  };

  const getPriceTypeColor = (type: string) => {
    switch (type) {
      case "nightly":
        return "bg-blue-500/20 text-blue-400";
      case "hourly":
        return "bg-green-500/20 text-green-400";
      case "monthly":
        return "bg-purple-500/20 text-purple-400";
      case "weekly":
        return "bg-orange-500/20 text-orange-400";
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
      case "van":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const vehicleTypes = ["car", "suv", "truck", "boda", "van", "any"];
  const priceTypes: NightParkingPricing["priceType"][] = [
    "nightly",
    "hourly",
    "monthly",
    "weekly",
  ];
  const commissionTypes: NightParkingPricing["commissionType"][] = [
    "fixed",
    "percentage",
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Pricing Management
                </h1>
              </div>
              <p className="text-gray-500">
                Configure parking rates for different vehicle types and
                durations
              </p>
            </div>
            <Dialog open={newPricingDialog} onOpenChange={setNewPricingDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pricing
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 font-bold">
                    {editPricing ? "Edit Pricing" : "Add New Pricing"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Name *</Label>
                    <Input
                      value={newPricing.name}
                      onChange={(e) =>
                        setNewPricing({ ...newPricing, name: e.target.value })
                      }
                      placeholder="e.g., Standard Car Nightly"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Description</Label>
                    <Input
                      value={newPricing.description}
                      onChange={(e) =>
                        setNewPricing({
                          ...newPricing,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description for this pricing"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Vehicle Type *</Label>
                      <Select
                        value={newPricing.vehicleType}
                        onValueChange={(value) =>
                          setNewPricing({ ...newPricing, vehicleType: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Price Type *</Label>
                      <Select
                        value={newPricing.priceType}
                        onValueChange={(value) =>
                          setNewPricing({
                            ...newPricing,
                            priceType:
                              value as NightParkingPricing["priceType"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {priceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Base Price (UGX) *
                      </Label>
                      <Input
                        type="number"
                        value={newPricing.basePrice}
                        onChange={(e) =>
                          setNewPricing({
                            ...newPricing,
                            basePrice: Number(e.target.value),
                          })
                        }
                        placeholder="Enter base price"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Hourly Rate (UGX)</Label>
                      <Input
                        type="number"
                        value={newPricing.hourlyRate}
                        onChange={(e) =>
                          setNewPricing({
                            ...newPricing,
                            hourlyRate: Number(e.target.value),
                          })
                        }
                        placeholder="Enter hourly rate"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Min Hours</Label>
                      <Input
                        type="number"
                        value={newPricing.minHours}
                        onChange={(e) =>
                          setNewPricing({
                            ...newPricing,
                            minHours: Number(e.target.value),
                          })
                        }
                        placeholder="Minimum hours"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Discount %</Label>
                      <Input
                        type="number"
                        value={newPricing.discountPercentage}
                        onChange={(e) =>
                          setNewPricing({
                            ...newPricing,
                            discountPercentage: Number(e.target.value),
                          })
                        }
                        placeholder="Discount percentage"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Commission Value</Label>
                      <Input
                        type="number"
                        value={newPricing.commissionValue}
                        onChange={(e) =>
                          setNewPricing({
                            ...newPricing,
                            commissionValue: Number(e.target.value),
                          })
                        }
                        placeholder="Commission value"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Commission Type</Label>
                      <Select
                        value={newPricing.commissionType}
                        onValueChange={(value) =>
                          setNewPricing({
                            ...newPricing,
                            commissionType:
                              value as NightParkingPricing["commissionType"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {commissionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Active Status</Label>
                    <Switch
                      checked={newPricing.isActive}
                      onCheckedChange={(checked) =>
                        setNewPricing({ ...newPricing, isActive: checked })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewPricingDialog(false);
                        setEditPricing(null);
                        setNewPricing({
                          vehicleType: "car",
                          name: "",
                          description: "",
                          priceType: "nightly",
                          basePrice: 0,
                          hourlyRate: 0,
                          minHours: 1,
                          discountPercentage: 0,
                          discountAfterDays: 0,
                          commissionValue: 0,
                          commissionType: "percentage",
                          isActive: true,
                          branchId: currentBranchId || "",
                        });
                      }}
                        className="border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePricing}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600"
                    >
                      {editPricing ? "Update Pricing" : "Create Pricing"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {pricings.length}
                </div>
                <div className="text-gray-500">Total Rates</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {pricings.filter((p) => p.isActive).length}
                </div>
                <div className="text-gray-500">Active Rates</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {vehicleTypes.length}
                </div>
                <div className="text-gray-500">Vehicle Types</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {priceTypes.length}
                </div>
                <div className="text-gray-500">Price Types</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search pricing..."
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Types</SelectItem>
                    {priceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
                      <SelectValue placeholder="Filter by vehicle" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="cards"
              className="data-[state=active]:bg-white"
            >
              Card View
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:bg-white"
            >
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPricings.map((pricing) => (
                <Card
                  key={pricing.id}
                  className={`border transition-all hover:shadow-md ${
                    pricing.isActive
                      ? "bg-white border-brand-primary/20 shadow-sm"
                      : "bg-gray-50 border-gray-200 opacity-80"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <Badge
                          className={getVehicleTypeColor(pricing.vehicleType)}
                        >
                          {pricing.vehicleType}
                        </Badge>
                        <Badge className={getPriceTypeColor(pricing.priceType)}>
                          {pricing.priceType}
                        </Badge>
                      </div>
                      <Switch
                        checked={pricing.isActive}
                        onCheckedChange={(checked) =>
                          handleUpdatePricing(pricing.id, { isActive: checked })
                        }
                        className="data-[state=checked]:bg-brand-primary"
                      />
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {pricing.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {pricing.description || "No description"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 font-medium">Base Price</span>
                        </div>
                        <div className="text-gray-900 font-bold">
                          {formatCurrency(pricing.basePrice)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-gray-500 text-sm font-medium">Hourly Rate:</span>
                        <span className="text-gray-900 font-semibold text-sm">
                          {formatCurrency(pricing.hourlyRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-gray-500 text-sm font-medium">Min Hours:</span>
                        <span className="text-gray-900 font-semibold text-sm">
                          {pricing.minHours}
                        </span>
                      </div>
                      {pricing.discountPercentage > 0 && (
                        <div className="flex items-center justify-between px-1">
                          <span className="text-gray-500 text-sm font-medium">Discount:</span>
                          <span className="text-green-600 font-semibold text-sm">
                            {pricing.discountPercentage}%
                          </span>
                        </div>
                      )}
                      {pricing.commissionValue > 0 && (
                        <div className="flex items-center justify-between px-1">
                          <span className="text-gray-500 text-sm font-medium">Commission:</span>
                          <span className="text-orange-600 font-semibold text-sm">
                            {pricing.commissionValue}
                            {pricing.commissionType === "percentage"
                              ? "%"
                              : " UGX"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                        onClick={() => handleEditClick(pricing)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleUpdatePricing(pricing.id, {
                            isActive: !pricing.isActive,
                          })
                        }
                      >
                        {pricing.isActive ? (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Name
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Vehicle Type
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Price Type
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Base Price
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
                      {filteredPricings.map((pricing) => (
                        <tr
                          key={pricing.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {pricing.name}
                              </div>
                              {pricing.description && (
                                <div className="text-sm text-gray-500">
                                  {pricing.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={getVehicleTypeColor(
                                pricing.vehicleType
                              )}
                            >
                              {pricing.vehicleType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={getPriceTypeColor(pricing.priceType)}
                            >
                              {pricing.priceType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(pricing.basePrice)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Hourly: {formatCurrency(pricing.hourlyRate)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                pricing.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {pricing.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 border-gray-200"
                                onClick={() => handleEditClick(pricing)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 border-gray-200"
                                onClick={() =>
                                  handleUpdatePricing(pricing.id, {
                                    isActive: !pricing.isActive,
                                  })
                                }
                              >
                                {pricing.isActive ? (
                                  <XCircle className="h-3 w-3" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredPricings.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No pricing found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Comparison */}
        <Card className="border-0 bg-white shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-gray-600 font-semibold">
                      Vehicle Type
                    </th>
                    {priceTypes.map((type) => (
                      <th
                        key={type}
                        className="text-center p-4 text-gray-600 font-semibold"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicleTypes.map((vehicleType) => (
                    <tr
                      key={vehicleType}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <Badge className={getVehicleTypeColor(vehicleType)}>
                          {vehicleType}
                        </Badge>
                      </td>
                      {priceTypes.map((priceType) => {
                        const pricing = pricings.find(
                          (p) =>
                            p.vehicleType === vehicleType &&
                            p.priceType === priceType &&
                            p.isActive
                        );
                        return (
                          <td key={priceType} className="p-4 text-center">
                            {pricing ? (
                              <div>
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(pricing.basePrice)}
                                </div>
                                {pricing.hourlyRate > 0 && (
                                  <div className="text-xs text-gray-500 font-medium">
                                    +{formatCurrency(pricing.hourlyRate)}/hr
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
