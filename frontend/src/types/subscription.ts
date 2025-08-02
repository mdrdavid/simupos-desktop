export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  maxUsers: number
  maxTransactions: number
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
  status: "active" | "inactive" | "cancelled" | "expired"
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
  plans: SubscriptionPlan[]
  currentSubscription: Subscription | null
  loading: boolean
  error: string | null
  subscribe: (planId: string, paymentMethod: string, phoneNumber?: string) => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  getCurrentUsage: () => Promise<UsageStats>
}
