"use client"

import type React from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { AppFooter } from "@/components/Footer/AppFooter"
import { cn } from "@/lib/utils"

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const fromProfessionalHub = searchParams.get("from") === "professional-hub";
  const noSidebarPaths = ["/settings", "/profile", "/branch-performance", "/users"];
  const isNoSidebarPage = noSidebarPaths.some((path) =>
    pathname.startsWith(path)
  );

  const showSidebar = !(isNoSidebarPage && fromProfessionalHub);

  return (
    <div className={cn(
      "flex h-screen w-full bg-gray-50 overflow-hidden transition-all duration-300",
      showSidebar && (isCollapsed ? "lg:pl-20" : "lg:pl-64")
    )}>
      {showSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
        <AppFooter/>
      </div>
    </div>
  )
}
