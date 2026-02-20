"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, RefreshCw, AlertTriangle, Phone } from "lucide-react";

export default function PendingSubscriptionPage() {
  const { logout, refreshUser } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    // The SubscriptionGuard should handle the redirect if the status changes
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleContactSupport = () => {
    window.location.href = "tel:0702629361";
  };

  return (
    <div className="flex flex-col items-center text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Subscription Pending</h1>
      <p className="text-gray-600 mb-6">
        Your subscription is currently pending approval. We will notify you once
        it has been activated.
      </p>

      <div className="w-full space-y-4">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full"
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Status
        </Button>
        <Button
          onClick={handleContactSupport}
          variant="outline"
          className="w-full"
        >
          <Phone className="mr-2 h-4 w-4" />
          Contact Support - 0702629361
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
