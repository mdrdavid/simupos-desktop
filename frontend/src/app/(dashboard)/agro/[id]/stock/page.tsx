/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAgroProduct } from "@/context/AgroProductContext";
import { ArrowLeft, Plus } from "lucide-react";
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

export default function ProductStockPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { agroProducts, updateProductStock } = useAgroProduct();

  const product = agroProducts.find((p) => p.id === id);
  const stockMovements = product?.stockShipments || [];

  const handleStockAdjustment = async (quantityChange: number) => {
    try {
      await updateProductStock(id as string, quantityChange);
      toast({
        title: "Stock updated",
        description: `Stock level adjusted by ${quantityChange > 0 ? "+" : ""}${quantityChange}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
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
            Stock Management: {product?.name}
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
            {product?.totalStockQuantity || 0} {product?.unitOfMeasure}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Cost
          </h3>
          <p className="text-2xl font-bold">
            {product?.currentAverageCostPrice?.toLocaleString() || 0}{" "}
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

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleStockAdjustment(1)}>
            +1 {product?.unitOfMeasure}
          </Button>
          <Button variant="outline" onClick={() => handleStockAdjustment(-1)}>
            -1 {product?.unitOfMeasure}
          </Button>
          <Button variant="outline" onClick={() => handleStockAdjustment(5)}>
            +5 {product?.unitOfMeasure}
          </Button>
          <Button variant="outline" onClick={() => handleStockAdjustment(-5)}>
            -5 {product?.unitOfMeasure}
          </Button>
        </div>

        <h2 className="text-xl font-semibold">Stock Movement History</h2>
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
                {stockMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.receivedDate), "PP")}
                    </TableCell>
                    <TableCell>{movement.type || "PURCHASE"}</TableCell>
                    <TableCell className="text-right">
                      {movement.quantity} {product?.unitOfMeasure}
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
