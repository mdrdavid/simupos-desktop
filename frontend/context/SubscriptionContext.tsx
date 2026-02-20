"use client";
import { httpClient } from "@/src/data/api/httpClient";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Subscription,
  SubscriptionPlan,
  UsageStats,
  SubscriptionContextType,
} from "@/src/types/subscription";
import { toast } from "@/components/ui/use-toast";

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({
  children,
}: SubscriptionProviderProps) => {
  const { user, getAuthHeaders } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    Subscription[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();

      const plansResponse = await httpClient("/subscriptions/plans", {
        headers,
      });
      setPlans(plansResponse);

      try {
        const currentSubResponse = await httpClient("/subscriptions/current", {
          headers,
        });
        setCurrentSubscription(currentSubResponse);
      } catch (err) {
        if (err instanceof Error && err.message.includes("Not Found")) {
          setCurrentSubscription(null);
        } else {
          throw err;
        }
      }

      try {
        const historyResponse = await httpClient("/subscriptions/history", {
          headers,
        });
        setSubscriptionHistory(historyResponse || []);
      } catch (err) {
        if (err instanceof Error && err.message.includes("Not Found")) {
          setSubscriptionHistory([]);
        } else {
          throw err;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load subscription data";
      setError(errorMessage);
      console.error("Subscription data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (
    planId: string,
    paymentMethod: string,
    phoneNumber?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error("User not authenticated");
      const headers = await getAuthHeaders();
      const response = await httpClient("/subscriptions", {
        method: "POST",
        body: JSON.stringify({ planId, paymentMethod, phoneNumber }),
        headers,
      });
      setCurrentSubscription(response);
      setSubscriptionHistory((prev) => [response, ...prev]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to subscribe";
      setError(errorMessage);
      console.error("Subscription error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      if (!currentSubscription) throw new Error("No active subscription to cancel");
      const headers = await getAuthHeaders();
      const response = await httpClient(`/subscriptions/${currentSubscription.id}/cancel`, {
        method: "DELETE",
        headers,
      });
      setCurrentSubscription(response.subscription);
      setSubscriptionHistory((prev) =>
        prev.map((sub) => (sub.id === currentSubscription.id ? response.subscription : sub))
      );
      toast({ title: "Success", description: "Subscription cancelled successfully." });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renewSubscription = async (): Promise<Subscription | null> => {
    try {
      setLoading(true);
      setError(null);
      if (!currentSubscription) throw new Error("No subscription to renew");
      const headers = await getAuthHeaders();
      const response = await httpClient(`/subscriptions/${currentSubscription.id}/renew`, {
        method: "POST",
        headers,
      });
      setCurrentSubscription(response.subscription);
      setSubscriptionHistory((prev) => [response.subscription, ...prev]);
      toast({ title: "Success", description: "Subscription renewed successfully." });
      return response.subscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to renew subscription";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRenew = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      if (!currentSubscription) throw new Error("No subscription to modify");
      const headers = await getAuthHeaders();
      const response = await httpClient(`/subscriptions/${currentSubscription.id}/auto-renew`, {
        method: "PUT",
        body: JSON.stringify({ autoRenew: !currentSubscription.autoRenew }),
        headers,
      });
      setCurrentSubscription(response.subscription);
      toast({ title: "Success", description: `Auto-renewal ${response.subscription.autoRenew ? 'enabled' : 'disabled'}.` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle auto-renew";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (): number => {
    if (!currentSubscription || currentSubscription.status !== "active") return 0;
    const now = new Date();
    const endDate = new Date(currentSubscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!currentSubscription || currentSubscription.status !== "active") return false;
    return currentSubscription.features?.includes(feature) ?? false;
  };

  const getUsageStats = () => {
    if (!currentSubscription) {
      return { usersUsed: 0, transactionsUsed: 0, usersLimit: 0, transactionsLimit: 0 };
    }
    const plan = plans.find((p) => p.id === currentSubscription.planId);
    if (!plan) {
      return { usersUsed: 0, transactionsUsed: 0, usersLimit: 0, transactionsLimit: 0 };
    }
    // This should ideally come from an API
    return {
      usersUsed: 2, // Mock data
      transactionsUsed: 150, // Mock data
      usersLimit: plan.maxUsers,
      transactionsLimit: plan.maxTransactions,
    };
  };

  const getCurrentUsage = async (): Promise<UsageStats> => {
    // This is a placeholder. The logic from getUsageStats is more aligned with the mobile app's getUsageStats.
    // This function can be removed if getUsageStats is sufficient.
    await new Promise((resolve) => setTimeout(resolve, 500));
    const stats = getUsageStats();
    return {
      users: { current: stats.usersUsed, limit: stats.usersLimit },
      transactions: { current: stats.transactionsUsed, limit: stats.transactionsLimit },
      storage: { current: 0, limit: 0 }, // Storage not in mobile model
    };
  };

  const value: SubscriptionContextType = {
    plans,
    currentSubscription,
    subscriptionHistory,
    loading,
    error,
    subscribe,
    cancelSubscription,
    renewSubscription,
    toggleAutoRenew,
    getDaysRemaining,
    hasFeatureAccess,
    getUsageStats,
    getCurrentUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
