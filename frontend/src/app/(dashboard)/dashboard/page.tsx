/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { BestSellingProducts } from "@/components/dashboard/best-selling-products";
import { NetProfitPieChart } from "@/components/dashboard/net-profit-pie-chart";
import { PaymentMethodPieChart } from "@/components/dashboard/payment-method-pie-chart";
import { CategorySalesChart } from "@/components/dashboard/category-sales-chart";
import { AgroProductProvider } from "@/context/AgroProductContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Sprout,
  Download,
  X,
  Smartphone,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusiness } from "@/context/BusinessContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsStandalone } from "@/hooks/useIsStandalone";

function PWAInstallBanner() {
  const isStandalone = useIsStandalone();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isStandalone) {
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    }
  }, [isStandalone]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
            <Smartphone size={160} />
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              <Download size={32} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-1">Install SimuPOS Mobile App</h2>
              <p className="text-white/80 text-sm max-w-xl">
                Get the best experience with offline access, faster loading times, and instant notifications.
                Install our web app on your home screen today!
              </p>
            </div>

            <Button
              onClick={() => window.dispatchEvent(new CustomEvent("show-pwa-install-prompt"))}
              className="bg-white text-teal-600 hover:bg-teal-50 font-bold px-8 py-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              Install Now
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function QuickStatsOverview() {
  const { totalProducts, totalCustomers, todaysSales, loading, error } =
    useDashboardStats();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
        <p className="text-red-600 text-sm">Failed to load quick stats</p>
      </div>
    );
  }

  // Calculate growth percentage (you can replace this with actual growth data from your API)
  const monthlyGrowth = 12.5; // This should come from your dashboard stats

  const quickStats = [
    {
      title: "Active Customers",
      value: totalCustomers?.toString() || "0",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-100",
    },
    {
      title: "Total Products",
      value: totalProducts?.toString() || "0",
      icon: Package,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-100",
    },
    {
      title: "Today's Revenue",
      value: `UGX ${Math.floor(todaysSales || 0).toLocaleString()}`,
      icon: DollarSign,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-100",
    },
    {
      title: "Monthly Growth",
      value: `+${monthlyGrowth}%`,
      icon: BarChart3,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-100",
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {quickStats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.iconColor}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p
                className={`text-xl font-bold ${
                  stat.isPercentage ? "text-emerald-600" : "text-gray-900"
                }`}
              >
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function POSNavigationButton() {
  const { currentBusiness } = useBusiness();
  const businessType = currentBusiness?.businessType?.toLowerCase();

  // Determine POS route based on business type
  const getPOSRoute = () => {
    switch (businessType) {
      case "agro":
      case "agriculture":
        return "/agro/sales/new";
      case "retail":
        return "/retail/sales/new";
      case "restaurant":
        return "/restaurant/sales/new";
      case "hospitality":
        return "/hospitality/sales/new";
      default:
        return "/sales/pos"; // Default POS route
    }
  };

  // Get button styling and icon based on business type
  const getPOSButtonConfig = () => {
    switch (businessType) {
      case "agro":
      case "agriculture":
        return {
          icon: Sprout,
          gradient:
            "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
          text: "Go to Agro POS",
          badge: "Agro",
        };
      case "retail":
        return {
          icon: ShoppingCart,
          gradient:
            "from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
          text: "Go to Retail POS",
          badge: "Retail",
        };
      case "restaurant":
        return {
          icon: ShoppingCart,
          gradient:
            "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
          text: "Go to Restaurant POS",
          badge: "Restaurant",
        };
      case "hospitality":
        return {
          icon: ShoppingCart,
          gradient:
            "from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
          text: "Go to Hospitality POS",
          badge: "Hospitality",
        };
      default:
        return {
          icon: ShoppingCart,
          gradient:
            "from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
          text: "Go to POS",
          badge: "POS",
        };
    }
  };

  const posConfig = getPOSButtonConfig();
  const IconComponent = posConfig.icon;
  const posRoute = getPOSRoute();

  return (
    <Link href={posRoute} passHref>
      <Button className="flex items-center gap-2 bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${posConfig.gradient}`}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          <span>{posConfig.text}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Business type badge */}
        <div className="absolute -top-2 -right-2">
          <div className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {posConfig.badge}
          </div>
        </div>
      </Button>
    </Link>
  );
}

export default function DashboardPage() {
  const { currentBusiness } = useBusiness();
  const businessType = currentBusiness?.businessType;
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      {/* PWA Install Banner */}
      {/* <PWAInstallBanner /> */}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Welcome back! Here&apos;s what&apos;s happening with your{" "}
            {businessType?.toLowerCase() || "business"} today.
            {businessType && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {businessType}
              </span>
            )}
          </p>
        </div>
        {/* Dynamic POS Button */}
        <POSNavigationButton />
      </div>

      {/* Quick Stats Overview */}
      <QuickStatsOverview />

      {/* Stats Cards */}
      <AgroProductProvider>
        <StatsCards />
      </AgroProductProvider>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
          <SalesChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PaymentMethodPieChart />
            <CategorySalesChart />
          </div>
          <NetProfitPieChart />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <BestSellingProducts />
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
