import type React from "react"
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard"

export default function CashRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </SubscriptionGuard>
  )
}
