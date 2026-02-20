/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BranchPerformanceComparison,
  PerformanceTrends,
  BranchPerformance,
} from "@/src/types/branch-performance";
import { httpClient } from "../data/api/httpClient";

export const useBranchPerformance = (businessId: string | null | undefined) => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const compareBranches = useCallback(
    async (
      period: "month" | "quarter" | "year" | "previous_year",
      params?: {
        year?: number;
        month?: number;
        quarter?: number;
        branchIds?: string[];
      }
    ): Promise<BranchPerformanceComparison | null> => {
      if (!businessId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams({ period });
        if (params?.year) queryParams.append("year", params.year.toString());
        if (params?.month) queryParams.append("month", params.month.toString());
        if (params?.quarter) queryParams.append("quarter", params.quarter.toString());
        if (params?.branchIds) queryParams.append("branchIds", params.branchIds.join(","));

        const response = await httpClient(
          `/businesses/${businessId}/branches/performance/compare?${queryParams.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to compare branch performance.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [businessId, getAuthHeaders]
  );

  const getPerformanceTrends = useCallback(
    async (
      period: "monthly" | "quarterly" | "yearly",
      months?: number
    ): Promise<PerformanceTrends | null> => {
      if (!businessId) return null;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams({ period });
        if (months) queryParams.append("months", months.toString());

        const response = await httpClient(
          `/businesses/${businessId}/branches/performance/trends?${queryParams.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch performance trends.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [businessId, getAuthHeaders]
  );

  const getBranchPerformanceDetail = useCallback(
    async (
      branchId: string,
      startDate: Date,
      endDate: Date
    ): Promise<BranchPerformance | null> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await httpClient(
          `/businesses/branches/${branchId}/performance?${queryParams.toString()}`,
          { headers }
        );
        return response?.data || null;
      } catch (err: any) {
        setError(err.message || "Failed to fetch branch performance details.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    loading,
    error,
    compareBranches,
    getPerformanceTrends,
    getBranchPerformanceDetail,
  };
};