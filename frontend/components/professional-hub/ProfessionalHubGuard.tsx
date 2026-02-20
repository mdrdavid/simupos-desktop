"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, ReactNode } from "react"

interface ProfessionalHubGuardProps {
  children: ReactNode
}

export function ProfessionalHubGuard({ children }: ProfessionalHubGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthorized = user?.role === "owner" || user?.role === "manager" || user?.role === "admin"
  const isPipelinePath = pathname === "/professional-hub/pipeline"

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If not authorized and trying to access anything other than pipeline
    if (isAuthenticated && !isAuthorized && !isPipelinePath) {
      // Redirect to pipeline if they try to access other professional-hub pages
      if (pathname.startsWith("/professional-hub")) {
          router.replace("/professional-hub/pipeline")
      }
    }
  }, [user, isLoading, isAuthenticated, isAuthorized, isPipelinePath, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  // For non-authorized users, only render if it's the pipeline path
  if (isAuthenticated && !isAuthorized && !isPipelinePath && pathname.startsWith("/professional-hub")) {
    return null
  }

  return <>{children}</>
}
