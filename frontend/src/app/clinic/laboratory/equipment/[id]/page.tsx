// app/clinic/laboratory/equipment/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Building,
  Cpu,
  Activity,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClinic } from "@/context/ClinicContext";

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const { labEquipment, updateLabEquipment, deleteLabEquipment } = useClinic();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    purchaseDate: "",
    lastMaintenance: "",
    nextMaintenance: "",
    status: "operational",
    location: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const equipment = labEquipment.find((eq) => eq.id === params.id);

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

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        category: equipment.category,
        serialNumber: equipment.serialNumber,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        purchaseDate: equipment.purchaseDate.toISOString().split("T")[0],
        lastMaintenance: equipment.lastMaintenance.toISOString().split("T")[0],
        nextMaintenance: equipment.nextMaintenance.toISOString().split("T")[0],
        status: equipment.status,
        location: equipment.location,
      });
      setIsLoading(false);
    }
  }, [equipment]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedEquipment = {
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber,
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

    if (equipment) {
      updateLabEquipment(equipment.id, updatedEquipment);
      router.push("/clinic/laboratory/equipment");
    }
  };

  const handleDelete = () => {
    if (equipment) {
      deleteLabEquipment(equipment.id);
      router.push("/clinic/laboratory/equipment");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isMaintenanceDue =
    equipment && new Date(equipment.nextMaintenance) <= new Date();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Activity className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Equipment Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The requested equipment could not be found.
            </p>
            <Button onClick={() => router.push("/clinic/laboratory/equipment")}>
              Back to Equipment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Edit Equipment
              </h1>
              <p className="text-gray-600 mt-1">
                Update laboratory equipment details
              </p>
            </div>
          </div>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {equipment.name}? This action
                  cannot be undone and will permanently remove this equipment
                  from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete Equipment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Equipment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-white/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Serial Number
                  </p>
                  <p className="font-bold text-gray-900">
                    {equipment.serialNumber}
                  </p>
                </div>
                <Building className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Status
                  </p>
                  <p
                    className={`font-bold ${
                      equipment.status === "operational"
                        ? "text-green-600"
                        : equipment.status === "maintenance"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {
                      equipmentStatuses.find(
                        (s) => s.value === equipment.status
                      )?.label
                    }
                  </p>
                </div>
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Next Maintenance
                  </p>
                  <p
                    className={`font-bold ${isMaintenanceDue ? "text-red-600" : "text-gray-900"}`}
                  >
                    {formatDate(equipment.nextMaintenance)}
                    {isMaintenanceDue && " ⚠️"}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
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
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        handleChange("serialNumber", e.target.value)
                      }
                      placeholder="e.g., EQ-2024-001"
                      className={`mt-1 border-gray-300 focus:border-blue-500 rounded-xl ${errors.serialNumber ? "border-red-500" : ""}`}
                    />
                    {errors.serialNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.serialNumber}
                      </p>
                    )}
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
                      Update the current operational status of the equipment
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
                        Purchase History
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Original purchase date:{" "}
                      {formatDate(equipment.purchaseDate)}
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
                      Recommended next maintenance date
                    </p>
                  </div>

                  {isMaintenanceDue && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Maintenance Overdue
                        </span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        This equipment is due for maintenance. Please schedule
                        service immediately.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20 sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-blue-500" />
                    Save Changes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment:</span>
                      <span className="font-medium text-gray-900">
                        {formData.name}
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
                        {
                          equipmentStatuses.find(
                            (s) => s.value === formData.status
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(new Date())}
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
                      <Save className="h-4 w-4 mr-2" />
                      Update Equipment
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
