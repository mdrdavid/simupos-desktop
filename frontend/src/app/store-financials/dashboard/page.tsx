/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCabStore } from "@/context/CabStoreContext";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  Plus,
  FileText,
  ArrowUp,
  ArrowDown,
  Building2,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn, formatNumberWithCommas } from "@/lib/utils";
import { CabStoreTransactionType } from "@/context/CabStoreContext";
import { capitalizeWords } from "@/src/utils";

export default function CabStoreDashboard() {
  const {
    records,
    balanceSummary,
    currentBalance,
    loading,
    refetchRecords,
    getBalanceSummary,
  } = useCabStore();
  const { businessData, currentBranchId } = useAuth();
  const { currentBranch, loading: branchLoading } = useBranch();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (currentBranchId) {
      if (showRefresh) {
        setRefreshing(true);
      }
      await refetchRecords(currentBranchId);
      await getBalanceSummary(currentBranchId);
      if (showRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranchId]);

  // Get recent transactions (last 5)
  const recentTransactions = records.slice(0, 5);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
    className?: string;
  }) => (
    <Card
      className={cn(
        "bg-white/80 backdrop-blur-sm border-0 shadow-lg",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              trend === "up"
                ? "bg-green-100 text-green-600"
                : trend === "down"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonCard = () => (
    <Card className="border-2 border-gray-200/60 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );

  const TransactionItem = ({ transaction }: { transaction: any }) => {
    const isDeposit = transaction.type === CabStoreTransactionType.DEPOSIT;
    const isWithdrawal =
      transaction.type === CabStoreTransactionType.WITHDRAWAL;

    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-200/60 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200">
        <div className="flex items-center space-x-3 flex-1">
          <div
            className={cn(
              "p-2 rounded-lg",
              isDeposit
                ? "bg-green-100 text-green-600"
                : isWithdrawal
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
            )}
          >
            {isDeposit ? (
              <ArrowUp className="h-4 w-4" />
            ) : isWithdrawal ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {capitalizeWords(transaction.details) ||
                capitalizeWords(transaction.category)}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </span>
              {transaction.reference && (
                <>
                  <span>•</span>
                  <span className="truncate">{transaction.reference}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "font-semibold",
              isDeposit
                ? "text-green-600"
                : isWithdrawal
                  ? "text-red-600"
                  : "text-blue-600"
            )}
          >
            {isDeposit ? "+" : isWithdrawal ? "-" : ""}
            UGX {formatNumberWithCommas(transaction.amount.toString())}
          </p>
          <p className="text-xs text-gray-500">
            Balance: UGX{" "}
            {formatNumberWithCommas(transaction.balance.toString())}
          </p>
        </div>
      </div>
    );
  };

  // Combined loading state
  const isLoading = loading || branchLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentBranch?.name || "Store"} Dashboard
                </h1>
                <div className="flex items-center space-x-2 text-gray-600">
                  {businessData?.name && (
                    <>
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">{businessData.name}</span>
                    </>
                  )}
                  {currentBranch?.name && businessData?.name && (
                    <span className="text-gray-400">•</span>
                  )}
                  {currentBranch?.name && (
                    <span className="text-sm">{currentBranch.name}</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Track your store transactions and balances
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || isLoading || !currentBranchId}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
            <Link href="/store-financials/records/new">
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg"
                disabled={!currentBranchId}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </Link>
          </div>
        </div>

        {/* Branch Selection Alert */}
        {!currentBranchId && !isLoading && (
          <Card className="bg-amber-50 border-amber-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    No Branch Selected
                  </p>
                  <p className="text-sm text-amber-700">
                    Please select a branch to view financial data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : !currentBranchId ? (
            // Show placeholder cards when no branch is selected
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-gray-100/50 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-400">
                        {index === 0 && "Current Balance"}
                        {index === 1 && "Total Deposits"}
                        {index === 2 && "Total Withdrawals"}
                        {index === 3 && "Total Transactions"}
                      </p>
                      <p className="text-2xl font-bold text-gray-300">--</p>
                      <p className="text-xs text-gray-400">Select a branch</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-200 text-gray-400">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="Current Balance"
                value={`UGX ${formatNumberWithCommas(currentBalance.toString())}`}
                subtitle="Latest available balance"
                icon={DollarSign}
                trend={currentBalance >= 0 ? "up" : "down"}
                className={
                  currentBalance >= 0
                    ? "border-l-4 border-l-green-500"
                    : "border-l-4 border-l-red-500"
                }
              />
              <StatCard
                title="Total Deposits"
                value={`UGX ${formatNumberWithCommas((balanceSummary?.totalDeposits || 0).toString())}`}
                subtitle="All time deposits"
                icon={TrendingUp}
                trend="up"
                className="border-l-4 border-l-blue-500"
              />
              <StatCard
                title="Total Withdrawals"
                value={`UGX ${formatNumberWithCommas((balanceSummary?.totalWithdrawals || 0).toString())}`}
                subtitle="All time withdrawals"
                icon={TrendingDown}
                trend="down"
                className="border-l-4 border-l-orange-500"
              />
              <StatCard
                title="Total Transactions"
                value={records.length.toString()}
                subtitle="All time transactions"
                icon={Calendar}
                trend="neutral"
                className="border-l-4 border-l-purple-500"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/store-financials/records/new">
            <Card
              className={cn(
                "bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                !currentBranchId && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Add Transaction
                    </h3>
                    <p className="text-sm text-gray-600">
                      Record new deposit or withdrawal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/store-financials/history">
            <Card
              className={cn(
                "bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                !currentBranchId && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      View History
                    </h3>
                    <p className="text-sm text-gray-600">
                      Browse all transactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/store-financials/import">
            <Card
              className={cn(
                "bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                !currentBranchId && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Bulk Import</h3>
                    <p className="text-sm text-gray-600">
                      Import multiple records
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/store-financials/reports">
            <Card
              className={cn(
                "bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                !currentBranchId && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      View Reports
                    </h3>
                    <p className="text-sm text-gray-600">
                      Generate and view financial reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Preview */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </div>
              {recentTransactions.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {recentTransactions.length} transactions
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentBranchId && !isLoading ? (
              // No branch selected state
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Select a Branch
                </h3>
                <p className="text-gray-500 mb-4">
                  Please select a branch to view recent activity
                </p>
              </div>
            ) : isLoading ? (
              // Skeleton loading state
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              // Actual transactions
              <div className="space-y-1">
                {recentTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
                {records.length > 5 && (
                  <div className="pt-4 border-t border-gray-200/60">
                    <Link href="/store-financials/history">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View All Transactions ({records.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Recent Activity
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by adding your first transaction
                </p>
                <Link href="/store-financials/records/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Transaction
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
