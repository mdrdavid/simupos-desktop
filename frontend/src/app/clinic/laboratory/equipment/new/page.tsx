"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Activity,
  Calendar,
  MapPin,
  Building,
  Cpu,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinic } from "@/context/ClinicContext";

export default function NewEquipmentPage() {
  const router = useRouter();
  const { labEquipment, addLabEquipment } = useClinic();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    lastMaintenance: new Date().toISOString().split("T")[0],
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "operational",
    location: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const equipmentCategories = [
    "Analyzer",
    "Centrifuge",
    "Microscope",
    "Incubator",
    "Autoclave",
    "Spectrophotometer",
    "PCR Machine",
    "Electrophoresis",
    "Blood Gas Analyzer",
    "Hematology Analyzer",
    "Chemistry Analyzer",
    "Immunoassay Analyzer",
    "Other",
  ];

  const equipmentStatuses = [
    { value: "operational", label: "Operational", color: "text-green-600" },
    {
      value: "maintenance",
      label: "Under Maintenance",
      color: "text-yellow-600",
    },
    { value: "out-of-service", label: "Out of Service", color: "text-red-600" },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Equipment name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSerialNumber = () => {
    const prefix = "EQ";
    const year = new Date().getFullYear();
    const sequence = (labEquipment.length + 1).toString().padStart(3, "0");
    return `${prefix}-${year}-${sequence}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newEquipment = {
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber || generateSerialNumber(),
      manufacturer: formData.manufacturer,
      model: formData.model,
      purchaseDate: new Date(formData.purchaseDate),
      lastMaintenance: new Date(formData.lastMaintenance),
      nextMaintenance: new Date(formData.nextMaintenance),
      status: formData.status as
        | "operational"
        | "maintenance"
        | "out-of-service",
      location: formData.location,
    };

    addLabEquipment(newEquipment);
    router.push("/clinic/laboratory/equipment");
  };

  const handleGenerateSerial = () => {
    setFormData((prev) => ({
      ...prev,
      serialNumber: generateSerialNumber(),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Equipment
            </h1>
            <p className="text-gray-600 mt-1">
              Register new laboratory equipment
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Equipment Details Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Equipment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Equipment Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., Hematology Analyzer"
                      className={`mt-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger
                        className={`mt-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.category ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {equipmentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="manufacturer"
                        className="text-sm font-medium text-gray-700"
                      >
                        Manufacturer *
                      </Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) =>
                          handleChange("manufacturer", e.target.value)
                        }
                        placeholder="e.g., MedTech Inc."
                        className={`mt-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.manufacturer ? "border-red-500" : ""}`}
                      />
                      {errors.manufacturer && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.manufacturer}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="model"
                        className="text-sm font-medium text-gray-700"
                      >
                        Model *
                      </Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleChange("model", e.target.value)}
                        placeholder="e.g., HA-2000"
                        className={`mt-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.model ? "border-red-500" : ""}`}
                      />
                      {errors.model && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.model}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="serialNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Serial Number *
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) =>
                          handleChange("serialNumber", e.target.value)
                        }
                        placeholder="e.g., EQ-2024-001"
                        className={`flex-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.serialNumber ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateSerial}
                        className="border-gray-300 hover:border-blue-300 rounded-xl"
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.serialNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.serialNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Click the barcode icon to generate a serial number
                      automatically
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Status Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    Location & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700"
                    >
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="e.g., Lab Room 1, Biochemistry Section"
                      className={`mt-1 border-gray-300 focus:border-purple-500 rounded-xl ${errors.location ? "border-red-500" : ""}`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Current Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-purple-500 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {equipmentStatuses.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                            className={status.color}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Set the current operational status of the equipment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Dates & Maintenance */}
            <div className="space-y-6">
              {/* Purchase Information Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Purchase Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="purchaseDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        handleChange("purchaseDate", e.target.value)
                      }
                      className="mt-1 border-gray-300 focus:border-green-500 rounded-xl"
                    />
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Warranty Information
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Equipment warranty period typically starts from purchase
                      date. Check manufacturer documentation for specific
                      warranty details.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Schedule Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-orange-500" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="lastMaintenance"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Maintenance Date
                    </Label>
                    <Input
                      id="lastMaintenance"
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) =>
                        handleChange("lastMaintenance", e.target.value)
                      }
                      className="mt-1 border-gray-300 focus:border-orange-500 rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date when equipment was last serviced
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="nextMaintenance"
                      className="text-sm font-medium text-gray-700"
                    >
                      Next Maintenance Due
                    </Label>
                    <Input
                      id="nextMaintenance"
                      type="date"
                      value={formData.nextMaintenance}
                      onChange={(e) =>
                        handleChange("nextMaintenance", e.target.value)
                      }
                      className="mt-1 border-gray-300 focus:border-orange-500 rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended next maintenance date (typically 3-6 months)
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        Maintenance Reminder
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Regular maintenance ensures equipment reliability and
                      accurate test results. Schedule maintenance according to
                      manufacturer guidelines.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20 sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Equipment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {formData.name || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">
                        {formData.category || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium text-gray-900">
                        {formData.manufacturer || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900">
                        {formData.model || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium ${
                          formData.status === "operational"
                            ? "text-green-600"
                            : formData.status === "maintenance"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {equipmentStatuses.find(
                          (s) => s.value === formData.status
                        )?.label || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 border-gray-300 hover:border-gray-400 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Equipment
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    * Required fields must be filled
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
