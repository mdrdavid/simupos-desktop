/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAgroProduct } from "@/context/AgroProductContext";
import { ArrowLeft, Plus, Pencil, PackagePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { AgroProduct } from "@/src/types/agroProduct";
import { capitalizeWords } from "@/src/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ProductStockPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { agroProducts, updateProductStock, fetchProductDetails } =
    useAgroProduct();
  const [product, setProduct] = useState<AgroProduct | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        try {
          // Always fetch fresh product details to get updated stock movements
          const fetchedProduct = await fetchProductDetails(id as string);
          setProduct(fetchedProduct);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch product details.",
            variant: "destructive",
          });
        }
      }
    };
    getProduct();
  }, [id, fetchProductDetails, toast]);

  const stockMovements = product?.stockShipments || [];
  const variants = product?.variants || [];

  const handleStockAdjustment = async (data: {
    quantity: number;
    costPrice: number;
    currency: string;
    receivedDate: string;
    supplierInfo: string;
    type: string;
    notes: string;
  }) => {
    setIsAdjustingStock(true);
    try {
      await updateProductStock(
        id as string,
        data.quantity, // quantityChange
        data.notes // reason
      );
      toast({
        title: "Stock added successfully",
        description: `${data.quantity} items added to stock`,
      });
      // Refresh product data to get updated stock movements
      if (id) {
        const refreshedProduct = await fetchProductDetails(id as string);
        setProduct(refreshedProduct);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock",
        variant: "destructive",
      });
    } finally {
      setIsAdjustingStock(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/agro/inventory`}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
          <h1 className="text-2xl font-bold">
            Stock Management: {capitalizeWords(product?.name)}
          </h1>
        </div>
        <Link href={`/agro/${id}/stock/add`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Current Stock
          </h3>
          <p className="text-2xl font-bold">
            {Math.floor(product?.totalStockQuantity || 0)}{" "}
            {product?.unitOfMeasure}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Cost
          </h3>
          <p className="text-2xl font-bold">
            {(product?.currentAverageCostPrice || 0).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
            {product?.baseCurrency}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Minimum Level
          </h3>
          <p className="text-2xl font-bold">
            {product?.minStockLevel || "Not set"} {product?.unitOfMeasure}
          </p>
        </div>
      </div>

      {product?.hasVariants && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Product Variants</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant: any) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>{variant.totalStockQuantity}</TableCell>
                    <TableCell>{variant.unitOfMeasure}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!product?.hasVariants && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                handleStockAdjustment({
                  quantity: 1,
                  costPrice: 0,
                  currency: product?.baseCurrency || "",
                  receivedDate: new Date().toISOString(),
                  supplierInfo: "",
                  type: "MANUAL",
                  notes: "Manual adjustment +1",
                })
              }
              disabled={isAdjustingStock}
            >
              {isAdjustingStock ? "..." : `+1 ${product?.unitOfMeasure}`}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleStockAdjustment({
                  quantity: -1,
                  costPrice: 0,
                  currency: product?.baseCurrency || "",
                  receivedDate: new Date().toISOString(),
                  supplierInfo: "",
                  type: "MANUAL",
                  notes: "Manual adjustment -1",
                })
              }
              disabled={isAdjustingStock}
            >
              {isAdjustingStock ? "..." : `-1 ${product?.unitOfMeasure}`}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleStockAdjustment({
                  quantity: 5,
                  costPrice: 0,
                  currency: product?.baseCurrency || "",
                  receivedDate: new Date().toISOString(),
                  supplierInfo: "",
                  type: "MANUAL",
                  notes: "Manual adjustment +5",
                })
              }
              disabled={isAdjustingStock}
            >
              {isAdjustingStock ? "..." : `+5 ${product?.unitOfMeasure}`}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleStockAdjustment({
                  quantity: -5,
                  costPrice: 0,
                  currency: product?.baseCurrency || "",
                  receivedDate: new Date().toISOString(),
                  supplierInfo: "",
                  type: "MANUAL",
                  notes: "Manual adjustment -5",
                })
              }
              disabled={isAdjustingStock}
            >
              {isAdjustingStock ? "..." : `-5 ${product?.unitOfMeasure}`}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Stock Movement History</h2>
          {stockMovements.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllMovements(!showAllMovements)}
              className="gap-2"
            >
              {showAllMovements ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show All ({stockMovements.length})
                </>
              )}
            </Button>
          )}
        </div>
        {stockMovements.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showAllMovements
                  ? stockMovements
                  : stockMovements.slice(0, 3)
                ).map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.receivedDate), "PP")}
                    </TableCell>
                    <TableCell>{movement.type || "PURCHASE"}</TableCell>
                    <TableCell className="text-right">
                      {Math.floor(movement.quantity)} {product?.unitOfMeasure}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.costPrice?.toLocaleString()} {movement.currency}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        movement.quantity * movement.costPrice
                      )?.toLocaleString()}{" "}
                      {movement.currency}
                    </TableCell>
                    <TableCell>{movement.supplierInfo || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No stock movements recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
