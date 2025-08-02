"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, CreditCard, Smartphone, Banknote } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

function getPaymentIcon(method: string) {
  switch (method) {
    case "cash":
      return <Banknote className="h-4 w-4" />;
    case "mtn_momo":
      return <Smartphone className="h-4 w-4 text-yellow-600" />;
    case "airtel_money":
      return <Smartphone className="h-4 w-4 text-red-600" />;
    default:
      return <CreditCard className="h-4 w-4" />;
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
  const { dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
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
      <Card className="bg-red-50 border-red-200">
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboardData?.recentTransactions?.map((transaction) => {
            const name = transaction.customer?.name || "Customer";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${initials}`}
                      alt={initials}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.items?.length || 0} items</span>
                      <span>•</span>
                      <span>{timeSince(new Date(transaction.timestamp))}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {/* UGX {Number(transaction.amount).toLocaleString()} */}
                    UGX{" "}
                    {Number(transaction.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>

                  <Badge variant="outline" className="mt-1">
                    {getPaymentIcon(transaction.paymentMethod)}
                    <span className="ml-1">
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
