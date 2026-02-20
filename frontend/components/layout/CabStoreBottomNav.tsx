"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart,
  Plus,
  FileText,
  TrendingUp,
  History,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/store-financials/dashboard",
    icon: LayoutGrid,
    label: "Dashboard",
    activeIcon: BarChart,
  },
  {
    href: "/store-financials//records/new",
    icon: Plus,
    label: "New Record",
    activeIcon: FileText,
  },
  {
    href: "/store-financials//history",
    icon: History,
    label: "History",
    activeIcon: TrendingUp,
  },
  {
    href: "/store-financials//reports",
    icon: FileSpreadsheet,
    label: "Reports",
    activeIcon: Download,
  },
];

export default function CabStoreBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white/80 backdrop-blur-sm border-t border-gray-200/60 shadow-2xl">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {links.map(({ href, icon: Icon, label, activeIcon: ActiveIcon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative inline-flex flex-col items-center justify-center px-2 group transition-all duration-300",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={cn(
                  "relative p-3 rounded-2xl transition-all duration-300 mb-1",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100/80 hover:bg-blue-50 text-gray-600 group-hover:shadow-md"
                )}
              >
                {isActive ? (
                  <ActiveIcon className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}

                {/* Pulse Animation for Active State */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 animate-ping opacity-20" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-300",
                  isActive
                    ? "text-blue-700 font-semibold"
                    : "text-gray-600 group-hover:text-blue-600"
                )}
              >
                {label}
              </span>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </Link>
          );
        })}
      </div>

      {/* Safety Area for Mobile Devices */}
      <div className="h-4 bg-transparent" />
    </div>
  );
}
