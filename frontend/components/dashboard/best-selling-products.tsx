"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Crown,
  Star,
  TrendingUp,
  ArrowUpRight,
  Package,
  Sparkles,
  // DollarSign,
} from "lucide-react";
import Link from "next/link";

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return {
        icon: <Crown className="h-3 w-3" />,
        color:
          "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0",
        text: "1st",
      };
    case 2:
      return {
        icon: <Trophy className="h-3 w-3" />,
        color: "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0",
        text: "2nd",
      };
    case 3:
      return {
        icon: <Star className="h-3 w-3" />,
        color:
          "bg-gradient-to-r from-amber-600 to-orange-500 text-white border-0",
        text: "3rd",
      };
    default:
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        text: `${rank}th`,
      };
  }
}

function getSalesColor(quantity: number) {
  if (quantity >= 100) return "text-green-600 bg-green-50 border-green-200";
  if (quantity >= 50) return "text-blue-600 bg-blue-50 border-blue-200";
  if (quantity >= 20) return "text-purple-600 bg-purple-50 border-purple-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getRevenueColor(revenue: number) {
  if (revenue >= 1000000) return "text-green-600";
  if (revenue >= 500000) return "text-blue-600";
  if (revenue >= 100000) return "text-purple-600";
  return "text-gray-600";
}

export function BestSellingProducts() {
  const { bestSellingProducts, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-100 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-white/50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Package className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 font-medium">
              Failed to load best sellers
            </p>
            <p className="text-red-400 text-sm mt-1">
              Please try refreshing the page
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bestSellingProducts || bestSellingProducts.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-100 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-amber-200 mx-auto mb-4" />
            <p className="text-amber-700 font-medium">No sales data yet</p>
            <p className="text-amber-600 text-sm mt-1">
              Start selling to see your top products here
            </p>
            <Link href="/products">
              <Button className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                View Products
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProducts = bestSellingProducts.slice(0, 5);

  return (
    <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b border-amber-200">
        <CardTitle className="text-amber-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          Best Selling Products
        </CardTitle>
        <Link href="/analytics/products">
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
          >
            View All
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {topProducts.map((product, index) => {
            const rank = index + 1;
            const rankBadge = getRankBadge(rank);
            const salesColor = getSalesColor(product.quantity);
            // const revenueColor = getRevenueColor(product.revenue || 0);

            return (
              <div
                key={`${product.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Badge
                      className={`absolute -top-2 -left-2 ${rankBadge.color} text-xs font-bold px-1.5 py-0.5 min-w-6 h-6 flex items-center justify-center`}
                    >
                      {rankBadge.icon}
                    </Badge>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border border-amber-200 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                      <Package className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="max-w-[140px]">
                    <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-amber-700 transition-colors truncate">
                      {product.name}
                    </p>
                    {/* {product.category && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mt-1">
                        {product.category}
                      </Badge>
                    )} */}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`${salesColor} font-semibold text-xs mb-1`}
                  >
                    {product.quantity.toFixed(0)} sold
                  </Badge>
                  {/* {product.revenue && (
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className={`h-3 w-3 ${revenueColor}`} />
                      <p className={`text-xs font-medium ${revenueColor}`}>
                        UGX {Math.floor(product.revenue).toLocaleString()}
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Section */}
        {bestSellingProducts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-amber-100">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Total items sold:</span>
              <span className="font-bold text-amber-700">
                {bestSellingProducts
                  .reduce((total, product) => total + product.quantity, 0)
                  .toFixed(0)}
              </span>
            </div>
            {/* {bestSellingProducts.some((p) => p.revenue) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total revenue:</span>
                <span className="font-bold text-green-700 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  UGX{" "}
                  {Math.floor(
                    bestSellingProducts.reduce(
                      (total, product) => total + (product.revenue || 0),
                      0
                    )
                  ).toLocaleString()}
                </span>
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
