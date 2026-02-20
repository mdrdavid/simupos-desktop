"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart,
  ShoppingBag,
  Plus,
  Package,
  TrendingUp,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/agro/sales/new",
    icon: ShoppingBag,
    label: "New Sale",
    activeIcon: Plus,
  },
  {
    href: "/agro/inventory",
    icon: LayoutGrid,
    label: "Inventory",
    activeIcon: Package,
  },
  {
    href: "/agro/dashboard",
    icon: BarChart,
    label: "Dashboard",
    activeIcon: TrendingUp,
  },
];

export default function AgroHubBottomNav() {
  const pathname = usePathname();

  // Support contact number
  const supportContact = "0702629361";

  const handleSupportClick = () => {
    window.location.href = `tel:${supportContact}`;
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full">
      {/* Bottom Navigation */}
      <div className="w-full h-20 bg-white/80 backdrop-blur-sm border-t border-gray-200/60 shadow-2xl">
        <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
          {links.map(({ href, icon: Icon, label, activeIcon: ActiveIcon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative inline-flex flex-col items-center justify-center px-2 group transition-all duration-300",
                  isActive
                    ? "text-teal-600"
                    : "text-gray-500 hover:text-teal-500"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                )}

                {/* Icon Container */}
                <div
                  className={cn(
                    "relative p-3 rounded-2xl transition-all duration-300 mb-1",
                    isActive
                      ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25"
                      : "bg-gray-100/80 hover:bg-teal-50 text-gray-600 group-hover:shadow-md"
                  )}
                >
                  {isActive ? (
                    <ActiveIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}

                  {/* Pulse Animation for Active State */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-300",
                    isActive
                      ? "text-teal-700 font-semibold"
                      : "text-gray-600 group-hover:text-teal-600"
                  )}
                >
                  {label}
                </span>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Safety Area for Mobile Devices */}
        <div className="h-4 bg-transparent" />
      </div>
      {/* Support Contact Banner */}
      <div className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-1 px-3 flex items-center justify-center gap-1 shadow">
        <Phone className="w-3 h-3" />
        <span className="text-xs font-medium">Need help?</span>
        <button
          onClick={handleSupportClick}
          className="ml-1 text-xs font-semibold underline underline-offset-2 hover:text-teal-100 transition-colors"
        >
          Call {supportContact}
        </button>
      </div>
    </div>
  );
}
