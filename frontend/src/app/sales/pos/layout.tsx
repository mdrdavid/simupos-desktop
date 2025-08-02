
import { AppFooter } from "@/components/Footer/AppFooter"
import type React from "react"

export default function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}
  <AppFooter/>
  
  </div>
}
