/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
  FileText,
  Download,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { PayablePayment } from "@/src/types/accountsPayable";

export default function PaymentsListPage() {
  const router = useRouter();
  const { getBills, loading } = useAccountsPayable();
  const [payments, setPayments] = useState<PayablePayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // In a real implementation, you would have a getPayments method
      const response = await getBills({});
      // Extract payments from all bills
      const allPayments: PayablePayment[] = [];
      response.bills.forEach((bill) => {
        if (bill.payments) {
          allPayments.push(...bill.payments);
        }
      });
      // Sort by payment date descending
      allPayments.sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      setPayments(allPayments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments.",
        variant: "destructive",
      });
    }
  }, [getBills]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.referenceNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.billId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      (!dateFilter.startDate || payment.paymentDate >= dateFilter.startDate) &&
      (!dateFilter.endDate || payment.paymentDate <= dateFilter.endDate);

    return matchesSearch && matchesDate;
  });

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "bank":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "cash":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "mobile_money":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "check":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your payments data is being prepared for download.",
    });
  };

  const totalPayments = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/accounting/accounts-payable")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground">
              View all accounts payable payments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPayments)}
            </div>
            <p className="text-sm text-muted-foreground">Total Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredPayments.length}</div>
            <p className="text-sm text-muted-foreground">Number of Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments.reduce(
                  (sum, p) => sum + (p.paymentMethod === "bank" ? p.amount : 0),
                  0
                )
              )}
            </div>
            <p className="text-sm text-muted-foreground">Bank Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments.reduce(
                  (sum, p) => sum + (p.paymentMethod === "cash" ? p.amount : 0),
                  0
                )
              )}
            </div>
            <p className="text-sm text-muted-foreground">Cash Payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by reference number or bill ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>From</span>
                </div>
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>To</span>
                </div>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || dateFilter.startDate || dateFilter.endDate
                ? "Try adjusting your search or filters"
                : "No payments have been recorded yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                router.push(`/accounting/accounts-payable/bills/${payment.billId}`)
              }
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </h3>
                        <Badge
                          className={getPaymentMethodColor(
                            payment.paymentMethod
                          )}
                        >
                          {payment.paymentMethod
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Paid on {formatDate(payment.paymentDate)}
                        {payment.referenceNumber &&
                          ` • Ref: ${payment.referenceNumber}`}
                      </p>
                      {payment.notes && (
                        <p className="text-sm mt-1">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Bill ID</p>
                    <p className="font-mono text-sm">
                      {payment.billId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Method Distribution */}
      {filteredPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                filteredPayments.reduce(
                  (acc, payment) => {
                    acc[payment.paymentMethod] =
                      (acc[payment.paymentMethod] || 0) + payment.amount;
                    return acc;
                  },
                  {} as Record<string, number>
                )
              ).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPaymentMethodColor(method)}>
                      {method.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((amount / totalPayments) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
