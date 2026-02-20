"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Car,
  ParkingCircle,
  BarChart3,
  // Settings,
  MoreHorizontal,
  // Calendar,
  ChevronUp,
  Sparkles,
  DollarSign,
  // Shield,
  AlertCircle,
  // CreditCard,
  // TrendingUp.
  MapPin,
  Receipt,
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
import { useNightParking } from "@/context/NightParkingContext";
import { Badge } from "../ui/badge";

const mainNavItems = [
  {
    href: "/night-parking/dashboard",
    icon: Home,
    label: "Dashboard",
    description: "Overview",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
    activeBg: "bg-brand-primary/5",
  },
  {
    href: "/night-parking/check-in",
    icon: Car,
    label: "Check-in",
    description: "Vehicles",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
    activeBg: "bg-brand-primary/5",
  },
  {
    href: "/night-parking/slots",
    icon: MapPin,
    label: "Slots",
    description: "Parking",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
    activeBg: "bg-brand-primary/5",
  },
  {
    href: "/night-parking/records",
    icon: ParkingCircle,
    label: "Records",
    description: "History",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
    activeBg: "bg-brand-primary/5",
  },
];

const moreNavItems = [
  {
    href: "/night-parking/check-out",
    icon: Receipt,
    label: "Check-out",
    description: "Vehicles",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    href: "/night-parking/pricings",
    icon: DollarSign,
    label: "Pricings",
    description: "Rates",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  // {
  //   href: "/night-parking/commissions",
  //   icon: CreditCard,
  //   label: "Commissions",
  //   description: "Payments",
  //   color: "text-cyan-400",
  //   bgColor: "bg-cyan-500/20",
  // },
  {
    href: "/night-parking/overdue",
    icon: AlertCircle,
    label: "Overdue",
    description: "Vehicles",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  // {
  //   href: "/night-parking/worker-performance",
  //   icon: TrendingUp,
  //   label: "Performance",
  //   description: "Analytics",
  //   color: "text-brand-primary",
  //   bgColor: "bg-brand-primary/10",
  // },
  {
    href: "/night-parking/reports",
    icon: BarChart3,
    label: "Reports",
    description: "Analytics",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  // {
  //   href: "/night-parking/calendar",
  //   icon: Calendar,
  //   label: "Calendar",
  //   description: "Schedule",
  //   color: "text-pink-400",
  //   bgColor: "bg-pink-500/20",
  // },
  // {
  //   href: "/night-parking/security",
  //   icon: Shield,
  //   label: "Security",
  //   description: "Monitor",
  //   color: "text-gray-400",
  //   bgColor: "bg-gray-500/20",
  // },
  // {
  //   href: "/night-parking/settings",
  //   icon: Settings,
  //   label: "Settings",
  //   description: "Setup",
  //   color: "text-gray-400",
  //   bgColor: "bg-gray-500/20",
  // },
];

export function NightParkingBottomNav() {
  const pathname = usePathname();
  const { records, slots } = useNightParking();

  const isActive = (href: string) => {
    if (href === "/night-parking/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getNotificationCount = (href: string) => {
    switch (href) {
      case "/night-parking/records":
        const activeRecords = records.filter(
          (record) => record.status === "parked" || record.status === "extended"
        ).length;
        return activeRecords > 0 ? activeRecords : 0;
      case "/night-parking/overdue":
        const overdueRecords = records.filter((record) => {
          if (record.expectedCheckOut && record.status === "parked") {
            return new Date(record.expectedCheckOut) < new Date();
          }
          return false;
        }).length;
        return overdueRecords > 0 ? overdueRecords : 0;
      case "/night-parking/check-out":
        const pendingCheckOut = records.filter(
          (record) => record.status === "parked"
        ).length;
        return pendingCheckOut > 0 ? pendingCheckOut : 0;
      default:
        return 0;
    }
  };

  const getNotificationColor = (href: string) => {
    switch (href) {
      case "/night-parking/records":
        return "bg-blue-500";
      case "/night-parking/overdue":
        return "bg-red-500";
      case "/night-parking/check-out":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAvailableSlotsCount = () => {
    return slots.filter((slot) => slot.status === "available" && slot.isActive)
      .length;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 z-50 supports-backdrop-blur:bg-white/60">
      {/* Available Slots Banner */}
      <div className="px-4 py-2 bg-brand-primary/5 border-b border-brand-primary/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-brand-primary" />
            <span className="text-gray-600 font-medium">Available Slots:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
              {getAvailableSlotsCount()} slots
            </Badge>
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
              {records.filter((r) => r.status === "parked").length} parked
            </Badge>
          </div>
        </div>
      </div>

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
                  ? `text-brand-primary ${item.activeBg}`
                  : "text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5"
              )}
            >
              {/* Active Indicator */}
              {isItemActive && (
                <div className="absolute top-0 w-full h-0.5 bg-brand-primary rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  isItemActive
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : "bg-transparent text-gray-400 group-hover:text-brand-primary"
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
                    ? "text-brand-primary font-semibold"
                    : "text-gray-500 group-hover:text-brand-primary"
                )}
              >
                {item.label}
              </span>

              {/* Description */}
              <span
                className={cn(
                  "text-[9px] transition-all duration-200 opacity-0 group-hover:opacity-100 absolute -bottom-4",
                  isItemActive ? "text-brand-primary opacity-100" : "text-gray-400"
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
                  ? "text-brand-primary bg-brand-primary/5"
                  : "text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5"
              )}
            >
              {/* Active Indicator */}
              {moreNavItems.some((item) => isActive(item.href)) && (
                <div className="absolute top-0 w-full h-0.5 bg-brand-primary rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                    : "bg-transparent text-gray-400 group-hover:text-brand-primary"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "text-brand-primary font-semibold"
                    : "text-gray-500 group-hover:text-brand-primary"
                )}
              >
                More
              </span>

              {/* Description */}
              <span
                className={cn(
                  "text-[9px] transition-all duration-200 opacity-0 group-hover:opacity-100 absolute -bottom-4",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "text-brand-primary opacity-100"
                    : "text-gray-400"
                )}
              >
                Features
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 bg-white backdrop-blur-lg border border-gray-200 shadow-xl rounded-xl"
            sideOffset={8}
          >
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                More Features
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Additional parking tools
              </p>
            </div>

            <DropdownMenuSeparator className="my-1 bg-gray-100" />

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
                        : "text-gray-600 hover:bg-gray-50 hover:text-brand-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isItemActive
                          ? "bg-white/50"
                          : "bg-gray-100 group-hover:bg-brand-primary/10"
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
                          : "rotate-0 text-gray-400 group-hover:text-brand-primary"
                      )}
                    />
                  </Link>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="my-1 bg-gray-100" />

            {/* Quick Stats */}
            <div className="px-3 py-2">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="p-1.5 bg-brand-primary/5 rounded border border-brand-primary/10">
                  <p className="text-[10px] font-bold text-brand-primary">
                    {records.filter((r) => r.status === "parked").length}
                  </p>
                  <p className="text-[8px] text-brand-primary">Parked</p>
                </div>
                <div className="p-1.5 bg-gray-50 rounded border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-700">
                    {records.filter((r) => r.status === "checked_out").length}
                  </p>
                  <p className="text-[8px] text-gray-500">Out</p>
                </div>
                <div className="p-1.5 bg-red-50 rounded border border-red-100">
                  <p className="text-[10px] font-bold text-red-600">
                    {
                      records.filter((r) => {
                        if (r.expectedCheckOut && r.status === "parked") {
                          return new Date(r.expectedCheckOut) < new Date();
                        }
                        return false;
                      }).length
                    }
                  </p>
                  <p className="text-[8px] text-red-500">Overdue</p>
                </div>
                <div className="p-1.5 bg-brand-primary/5 rounded border border-brand-primary/10">
                  <p className="text-[10px] font-bold text-brand-primary">
                    {getAvailableSlotsCount()}
                  </p>
                  <p className="text-[8px] text-brand-primary">Slots</p>
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
