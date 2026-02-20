/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DollarSign,
  BookOpen,
  FileText,
  Briefcase,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calculator,
  Download,
  Eye,
  Plus,
  Users,
  Building,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBookkeeping } from "@/context/BookkeepingContext";
import { useAccountsReceivable } from "@/context/AccountsReceivableContext";
import { useAccountsPayable } from "@/context/AccountsPayableContext";

// Type definitions
interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color?: "blue" | "green" | "red" | "purple" | "orange";
  format?: "currency" | "number";
}

interface RatioCardProps {
  title: string;
  value: number;
  description: string;
  goodThreshold?: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

const AccountingDashboard = () => {
  const { getProfitAndLoss, getBalanceSheet, getCashFlowStatement, getGeneralLedger } = useBookkeeping();
  const { getReceivableSummary } = useAccountsReceivable();
  const { getPayableSummary } = useAccountsPayable();

  const [summaryData, setSummaryData] = useState({
    income: 0,
    expenses: 0,
    profit: 0,
    assets: 0,
    liabilities: 0,
    equity: 0,
    cashFlow: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      try {
        const [pl, bs, cf, ar, ap, gl] = await Promise.all([
          getProfitAndLoss(firstDayOfMonth.toISOString(), today.toISOString()),
          getBalanceSheet(today.toISOString()),
          getCashFlowStatement(firstDayOfMonth.toISOString(), today.toISOString()),
          getReceivableSummary(),
          getPayableSummary(),
          getGeneralLedger({ limit: 5 })
        ]);

        setSummaryData({
          income: pl?.revenue?.total || 0,
          expenses: pl?.expenses?.total || 0,
          profit: pl?.netIncome || 0,
          assets: bs?.assets?.total || 0,
          liabilities: bs?.liabilities?.total || 0,
          equity: bs?.equity?.total || 0,
          cashFlow: cf?.netCashFlow || 0,
          accountsReceivable: ar?.totalDue || 0,
          accountsPayable: ap?.totalDue || 0,
        });

        if (gl?.entries) {
            setRecentTransactions(gl.entries.map((entry: any) => ({
                id: entry.id,
                description: entry.description,
                amount: entry.amount,
                type: entry.entryType === 'debit' ? 'income' : 'expense', // This is a simplification
                date: new Date(entry.entryDate).toLocaleDateString()
            })));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, [getProfitAndLoss, getBalanceSheet, getCashFlowStatement, getReceivableSummary, getPayableSummary, getGeneralLedger]);

  const mockRecentTransactions: Transaction[] = [
    {
      id: 1,
      description: "Sales Revenue",
      amount: 2500.0,
      type: "income",
      date: "2024-01-15",
    },
    {
      id: 2,
      description: "Office Supplies",
      amount: 450.5,
      type: "expense",
      date: "2024-01-14",
    },
    {
      id: 3,
      description: "Equipment Purchase",
      amount: 1200.0,
      type: "expense",
      date: "2024-01-13",
    },
    {
      id: 4,
      description: "Consulting Fees",
      amount: 1800.0,
      type: "income",
      date: "2024-01-12",
    },
  ];

  const financialRatios = {
    currentRatio: 2.1,
    profitMargin: 37.6,
    debtToEquity: 0.92,
    roe: 36.2,
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
    format = "currency",
  }: StatCardProps) => {
    const isPositive = change !== undefined ? change >= 0 : true;
    const formattedValue =
      format === "currency"
        ? `UGX ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

    const colorClasses = {
      blue: "text-blue-600 bg-blue-100 border-blue-200",
      green: "text-green-600 bg-green-100 border-green-200",
      red: "text-red-600 bg-red-100 border-red-200",
      purple: "text-purple-600 bg-purple-100 border-purple-200",
      orange: "text-orange-600 bg-orange-100 border-orange-200",
    };

    return (
      <Card
        className={`border-l-4 ${colorClasses[color]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div
            className={`p-2 rounded-lg ${colorClasses[color].split(" ")[1]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formattedValue}
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center text-xs font-medium mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {isPositive ? "+" : ""}
              {change}% from last month
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const RatioCard = ({
    title,
    value,
    description,
    goodThreshold = 0,
  }: RatioCardProps) => {
    const isGood = value >= goodThreshold;

    return (
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">{title}</span>
            <Badge
              variant={isGood ? "default" : "secondary"}
              className={
                isGood ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
              }
            >
              {isGood ? "Good" : "Needs Attention"}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value.toFixed(1)}
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Accounting Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial overview and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={summaryData.income}
          change={12.5}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={summaryData.expenses}
          change={-8.2}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={summaryData.profit}
          change={15.3}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Cash Flow"
          value={summaryData.cashFlow}
          change={5.7}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Balance Sheet Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-gradient-to-br from-white to-blue-50/30 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Balance Sheet Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Total Assets</span>
                </div>
                <span className="font-bold text-green-600">
                  UGX{" "}
                  {summaryData.assets.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Total Liabilities</span>
                </div>
                <span className="font-bold text-red-600">
                  UGX{" "}
                  {summaryData.liabilities.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Owner&apos;s Equity</span>
                </div>
                <span className="font-bold text-blue-600">
                  UGX{" "}
                  {summaryData.equity.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Accounts Receivable
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    UGX{" "}
                    {summaryData.accountsReceivable.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Accounts Payable</div>
                  <div className="text-lg font-bold text-purple-600">
                    UGX{" "}
                    {summaryData.accountsPayable.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Financial Ratios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RatioCard
              title="Current Ratio"
              value={financialRatios.currentRatio}
              description="Meets healthy threshold (>2.0)"
              goodThreshold={2.0}
            />
            <RatioCard
              title="Profit Margin"
              value={financialRatios.profitMargin}
              description="Above industry average"
              goodThreshold={20}
            />
            <RatioCard
              title="Debt to Equity"
              value={financialRatios.debtToEquity}
              description="Moderate leverage"
              goodThreshold={1.0}
            />
            <RatioCard
              title="Return on Equity"
              value={financialRatios.roe}
              description="Strong performance"
              goodThreshold={15}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}UGX{" "}
                    {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/accounting/transactions">
                View All Transactions
                <Eye className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start h-12" asChild>
              <Link href="/accounting/ledger">
                <BookOpen className="mr-3 h-4 w-4" />
                View General Ledger
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              asChild
            >
              <Link href="/accounting/reports/trial-balance">
                <Calculator className="mr-3 h-4 w-4" />
                Trial Balance Report
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              asChild
            >
              <Link href="/accounting/reports/income-statement">
                <BarChart3 className="mr-3 h-4 w-4" />
                Income Statement
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              asChild
            >
              <Link href="/accounting/reports/balance-sheet">
                <PieChart className="mr-3 h-4 w-4" />
                Balance Sheet
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              asChild
            >
              <Link href="/accounting/chart-of-accounts">
                <Users className="mr-3 h-4 w-4" />
                Chart of Accounts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Financial Health Summary
              </h3>
              <p className="text-gray-600 text-sm">
                Overall business financial status
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">A</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">Healthy</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingDashboard;
