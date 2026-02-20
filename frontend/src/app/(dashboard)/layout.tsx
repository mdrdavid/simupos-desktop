import type React from "react"
import { Suspense } from "react"
import DashboardLayoutClient from "./DashboardLayoutClient"
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubscriptionGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </Suspense>
    </SubscriptionGuard>
  )
}
