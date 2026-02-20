/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/public/images/simupos.png";
import {
  LayoutDashboard,
  Package,
  Download,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  UserCheck,
  DollarSign,
  Building2,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  // Hotel,
  // Wrench,
  Leaf,
  BookLock,
  Car,
  CarFront,
  ParkingCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { Wrench } from "lucide-react";
import { useIsStandalone } from "@/hooks/useIsStandalone";

interface NavigationChild {
  name: string;
  href: string;
  isComingSoon?: boolean;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  requiredRoles?: string[];
  requiredBusinessTypes?: string[];
  allowedSubscriptionCodes?: string[]; // Add this new property
  children?: NavigationChild[];
}

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

// Base navigation for ALL users
const baseNavigation: NavigationItem[] = [
  // 🔹 Core Overview
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access dashboard
  },

  // 🔹 Sales & Cash Flow
  {
    name: "Sales",
    icon: ShoppingCart,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access sales
    children: [
      { name: "Point of Sale", href: "/sales/pos" },
      { name: "Transactions", href: "/sales/transactions" },
    ],
  },
  // {
  //   name: "Cash Register",
  //   icon: Building2,
  //   allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access cash register
  //   children: [
  //     { name: "Cash Register", href: "/cash-register" },
  //     { name: "Admin", href: "/cash-register/admin" },
  //   ],
  // },
  {
    name: "Cash Register",
    icon: Building2,
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"],
    children: [
      // { name: "Cash Register", href: "/cash-register" },
      // { name: "Admin", href: "/cash-register/admin" },
      // Add CAB Store links here
      { name: "Cash Register Dashboard", href: "/store-financials/dashboard" },
      { name: "Cash Register Transactions", href: "/store-financials/history" },
      { name: "Cash Register Reports", href: "/store-financials/reports" },
      { name: "Import", href: "/store-financials/import" },
    ],
  },
  {
    name: "Credit Management",
    icon: CreditCard,
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access credit management
    children: [
      { name: "Credit Sales", href: "/credit" },
      { name: "Payments", href: "/credit/payments" },
      { name: "Outstanding", href: "/credit/outstanding" },
    ],
  },

  // 🔹 Inventory & Supply
  {
    name: "Inventory",
    icon: Package,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access inventory
    children: [
      { name: "Stock", href: "/inventory" },
      { name: "Stores", href: "/stores" },
      { name: "Stock Transfers", href: "/inventory/transfers" },
    ],
  },
  {
    name: "Suppliers & Purchases",
    href: "/suppliers",
    icon: UserCheck,
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access suppliers
  },

  // 🔹 People
  {
    name: "Customers",
    href: "/crm",
    icon: Users,
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access customers
  },
  {
    name: "Staff",
    href: "/users",
    icon: UserCheck,
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access staff
  },

  // 🔹 Finance & Insights
  {
    name: "Expenses",
    href: "/expenses",
    icon: DollarSign,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access expenses
  },
  {
    name: "Accounting",
    icon: BookLock,
    requiredRoles: ["admin", "owner", "manager"],
    allowedSubscriptionCodes: ["business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access accounting
    children: [
      { name: "Dashboard", href: "/accounting/dashboard" },
      {
        name: "Chart of Accounts",
        href: "/accounting/chart-of-accounts",
        isComingSoon: true,
      },
      { name: "Ledger", href: "/accounting/ledger", isComingSoon: true },
      { name: "Reports", href: "/accounting/reports", isComingSoon: true },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access reports
    children: [
      { name: "Sales Reports", href: "/reports/sales" },
      { name: "Sales Log", href: "/reports/sales-log" },
      { name: "Daily Sales", href: "/reports/daily-sales" },
      { name: "Annual Summary", href: "/reports/annual-summary" },
      { name: "Inventory Reports", href: "/reports/inventory" },
      { name: "Business Intelligence", href: "/reports/business-intelligence" },
      { name: "Transaction Analysis", href: "/reports/transaction-analysis" },
      { name: "Analytics", href: "/reports/analytics" },
    ],
  },

  // 🔹 Specialized Modules
  // {
  //   name: "Hospitality",
  //   icon: Hotel,
  //   requiredBusinessTypes: ["hotel", "bar"],
  //   allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access hospitality
  //   children: [
  //     { name: "Dashboard", href: "/hotel/dashboard" },
  //     { name: "Rooms", href: "/hotel/rooms" },
  //     { name: "Bookings", href: "/hotel/bookings" },
  //     { name: "Reports", href: "/hotel/reports" },
  //     { name: "Settings", href: "/hotel/settings" },
  //   ],
  // },
  {
    name: "Agro Zone",
    icon: Leaf,
    requiredBusinessTypes: ["agro"],
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access agro
    children: [
      { name: "Products", href: "/agro/inventory" },
      { name: "New Product", href: "/agro/add" },
      { name: "New Sale", href: "/agro/sales/new" },
    ],
  },
  {
    name: "Professional Hub",
    icon: Wrench,
    requiredBusinessTypes: ["workshop"],
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"], // Kiosk CANNOT access professional hub
    children: [
      { name: "Dashboard", href: "/professional-hub" },
      { name: "Jobs", href: "/professional-hub/jobs" },
      { name: "Quotes", href: "/professional-hub/quotes" },
      { name: "Invoices", href: "/professional-hub/invoices" },
      { name: "Artisans", href: "/professional-hub/artisans" },
      { name: "Materials", href: "/professional-hub/materials" },
      { name: "Reports", href: "/professional-hub/reports" },
    ],
  },

  // 🔹 Washing Bay Module - Only for washing-bay business type
  {
    name: "Washing Bay",
    icon: Car,
    requiredBusinessTypes: ["washingbay"],
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"],
    children: [
      { name: "Dashboard", href: "/washing-bay/dashboard" },
      { name: "Orders", href: "/washing-bay/orders" },
      { name: "New Order", href: "/washing-bay/orders/new" },
      { name: "Services", href: "/washing-bay/services" },
      { name: "New Service", href: "/washing-bay/services/new" },
      { name: "Workers", href: "/washing-bay/workers" },
      { name: "Add Worker", href: "/washing-bay/workers/new" },
      {
        name: "Worker Performance",
        href: "/washing-bay/worker-performance",
      },
      { name: "Reports", href: "/washing-bay/reports" },
      { name: "Commissions", href: "/washing-bay/commissions" },
    ],
  },
  // 🔹 Night Parking Module - Only for night_parking business type
  {
    name: "Night Parking",
    icon: ParkingCircle, // You'll need to import this
    requiredBusinessTypes: ["night_parking"],
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"],
    children: [
      { name: "Dashboard", href: "/night-parking/dashboard" },
      { name: "Parking Slots", href: "/night-parking/slots" },
      { name: "Vehicle Registration", href: "/night-parking/vehicles" },
      { name: "Active Parkings", href: "/night-parking/active" },
      { name: "History", href: "/night-parking/history" },
      { name: "Billing & Reports", href: "/night-parking/reports" },
      { name: "Security Logs", href: "/night-parking/security" },
    ],
  },

  // 🔹 Washing Bay & Night Parking Combined Module
  {
    name: "Washing & Parking",
    icon: CarFront,
    requiredBusinessTypes: ["washingbay_nightparking"],
    allowedSubscriptionCodes: ["basic", "business", "Pro/Plus", "enterprise"],
    children: [
      // Washing Bay Features
      { name: "Washing Dashboard", href: "/washing-bay/dashboard" },
      { name: "Washing Orders", href: "/washing-bay/orders" },
      { name: "New Washing Order", href: "/washing-bay/orders/new" },
      { name: "Washing Services", href: "/washing-bay/services" },
      { name: "Washing Reports", href: "/washing-bay/reports" },
      { name: "Washing Workers", href: "/washing-bay/workers" },
      { name: "Washing Commissions", href: "/washing-bay/commissions" },
      // Separator
      { name: "----------", href: "#", isComingSoon: true },
      // Night Parking Features
      { name: "Parking Dashboard", href: "/night-parking/dashboard" },
      { name: "Parking Slots", href: "/night-parking/slots" },
      { name: "Vehicle Registration", href: "/night-parking/vehicles" },
      { name: "Active Parkings", href: "/night-parking/active" },
      { name: "Parking History", href: "/night-parking/history" },
      { name: "Parking Reports", href: "/night-parking/reports" },
      // Combined Features
      { name: "Combined Services", href: "/combined/services" },
      { name: "Dual Packages", href: "/combined/packages" },
      { name: "Worker Commissions", href: "/combined/commissions" },
    ],
  },
  // 🔹 System & Settings
  {
    name: "Settings",
    icon: Settings,
    allowedSubscriptionCodes: [
      "kiosk",
      "basic",
      "business",
      "Pro/Plus",
      "enterprise",
    ], // Kiosk can access settings
    children: [
      { name: "General Settings", href: "/settings" },
      { name: "Business Profile", href: "/settings/shop" },
      { name: "Subscription", href: "/settings/subscription" },
    ],
  },
];

// Kiosk-specific reports (limited reports for kiosk users)
const kioskReports: NavigationChild[] = [
  { name: "Sales Reports", href: "/reports/sales" },
  { name: "Daily Sales", href: "/reports/daily-sales" },
  { name: "Inventory Reports", href: "/reports/inventory" },
];

function SidebarContent({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currentBusiness } = useBusiness();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const isStandalone = useIsStandalone();

  const businessType = currentBusiness?.businessType;
  const userRole = user?.role;

  // Get user's subscription plan code
  const userSubscriptionCode = user?.currentSubscription?.plan?.code || "basic";
  const navigation = useMemo(() => {
    let filteredNav = baseNavigation;

    // Filter by subscription plan code first
    filteredNav = filteredNav.filter((item) => {
      if (item.allowedSubscriptionCodes) {
        return item.allowedSubscriptionCodes.includes(userSubscriptionCode);
      }
      return true;
    });

    // Filter by business type
    if (businessType) {
      filteredNav = filteredNav.filter((item) => {
        if (item.requiredBusinessTypes) {
          return item.requiredBusinessTypes.includes(businessType);
        }
        return true;
      });
    }

    // Filter by user role
    if (userRole) {
      filteredNav = filteredNav.filter((item) => {
        if (item.requiredRoles) {
          return item.requiredRoles.includes(userRole);
        }
        return true;
      });
    }

    // Special handling for kiosk users
    if (userSubscriptionCode === "kiosk") {
      // For kiosk users, further filter the navigation
      filteredNav = filteredNav.filter((item) => {
        // Only show specific modules for kiosk
        const allowedKioskModules = [
          "Dashboard",
          "Sales",
          "Inventory",
          "Expenses",
          "Staff",
          "Reports",
          "Settings",
        ];
        return allowedKioskModules.includes(item.name);
      });

      // Modify reports for kiosk users to show only specific reports
      const reportsItem = filteredNav.find((item) => item.name === "Reports");
      if (reportsItem && reportsItem.children) {
        reportsItem.children = kioskReports;
      }
    }

    // Existing business type filtering
    if (businessType === "agro") {
      filteredNav = filteredNav.filter((item) => item.name !== "Inventory");
      const sales = filteredNav.find((item) => item.name === "Sales");
      if (sales && sales.children) {
        sales.children = sales.children.filter(
          (child) => child.name === "Transactions"
        );
      }
    } else if (businessType === "workshop") {
      filteredNav = filteredNav.filter(
        (item) => item.name !== "Sales" && item.name !== "Inventory"
      );
    } else if (businessType === "pharmacy") {
      filteredNav = filteredNav.filter(
        (item) => item.name !== "Credit Management"
      );
    } else if (businessType === "salon") {
      filteredNav = filteredNav.filter((item) => item.name !== "Inventory");
    } else if (businessType === "hotel" || businessType === "bar") {
      filteredNav = filteredNav.filter(
        (item) => item.name !== "Credit Management"
      );
    } else if (businessType === "washingbay") {
      // For washing bay businesses, show only relevant modules.
      filteredNav = filteredNav.filter((item) => {
        const allowedWashingBayModules = [
          "Cash Register",
          "Customers",
          "Staff",
          "Expenses",
          "Settings",
          "Washing Bay",
        ];
        return allowedWashingBayModules.includes(item.name);
      });
    } else if (businessType === "night_parking") {
      // For night parking businesses, show only relevant modules
      filteredNav = filteredNav.filter((item) => {
        const allowedNightParkingModules = [
          "Dashboard",
          "Cash Register",
          "Customers",
          "Staff",
          "Expenses",
          "Reports",
          "Settings",
          "Night Parking",
        ];
        return allowedNightParkingModules.includes(item.name);
      });
    } else if (businessType === "washingbay_nightparking") {
      // For combined washing bay & night parking businesses
      filteredNav = filteredNav.filter((item) => {
        const allowedCombinedModules = [
          "Dashboard",
          "Cash Register",
          "Customers",
          "Staff",
          "Expenses",
          "Reports",
          "Settings",
          "Washing & Parking", // Show the combined module
        ];
        return allowedCombinedModules.includes(item.name);
      });

      // Also hide the individual Washing Bay module if it exists
      filteredNav = filteredNav.filter((item) => item.name !== "Washing Bay");
      filteredNav = filteredNav.filter((item) => item.name !== "Night Parking");
    }

    return filteredNav;
  }, [businessType, userRole, userSubscriptionCode]);

  const toggleItem = (name: string) => {
    setOpenItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div className={cn("flex h-full flex-col bg-white border-r transition-all duration-300", isCollapsed ? "w-20" : "w-64", className)}>
      <div className={cn("flex h-16 items-center border-b", isCollapsed ? "justify-center" : "px-6")}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="rounded-lg bg-primary flex items-center justify-center">
            {isCollapsed ? (
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">S</div>
            ) : (
              <Image
                src={logo}
                alt="SimuPOS Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            )}
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.name);
              const hasActiveChild = item.children.some(
                (child) => pathname === child.href
              );

              return (
                <Collapsible
                  key={item.name}
                  open={isCollapsed ? false : isOpen}
                  onOpenChange={() => !isCollapsed && toggleItem(item.name)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        isCollapsed ? "px-0 justify-center" : "",
                        (isOpen || hasActiveChild) &&
                          "bg-primary/10 text-primary"
                      )}
                      title={isCollapsed ? item.name : ""}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
                        {!isCollapsed && item.name}
                      </div>
                      {!isCollapsed && (
                        isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent className="space-y-1 pl-6 pt-1">
                      {item.children.map((child) => (
                        <div
                          key={child.href}
                          className="flex items-center justify-between"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className={cn(
                              "w-full justify-start font-normal",
                              pathname === child.href &&
                                "bg-primary text-white hover:bg-primary/90",
                              child.isComingSoon &&
                                "opacity-60 cursor-not-allowed"
                            )}
                            disabled={child.isComingSoon}
                          >
                            <Link href={child.isComingSoon ? "#" : child.href}>
                              {child.name}
                            </Link>
                          </Button>

                          {child.isComingSoon && (
                            <span className="text-xs text-muted-foreground italic pr-2">
                              (Coming Soon)
                            </span>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start font-normal",
                  isCollapsed ? "px-0 justify-center" : "",
                  pathname === item.href &&
                    "bg-primary text-white hover:bg-primary/90"
                )}
                title={isCollapsed ? item.name : ""}
              >
                <Link href={item.href!}>
                  <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      <div className={cn("border-t p-4 space-y-2", isCollapsed ? "px-2" : "")}>
        {!isStandalone && (
          <Button
            variant="outline"
            className={cn("w-full justify-start border-primary/20 text-primary hover:bg-primary/5", isCollapsed ? "px-0 justify-center" : "")}
            onClick={() =>
              window.dispatchEvent(new CustomEvent("show-pwa-install-prompt"))
            }
            title={isCollapsed ? "Install App" : ""}
          >
            <Download className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && "Install App"}
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50", isCollapsed ? "px-0 justify-center" : "")}
          onClick={logout}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>

        {/* Toggle Button for Desktop */}
        <div className="hidden lg:block pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center text-gray-500 hover:text-primary"
            onClick={onToggle}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center text-xs">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Collapse
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  return (
    <>
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 transition-all duration-300",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
        <SidebarContent
          className={className}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
        />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

