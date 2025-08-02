"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Users, Stethoscope, Receipt, Pill, BarChart3, Settings, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mainNavItems = [
  {
    href: "/clinic/dashboard",
    icon: Home,
    label: "Dashboard",
  },
  {
    href: "/clinic/patients",
    icon: Users,
    label: "Patients",
  },
  {
    href: "/clinic/visits",
    icon: Receipt,
    label: "Visits",
  },
  {
    href: "/clinic/pharmacy",
    icon: Pill,
    label: "Pharmacy",
  },
]

const moreNavItems = [
  {
    href: "/clinic/services",
    icon: Stethoscope,
    label: "Services",
  },
  {
    href: "/clinic/reports",
    icon: BarChart3,
    label: "Reports",
  },
  {
    href: "/clinic/settings/roles",
    icon: Settings,
    label: "Settings",
  },
]

export function ClinicBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/clinic/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs h-full rounded-none",
                moreNavItems.some((item) => isActive(item.href))
                  ? "text-blue-600 bg-blue-50"
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
                    className={cn("flex items-center gap-2 w-full", isActive(item.href) && "bg-blue-50 text-blue-600")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
