/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useBranch } from "./BranchContext";
import { useAuth } from "./AuthContext";
import { Item } from "./DataContext";

// Interface for a single transaction
interface Transaction {
  id: string;
  amount: number;
  customer: {
    name: string;
  };
  timestamp: string;
  items: any[];
  paymentMethod: string;
}

// Interface for weekly sales data
interface WeeklySale {
  date: string;
  total: number;
}

// Interface for the entire dashboard data structure
export interface DashboardData {
  todaysSales: number;
  todaysTransactions: number;
  totalProducts: number;
  totalCustomers: number;
  weeklySales: WeeklySale[];
  recentTransactions: Transaction[];
  lowStockItems: Item[];
}

// Interface for the context's value
interface DashboardContextType {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

// Props for the provider component
interface DashboardProviderProps {
  children: ReactNode;
}

// The provider component
export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const { currentBranch } = useBranch();
  const { getAuthHeaders } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentBranch) {
      setError("No branch selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const data = await httpClient(
        `/dashboard/branch/${currentBranch.id}`,
        { headers }
      );
      setDashboardData(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [currentBranch, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const value: DashboardContextType = {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
