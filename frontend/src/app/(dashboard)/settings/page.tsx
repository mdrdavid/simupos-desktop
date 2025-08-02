"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface SettingItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  roles?: string[];
  badge?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser] = useState({
    role: "OWNER", // Mock user role
    name: "John Doe",
  });

  const [currentBranch] = useState({
    name: "Main Branch",
    address: "123 Main Street, Kampala",
  });

  const handleLogout = () => {
    // Mock logout functionality
    console.log("Logging out...");
    router.push("/login");
  };

  const allowedRoles = ["OWNER", "ADMIN", "MANAGER"];

  const settingsOptions: SettingItem[] = [
    {
      title: "Profile Management",
      subtitle: "Manage your personal and business information",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
    },
    {
      title: "Shop Details",
      subtitle: "Manage your business information",
      icon: <Store className="h-5 w-5" />,
      href: "/settings/shop",
    },
    {
      title: "Branch Management",
      subtitle: `Current: ${currentBranch.name} • 3 total`,
      icon: <Building2 className="h-5 w-5" />,
      href: "/settings/branches",
      roles: allowedRoles,
    },
    {
      title: "Subscription",
      subtitle: "Manage your subscription and billing",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/settings/subscription",
      roles: allowedRoles,
      badge: "Pro",
    },
    {
      title: "User Management",
      subtitle: "Manage your team members",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      roles: allowedRoles,
    },
    {
      title: "Notifications",
      subtitle: "Configure app notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/settings/notifications",
    },
    {
      title: "Security",
      subtitle: "PIN, biometric, and security settings",
      icon: <Shield className="h-5 w-5" />,
      href: "/settings/security",
    },
    {
      title: "Data & Backup",
      subtitle: "Backup and sync your data",
      icon: <Cloud className="h-5 w-5" />,
      href: "/settings/backup",
    },
    {
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/settings/help",
    },
    {
      title: "About",
      subtitle: "App version and information",
      icon: <Info className="h-5 w-5" />,
      href: "/settings/about",
    },
  ];

  const filteredSettings = settingsOptions.filter(
    (option) => !option.roles || option.roles.includes(currentUser.role)
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      {/* Current Branch Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-teal-600">Current Branch</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {currentBranch.name}
          </h3>
          <p className="text-sm text-gray-600">{currentBranch.address}</p>
        </CardContent>
      </Card>

      {/* Settings Options */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {filteredSettings.map((item, index) => (
            <div key={index}>
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() =>
                  item.href ? router.push(item.href) : item.onClick?.()
                }
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              {index < filteredSettings.length - 1 && (
                <div className="border-b border-gray-100 mx-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3 text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">Logout</span>
              </div>
            </CardContent>
          </Card>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* App Version */}
      <div className="text-center mt-8 space-y-2">
        <p className="text-sm text-gray-600">SimuPOS v1.0.0</p>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} SimuPOS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
