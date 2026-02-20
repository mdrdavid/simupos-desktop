/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Interface for sales data
interface SalesData {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

// Interface for top performing products
interface TopPerformingProduct {
  name: string;
  sales: number;
  profit: number;
}

// Interface for suppliers report
interface SupplierReportData {
  name: string;
  value: number;
}

// Interface for orders report
interface OrderReportData {
  name: string;
  value: number;
}

export type FilterType = "daily" | "weekly" | "monthly" | "annual";

// Interface for the entire dashboard data structure
export interface ReportsDashboardData {
  sales: SalesData;
  totalProducts: number;
  lowStockItems: Item[];
  topPerformingProducts: TopPerformingProduct[];
  suppliersReport: SupplierReportData[];
  ordersReport: OrderReportData[];
}

// Interface for the context's value
interface ReportsDashboardContextType {
  dashboardData: ReportsDashboardData | null;
  loading: boolean;
  error: string | null;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  refetch: () => void;
}

// Create the context
const ReportsDashboardContext = createContext<
  ReportsDashboardContextType | undefined
>(undefined);

// Custom hook to use the dashboard context
export const useReportsDashboard = () => {
  const context = useContext(ReportsDashboardContext);
  if (!context) {
    throw new Error(
      "useReportsDashboard must be used within a ReportsDashboardProvider"
    );
  }
  return context;
};

// Props for the provider component
interface ReportsDashboardProviderProps {
  children: ReactNode;
}

// The provider component
export const ReportsDashboardProvider = ({
  children,
}: ReportsDashboardProviderProps) => {
  const { currentBranch } = useBranch();
  const { getAuthHeaders } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<ReportsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("daily");

  const fetchDashboardData = useCallback(
    async (selectedFilter: FilterType) => {
      if (!currentBranch) {
        setError("No branch selected");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call that uses the selectedFilter
        // const headers = await getAuthHeaders();
        // const data = await httpClient(
        //   `/dashboard/reports/branch/${currentBranch.id}?filter=${selectedFilter}`,
        //   { headers }
        // );
        // setDashboardData(data.data);

        // Mock data for now
        const mockData: ReportsDashboardData = {
          sales: {
            daily: 1200 * (selectedFilter === "daily" ? 1 : Math.random() * 10),
            weekly:
              8400 * (selectedFilter === "weekly" ? 1 : Math.random() * 10),
            monthly:
              35000 * (selectedFilter === "monthly" ? 1 : Math.random() * 10),
            annual:
              420000 * (selectedFilter === "annual" ? 1 : Math.random() * 10),
          },
          totalProducts: 500,
          lowStockItems: [
            {
              id: "1",
              name: "Product A",
              quantity: 5,
              sellingPrice: 10,
              category: "Category A",
              branchId: "1",
              isActive: true,
              productType: "retail",
            },
            {
              id: "2",
              name: "Product B",
              quantity: 3,
              sellingPrice: 20,
              category: "Category A",
              branchId: "1",
              isActive: true,
              productType: "retail",
            },
          ],
          topPerformingProducts: [
            { name: "Product C", sales: 5000, profit: 2000 },
            { name: "Product D", sales: 4500, profit: 1800 },
            { name: "Product E", sales: 4000, profit: 1600 },
            { name: "Product F", sales: 3500, profit: 1400 },
            { name: "Product G", sales: 3000, profit: 1200 },
          ].map((p) => ({ ...p, sales: p.sales * (Math.random() + 0.5) })),
          suppliersReport: [
            { name: "Supplier X", value: 10000 },
            { name: "Supplier Y", value: 8000 },
            { name: "Supplier Z", value: 12000 },
          ].map((s) => ({ ...s, value: s.value * (Math.random() + 0.5) })),
          ordersReport: [
            { name: "Jan", value: 50 },
            { name: "Feb", value: 60 },
            { name: "Mar", value: 70 },
            { name: "Apr", value: 80 },
            { name: "May", value: 90 },
          ].map((o) => ({ ...o, value: o.value * (Math.random() + 0.5) })),
        };
        setDashboardData(mockData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentBranch, getAuthHeaders]
  );

  useEffect(() => {
    fetchDashboardData(filter);
  }, [fetchDashboardData, filter]);

  const value: ReportsDashboardContextType = {
    dashboardData,
    loading,
    error,
    refetch: () => fetchDashboardData(filter),
    filter,
    setFilter,
  };

  return (
    <ReportsDashboardContext.Provider value={value}>
      {children}
    </ReportsDashboardContext.Provider>
  );
};
