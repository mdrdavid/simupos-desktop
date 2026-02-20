"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useBranch } from "./BranchContext";
import { useAuth } from "./AuthContext";
import { httpClient } from "@/src/data/api/httpClient";

export type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface TransactionAnalysis {
  totalRevenue: number;
  totalTransactions: number;
  paymentMethodAnalysis: Record<string, number>;
  userAnalysis: Record<string, UserAnalysis>;
}

export interface UserAnalysis {
  userId: string;
  userName: string;
  totalRevenue: number;
  totalTransactions: number;
  paymentMethodAnalysis: Record<string, number>;
  itemsSold: Array<{ name: string; quantity: number; amount: number }>;
}

interface TransactionAnalysisContextType {
  analysis: TransactionAnalysis | null;
  loading: boolean;
  error: string | null;
  getAnalysis: (branchId: string, period: Period) => Promise<void>;
}

const TransactionAnalysisContext = createContext<
  TransactionAnalysisContextType | undefined
>(undefined);

export const useTransactionAnalysis = () => {
  const context = useContext(TransactionAnalysisContext);
  if (!context) {
    throw new Error(
      "useTransactionAnalysis must be used within a TransactionAnalysisProvider"
    );
  }
  return context;
};

interface TransactionAnalysisProviderProps {
  children: ReactNode;
}

export const TransactionAnalysisProvider = ({
  children,
}: TransactionAnalysisProviderProps) => {
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  const getAnalysis = useCallback(
    async (branchId: string, period: Period) => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/analysis/branch/${branchId}?period=${period}`,
          { headers }
        );
        setAnalysis(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch transaction analysis"
        );
        console.error("Transaction analysis error:", err);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return (
    <TransactionAnalysisContext.Provider
      value={{ analysis, loading, error, getAnalysis }}
    >
      {children}
    </TransactionAnalysisContext.Provider>
  );
};
