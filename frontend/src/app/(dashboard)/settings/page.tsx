"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SettingsIcon,
  User,
  Store,
  Users,
  CreditCard,
  Bell,
  Shield,
  Cloud,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Building2,
  GitBranch,
  Trash2,
  TrendingUp,
  ArrowLeft,
  Globe,
  Zap,
  Crown,
  Lock,
  Smartphone,
  Database,
  MessageCircle,
  Phone,
  Mail,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsStandalone } from "@/hooks/useIsStandalone";

interface SettingItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  roles?: string[];
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  category: "business" | "account" | "security" | "premium" | "support" | "app";
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { branches, currentBranch } = useBranch();
  const isStandalone = useIsStandalone();

  const fromProfessionalHub = searchParams.get("from") === "professional-hub";

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleNavigation = (href?: string) => {
    if (!href) return;
    let destination = href;
    if (fromProfessionalHub) {
      destination = `${href}?from=professional-hub`;
    }
    router.push(destination);
  };

  const allowedRoles = ["owner", "admin", "manager"];

  const settingsOptions: SettingItem[] = [
    // Business Settings
    {
      title: "Shop Details",
      subtitle: "Manage your business information and branding",
      icon: <Store className="h-5 w-5" />,
      href: "/settings/shop",
      category: "business",
    },
    {
      title: "Branch Management",
      subtitle: `Current: ${currentBranch?.name || "N/A"} • ${branches.length} total`,
      icon: <GitBranch className="h-5 w-5" />,
      href: "/settings/branches",
      roles: allowedRoles,
      category: "business",
    },
    {
      title: "Branch Performance",
      subtitle: "Compare performance across locations",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/branch-performance",
      roles: allowedRoles,
      category: "business",
    },
    {
      title: "Currency Settings",
      subtitle: "Manage currencies and exchange rates",
      icon: <Globe className="h-5 w-5" />,
      href: "/settings/currencies",
      roles: allowedRoles,
      category: "business",
    },
    {
      title: "User Management",
      subtitle: "Manage your team members and permissions",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      roles: allowedRoles,
      category: "business",
    },

    // Account Settings
    {
      title: "Profile Management",
      subtitle: "Update your personal information and preferences",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
      category: "account",
    },
    {
      title: "Notifications",
      subtitle: "Configure app and email notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/settings/notifications",
      category: "account",
    },

    // Security Settings
    {
      title: "Security & Privacy",
      subtitle: "PIN, biometric, and security settings",
      icon: <Shield className="h-5 w-5" />,
      href: "/settings/security",
      category: "security",
    },
    {
      title: "Data & Backup",
      subtitle: "Backup, sync, and manage your data",
      icon: <Cloud className="h-5 w-5" />,
      href: "/settings/backup",
      category: "security",
    },
    {
      title: "Deleted Transactions",
      subtitle: "Restore or permanently delete transactions",
      icon: <Trash2 className="h-5 w-5" />,
      href: "/settings/deleted-transactions",
      roles: ["owner"],
      badge: "Owner Only",
      badgeVariant: "outline",
      category: "security",
    },

    // Premium Features
    {
      title: "Subscription & Billing",
      subtitle: "Manage your subscription and payment methods",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/settings/subscription",
      roles: allowedRoles,
      badge: "Pro",
      badgeVariant: "default",
      category: "premium",
    },

    // Support
    {
      title: "Help & Support",
      subtitle: "Get help and contact our support team",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/settings/help",
      category: "support",
    },
    {
      title: "About SimuPOS",
      subtitle: "App version, updates, and information",
      icon: <Info className="h-5 w-5" />,
      href: "/settings/about",
      category: "support",
    },
    // App Installation
    {
      title: "Install SimuPOS App",
      subtitle: "Install on your home screen for the best experience",
      icon: <Smartphone className="h-5 w-5 text-teal-600" />,
      onClick: () => window.dispatchEvent(new CustomEvent("show-pwa-install-prompt")),
      category: "app",
    },
  ];

  const filteredSettings = settingsOptions.filter(
    (option) => {
      if (option.category === "app" && isStandalone) return false;
      if (option.roles && !option.roles.includes(user?.role || "")) return false;
      return true;
    }
  );

  const groupedSettings = filteredSettings.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, SettingItem[]>
  );

  const categoryConfig = {
    app: {
      title: "SimuPOS App",
      icon: <Smartphone className="h-5 w-5" />,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    business: {
      title: "Business Settings",
      icon: <Building2 className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    account: {
      title: "Account Settings",
      icon: <User className="h-5 w-5" />,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    security: {
      title: "Security & Data",
      icon: <Shield className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    premium: {
      title: "Premium Features",
      icon: <Crown className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    support: {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {fromProfessionalHub && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/professional-hub")}
                className="rounded-xl border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account and business preferences
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Current Branch Info */}
        <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-teal-700">
                      Current Branch
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-teal-100 text-teal-700"
                    >
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentBranch?.name || "No branch selected"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentBranch?.address || "Select a branch to get started"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("/settings/branches")}
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                Switch Branch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className="space-y-8">
          {Object.entries(groupedSettings).map(([category, items]) => {
            const config =
              categoryConfig[category as keyof typeof categoryConfig];
            return (
              <Card
                key={category}
                className="border-2 border-gray-200 shadow-lg"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    {config.title}
                  </CardTitle>
                  <CardDescription>
                    Manage your {category.toLowerCase()} preferences and
                    configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {items.map((item, index) => (
                    <div key={index}>
                      <button
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all duration-200 text-left group"
                        onClick={() =>
                          item.href
                            ? handleNavigation(item.href)
                            : item.onClick?.()
                        }
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {item.title}
                              </h3>
                              {item.badge && (
                                <Badge
                                  variant={item.badgeVariant || "secondary"}
                                  className={`text-xs ${
                                    item.badgeVariant === "default"
                                      ? "bg-gradient-to-r from-teal-600 to-teal-700"
                                      : ""
                                  }`}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                      {index < items.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Support Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Need Help?
                  </h3>
                  <p className="text-gray-600">
                    Our support team is here to assist you
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-300 text-teal-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <div className="space-y-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Card className="cursor-pointer border-red-200 hover:border-red-300 hover:shadow-md transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 text-red-600 group-hover:text-red-700">
                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-lg">Sign Out</span>
                  </div>
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-red-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <Lock className="h-5 w-5" />
                  Confirm Sign Out
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Are you sure you want to sign out? You&apos;ll need to sign in
                  again to access your account and business data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 shadow-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* App Version & Info */}
          <div className="text-center space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-teal-500" />
                <span>SimuPOS v2.1.0</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3 text-blue-500" />
                <span>Build 2024.01</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-purple-500" />
                <span>Mobile Ready</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} SimuPOS. All rights reserved. Made
              for Ugandan Businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
