"use client";

import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardUrl } from "@/src/utils/dashboardUtils";

export default function RedirectHandler() {
  const { loading } = useBusiness();
  const { businessData, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only run on root path and prevent multiple redirects
    if (pathname !== "/" || hasRedirected) {
      return;
    }

    // Wait for loading to complete
    if (authLoading || loading) {
      return;
    }

    setHasRedirected(true);

    try {
      // If not authenticated, go to login page
      if (!businessData) {
        router.replace("/auth/login");
        return;
      }

      // Extract business type
      const businessType =
        businessData.businessType ||
        businessData.type ||
        businessData.business_type ||
        "";

      // Get the correct dashboard URL based on business type
      const dashboardUrl = getDashboardUrl(businessType);
      
      // Redirect to the appropriate dashboard using replace to avoid history issues
      router.replace(dashboardUrl);
    } catch (error) {
      console.error("Error during redirect:", error);
      router.replace("/auth/login");
    }
  }, [businessData, authLoading, loading, router, pathname, hasRedirected]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

