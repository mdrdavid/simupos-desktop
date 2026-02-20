"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store, User, Clock, Wifi, WifiOff, LifeBuoy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SubscriptionStatusBadge } from "@/components/Subscription/SubscriptionStatusBadge"

interface HotelHeaderProps {
  businessName?: string
  branchName?: string
  userName?: string
  isOnline?: boolean
  supportPhone?: string
}

export function HotelHeader({
  businessName = "Hotel Name",
  branchName = "Branch",
  userName = "User",
  isOnline = true,
  supportPhone = "0702629361",
}: HotelHeaderProps) {
  const router = useRouter()
  const [firstName] = userName.split(" ")

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {businessName} - {branchName}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex absolute left-1/2 transform -translate-x-1/2">
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${supportPhone}`}>
              <LifeBuoy className="h-4 w-4 mr-2" />
              Support: {supportPhone}
            </a>
          </Button>
        </div>

        {/* Mobile Support Info */}
        <div className="sm:hidden flex items-center justify-center space-x-2 text-xs text-gray-500">
          <LifeBuoy className="h-3 w-3" />
          <span>Support: {supportPhone}</span>
        </div>

        {/* Mobile Subscription Badge */}
        <div className="sm:hidden flex justify-start">
          <SubscriptionStatusBadge />
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex">
            <SubscriptionStatusBadge />
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{firstName}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="text-xs"
          >
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>
    </header>
  )
}
