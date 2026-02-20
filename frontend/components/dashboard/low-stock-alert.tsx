/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Package,
  ArrowUpRight,
  TrendingDown,
  Zap,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Configurable thresholds
const STOCK_THRESHOLDS = {
  critical: {
    absolute: 10, // Critical if stock < 10
    percentage: 20, // OR percentage <= 20%
  },
  warning: {
    absolute: 10, // Warning if stock >= 10
    percentage: 50, // AND percentage <= 50%
  },
};

// Safe helper functions with proper division protection
function getStockPercentage(
  stockQuantity: number = 0,
  minStockLevel: number = 1
) {
  const safeStock = stockQuantity || 0;
  const safeMinStock = minStockLevel || 1;

  // Prevent division by zero
  if (safeMinStock <= 0) {
    return safeStock > 0 ? 100 : 0;
  }

  const percentage = (safeStock / safeMinStock) * 100;
  return Math.min(100, Math.max(0, percentage)); // Ensure between 0-100
}

function getStockLevelColor(
  stockQuantity: number = 0,
  minStockLevel: number = 1
) {
  const safeStock = stockQuantity || 0;
  const safeMinStock = minStockLevel || 1;
  const percentage = getStockPercentage(safeStock, safeMinStock);

  if (
    safeStock < STOCK_THRESHOLDS.critical.absolute ||
    percentage <= STOCK_THRESHOLDS.critical.percentage
  ) {
    return "from-red-500 to-rose-500"; // Critical
  }
  if (percentage <= STOCK_THRESHOLDS.warning.percentage) {
    return "from-orange-500 to-amber-500"; // Warning
  }
  return "from-yellow-500 to-amber-400"; // Low
}

function getStockLevelBadge(
  stockQuantity: number = 0,
  minStockLevel: number = 1
) {
  const safeStock = stockQuantity || 0;
  const safeMinStock = minStockLevel || 1;
  const percentage = getStockPercentage(safeStock, safeMinStock);

  if (
    safeStock < STOCK_THRESHOLDS.critical.absolute ||
    percentage <= STOCK_THRESHOLDS.critical.percentage
  ) {
    return {
      color: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0",
      text: "Critical",
      icon: <AlertCircle className="h-3 w-3" />,
    };
  }
  if (percentage <= STOCK_THRESHOLDS.warning.percentage) {
    return {
      color:
        "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0",
      text: "Warning",
      icon: <AlertTriangle className="h-3 w-3" />,
    };
  }
  return {
    color:
      "bg-gradient-to-r from-yellow-500 to-amber-400 text-amber-900 border-0",
    text: "Low",
    icon: <TrendingDown className="h-3 w-3" />,
  };
}

// Safe filtering functions with proper division protection
function filterCriticalItems(items: any[]) {
  return items.filter((item) => {
    const stockQuantity = item.stockQuantity || 0;
    const minStockLevel = item.minStockLevel || 1;
    const percentage = getStockPercentage(stockQuantity, minStockLevel);

    return (
      stockQuantity < STOCK_THRESHOLDS.critical.absolute ||
      percentage <= STOCK_THRESHOLDS.critical.percentage
    );
  });
}

function filterWarningItems(items: any[]) {
  return items.filter((item) => {
    const stockQuantity = item.stockQuantity || 0;
    const minStockLevel = item.minStockLevel || 1;
    const percentage = getStockPercentage(stockQuantity, minStockLevel);

    return (
      stockQuantity >= STOCK_THRESHOLDS.warning.absolute &&
      percentage > STOCK_THRESHOLDS.critical.percentage &&
      percentage <= STOCK_THRESHOLDS.warning.percentage
    );
  });
}

function filterLowItems(items: any[]) {
  return items.filter((item) => {
    const stockQuantity = item.stockQuantity || 0;
    const minStockLevel = item.minStockLevel || 1;
    const percentage = getStockPercentage(stockQuantity, minStockLevel);

    return (
      stockQuantity >= STOCK_THRESHOLDS.warning.absolute &&
      percentage > STOCK_THRESHOLDS.warning.percentage
    );
  });
}

