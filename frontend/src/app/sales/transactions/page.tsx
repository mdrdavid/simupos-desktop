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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useData } from "@/context/DataContext";

export default function TransactionsPage() {
  const { toast } = useToast();
  const {
    transactions,
    loading,
    getTransactions,
    deleteTransaction,
    syncData,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<
    "all" | "today" | "week" | "month"
  >("today");

  // Load transactions when component mounts
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await getTransactions();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      }
    };

    loadTransactions();
  }, [getTransactions, toast]);

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Filter by period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filterPeriod !== "all") {
      filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.timestamp);
        switch (filterPeriod) {
          case "today":
            return transactionDate >= today;
          case "week":
            return transactionDate >= weekAgo;
          case "month":
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search query
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
        return "💵";
      case "mtn_momo":
        return "📱";
      case "airtel_money":
        return "💳";
      default:
        return "💳";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "mtn_momo":
        return "bg-yellow-100 text-yellow-800";
      case "airtel_money":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const totalSales = filteredTransactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600">
            Track and manage all your transactions
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer, phone, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterPeriod}
                onValueChange={(value: any) => setFilterPeriod(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={refreshTransactions}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 text-center">
                {searchQuery || filterPeriod !== "all"
                  ? "Try adjusting your search or filter"
                  : "Start making sales to see them here"}
              </p>
              {!searchQuery && filterPeriod === "all" && (
                <Button className="mt-4">Make First Sale</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        #{transaction.transactionId}
                      </h3>
                      <Badge
                        variant={transaction.isSynced ? "default" : "secondary"}
                      >
                        {transaction.isSynced ? "Synced" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(transaction.timestamp)}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {transaction.customerName || "Walk-in Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                        </span>
                        <Badge
                          className={getPaymentMethodColor(
                            transaction.paymentMethod
                          )}
                        >
                          {transaction.paymentMethod === "cash"
                            ? "Cash"
                            : transaction.paymentMethod === "mtn_momo"
                              ? "MTN MoMo"
                              : "Airtel Money"}
                        </Badge>
                      </div>
                    </div>

                    {transaction.items && transaction.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Items:
                        </p>
                        {transaction.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {transaction.items.length > 2 && (
                          <p className="text-sm text-gray-500 italic">
                            +{transaction.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(transaction.amount)}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Receipt className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefund(transaction)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Refund
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Transaction
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the transaction and restore{" "}
                              {transaction.items?.length || 0} items to stock.
                              This action cannot be undone.
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
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
