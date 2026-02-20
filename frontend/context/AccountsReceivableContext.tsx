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
  AccountsReceivable,
  ReceivablePayment,
  InvoiceStatus,
  ReceivableLineItem,
  AgedReceivables,
  ReceivableSummary,
} from "@/src/types/accountsReceivable";
import { useAuth } from "./AuthContext";

interface AccountsReceivableContextType {
  // State
  invoices: AccountsReceivable[];
  receivablePayments: ReceivablePayment[];
  loading: boolean;
  error: string | null;

  // Invoice Management
  createInvoice: (
    invoiceData: Omit<
      AccountsReceivable,
      | "id"
      | "invoiceNumber"
      | "paidAmount"
      | "balanceDue"
      | "status"
      | "createdAt"
      | "updatedAt"
    > & { lineItems: ReceivableLineItem[] }
  ) => Promise<AccountsReceivable>;

  getInvoices: (filters?: {
    status?: InvoiceStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<{ invoices: AccountsReceivable[]; pagination: any }>;

  getInvoiceById: (id: string) => Promise<AccountsReceivable>;

  // Payment Management
  recordPayment: (
    paymentData: Omit<
      ReceivablePayment,
      "id" | "createdAt" | "updatedAt" | "branchId"
    >
  ) => Promise<ReceivablePayment>;

  // Reports and Analytics
  getAgedReceivables: (asOfDate?: string) => Promise<AgedReceivables>;

  getReceivableSummary: () => Promise<ReceivableSummary>;

  getOverdueInvoices: () => Promise<AccountsReceivable[]>;

  // Utility
  fetchInvoices: () => Promise<void>;
}

const AccountsReceivableContext = createContext<
  AccountsReceivableContextType | undefined
>(undefined);

export const useAccountsReceivable = (): AccountsReceivableContextType => {
  const context = useContext(AccountsReceivableContext);
  if (!context) {
    throw new Error(
      "useAccountsReceivable must be used within an AccountsReceivableProvider"
    );
  }
  return context;
};

interface AccountsReceivableProviderProps {
  children: ReactNode;
}

export const AccountsReceivableProvider = ({
  children,
}: AccountsReceivableProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [invoices, setInvoices] = useState<AccountsReceivable[]>([]);
  const [receivablePayments, setReceivablePayments] = useState<ReceivablePayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/extended-accounting/receivable/invoices?branchId=${currentBranchId}`,
        { headers }
      );
      setInvoices(response.invoices || response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const createInvoice = useCallback(
    async (
      invoiceData: Omit<
        AccountsReceivable,
        | "id"
        | "invoiceNumber"
        | "paidAmount"
        | "balanceDue"
        | "status"
        | "createdAt"
        | "updatedAt"
      > & { lineItems: ReceivableLineItem[] }
    ) => {
      if (!currentBranchId) {
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/extended-accounting/receivable/invoices", {
          method: "POST",
          body: JSON.stringify({
            ...invoiceData,
            branchId: currentBranchId,
          }),
          headers,
        });
        const newInvoice = response.data || response;
        setInvoices((prev) => [newInvoice, ...prev]);
        setError(null);
        return newInvoice;
      } catch (err) {
        setError("Failed to create invoice");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getInvoices = useCallback(
    async (filters?: {
      status?: InvoiceStatus;
      customerId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) => {
      if (!currentBranchId) {
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        queryParams.append("branchId", currentBranchId);

        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.customerId)
          queryParams.append("customerId", filters.customerId);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/extended-accounting/receivable/invoices?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch invoices");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getInvoiceById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/extended-accounting/receivable/invoices/${id}`, {
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch invoice");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const recordPayment = useCallback(
    async (
      paymentData: Omit<
        ReceivablePayment,
        "id" | "createdAt" | "updatedAt" | "branchId"
      >
    ) => {
      if (!currentBranchId) {
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const payload = {
          ...paymentData,
          branchId: currentBranchId,
        };

        const response = await httpClient("/extended-accounting/receivable/payments", {
          method: "POST",
          body: JSON.stringify(payload),
          headers,
        });

        const newPayment = response.data || response;
        setReceivablePayments((prev) => [newPayment, ...prev]);

        // We might want to refresh invoices here too
        fetchInvoices();

        setError(null);
        return newPayment;
      } catch (err) {
        setError("Failed to record payment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders, fetchInvoices]
  );

  const getAgedReceivables = useCallback(
    async (asOfDate?: string) => {
      if (!currentBranchId) {
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (asOfDate) queryParams.append("asOfDate", asOfDate);

        const response = await httpClient(
          `/extended-accounting/receivable/aged/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch aged receivables");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getReceivableSummary = useCallback(async () => {
    if (!currentBranchId) {
        throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/extended-accounting/receivable/summary/${currentBranchId}`,
        { headers }
      );
      setError(null);
      return response.data || response;
    } catch (err) {
      setError("Failed to fetch receivable summary");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const getOverdueInvoices = useCallback(async () => {
    if (!currentBranchId) {
        throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/extended-accounting/receivable/overdue/${currentBranchId}`,
        { headers }
      );
      setError(null);
      return response.data || response;
    } catch (err) {
      setError("Failed to fetch overdue invoices");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const contextValue: AccountsReceivableContextType = {
    invoices,
    receivablePayments,
    loading,
    error,
    createInvoice,
    getInvoices,
    getInvoiceById,
    recordPayment,
    getAgedReceivables,
    getReceivableSummary,
    getOverdueInvoices,
    fetchInvoices,
  };

  return (
    <AccountsReceivableContext.Provider value={contextValue}>
      {children}
    </AccountsReceivableContext.Provider>
  );
};
