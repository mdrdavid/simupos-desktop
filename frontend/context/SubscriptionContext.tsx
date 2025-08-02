/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { SubscriptionPlan, Subscription, UsageStats, SubscriptionContextType } from "@/src/types/subscription"

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock subscription plans
  const mockPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 50000,
      features: [
        "Basic POS functionality",
        "Up to 5 users",
        "Basic inventory tracking",
        "Standard reports",
        "Email support",
      ],
      maxUsers: 5,
      maxTransactions: 1000,
      maxLocations: 1,
      isPopular: false,
      hasInventoryManagement: true,
      hasReports: true,
      hasMultiLocation: false,
      hasCustomerManagement: true,
      hasPrioritySupport: false,
      hasApiAccess: false,
      hasCustomBranding: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: 150000,
      features: [
        "Advanced POS features",
        "Up to 20 users",
        "Advanced inventory management",
        "Detailed analytics & reports",
        "Customer management",
        "Priority support",
        "Multi-location support",
      ],
      maxUsers: 20,
      maxTransactions: 5000,
      maxLocations: 5,
      isPopular: true,
      hasInventoryManagement: true,
      hasReports: true,
      hasMultiLocation: true,
      hasCustomerManagement: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      hasCustomBranding: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 300000,
      features: [
        "All Professional features",
        "Unlimited users",
        "Unlimited transactions",
        "Custom integrations",
        "API access",
        "Custom branding",
        "Dedicated support",
        "Advanced security",
      ],
      maxUsers: 0, // 0 means unlimited
      maxTransactions: 0, // 0 means unlimited
      maxLocations: 0, // 0 means unlimited
      isPopular: false,
      hasInventoryManagement: true,
      hasReports: true,
      hasMultiLocation: true,
      hasCustomerManagement: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      hasCustomBranding: true,
    },
  ]

  // Mock current subscription
  const mockCurrentSubscription: Subscription = {
    id: "sub-1",
    planId: "professional",
    planName: "Professional",
    price: 150000,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    nextBillingDate: "2024-02-01",
    autoRenew: true,
    paymentMethod: "mtn_momo",
    billingHistory: [
      {
        id: "bill-1",
        date: "2024-01-01",
        description: "Professional Plan - January 2024",
        amount: 150000,
        status: "paid",
        paymentMethod: "mtn_momo",
      },
      {
        id: "bill-2",
        date: "2023-12-01",
        description: "Professional Plan - December 2023",
        amount: 150000,
        status: "paid",
        paymentMethod: "mtn_momo",
      },
    ],
  }

  useEffect(() => {
    // Simulate loading subscription data
    const loadSubscriptionData = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setPlans(mockPlans)
        setCurrentSubscription(mockCurrentSubscription)
      } catch (err) {
        setError("Failed to load subscription data")
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionData()
  }, [])

  const subscribe = async (planId: string, paymentMethod: string, phoneNumber?: string): Promise<boolean> => {
    try {
      setLoading(true)

      // Simulate API call for subscription
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const selectedPlan = plans.find((plan) => plan.id === planId)
      if (!selectedPlan) {
        throw new Error("Plan not found")
      }

      // Create new subscription
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod,
        billingHistory: [
          {
            id: `bill-${Date.now()}`,
            date: new Date().toISOString(),
            description: `${selectedPlan.name} Plan - ${new Date().toLocaleDateString()}`,
            amount: selectedPlan.price,
            status: "paid",
            paymentMethod,
          },
        ],
      }

      setCurrentSubscription(newSubscription)
      return true
    } catch (err) {
      setError("Failed to process subscription")
      return false
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (currentSubscription) {
        setCurrentSubscription({
          ...currentSubscription,
          status: "cancelled",
          autoRenew: false,
        })
      }

      return true
    } catch (err) {
      setError("Failed to cancel subscription")
      return false
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUsage = async (): Promise<UsageStats> => {
    // Simulate API call to get current usage
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      users: {
        current: 8,
        limit: currentSubscription?.planId === "enterprise" ? 0 : 20,
      },
      transactions: {
        current: 2450,
        limit: currentSubscription?.planId === "enterprise" ? 0 : 5000,
      },
      storage: {
        current: 2.5,
        limit: currentSubscription?.planId === "enterprise" ? 0 : 10,
      },
    }
  }

  const value: SubscriptionContextType = {
    plans,
    currentSubscription,
    loading,
    error,
    subscribe,
    cancelSubscription,
    getCurrentUsage,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

// "use client";
// import { httpClient } from "@/src/data/api/httpClient";
// import {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { useAuth } from "./AuthContext";
// import {
//   Subscription,
//   SubscriptionPlan,
//   UsageStats,
// } from "@/src/types/subscription";

// // interface SubscriptionPlan {
// //   id: string;
// //   name: string;
// //   code: string;
// //   description: string;
// //   price: number;
// //   duration: number; // in days
// //   maxUsers: number;
// //   maxTransactions: number;
// //   features: string[];
// //   isPopular: boolean;
// //   isActive: boolean;
// // }

// // interface Subscription {
// //   id: string;
// //   planId: string;
// //   planName: string;
// //   startDate: string;
// //   endDate: string;
// //   status: "active" | "expired" | "cancelled" | "pending";
// //   paymentMethod: "cash" | "mtn_momo" | "airtel_money";
// //   amount: number;
// //   autoRenew: boolean;
// //   transactionId?: string;
// //   features: string[];
// // }

// interface SubscriptionContextType {
//   plans: SubscriptionPlan[];
//   currentSubscription: Subscription | null;
//   subscriptionHistory: Subscription[];
//   loading: boolean;
//   error: string | null;

//   // Subscription management
//   subscribe: (
//     planId: string,
//     paymentMethod: "cash" | "mtn_momo" | "airtel_money"
//   ) => Promise<Subscription>;
//   cancelSubscription: () => Promise<void>;
//   renewSubscription: () => Promise<Subscription>;
//   toggleAutoRenew: () => Promise<void>;

//   // Utility functions
//   getDaysRemaining: () => number;
//   hasFeatureAccess: (feature: string) => boolean;
//   getUsageStats: () => {
//     usersUsed: number;
//     transactionsUsed: number;
//     usersLimit: number;
//     transactionsLimit: number;
//   };
//   getCurrentUsage: () => Promise<UsageStats>;
//   // Admin functions
//   createPlan: (
//     planData: Omit<SubscriptionPlan, "id" | "isActive">
//   ) => Promise<SubscriptionPlan>;
//   updatePlan: (
//     id: string,
//     planData: Partial<SubscriptionPlan>
//   ) => Promise<SubscriptionPlan>;
//   deletePlan: (id: string) => Promise<void>;
//   togglePlanStatus: (id: string) => Promise<SubscriptionPlan>;
// }

// const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
//   undefined
// );

// export const useSubscription = () => {
//   const context = useContext(SubscriptionContext);
//   if (!context) {
//     throw new Error(
//       "useSubscription must be used within a SubscriptionProvider"
//     );
//   }
//   return context;
// };

// interface SubscriptionProviderProps {
//   children: ReactNode;
// }

// export const SubscriptionProvider = ({
//   children,
// }: SubscriptionProviderProps) => {
//   const { user, getAuthHeaders } = useAuth();
//   const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
//   const [currentSubscription, setCurrentSubscription] =
//     useState<Subscription | null>(null);
//   const [subscriptionHistory, setSubscriptionHistory] = useState<
//     Subscription[]
//   >([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Load initial data
//   useEffect(() => {
//     if (user) {
//       // Initial load
//       loadInitialData();

//       // Retry after 1 second in case the backend needs time to process
//       const retryTimer = setTimeout(() => {
//         if (!currentSubscription && user?.subscriptionId) {
//           loadInitialData();
//         }
//       }, 1000);

//       return () => clearTimeout(retryTimer);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   const loadInitialData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const headers = await getAuthHeaders();

//       // Always get plans
//       const plansResponse = await httpClient("/subscriptions/plans", {
//         headers,
//       });
//       setPlans(plansResponse);

//       // Get current subscription
//       try {
//         const currentSubResponse = await httpClient("/subscriptions/current", {
//           headers,
//         });
//         setCurrentSubscription(currentSubResponse);
//       } catch (err) {
//         if (err instanceof Error && err.message.includes("Not Found")) {
//           setCurrentSubscription(null);
//         } else {
//           throw err;
//         }
//       }

//       // Get subscription history
//       try {
//         const historyResponse = await httpClient("/subscriptions/history", {
//           headers,
//         });
//         setSubscriptionHistory(historyResponse || []);
//       } catch (err) {
//         if (err instanceof Error && err.message.includes("Not Found")) {
//           setSubscriptionHistory([]);
//         } else {
//           throw err;
//         }
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to load subscription data"
//       );
//       console.error("Subscription data loading error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const subscribe = async (
//     planId: string,
//     paymentMethod: "cash" | "mtn_momo" | "airtel_money"
//   ): Promise<Subscription> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!user) {
//         throw new Error("User not authenticated");
//       }

//       const headers = await getAuthHeaders();
//       const response = await httpClient("/subscriptions", {
//         method: "POST",
//         body: JSON.stringify({
//           planId,
//           paymentMethod,
//         }),
//         headers,
//       });
//       setCurrentSubscription(response);
//       setSubscriptionHistory((prev) => [response, ...prev]);

//       return response;
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to subscribe");
//       console.error("Subscription error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cancelSubscription = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!currentSubscription) {
//         throw new Error("No active subscription to cancel");
//       }

//       const headers = await getAuthHeaders();
//       const response = await httpClient(
//         `/subscriptions/${currentSubscription.id}/cancel`,
//         {
//           method: "DELETE",
//           headers,
//         }
//       );

//       setCurrentSubscription(response.subscription);
//       setSubscriptionHistory((prev) =>
//         prev.map((sub) =>
//           sub.id === currentSubscription.id ? response.subscription : sub
//         )
//       );
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to cancel subscription"
//       );
//       console.error("Cancel subscription error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renewSubscription = async (): Promise<Subscription> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!currentSubscription) {
//         throw new Error("No subscription to renew");
//       }

//       const headers = await getAuthHeaders();
//       const response = await httpClient(
//         `/subscriptions/${currentSubscription.id}/renew`,
//         {
//           method: "POST",
//           headers,
//         }
//       );

//       setCurrentSubscription(response.subscription);
//       setSubscriptionHistory((prev) => [response.subscription, ...prev]);

//       return response.subscription;
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to renew subscription"
//       );
//       console.error("Renew subscription error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAutoRenew = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!currentSubscription) {
//         throw new Error("No subscription to modify");
//       }

//       const headers = await getAuthHeaders();
//       const response = await httpClient(
//         `/subscriptions/${currentSubscription.id}/auto-renew`,
//         {
//           method: "PUT",
//           body: JSON.stringify({
//             autoRenew: !currentSubscription.autoRenew,
//           }),
//           headers,
//         }
//       );

//       setCurrentSubscription(response.subscription);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to toggle auto-renew"
//       );
//       console.error("Toggle auto-renew error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Utility functions (unchanged)
//   const getDaysRemaining = (): number => {
//     if (!currentSubscription || currentSubscription.status !== "active")
//       return 0;

//     const now = new Date();
//     const endDate = new Date(currentSubscription.endDate);
//     const diffTime = endDate.getTime() - now.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const hasFeatureAccess = (feature: string): boolean => {
//     if (!currentSubscription || currentSubscription.status !== "active")
//       return false;
//     return currentSubscription.features.includes(feature);
//   };

//   const getUsageStats = () => {
//     if (!currentSubscription) {
//       return {
//         usersUsed: 0,
//         transactionsUsed: 0,
//         usersLimit: 0,
//         transactionsLimit: 0,
//       };
//     }

//     const plan = plans.find((p) => p.id === currentSubscription.planId);
//     if (!plan) {
//       return {
//         usersUsed: 0,
//         transactionsUsed: 0,
//         usersLimit: 0,
//         transactionsLimit: 0,
//       };
//     }

//     return {
//       usersUsed: 2, // Mock data
//       transactionsUsed: 150, // Mock data
//       usersLimit: plan.maxUsers,
//       transactionsLimit: plan.maxTransactions,
//     };
//   };
//   const getCurrentUsage = async (): Promise<UsageStats> => {
//     // Simulate API call to get current usage
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     return {
//       users: {
//         current: 8,
//         limit: currentSubscription?.planId === "enterprise" ? 0 : 20,
//       },
//       transactions: {
//         current: 2450,
//         limit: currentSubscription?.planId === "enterprise" ? 0 : 5000,
//       },
//       storage: {
//         current: 2.5,
//         limit: currentSubscription?.planId === "enterprise" ? 0 : 10,
//       },
//     };
//   };

//   // Admin functions
//   const createPlan = async (
//     planData: Omit<SubscriptionPlan, "id" | "isActive">
//   ): Promise<SubscriptionPlan> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!user) {
//         throw new Error("User not authenticated");
//       }

//       const headers = await getAuthHeaders();
//       const response = await httpClient("/subscriptions/plans", {
//         method: "POST",
//         body: JSON.stringify(planData),
//         headers,
//       });

//       setPlans((prev) => [...prev, response.plan]);
//       return response.plan;
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to create plan");
//       console.error("Create plan error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePlan = async (
//     id: string,
//     planData: Partial<SubscriptionPlan>
//   ): Promise<SubscriptionPlan> => {
//     try {
//       setLoading(true);
//       setError(null);

//       const headers = await getAuthHeaders();
//       const response = await httpClient(`/subscriptions/plans/${id}`, {
//         method: "PUT",
//         body: JSON.stringify(planData),
//         headers,
//       });

//       setPlans((prev) =>
//         prev.map((plan) => (plan.id === id ? response.plan : plan))
//       );
//       return response.plan;
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to update plan");
//       console.error("Update plan error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deletePlan = async (id: string): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       const headers = await getAuthHeaders();
//       await httpClient(`/subscriptions/plans/${id}`, {
//         method: "DELETE",
//         headers,
//       });

//       setPlans((prev) => prev.filter((plan) => plan.id !== id));
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to delete plan");
//       console.error("Delete plan error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePlanStatus = async (id: string): Promise<SubscriptionPlan> => {
//     try {
//       setLoading(true);
//       setError(null);

//       const headers = await getAuthHeaders();
//       const response = await httpClient(
//         `/subscriptions/plans/${id}/toggle-status`,
//         {
//           method: "PUT",
//           headers,
//         }
//       );

//       setPlans((prev) =>
//         prev.map((plan) => (plan.id === id ? response.plan : plan))
//       );
//       return response.plan;
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to toggle plan status"
//       );
//       console.error("Toggle plan status error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const value: SubscriptionContextType = {
//     plans,
//     currentSubscription,
//     subscriptionHistory,
//     loading,
//     error,

//     // Subscription management
//     subscribe,
//     cancelSubscription,
//     renewSubscription,
//     toggleAutoRenew,

//     // Utility functions
//     getDaysRemaining,
//     hasFeatureAccess,
//     getUsageStats,
//     getCurrentUsage,
//     // Admin functions
//     createPlan,
//     updatePlan,
//     deletePlan,
//     togglePlanStatus,
//   };

//   return (
//     <SubscriptionContext.Provider value={value}>
//       {children}
//     </SubscriptionContext.Provider>
//   );
// };
