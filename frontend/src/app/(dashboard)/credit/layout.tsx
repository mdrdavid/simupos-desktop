"use client"
import { CreditProvider } from "@/context/CreditContext"
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard"
import type React from "react"

export default function CreditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubscriptionGuard>
      <CreditProvider>{children}</CreditProvider>
    </SubscriptionGuard>
  )
}
