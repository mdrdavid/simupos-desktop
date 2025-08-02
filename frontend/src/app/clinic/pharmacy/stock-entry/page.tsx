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
import { ArrowLeft, Save, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StockEntryPage() {
  const router = useRouter();
  const { addMedicine } = useClinic();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date(formData.expiryDate);
    if (expiryDate <= new Date()) {
      toast({
        title: "Validation Error",
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
        unitPrice: Number.parseFloat(formData.unitPrice),
        quantity: Number.parseInt(formData.quantity),
        minStock: Number.parseInt(formData.minStock) || 10,
        supplier: formData.supplier || undefined,
        category: formData.category || undefined,
        dosage: formData.dosage || undefined,
         unit: formData.unit,
      };

      addMedicine(medicineData);

      toast({
        title: "Success",
        description: "Medicine added to inventory successfully",
      });

      router.push("/clinic/pharmacy");
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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Entry</h1>
          <p className="text-gray-600">Add new medicine to inventory</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Medicine Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Paracetamol 500mg"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Number *</Label>
              <Input
                id="batch"
                placeholder="e.g., PAR2024001"
                value={formData.batch}
                onChange={(e) => handleInputChange("batch", e.target.value)}
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (UGX) *</Label>
              <Input
                id="unitPrice"
                type="number"
                placeholder="e.g., 500"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                required
                min="0"
                step="100"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 100"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
                min="1"
              />
            </div>
            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="ml">Milliliters</option>
                <option value="mg">Milligrams</option>
                <option value="g">Grams</option>
                <option value="units">Units</option>
              </select>
            </div>
            {/* Minimum Stock */}
            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="e.g., 20"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", e.target.value)}
                min="0"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="e.g., Pharma Plus Ltd"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Analgesic, Antibiotic"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              />
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg, 1 tablet"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add to Inventory"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
