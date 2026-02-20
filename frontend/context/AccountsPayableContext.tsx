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
  AccountsPayable,
  PayablePayment,
  BillStatus,
  PayableLineItem,
  AgedPayables,
  PayableSummary,
  SupplierPayableSummary,
} from "@/src/types/accountsPayable";
import { useAuth } from "./AuthContext";

interface AccountsPayableContextType {
  // State
  bills: AccountsPayable[];
  payablePayments: PayablePayment[];
  loading: boolean;
  error: string | null;

  // Bill Management
  createBill: (
    billData: Omit<
      AccountsPayable,
      | "id"
      | "billNumber"
      | "paidAmount"
      | "balanceDue"
      | "status"
      | "createdAt"
      | "updatedAt"
    > & { lineItems: PayableLineItem[] }
  ) => Promise<AccountsPayable>;

  getBills: (filters?: {
    status?: BillStatus;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<{ bills: AccountsPayable[]; pagination: any }>;

  getBillById: (id: string) => Promise<AccountsPayable>;

  updateBillStatus: (
    id: string,
    status: BillStatus
  ) => Promise<AccountsPayable>;

  voidBill: (id: string, reason: string) => Promise<AccountsPayable>;

  // Payment Management
  recordPayment: (
    paymentData: Omit<
      PayablePayment,
      "id" | "createdAt" | "updatedAt" | "businessId"
    > & {
      billId: string;
    }
  ) => Promise<{ bill: AccountsPayable; payment: PayablePayment }>;

  getPaymentHistory: (billId: string) => Promise<PayablePayment[]>;

  // Reports and Analytics
  getAgedPayables: (asOfDate?: string) => Promise<AgedPayables>;

  getUpcomingPayments: (days?: number) => Promise<AccountsPayable[]>;

  getPayableSummary: () => Promise<PayableSummary>;

  getSupplierPayableSummary: (
    supplierId: string
  ) => Promise<SupplierPayableSummary>;

  getBillsBySupplier: (
    supplierId: string,
    status?: BillStatus
  ) => Promise<AccountsPayable[]>;

  // Utility
  fetchBills: () => Promise<void>;
}

const AccountsPayableContext = createContext<
  AccountsPayableContextType | undefined
>(undefined);

export const useAccountsPayable = (): AccountsPayableContextType => {
  const context = useContext(AccountsPayableContext);
  if (!context) {
    throw new Error(
      "useAccountsPayable must be used within an AccountsPayableProvider"
    );
  }
  return context;
};

interface AccountsPayableProviderProps {
  children: ReactNode;
}

export const AccountsPayableProvider = ({
  children,
}: AccountsPayableProviderProps) => {
  const { currentBranchId, currentBusinessId, getAuthHeaders } = useAuth();
  const [bills, setBills] = useState<AccountsPayable[]>([]);
  const [payablePayments, setPayablePayments] = useState<PayablePayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/accounts-payable/bills/branch/${currentBranchId}`,
        { headers }
      );
      setBills(response.bills);
      setError(null);
    } catch (err) {
      setError("Failed to fetch bills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const createBill = useCallback(
    async (
      billData: Omit<
        AccountsPayable,
        | "id"
        | "billNumber"
        | "paidAmount"
        | "balanceDue"
        | "status"
        | "createdAt"
        | "updatedAt"
      > & { lineItems: PayableLineItem[] }
    ) => {
      if (!currentBranchId || !currentBusinessId) {
        setError("No branch or business selected");
        throw new Error("No branch or business selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/accounts-payable/bills", {
          method: "POST",
          body: JSON.stringify({
            ...billData,
            branchId: currentBranchId,
            businessId: currentBusinessId,
          }),
          headers,
        });
        setBills((prev) => [response.data, ...prev]);
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to create bill");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, currentBusinessId, getAuthHeaders]
  );

  const getBills = useCallback(
    async (filters?: {
      status?: BillStatus;
      supplierId?: string;
      startDate?: string;
      endDate?: string;
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

        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.supplierId)
          queryParams.append("supplierId", filters.supplierId);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/accounts-payable/bills/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch bills");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getBillById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/accounts-payable/bills/${id}`, {
          headers,
        });
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch bill");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateBillStatus = useCallback(
    async (id: string, status: BillStatus) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/accounts-payable/bills/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
          }
        );

        // Update local state
        setBills((prev) =>
          prev.map((bill) =>
            bill.id === response.data.id ? response.data : bill
          )
        );

        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to update bill status");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const voidBill = useCallback(
    async (id: string, reason: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/accounts-payable/bills/${id}/void`,
          {
            method: "POST",
            body: JSON.stringify({ reason }),
            headers,
          }
        );

        // Update local state
        setBills((prev) =>
          prev.map((bill) =>
            bill.id === response.data.id ? response.data : bill
          )
        );

        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to void bill");
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
      paymentData: Omit<
        PayablePayment,
        "id" | "createdAt" | "updatedAt" | "businessId"
      > & {
        billId: string;
      }
    ) => {
      if (!currentBranchId || !currentBusinessId) {
        setError("No branch or business selected");
        throw new Error("No branch or business selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const payload = {
          ...paymentData,
          branchId: currentBranchId,
          businessId: currentBusinessId,
        };

        const response = await httpClient("/accounts-payable/payments", {
          method: "POST",
          body: JSON.stringify(payload),
          headers,
        });

        // Update local state
        setBills((prev) =>
          prev.map((bill) =>
            bill.id === response.data.bill.id ? response.data.bill : bill
          )
        );
        setPayablePayments((prev) => [response.data.payment, ...prev]);

        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to record payment");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, currentBusinessId, getAuthHeaders]
  );

  const getPaymentHistory = useCallback(
    async (billId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/accounts-payable/bills/${billId}/payments`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch payment history");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getAgedPayables = useCallback(
    async (asOfDate?: string) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (asOfDate) queryParams.append("asOfDate", asOfDate);

        const response = await httpClient(
          `/accounts-payable/aged-payables/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch aged payables");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getUpcomingPayments = useCallback(
    async (days: number = 30) => {
      if (!currentBranchId) {
        setError("No branch selected");
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        queryParams.append("days", days.toString());

        const response = await httpClient(
          `/accounts-payable/upcoming-payments/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch upcoming payments");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getPayableSummary = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/accounts-payable/summary/${currentBranchId}`,
        { headers }
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError("Failed to fetch payable summary");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const getSupplierPayableSummary = useCallback(
    async (supplierId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/accounts-payable/supplier/${supplierId}/summary`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch supplier payable summary");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getBillsBySupplier = useCallback(
    async (supplierId: string, status?: BillStatus) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);

        const response = await httpClient(
          `/accounts-payable/supplier/${supplierId}/bills?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err) {
        setError("Failed to fetch supplier bills");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const contextValue: AccountsPayableContextType = {
    // State
    bills,
    payablePayments,
    loading,
    error,

    // Bill Management
    createBill,
    getBills,
    getBillById,
    updateBillStatus,
    voidBill,

    // Payment Management
    recordPayment,
    getPaymentHistory,

    // Reports and Analytics
    getAgedPayables,
    getUpcomingPayments,
    getPayableSummary,
    getSupplierPayableSummary,
    getBillsBySupplier,

    // Utility
    fetchBills,
  };

  return (
    <AccountsPayableContext.Provider value={contextValue}>
      {children}
    </AccountsPayableContext.Provider>
  );
};
