"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, ShoppingCart, ChefHat, Menu, BarChart3, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/restaurant/dashboard", icon: Home, label: "Home" },
  { href: "/restaurant/tables", icon: Users, label: "Tables" },
  { href: "/restaurant/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/restaurant/kitchen", icon: ChefHat, label: "Kitchen" },
  { href: "/restaurant/menu", icon: Menu, label: "Menu" },
]

const moreItems = [
  { href: "/restaurant/inventory", icon: BarChart3, label: "Inventory" },
  { href: "/restaurant/reports", icon: BarChart3, label: "Reports" },
  { href: "/restaurant/settings/general", icon: Settings, label: "Settings" },
]

export function RestaurantBottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* Overlay */}
      {showMore && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowMore(false)} />}

      {/* More Menu */}
      {showMore && (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg border p-2 z-50 min-w-[120px]">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMore(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                pathname === item.href ? "text-[#41A5A5] bg-[#41A5A5]/10" : "text-gray-600 hover:text-[#41A5A5]",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}

          {/* More Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 h-auto",
              showMore ? "text-[#41A5A5] bg-[#41A5A5]/10" : "text-gray-600",
            )}
          >
            <Plus className={cn("h-5 w-5 transition-transform", showMore && "rotate-45")} />
            <span className="text-xs font-medium">More</span>
          </Button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <Link href="/restaurant/orders/new">
        <Button
          size="lg"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-[#41A5A5] hover:bg-[#2E8B8B] shadow-lg z-30"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </>
  )
}
