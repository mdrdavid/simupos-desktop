"use client";

import type React from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: React.ElementType;
  description?: string;
}

function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && changeType && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge
              variant={changeType === "increase" ? "default" : "destructive"}
              className="flex items-center space-x-1"
            >
              {changeType === "increase" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{change}</span>
            </Badge>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-600">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-500">Failed to load data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const stats = [
    {
      title: "Today's Sales",
      // value: `UGX ${dashboardData.todaysSales.toLocaleString()}`,
      value: `UGX ${Math.floor(dashboardData.todaysSales).toLocaleString()}`,
      icon: DollarSign,
      description: "from yesterday",
    },
    {
      title: "Transactions",
      value: dashboardData.todaysTransactions.toString(),
      icon: ShoppingCart,
      description: "today",
    },
    {
      title: "Products",
      value: dashboardData.totalProducts.toString(),
      icon: Package,
      description: "in stock",
    },
    {
      title: "Customers",
      value: dashboardData.totalCustomers.toString(),
      icon: Users,
      description: "this month",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
