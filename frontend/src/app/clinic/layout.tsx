"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  Phone,
  Menu,
  X,
  LogOut,
  Stethoscope,
  Activity,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClinicBottomNav } from "@/components/clinic/ClinicBottomNav";
import { SubscriptionStatusBadge } from "@/components/Subscription/SubscriptionStatusBadge";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ClinicProvider } from "@/context/ClinicContext";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, businessData, logout, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleSupportCall = () => {
    window.open("tel:0702629361");
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SubscriptionGuard>
    <ClinicProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 supports-backdrop-blur:bg-white/80">
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
                    className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 hover:bg-gray-100/80"
                  >
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Stethoscope className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <h1 className="font-semibold text-sm truncate text-gray-900">
                          {businessData?.name || "Medical Clinic"}
                        </h1>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.role || "Medical Staff"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Section - Support Info (Desktop only) */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60">
                    <Phone className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-medium">Support: 0702629361</span>
                  </div>
                </div>

                {/* Right Section - User Info & Controls */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="hidden sm:flex">
                    <SubscriptionStatusBadge />
                  </div>

                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative hover:bg-gray-100/80"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Button>

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9 hover:bg-gray-100/80"
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
                    <div className="flex items-center space-x-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[100px] font-medium">
                        {user?.firstName || "User"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{currentTime}</span>
                    </div>
                  </div>

                  {/* Online Status Badge */}
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="text-xs hidden sm:flex items-center gap-1.5 py-1.5 px-2.5"
                  >
                    {isOnline ? (
                      <Wifi className="h-3 w-3" />
                    ) : (
                      <WifiOff className="h-3 w-3" />
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
                        className="h-9 w-9 hidden sm:flex text-gray-600 hover:text-red-600 hover:bg-red-50/80"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <LogOut className="h-5 w-5" />
                          Confirm Logout
                        </DialogTitle>
                        <DialogDescription>
                          You&apos;ll need to login again to access the clinic
                          system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LogOut className="h-6 w-6 text-red-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Are you sure you want to logout from{" "}
                            <span className="font-semibold">
                              {businessData?.name}
                            </span>
                            ?
                          </p>
                          <p className="text-xs text-gray-500">
                            All unsaved changes will be lost.
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
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Mobile Support Info */}
              <div className="md:hidden mt-3 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-medium">Support: 0702629361</span>
                  </div>
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="text-xs flex items-center gap-1"
                  >
                    {isOnline ? (
                      <Wifi className="h-3 w-3" />
                    ) : (
                      <WifiOff className="h-3 w-3" />
                    )}
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
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
                className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Mobile Menu Slide-in */}
            <div
              className={cn(
                "md:hidden fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out supports-backdrop-blur:bg-white/95",
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Clinic Menu
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-9 w-9 hover:bg-gray-100/80"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="space-y-4 mb-8 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/60">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.role || "Medical Staff"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {businessData?.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge
                        variant={isOnline ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium text-gray-900">
                        {currentTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 mb-8 flex-1">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-white/80 hover:bg-gray-50/80 border-gray-200/60"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/clinic/dashboard");
                    }}
                  >
                    <Activity className="h-4 w-4 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Dashboard</div>
                      <div className="text-xs text-gray-500">
                        Clinic overview
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-white/80 hover:bg-gray-50/80 border-gray-200/60"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/clinic/settings");
                    }}
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-xs text-gray-500">
                        Clinic configuration
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-white/80 hover:bg-gray-50/80 border-gray-200/60"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/clinic/reports");
                    }}
                  >
                    <Eye className="h-4 w-4 mr-3 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Reports</div>
                      <div className="text-xs text-gray-500">
                        View analytics
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Support Section */}
                <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/60">
                  <div className="flex items-center space-x-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Need Help?
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Our medical support team is available 24/7 to assist you.
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    onClick={handleSupportCall}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>

                {/* Logout Button - Mobile */}
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-red-600 border-red-200/60 hover:bg-red-50/80 hover:text-red-700 hover:border-red-300/60"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Logout</div>
                        <div className="text-xs text-red-500">
                          Sign out of clinic
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <LogOut className="h-5 w-5" />
                        Confirm Logout
                      </DialogTitle>
                      <DialogDescription>
                        You&apos;ll need to login again to access the clinic
                        system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Are you sure you want to logout from{" "}
                          <span className="font-semibold">
                            {businessData?.name}
                          </span>
                          ?
                        </p>
                        <p className="text-xs text-gray-500">
                          All unsaved changes will be lost.
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
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
          <div className="w-full animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <ClinicBottomNav />
        </div>

        {/* Mobile Support FAB */}
        <div className="fixed bottom-24 right-4 z-30 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg animate-bounce"
            onClick={handleSupportCall}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>

        {/* Safe Area Spacer for Mobile */}
        <div className="h-safe-bottom bg-transparent" />
      </div>
    </ClinicProvider>
    </SubscriptionGuard>
  );
}
