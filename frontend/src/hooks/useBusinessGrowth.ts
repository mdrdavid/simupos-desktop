/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import { httpClient } from "@/src/data/api/httpClient";
import {
  CapitalTransaction,
  DashboardData,
  GrowthReport,
  BusinessGrowthSettings,
} from "@/src/types/business-growth";

export const useBusinessGrowth = () => {
  const { currentBranch } = useBranch();
  const { getAuthHeaders } = useAuth();
  const branchId = currentBranch?.id;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getFinancialYearSettings = useCallback(
    async (year?: number): Promise<BusinessGrowthSettings | null> => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        if (year) params.append("year", year.toString());
        const response = await httpClient(
          `/business-growth/branch/${branchId}/financial-year-settings?${params.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial year settings.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const setOpeningCapital = useCallback(
    async (
      openingCapital: number,
      financialYearStart: Date,
      financialYearEnd: Date
    ): Promise<BusinessGrowthSettings | null> => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/opening-capital`,
          {
            method: "POST",
            body: JSON.stringify({
              openingCapital,
              financialYearStart: financialYearStart.toISOString(),
              financialYearEnd: financialYearEnd.toISOString(),
            }),
            headers,
          }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to set opening capital.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const recordCapitalTransaction = useCallback(
    async (
      transactionData: Partial<CapitalTransaction>
    ): Promise<CapitalTransaction | null> => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/capital-transactions`,
          {
            method: "POST",
            body: JSON.stringify(transactionData),
            headers,
          }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to record capital transaction.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getCapitalTransactions = useCallback(
    async (filters?: {
      startDate?: Date;
      endDate?: Date;
      type?: "injection" | "withdrawal";
      page?: number;
      limit?: number;
    }): Promise<{
      transactions: CapitalTransaction[];
      pagination: any;
    } | null> => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        if (filters?.startDate)
          params.append("startDate", filters.startDate.toISOString());
        if (filters?.endDate)
          params.append("endDate", filters.endDate.toISOString());
        if (filters?.type) params.append("type", filters.type);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());
        const response = await httpClient(
          `/business-growth/branch/${branchId}/capital-transactions?${params.toString()}`,
          { headers }
        );
        // This endpoint doesn't wrap in 'data', so we return the whole response
        return response || { transactions: [], pagination: {} };
      } catch (err: any) {
        setError(err.message || "Failed to fetch capital transactions.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getGrowthMetrics = useCallback(
    async (
      period: "month" | "quarter" | "year",
      date: Date
    ): Promise<GrowthReport | null> => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams({
          period,
          date: date.toISOString(),
        });
        const response = await httpClient(
          `/business-growth/branch/${branchId}/growth-metrics?${params.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch growth metrics.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getDashboardData =
    useCallback(async (): Promise<DashboardData | null> => {
      if (!branchId) {
        console.error("No branchId available");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();

        const response = await httpClient(
          `/business-growth/branch/${branchId}/dashboard`,
          {
            headers,
          }
        );

        // The response structure is { success: true, data: { kpis: {...}, comparison: {...} } }
        return response?.data || null;
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        const errorMessage = err.message || "Failed to fetch dashboard data.";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }, [branchId, getAuthHeaders]);

  const getProfitLossTrendData = useCallback(
    async (months: number = 6) => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/charts/profit-loss-trend?months=${months}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch profit loss trend data.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getCapitalMovementData = useCallback(
    async (months: number = 6) => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/charts/capital-movement?months=${months}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch capital movement data.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getExpenseBreakdownData = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await httpClient(
          `/business-growth/branch/${branchId}/charts/expense-breakdown?${params.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch expense breakdown data.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getBusinessValueComposition = useCallback(async () => {
    if (!branchId) return null;
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/business-growth/branch/${branchId}/charts/business-value-composition`,
        { headers }
      );
      return response?.data || null;
    } catch (err: any) {
      setError(
        err.message || "Failed to fetch business value composition data."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [branchId, getAuthHeaders]);

  const getGrowthMetricsComparison = useCallback(
    async (period: "month" | "quarter" | "year" = "month") => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/charts/growth-metrics-comparison?period=${period}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(
          err.message || "Failed to fetch growth metrics comparison data."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getCashFlowData = useCallback(
    async (months: number = 3) => {
      if (!branchId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/business-growth/branch/${branchId}/charts/cash-flow?months=${months}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch cash flow data.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [branchId, getAuthHeaders]
  );

  const getPerformanceVsTargets = useCallback(async () => {
    if (!branchId) return null;
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/business-growth/branch/${branchId}/charts/performance-vs-targets`,
        { headers }
      );
      return response?.data || null;
    } catch (err: any) {
      setError(err.message || "Failed to fetch performance vs targets data.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [branchId, getAuthHeaders]);

  const getKeyMetricsData = useCallback(async () => {
    if (!branchId) return null;
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/business-growth/branch/${branchId}/charts/key-metrics`,
        { headers }
      );
      return response?.data || null;
    } catch (err: any) {
      setError(err.message || "Failed to fetch key metrics data.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [branchId, getAuthHeaders]);

  return {
    loading,
    error,
    getFinancialYearSettings,
    setOpeningCapital,
    recordCapitalTransaction,
    getCapitalTransactions,
    getGrowthMetrics,
    getDashboardData,
    getProfitLossTrendData,
    getCapitalMovementData,
    getExpenseBreakdownData,
    getBusinessValueComposition,
    getGrowthMetricsComparison,
    getCashFlowData,
    getPerformanceVsTargets,
    getKeyMetricsData,
  };
};
