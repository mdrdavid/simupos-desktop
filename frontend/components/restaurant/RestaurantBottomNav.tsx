"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ShoppingCart,
  ChefHat,
  Menu,
  BarChart3,
  Settings,
  Plus,
  Package,
  Bell,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/restaurant/dashboard", icon: Home, label: "Dashboard" },
  { href: "/restaurant/tables", icon: Users, label: "Tables" },
  { href: "/restaurant/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/restaurant/kitchen", icon: ChefHat, label: "Kitchen" },
  { href: "/restaurant/menu", icon: Menu, label: "Menu" },
];

const moreItems = [
  {
    href: "/restaurant/inventory",
    icon: Package,
    label: "Inventory",
    badge: "3",
  },
  { href: "/restaurant/reports", icon: BarChart3, label: "Reports" },
  { href: "/restaurant/settings/general", icon: Settings, label: "Settings" },
  {
    href: "/restaurant/notifications",
    icon: Bell,
    label: "Notifications",
    badge: "5",
  },
  { href: "/restaurant/staff", icon: User, label: "Staff" },
];

export function RestaurantBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) => {
    if (href === "/restaurant/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu */}
      {showMore && (
        <div className="fixed bottom-24 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-3 z-50 min-w-[160px] animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-sm font-semibold text-gray-900">
              More Options
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(false)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-1">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 group",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-1.5 py-0.5 min-w-[20px] text-center",
                      isActive(item.href)
                        ? "bg-blue-200 text-blue-800"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/75 z-30 shadow-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 relative group",
                isActive(item.href)
                  ? "text-blue-600 bg-gradient-to-b from-blue-50 to-blue-100/30 shadow-sm"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "bg-blue-100 shadow-sm"
                    : "bg-transparent group-hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActive(item.href) && "scale-110"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-blue-700"
                    : "text-gray-600 group-hover:text-gray-900"
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive(item.href) && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </Link>
          ))}

          {/* More Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-3 py-2 h-auto rounded-xl transition-all duration-200 relative group",
              showMore
                ? "text-blue-600 bg-gradient-to-b from-blue-50 to-blue-100/30 shadow-sm"
                : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                showMore
                  ? "bg-blue-100 shadow-sm"
                  : "bg-transparent group-hover:bg-gray-100"
              )}
            >
              <Plus
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showMore && "rotate-45 scale-110"
                )}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-all duration-200",
                showMore
                  ? "text-blue-700"
                  : "text-gray-600 group-hover:text-gray-900"
              )}
            >
              More
            </span>

            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm" />

            {/* Active indicator */}
            {showMore && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </Button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <Link href="/restaurant/orders/new">
        <Button
          size="lg"
          className={cn(
            "fixed bottom-28 right-4 h-16 w-16 rounded-full shadow-2xl z-30 transition-all duration-300 hover:scale-105",
            "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "border border-blue-500/20"
          )}
        >
          <div className="flex flex-col items-center gap-0.5">
            <Plus className="h-5 w-5 text-white" />
            <span className="text-[10px] font-medium text-white/90">Order</span>
          </div>

          {/* Pulsing animation */}
          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
        </Button>
      </Link>

      {/* Bottom padding for content */}
      <div className="h-24" />
    </>
  );
}
