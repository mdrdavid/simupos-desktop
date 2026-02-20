/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, RefreshCw, LogOut } from "lucide-react";

export default function PendingSubscriptionScreen() {
  const router = useRouter();
  const { logout, user, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState("Just now");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      setLastChecked(new Date().toLocaleTimeString());
      toast({
        title: "Status Updated",
        description: "Your subscription status has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh status",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContactSupport = () => {
    // Implement your contact support logic here
    // This could open an email composer, chat screen, etc.
    toast({
      title: "Contact Support",
      description: "Redirecting to support options...",
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshUser();
        setLastChecked(new Date().toLocaleTimeString());

        if (user?.currentSubscription?.status === "active") {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to refresh subscription status:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user?.currentSubscription?.status, refreshUser, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <HelpCircle className="h-20 w-20 text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Subscription Pending Approval
        </h1>

        <p className="text-gray-600 mb-8 max-w-md">
          Your subscription is being reviewed. You&apos;ll get access to all features once approved.
        </p>

        <div className="mb-6">
          {isRefreshing ? (
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          ) : (
            <div className="h-8 w-8" /> 
          )}
        </div>

        <p className="text-gray-500 text-sm">
          Last checked: {lastChecked}
        </p>
      </div>

      <div className="w-full space-y-4">
        <Button
          onClick={handleContactSupport}
          disabled={isRefreshing}
          className="w-full bg-gray-600 hover:bg-gray-700 h-14"
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          Contact Support
        </Button>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-blue-500 hover:bg-blue-600 h-14"
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5 mr-2" />
          )}
          {isRefreshing ? "Checking..." : "Refresh Status"}
        </Button>

        <Button
          onClick={handleLogout}
          disabled={isRefreshing}
          variant="destructive"
          className="w-full h-14"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}