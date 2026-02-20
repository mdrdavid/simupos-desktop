"use client";

import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardUrl } from "@/src/utils/dashboardUtils";

export default function RedirectHandler() {
  const { loading } = useBusiness();
  const { businessData, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Fallback timeout to prevent being stuck on loading screen
  useEffect(() => {
    if (pathname !== "/" || hasRedirected) return;

    console.log("RedirectHandler: Starting 8s fallback timeout", {
      pathname,
    });

    const timeout = setTimeout(() => {
      if (!hasRedirected) {
        console.log("RedirectHandler: Fallback timeout triggered - forcing redirect to login");
        setHasRedirected(true);
        // Use window.location as a last resort if router.replace fails
        try {
          router.replace("/auth/login");
        } catch (e) {
          console.error("RedirectHandler: router.replace failed, using window.location", e);
          window.location.href = "/auth/login";
        }
      }
    }, 8000); // 8 seconds fallback

    return () => clearTimeout(timeout);
  }, [pathname, hasRedirected, router]);

  useEffect(() => {
    // Only run on root path and prevent multiple redirects
    if (pathname !== "/" || hasRedirected) {
      return;
    }

    console.log("RedirectHandler: Checking status", {
      authLoading,
      isAuthenticated,
      loading,
    });

    // Wait for auth loading to complete
    if (authLoading) {
      return;
    }

    // If not authenticated, go to login page immediately
    if (!isAuthenticated) {
      console.log("RedirectHandler: Not authenticated, redirecting to login");
      setHasRedirected(true);
      router.replace("/auth/login");
      return;
    }

    // Wait for business loading to complete if authenticated
    if (loading) {
      console.log("RedirectHandler: Authenticated but still loading business data");
      return;
    }

    setHasRedirected(true);

    try {
      // Fallback check
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
  }, [businessData, authLoading, loading, router, pathname, hasRedirected, isAuthenticated]);

  // Show loading state
  // Only show loading if we are still checking auth,
  // or if we are authenticated and still loading business data
  if (authLoading || (isAuthenticated && loading)) {
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

