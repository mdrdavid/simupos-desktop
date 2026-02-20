/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Receipt,
  RotateCcw,
  Trash2,
  RefreshCw,
  User,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Smartphone,
  MoreVertical,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useData } from "@/context/DataContext";
import ThermalReceipt from "@/components/pos/thermal-receipt";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const { toast } = useToast();
  const {
    transactions,
    loading,
    getTransactions,
    deleteTransaction,
    syncData,
    totalTransactions,
    isFetchingMoreTransactions,
    totalPages,
    currentPage,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<
    "all" | "today" | "week" | "month" | "last30days"
  >("today");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);

  // Load transactions when component mounts
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const filters: {
          startDate?: Date;
          endDate?: Date;
          page?: number;
          limit?: number;
        } = {};

        if (filterPeriod !== "all") {
          const now = new Date();
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const todayEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          );

          switch (filterPeriod) {
            case "today":
              filters.startDate = todayStart;
              filters.endDate = todayEnd;
              break;
            case "week":
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              weekAgo.setHours(0, 0, 0, 0);
              filters.startDate = weekAgo;
              filters.endDate = todayEnd;
              break;
            case "month":
              const firstDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );
              const lastDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
              );
              filters.startDate = firstDayOfMonth;
              filters.endDate = lastDayOfMonth;
              break;
            case "last30days":
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              thirtyDaysAgo.setHours(0, 0, 0, 0);
              filters.startDate = thirtyDaysAgo;
              filters.endDate = todayEnd;
              break;
          }
        }

        await getTransactions({ ...filters, page: page, limit: itemsPerPage });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      }
    };

    loadTransactions();
  }, [toast, filterPeriod, page, itemsPerPage, getTransactions]);

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.customerName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.customerPhone?.includes(searchQuery) ||
          transaction.transactionId
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const refreshTransactions = async () => {
    try {
      setRefreshing(true);
      await syncData();
      toast({
        title: "Refreshed",
        description: "Transactions have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh transactions",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed and items restored to stock",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleRefund = (transaction: any) => {
    toast({
      title: "Refund Processed",
      description: `Refunded ${formatCurrency(transaction.amount)}`,
    });
  };

  const handleReceiptClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowThermalReceipt(true);
  };

  const handleThermalReceiptChange = (open: boolean) => {
    setShowThermalReceipt(open);
    if (!open) {
      setSelectedTransaction(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date >= today) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date >= yesterday) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "mtn_momo":
        return <Smartphone className="w-4 h-4" />;
      case "airtel_money":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-50 text-green-700 border-green-200";
      case "mtn_momo":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "airtel_money":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ADD: Calculate credit sale statistics
  const filteredTransactions = getFilteredTransactions();

  // Calculate various statistics
  const totalSales = filteredTransactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalItems = filteredTransactions.reduce((total, transaction) => {
    return total + (transaction.items?.length || 0);
  }, 0);

  // ADD: Credit sale specific calculations - ROBUST VERSION
  const creditSales = filteredTransactions.filter((t) => t.isCreditSale);
  const cashSales = filteredTransactions.filter((t) => !t.isCreditSale);

  // Helper function to safely convert to number
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const totalCreditSales = creditSales.reduce((total, transaction) => {
    return total + safeNumber(transaction.amount);
  }, 0);

  const totalCashSales = cashSales.reduce((total, transaction) => {
    return total + safeNumber(transaction.amount);
  }, 0);

  const totalOutstandingCredit = creditSales.reduce((total, transaction) => {
    const amount = safeNumber(transaction.amount);
    const amountPaid = safeNumber(transaction.amountPaid);
    const balanceDue = safeNumber(transaction.balanceDue);

    // Prefer balanceDue if it's a positive number, otherwise calculate
    if (balanceDue > 0) {
      return total + balanceDue;
    } else {
      const calculatedBalance = Math.max(0, amount - amountPaid);
      return total + calculatedBalance;
    }
  }, 0);

  const creditSalesPercentage =
    totalSales > 0 ? (totalCreditSales / totalSales) * 100 : 0;

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Sales History
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all your transactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer, phone, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={filterPeriod}
                onValueChange={(
                  value: "all" | "today" | "week" | "month" | "last30days"
                ) => setFilterPeriod(value)}
              >
                <SelectTrigger className="w-40 bg-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={refreshTransactions}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - UPDATED WITH CREDIT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Sales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Cash Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalCashSales)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {cashSales.length} cash transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Credit Sales
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(totalCreditSales)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {creditSales.length} credit sales •{" "}
              {creditSalesPercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">
              Outstanding Credit
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(totalOutstandingCredit)}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {creditSales.length} active credit sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {totalTransactions}{" "}
            transactions • {creditSales.length} credit sales
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Receipt className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {searchQuery || filterPeriod !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start making sales to see transaction history here"}
              </p>
              {!searchQuery && filterPeriod === "all" && (
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Make First Sale
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-all duration-200 bg-white ${
                    transaction.isCreditSale
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Payment Method Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${
                      transaction.isCreditSale
                        ? "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {transaction.isCreditSale ? (
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    ) : (
                      getPaymentMethodIcon(transaction.paymentMethod)
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        #{transaction.transactionId}
                      </h3>

                      {/* Credit Sale Badge */}
                      {transaction.isCreditSale && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Credit Sale
                        </Badge>
                      )}

                      <Badge
                        variant={transaction.isSynced ? "default" : "secondary"}
                        className={
                          transaction.isSynced
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }
                      >
                        {transaction.isSynced ? "Synced" : "Pending"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={getPaymentMethodColor(
                          transaction.paymentMethod
                        )}
                      >
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="ml-1">
                          {transaction.paymentMethod === "cash"
                            ? "Cash"
                            : transaction.paymentMethod === "mtn_momo"
                              ? "MTN MoMo"
                              : "Airtel Money"}
                        </span>
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(transaction.timestamp)}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>
                          {transaction.customerName || "Walk-in Customer"}
                        </span>
                      </div>
                      {transaction.customerPhone && (
                        <span className="text-sm text-gray-500">
                          {transaction.customerPhone}
                        </span>
                      )}
                    </div>

                    {/* Credit Sale Details */}
                    {transaction.isCreditSale && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-3">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-amber-800">
                              Credit Sale
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-amber-700">
                              Paid:{" "}
                              {formatCurrency(transaction.amountPaid || 0)}
                            </span>
                            <span className="font-bold text-amber-900">
                              Due:{" "}
                              {formatCurrency(
                                transaction.balanceDue || transaction.amount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {transaction.items && transaction.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Items ({transaction.items.length})
                        </p>
                        <div className="space-y-1">
                          {transaction.items.slice(0, 3).map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {item.quantity ?? 0}x {item.name}
                              </span>
                              <span className="text-gray-700 font-medium">
                                {formatCurrency(
                                  ((item as any).price ??
                                    (item as any).sellingPrice ??
                                    (item as any).unitPrice ??
                                    0) * (item.quantity ?? 0)
                                )}
                              </span>
                            </div>
                          ))}
                          {transaction.items.length > 3 && (
                            <p className="text-sm text-gray-500 italic pt-1">
                              +{transaction.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.isCreditSale && transaction.amountPaid && (
                        <div className="text-sm text-amber-600 font-medium">
                          Paid: {formatCurrency(transaction.amountPaid)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReceiptClick(transaction)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleReceiptClick(transaction)}
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            View Receipt
                          </DropdownMenuItem>
                          {transaction.isCreditSale && (
                            <DropdownMenuItem
                              onClick={() => {
                                /* Handle credit payment */
                              }}
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRefund(transaction)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Process Refund
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Transaction
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the transaction and restore{" "}
                                  {transaction.items?.length || 0} items to
                                  stock. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteTransaction(transaction.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Transaction
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value: string) => {
                setItemsPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Thermal Receipt Dialog */}
      {selectedTransaction && (
        <ThermalReceipt
          transaction={selectedTransaction}
          open={showThermalReceipt}
          onOpenChange={handleThermalReceiptChange}
        />
      )}
    </div>
  );
}
