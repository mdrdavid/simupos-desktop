/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgroProduct } from "@/context/AgroProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AgroProductVariant, StockShipment } from "@/src/types/agroProduct";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { capitalizeWords } from "@/src/utils";

export default function VariantStockPage() {
  const router = useRouter();
  const { id, variantId } = useParams();
  const { toast } = useToast();
  const { fetchProductDetails, addStockShipment, fetchVariantStockHistory } =
    useAgroProduct();
  const { currentBranchId } = useAuth();
  const [variant, setVariant] = useState<AgroProductVariant | null>(null);
  const [productName, setProductName] = useState("");
  const [stockHistory, setStockHistory] = useState<StockShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (id && variantId) {
      const getVariantDetails = async () => {
        setIsLoading(true);
        try {
          const product = await fetchProductDetails(id as string);

          if (!product?.variants) {
            throw new Error("Product variants not loaded");
          }

          const currentVariant = product.variants.find(
            (v) => v.id === variantId
          );

          if (!currentVariant) {
            throw new Error(`Variant ${variantId} not found in product ${id}`);
          }

          setVariant(currentVariant);
          setProductName(product.name);

          const history = await fetchVariantStockHistory(
            id as string,
            variantId as string
          );
          console.log("Stock history:", history);
          setStockHistory(history);
        } catch (error: any) {
          console.error("Detailed error:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to fetch variant details.",
            variant: "destructive",
          });
          // Optionally redirect if the variant doesn't exist
          router.push(`/agro/${id}/stock`);
        } finally {
          setIsLoading(false);
        }
      };
      getVariantDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, variantId]);

  const handleAddStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get("quantity"));
    const costPrice = Number(formData.get("costPrice"));
    const receivedDate = new Date().toISOString();

    if (quantity > 0 && costPrice > 0) {
      try {
        await addStockShipment(
          id as string,
          variantId as string,
          {
            quantity,
            costPrice,
            receivedDate,
            currency: "UGX", // Add default currency
            type: "PURCHASE", // Add default type
            branchId: currentBranchId ?? "", // Include branchId, fallback to empty string if null
          },
          currentBranchId as string
        );
        toast({
          title: "Stock added",
          description: "New stock has been added successfully.",
        });
        // Refresh data
        const product = await fetchProductDetails(id as string);
        const currentVariant = product.variants?.find(
          (v) => v.id === variantId
        );
        if (currentVariant) {
          setVariant(currentVariant);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add stock.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!variant) {
    return <p>Variant not found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/agro/${id}/stock`}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {productName} Stock
        </Link>
        <h1 className="text-2xl font-bold">Stock Management: {capitalizeWords(variant.name)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Current Stock
          </h3>
          <p className="text-2xl font-bold">
            {variant.totalStockQuantity} {variant.unitOfMeasure}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Cost Price
          </h3>
          <p className="text-2xl font-bold">
            {variant.currentAverageCostPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Stock</h2>
        <form
          onSubmit={handleAddStock}
          className="flex items-end gap-4 p-4 border rounded-lg"
        >
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price per Unit</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Stock Movement History</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockHistory.length > 0 ? (
                stockHistory.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.receivedDate), "PPpp")}
                    </TableCell>
                    <TableCell>{movement.type || "PURCHASE"}</TableCell>
                    <TableCell className="text-right">
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.costPrice.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No stock movements for this variant yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
