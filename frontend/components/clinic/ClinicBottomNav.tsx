"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Stethoscope,
  Receipt,
  Pill,
  BarChart3,
  Settings,
  MoreHorizontal,
  Calendar,
  FileText,
  ChevronUp,
  Sparkles,
  FlaskConical,
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
import { useClinic } from "@/context/ClinicContext";

const mainNavItems = [
  {
    href: "/clinic/dashboard",
    icon: Home,
    label: "Dashboard",
    description: "Overview",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeBg: "bg-blue-500/10",
  },
  {
    href: "/clinic/patients",
    icon: Users,
    label: "Patients",
    description: "Manage",
    color: "text-green-600",
    bgColor: "bg-green-50",
    activeBg: "bg-green-500/10",
  },
  {
    href: "/clinic/visits",
    icon: Receipt,
    label: "Visits",
    description: "Active",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    activeBg: "bg-purple-500/10",
  },
  {
    href: "/clinic/pharmacy",
    icon: Pill,
    label: "Pharmacy",
    description: "Stock",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    activeBg: "bg-orange-500/10",
  },
];

const moreNavItems = [
  {
    href: "/clinic/laboratory",
    icon: FlaskConical,
    label: "Laboratory",
    description: "Tests & Results",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    href: "/clinic/services",
    icon: Stethoscope,
    label: "Services",
    description: "Medical services",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    href: "/clinic/reports",
    icon: BarChart3,
    label: "Reports",
    description: "Analytics",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    href: "/clinic/calendar",
    icon: Calendar,
    label: "Calendar",
    description: "Schedule",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    href: "/clinic/documents",
    icon: FileText,
    label: "Documents",
    description: "Files & records",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    href: "/clinic/settings/roles",
    icon: Settings,
    label: "Settings",
    description: "Clinic setup",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export function ClinicBottomNav() {
  const pathname = usePathname();
  const { stats, getPendingLabOrders } = useClinic();

  const isActive = (href: string) => {
    if (href === "/clinic/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getNotificationCount = (href: string) => {
    switch (href) {
      case "/clinic/pharmacy":
        return stats.lowStockMedicines > 0 ? stats.lowStockMedicines : 0;
      case "/clinic/visits":
        return stats.activeVisits > 0 ? stats.activeVisits : 0;
      case "/clinic/patients":
        return stats.todayPatients > 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  const getNotificationColor = (href: string) => {
    switch (href) {
      case "/clinic/pharmacy":
        return "bg-red-500";
      case "/clinic/visits":
        return "bg-blue-500";
      case "/clinic/patients":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get pending lab orders count for the More menu badge
  const pendingLabOrders = getPendingLabOrders().length;

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
                  ? "text-blue-600 bg-blue-50/50"
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

                {/* Laboratory Notification Badge on More Menu */}
                {pendingLabOrders > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {pendingLabOrders > 9 ? "9+" : pendingLabOrders}
                  </div>
                )}

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
                Additional clinic management tools
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
                        {/* Laboratory notification badge in dropdown */}
                        {item.href === "/clinic/laboratory" &&
                          pendingLabOrders > 0 && (
                            <div className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center ml-auto">
                              {pendingLabOrders > 9 ? "9+" : pendingLabOrders}
                            </div>
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
                    {stats.activeVisits}
                  </p>
                  <p className="text-[8px] text-blue-500">Active</p>
                </div>
                <div className="p-1.5 bg-green-50 rounded">
                  <p className="text-[10px] font-bold text-green-600">
                    {stats.todayPatients}
                  </p>
                  <p className="text-[8px] text-green-500">Today</p>
                </div>
                <div className="p-1.5 bg-red-50 rounded">
                  <p className="text-[10px] font-bold text-red-600">
                    {stats.lowStockMedicines}
                  </p>
                  <p className="text-[8px] text-red-500">Low Stock</p>
                </div>
                <div className="p-1.5 bg-pink-50 rounded">
                  <p className="text-[10px] font-bold text-pink-600">
                    {pendingLabOrders}
                  </p>
                  <p className="text-[8px] text-pink-500">Pending Lab</p>
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
