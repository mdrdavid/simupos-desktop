"use client";

import React, { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  description?: string;
  isSecret?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "#6b7280",
  description,
  isSecret = false,
  trend,
}: StatsCardProps) {
  const [isRevealed, setIsRevealed] = useState(!isSecret);

  const handleCardClick = () => {
    if (isSecret) {
      setIsRevealed(true);
    }
  };

  const gradientColors = {
    green: "from-emerald-50 to-green-100 border-emerald-200",
    blue: "from-blue-50 to-cyan-100 border-blue-200",
    purple: "from-purple-50 to-violet-100 border-purple-200",
    orange: "from-orange-50 to-amber-100 border-orange-200",
    red: "from-red-50 to-pink-100 border-red-200",
    indigo: "from-indigo-50 to-blue-100 border-indigo-200",
    teal: "from-teal-50 to-cyan-100 border-teal-200",
  };

  const colorMap: { [key: string]: keyof typeof gradientColors } = {
    "#22c55e": "green",
    "#3b82f6": "blue",
    "#8b5cf6": "purple",
    "#ef4444": "red",
    "#f97316": "orange",
    "#14b8a6": "teal",
    "#6366f1": "indigo",
  };

  const gradientClass = gradientColors[colorMap[iconColor] || "blue"];

  return (
    <Card
      className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${gradientClass} border`}
      onClick={handleCardClick}
      style={{ cursor: isSecret && !isRevealed ? "pointer" : "default" }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div
          className="p-2 rounded-xl shadow-sm"
          style={{
            backgroundColor: `${iconColor}15`,
            border: `1px solid ${iconColor}20`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold text-gray-800 ${
            !isRevealed ? "blur-sm select-none" : ""
          }`}
        >
          {!isRevealed ? "Click to view" : value}
        </div>

        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}

          {trend && (
            <Badge
              variant="outline"
              className={`text-xs ${
                trend.isPositive
                  ? "text-green-600 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const {
    todaysSales,
    weeklySalesTotal,
    monthlySalesTotal,
    annualSalesTotal,
    todaysTransactions,
    totalProducts,
    totalVariants,
    totalCustomers,
    loading,
    error,
  } = useDashboardStats();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100"
            >
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-3/4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100"
              >
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 text-lg font-semibold">
          Failed to load dashboard stats
        </div>
        <p className="text-red-400 text-sm mt-1">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  const allStats = [
    {
      title: "Today's Sales",
      value: `${Math.floor(todaysSales).toLocaleString()}`,
      icon: DollarSign,
      iconColor: "#22c55e",
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Weekly Sales",
      value: `${Math.floor(weeklySalesTotal).toLocaleString()}`,
      icon: DollarSign,
      iconColor: "#3b82f6",
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: "Monthly Sales",
      value: `${Math.floor(monthlySalesTotal).toLocaleString()}`,
      icon: DollarSign,
      iconColor: "#8b5cf6",
      trend: { value: 15.7, isPositive: true },
    },
    {
      title: "Annual Sales",
      value: `${Math.floor(annualSalesTotal).toLocaleString()}`,
      icon: DollarSign,
      iconColor: "#ef4444",
      isSecret: true,
      trend: { value: 23.1, isPositive: true },
    },
    {
      title: "Today's Transactions",
      value: todaysTransactions.toString(),
      icon: ShoppingCart,
      iconColor: "#f97316",
      trend: { value: 5.3, isPositive: true },
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      icon: Package,
      iconColor: "#14b8a6",
      description:
        totalVariants > 0
          ? `${totalVariants} variant${totalVariants > 1 ? "s" : ""}`
          : undefined,
      trend: { value: 2.1, isPositive: true },
    },
    {
      title: "Customers",
      value: totalCustomers.toString(),
      icon: Users,
      iconColor: "#6366f1",
      trend: { value: 18.4, isPositive: true },
    },
  ];

  const topRowStats = allStats.slice(0, 4);
  const bottomRowStats = allStats.slice(4);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {topRowStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-3/4">
          {bottomRowStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}
