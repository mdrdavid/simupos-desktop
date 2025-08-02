"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAgroProduct } from "@/context/AgroProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function AddVariantPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { createVariant } = useAgroProduct();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitOfMeasure: "kg",
    minStockLevel: "",
    productCode: "",
    currentAverageCostPrice: "",
    totalStockQuantity: "0",
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null, // Send null instead of empty string
        unitOfMeasure: formData.unitOfMeasure,
        minStockLevel: formData.minStockLevel
          ? Number(formData.minStockLevel)
          : null,
        productCode: formData.productCode.trim() || null,
        currentAverageCostPrice: Number(formData.currentAverageCostPrice) || 0,
        totalStockQuantity: Number(formData.totalStockQuantity) || 0,
        isActive: formData.isActive,
          branchId: currentBranchId
      };

      // Validation checks
      if (payload.name.length < 2 || payload.name.length > 100) {
        throw new Error("Variant name must be between 2-100 characters");
      }
      if (payload.description && payload.description.length > 500) {
        throw new Error("Description cannot exceed 500 characters");
      }
      if (payload.unitOfMeasure.length > 20) {
        throw new Error("Unit of measure cannot exceed 20 characters");
      }
      if (payload.productCode && payload.productCode.length > 50) {
        throw new Error("Product code cannot exceed 50 characters");
      }

      console.log("Submitting variant data:", payload);
      await createVariant(id as string, payload);

      toast({
        title: "Variant added",
        description: `Variant ${formData.name} has been added successfully`,
      });

      router.push(`/agro/${id}/variants`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add variant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setIsLoading(true);

  //     try {
  //       await createVariant(id as string, {
  //         ...formData,
  //         minStockLevel: Number(formData.minStockLevel) || undefined,
  //         currentAverageCostPrice: Number(formData.currentAverageCostPrice) || 0,
  //         totalStockQuantity: Number(formData.totalStockQuantity) || 0
  //       });

  //       toast({
  //         title: "Variant added",
  //         description: `Variant ${formData.name} has been added successfully`,
  //       });

  //       router.push(`/agro/${id}/variants`);
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (error) {
  //       toast({
  //         title: "Error",
  //         description: "Failed to add variant",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add Product Variant</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Variant Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
          <Input
            id="unitOfMeasure"
            value={formData.unitOfMeasure}
            onChange={(e) =>
              setFormData({ ...formData, unitOfMeasure: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
            <Input
              id="minStockLevel"
              type="number"
              min="0"
              value={formData.minStockLevel}
              onChange={(e) =>
                setFormData({ ...formData, minStockLevel: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="currentAverageCostPrice">Cost Price</Label>
            <Input
              id="currentAverageCostPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.currentAverageCostPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentAverageCostPrice: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="totalStockQuantity">Initial Stock</Label>
            <Input
              id="totalStockQuantity"
              type="number"
              min="0"
              value={formData.totalStockQuantity}
              onChange={(e) =>
                setFormData({ ...formData, totalStockQuantity: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="productCode">Product Code</Label>
          <Input
            id="productCode"
            value={formData.productCode}
            onChange={(e) =>
              setFormData({ ...formData, productCode: e.target.value })
            }
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Variant"}
        </Button>
      </form>
    </div>
  );
}
