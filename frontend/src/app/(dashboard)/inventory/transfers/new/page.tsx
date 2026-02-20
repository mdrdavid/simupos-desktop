/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Search,
  Trash2,
  Plus,
  AlertCircle,
  Package,
  Save,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import { createStockTransferApi } from "@/src/data/api/stock-transfer-http-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TransferItem {
  id: string;
  name: string;
  quantity: number;
  availableStock: number;
  unit?: string;
  sellingPrice?: number;
}

interface AvailableItem {
  id: string;
  name: string;
  barcode?: string;
  availableStock: number;
  unit?: string;
  sellingPrice?: number;
}

export default function NewStockTransferPage() {
  const router = useRouter();
  const { currentBranch, branches } = useBranch();
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const [toBranchId, setToBranchId] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAvailableItems = useCallback(async () => {
    if (!currentBranch) return;

    setItemsLoading(true);
    try {
      const api = createStockTransferApi(getAuthHeaders);
      const response = await api.getAvailableItemsForTransfer(currentBranch.id);
      setAvailableItems(response.data || []);
    } catch (error) {
      console.error("Failed to fetch available items:", error);
      toast({
        title: "Error",
        description: "Failed to load available items",
        variant: "destructive",
      });
    } finally {
      setItemsLoading(false);
    }
  }, [currentBranch, getAuthHeaders, toast]);

  useEffect(() => {
    fetchAvailableItems();
  }, [fetchAvailableItems]);

  const otherBranches = branches.filter(
    (b) => b.id !== currentBranch?.id && b.isActive,
  );

  const addItem = (item: AvailableItem) => {
    if (selectedItems.find((si) => si.id === item.id)) {
      toast({
        title: "Item already added",
        description: "Adjust the quantity in the list below.",
      });
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        id: item.id,
        name: item.name,
        quantity: 1,
        availableStock: item.availableStock,
        unit: item.unit,
        sellingPrice: item.sellingPrice,
      },
    ]);
    setSearchQuery("");
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = selectedItems.find((i) => i.id === id);
    if (!item) return;

    if (quantity > item.availableStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.availableStock} units available.`,
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) return;

    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  };

  const handleSubmit = async () => {
    if (!toBranchId) {
      toast({
        title: "Branch required",
        description: "Please select a destination branch.",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "Items required",
        description: "Please add at least one item to transfer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const api = createStockTransferApi(getAuthHeaders);
      await api.createTransfer({
        fromBranchId: currentBranch!.id,
        toBranchId,
        items: selectedItems.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
        notes,
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : undefined,
      });

      toast({
        title: "Success",
        description: "Stock transfer request created successfully.",
      });
      router.push("/inventory/transfers");
    } catch (error: any) {
      console.error("Failed to create transfer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create stock transfer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableItems =
    searchQuery.length > 0
      ? availableItems
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.barcode && item.barcode.includes(searchQuery)),
          )
          .slice(0, 5)
      : [];

  const totalValue = selectedItems.reduce(
    (sum, item) => sum + item.quantity * (item.sellingPrice || 0),
    0,
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory/transfers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            New Stock Transfer
          </h1>
          <p className="text-gray-600">
            Request stock movement to another branch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Select Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products by name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />

                {filteredAvailableItems.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {filteredAvailableItems.map((item) => (
                      <button
                        key={item.id}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left border-b last:border-0"
                        onClick={() => addItem(item)}
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Available: {item.availableStock}{" "}
                            {item.unit || "units"} |{" "}
                            {formatCurrency(item.sellingPrice || 0)}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length > 0 &&
                  filteredAvailableItems.length === 0 &&
                  !itemsLoading && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md p-4 shadow-lg text-center text-gray-500">
                      No products found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
              </div>

              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="w-[150px]">Transfer Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-gray-500"
                        >
                          No items added yet. Search and select items above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.availableStock} {item.unit || "units"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={item.availableStock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.sellingPrice || 0)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(
                              (item.sellingPrice || 0) * item.quantity,
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transfer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to-branch">Destination Branch</Label>
                <Select value={toBranchId} onValueChange={setToBranchId}>
                  <SelectTrigger id="to-branch">
                    <SelectValue placeholder="Select target branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherBranches.length > 0 ? (
                      otherBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No other active branches
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-date">
                  Expected Delivery Date (Optional)
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Items:</span>
                  <span className="font-semibold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Value:</span>
                  <span className="text-primary">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Create Transfer Request
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Stock Impact</p>
                <p>
                  Stock will be deducted from your branch only after the
                  transfer is <span className="font-bold">approved</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
