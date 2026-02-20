/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Wrench, FileText, Receipt, BarChart3, Package, MoreHorizontal, Users, Landmark, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mainNavItems = [
  { href: "/professional-hub", label: "Dashboard", icon: Wrench },
  { href: "/professional-hub/jobs", label: "Jobs", icon: Wrench },
  { href: "/professional-hub/quotes", label: "Quotes", icon: FileText },
]

const moreNavItems = [
  { href: "/professional-hub/invoices", label: "Invoices", icon: Receipt },
  { href: "/professional-hub/payments", label: "Payments", icon: Landmark },
  { href: "/professional-hub/crm", label: "Customers", icon: Users },
  { href: "/professional-hub/artisans", label: "Artisans", icon: Users },
  { href: "/professional-hub/pipeline", label: "Pipeline", icon: TrendingUp },
  { href: "/accounting", label: "Accounting", icon: Landmark },
  { href: "/professional-hub/reports", label: "Reports", icon: BarChart3 },
  { href: "/professional-hub/materials", label: "Materials", icon: Package },
  { href: "/settings?from=professional-hub", label: "Settings", icon: Settings },
]

export function ProfessionalHubBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isAuthorized = user?.role === "owner" || user?.role === "manager" || user?.role === "admin"

  const filteredMainItems = isAuthorized
    ? mainNavItems
    : [{ href: "/professional-hub/pipeline", label: "Pipeline", icon: TrendingUp }]

  const filteredMoreItems = isAuthorized
    ? moreNavItems
    : []

  const isActive = (href: string) => {
    if (href === "/professional-hub") {
      return pathname === "/professional-hub" || pathname === "/professional-hub/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className={cn("grid h-16", isAuthorized ? "grid-cols-4" : "grid-cols-1")}>
        {filteredMainItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive(item.href) ? "text-brand-primary bg-brand-primary/10" : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}

        {isAuthorized && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs h-full rounded-none",
                  moreNavItems.some((item) => isActive(item.href))
                    ? "text-brand-primary bg-brand-primary/10"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-xs">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn("flex items-center gap-2 w-full", isActive(item.href) && "bg-brand-primary/10 text-brand-primary")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
