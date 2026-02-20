/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  XCircle,
  Clock,
  Ban,
  Download,
  Filter,
  Search,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Sparkles,
  MoreVertical,
  Eye,
  RefreshCw,
} from "lucide-react";
import { AppLoader } from "@/components/auth/AppLoader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Subscription } from "@/src/types/subscription";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const { subscriptionHistory, loading } = useSubscription();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  if (loading) {
    return <AppLoader />;
  }

  const filteredHistory = subscriptionHistory
    .filter((sub) => {
      if (filter !== "all" && sub.status !== filter) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          sub.planName.toLowerCase().includes(searchLower) ||
          sub.paymentMethod.toLowerCase().includes(searchLower) ||
          formatCurrency(sub.price).toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        case "oldest":
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "mtn_momo":
        return (
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
        );
      case "airtel_money":
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        );
      case "cash":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    total: subscriptionHistory.length,
    active: subscriptionHistory.filter((sub) => sub.status === "active").length,
    totalSpent: subscriptionHistory.reduce(
      (sum, sub) => sum + (sub.price || 0),
      0
    ),
    averageDuration:
      subscriptionHistory.length > 0
        ? subscriptionHistory.reduce((sum, sub) => {
            const start = new Date(sub.startDate);
            const end = sub.endDate ? new Date(sub.endDate) : new Date();
            return (
              sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
          }, 0) / subscriptionHistory.length
        : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl border-gray-300 hover:border-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Subscription History
            </h1>
            <p className="text-gray-600 mt-1">
              Track your subscription payments and billing history
            </p>
          </div>
        </div>

        <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  Avg. Duration
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(stats.averageDuration)} days
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search plans, amounts, or payment methods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredHistory.length} of {subscriptionHistory.length}{" "}
              subscriptions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 p-1 bg-gray-100 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            All ({subscriptionHistory.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Pending (
            {
              subscriptionHistory.filter((sub) => sub.status === "pending")
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Expired (
            {
              subscriptionHistory.filter((sub) => sub.status === "expired")
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Cancelled (
            {
              subscriptionHistory.filter((sub) => sub.status === "cancelled")
                .length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((sub) => (
              <Card
                key={sub.id}
                className="hover:shadow-lg transition-shadow border-2 border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Plan Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {sub.planName} Plan
                          </h3>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(sub.status)} flex items-center gap-1`}
                          >
                            {getStatusIcon(sub.status)}
                            {sub.status.charAt(0).toUpperCase() +
                              sub.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(sub.startDate)} -{" "}
                              {formatDate(sub.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(sub.paymentMethod)}
                            <span className="capitalize">
                              {sub.paymentMethod.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Price and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-600">
                          {formatCurrency(sub.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          One time payment
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gray-400" />
                        <span>
                          Auto-renew: {sub.autoRenew ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                        <span>Billing: Monthly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Reference: {sub.id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Subscriptions Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  {searchTerm || filter !== "all"
                    ? "No subscriptions match your current search and filter criteria."
                    : "You haven't made any subscription payments yet."}
                </p>
                {(searchTerm || filter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatCurrency(amount: number | undefined | null) {
  if (amount == null || isNaN(amount)) {
    return "UGX ---";
  }
  return `UGX ${amount.toLocaleString()}`;
}

function formatDate(dateString: string | undefined | null) {
  if (!dateString) {
    return "Not scheduled";
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        const validDate = new Date(timestamp);
        return validDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return "Not scheduled";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Not scheduled";
  }
}
