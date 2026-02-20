"use client";

import type React from "react";
import { HotelProvider } from "@/context/HotelContext";
import { HotelBottomNav } from "@/components/hotel/HotelBottomNav";
import { HotelHeader } from "@/components/hotel/HotelHeader";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hotelData = {
    businessName: "SimuPOS Hotel",
    branchName: "Main Branch",
    userName: "Manager",
    isOnline: true,
    supportPhone: "0702629361"
  };

  return (
    <SubscriptionGuard>
    <HotelProvider>
      <div className="min-h-screen bg-gray-50">
        <HotelHeader
          businessName={hotelData.businessName}
          branchName={hotelData.branchName}
          userName={hotelData.userName}
          isOnline={hotelData.isOnline}
          supportPhone={hotelData.supportPhone}
        />
        <div className="pb-20 pt-16">{children}</div>
        <HotelBottomNav />
      </div>
    </HotelProvider>
    </SubscriptionGuard>
  );
}
