export interface SubscriptionPlan {
  id: string
  name: string
  code: string
  price: number
  features: string[]
  maxUsers: number
  maxTransactions: number
  maxItems: number
  maxLocations: number
  isPopular: boolean
  hasInventoryManagement: boolean
  hasReports: boolean
  hasMultiLocation: boolean
  hasCustomerManagement: boolean
  hasPrioritySupport: boolean
  hasApiAccess: boolean
  hasCustomBranding: boolean
  
}

export interface Subscription {
  id: string
  planId: string
  planName: string
  price: number
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string
  endDate: string
  nextBillingDate: string
  autoRenew: boolean
  paymentMethod: string
  features?: string[];
  billingHistory?: BillingRecord[]
}

export interface BillingRecord {
  id: string
  date: string
  description: string
  amount: number
  status: "paid" | "pending" | "failed"
  paymentMethod: string
}

export interface UsageStats {
  users: {
    current: number
    limit: number
  }
  transactions: {
    current: number
    limit: number
  }
  storage: {
    current: number
    limit: number
  }
}

export interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  subscriptionHistory: Subscription[];
  loading: boolean;
  error: string | null;

  // Subscription management
  subscribe: (planId: string, paymentMethod: string, phoneNumber?: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  renewSubscription: () => Promise<Subscription | null>;
  toggleAutoRenew: () => Promise<void>;

  // Utility functions
  getDaysRemaining: () => number;
  hasFeatureAccess: (feature: string) => boolean;
  getUsageStats: () => {
    usersUsed: number;
    transactionsUsed: number;
    usersLimit: number;
    transactionsLimit: number;
  };
  getCurrentUsage: () => Promise<UsageStats>;
}
