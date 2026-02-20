/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Search,
  ShoppingCart,
  User,
  CreditCard,
  DollarSign,
  Package,
  Sparkles,
  TrendingUp,
  Users,
  ChevronDown,
  X,
  LayoutDashboard,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAgroProduct } from "@/context/AgroProductContext";
import { useAuth } from "@/context/AuthContext";
import { useCRM } from "@/context/CRMContext";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { AgroProduct } from "@/src/types/agroProduct";
import { httpClient } from "@/src/data/api/httpClient";
import ThermalReceipt from "@/components/pos/thermal-receipt";
import { cn } from "@/lib/utils";

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
  { value: "cash", label: "Cash", icon: DollarSign },
  { value: "mtn_momo", label: "MTN MoMo", icon: CreditCard },
  { value: "airtel_money", label: "Airtel Money", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
];

// FIXED: Add helper function to handle floating point precision
const formatCurrency = (value: number): string => {
  // Round to 2 decimal places to avoid floating point precision issues
  const rounded = Math.round(value * 100) / 100;
  return formatNumberWithCommas(rounded.toFixed(2));
};

const calculateSubtotal = (quantity: number, price: number): number => {
  // Use precise calculation to avoid floating point errors
  return Math.round(quantity * price * 100) / 100;
};

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
  const isAdminOrOwner =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "manager";
  const { customers, fetchCustomers, loading: customersLoading } = useCRM();

  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAmountPaidModified, setIsAmountPaidModified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [formattedValues, setFormattedValues] = useState<{
    [key: string]: { quantity: string; sellingPrice: string };
  }>({});
  const [amountPaid, setAmountPaid] = useState("");
  const [formattedAmountPaid, setFormattedAmountPaid] = useState("");

  // ADD: Customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // FIXED: Add request tracking to prevent too many requests
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // FIXED: Separate state for tracking customer fetch status
  const [customersFetched, setCustomersFetched] = useState(false);

  // FIXED: Debug logging
  useEffect(() => {
    console.log("Current customers state:", customers);
    console.log("Customers fetched status:", customersFetched);
  }, [customers, customersFetched]);

  // FIXED: Separate function to fetch customers with better error handling
  const fetchCustomersData = useCallback(async () => {
    if (!currentBranchId || customersFetched) return;

    try {
      console.log("Fetching customers for branch:", currentBranchId);
      await fetchCustomers();
      setCustomersFetched(true);
      console.log("Customers fetched successfully");
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      if (!error.message?.includes("Too many requests")) {
        toast({
          title: "Error Loading Customers",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      }
    }
  }, [currentBranchId, fetchCustomers, customersFetched, toast]);

  // FIXED: Separate function to fetch products
  const fetchProductsData = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      await fetchProductsByBranch(currentBranchId);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      if (!error.message?.includes("Too many requests")) {
        toast({
          title: "Error Loading Products",
          description: "Failed to load product data",
          variant: "destructive",
        });
      }
    }
  }, [currentBranchId, fetchProductsByBranch, toast]);

  // FIXED: Optimized useEffect with proper dependencies - fetch products immediately, customers when credit sale is enabled
  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // FIXED: Fetch customers when credit sale is enabled or when customer search is opened
  useEffect(() => {
    if (isCreditSale || customerSearchOpen) {
      fetchCustomersData();
    }
  }, [isCreditSale, customerSearchOpen, fetchCustomersData]);

  // Calculate totals with proper precision
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const subtotal = calculateSubtotal(
        item.quantitySold,
        item.salePricePerUnit
      );
      return Math.round((sum + subtotal) * 100) / 100;
    }, 0);
  }, [selectedItems]);

  const balanceDue = useMemo(() => {
    const paid = parseFormattedNumber(amountPaid);
    return Math.round((totalAmount - paid) * 100) / 100;
  }, [totalAmount, amountPaid]);

  useEffect(() => {
    if (!isAmountPaidModified) {
      const formatted = formatCurrency(totalAmount);
      setAmountPaid(totalAmount.toString());
      setFormattedAmountPaid(formatted);
    }
  }, [totalAmount, isAmountPaidModified]);

  // Filter active products based on search
  const filteredProducts = useMemo(() => {
    return agroProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        product.isActive
    );
  }, [agroProducts, searchTerm]);

  // FIXED: Filter customers based on search query with proper object handling
  const filteredCustomers = useMemo(() => {
    // Handle both array and object response formats
    let customersArray;

    if (Array.isArray(customers)) {
      // If customers is already an array, use it directly
      customersArray = customers;
    } else if (
      customers &&
      typeof customers === "object" &&
      (customers as any).customers
    ) {
      // If customers is an object with a customers property, use that
      customersArray = (customers as any).customers;
    } else {
      // Fallback to empty array
      customersArray = [];
    }

    // Ensure customers is always an array and filter out null/undefined
    const safeCustomers = Array.isArray(customersArray)
      ? customersArray.filter(Boolean)
      : [];

    console.log("Filtering customers:", {
      rawCustomers: customers,
      customersArray,
      safeCustomersLength: safeCustomers.length,
      searchQuery: customerSearchQuery,
      customersFetched,
    });

    if (!customerSearchQuery) return safeCustomers;

    return safeCustomers.filter((customer) => {
      const searchLower = customerSearchQuery.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(customerSearchQuery) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [customers, customerSearchQuery, customersFetched]);

  // ADD: Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerSearchOpen(false);
    setCustomerSearchQuery("");

    toast({
      title: "Customer Selected",
      description: `${customer.name} has been selected for this credit sale.`,
      className: "bg-blue-50 border-blue-200",
    });
  };

  // ADD: Clear customer selection
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");

    toast({
      title: "Customer Cleared",
      description: "Customer selection has been cleared.",
      className: "bg-gray-50 border-gray-200",
    });
  };

  // FIXED: Manual refresh function for customers
  const handleRefreshCustomers = useCallback(async () => {
    try {
      console.log("Manually refreshing customers...");
      await fetchCustomers();
      setCustomersFetched(true);
      toast({
        title: "Customers Refreshed",
        description: "Customer list has been updated",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      console.error("Error refreshing customers:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh customer data",
        variant: "destructive",
      });
    }
  }, [fetchCustomers, toast]);

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
        className: "bg-blue-50 border-blue-200",
      });
      return;
    }

    const isVariant = product.hasVariants && variant;

    // FIX: Check variant stock for variant products, not product stock
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

    if (availableStock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name}${variant ? ` - ${variant.name}` : ""} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    // Calculate sale price with 20% markup, ensuring it's at least 0
    const salePrice = Math.round(Math.max(0, costPrice * 1.2) * 100) / 100;

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

    // Initialize formatted values for the new item
    const itemKey = `${product.id}-${variant?.id || ""}`;
    setFormattedValues((prev) => ({
      ...prev,
      [itemKey]: {
        quantity: "1",
        sellingPrice: formatCurrency(salePrice),
      },
    }));

    setSearchTerm("");

    toast({
      title: "✅ Added to Sale",
      description: `${product.name}${variant ? ` - ${variant.name}` : ""} added successfully!`,
      className: "bg-green-50 border-green-200",
    });
  };

  const updateNumericItemDetail = (
    productId: string,
    variantId: string | undefined,
    field: "quantitySold" | "salePricePerUnit",
    value: string
  ) => {
    const numericValue = parseFormattedNumber(value);
    const formatted = formatNumberWithCommas(value);
    const itemKey = `${productId}-${variantId || ""}`;

    setFormattedValues((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field === "quantitySold" ? "quantity" : "sellingPrice"]: formatted,
      },
    }));

    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          if (field === "quantitySold") {
            if (numericValue > item.availableStock) {
              toast({
                title: "Insufficient Stock",
                description: `Only ${item.availableStock} ${item.unitOfMeasure} available`,
                variant: "destructive",
              });
              return { ...item, [field]: item.availableStock };
            }
            return { ...item, [field]: Math.max(0, numericValue) };
          }
          // For price, round to 2 decimal places
          return {
            ...item,
            [field]: Math.round(Math.max(0, numericValue) * 100) / 100,
          };
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

    toast({
      title: "Item Removed",
      description: "Item has been removed from sale",
      className: "bg-gray-50 border-gray-200",
    });
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
          variantId: item.variantId, // Variant ID (if applicable)
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
        isCreditSale: isCreditSale,
        amountPaid: isCreditSale
          ? parseFormattedNumber(amountPaid)
          : totalAmount,
      };

      // 1. Create the sale record - THIS ALREADY UPDATES STOCK ON THE BACKEND
      const saleResponse = await httpClient("/transactions/agro/web", {
        method: "POST",
        headers,
        body: JSON.stringify(saleData),
      });

      const saleResult = await saleResponse;

      // ✅ REFRESH PRODUCTS TO GET UPDATED STOCK LEVELS
      if (currentBranchId) {
        // Add delay to prevent rate limiting
        setTimeout(() => {
          fetchProductsByBranch(currentBranchId);
        }, 1000);
      }

      // Prepare transaction data for ThermalReceipt
      const transactionData = {
        id: saleResult.id || Date.now().toString(),
        transactionId: saleResult.saleNumber || `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: totalAmount,
        customerName: isCreditSale ? customerName.trim() : undefined,
        customerPhone: isCreditSale ? customerPhone.trim() : undefined,
        paymentMethod: paymentMethod as
          | "cash"
          | "mtn_momo"
          | "airtel_money"
          | "bank_transfer"
          | "credit_card",
        items: selectedItems.map((item) => ({
          id: item.productId,
          name: item.variantName
            ? `${item.productName} - ${item.variantName}`
            : item.productName,
          quantity: item.quantitySold,
          price: item.salePricePerUnit,
        })),
        isCustomAmount: false,
        isCreditSale: isCreditSale,
        amountPaid: isCreditSale
          ? parseFormattedNumber(amountPaid)
          : totalAmount,
        balanceDue: isCreditSale ? balanceDue : 0,
      };

      setLastTransaction(transactionData);
      // Show success message based on sale type
      toast({
        title: isCreditSale ? "💳 Credit Sale Created!" : "🎉 Sale Completed!",
        description: isCreditSale
          ? `Credit sale #${saleResult.data?.transactionId || saleResult.id} recorded successfully. Balance: ${selectedItems[0]?.currency || "UGX"} ${formatCurrency(balanceDue)}`
          : `Sale #${saleResult.data?.transactionId || saleResult.id} recorded successfully`,
        className: isCreditSale
          ? "bg-blue-50 border-blue-200"
          : "bg-green-50 border-green-200",
      });

      setShowReceipt(true);
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

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setLastTransaction(null);

    // ✅ REFRESH PRODUCTS ONE MORE TIME TO ENSURE LATEST STOCK
    if (currentBranchId) {
      // Add delay to prevent rate limiting
      setTimeout(() => {
        fetchProductsByBranch(currentBranchId);
      }, 1500);
    }

    // Reset form after receipt is closed
    setSelectedItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setIsCreditSale(false);
    setPaymentMethod("cash");
    setNotes("");
    setAmountPaid("0");
    setIsAmountPaidModified(false);
    setSelectedCustomer(null); // ADD: Clear selected customer
    setCustomersFetched(false); // Reset customer fetch status
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    const formattedValue = formatNumberWithCommas(value);

    setAmountPaid(numericValue.toString());
    setFormattedAmountPaid(formattedValue);
    setIsAmountPaidModified(true);
  };

  const handleSetFullAmount = () => {
    const formatted = formatCurrency(totalAmount);
    setAmountPaid(totalAmount.toString());
    setFormattedAmountPaid(formatted);
    setIsAmountPaidModified(true); // Treat as modified to prevent override
  };

  // FIXED: Manual refresh function with rate limiting
  const handleManualRefresh = useCallback(async () => {
    if (isFetching) return;

    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      toast({
        title: "Please wait",
        description: "Waiting before making another request",
        variant: "default",
      });
      return;
    }

    setIsFetching(true);
    setLastFetchTime(now);

    try {
      await Promise.all([fetchProductsData(), fetchCustomersData()]);
      toast({
        title: "Refreshed",
        description: "Data has been refreshed",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsFetching(false);
    }
  }, [fetchProductsData, fetchCustomersData, isFetching, lastFetchTime, toast]);

  if (loading && agroProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-teal-600 hover:bg-teal-100 mb-6 rounded-xl transition-all duration-300 hover:scale-105"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-teal-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Loading Products...
              </h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Gathering available agricultural products for sale
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !error.includes("Too many requests")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-teal-600 hover:bg-teal-100 mb-6 rounded-xl transition-all duration-300"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 max-w-md">
              <div className="relative">
                <AlertTriangle className="h-16 w-16 mx-auto text-red-500" />
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-10"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Unable to Load Products
              </h3>
              <p className="text-gray-600">{error}</p>
              <div className="pt-4">
                <Button
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                  className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300"
                >
                  {isFetching ? (
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

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 p-2 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-1.5">
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-7 w-7 hover:bg-teal-50 hover:text-teal-600 rounded-md transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button> */}

              <div className="max-w-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="p-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-md">
                    <ShoppingCart className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div>
                    <h1 className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                      New Agro Sale
                    </h1>

                    <p className="text-[10px] text-gray-600 leading-tight">
                      Point of Sale for Agricultural Products
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex gap-1.5">
              {isCreditSale && (
                <Button
                  variant="outline"
                  onClick={handleRefreshCustomers}
                  disabled={customersLoading}
                  className="h-7 px-2 gap-1 rounded-md text-xs"
                >
                  {customersLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3.5 w-3.5" />
                  )}
                  Refresh
                </Button>
              )}

              {isAdminOrOwner && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleGoToDashboard}
                  className="h-7 "
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleManualRefresh}
                disabled={isFetching}
                className="h-7 px-2 gap-1 rounded-md text-xs"
              >
                {isFetching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3.5 w-3.5" />
                )}
                Refresh All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column: Product List */}
          <div className="xl:w-2/3">
            <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Available Products
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-teal-50 text-teal-700 border-teal-200"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {filteredProducts.length} Products
                  </Badge>
                </div>
                <div className="pt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search agricultural products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200/60 focus:border-teal-300 rounded-xl bg-white/50 transition-colors"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="space-y-2">
                      {product.hasVariants ? (
                        product.variants?.map((variant) => {
                          const stock =
                            typeof variant.totalStockQuantity === "string"
                              ? parseFloat(variant.totalStockQuantity)
                              : variant.totalStockQuantity;
                          const isOutOfStock = stock <= 0;
                          const isLowStock = stock > 0 && stock <= 10;

                          return (
                            <div
                              key={variant.id}
                              onClick={() =>
                                !isOutOfStock &&
                                handleAddItemToSale(product, variant)
                              }
                              className={cn(
                                "p-4 border-2 rounded-xl transition-all duration-300 flex justify-between items-center group cursor-pointer",
                                isOutOfStock
                                  ? "bg-gray-100/50 border-gray-200 opacity-60 cursor-not-allowed"
                                  : cn(
                                      "bg-white/70 border-gray-200/60 hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-lg",
                                      isLowStock &&
                                        "border-amber-200 bg-amber-50/50"
                                    )
                              )}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                                    {product.name} - {variant.name}
                                  </h4>
                                  {isLowStock && (
                                    <Badge
                                      variant="outline"
                                      className="bg-amber-100 text-amber-700 border-amber-200 text-xs"
                                    >
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {variant.unitOfMeasure ||
                                    product.unitOfMeasure ||
                                    "unit"}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="font-bold text-teal-600">
                                  {product.baseCurrency}{" "}
                                  {formatCurrency(
                                    variant.currentAverageCostPrice
                                  )}
                                </p>
                                <Badge
                                  variant={
                                    isOutOfStock ? "destructive" : "outline"
                                  }
                                  className={cn(
                                    isOutOfStock
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-green-100 text-green-700 border-green-200"
                                  )}
                                >
                                  {stock} in stock
                                </Badge>
                              </div>
                              {!isOutOfStock && (
                                <div className="ml-4 p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <Plus className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <>
                          {(product.totalStockQuantity || 0) > 0 && (
                            <div
                              onClick={() => handleAddItemToSale(product)}
                              className="p-4 border-2 border-gray-200/60 rounded-xl cursor-pointer hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-300 flex justify-between items-center group bg-white/70 hover:shadow-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {product.unitOfMeasure || "unit"}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="font-bold text-teal-600">
                                  {product.baseCurrency}{" "}
                                  {formatCurrency(
                                    (product.currentAverageCostPrice || 0) * 1.2
                                  )}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-700 border-green-200"
                                >
                                  {product.totalStockQuantity} in stock
                                </Badge>
                              </div>
                              <div className="ml-4 p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Plus className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sale Details */}
          <div className="xl:w-1/3 space-y-6">
            {/* Sale Items */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    Current Sale
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {selectedItems.length} Items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {selectedItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedItems.map((item) => {
                      const itemKey = `${item.productId}-${item.variantId || ""}`;
                      const formattedQuantity =
                        formattedValues[itemKey]?.quantity ??
                        formatNumberWithCommas(item.quantitySold.toString());
                      const formattedPrice =
                        formattedValues[itemKey]?.sellingPrice ??
                        formatCurrency(item.salePricePerUnit);

                      // FIXED: Calculate subtotal with proper precision
                      const subtotal = calculateSubtotal(
                        item.quantitySold,
                        item.salePricePerUnit
                      );

                      return (
                        <div
                          key={itemKey}
                          className="border-2 border-gray-200/60 rounded-xl p-4 bg-white/50 hover:bg-white transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {item.productName}
                                {item.variantName && (
                                  <span className="text-teal-600">
                                    {" "}
                                    - {item.variantName}
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.unitOfMeasure} • Stock:{" "}
                                {item.availableStock}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItemFromSale(
                                  item.productId,
                                  item.variantId
                                )
                              }
                              className="text-red-500 hover:bg-red-100 h-8 w-8 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-medium text-gray-600">
                                Quantity
                              </Label>
                              <Input
                                type="text"
                                value={formattedQuantity}
                                onChange={(e) =>
                                  updateNumericItemDetail(
                                    item.productId,
                                    item.variantId,
                                    "quantitySold",
                                    e.target.value
                                  )
                                }
                                className="h-9 border-2 border-gray-200 focus:border-teal-300 rounded-lg bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-600">
                                Price
                              </Label>
                              <Input
                                type="text"
                                value={formattedPrice}
                                onChange={(e) =>
                                  updateNumericItemDetail(
                                    item.productId,
                                    item.variantId,
                                    "salePricePerUnit",
                                    e.target.value
                                  )
                                }
                                className="h-9 border-2 border-gray-200 focus:border-teal-300 rounded-lg bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-600">
                                Subtotal
                              </Label>
                              <div className="h-9 flex items-center justify-end">
                                <p className="font-bold text-teal-600 text-sm">
                                  {item.currency} {formatCurrency(subtotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Sale Cart Empty
                    </h3>
                    <p className="text-gray-500">
                      Add products from the left to start a sale
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer & Options */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Sale Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200/60">
                  <Label
                    htmlFor="credit-sale"
                    className="font-medium text-gray-700"
                  >
                    Credit Sale
                  </Label>
                  <Switch
                    id="credit-sale"
                    checked={isCreditSale}
                    onCheckedChange={setIsCreditSale}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                {isCreditSale && (
                  <div className="space-y-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                    {/* FIXED: Customer Selection */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">
                        Select Customer
                      </Label>
                      <div className="flex gap-2">
                        <Popover
                          open={customerSearchOpen}
                          onOpenChange={setCustomerSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={customerSearchOpen}
                              className="flex-1 justify-between"
                            >
                              {selectedCustomer ? (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>{selectedCustomer.name}</span>
                                  <span className="text-gray-500 text-sm">
                                    ({selectedCustomer.phone})
                                  </span>
                                </div>
                              ) : (
                                <span>Select existing customer...</span>
                              )}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search customers..."
                                value={customerSearchQuery}
                                onValueChange={setCustomerSearchQuery}
                                onFocus={() => {
                                  // FIXED: Ensure customers are fetched when search is focused
                                  if (!customersFetched) {
                                    fetchCustomersData();
                                  }
                                }}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {customersLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Loading customers...
                                    </div>
                                  ) : filteredCustomers.length === 0 ? (
                                    customersFetched ? (
                                      "No customers found."
                                    ) : (
                                      "Click to load customers..."
                                    )
                                  ) : (
                                    "No matching customers found."
                                  )}
                                </CommandEmpty>
                                <CommandGroup>
                                  {filteredCustomers.map((customer) => (
                                    <CommandItem
                                      key={customer.id}
                                      value={customer.id}
                                      onSelect={() =>
                                        handleCustomerSelect(customer)
                                      }
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {customer.name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          {customer.phone} •{" "}
                                          {customer.customerType}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {selectedCustomer && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClearCustomer}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {customersFetched
                          ? `${filteredCustomers.length} customers available`
                          : "Customers not loaded yet"}
                      </p>
                    </div>

                    {/* Customer Name Input */}
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name *"
                      required
                      className="border-2 border-amber-200 focus:border-amber-300 bg-white"
                    />

                    {/* Customer Phone Input */}
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Customer Phone"
                      className="border-2 border-amber-200 focus:border-amber-300 bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment and Summary */}
            <Card className="bg-gradient-to-br from-white to-teal-50/50 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-teal-600" />
                  <span>Payment & Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div>
                  <Label className="font-medium text-gray-700">
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <SelectItem
                            key={method.value}
                            value={method.value}
                            className="flex items-center space-x-2"
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{method.label}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Paid */}
                <div>
                  <Label
                    htmlFor="amountPaid"
                    className="font-medium text-gray-700"
                  >
                    Amount Paid
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="amountPaid"
                      type="text"
                      value={formattedAmountPaid}
                      onChange={handleAmountPaidChange}
                      placeholder="Enter amount paid"
                      className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSetFullAmount}
                      className="h-12 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 rounded-xl transition-colors"
                    >
                      Full
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-4 border-t border-gray-200/60">
                  <div className="flex justify-between items-center font-semibold text-gray-800">
                    <span>Total Amount</span>
                    <span className="text-lg">
                      {selectedItems[0]?.currency || "UGX"}{" "}
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Amount Paid</span>
                    <span>
                      {selectedItems[0]?.currency || "UGX"}{" "}
                      {formatCurrency(parseFormattedNumber(amountPaid))}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between font-bold text-lg pt-2 border-t border-gray-200/60",
                      balanceDue > 0 ? "text-red-600" : "text-green-600"
                    )}
                  >
                    <span>Balance Due</span>
                    <span>
                      {selectedItems[0]?.currency || "UGX"}{" "}
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCompleteSale}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isLoading || selectedItems.length === 0}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? "Processing..." : "Complete Sale"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Thermal Receipt */}
      {lastTransaction && (
        <ThermalReceipt
          transaction={lastTransaction}
          open={showReceipt}
          onOpenChange={handleReceiptClose}
        />
      )}
    </div>
  );
}
