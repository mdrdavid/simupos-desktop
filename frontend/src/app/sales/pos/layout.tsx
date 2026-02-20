"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
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
  Calculator,
  ShoppingCart,
  QrCode,
  LayoutDashboard,
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logo from "@/public/images/simupos.png";
import { AppFooter } from "@/components/Footer/AppFooter";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";

interface POSLayoutProps {
  children: React.ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const router = useRouter();
  const { user, businessData, logout } = useAuth();
  const isAdminOrOwner =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "manager";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Define proper function types instead of undefined
  const showCartCount = false;
  const cartItemsCount = 0;

  // Define empty functions with proper types
  const onBarcodeScan = () => {
    // This can be implemented when needed
    console.log("Barcode scan functionality");
  };

  const onQuickSale = () => {
    // This can be implemented when needed
    console.log("Quick sale functionality");
  };

  const currentBranch = { name: "Main Branch" };
  const isOnline = true;

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handler functions for the dialog buttons
  const handleCalculator = () => {
    // Implement calculator functionality
    console.log("Open calculator");
  };

  const handleViewCart = () => {
    // Implement view cart functionality
    console.log("View cart");
  };

  const handleProducts = () => {
    // Implement products functionality
    console.log("View products");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
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
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button> */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-3">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="rounded-lg flex items-center justify-center">
                        <Image
                          src={logo}
                          alt="SimuPOS Logo"
                          width={100}
                          height={60}
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Business Info */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {businessData?.name || "Business Name"} -{" "}
                          {currentBranch?.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs hidden sm:flex"
                        >
                          SimuPOS System
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Point of Sale Terminal
                      </p>
                    </div>
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
                {isAdminOrOwner && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGoToDashboard}
                    className="h-9 hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}

                {/* POS Quick Actions */}
                <div className="flex items-center space-x-1">
                  {/* Barcode Scanner Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-green-600 hover:bg-green-50"
                    onClick={onBarcodeScan}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>

                  {/* Cart Indicator */}
                  {showCartCount && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-orange-600 hover:bg-orange-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {cartItemsCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {cartItemsCount}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  )}
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
                  <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">
                      {user?.firstName || "User"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" />
                    <span>{currentTime}</span>
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
                          Are you sure you want to logout from POS?
                        </p>
                        <p className="text-xs text-gray-500">
                          Any pending transactions will be saved.
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
                      <DialogTitle>POS Quick Actions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Dashboard in Quick Actions */}
                        {isAdminOrOwner && (
                          <Button
                            variant="outline"
                            className="flex-col h-16"
                            onClick={handleGoToDashboard}
                          >
                            <LayoutDashboard className="h-5 w-5 mb-1 text-indigo-600" />
                            <span className="text-xs">Dashboard</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="flex-col h-16"
                          onClick={handleCalculator}
                        >
                          <Calculator className="h-5 w-5 mb-1" />
                          <span className="text-xs">Calculator</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-16"
                          onClick={handleViewCart}
                        >
                          <ShoppingCart className="h-5 w-5 mb-1" />
                          <span className="text-xs">Cart</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-16"
                          onClick={onQuickSale}
                        >
                          <QrCode className="h-5 w-5 mb-1" />
                          <span className="text-xs">Quick Sale</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-16"
                          onClick={handleProducts}
                        >
                          <Store className="h-5 w-5 mb-1" />
                          <span className="text-xs">Products</span>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Mobile Support Info */}
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3 text-green-600" />
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
            <div className="p-6 h-full flex flex-col">
              {/* Menu Header with Logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg flex items-center justify-center">
                    <Image
                      src={logo}
                      alt="SimuPOS Logo"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-semibold">POS Menu</h2>
                </div>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">POS Operator</p>
                    <p className="text-xs text-gray-500 truncate">
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
                    <span className="font-medium">{currentTime}</span>
                  </div>
                </div>
                {showCartCount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cart Items</span>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700"
                    >
                      {cartItemsCount}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-8 flex-1">
                {isAdminOrOwner && (
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleGoToDashboard();
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3 text-indigo-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Dashboard</div>
                      <div className="text-xs text-gray-500">
                        Business Overview
                      </div>
                    </div>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleCalculator();
                  }}
                >
                  <Calculator className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Calculator</div>
                    <div className="text-xs text-gray-500">
                      Quick calculations
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleViewCart();
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">View Cart</div>
                    <div className="text-xs text-gray-500">
                      {cartItemsCount} items
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onBarcodeScan();
                  }}
                >
                  <QrCode className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Scan Barcode
                    </div>
                    <div className="text-xs text-gray-500">
                      Quick product lookup
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onQuickSale();
                  }}
                >
                  <Store className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Quick Sale</div>
                    <div className="text-xs text-gray-500">
                      Fast checkout process
                    </div>
                  </div>
                </Button>
              </div>

              {/* Support Section */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    POS Support
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Technical support for POS system and transactions.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.open("tel:0702629361")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>

              {/* Logout Button - Mobile */}
              <div className="mt-auto">
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Logout</div>
                        <div className="text-xs text-red-500">
                          Sign out of POS
                        </div>
                      </div>
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
                          Are you sure you want to logout from POS?
                        </p>
                        <p className="text-xs text-gray-500">
                          Any pending transactions will be saved.
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

      {/* Dashboard FAB for Admin/Owner/Manager */}
      {isAdminOrOwner && (
        <div className="fixed bottom-24 right-4 z-30 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            onClick={handleGoToDashboard}
          >
            <LayoutDashboard className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Support FAB */}
      <div className="fixed bottom-4 right-4 z-30 md:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => window.open("tel:0702629361")}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>

      {/* Cart FAB - Conditionally rendered based on default values */}
      {showCartCount && cartItemsCount > 0 && (
        <div className="fixed bottom-24 left-4 z-30 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg"
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
            >
              {cartItemsCount}
            </Badge>
          </Button>
        </div>
      )}
      <AppFooter />
    </div>
    </SubscriptionGuard>
  );
}
