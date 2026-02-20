"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowUpRight,
  CreditCard,
  Smartphone,
  Banknote,
  Clock,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

function getPaymentIcon(method: string) {
  switch (method) {
    case "cash":
      return <Banknote className="h-4 w-4 text-green-600" />;
    case "mtn_momo":
      return <Smartphone className="h-4 w-4 text-yellow-600" />;
    case "airtel_money":
      return <Smartphone className="h-4 w-4 text-red-600" />;
    default:
      return <CreditCard className="h-4 w-4 text-blue-600" />;
  }
}

function getPaymentLabel(method: string) {
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
}

function getPaymentColor(method: string) {
  switch (method) {
    case "cash":
      return "bg-green-50 text-green-700 border-green-200";
    case "mtn_momo":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "airtel_money":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

export function RecentTransactions() {
  const { recentTransactions, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load recent transactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b border-purple-200">
        <CardTitle className="text-purple-900">Recent Transactions</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
        >
          View all
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {recentTransactions?.map((transaction) => {
            const name = transaction.customerName || "Customer";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${initials}`}
                      alt={initials}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {name}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{transaction.items?.length || 0} items</span>
                      <span>•</span>
                      <span>{timeSince(new Date(transaction.timestamp))}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                    UGX{" "}
                    {Number(transaction.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${getPaymentColor(transaction.paymentMethod)}`}
                  >
                    {getPaymentIcon(transaction.paymentMethod)}
                    <span className="ml-1 font-medium">
                      {getPaymentLabel(transaction.paymentMethod)}
                    </span>
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
