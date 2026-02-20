"use client";

import {
  Bell,
  User,
  ChevronDown,
  Building2,
  Search,
  MapPin,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { useBranch } from "@/context/BranchContext";
import Link from "next/link";
import { SubscriptionStatusBadge } from "@/components/Subscription/SubscriptionStatusBadge";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({
  title = "Dashboard",
  showSearch = false,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { currentBusiness } = useBusiness();
  const { currentBranch, branches, selectBranch } = useBranch();
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  // const isStandalone = useIsStandalone();

  // Check if user is owner
  const isOwner = user?.role?.toLowerCase() === "owner";

  useEffect(() => {
    // Update time immediately and set interval
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }
  }, [searchQuery, onSearchChange]);

  const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setCurrentTime(timeString);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    const roleColors: Record<string, string> = {
      owner: "from-purple-500 to-purple-600",
      admin: "from-red-500 to-red-600",
      manager: "from-teal-500 to-teal-600",
      cashier: "from-blue-500 to-blue-600",
      artisan: "from-orange-500 to-orange-600",
      accountant: "from-slate-500 to-slate-600",
      sales_rep: "from-green-500 to-green-600",
    };
    return roleColors[role?.toLowerCase() || ""] || "from-gray-500 to-gray-600";
  };

  return (
    <header
      className={`
      sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 
      transition-all duration-300 ease-in-out
      ${isScrolled ? "shadow-lg border-gray-200/80" : "shadow-sm border-gray-200/60"}
    `}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button with improved design */}
        <div className="lg:hidden">
          <Sidebar />
        </div>

        {/* Desktop Sidebar Toggle */}
        <div className="hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-primary transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Logo/Brand area - Enhanced with better visual hierarchy */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden md:flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 lg:text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                {title}
              </h1>
              {/* Show both business AND branch information */}
              <div className="flex items-center gap-3 mt-1">
                {/* Business Info */}
                {currentBusiness?.name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium truncate max-w-[150px]">
                      {currentBusiness.name}
                      {currentBusiness.businessType && (
                        <span className="text-gray-500 ml-1 capitalize">
                          • {currentBusiness.businessType.replace(/_/g, " ")}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Separator */}
                {currentBusiness && currentBranch && (
                  <div className="text-gray-300">|</div>
                )}

                {/* Branch Info */}
                {currentBranch && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-600 font-medium truncate max-w-[120px]">
                      {currentBranch.name}
                      {currentBranch.isMain && (
                        <Badge
                          variant="outline"
                          className="ml-1 text-xs px-1 py-0 h-4"
                        >
                          Main
                        </Badge>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile title only */}
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h1>
            {/* Mobile business and branch info */}
            <div className="flex items-center gap-2 mt-1">
              {/* Business Info */}
              {currentBusiness?.name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 truncate max-w-[100px]">
                    {currentBusiness.name}
                  </span>
                </div>
              )}

              {/* Branch Info */}
              {currentBranch && (
                <>
                  <div className="text-gray-300 text-xs">•</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-600 truncate max-w-[80px]">
                      {currentBranch.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Conditionally rendered */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9 w-full bg-gray-50/80 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Current Time Display - Enhanced */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-xl border border-gray-200/60 shadow-sm">
            <div className="relative">
              <svg
                className="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 font-mono bg-white/50 px-1.5 py-0.5 rounded">
              {currentTime}
            </span>
          </div>

          {/* Branch Switcher - Only show for owners with multiple branches */}
          {isOwner && branches.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex items-center gap-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700"
                >
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {currentBranch?.name || "Select Branch"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Switch Branch
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {branches.map((branch) => (
                  <DropdownMenuItem
                    key={branch.id}
                    onClick={() => selectBranch(branch.id)}
                    className={`flex items-center justify-between ${
                      currentBranch?.id === branch.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">{branch.name}</span>
                    </div>
                    {branch.isMain && (
                      <Badge variant="secondary" className="text-xs">
                        Main
                      </Badge>
                    )}
                    {currentBranch?.id === branch.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications with improved visual hierarchy */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 transition-all duration-200 rounded-xl group"
                >
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="sr-only">Notifications</span>
                </Button>
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg animate-pulse">
                  3
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 shadow-xl border-gray-200/80 backdrop-blur-md bg-white/95"
            >
              <DropdownMenuLabel className="flex items-center justify-between p-4">
                <span className="font-bold text-gray-900">Notifications</span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-700"
                >
                  3 new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-blue-50/50 transition-colors p-4 border-l-2 border-l-blue-500">
                  <div className="flex items-start w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <p className="text-sm font-semibold text-gray-900">
                          Low stock alert
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        Rice (50kg) is running low - only 5 bags remaining
                      </p>
                      <span className="text-xs text-blue-600 font-medium mt-1">
                        2 minutes ago
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-green-50/50 transition-colors p-4 border-l-2 border-l-green-500">
                  <div className="flex items-start w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <p className="text-sm font-semibold text-gray-900">
                          New customer
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        John Doe just registered as a new customer
                      </p>
                      <span className="text-xs text-green-600 font-medium mt-1">
                        1 hour ago
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-green-50/50 transition-colors p-4 border-l-2 border-l-green-500">
                  <div className="flex items-start w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <p className="text-sm font-semibold text-gray-900">
                          Payment received
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        UGX 150,000 payment received from Jane Smith
                      </p>
                      <span className="text-xs text-green-600 font-medium mt-1">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-semibold cursor-pointer hover:bg-gray-50 transition-colors py-3">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Subscription Status */}
          <div className="hidden sm:block">
            <SubscriptionStatusBadge />
          </div>

          {/* User menu with enhanced profile display */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100 transition-all duration-200 rounded-xl px-3 py-2 group"
              >
                <div
                  className={`h-8 w-8 rounded-xl bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  <span className="text-xs font-bold text-white">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                    {user?.firstName || "User"} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase().replace("_", " ") || "Staff"}
                  </p>
                  {/* Show business and branch in user menu */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {currentBusiness && (
                      <span className="text-xs text-gray-400 truncate flex items-center gap-0.5">
                        <Building2 className="h-2.5 w-2.5" />
                        {currentBusiness.name}
                      </span>
                    )}
                    {currentBusiness && currentBranch && (
                      <span className="text-xs text-gray-400 mx-1">•</span>
                    )}
                    {currentBranch && (
                      <span className="text-xs text-gray-400 truncate flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {currentBranch.name}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 shadow-xl border-gray-200/80 backdrop-blur-md bg-white/95"
            >
              {/* Enhanced profile header */}
              <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center shadow-md`}
                >
                  <span className="text-sm font-bold text-white">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.firstName || "User"} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {user?.role?.toLowerCase().replace("_", " ") || "Staff"}
                  </p>
                  {/* Show business and branch in profile */}
                  {currentBusiness && (
                    <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {currentBusiness.name}
                      {currentBusiness.businessType && (
                        <span className="text-xs text-gray-500 ml-1 capitalize">
                          ({currentBusiness.businessType.replace(/_/g, " ")})
                        </span>
                      )}
                    </p>
                  )}
                  {currentBranch && (
                    <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {currentBranch.name}
                      {currentBranch.isMain && (
                        <span className="text-xs text-orange-500 ml-1">
                          • Main
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <DropdownMenuLabel className="text-xs font-semibold text-gray-400 pt-3 px-4">
                Account
              </DropdownMenuLabel>

              <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
                <Link
                  href="/profile"
                  className="w-full flex items-center space-x-3"
                >
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Profile
                    </span>
                    <p className="text-xs text-gray-500">
                      View and edit your profile
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
                <Link
                  href="/settings"
                  className="w-full flex items-center space-x-3"
                >
                  <div className="p-1.5 bg-gray-50 rounded-lg">
                    <svg
                      className="h-4 w-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Settings
                    </span>
                    <p className="text-xs text-gray-500">
                      Manage your preferences
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>

              {/* Only show Switch Branch menu item for owners */}
              {isOwner && (
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer px-4 py-2.5"
                >
                  <Link
                    href="/branches"
                    className="w-full flex items-center space-x-3"
                  >
                    <div className="p-1.5 bg-green-50 rounded-lg">
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Switch Branch
                      </span>
                      <p className="text-xs text-gray-500">
                        Change active branch
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 cursor-pointer flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50/50 transition-colors"
                onClick={logout}
              >
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <svg
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium">Sign out</span>
                  <p className="text-xs text-red-500">
                    Log out of your account
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar - Conditionally rendered */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-9 w-full bg-gray-50/80 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
      )}
    </header>
  );
}

// "use client";

// import { Bell, User, ChevronDown, Building2, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { Sidebar } from "./sidebar";
// import { useAuth } from "@/context/AuthContext";
// import { useBusiness } from "@/context/BusinessContext";
// import Link from "next/link";
// import { SubscriptionStatusBadge } from "@/components/Subscription/SubscriptionStatusBadge";
// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";

// interface HeaderProps {
//   title?: string;
//   showSearch?: boolean;
//   onSearchChange?: (value: string) => void;
// }

// export function Header({
//   title = "Dashboard",
//   showSearch = false,
//   onSearchChange,
// }: HeaderProps) {
//   const { user, logout } = useAuth();
//   const { currentBusiness } = useBusiness();
//   const [currentTime, setCurrentTime] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     // Update time immediately and set interval
//     updateTime();
//     const interval = setInterval(updateTime, 1000);

//     // Handle scroll effect
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   useEffect(() => {
//     if (onSearchChange) {
//       onSearchChange(searchQuery);
//     }
//   }, [searchQuery, onSearchChange]);

//   const updateTime = () => {
//     const now = new Date();
//     const timeString = now.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//     setCurrentTime(timeString);
//   };

//   const getInitials = (firstName?: string, lastName?: string) => {
//     if (!firstName && !lastName) return "U";
//     return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
//   };

//   const getRoleColor = (role?: string) => {
//     const roleColors: Record<string, string> = {
//       owner: "from-purple-500 to-purple-600",
//       admin: "from-red-500 to-red-600",
//       manager: "from-teal-500 to-teal-600",
//       cashier: "from-blue-500 to-blue-600",
//       artisan: "from-orange-500 to-orange-600",
//       accountant: "from-slate-500 to-slate-600",
//       sales_rep: "from-green-500 to-green-600",
//     };
//     return roleColors[role?.toLowerCase() || ""] || "from-gray-500 to-gray-600";
//   };

//   return (
//     <header
//       className={`
//       sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80
//       transition-all duration-300 ease-in-out
//       ${isScrolled ? "shadow-lg border-gray-200/80" : "shadow-sm border-gray-200/60"}
//     `}
//     >
//       <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
//         {/* Mobile menu button with improved design */}
//         <div className="lg:hidden">
//           <Sidebar />
//         </div>

//         {/* Logo/Brand area - Enhanced with better visual hierarchy */}
//         <div className="flex items-center gap-3 flex-1 min-w-0">
//           <div className="hidden md:flex items-center gap-3">
//             <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
//               <Building2 className="h-4 w-4 text-white" />
//             </div>
//             <div className="flex flex-col">
//               <h1 className="text-lg font-bold text-gray-900 lg:text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
//                 {title}
//               </h1>
//               {currentBusiness?.name && (
//                 <div className="flex items-center gap-1.5">
//                   <Building2 className="h-3 w-3 text-gray-500" />
//                   <span className="text-xs text-gray-600 font-medium truncate max-w-[200px]">
//                     {currentBusiness.name}
//                     {currentBusiness.businessType && (
//                       <span className="text-gray-500 ml-1 capitalize">
//                         • {currentBusiness.businessType.replace(/_/g, " ")}
//                       </span>
//                     )}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile title only */}
//           <div className="md:hidden">
//             <h1 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//               {title}
//             </h1>
//           </div>
//         </div>

//         {/* Search Bar - Conditionally rendered */}
//         {showSearch && (
//           <div className="hidden md:flex flex-1 max-w-md mx-4">
//             <div className="relative w-full">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 pr-4 h-9 w-full bg-gray-50/80 border-gray-200 focus:bg-white transition-colors"
//               />
//             </div>
//           </div>
//         )}

//         {/* Right side actions */}
//         <div className="flex items-center gap-2">
//           {/* Current Time Display - Enhanced */}
//           <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-xl border border-gray-200/60 shadow-sm">
//             <div className="relative">
//               <svg
//                 className="h-4 w-4 text-gray-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
//             </div>
//             <span className="text-sm font-semibold text-gray-700 font-mono bg-white/50 px-1.5 py-0.5 rounded">
//               {currentTime}
//             </span>
//           </div>

//           {/* Notifications with improved visual hierarchy */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <div className="relative">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="relative hover:bg-gray-100 transition-all duration-200 rounded-xl group"
//                 >
//                   <div className="relative">
//                     <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
//                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
//                   </div>
//                   <span className="sr-only">Notifications</span>
//                 </Button>
//                 <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg animate-pulse">
//                   3
//                 </Badge>
//               </div>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               align="end"
//               className="w-80 shadow-xl border-gray-200/80 backdrop-blur-md bg-white/95"
//             >
//               <DropdownMenuLabel className="flex items-center justify-between p-4">
//                 <span className="font-bold text-gray-900">Notifications</span>
//                 <Badge
//                   variant="secondary"
//                   className="text-xs bg-blue-100 text-blue-700"
//                 >
//                   3 new
//                 </Badge>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <div className="max-h-96 overflow-y-auto">
//                 <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-blue-50/50 transition-colors p-4 border-l-2 border-l-blue-500">
//                   <div className="flex items-start w-full">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                         <p className="text-sm font-semibold text-gray-900">
//                           Low stock alert
//                         </p>
//                       </div>
//                       <p className="text-xs text-gray-600">
//                         Rice (50kg) is running low - only 5 bags remaining
//                       </p>
//                       <span className="text-xs text-blue-600 font-medium mt-1">
//                         2 minutes ago
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-green-50/50 transition-colors p-4 border-l-2 border-l-green-500">
//                   <div className="flex items-start w-full">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
//                         <p className="text-sm font-semibold text-gray-900">
//                           New customer
//                         </p>
//                       </div>
//                       <p className="text-xs text-gray-600">
//                         John Doe just registered as a new customer
//                       </p>
//                       <span className="text-xs text-green-600 font-medium mt-1">
//                         1 hour ago
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-pointer hover:bg-green-50/50 transition-colors p-4 border-l-2 border-l-green-500">
//                   <div className="flex items-start w-full">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
//                         <p className="text-sm font-semibold text-gray-900">
//                           Payment received
//                         </p>
//                       </div>
//                       <p className="text-xs text-gray-600">
//                         UGX 150,000 payment received from Jane Smith
//                       </p>
//                       <span className="text-xs text-green-600 font-medium mt-1">
//                         2 hours ago
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuItem>
//               </div>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="justify-center text-primary font-semibold cursor-pointer hover:bg-gray-50 transition-colors py-3">
//                 View all notifications
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Subscription Status */}
//           <div className="hidden sm:block">
//             <SubscriptionStatusBadge />
//           </div>

//           {/* User menu with enhanced profile display */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 className="flex items-center space-x-2 hover:bg-gray-100 transition-all duration-200 rounded-xl px-3 py-2 group"
//               >
//                 <div
//                   className={`h-8 w-8 rounded-xl bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
//                 >
//                   <span className="text-xs font-bold text-white">
//                     {getInitials(user?.firstName, user?.lastName)}
//                   </span>
//                 </div>
//                 <div className="hidden lg:block text-left min-w-0">
//                   <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
//                     {user?.firstName || "User"} {user?.lastName || ""}
//                   </p>
//                   <p className="text-xs text-gray-500 capitalize">
//                     {user?.role?.toLowerCase().replace("_", " ") || "Staff"}
//                   </p>
//                 </div>
//                 <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               align="end"
//               className="w-64 shadow-xl border-gray-200/80 backdrop-blur-md bg-white/95"
//             >
//               {/* Enhanced profile header */}
//               <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
//                 <div
//                   className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center shadow-md`}
//                 >
//                   <span className="text-sm font-bold text-white">
//                     {getInitials(user?.firstName, user?.lastName)}
//                   </span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-bold text-gray-900 truncate">
//                     {user?.firstName || "User"} {user?.lastName || ""}
//                   </p>
//                   <p className="text-xs text-gray-500 capitalize truncate">
//                     {user?.role?.toLowerCase().replace("_", " ") || "Staff"}
//                   </p>
//                   {currentBusiness?.name && (
//                     <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1">
//                       <Building2 className="h-3 w-3" />
//                       {currentBusiness.name}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <DropdownMenuLabel className="text-xs font-semibold text-gray-400 pt-3 px-4">
//                 Account
//               </DropdownMenuLabel>

//               <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
//                 <Link
//                   href="/profile"
//                   className="w-full flex items-center space-x-3"
//                 >
//                   <div className="p-1.5 bg-blue-50 rounded-lg">
//                     <User className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Profile
//                     </span>
//                     <p className="text-xs text-gray-500">
//                       View and edit your profile
//                     </p>
//                   </div>
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
//                 <Link
//                   href="/settings"
//                   className="w-full flex items-center space-x-3"
//                 >
//                   <div className="p-1.5 bg-gray-50 rounded-lg">
//                     <svg
//                       className="h-4 w-4 text-gray-600"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Settings
//                     </span>
//                     <p className="text-xs text-gray-500">
//                       Manage your preferences
//                     </p>
//                   </div>
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
//                 <Link
//                   href="/branches"
//                   className="w-full flex items-center space-x-3"
//                 >
//                   <div className="p-1.5 bg-green-50 rounded-lg">
//                     <svg
//                       className="h-4 w-4 text-green-600"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Switch Branch
//                     </span>
//                     <p className="text-xs text-gray-500">
//                       Change active branch
//                     </p>
//                   </div>
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem
//                 className="text-red-600 cursor-pointer flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50/50 transition-colors"
//                 onClick={logout}
//               >
//                 <div className="p-1.5 bg-red-50 rounded-lg">
//                   <svg
//                     className="h-4 w-4 text-red-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium">Sign out</span>
//                   <p className="text-xs text-red-500">
//                     Log out of your account
//                   </p>
//                 </div>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Mobile Search Bar - Conditionally rendered */}
//       {showSearch && (
//         <div className="md:hidden px-4 pb-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 pr-4 h-9 w-full bg-gray-50/80 border-gray-200 focus:bg-white transition-colors"
//             />
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }
