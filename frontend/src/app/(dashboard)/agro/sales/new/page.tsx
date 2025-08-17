/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCcw,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAgroProduct } from "@/context/AgroProductContext";
import { useAuth } from "@/context/AuthContext";
import { AgroProduct } from "@/src/types/agroProduct";
import { httpClient } from "@/src/data/api/httpClient";

interface SaleItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantitySold: number;
  salePricePerUnit: number;
  costPricePerUnitAtSale: number;
  unitOfMeasure: string;
  currency: string;
  availableStock: number;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function NewAgroSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    agroProducts,
    loading,
    error,
    fetchProductsByBranch,
    updateProductStock,
  } = useAgroProduct();
  const { currentBranchId, user, getAuthHeaders } = useAuth();

  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [isDeliveryPending, setIsDeliveryPending] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAmountPaidModified, setIsAmountPaidModified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Fetch products when branch changes
  useEffect(() => {
    if (currentBranchId) {
      fetchProductsByBranch(currentBranchId);
    }
  }, [currentBranchId, fetchProductsByBranch]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.salePricePerUnit * item.quantitySold,
      0
    );
  }, [selectedItems]);

  const [amountPaid, setAmountPaid] = useState(totalAmount.toString());

  useEffect(() => {
    if (!isAmountPaidModified) {
      setAmountPaid(totalAmount.toString());
    }
  }, [totalAmount, isAmountPaidModified]);

  const balanceDue = useMemo(() => {
    const paid = Number.parseFloat(amountPaid) || 0;
    return totalAmount - paid;
  }, [totalAmount, amountPaid]);

  // Filter active products based on search
  const filteredProducts = useMemo(() => {
    return agroProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        product.isActive
    );
  }, [agroProducts, searchTerm]);

  const handleAddItemToSale = (product: AgroProduct, variant?: any) => {
    const existingItem = selectedItems.find(
      (item) =>
        item.productId === product.id &&
        (!product.hasVariants || item.variantId === variant?.id)
    );

    if (existingItem) {
      toast({
        title: "Item Exists",
        description: `${product.name}${variant ? ` - ${variant.name}` : ""} is already in the sale. Adjust quantity instead.`,
      });
      return;
    }

    const isVariant = product.hasVariants && variant;
    const itemStock = isVariant
      ? variant.totalStockQuantity
      : product.totalStockQuantity;
    const itemCostPrice = isVariant
      ? variant.currentAverageCostPrice
      : product.currentAverageCostPrice;
    const itemUnit = isVariant ? variant.unitOfMeasure : product.unitOfMeasure;

    // Handle both string and number types
    const availableStock =
      typeof itemStock === "string"
        ? parseFloat(itemStock) || 0
        : itemStock || 0;

    const costPrice =
      typeof itemCostPrice === "string"
        ? parseFloat(itemCostPrice) || 0
        : itemCostPrice || 0;

    if (availableStock <= 0 && !isDeliveryPending) {
      toast({
        title: "Out of Stock",
        description: `${product.name}${variant ? ` - ${variant.name}` : ""} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    // Calculate sale price with 20% markup, ensuring it's at least 0
    const salePrice = Math.max(0, costPrice * 1.2);

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantName: variant?.name,
        quantitySold: 1,
        salePricePerUnit: salePrice,
        costPricePerUnitAtSale: costPrice,
        unitOfMeasure: itemUnit || "unit",
        currency: product.baseCurrency || "UGX",
        availableStock: availableStock,
      },
    ]);
    setIsItemModalVisible(false);
    setSearchTerm("");
  };

  const updateItemDetail = (
    productId: string,
    variantId: string | undefined,
    field: "quantitySold" | "salePricePerUnit",
    value: string
  ) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          let numericValue = Number.parseFloat(value);
          if (isNaN(numericValue)) numericValue = 0;

          if (field === "quantitySold") {
            if (numericValue > item.availableStock && !isDeliveryPending) {
              toast({
                title: "Insufficient Stock",
                description: `Only ${item.availableStock} ${item.unitOfMeasure} available`,
                variant: "destructive",
              });
              return { ...item, [field]: item.availableStock };
            }
            return { ...item, [field]: Math.max(0, numericValue) };
          }
          return { ...item, [field]: Math.max(0, numericValue) };
        }
        return item;
      })
    );
  };

  const removeItemFromSale = (productId: string, variantId?: string) => {
    setSelectedItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const validateSale = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one product to the sale.",
        variant: "destructive",
      });
      return false;
    }

    if (isCreditSale && !customerName.trim()) {
      toast({
        title: "Customer Required",
        description: "Customer name is required for credit sales.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedItems.some((item) => item.salePricePerUnit <= 0)) {
      toast({
        title: "Invalid Prices",
        description: "All items must have a positive sale price.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedItems.some((item) => item.quantitySold <= 0)) {
      toast({
        title: "Invalid Quantities",
        description: "All items must have a positive quantity.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCompleteSale = async () => {
    if (!validateSale()) return;

    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();

      // Prepare sale data
      const saleData = {
        amount: totalAmount,
        paymentMethod,
        customerName: isCreditSale ? customerName.trim() : null,
        customerPhone: isCreditSale ? customerPhone.trim() : null,
        items: selectedItems.map((item) => ({
          agroProductId: item.productId,
          price: item.salePricePerUnit,
          quantity: item.quantitySold,
          name: item.variantName
            ? `${item.productName} - ${item.variantName}`
            : item.productName,
          productType: "agro",
          unit: item.unitOfMeasure,
        })),
        branchId: currentBranchId,
        userId: user?.id,
      };
     
      // 1. Create the sale record
      const saleResponse = await httpClient("/transactions/agro/web", {
        method: "POST",
        headers,
        body: JSON.stringify(saleData),
      });

      const saleResult = await saleResponse;

      // 2. Update stock for each item (if not pending delivery)
      if (!isDeliveryPending) {
        for (const item of selectedItems) {
          try {
            await updateProductStock(
              item.productId,
              -item.quantitySold, // Negative for deduction
              // `Sold in sale #${saleResult.saleNumber}`,
              item.variantId
            );
          } catch (stockError) {
            console.error(
              "Failed to update stock for item:",
              item.productName,
              stockError
            );
            // Continue with other items even if one fails
          }
        }
      }

      // Prepare receipt data with safe defaults
      setReceiptData({
        ...saleResult,
        items: selectedItems.map((item) => ({
          name: item.variantName
            ? `${item.productName} - ${item.variantName}`
            : item.productName,
          quantity: item.quantitySold || 0,
          unitPrice: item.salePricePerUnit || 0,
          unit: item.unitOfMeasure || "unit",
          total: (item.quantitySold || 0) * (item.salePricePerUnit || 0),
          currency: item.currency || "UGX",
        })),
        totalAmount: totalAmount || 0,
        payment: {
          method: paymentMethod,
          amount: Number(amountPaid) || 0,
          currency: selectedItems[0]?.currency || "UGX",
        },
        balanceDue: balanceDue || 0,
        cashier: user?.firstName || "Staff",
        date: new Date().toLocaleString(),
      });

      // Show success and receipt
      toast({
        title: "Sale Completed",
        description: `Sale #${saleResult.saleNumber} recorded successfully`,
      });
      setIsReceiptOpen(true);

      // Reset form (but keep items until receipt is printed)
    } catch (error) {
      console.error("Sale error:", error);
      toast({
        title: "Sale Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete the sale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    // Actual print functionality would go here
    window.print();

    // Reset form after printing
    setSelectedItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setIsCreditSale(false);
    setIsDeliveryPending(false);
    setPaymentMethod("cash");
    setNotes("");
    setAmountPaid("0");
    setIsAmountPaidModified(false);
    setIsReceiptOpen(false);
  };

  if (loading && agroProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-teal-600 hover:bg-teal-100 mb-4"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-teal-600" />
              <h3 className="text-lg font-medium text-gray-700">
                Loading Products...
              </h3>
              <p className="text-sm text-gray-500">
                Gathering available products for sale
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-teal-600 hover:bg-teal-100 mb-4"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 max-w-md">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
              <h3 className="text-lg font-medium text-gray-800">
                Unable to Load Products
              </h3>
              <p className="text-gray-600">{error}</p>
              <div className="pt-4">
                <Button
                  onClick={() =>
                    currentBranchId && fetchProductsByBranch(currentBranchId)
                  }
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      Try Again
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-teal-600 hover:bg-teal-100 mb-4"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <main className="space-y-6">
          {/* Add Items Section */}
          <section>
            <Button
              onClick={() => setIsItemModalVisible(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Products to Sale
            </Button>
          </section>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Sale Items</CardTitle>
                <CardDescription>
                  {selectedItems.length} product(s) in this sale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedItems.map((item) => {
                  // Calculate safe values for display
                  const purchasePrice = item.costPricePerUnitAtSale || 0;
                  const salePrice = item.salePricePerUnit || 0;
                  const quantity = item.quantitySold || 0;
                  const subtotal = quantity * salePrice;

                  // Calculate margin safely
                  const margin =
                    purchasePrice > 0
                      ? ((salePrice / purchasePrice - 1) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <div
                      key={`${item.productId}-${item.variantId || ""}`}
                      className="border rounded-lg p-4 relative bg-white shadow-sm"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeItemFromSale(item.productId, item.variantId)
                        }
                        className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-base">
                          {item.productName}
                          {item.variantName && (
                            <span className="text-gray-600">
                              {" "}
                              - {item.variantName}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 ml-2">
                            ({item.unitOfMeasure || "unit"})
                          </span>
                        </h4>
                        <Badge
                          variant={
                            item.availableStock > 0 ? "outline" : "destructive"
                          }
                        >
                          {item.availableStock > 0
                            ? `${item.availableStock} available`
                            : "Out of stock"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>Cost Price</Label>
                          <div className="h-10 flex items-center">
                            <span className="font-medium">
                              {item.currency} {purchasePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor={`qty-${item.productId}-${item.variantId || ""}`}
                          >
                            Quantity
                          </Label>
                          <Input
                            id={`qty-${item.productId}-${item.variantId || ""}`}
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) =>
                              updateItemDetail(
                                item.productId,
                                item.variantId,
                                "quantitySold",
                                e.target.value
                              )
                            }
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor={`price-${item.productId}-${item.variantId || ""}`}
                          >
                            Selling Price
                          </Label>
                          <Input
                            id={`price-${item.productId}-${item.variantId || ""}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={salePrice}
                            onChange={(e) =>
                              updateItemDetail(
                                item.productId,
                                item.variantId,
                                "salePricePerUnit",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Subtotal</Label>
                          <div className="h-10 flex items-center">
                            <span className="font-medium">
                              {item.currency} {subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <span>
                          Profit: {item.currency}{" "}
                          {(subtotal - quantity * purchasePrice).toFixed(2)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Margin: {margin}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Sale Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Sale Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="credit-sale">Credit Sale</Label>
                    <p className="text-sm text-gray-500">
                      Customer will pay later
                    </p>
                  </div>
                  <Switch
                    id="credit-sale"
                    checked={isCreditSale}
                    onCheckedChange={setIsCreditSale}
                  />
                </div>

                {isCreditSale && (
                  <div className="space-y-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <h4 className="font-medium text-amber-800">
                      Customer Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="customerName">Name *</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Customer name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="customerPhone">Phone</Label>
                          <Input
                            id="customerPhone"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerAddress">Location</Label>
                          <Input
                            id="customerAddress"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Address/area"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="delivery-pending">Pending Delivery</Label>
                    <p className="text-sm text-gray-500">
                      Stock will be reserved
                    </p>
                  </div>
                  <Switch
                    id="delivery-pending"
                    checked={isDeliveryPending}
                    onCheckedChange={setIsDeliveryPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amountPaid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => {
                        setAmountPaid(e.target.value);
                        setIsAmountPaidModified(true);
                      }}
                      placeholder="0.00"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAmountPaid(totalAmount.toString());
                        setIsAmountPaidModified(false);
                      }}
                    >
                      Full
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this sale..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary and Submit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-700">Sale Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-medium">
                    {selectedItems.reduce(
                      (sum, item) => sum + item.quantitySold,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold">
                    {selectedItems[0]?.currency || "UGX"}{" "}
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">
                    {selectedItems[0]?.currency || "UGX"}{" "}
                    {(Number(amountPaid) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Balance Due:</span>
                  <span
                    className={`font-bold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {selectedItems[0]?.currency || "UGX"}{" "}
                    {Math.abs(balanceDue).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCompleteSale}
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700 h-12 text-lg"
                disabled={isLoading || selectedItems.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Sale...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Complete Sale
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>

        {/* Product Selection Modal */}
        <Dialog open={isItemModalVisible} onOpenChange={setIsItemModalVisible}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Products to Sale</DialogTitle>
              <DialogDescription>
                Select agricultural products to include in this sale
              </DialogDescription>
            </DialogHeader>

            <div className="pb-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  {product.hasVariants ? (
                    product.variants?.map((variant) => {
                      const stockQuantity =
                        typeof variant.totalStockQuantity === "string"
                          ? parseFloat(variant.totalStockQuantity) || 0
                          : variant.totalStockQuantity || 0;
                      const costPrice =
                        typeof variant.currentAverageCostPrice === "string"
                          ? parseFloat(variant.currentAverageCostPrice) || 0
                          : variant.currentAverageCostPrice || 0;

                      return (
                        <div
                          key={variant.id}
                          onClick={() => handleAddItemToSale(product, variant)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            stockQuantity > 0
                              ? "hover:bg-teal-50"
                              : "opacity-70 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">
                                {product.name} - {variant.name}
                                <span className="text-sm text-gray-500 ml-2">
                                  (
                                  {variant.unitOfMeasure ||
                                    product.unitOfMeasure ||
                                    "unit"}
                                  )
                                </span>
                              </h4>
                              <p className="text-sm text-gray-600">
                                Cost: {product.baseCurrency || "UGX"}{" "}
                                {costPrice.toFixed(2)}/unit
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  stockQuantity > 0 ? "default" : "destructive"
                                }
                              >
                                {stockQuantity > 0
                                  ? `${stockQuantity} in stock`
                                  : "Out of stock"}
                              </Badge>
                              <Plus className="h-4 w-4 text-teal-600" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      onClick={() => handleAddItemToSale(product)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        product.totalStockQuantity > 0
                          ? "hover:bg-teal-50"
                          : "opacity-70 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            {product.name}
                            <span className="text-sm text-gray-500 ml-2">
                              ({product.unitOfMeasure || "unit"})
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600">
                            Cost: {product.baseCurrency || "UGX"}{" "}
                            {Number(
                              product.currentAverageCostPrice || 0
                            ).toFixed(2)}
                            /unit
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              product.totalStockQuantity > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {product.totalStockQuantity > 0
                              ? `${product.totalStockQuantity} in stock`
                              : "Out of stock"}
                          </Badge>
                          <Plus className="h-4 w-4 text-teal-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sale Receipt</DialogTitle>
              <DialogDescription>
                Sale #{receiptData?.saleNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {receiptData && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-lg"> Item Sale Receipt</h3>
                    <p className="text-sm text-gray-500">
                      {receiptData.date} • {receiptData.cashier}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    {receiptData.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name || "Unknown Item"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity || 0} {item.unit || "unit"} ×{" "}
                            {item.currency || "UGX"}{" "}
                            {(item.unitPrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {item.currency || "UGX"}{" "}
                          {(item.total || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        {receiptData.items[0]?.currency || "UGX"}{" "}
                        {(receiptData.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span>
                        {receiptData.payment?.currency || "UGX"}{" "}
                        {(receiptData.payment?.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Balance:</span>
                      <span
                        className={
                          receiptData.balanceDue > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {receiptData.payment?.currency || "UGX"}{" "}
                        {Math.abs(receiptData.balanceDue || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {receiptData.customer && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium">Customer Details</h4>
                      <p>{receiptData.customer.name || "No name provided"}</p>
                      {receiptData.customer.phone && (
                        <p>{receiptData.customer.phone}</p>
                      )}
                      {receiptData.customer.address && (
                        <p>{receiptData.customer.address}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4">
                <Button onClick={handlePrintReceipt} className="w-full gap-2">
                  <Printer className="h-5 w-5" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
