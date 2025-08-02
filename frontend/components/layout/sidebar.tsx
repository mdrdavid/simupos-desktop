"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    children: [
      { name: "Point of Sale", href: "/sales/pos" },
      { name: "Transactions", href: "/sales/transactions" },
      // { name: "Agro Sales", href: "/sales/agro" },
    ],
  },
  {
    name: "Inventory",
    icon: Package,
    children: [
      { name: "Products", href: "/inventory" },
      { name: "Stock Management", href: "/inventory/stock" },
      // { name: "Agro Products", href: "/inventory/agro-products" },
      { name: "Categories", href: "/inventory/categories" },
    ],
  },
  {
    name: "Agro Zone",
    icon: Package,
    children: [
      { name: "Products", href: "/agro/inventory" },
      { name: "New Product", href: "/agro/add" },
      { name: "New Sale", href: "/agro/sales/new" },
      // { name: "Categories", href: "/inventory/categories" },
    ],
  },
  {
    name: "Customers",
    href: "/crm",
    icon: Users,
  },
  {
    name: "Credit Management",
    icon: CreditCard,
    children: [
      { name: "Credit Sales", href: "/credit" },
      { name: "Payments", href: "/credit/payments" },
      { name: "Outstanding", href: "/credit/outstanding" },
    ],
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Sales Reports", href: "/reports/sales" },
      { name: "Inventory Reports", href: "/reports/inventory" },
      { name: "Profit Analysis", href: "/reports/profit" },
      { name: "Customer Analytics", href: "/reports/customers" },
    ],
  },
  {
    name: "Cash Register",
    icon: Building2,
    children: [
      { name: "Cash Register", href: "/cash-register" },
      { name: "Admin", href: "/cash-register/admin" },
    ],
  },
  //  {
  //   name: "Business",
  //   icon: Building2,
  //   children: [
  //     { name: "Business Profile", href: "/business/profile" },
  //     { name: "Branches", href: "/business/branches" },
  //     { name: "Subscription", href: "/business/subscription" },
  //   ],
  // },
  {
    name: "Users",
    href: "/users",
    icon: UserCheck,
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    icon: UserCheck,
  },

  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "Settings", href: "/settings" },
      { name: "Shop", href: "/settings/shop" },
      { name: "Subscription", href: "/settings/subscription" },
    ],
  },
];

function SidebarContent({ className }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (name: string) => {
    setOpenItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div className={cn("flex h-full flex-col bg-white border-r", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="rounded-lg bg-primary flex items-center justify-center">
            <Image
              src={logo}
              alt="SimuPOS Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </Link>
      </div>
      {/* Navigation */}
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
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.name)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        (isOpen || hasActiveChild) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-6 pt-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          "w-full justify-start font-normal",
                          pathname === child.href &&
                            "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        <Link href={child.href}>{child.name}</Link>
                      </Button>
                    ))}
                  </CollapsibleContent>
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
                  pathname === item.href &&
                    "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <Link href={item.href!}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout} // Call logout function on click
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent className={className} />
      </div>

      {/* Mobile Sidebar */}
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
