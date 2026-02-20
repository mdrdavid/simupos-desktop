/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";

import {
  CreditEntry,
  CreditPayment,
  CreditStatus,
  OrderItem,
} from "@/src/types/credit";
import { useAuth } from "./AuthContext";

interface CreditContextType {
  creditEntries: CreditEntry[];
  creditPayments: CreditPayment[];
  loading: boolean;
  error: string | null;
  addCreditEntry: (
    entryData: Omit<
      CreditEntry,
      "id" | "status" | "amountPaid" | "balance" | "branchId" | "userId"
    > & { items: OrderItem[] }
  ) => Promise<CreditEntry>;
  getCreditEntries: (filters?: {
    customerName?: string;
    status?: CreditStatus;
    page?: number;
    limit?: number;
  }) => Promise<{ creditEntries: CreditEntry[]; pagination: any }>;
  getCreditEntryById: (id: string) => Promise<CreditEntry>;
  recordPayment: (
    paymentData: Omit<CreditPayment, "id" | "branchId" | "userId"> & {
      creditEntryId: string;
    }
  ) => Promise<{ creditEntry: CreditEntry; payment: CreditPayment }>;
  getPaymentsForEntry: (creditEntryId: string) => Promise<CreditPayment[]>;
  getCreditAnalytics: () => Promise<any>;
  fetchCreditEntries: () => Promise<void>;
  getAllCreditPayments: (filters?: {
    page?: number;
    limit?: number;
  }) => Promise<{ payments: CreditPayment[]; pagination: any }>;
  getOutstandingCreditEntries: (filters?: {
    page?: number;
    limit?: number;
  }) => Promise<{ creditEntries: CreditEntry[]; pagination: any }>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCredit = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredit must be used within a CreditProvider");
  }
  return context;
};

interface CreditProviderProps {
  children: ReactNode;
}

export const CreditProvider = ({ children }: CreditProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([]);
  const [creditPayments, setCreditPayments] = useState<CreditPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditEntries = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/credits/entries/branch/${currentBranchId}`,
        { headers }
      );
      setCreditEntries(response.creditEntries);
      setError(null);
    } catch (err) {
      setError("Failed to fetch credit entries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const getAllCreditPayments = useCallback(
    async (filters?: { page?: number; limit?: number }) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/credits/payments/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to fetch credit payments");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getOutstandingCreditEntries = useCallback(
    async (filters?: { page?: number; limit?: number }) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/credits/entries/branch/${currentBranchId}/outstanding?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to fetch outstanding credit entries");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const addCreditEntry = useCallback(
    async (
      entryData: Omit<
        CreditEntry,
        "id" | "status" | "amountPaid" | "balance" | "branchId" | "userId"
      > & { items: OrderItem[] }
    ) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/credits/entries", {
          method: "POST",
          body: JSON.stringify({
            ...entryData,
            branchId: currentBranchId,
          }),
          headers,
        });
        setCreditEntries((prev) => [response, ...prev]);
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to add credit entry");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getCreditEntries = useCallback(
    async (filters?: {
      customerName?: string;
      status?: CreditStatus;
      page?: number;
      limit?: number;
    }) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (filters?.customerName)
          queryParams.append("customerName", filters.customerName);
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/credits/entries/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to fetch credit entries");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getCreditEntryById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/credits/entries/${id}`, {
          headers,
        });
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to fetch credit entry");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const recordPayment = useCallback(
    async (
      paymentData: Omit<CreditPayment, "id" | "branchId" | "userId"> & {
        creditEntryId: string;
      }
    ) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const payload = {
          ...paymentData,
          branchId: currentBranchId,
        };

        const response = await httpClient("/credits/payments", {
          method: "POST",
          body: JSON.stringify(payload),
          headers,
        });

        setCreditEntries((prev) =>
          prev.map((entry) =>
            entry.id === response.creditEntry.id ? response.creditEntry : entry
          )
        );
        setCreditPayments((prev) => [response.payment, ...prev]);

        setError(null);
        return response;
      } catch (err) {
        setError("Failed to record payment");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getPaymentsForEntry = useCallback(
    async (creditEntryId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/credits/payments/entry/${creditEntryId}`,
          { headers }
        );
        setError(null);
        return response;
      } catch (err) {
        setError("Failed to fetch payments");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getCreditAnalytics = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/credits/analytics/branch/${currentBranchId}`,
        { headers }
      );
      setError(null);
      return response;
    } catch (err) {
      setError("Failed to fetch credit analytics");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  return (
    <CreditContext.Provider
      value={{
        creditEntries,
        creditPayments,
        loading,
        error,
        addCreditEntry,
        getCreditEntries,
        getCreditEntryById,
        recordPayment,
        getPaymentsForEntry,
        getCreditAnalytics,
        fetchCreditEntries,
        getAllCreditPayments,
        getOutstandingCreditEntries,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};
