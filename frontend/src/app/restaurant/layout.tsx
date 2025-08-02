"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  User,
  Clock,
  Wifi,
  WifiOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RestaurantBottomNav } from "@/components/restaurant/RestaurantBottomNav";
import { AppFooter } from "@/components/Footer/AppFooter";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Mock data - replace with your actual data
  const businessData = { name: "My Business" };
  const currentBranch = { name: "Main Branch" };
  const user = { firstName: "John", lastName: "Doe" };
  const isOnline = true;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">
                  {businessData?.name || "Business Name"} -{" "}
                  {currentBranch?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Centered Support Info */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>SimuPos Support: 0702629361</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* User and Time Info - moved to right side */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>
                {user?.firstName || "User"} {user?.lastName || ""}
              </span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>

            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3 mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 mr-1" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recent Sales</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No recent sales</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="pb-20 px-10">{children}</main>
      <RestaurantBottomNav />
      <AppFooter />
    </div>
  );
}
// "use client";

// import type React from "react";

// import { RestaurantBottomNav } from "@/components/restaurant/RestaurantBottomNav";
// import { AppFooter } from "@/components/Footer/AppFooter";

// export default function RestaurantLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <main className="pb-20">{children}</main>
//       <RestaurantBottomNav />
//        <AppFooter/>
//     </div>
//   );
// }
