/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Car,
  Wrench,
  BarChart3,
  Settings,
  MoreHorizontal,
  Calendar,
  FileText,
  ChevronUp,
  Sparkles,
  Package,
  CreditCard,
  TrendingUp,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWashingBay } from "@/context/WashingBayContext";

const mainNavItems = [
  {
    href: "/washing-bay/dashboard",
    icon: Home,
    label: "Dashboard",
    description: "Overview",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeBg: "bg-blue-500/10",
  },
  {
    href: "/washing-bay/orders",
    icon: Car,
    label: "Orders",
    description: "Manage",
    color: "text-green-600",
    bgColor: "bg-green-50",
    activeBg: "bg-green-500/10",
  },
  {
    href: "/washing-bay/workers",
    icon: Users,
    label: "Workers",
    description: "Staff",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    activeBg: "bg-purple-500/10",
  },
  {
    href: "/washing-bay/services",
    icon: Wrench,
    label: "Services",
    description: "Types",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    activeBg: "bg-orange-500/10",
  },
];

const moreNavItems = [
  {
    href: "/washing-bay/worker-performance",
    icon: TrendingUp,
    label: "Worker Performance",
    description: "Analytics",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    href: "/washing-bay/materials",
    icon: Package,
    label: "Materials",
    description: "Inventory",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    href: "/washing-bay/commissions",
    icon: CreditCard,
    label: "Commissions",
    description: "Payments",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    href: "/store-financials/dashboard",
    icon: Banknote,
    label: "Financials",
    description: "Financials",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    href: "/washing-bay/reports",
    icon: BarChart3,
    label: "Reports",
    description: "Analytics",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  // {
  //   href: "/washing-bay/calendar",
  //   icon: Calendar,
  //   label: "Calendar",
  //   description: "Schedule",
  //   color: "text-red-600",
  //   bgColor: "bg-red-50",
  // },
  // {
  //   href: "/washing-bay/documents",
  //   icon: FileText,
  //   label: "Documents",
  //   description: "Records",
  //   color: "text-violet-600",
  //   bgColor: "bg-violet-50",
  // },
  {
    href: "/washing-bay/settings",
    icon: Settings,
    label: "Settings",
    description: "Setup",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export function WashingBayBottomNav() {
  const pathname = usePathname();
  const { washOrders, workers } = useWashingBay();

  const isActive = (href: string) => {
    if (href === "/washing-bay/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getNotificationCount = (href: string) => {
    switch (href) {
      case "/washing-bay/orders":
        const pendingOrders = washOrders.filter(
          (order) =>
            order.status === "pending" || order.status === "in_progress"
        ).length;
        return pendingOrders > 0 ? pendingOrders : 0;
      case "/washing-bay/workers":
        const inactiveWorkers = workers.filter(
          (worker) => !worker.isActive
        ).length;
        return inactiveWorkers > 0 ? inactiveWorkers : 0;
      case "/washing-bay/commissions":
        const unpaidCommissions = 0; // You can implement this based on your data
        return unpaidCommissions > 0 ? unpaidCommissions : 0;
      default:
        return 0;
    }
  };

  const getNotificationColor = (href: string) => {
    switch (href) {
      case "/washing-bay/orders":
        return "bg-orange-500";
      case "/washing-bay/workers":
        return "bg-red-500";
      case "/washing-bay/commissions":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 z-50 supports-backdrop-blur:bg-white/60">
      {/* Navigation Bar */}
      <div className="grid grid-cols-5 h-16 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const notificationCount = getNotificationCount(item.href);
          const isItemActive = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-xs transition-all duration-200 group",
                isItemActive
                  ? `text-white ${item.activeBg}`
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              )}
            >
              {/* Active Indicator */}
              {isItemActive && (
                <div className="absolute top-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  isItemActive
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : "bg-transparent text-gray-500 group-hover:text-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse",
                      getNotificationColor(item.href)
                    )}
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isItemActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 group-hover:text-gray-800"
                )}
              >
                {item.label}
              </span>

              {/* Description */}
              <span
                className={cn(
                  "text-[9px] transition-all duration-200 opacity-0 group-hover:opacity-100 absolute -bottom-4",
                  isItemActive ? "text-blue-600 opacity-100" : "text-gray-500"
                )}
              >
                {item.description}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-xs h-full rounded-none transition-all duration-200 group",
                moreNavItems.some((item) => isActive(item.href))
                  ? "text-purple-600 bg-purple-50/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              )}
            >
              {/* Active Indicator */}
              {moreNavItems.some((item) => isActive(item.href)) && (
                <div className="absolute top-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "bg-purple-50 text-purple-600 shadow-sm"
                    : "bg-transparent text-gray-500 group-hover:text-gray-700"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 group-hover:text-gray-800"
                )}
              >
                More
              </span>

              {/* Description */}
              <span
                className={cn(
                  "text-[9px] transition-all duration-200 opacity-0 group-hover:opacity-100 absolute -bottom-4",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "text-purple-600 opacity-100"
                    : "text-gray-500"
                )}
              >
                Features
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 bg-white/95 backdrop-blur-lg supports-backdrop-blur:bg-white/95 border border-gray-200/80 shadow-xl rounded-xl"
            sideOffset={8}
          >
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                More Features
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Additional washing bay tools
              </p>
            </div>

            <DropdownMenuSeparator className="my-1" />

            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = isActive(item.href);

              return (
                <DropdownMenuItem key={item.href} asChild className="p-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isItemActive
                        ? `${item.bgColor} ${item.color} shadow-sm`
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isItemActive
                          ? "bg-white/80"
                          : "bg-gray-100 group-hover:bg-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isItemActive ? item.color : "text-gray-900"
                          )}
                        >
                          {item.label}
                        </span>
                        {isItemActive && (
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronUp
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isItemActive
                          ? "rotate-90 text-current"
                          : "rotate-0 text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                  </Link>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="my-1" />

            {/* Quick Stats */}
            <div className="px-3 py-2">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="p-1.5 bg-blue-50 rounded">
                  <p className="text-[10px] font-bold text-blue-600">
                    {
                      washOrders.filter(
                        (o) =>
                          o.status === "pending" || o.status === "in_progress"
                      ).length
                    }
                  </p>
                  <p className="text-[8px] text-blue-500">Active</p>
                </div>
                <div className="p-1.5 bg-green-50 rounded">
                  <p className="text-[10px] font-bold text-green-600">
                    {washOrders.filter((o) => o.status === "completed").length}
                  </p>
                  <p className="text-[8px] text-green-500">Completed</p>
                </div>
                <div className="p-1.5 bg-orange-50 rounded">
                  <p className="text-[10px] font-bold text-orange-600">
                    {workers.filter((w) => w.isActive).length}
                  </p>
                  <p className="text-[8px] text-orange-500">Workers</p>
                </div>
                <div className="p-1.5 bg-purple-50 rounded">
                  <p className="text-[10px] font-bold text-purple-600">
                    {
                      washOrders.filter((o) => o.paymentStatus === "credit")
                        .length
                    }
                  </p>
                  <p className="text-[8px] text-purple-500">Credit</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Safe Area Spacer for Mobile */}
      <div className="h-safe-bottom bg-transparent" />
    </div>
  );
}
