/* eslint-disable @typescript-eslint/no-explicit-any */
// app/accounts-payable/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { AccountsPayable, BillStatus } from "@/src/types/accountsPayable";

export default function AccountsPayableDashboardPage() {
  const router = useRouter();
  const {
    getBills,
    getPayableSummary,
    getAgedPayables,
    getUpcomingPayments,
    loading,
  } = useAccountsPayable();
  const [bills, setBills] = useState<AccountsPayable[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [agedPayables, setAgedPayables] = useState<any>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<AccountsPayable[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [billsResponse, summaryResponse, agedResponse, upcomingResponse] =
        await Promise.all([
          getBills({
            status: statusFilter === "all" ? undefined : statusFilter,
          }),
          getPayableSummary(),
          getAgedPayables(),
          getUpcomingPayments(30),
        ]);

      setBills(billsResponse.bills);
      setSummary(summaryResponse);
      setAgedPayables(agedResponse);
      setUpcomingPayments(upcomingResponse);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accounts payable data.",
        variant: "destructive",
      });
    }
  }, [
    getBills,
    getPayableSummary,
    getAgedPayables,
    getUpcomingPayments,
    statusFilter,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "received":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "void":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "received":
      case "partially_paid":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading accounts payable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Accounts Payable</h1>
            <p className="text-muted-foreground">
              Manage business debts and supplier bills
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button onClick={() => router.push("/accounting/accounts-payable/bills/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalBills || 0} total bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.totalDue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.statusCounts?.received +
                summary?.statusCounts?.partially_paid +
                summary?.statusCounts?.overdue || 0}{" "}
              unpaid bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                agedPayables?.over90 +
                  agedPayables?.days90 +
                  agedPayables?.days60 || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {agedPayables?.agedBills?.filter(
                (b: any) =>
                  b.ageCategory === "over90" ||
                  b.ageCategory === "90" ||
                  b.ageCategory === "60"
              ).length || 0}{" "}
              overdue bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Payments due in next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aged Payables Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aged Payables</CardTitle>
            <CardDescription>
              Breakdown of outstanding bills by age
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Current",
                  value: agedPayables?.current || 0,
                  color: "bg-green-500",
                },
                {
                  label: "1-30 Days",
                  value: agedPayables?.days30 || 0,
                  color: "bg-blue-500",
                },
                {
                  label: "31-60 Days",
                  value: agedPayables?.days60 || 0,
                  color: "bg-yellow-500",
                },
                {
                  label: "61-90 Days",
                  value: agedPayables?.days90 || 0,
                  color: "bg-orange-500",
                },
                {
                  label: "Over 90 Days",
                  value: agedPayables?.over90 || 0,
                  color: "bg-red-500",
                },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <Progress
                    value={(item.value / (agedPayables?.total || 1)) * 100}
                    className={`h-2 ${item.color}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/accounting/accounts-payable/bills/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Bill
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/accounting/accounts-payable/payments")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/accounting/accounts-payable/reports/aged")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/accounting/accounts-payable/suppliers")}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills & Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
            <CardDescription>Latest accounts payable entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() =>
                    router.push(`/accounting/accounts-payable/bills/${bill.id}`)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(bill.status)}`}
                    >
                      {getStatusIcon(bill.status)}
                    </div>
                    <div>
                      <p className="font-medium">{bill.billNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(bill.balanceDue)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(bill.status)}
                    >
                      {bill.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Due in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.slice(0, 5).map((bill) => {
                const daysUntilDue = getDaysUntilDue(bill.dueDate);
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() =>
                      router.push(`/accounting/accounts-payable/bills/${bill.id}`)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          daysUntilDue <= 7
                            ? "bg-red-100 text-red-800"
                            : daysUntilDue <= 14
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{bill.billNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {bill.supplier?.name || "Unknown Supplier"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(bill.balanceDue)}
                      </p>
                      <Badge
                        variant={
                          daysUntilDue <= 7
                            ? "destructive"
                            : daysUntilDue <= 14
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {daysUntilDue === 0
                          ? "Due Today"
                          : daysUntilDue === 1
                            ? "Due Tomorrow"
                            : `Due in ${daysUntilDue} days`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
