"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { type Item, useData } from "@/context/DataContext";
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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";

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
}

export default function MobilePOSScreen() {
  const { items, createTransaction } = useData();
  const { user,businessData } = useAuth();
  const { currentBranch } = useBranch();
  const router = useRouter();

  // Cart and sales state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Quick sale state
  const [quickAmount, setQuickAmount] = useState("");
  const [showQuickSale, setShowQuickSale] = useState(false);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOnline, setIsOnline] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [suspendedSales, setSuspendedSales] = useState<SuspendedSale[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [floatAmount, setFloatAmount] = useState(50000); // Starting cash in till
  const [showChangeBreakdown, setShowChangeBreakdown] = useState(false);

  // Security state
  const [isLocked, setIsLocked] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Barcode scanner
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  // Categories from items
  const categories = [
    "all",
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  // Quick amounts for fast sales
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

  // Denomination breakdown for change
  const denominations = [
    50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50,
  ];

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      setIsLocked(true);
      toast({
        title: "Session Locked",
        description: "Please enter your PIN to continue",
        variant: "destructive",
      });
    }, 300000); // 5 minutes
    setInactivityTimer(timer);
  };

  // Monitor user activity
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const resetTimer = () => resetInactivityTimer();

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchQuery));
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = cart.reduce(
    (total, item) => total + item.sellingPrice * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% VAT
  const totalDue = subtotal + tax;
  const changeAmount = amountReceived ? Number(amountReceived) - totalDue : 0;

  // Add item to cart
  const addToCart = (item: Item) => {
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
      description: `${item.name} added`,
    });
  };

  // Update quantity
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

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Calculate change breakdown
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

  // Complete sale
  const completeSale = async () => {
    if (totalDue <= 0) {
      toast({
        title: "Error",
        description: "Please add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === "cash" && Number(amountReceived) < totalDue) {
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
          branchId: item.branchId, // ✅ required
          isActive: item.isActive ?? true, // ✅ default to true if missing
        })),
      };

      const transaction = await createTransaction(transactionData);

      // Update float for cash payments
      if (paymentType === "cash") {
        setFloatAmount((prev) => prev + totalDue - changeAmount);
      }

      setLastTransaction({
        ...transaction,
        amountReceived: Number(amountReceived),
        change: changeAmount,
        items: cart,
        subtotal,
        tax,
        total: totalDue,
      });

      toast({
        title: "Sale Complete",
        description: `UGX ${formatNumber(totalDue)} - ${getPaymentMethodLabel(paymentType)}`,
      });

      // Reset form
      setCart([]);
      setAmountReceived("");
      setCustomerName("");
      setCustomerPhone("");
      setShowQuickSale(false);
      setQuickAmount("");

      // Show receipt
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
    };

    setSuspendedSales((prev) => [...prev, suspendedSale]);
    setCart([]);
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");

    toast({
      title: "Sale Suspended",
      description: "Sale has been saved for later",
    });
  };

  // Resume suspended sale
  const resumeSale = (sale: SuspendedSale) => {
    setCart(sale.items);
    setCustomerName(sale.customerName || "");
    setSuspendedSales((prev) => prev.filter((s) => s.id !== sale.id));

    toast({
      title: "Sale Resumed",
      description: "Suspended sale has been restored",
    });
  };

  // Cancel sale
  const cancelSale = () => {
    setCart([]);
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setShowQuickSale(false);
    setQuickAmount("");

    toast({
      title: "Sale Cancelled",
      description: "Cart has been cleared",
    });
  };

  // Handle barcode scan
  const handleBarcodeScanned = (barcode: string) => {
    const item = items.find((item) => item.barcode === barcode);
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
  };

  // Get payment method label
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

  // Get payment method icon
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

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Session Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="Enter PIN to unlock"
              className="mb-4"
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.currentTarget.value === "1234") {
                  setIsLocked(false);
                  resetInactivityTimer();
                }
              }}
            />
            <Button
              className="w-full"
              onClick={() => {
                setIsLocked(false);
                resetInactivityTimer();
              }}
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">
                  {businessData?.name || "Business Name"} -{" "}
                  {currentBranch?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Centered Support Info */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>SimuPos Support: 0702629361</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* User and Time Info - moved to right side */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
                <span>{user?.firstName || 'User'} {user?.lastName || ''}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>

            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3 mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 mr-1" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recent Sales</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No recent sales</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Product Search & Catalog */}
        <div className="flex-1 p-4 space-y-4">
          {/* Search and Barcode */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 pr-12"
                placeholder="Search products or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowBarcodeScanner(true)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>

            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category || "all"} // Handle potential undefined
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(category || "all")} // Provide fallback
                >
                  {category === "all" ? "All" : category || "Uncategorized"}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Sale */}
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Sale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickAmount(amount.toString());
                      setShowQuickSale(true);
                    }}
                  >
                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Custom amount"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                type="number"
                onFocus={() => setShowQuickSale(true)}
              />
            </CardContent>
          </Card> */}

          {/* Products Grid */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Products ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-24 flex-col items-start justify-start p-3 relative bg-transparent"
                    onClick={() => addToCart(item)}
                    disabled={
                      item.stockQuantity !== undefined &&
                      item.stockQuantity <= 0
                    }
                  >
                    <div className="text-left w-full">
                      <div className="font-medium text-sm line-clamp-2 mb-1">
                        {item.name}
                      </div>
                      <div className="text-primary text-xs font-semibold">
                        UGX {formatNumber(item.sellingPrice)}
                      </div>
                    </div>

                    {item.stockQuantity !== undefined && (
                      <Badge
                        variant={
                          item.stockQuantity <= 0 ? "destructive" : "secondary"
                        }
                        className="absolute bottom-1 left-1 text-xs"
                      >
                        {item.stockQuantity <= 0 ? "Out" : item.stockQuantity}
                      </Badge>
                    )}

                    {item.stockQuantity === undefined ||
                    item.stockQuantity > 0 ? (
                      <PlusCircle className="h-4 w-4 text-primary absolute top-1 right-1" />
                    ) : null}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex flex-col">
          {/* Cart */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {showQuickSale ? "Quick Sale" : `Cart (${cart.length})`}
              </h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={suspendSale}>
                  <Pause className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cancelSale}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showQuickSale ? (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-primary">
                      UGX {Number(quickAmount || 0).toLocaleString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowQuickSale(false);
                        setQuickAmount("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          UGX {formatNumber(item.sellingPrice)} each
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
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
                          className="h-6 w-6 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <PlusCircle className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-semibold text-sm">
                        UGX {formatNumber(item.sellingPrice * item.quantity)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Customer Info */}
            {/* <div className="space-y-2 mb-4">
              <Input
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="Customer phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div> */}

            {/* Payment Methods */}
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-sm">Payment Method</h4>
              <div className="grid grid-cols-3 gap-2">
                {(["cash", "mtn_momo", "airtel_money"] as PaymentType[]).map(
                  (method) => (
                    <Button
                      key={method}
                      variant={paymentType === method ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentType(method)}
                      className="flex-col h-12"
                    >
                      {getPaymentMethodIcon(method)}
                      <span className="text-xs mt-1">
                        {getPaymentMethodLabel(method)}
                      </span>
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Payment Amount (Cash only) */}
            {paymentType === "cash" && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Amount Received</label>
                <Input
                  type="number"
                  placeholder="Enter amount received"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                />
                {changeAmount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Change to Give:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        UGX {formatNumber(changeAmount)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-green-600"
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
                              className="flex justify-between text-xs"
                            >
                              <span>UGX {Number(denom).toLocaleString()}</span>
                              <span>
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
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient amount. Need UGX{" "}
                      {formatNumber(Math.abs(changeAmount))} more.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Total & Checkout */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>UGX {formatNumber(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18%):</span>
                <span>UGX {formatNumber(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">
                  UGX {formatNumber(totalDue)}
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <Button
              className="w-full h-12"
              onClick={completeSale}
              disabled={
                totalDue <= 0 ||
                (paymentType === "cash" && Number(amountReceived) < totalDue)
              }
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              COMPLETE SALE
            </Button>

            {/* Float Display */}
            <div className="text-center text-xs text-gray-500">
              Cash in Till: UGX {formatNumber(floatAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Suspended Sales Dialog */}
      {suspendedSales.length > 0 && (
        <div className="fixed bottom-4 left-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                {suspendedSales.length} Suspended
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suspended Sales</DialogTitle>
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

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter or scan barcode"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleBarcodeScanned(barcodeInput);
                }
              }}
              autoFocus
            />
            <Button
              className="w-full"
              onClick={() => handleBarcodeScanned(barcodeInput)}
              disabled={!barcodeInput}
            >
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold">SimuPOS Store</h3>
                <p className="text-sm text-gray-500">Main Branch</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                {lastTransaction.items.map((item: CartItem, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} x UGX {formatNumber(item.sellingPrice)}
                      </div>
                    </div>
                    <div>
                      UGX {formatNumber(item.sellingPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>UGX {formatNumber(lastTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>UGX {formatNumber(lastTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>UGX {formatNumber(lastTransaction.total)}</span>
                </div>
                {lastTransaction.change > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Amount Received:</span>
                      <span>
                        UGX {formatNumber(lastTransaction.amountReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Change:</span>
                      <span>UGX {formatNumber(lastTransaction.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-xs text-gray-500 border-t pt-2">
                <p>Thank you for your business!</p>
                <p>Cashier: John Doe</p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
