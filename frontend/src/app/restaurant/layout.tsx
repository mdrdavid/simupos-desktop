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
  Phone,
  Menu,
  X,
  LogOut,
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
import { SubscriptionStatusBadge } from "@/components/Subscription/SubscriptionStatusBadge";
import { AppFooter } from "@/components/Footer/AppFooter";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { useState, useEffect } from "react"; // Add useEffect import
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, businessData, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(""); // Initialize as empty string

  // Mock data - replace with your actual data
  const currentBranch = { name: "Main Branch" };
  const isOnline = true;

  // Fix hydration error by using useEffect to set time only on client
  useEffect(() => {
    // Update current time on mount and every minute
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      // Use 24-hour format to avoid AM/PM differences
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime(); // Initial update

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <SubscriptionGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Mobile & Desktop */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section - Back Button & Business Info */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {businessData?.name || "Business Name"} -{" "}
                      {currentBranch?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Section - Support Info (Desktop only) */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Phone className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Support: 0702629361</span>
                </div>
              </div>

              {/* Right Section - User Info & Controls */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="hidden sm:flex">
                  <SubscriptionStatusBadge />
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>

                {/* Desktop User & Time Info */}
                <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">
                      {user?.firstName || "User"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{currentTime || "--:--"}</span> {/* Add fallback */}
                  </div>
                </div>

                {/* Online Status Badge */}
                <Badge
                  variant={isOnline ? "default" : "destructive"}
                  className="text-xs hidden sm:flex"
                >
                  {isOnline ? (
                    <Wifi className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {isOnline ? "Online" : "Offline"}
                </Badge>

                {/* Logout Button - Desktop */}
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hidden sm:flex text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-red-600" />
                        Confirm Logout
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Are you sure you want to logout from{" "}
                          {businessData?.name}?
                        </p>
                        <p className="text-xs text-gray-500">
                          You&apos;ll need to login again to access the system.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsLogoutDialogOpen(false)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLogout}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Quick View Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Recent Activity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Eye className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          No recent activity
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Mobile Support Info */}
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
                <Phone className="h-3 w-3 text-green-600" />
                <span className="font-medium">Support: 0702629361</span>
              </div>
              {/* Subscription Status - Mobile */}
              <div className="flex justify-start">
                <SubscriptionStatusBadge />
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Menu Slide-in */}
          <div
            className={cn(
              "md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-6">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentBranch?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">
                    {currentTime || "--:--"}
                  </span>{" "}
                  {/* Add fallback */}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-8">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Store className="h-4 w-4 mr-3" />
                  Business Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Eye className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
              </div>

              {/* Logout Button - Mobile */}
              <div className="mb-8">
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-red-600" />
                        Confirm Logout
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Are you sure you want to logout from{" "}
                          {businessData?.name}?
                        </p>
                        <p className="text-xs text-gray-500">
                          You&apos;ll need to login again to access the system.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsLogoutDialogOpen(false)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLogout}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Support Section */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Need Help?
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Our support team is available 24/7 to assist you.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.open("tel:0702629361")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pb-32 md:pb-24 pt-4",
          "px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        )}
      >
        <div className="w-full">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <RestaurantBottomNav />
      </div>

      {/* Footer */}
      <div className="pb-20 md:pb-0">
        <AppFooter />
      </div>

      {/* Mobile Support FAB */}
      <div className="fixed bottom-24 right-4 z-30 md:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => window.open("tel:0702629361")}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    </div>
    </SubscriptionGuard>
  );
}
