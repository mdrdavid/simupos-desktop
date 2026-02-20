/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Package,
  Calendar,
  DollarSign,
  Box,
  AlertTriangle,
  Truck,
  Tag,
  Pill,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";

export default function StockEntryPage() {
  const router = useRouter();
  const { addMedicine, medicines } = useClinic();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    expiryDate: "",
    unitPrice: "",
    quantity: "",
    unit: "tablets",
    minStock: "",
    supplier: "",
    category: "",
    dosage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedValues, setFormattedValues] = useState({
    unitPrice: "",
    quantity: "",
    minStock: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Get existing medicine names for suggestions
  const existingMedicines = [...new Set(medicines.map((med) => med.name))];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericInputChange = (field: string, value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    const formatted = formatNumberWithCommas(numericValue);
    setFormattedValues((prev) => ({ ...prev, [field]: formatted }));
    setFormData((prev) => ({ ...prev, [field]: numericValue }));
  };

  const calculateTotalValue = () => {
    const unitPrice = parseFormattedNumber(formData.unitPrice) || 0;
    const quantity = parseFormattedNumber(formData.quantity) || 0;
    return unitPrice * quantity;
  };

  const getExpiryStatus = (dateString: string) => {
    if (!dateString) return null;

    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return { status: "expired", message: "This medicine has expired" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "warning", message: "Expires within 30 days" };
    } else if (daysUntilExpiry <= 90) {
      return { status: "info", message: "Expires within 3 months" };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.batch ||
      !formData.expiryDate ||
      !formData.unitPrice ||
      !formData.quantity
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date(formData.expiryDate);
    if (expiryDate <= new Date()) {
      toast({
        title: "Invalid Expiry Date",
        description: "Expiry date must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const medicineData = {
        name: formData.name,
        batch: formData.batch,
        expiryDate,
        unitPrice: parseFormattedNumber(formData.unitPrice),
        quantity: parseFormattedNumber(formData.quantity),
        minStock: parseFormattedNumber(formData.minStock) || 10,
        supplier: formData.supplier || undefined,
        category: formData.category || undefined,
        dosage: formData.dosage || undefined,
        unit: formData.unit,
      };

      addMedicine(medicineData);

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/clinic/pharmacy");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const expiryStatus = getExpiryStatus(formData.expiryDate);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              Medicine has been added to inventory successfully.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to pharmacy...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Stock Entry</h1>
            <p className="text-gray-600 mt-1">
              Add new medicine to your pharmacy inventory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <Package className="h-6 w-6 mr-3" />
                  Medicine Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Medicine Name */}
                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Pill className="h-4 w-4" />
                        Medicine Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Paracetamol 500mg"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                        required
                        list="medicine-suggestions"
                      />
                      <datalist id="medicine-suggestions">
                        {existingMedicines.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Batch Number */}
                    <div className="space-y-3">
                      <Label htmlFor="batch" className="text-sm font-semibold">
                        Batch Number *
                      </Label>
                      <Input
                        id="batch"
                        placeholder="e.g., PAR2024001"
                        value={formData.batch}
                        onChange={(e) =>
                          handleInputChange("batch", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        Category
                      </Label>
                      <Input
                        id="category"
                        placeholder="e.g., Analgesic, Antibiotic"
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="expiryDate"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Expiry Date *
                      </Label>
                      <div className="relative">
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className="h-11 border-gray-300 focus:border-blue-500 pr-10"
                          required
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {expiryStatus && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                expiryStatus.status === "expired"
                                  ? "text-red-500"
                                  : expiryStatus.status === "warning"
                                    ? "text-orange-500"
                                    : "text-blue-500"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                      {expiryStatus && (
                        <p
                          className={`text-xs ${
                            expiryStatus.status === "expired"
                              ? "text-red-600"
                              : expiryStatus.status === "warning"
                                ? "text-orange-600"
                                : "text-blue-600"
                          }`}
                        >
                          {expiryStatus.message}
                        </p>
                      )}
                    </div>

                    {/* Unit */}
                    <div className="space-y-3">
                      <Label htmlFor="unit" className="text-sm font-semibold">
                        Unit *
                      </Label>
                      <select
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          handleInputChange("unit", e.target.value)
                        }
                        className="w-full h-11 px-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="tablets">Tablets</option>
                        <option value="capsules">Capsules</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="mg">Milligrams (mg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="units">Units</option>
                        <option value="bottles">Bottles</option>
                        <option value="vials">Vials</option>
                        <option value="tubes">Tubes</option>
                      </select>
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="unitPrice"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Unit Price (UGX) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="unitPrice"
                          type="text"
                          placeholder="0"
                          value={formattedValues.unitPrice}
                          onChange={(e) =>
                            handleNumericInputChange(
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="h-11 border-gray-300 focus:border-blue-500 pl-8"
                          required
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          UGX
                        </span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="quantity"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Box className="h-4 w-4" />
                        Quantity *
                      </Label>
                      <Input
                        id="quantity"
                        type="text"
                        placeholder="0"
                        value={formattedValues.quantity}
                        onChange={(e) =>
                          handleNumericInputChange("quantity", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Minimum Stock */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="minStock"
                        className="text-sm font-semibold"
                      >
                        Minimum Stock Level
                      </Label>
                      <Input
                        id="minStock"
                        type="text"
                        placeholder="10"
                        value={formattedValues.minStock}
                        onChange={(e) =>
                          handleNumericInputChange("minStock", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    {/* Supplier */}
                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="supplier"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Supplier
                      </Label>
                      <Input
                        id="supplier"
                        placeholder="e.g., Pharma Plus Ltd"
                        value={formData.supplier}
                        onChange={(e) =>
                          handleInputChange("supplier", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    {/* Dosage */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="dosage" className="text-sm font-semibold">
                        Dosage Instructions
                      </Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 500mg, 1 tablet 3 times daily"
                        value={formData.dosage}
                        onChange={(e) =>
                          handleInputChange("dosage", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Add to Inventory
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900 text-lg">
                  <Calculator className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-semibold">
                      {formattedValues.unitPrice
                        ? `UGX ${formattedValues.unitPrice}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">
                      {formattedValues.quantity || "-"} {formData.unit}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold">
                        Total Value:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        UGX{" "}
                        {formatNumberWithCommas(
                          calculateTotalValue().toString()
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Always verify batch numbers and expiry dates
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Box className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Set minimum stock levels to receive alerts
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Check expiry dates regularly to avoid waste
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
