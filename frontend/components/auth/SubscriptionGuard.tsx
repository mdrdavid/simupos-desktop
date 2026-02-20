"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppLoader } from "./AppLoader";

export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, subscriptionStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth check to complete
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    const isSubscriptionPage = pathname.startsWith("/subscription");

    if (subscriptionStatus === "active") {
      if (isSubscriptionPage) {
        router.replace("/dashboard"); // If on a sub page with active sub, go to dash
      }
      return; // User has active subscription, allow access
    }

    if (subscriptionStatus === "pending") {
      if (pathname !== "/subscription/pending") {
        router.replace("/subscription/pending");
      }
      return;
    }

    if (subscriptionStatus === "expired" || subscriptionStatus === "none") {
      if (pathname !== "/subscription/plans") {
        router.replace("/subscription/plans");
      }
      return;
    }
  }, [isLoading, isAuthenticated, subscriptionStatus, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return <AppLoader />;
  }

  // If subscription is active, render children. Otherwise, show loader while redirecting.
  if (subscriptionStatus === "active") {
    return <>{children}</>;
  }

  return <AppLoader />;
};
