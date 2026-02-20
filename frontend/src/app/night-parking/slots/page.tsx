/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNightParking } from "@/context/NightParkingContext";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  NightParkingSlot,
  CreateSlotRequest,
  SlotOccupancy,
} from "@/src/types/nightParking";
import { useAuth } from "@/context/AuthContext";

export default function SlotsPage() {
  const { slots, createSlot, updateSlotStatus, fetchSlots, getSlotOccupancy } =
    useNightParking();
  const { currentBranchId, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [newSlotDialog, setNewSlotDialog] = useState(false);
  const [slotOccupancy, setSlotOccupancy] = useState<SlotOccupancy | null>(
    null
  );

  // useEffect TO FETCH SLOTS
  useEffect(() => {
    console.log(
      "SlotsPage: useEffect triggered, currentBranchId:",
      currentBranchId
    );

    if (currentBranchId) {
      console.log("SlotsPage: Calling fetchSlots for branch:", currentBranchId);
      fetchSlots();
    } else {
      console.log("SlotsPage: No branch ID available");
    }
  }, [currentBranchId, fetchSlots]); // Add fetchSlots to dependencies

  // Fetch occupancy data
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const data = await getSlotOccupancy();
        setSlotOccupancy(data);
      } catch (error) {
        console.error("Failed to fetch occupancy:", error);
      }
    };

    if (currentBranchId) {
      fetchOccupancy();
    }
  }, [currentBranchId, getSlotOccupancy]);

  // New slot form state
  const [newSlot, setNewSlot] = useState<CreateSlotRequest>({
    slotNumber: "",
    name: "",
    description: "",
    vehicleType: "any",
    status: "available",
    isActive: true,
    premiumCharge: 0,
    features: {},
    branchId: currentBranchId || "",
  });

  // Fetch occupancy data
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const data = await getSlotOccupancy();
        setSlotOccupancy(data);
      } catch (error) {
        console.error("Failed to fetch occupancy:", error);
      }
    };

    fetchOccupancy();
  }, [getSlotOccupancy]);

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slot.description &&
        slot.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || slot.status === filterStatus;
    const matchesType = filterType === "all" || slot.vehicleType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateSlot = async () => {
    if (!newSlot.slotNumber) {
      toast.error("Slot number is required");
      return;
    }

    if (!currentBranchId) {
      toast.error("No branch selected");
      return;
    }

    try {
      await createSlot({
        ...newSlot,
        branchId: currentBranchId,
      });

      toast.success("Slot created successfully!");
      setNewSlotDialog(false);
      setNewSlot({
        slotNumber: "",
        name: "",
        description: "",
        vehicleType: "any",
        status: "available",
        isActive: true,
        premiumCharge: 0,
        features: {},
        branchId: currentBranchId,
      });

      // Refresh slots
      fetchSlots();
    } catch (error: any) {
      toast.error("Failed to create slot", {
        description: error.message,
      });
    }
  };

  const handleUpdateStatus = async (slotId: string, status: string) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await updateSlotStatus(slotId, status, user.id);
      toast.success("Slot status updated!");
      fetchSlots();
    } catch (error: any) {
      toast.error("Failed to update status", {
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400";
      case "occupied":
        return "bg-red-500/20 text-red-400";
      case "reserved":
        return "bg-yellow-500/20 text-yellow-400";
      case "maintenance":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
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

  const vehicleTypes: NightParkingSlot["vehicleType"][] = [
    "car",
    "suv",
    "truck",
    "boda",
    "van",
    "any",
  ];
  const statuses: NightParkingSlot["status"][] = [
    "available",
    "occupied",
    "reserved",
    "maintenance",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Parking Slots Management
                </h1>
              </div>
              <p className="text-gray-500">
                Manage parking slots, availability, and allocations
              </p>
            </div>
            <Dialog open={newSlotDialog} onOpenChange={setNewSlotDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 font-bold">
                    Add New Parking Slot
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Slot Number *</Label>
                    <Input
                      value={newSlot.slotNumber}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, slotNumber: e.target.value })
                      }
                      placeholder="e.g., A-101"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Slot Name *</Label>
                    <Input
                      value={newSlot.name}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, name: e.target.value })
                      }
                      placeholder="e.g., Premium Car Spot"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Description</Label>
                    <Input
                      value={newSlot.description}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, description: e.target.value })
                      }
                      placeholder="Optional description"
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Vehicle Type</Label>
                      <Select
                        value={newSlot.vehicleType}
                        onValueChange={(value) =>
                          setNewSlot({
                            ...newSlot,
                            vehicleType:
                              value as NightParkingSlot["vehicleType"],
                          })
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
                      <Label className="text-gray-700">
                        Premium Charge (UGX)
                      </Label>
                      <Input
                        type="number"
                        value={newSlot.premiumCharge}
                        onChange={(e) =>
                          setNewSlot({
                            ...newSlot,
                            premiumCharge: Number(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Features (JSON)</Label>
                    <Input
                      value={JSON.stringify(newSlot.features || {})}
                      onChange={(e) => {
                        try {
                          const features = JSON.parse(e.target.value || "{}");
                          setNewSlot({ ...newSlot, features });
                        } catch (err) {
                          // Keep existing features if JSON is invalid
                        }
                      }}
                      placeholder='{"hasRoof": true, "nearEntrance": false}'
                      className="bg-gray-50 border-gray-200 text-gray-900 font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setNewSlotDialog(false)}
                      className="border-gray-200 text-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateSlot}
                      disabled={!newSlot.slotNumber || !newSlot.name}
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                    >
                      Create Slot
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Occupancy Stats */}
        {slotOccupancy && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {slotOccupancy.totalSlots || 0}
                  </div>
                  <div className="text-gray-500">Total Slots</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {slotOccupancy.availableSlots || 0}
                  </div>
                  <div className="text-gray-500">Available</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {slotOccupancy.occupiedSlots || 0}
                  </div>
                  <div className="text-gray-500">Occupied</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {slotOccupancy.occupancyRate || 0}%
                  </div>
                  <div className="text-gray-500">Occupancy Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    placeholder="Search slots..."
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Types</SelectItem>
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

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-white"
            >
              Grid View
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white"
            >
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSlots.map((slot) => (
                <Card
                  key={slot.id}
                  className={`border transition-all hover:shadow-md ${
                    slot.status === "available"
                      ? "bg-white border-green-200"
                      : slot.status === "occupied"
                        ? "bg-red-50 border-red-200 shadow-sm"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getStatusColor(slot.status)}>
                        {slot.status}
                      </Badge>
                      <Badge className={getTypeColor(slot.vehicleType)}>
                        {slot.vehicleType}
                      </Badge>
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {slot.slotNumber}
                      </div>
                      <div className="text-gray-600 font-medium">{slot.name}</div>
                      {(slot.premiumCharge ?? 0) > 0 && (
                        <div className="text-sm text-yellow-600 font-bold mt-1">
                          +UGX {(slot.premiumCharge ?? 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {slot.description && (
                        <div className="text-sm text-gray-500 italic">
                          {slot.description}
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-50 pt-3">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Created</span>
                        <span className="text-gray-900 text-xs font-semibold">
                          {new Date(slot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {slot.lastOccupiedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Last Occupied</span>
                          <span className="text-gray-900 text-xs font-semibold">
                            {new Date(slot.lastOccupiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100">
                      {slot.status === "available" ? (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                          onClick={() =>
                            handleUpdateStatus(slot.id, "occupied")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Occupy
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() =>
                            handleUpdateStatus(slot.id, "available")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Free
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-200 text-gray-500 hover:bg-gray-50"
                        onClick={() =>
                          handleUpdateStatus(
                            slot.id,
                            slot.status === "maintenance"
                              ? "available"
                              : "maintenance"
                          )
                        }
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {slot.status === "maintenance"
                          ? "Repaired"
                          : "Maintain"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Slot Number
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Name
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Type
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Status
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Premium
                        </th>
                        <th className="text-left p-4 text-gray-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSlots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-bold text-gray-900">
                              {slot.slotNumber}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-700 font-medium">{slot.name}</div>
                            {slot.description && (
                              <div className="text-xs text-gray-500">
                                {slot.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={getTypeColor(slot.vehicleType)}>
                              {slot.vehicleType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(slot.status)}>
                              {slot.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {(slot.premiumCharge ?? 0) > 0 ? (
                              <Badge className="bg-yellow-500/20 text-yellow-400">
                                UGX {(slot.premiumCharge ?? 0).toLocaleString()}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 border-gray-600"
                                onClick={() =>
                                  handleUpdateStatus(
                                    slot.id,
                                    slot.status === "available"
                                      ? "occupied"
                                      : "available"
                                  )
                                }
                              >
                                {slot.status === "available" ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Occupy
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Free
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredSlots.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No slots found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <Car className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {slots.filter((s) => s.vehicleType === "car").length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Car Slots</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Car className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {slots.filter((s) => s.vehicleType === "boda").length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Boda Slots</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Car className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {slots.filter((s) => s.vehicleType === "truck").length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Truck Slots</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
