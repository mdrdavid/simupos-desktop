/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAgroProduct } from "@/context/AgroProductContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AddStockPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { addStockShipment, agroProducts, refetchProducts } = useAgroProduct();
  const { currentBranchId } = useAuth();

  const product = agroProducts.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    quantity: "",
    costPrice: "",
    currency: "UGX",
    receivedDate: new Date().toISOString().split("T")[0],
    supplierInfo: "",
    type: "PURCHASE",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranchId) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      await addStockShipment(
        id as string,
        null,
        {
          quantity: Number(formData.quantity),
          costPrice: Number(formData.costPrice),
          currency: formData.currency,
          receivedDate: formData.receivedDate,
          supplierInfo: formData.supplierInfo,
          branchId: currentBranchId,
        },
        currentBranchId
      );

      toast({
        title: "Stock added",
        description: `${formData.quantity} ${product?.unitOfMeasure} added to ${product?.name}`,
      });

      refetchProducts();
      router.push(`/agro/${id}/stock`);
    } catch (error: any) {
      console.error("Error adding stock:", error);
      const errorMessage = error?.message || "Failed to add stock";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/agro/${id}/stock`}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </Link>
        <h1 className="text-2xl font-bold">Add Stock to {product?.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              In {product?.unitOfMeasure || "units"}
            </p>
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price *</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({ ...formData, costPrice: e.target.value })
              }
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Per {product?.unitOfMeasure || "unit"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency *</Label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="receivedDate">Received Date *</Label>
            <Input
              id="receivedDate"
              type="date"
              value={formData.receivedDate}
              onChange={(e) =>
                setFormData({ ...formData, receivedDate: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="supplierInfo">Supplier Information</Label>
          <Input
            id="supplierInfo"
            value={formData.supplierInfo}
            onChange={(e) =>
              setFormData({ ...formData, supplierInfo: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="type">Transaction Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="PURCHASE">Purchase</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURN">Return</option>
          </select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Stock"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/agro/${id}/stock`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