export function LowStockAlert() {
  const { lowStockItems, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-orange-50/30 border-orange-100 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-orange-100 bg-white/50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
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
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Package className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 font-medium">
              Failed to load stock alerts
            </p>
            <p className="text-red-400 text-sm mt-1">
              Please try refreshing the page
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use safe filtering functions
  const criticalItems = filterCriticalItems(lowStockItems || []);
  const warningItems = filterWarningItems(lowStockItems || []);
  const lowItems = filterLowItems(lowStockItems || []);
  const totalItems = (lowStockItems || []).length;

  return (
    <Card className="bg-gradient-to-br from-white to-orange-50/30 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b border-orange-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
            <p className="text-sm text-orange-600 mt-0.5">
              {totalItems} item{totalItems !== 1 ? "s" : ""} need attention •{" "}
              {criticalItems.length} critical • {warningItems.length} warning •{" "}
              {lowItems.length} low
            </p>
          </div>
        </div>
        <Link href="/inventory">
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 border-orange-200"
          >
            Manage Stock
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Critical Items Section */}
        {criticalItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Critical Stock ({criticalItems.length})
              </span>
            </div>
            <div className="space-y-2">
              {criticalItems.map((item) => (
                <StockItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Warning Items Section */}
        {warningItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">
                Warning Stock ({warningItems.length})
              </span>
            </div>
            <div className="space-y-2">
              {warningItems.map((item) => (
                <StockItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Low Items Section */}
        {lowItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">
                Low Stock ({lowItems.length})
              </span>
            </div>
            <div className="space-y-2">
              {lowItems.map((item) => (
                <StockItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {totalItems === 0 && (
          <div className="text-center py-8">
            <div className="p-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-green-700 font-medium">
              All products are well stocked!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Great job managing your inventory
            </p>
            <Link href="/inventory">
              <Button
                variant="outline"
                className="mt-4 border-green-200 text-green-700 hover:bg-green-50"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Inventory
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {totalItems > 0 && (
          <div className="mt-4 pt-3 border-t border-orange-100">
            <div className="flex gap-2">
              <Link href="/purchasing/orders" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Order
                </Button>
              </Link>
              <Link href="/inventory" className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Manage All
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced StockItem component with safe percentage calculation
function StockItem({ item }: { item: any }) {
  // Safe defaults for potentially undefined properties
  const stockQuantity = item.stockQuantity || 0;
  const minStockLevel = item.minStockLevel || 1;
  const unit = item.unit || "units";
  const name = item.name || "Unknown Product";
  const category = item.category;

  const stockBadge = getStockLevelBadge(stockQuantity, minStockLevel);
  const stockPercentage = getStockPercentage(stockQuantity, minStockLevel);
  const remainingStock = Math.max(0, stockQuantity);
  const stockDeficit = Math.max(0, minStockLevel - stockQuantity);

  // Format minStockLevel to avoid showing "Min: 0.00"
  const displayMinStock = minStockLevel === 0 ? "0" : minStockLevel;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-orange-100 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center border border-orange-200 group-hover:from-orange-200 group-hover:to-red-200 transition-colors">
            <Package className="h-4 w-4 text-orange-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-700 transition-colors truncate">
            {name}
          </p>
          {category && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 mt-1"
            >
              {category}
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <Badge
          className={`${stockBadge.color} text-xs font-semibold mb-1 flex items-center gap-1`}
        >
          {stockBadge.icon}
          {stockBadge.text}
        </Badge>

        {/* Enhanced Stock Information */}
        <div className="space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-bold text-gray-900">
              {remainingStock} {unit}
            </span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500">
              Min: {displayMinStock}
            </span>
          </div>

          {/* Stock Progress Bar with Percentage - Only show if minStockLevel > 0 */}
          {minStockLevel > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getStockLevelColor(stockQuantity, minStockLevel)}`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 min-w-8">
                {Math.round(stockPercentage)}%
              </span>
            </div>
          )}

          {/* Stock Deficit Warning */}
          {stockDeficit > 0 && (
            <div className="flex items-center justify-end gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-600 font-medium">
                Need {stockDeficit} more
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
