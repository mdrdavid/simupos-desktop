"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Car,
  Receipt,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/night-parking/dashboard" },
  { icon: Car, label: "Check-in", href: "/night-parking/check-in" },
  { icon: Receipt, label: "Check-out", href: "/night-parking/check-out" },
  { icon: MapPin, label: "Slots", href: "/night-parking/slots" },
  { icon: DollarSign, label: "Pricing", href: "/night-parking/pricings" },
  { icon: FileText, label: "Records", href: "/night-parking/records" },
  { icon: AlertCircle, label: "Overdue", href: "/night-parking/overdue" },
  { icon: Users, label: "Commissions", href: "/night-parking/commissions" },
  { icon: BarChart3, label: "Reports", href: "/night-parking/reports" },
  { icon: Settings, label: "Settings", href: "/night-parking/settings" },
];

export default function NightParkingSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md border border-gray-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
          isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary rounded-xl">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Night Parking</h1>
              <p className="text-xs text-gray-500 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start mb-1 transition-all duration-200 ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary font-semibold"
                      : "text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5"
                  }`}
                  onClick={() => setIsCollapsed(true)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
