/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// merge
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  formatNumber,
  formatNumberWithCommas,
  parseFormattedNumber,
} from "@/lib/utils";
import { type Item, useData } from "@/context/DataContext";
import { useCRM } from "@/context/CRMContext";
import QrCodeScanner from "@/components/pos/qr-code-scanner";
import {
  ArrowLeft,
  PlusCircle,
  Minus,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Wallet,
  Smartphone,
  CreditCard,
  QrCode,
  Users,
  ChevronDown,
  Printer,
  Send,
  Clock,
  User,
  Store,
  Wifi,
  WifiOff,
  Lock,
  Calculator,
  Pause,
  RotateCcw,
  Eye,
  AlertTriangle,
  Loader2,
  ShoppingCart,
  Package,
  Sparkles,
  Power,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import ThermalReceipt from "@/components/pos/thermal-receipt";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type PaymentType = "cash" | "mtn_momo" | "airtel_money";

interface CartItem extends Omit<Item, "branchId" | "isActive"> {
  quantity: number;
  branchId: string;
  isActive: boolean;
}
interface SuspendedSale {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: Date;
  customerName?: string;
  customerPhone?: string;
}

export default function MobilePOSScreen() {
  const {
    items,
    createTransaction,
    getItems,
    hasMoreItems,
    isFetchingMoreItems,
    loadMoreItems,
    getItemByBarcode,
  } = useData();
  const { user, businessData, logout } = useAuth();
  const { currentBranch } = useBranch();
  const router = useRouter();
  const { customers, fetchCustomers, loading: customersLoading } = useCRM();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [suspendedSales, setSuspendedSales] = useState<SuspendedSale[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [floatAmount, setFloatAmount] = useState(50000);
  const [showChangeBreakdown, setShowChangeBreakdown] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isTaxApplied, setIsTaxApplied] = useState(true);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customersFetched, setCustomersFetched] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!currentBranch) return;

    const handler = setTimeout(() => {
      getItems({
        search: searchQuery,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedCategory, getItems, currentBranch]);

  const categories = [
    "all",
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  const denominations = [
    50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50,
  ];

  const subtotal = cart.reduce(
    (total, item) => total + item.sellingPrice * item.quantity,
    0
  );
  const TAX_RATE = 0.18;
  const tax = isTaxApplied ? subtotal * TAX_RATE : 0;
  const totalDue = subtotal + tax;
  const changeAmount = amountReceived ? Number(amountReceived) - totalDue : 0;
  const balanceDue = isCreditSale ? totalDue - (Number(amountPaid) || 0) : 0;

  // Fetch customers when credit sale is enabled or when customer search is opened
  const fetchCustomersData = useCallback(async () => {
    if (!currentBranch?.id || customersFetched) return;

    try {
      await fetchCustomers();
      setCustomersFetched(true);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
    }
  }, [currentBranch?.id, fetchCustomers, customersFetched]);

  useEffect(() => {
    if (isCreditSale || customerSearchOpen) {
      fetchCustomersData();
    }
  }, [isCreditSale, customerSearchOpen, fetchCustomersData]);

  const filteredCustomers = useMemo(() => {
    let customersArray;
    if (Array.isArray(customers)) {
      customersArray = customers;
    } else if (
      customers &&
      typeof customers === "object" &&
      (customers as any).customers
    ) {
      customersArray = (customers as any).customers;
    } else {
      customersArray = [];
    }

    const safeCustomers = Array.isArray(customersArray)
      ? customersArray.filter(Boolean)
      : [];

    if (!customerSearchQuery) return safeCustomers;

    return safeCustomers.filter((customer) => {
      const searchLower = customerSearchQuery.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(customerSearchQuery) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [customers, customerSearchQuery]);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || "");
    setCustomerSearchOpen(false);
    setCustomerSearchQuery("");

    toast({
      title: "Customer Selected",
      description: `${customer.name} has been selected for this sale.`,
    });
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addToCart = useCallback(
    (item: Item) => {
      if (item.productType !== "service" && item.productType !== "combo") {
        if (item.stockQuantity !== undefined && item.stockQuantity <= 0) {
          toast({
            title: "Out of Stock",
            description: `${item.name} is out of stock`,
            variant: "destructive",
          });
          return;
        }
      }
      const existingItem = cart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        if (
          item.stockQuantity !== undefined &&
          existingItem.quantity + 1 > item.stockQuantity
        ) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${item.stockQuantity} ${item.unit || "units"} available`,
            variant: "destructive",
          });
          return;
        }
        setCart((prev) =>
          prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        setCart((prev) => [...prev, { ...item, quantity: 1 }]);
      }
      toast({
        title: "Added to Cart",
        description: `${item.name} added successfully!`,
        className: "bg-green-50 border-green-200",
      });
    },
    [cart]
  );

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    const originalItem = items.find((item) => item.id === itemId);
    if (
      originalItem?.stockQuantity !== undefined &&
      quantity > originalItem.stockQuantity
    ) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${originalItem.stockQuantity} ${originalItem.unit || "units"} available`,
        variant: "destructive",
      });
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const getChangeBreakdown = (amount: number) => {
    const breakdown: { [key: number]: number } = {};
    let remaining = Math.floor(amount);
    for (const denom of denominations) {
      if (remaining >= denom) {
        breakdown[denom] = Math.floor(remaining / denom);
        remaining = remaining % denom;
      }
    }
    return breakdown;
  };

  const completeSale = async () => {
    if (totalDue <= 0) {
      toast({
        title: "Error",
        description: "Please add items to cart",
        variant: "destructive",
      });
      return;
    }
    if (isCreditSale && !customerName.trim()) {
      toast({
        title: "Customer Required",
        description: "Customer name is required for credit sales",
        variant: "destructive",
      });
      return;
    }
    if (
      !isCreditSale &&
      paymentType === "cash" &&
      amountReceived !== "" &&
      Number(amountReceived) < totalDue
    ) {
      toast({
        title: "Insufficient Payment",
        description: "Amount received is less than total due",
        variant: "destructive",
      });
      return;
    }
    try {
      const transactionData = {
        amount: totalDue,
        paymentMethod: paymentType,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          quantity: item.quantity,
          productType: item.productType,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          branchId: item.branchId,
          isActive: item.isActive ?? true,
        })),
        isCreditSale,
        amountPaid: isCreditSale ? Number(amountPaid) : totalDue,
      };
      const transaction = await createTransaction(transactionData);
      if (paymentType === "cash") {
        setFloatAmount((prev) => prev + totalDue - changeAmount);
      }

      // Store customer info before resetting
      const currentCustomerName = customerName;
      const currentCustomerPhone = customerPhone;

      setLastTransaction({
        ...transaction,
        amountReceived: Number(amountReceived),
        change: changeAmount,
        items: cart,
        subtotal,
        tax,
        total: totalDue,
        // Include customer info in the transaction data
        customerName: currentCustomerName,
        customerPhone: currentCustomerPhone,
      });

      toast({
        title: isCreditSale ? "💳 Credit Sale Created!" : "🎉 Sale Complete!",
        description: isCreditSale
          ? `Credit sale recorded successfully. Balance: UGX ${formatNumber(balanceDue)}`
          : `UGX ${formatNumber(totalDue)} - ${getPaymentMethodLabel(paymentType)}`,
        className: isCreditSale
          ? "bg-blue-50 border-blue-200"
          : "bg-green-50 border-green-200",
      });

      // Reset form AFTER storing the data
      setCart([]);
      setAmountReceived("");
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
      setIsCreditSale(false);
      setSelectedCustomer(null);
      setShowCustomerInfo(false);
      setShowQuickSale(false);
      setQuickAmount("");
      setShowReceipt(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive",
      });
      console.error("Sale completion error:", error);
    }
  };

  const suspendSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "No items in cart to suspend",
        variant: "destructive",
      });
      return;
    }
    const suspendedSale: SuspendedSale = {
      id: Date.now().toString(),
      items: [...cart],
      total: totalDue,
      timestamp: new Date(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
    };
    setSuspendedSales((prev) => [...prev, suspendedSale]);
    setCart([]);
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setShowCustomerInfo(false);
    toast({
      title: "Sale Suspended",
      description: "Sale has been saved for later",
      className: "bg-blue-50 border-blue-200",
    });
  };

  const resumeSale = (sale: SuspendedSale) => {
    setCart(sale.items);
    setCustomerName(sale.customerName || "");
    setCustomerPhone(sale.customerPhone || "");
    setShowCustomerInfo(!!(sale.customerName || sale.customerPhone));
    setSuspendedSales((prev) => prev.filter((s) => s.id !== sale.id));
    toast({
      title: "Sale Resumed",
      description: "Suspended sale has been restored",
      className: "bg-green-50 border-green-200",
    });
  };

  const cancelSale = () => {
    setCart([]);
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setShowCustomerInfo(false);
    setShowQuickSale(false);
    setQuickAmount("");
    toast({
      title: "Sale Cancelled",
      description: "Cart has been cleared",
      className: "bg-gray-50 border-gray-200",
    });
  };

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      const item = await getItemByBarcode(barcode);
      if (item) {
        addToCart(item);
        setBarcodeInput("");
        setShowBarcodeScanner(false);
      } else {
        toast({
          title: "Product Not Found",
          description: "No product found with this barcode",
          variant: "destructive",
        });
      }
    },
    [getItemByBarcode, addToCart]
  );

  const onScanFailure = useCallback((error: any) => {
    // console.warn(`QR code scan failure, error: ${error}`);
  }, []);

  const getPaymentMethodLabel = (method: PaymentType) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mtn_momo":
        return "MTN MoMo";
      case "airtel_money":
        return "Airtel Money";
      default:
        return method;
    }
  };

  const getPaymentMethodIcon = (method: PaymentType) => {
    switch (method) {
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "mtn_momo":
        return <Smartphone className="h-4 w-4 text-yellow-600" />;
      case "airtel_money":
        return <Smartphone className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      {/* Top Bar with User Info and Logout */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - POS info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <ShoppingCart className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm truncate text-gray-900">
                  {businessData?.name || "Mobile POS"} - {currentBranch?.name || "Main"}
                </h1>
                <p className="text-xs text-blue-600 truncate">
                  {user?.role || "POS Operator"}
                </p>
              </div>
            </div>
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs hidden sm:flex items-center gap-1.5 py-1.5 px-2.5"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Right side - User info and Logout */}
          <div className="flex items-center space-x-2">
            {/* Time Display - Desktop only */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60 text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{currentTime}</span>
            </div>

            {/* User Info - Desktop only */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60 text-sm text-gray-600">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[80px] font-medium">
                {user?.firstName || "User"}
              </span>
            </div>

            {/* Logout Button - ALWAYS VISIBLE */}
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50/80"
                >
                  <Power className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <Power className="h-5 w-5" />
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription>
                    You&apos;ll need to login again to access the POS system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Power className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Are you sure you want to logout from{" "}
                      <span className="font-semibold">
                        {businessData?.name || "Mobile POS"}
                      </span>
                      ?
                    </p>
                    <p className="text-xs text-gray-500">
                      Any pending sales will be lost.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsLogoutDialogOpen(false)}
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    >
                      <Power className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobile Menu Button (can be used for additional actions) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 hover:bg-gray-100/80"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Support Info */}
        <div className="md:hidden mt-2 pt-2 border-t border-gray-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{currentTime}</span>
            </div>
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs flex items-center gap-1"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* Enhanced Search & Categories */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 pr-12 h-12 bg-white/50 border-2 border-gray-200/60 focus:border-blue-300 transition-colors rounded-xl"
                    placeholder="Search products or scan barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && searchQuery) {
                        e.preventDefault();
                        const item = await getItemByBarcode(searchQuery);
                        if (item) {
                          addToCart(item);
                          setSearchQuery("");
                        }
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-blue-50 rounded-lg"
                    onClick={() => setShowBarcodeScanner(true)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {categories.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <Button
                        key={category || "all"}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "whitespace-nowrap rounded-full transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/50 border-2 border-gray-200/60 hover:border-blue-200"
                        )}
                        onClick={() => setSelectedCategory(category || "all")}
                      >
                        <span>
                          {category === "all"
                            ? "All"
                            : category || "Uncategorized"}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Products Grid */}
          <Card className="flex-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Products ({items.length})
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {
                    items.filter(
                      (item) => item.stockQuantity && item.stockQuantity > 0
                    ).length
                  }{" "}
                  Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => {
                  const isOutOfStock =
                    item.stockQuantity !== undefined && item.stockQuantity <= 0;
                  const isLowStock =
                    item.stockQuantity !== undefined &&
                    item.stockQuantity > 0 &&
                    item.stockQuantity <= 5;

                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className={cn(
                        "h-24 flex-col items-start justify-start p-3 relative transition-all duration-300 hover:scale-105 hover:shadow-lg border-2",
                        isOutOfStock
                          ? "bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white/70 border-gray-200/60 hover:border-blue-300 hover:bg-blue-50/50"
                      )}
                      onClick={() => !isOutOfStock && addToCart(item)}
                      disabled={isOutOfStock}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium text-sm line-clamp-1 mb-0.5 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium mb-1 truncate uppercase tracking-wider">
                          {item.category || "General"}
                        </div>
                        <div className="text-primary text-xs font-semibold">
                          UGX {formatNumber(item.sellingPrice)}
                        </div>
                      </div>

                      {/* Stock Badge */}
                      {item.stockQuantity !== undefined && (
                        <Badge
                          variant={
                            isOutOfStock
                              ? "destructive"
                              : isLowStock
                                ? "secondary"
                                : "default"
                          }
                          className={cn(
                            "absolute bottom-2 left-2 text-xs font-medium",
                            isOutOfStock
                              ? "bg-red-100 text-red-700 border-red-200"
                              : isLowStock
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-green-100 text-green-700 border-green-200"
                          )}
                        >
                          {isOutOfStock ? "Out" : item.stockQuantity}
                        </Badge>
                      )}

                      {/* Add Icon */}
                      {!isOutOfStock && (
                        <div className="absolute top-2 right-2 p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                          <PlusCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMoreItems && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMoreItems}
                    disabled={isFetchingMoreItems}
                    variant="outline"
                    className="rounded-full border-2 border-gray-200/60 bg-white/50 hover:bg-white hover:border-blue-300 transition-all duration-300"
                  >
                    {isFetchingMoreItems ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isFetchingMoreItems ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-full lg:w-96 flex flex-col space-y-4">
          {/* Cart Header */}
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {showQuickSale ? "Quick Sale" : `Shopping Cart`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-amber-50 hover:text-amber-600 rounded-lg"
                    onClick={suspendSale}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                    onClick={cancelSale}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-white/70 border-2 border-gray-200/60 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            UGX {formatNumber(item.sellingPrice)} each
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors rounded-lg"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Number((item.quantity - 1).toFixed(3))
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            step="any"
                            inputMode="decimal"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = Number.parseFloat(
                                e.target.value || "0"
                              );
                              if (!Number.isNaN(next)) {
                                updateQuantity(item.id, next);
                              }
                            }}
                            className="h-7 w-20 text-center border-2 border-gray-200 focus:border-blue-300 rounded-lg"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors rounded-lg"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Number((item.quantity + 1).toFixed(3))
                              )
                            }
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-semibold text-sm">
                          UGX {formatNumber(item.sellingPrice * item.quantity)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">
                        Your cart is empty
                      </p>
                      <p className="text-sm text-gray-500">
                        Add products to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 space-y-4">
              {/* Credit Sale Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <Label htmlFor="credit-sale" className="font-semibold text-sm text-gray-700">
                    Credit Sale
                  </Label>
                </div>
                <Switch
                  id="credit-sale"
                  checked={isCreditSale}
                  onCheckedChange={(checked) => {
                    setIsCreditSale(checked);
                    if (checked) {
                      setShowCustomerInfo(true);
                      if (amountPaid === "") setAmountPaid("0");
                    }
                  }}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Customer Information Section */}
              <div className="space-y-3">
                <Collapsible
                  open={showCustomerInfo}
                  onOpenChange={setShowCustomerInfo}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-800 flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>{isCreditSale ? "Customer Details (Required)" : "Customer Information (Optional)"}</span>
                    </h4>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 rounded-lg"
                      >
                        {showCustomerInfo ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="space-y-3">
                    {/* Customer Selection from CRM */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Select Existing Customer
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
                              className="flex-1 justify-between h-10 border-2 border-gray-200/60 rounded-xl bg-white/50 text-xs"
                            >
                              {selectedCustomer ? (
                                <div className="flex items-center gap-2 truncate">
                                  <Users className="h-3 w-3" />
                                  <span className="truncate">{selectedCustomer.name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Search customers...</span>
                              )}
                              <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search customers..."
                                value={customerSearchQuery}
                                onValueChange={setCustomerSearchQuery}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {customersLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Loading...
                                    </div>
                                  ) : (
                                    "No customers found."
                                  )}
                                </CommandEmpty>
                                <CommandGroup>
                                  {filteredCustomers.map((customer) => (
                                    <CommandItem
                                      key={customer.id}
                                      value={customer.id}
                                      onSelect={() => handleCustomerSelect(customer)}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{customer.name}</span>
                                        <span className="text-xs text-gray-500">
                                          {customer.phone}
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
                            className="shrink-0 h-10 w-10 border-2 border-gray-200/60 rounded-xl"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Customer Name {isCreditSale && <span className="text-red-500">*</span>}
                      </label>
                      <Input
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={cn(
                          "h-10 border-2 focus:border-blue-300 rounded-xl bg-white/50",
                          isCreditSale && !customerName ? "border-red-200" : "border-gray-200/60"
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        placeholder="Enter phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-10 border-2 border-gray-200/60 focus:border-blue-300 rounded-xl bg-white/50"
                      />
                    </div>

                    {(customerName || customerPhone) && (
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50/50 border border-green-200 rounded-lg p-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Customer info will be included in receipt</span>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-800 flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span>Payment Method</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "mtn_momo", "airtel_money"] as PaymentType[]).map(
                    (method) => (
                      <Button
                        key={method}
                        variant={paymentType === method ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaymentType(method)}
                        className={cn(
                          "flex-col h-12 transition-all duration-300 rounded-xl border-2",
                          paymentType === method
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-transparent"
                            : "bg-white/50 border-gray-200/60 hover:border-blue-300 hover:bg-blue-50/50"
                        )}
                      >
                        {getPaymentMethodIcon(method)}
                        <span className="text-xs mt-1 font-medium">
                          {getPaymentMethodLabel(method)}
                        </span>
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Amount Paid / Received */}
              {(isCreditSale || paymentType === "cash") && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-800">
                    {isCreditSale ? "Amount Paid Now" : "Amount Received"}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder={isCreditSale ? "Enter amount paid" : "Enter amount received"}
                      value={isCreditSale ? amountPaid : amountReceived}
                      onChange={(e) => isCreditSale ? setAmountPaid(e.target.value) : setAmountReceived(e.target.value)}
                      className="h-12 border-2 border-gray-200/60 focus:border-blue-300 rounded-xl bg-white/50 flex-1"
                    />
                    {isCreditSale && (
                      <Button
                        variant="outline"
                        onClick={() => setAmountPaid(totalDue.toString())}
                        className="h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl px-4"
                      >
                        Full
                      </Button>
                    )}
                  </div>

                  {/* Balance Due Display for Credit Sale */}
                  {isCreditSale && (
                    <div className={cn(
                      "p-3 rounded-xl border-2 flex justify-between items-center",
                      balanceDue > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
                    )}>
                      <span className="text-sm font-semibold text-gray-700">Balance Due:</span>
                      <span className={cn("font-bold text-lg", balanceDue > 0 ? "text-amber-600" : "text-green-600")}>
                        UGX {formatNumber(balanceDue)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Change Display */}
              {paymentType === "cash" && !isCreditSale && (
                <div className="space-y-3">
                  {changeAmount > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-800">
                          Change to Give:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          UGX {formatNumber(changeAmount)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-green-600 hover:bg-green-100 rounded-lg"
                        onClick={() =>
                          setShowChangeBreakdown(!showChangeBreakdown)
                        }
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        {showChangeBreakdown ? "Hide" : "Show"} Breakdown
                      </Button>
                      {showChangeBreakdown && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(getChangeBreakdown(changeAmount)).map(
                            ([denom, count]) => (
                              <div
                                key={denom}
                                className="flex justify-between text-xs bg-white/50 rounded-lg p-2"
                              >
                                <span>
                                  UGX {Number(denom).toLocaleString()}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {count} note{count > 1 ? "s" : ""}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {changeAmount < 0 && amountReceived && (
                    <Alert
                      variant="destructive"
                      className="border-2 border-red-200 bg-red-50/80"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        Insufficient amount. Need UGX{" "}
                        {formatNumber(Math.abs(changeAmount))} more.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkout Summary */}
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-tax"
                    checked={isTaxApplied}
                    onCheckedChange={(checked) => setIsTaxApplied(!!checked)}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="apply-tax"
                    className="text-sm font-semibold text-gray-800 cursor-pointer"
                  >
                    Apply Tax (18%)
                  </label>
                </div>

                <Badge
                  variant={isTaxApplied ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-medium",
                    isTaxApplied
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  )}
                >
                  {isTaxApplied ? "Tax Applied" : "Not Applied"}
                </Badge>
              </div>

              {/* Existing Summary Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    UGX {formatNumber(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax ({isTaxApplied ? "18%" : "0%"}):
                  </span>
                  <span className="font-semibold">UGX {formatNumber(tax)}</span>
                </div>
                <Separator className="bg-gray-200/60" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-800">Total:</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    UGX {formatNumber(totalDue)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                onClick={completeSale}
                disabled={
                  totalDue <= 0 ||
                  (!isCreditSale &&
                    paymentType === "cash" &&
                    amountReceived !== "" &&
                    Number(amountReceived) < totalDue) ||
                  (isCreditSale && Number(amountPaid) > totalDue)
                }
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                COMPLETE SALE
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg font-bold">
              <QrCode className="h-5 w-5 text-blue-600" />
              <span>Scan Product Barcode</span>
            </DialogTitle>
          </DialogHeader>
          {showBarcodeScanner && (
            <div className="p-4 bg-black rounded-xl">
              <QrCodeScanner
                key={showBarcodeScanner ? "scanner-open" : "scanner-closed"}
                onScanSuccess={handleBarcodeScanned}
                onScanFailure={onScanFailure}
              />
            </div>
          )}
          <div className="text-center text-sm text-gray-600">
            Point your camera at a product barcode to scan
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspended Sales Floating Button */}
      {suspendedSales.length > 0 && (
        <div className="fixed bottom-4 left-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 rounded-full shadow-lg px-4 py-2 transition-all duration-300"
              >
                <Pause className="h-4 w-4 mr-2 text-amber-600" />
                <span className="font-semibold text-amber-700">
                  {suspendedSales.length}
                </span>
                <span className="ml-1 text-amber-600">Suspended</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Pause className="h-5 w-5 text-amber-600" />
                  <span>Suspended Sales</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {suspendedSales.map((sale) => (
                  <Card key={sale.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          UGX {formatNumber(sale.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.items.length} items •{" "}
                          {sale.timestamp.toLocaleTimeString()}
                        </div>
                        {(sale.customerName || sale.customerPhone) && (
                          <div className="text-xs text-blue-600 mt-1">
                            {sale.customerName && `👤 ${sale.customerName}`}
                            {sale.customerName && sale.customerPhone && " • "}
                            {sale.customerPhone && `📱 ${sale.customerPhone}`}
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={() => resumeSale(sale)}>
                        Resume
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Receipt Dialog */}
      {lastTransaction && (
        <ThermalReceipt
          transaction={{
            id: lastTransaction.id || Date.now().toString(),
            transactionId: lastTransaction.transactionId || `TXN-${Date.now()}`,
            timestamp: lastTransaction.timestamp || new Date().toISOString(),
            amount: lastTransaction.total || 0,
            // Use the customer info from lastTransaction instead of current state
            customerName: lastTransaction.customerName || undefined,
            customerPhone: lastTransaction.customerPhone || undefined,
            paymentMethod: paymentType,
            items:
              lastTransaction.items?.map((item: CartItem) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.sellingPrice,
              })) || [],
            isCustomAmount: false,
            isCreditSale: lastTransaction.isCreditSale,
            amountPaid: lastTransaction.amountPaid,
            balanceDue: lastTransaction.balanceDue,
          }}
          open={showReceipt}
          onOpenChange={setShowReceipt}
        />
      )}
    </div>
  );
}