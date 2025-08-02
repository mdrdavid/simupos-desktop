"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgroProduct } from "@/context/AgroProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AddAgroProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createProduct } = useAgroProduct();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    baseCurrency: "UGX",
    unitOfMeasure: "kg",
    minStockLevel: "",
    productCode: "",
    hasVariants: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const product = await createProduct({
        ...formData,
        minStockLevel: formData.minStockLevel
          ? Number(formData.minStockLevel)
          : undefined,
      });

      toast({
        title: "Product created",
        description: `Product ${product.name} has been created successfully`,
      });

      if (formData.hasVariants) {
        router.push(`/agro/${product.id}/variants/add`);
      } else {
        router.push(`/agro/${product.id}/stock/add`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Agricultural Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baseCurrency">Currency</Label>
            <Input
              id="baseCurrency"
              value={formData.baseCurrency}
              onChange={(e) =>
                setFormData({ ...formData, baseCurrency: e.target.value })
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
              required={!formData.hasVariants}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="productCode">Product Code</Label>
            <Input
              id="productCode"
              value={formData.productCode}
              onChange={(e) =>
                setFormData({ ...formData, productCode: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="hasVariants"
            checked={formData.hasVariants}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, hasVariants: checked })
            }
          />
          <Label htmlFor="hasVariants">This product has variants</Label>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
