/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";
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
  // recordPayment: (
  //   paymentData: Omit<CreditPayment, "id" | "branchId" | "userId">
  // ) => Promise<{ creditEntry: CreditEntry; payment: CreditPayment }>;
  recordPayment: (
    paymentData: Omit<CreditPayment, "id" | "branchId" | "userId"> & { creditEntryId: string }
  ) => Promise<{ creditEntry: CreditEntry; payment: CreditPayment }>;
  getPaymentsForEntry: (creditEntryId: string) => Promise<CreditPayment[]>;
  getCreditAnalytics: () => Promise<any>;
  fetchCreditEntries: () => Promise<void>;
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

  const fetchCreditEntries = async () => {
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
  };

  const addCreditEntry = async (
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
  };

  const getCreditEntries = async (filters?: {
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
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());

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
  };

  const getCreditEntryById = async (id: string) => {
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
  };

  const recordPayment = async (
  paymentData: Omit<CreditPayment, "id" | "branchId" | "userId"> & { creditEntryId: string }
) => {
  if (!currentBranchId) {
    setError("No branch selected");
    throw new Error("No branch selected");
  }

  try {
    setLoading(true);
    const headers = await getAuthHeaders();
    const response = await httpClient("/credits/payments", {
      method: "POST",
      body: JSON.stringify({
        ...paymentData,
        branchId: currentBranchId,
      }),
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
};
  // const recordPayment = async (
  //   paymentData: Omit<CreditPayment, "id" | "branchId" | "userId">
  // ) => {
  //   if (!currentBranchId) {
  //     setError("No branch selected");
  //     throw new Error("No branch selected");
  //   }

  //   try {
  //     setLoading(true);
  //     const headers = await getAuthHeaders();
  //     console.log("paymentData", paymentData);
  //     const response = await httpClient("/credits/payments", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         ...paymentData,
  //         branchId: currentBranchId,
  //       }),
  //       headers,
  //     });

  //     setCreditEntries((prev) =>
  //       prev.map((entry) =>
  //         entry.id === response.creditEntry.id ? response.creditEntry : entry
  //       )
  //     );
  //     setCreditPayments((prev) => [response.payment, ...prev]);

  //     setError(null);
  //     return response;
  //   } catch (err) {
  //     setError("Failed to record payment");
  //     console.error(err);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getPaymentsForEntry = async (creditEntryId: string) => {
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
  };

  const getCreditAnalytics = async () => {
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
  };

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
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};
