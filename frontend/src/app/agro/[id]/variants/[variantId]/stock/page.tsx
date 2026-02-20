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
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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

export default function VariantStockPage() {
  const router = useRouter();
  const { id, variantId } = useParams();
  const { toast } = useToast();
  const {
    fetchProductDetails,
    addStockShipment,
    fetchVariantStockHistory,
    deleteAllVariantShipments,
  } = useAgroProduct();
  const { currentBranchId } = useAuth();
  const [variant, setVariant] = useState<AgroProductVariant | null>(null);
  const [productName, setProductName] = useState("");
  const [stockHistory, setStockHistory] = useState<StockShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    costPrice: "",
  });
  const [formattedValues, setFormattedValues] = useState({
    quantity: "",
    costPrice: "",
  });
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [isAddingStock, setIsAddingStock] = useState(false);

  useEffect(() => {
    if (id && variantId) {
      loadVariantData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, variantId]);

  const loadVariantData = async () => {
    setIsLoading(true);
    try {
      const product = await fetchProductDetails(id as string);

      if (!product?.variants) {
        throw new Error("Product variants not loaded");
      }

      const currentVariant = product.variants.find((v) => v.id === variantId);

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

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericFormChange = (field: string, value: string) => {
    const formatted = formatNumberWithCommas(value);
    setFormattedValues((prev) => ({ ...prev, [field]: formatted }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = parseFormattedNumber(formData.quantity);
    const costPrice = parseFormattedNumber(formData.costPrice);
    const receivedDate = new Date().toISOString();

    if (quantity > 0 && costPrice > 0) {
      setIsAddingStock(true);
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
        // Refresh stock history
        const history = await fetchVariantStockHistory(
          id as string,
          variantId as string
        );
        setStockHistory(history);
        // Reset form
        setFormData({ quantity: "", costPrice: "" });
        setFormattedValues({ quantity: "", costPrice: "" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add stock.",
          variant: "destructive",
        });
      } finally {
        setIsAddingStock(false);
      }
    }
  };

  const handleDeleteAllShipments = async () => {
    if (!id || !variantId) return;

    setIsDeleting(true);
    try {
      await deleteAllVariantShipments(id as string, variantId as string);
      toast({
        title: "Success",
        description: "All shipments have been deleted successfully.",
      });
      // Refresh data to show zero stock
      await loadVariantData();
    } catch (error: any) {
      console.error("Error deleting shipments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipments.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    await loadVariantData();
    toast({
      title: "Refreshed",
      description: "Stock data has been refreshed.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p>Loading variant details...</p>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p>Variant not found.</p>
        </div>
      </div>
    );
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <h1 className="text-2xl font-bold">
            Stock Management: {capitalizeWords(variant.name)}
          </h1>
        </div>
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
            {variant.currentAverageCostPrice.toLocaleString()} UGX
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Stock</h2>
          {stockHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Shipments
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all
                    {stockHistory.length} shipment records for this variant and
                    reset the stock quantity and average cost price to zero.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllShipments}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete All Shipments"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <form
          onSubmit={handleAddStock}
          className="flex items-end gap-4 p-4 border rounded-lg"
        >
          <div className="flex-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="text"
              placeholder="0"
              value={formattedValues.quantity}
              onChange={(e) =>
                handleNumericFormChange("quantity", e.target.value)
              }
              required
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="costPrice">Cost Price per Unit (UGX)</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="text"
              placeholder="0"
              value={formattedValues.costPrice}
              onChange={(e) =>
                handleNumericFormChange("costPrice", e.target.value)
              }
              required
            />
          </div>
          <Button type="submit" disabled={isAddingStock}>
            <Plus className="h-4 w-4 mr-2" />
            {isAddingStock ? "Adding..." : "Add Stock"}
          </Button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Stock Movement History</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {stockHistory.length} shipment{stockHistory.length !== 1 ? "s" : ""}
            </div>
            {stockHistory.length > 3 && (
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
                    Show All ({stockHistory.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost (UGX)</TableHead>
                <TableHead className="text-right">Total Value (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockHistory.length > 0 ? (
                (showAllMovements
                  ? stockHistory
                  : stockHistory.slice(0, 3)
                ).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.receivedDate), "PPpp")}
                    </TableCell>
                    <TableCell>{movement.type || "PURCHASE"}</TableCell>
                    <TableCell className="text-right">
                      {movement.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.costPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        movement.quantity * movement.costPrice
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Trash2 className="h-8 w-8 text-muted-foreground/50" />
                      <p>No stock movements for this variant yet.</p>
                      <p className="text-sm">
                        Add your first shipment to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {stockHistory.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Shipments:</span>{" "}
                {stockHistory.length}
              </div>
              <div>
                <span className="font-medium">Total Quantity:</span>{" "}
                {stockHistory
                  .reduce((sum, movement) => {
                    // Ensure quantity is treated as a number
                    const quantity = Number(movement.quantity);
                    return sum + (isNaN(quantity) ? 0 : quantity);
                  }, 0)
                  .toLocaleString()}{" "}
                {variant.unitOfMeasure}
              </div>
              <div>
                <span className="font-medium">Total Value:</span>{" "}
                {stockHistory
                  .reduce(
                    (sum, movement) =>
                      sum + movement.quantity * movement.costPrice,
                    0
                  )
                  .toLocaleString()}{" "}
                UGX
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
