/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { ArrowLeft, Save, Car, Clock, DollarSign } from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";
import { VehicleType, WashType } from "@/src/types/washingBay";

interface ServiceFormData {
  name: string;
  vehicleType: VehicleType | "";
  washType: WashType | "";
  price: number;
  description: string;
  estimatedDuration: number;
}

// Create a separate interface for errors that accepts strings
interface ServiceFormErrors {
  name?: string;
  vehicleType?: string;
  washType?: string;
  price?: string;
  estimatedDuration?: string;
  description?: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const { createServiceType, loading } = useWashingBay();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    vehicleType: "",
    washType: "",
    price: 0,
    description: "",
    estimatedDuration: 30,
  });

  const [errors, setErrors] = useState<ServiceFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ServiceFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    if (!formData.washType) {
      newErrors.washType = "Wash type is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = "Duration must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ServiceFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof ServiceFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentBranchId) {
      console.error("No branch selected");
      alert("Please select a branch first");
      return;
    }

    try {
      // Create the service data without isActive field
      const serviceData = {
        name: formData.name.trim(),
        vehicleType: formData.vehicleType as VehicleType,
        washType: formData.washType as WashType,
        price: Number(formData.price),
        description: formData.description.trim() || undefined,
        estimatedDuration: Number(formData.estimatedDuration),
        branchId: currentBranchId,
      };

      console.log("Sending service data:", serviceData);

      await createServiceType(serviceData);
      router.push("/washing-bay/services");
    } catch (error: any) {
      console.error("Failed to create service:", error);
      alert(`Failed to create service: ${error.message}`);
    }
  };

  const washTypeDescriptions: Record<WashType, string> = {
    basic: "Exterior wash and dry",
    premium: "Exterior wash, dry, and tire dressing",
    deluxe: "Complete interior and exterior cleaning",
    interior: "Interior vacuuming and detailing only",
    exterior: "Exterior wash and dry only",
  };

  const vehicleTypeOptions = [
    { value: "car", label: "Car" },
    { value: "suv", label: "SUV" },
    { value: "truck", label: "Truck" },
    { value: "motorcycle", label: "Motorcycle" },
    { value: "van", label: "Van" },
  ];

  const washTypeOptions = [
    { value: "basic", label: "Basic Wash" },
    { value: "premium", label: "Premium Wash" },
    { value: "deluxe", label: "Deluxe Wash" },
    { value: "interior", label: "Interior Only" },
    { value: "exterior", label: "Exterior Only" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/washing-bay/services")}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Service</h1>
          <p className="text-gray-600 mt-1">
            Create a new vehicle washing service
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Service Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Car Wash"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this service includes..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Service Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">
                      Vehicle Type <span className="text-red-500">*</span>
                    </Label>
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
                        {vehicleTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-sm">
                        {errors.vehicleType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="washType">
                      Wash Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.washType}
                      onValueChange={(value: WashType) =>
                        handleInputChange("washType", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.washType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select wash type" />
                      </SelectTrigger>
                      <SelectContent>
                        {washTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.washType && (
                      <p className="text-red-500 text-sm">{errors.washType}</p>
                    )}
                  </div>
                </div>

                {formData.washType && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>
                        {
                          washTypeOptions.find(
                            (w) => w.value === formData.washType
                          )?.label
                        }
                      </strong>
                      : {washTypeDescriptions[formData.washType as WashType]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (UGX) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                      min="0"
                      step="100"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">
                    Estimated Duration (minutes){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedDuration"
                      type="number"
                      placeholder="30"
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedDuration",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`pl-10 ${
                        errors.estimatedDuration ? "border-red-500" : ""
                      }`}
                      min="1"
                      max="480"
                    />
                  </div>
                  {errors.estimatedDuration && (
                    <p className="text-red-500 text-sm">
                      {errors.estimatedDuration}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentBranchId && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      ⚠️ No branch selected. Please select a branch first.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/washing-bay/services")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={
                      loading ||
                      !formData.name ||
                      !formData.vehicleType ||
                      !formData.washType ||
                      formData.price <= 0 ||
                      !currentBranchId
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Creating..." : "Create Service"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {formData.name || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle Type:</span>
                    <span className="font-medium">
                      {formData.vehicleType
                        ? vehicleTypeOptions.find(
                            (v) => v.value === formData.vehicleType
                          )?.label
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wash Type:</span>
                    <span className="font-medium">
                      {formData.washType
                        ? washTypeOptions.find(
                            (w) => w.value === formData.washType
                          )?.label
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">
                      UGX {formData.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {formData.estimatedDuration} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { ArrowLeft, Save, Car, Clock, DollarSign } from "lucide-react";
// import { useWashingBay } from "@/context/WashingBayContext";
// import { useAuth } from "@/context/AuthContext";
// import { VehicleType, WashType } from "@/src/types/washingBay";

// interface ServiceFormData {
//   name: string;
//   vehicleType: VehicleType | "";
//   washType: WashType | "";
//   price: number;
//   description: string;
//   estimatedDuration: number;
//   isActive: boolean;
// }

// // Create a separate interface for errors that accepts strings
// interface ServiceFormErrors {
//   name?: string;
//   vehicleType?: string;
//   washType?: string;
//   price?: string;
//   estimatedDuration?: string;
//   description?: string;
//   isActive?: string;
// }

// export default function NewServicePage() {
//   const router = useRouter();
//   const { createServiceType, loading } = useWashingBay();
//   const { currentBranchId } = useAuth();

//   const [formData, setFormData] = useState<ServiceFormData>({
//     name: "",
//     vehicleType: "",
//     washType: "",
//     price: 0,
//     description: "",
//     estimatedDuration: 30,
//     isActive: true,
//   });

//   const [errors, setErrors] = useState<ServiceFormErrors>({});

//   const validateForm = (): boolean => {
//     const newErrors: ServiceFormErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Service name is required";
//     }

//     if (!formData.vehicleType) {
//       newErrors.vehicleType = "Vehicle type is required";
//     }

//     if (!formData.washType) {
//       newErrors.washType = "Wash type is required";
//     }

//     if (formData.price <= 0) {
//       newErrors.price = "Price must be greater than 0";
//     }

//     if (formData.estimatedDuration <= 0) {
//       newErrors.estimatedDuration = "Duration must be greater than 0";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (
//     field: keyof ServiceFormData,
//     value: string | number | boolean
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));

//     // Clear error when user starts typing
//     if (errors[field as keyof ServiceFormErrors]) {
//       setErrors((prev) => ({
//         ...prev,
//         [field]: undefined,
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     if (!currentBranchId) {
//       console.error("No branch selected");
//       return;
//     }

//     try {
//       const serviceData = {
//         ...formData,
//         vehicleType: formData.vehicleType as VehicleType,
//         washType: formData.washType as WashType,
//         branchId: currentBranchId,
//       };

//       await createServiceType(serviceData);
//       router.push("/washing-bay/services");
//     } catch (error) {
//       console.error("Failed to create service:", error);
//     }
//   };

//   const washTypeDescriptions: Record<WashType, string> = {
//     basic: "Exterior wash and dry",
//     premium: "Exterior wash, dry, and tire dressing",
//     deluxe: "Complete interior and exterior cleaning",
//     interior: "Interior vacuuming and detailing only",
//     exterior: "Exterior wash and dry only",
//   };

//   const vehicleTypeOptions = [
//     { value: "car", label: "Car" },
//     { value: "suv", label: "SUV" },
//     { value: "truck", label: "Truck" },
//     { value: "motorcycle", label: "Motorcycle" },
//     { value: "van", label: "Van" },
//   ];

//   const washTypeOptions = [
//     { value: "basic", label: "Basic Wash" },
//     { value: "premium", label: "Premium Wash" },
//     { value: "deluxe", label: "Deluxe Wash" },
//     { value: "interior", label: "Interior Only" },
//     { value: "exterior", label: "Exterior Only" },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => router.push("/washing-bay/services")}
//           className="h-9 w-9"
//         >
//           <ArrowLeft className="h-4 w-4" />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">New Service</h1>
//           <p className="text-gray-600 mt-1">
//             Create a new vehicle washing service
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Service Details */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Basic Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">
//                     Service Name <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="name"
//                     placeholder="e.g., Premium Car Wash"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange("name", e.target.value)}
//                     className={errors.name ? "border-red-500" : ""}
//                   />
//                   {errors.name && (
//                     <p className="text-red-500 text-sm">{errors.name}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Describe what this service includes..."
//                     value={formData.description}
//                     onChange={(e) =>
//                       handleInputChange("description", e.target.value)
//                     }
//                     rows={3}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Service Configuration */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Service Configuration</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="vehicleType">
//                       Vehicle Type <span className="text-red-500">*</span>
//                     </Label>
//                     <Select
//                       value={formData.vehicleType}
//                       onValueChange={(value: VehicleType) =>
//                         handleInputChange("vehicleType", value)
//                       }
//                     >
//                       <SelectTrigger
//                         className={errors.vehicleType ? "border-red-500" : ""}
//                       >
//                         <SelectValue placeholder="Select vehicle type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {vehicleTypeOptions.map((option) => (
//                           <SelectItem key={option.value} value={option.value}>
//                             <div className="flex items-center gap-2">
//                               <Car className="h-4 w-4" />
//                               {option.label}
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.vehicleType && (
//                       <p className="text-red-500 text-sm">
//                         {errors.vehicleType}
//                       </p>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="washType">
//                       Wash Type <span className="text-red-500">*</span>
//                     </Label>
//                     <Select
//                       value={formData.washType}
//                       onValueChange={(value: WashType) =>
//                         handleInputChange("washType", value)
//                       }
//                     >
//                       <SelectTrigger
//                         className={errors.washType ? "border-red-500" : ""}
//                       >
//                         <SelectValue placeholder="Select wash type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {washTypeOptions.map((option) => (
//                           <SelectItem key={option.value} value={option.value}>
//                             {option.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.washType && (
//                       <p className="text-red-500 text-sm">{errors.washType}</p>
//                     )}
//                   </div>
//                 </div>

//                 {formData.washType && (
//                   <div className="p-3 bg-blue-50 rounded-lg">
//                     <p className="text-sm text-blue-700">
//                       <strong>
//                         {
//                           washTypeOptions.find(
//                             (w) => w.value === formData.washType
//                           )?.label
//                         }
//                       </strong>
//                       : {washTypeDescriptions[formData.washType as WashType]}
//                     </p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Pricing & Actions */}
//           <div className="space-y-6">
//             {/* Pricing */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <DollarSign className="h-5 w-5" />
//                   Pricing & Duration
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="price">
//                     Price (UGX) <span className="text-red-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="price"
//                       type="number"
//                       placeholder="0"
//                       value={formData.price}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "price",
//                           parseFloat(e.target.value) || 0
//                         )
//                       }
//                       className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
//                       min="0"
//                       step="100"
//                     />
//                   </div>
//                   {errors.price && (
//                     <p className="text-red-500 text-sm">{errors.price}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="estimatedDuration">
//                     Estimated Duration (minutes){" "}
//                     <span className="text-red-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="estimatedDuration"
//                       type="number"
//                       placeholder="30"
//                       value={formData.estimatedDuration}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "estimatedDuration",
//                           parseInt(e.target.value) || 0
//                         )
//                       }
//                       className={`pl-10 ${
//                         errors.estimatedDuration ? "border-red-500" : ""
//                       }`}
//                       min="1"
//                       max="480"
//                     />
//                   </div>
//                   {errors.estimatedDuration && (
//                     <p className="text-red-500 text-sm">
//                       {errors.estimatedDuration}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="isActive">Status</Label>
//                   <Select
//                     value={formData.isActive.toString()}
//                     onValueChange={(value) =>
//                       handleInputChange("isActive", value === "true")
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="true">Active</SelectItem>
//                       <SelectItem value="false">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-gray-500">
//                     Inactive services won&apos;t be available for new orders
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {!currentBranchId && (
//                   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-red-700 text-sm">
//                       ⚠️ No branch selected. Please select a branch first.
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex gap-3">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => router.push("/washing-bay/services")}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     className="flex-1 bg-blue-600 hover:bg-blue-700"
//                     disabled={
//                       loading ||
//                       !formData.name ||
//                       !formData.vehicleType ||
//                       !formData.washType ||
//                       formData.price <= 0 ||
//                       !currentBranchId
//                     }
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     {loading ? "Creating..." : "Create Service"}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Service Preview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Service Preview</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Name:</span>
//                     <span className="font-medium">
//                       {formData.name || "Not set"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Vehicle Type:</span>
//                     <span className="font-medium">
//                       {formData.vehicleType
//                         ? vehicleTypeOptions.find(
//                             (v) => v.value === formData.vehicleType
//                           )?.label
//                         : "Not set"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Wash Type:</span>
//                     <span className="font-medium">
//                       {formData.washType
//                         ? washTypeOptions.find(
//                             (w) => w.value === formData.washType
//                           )?.label
//                         : "Not set"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Price:</span>
//                     <span className="font-medium">
//                       UGX {formData.price.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Duration:</span>
//                     <span className="font-medium">
//                       {formData.estimatedDuration} minutes
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
