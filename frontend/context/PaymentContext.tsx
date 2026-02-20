/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { httpClient } from "@/src/data/api/httpClient";
import { toast } from "sonner";
import type { Payment, PaymentMethod } from "@/src/types/payment";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FetchPaymentsOptions {
  page?: number;
  limit?: number;
  artisanId?: string;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentContextType {
  payments: Payment[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  fetchPayments: (branchId:string, options?: FetchPaymentsOptions) => Promise<void>;
  makePayment: (paymentData: {
    assignmentId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => Promise<Payment | null>;
  getPaymentById: (id: string) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentProvider");
  }
  return context;
};

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (branchId: string, options: FetchPaymentsOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append("page", options.page.toString());
      if (options.limit) queryParams.append("limit", options.limit.toString());
      if (options.artisanId) queryParams.append("artisanId", options.artisanId);
      if (options.jobId) queryParams.append("jobId", options.jobId);
      if (options.startDate) queryParams.append("startDate", options.startDate);
      if (options.endDate) queryParams.append("endDate", options.endDate);

      const response = await httpClient(`/welding/payments/branch/${branchId}?${queryParams.toString()}`, { headers });

      setPayments(response.payments || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError("Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const makePayment = async (paymentData: {
    assignmentId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => {
    if (!currentBranchId) {
      toast.error("Branch information is missing.");
      return null;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const createResponse = await httpClient("/welding/payments", {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      // The create response might be minimal, so we fetch the full payment object
      // to get all relations needed for the UI (like the voucher).
      const newPaymentFull = await httpClient(`/welding/payments/${createResponse.id}`, {
        headers,
      });

      // The fetchPayments call might be better to refetch the list for consistency
      // But for now, adding the new payment to the list is fine for immediate UI update.
      setPayments((prev) => [newPaymentFull, ...prev]);

      // Also, consider refetching the job/assignment data in WeldingContext
      // if it's not automatically updated, since amountPaid has changed.
      // This is out of scope for this immediate fix.

      toast.success("Payment successful!");
      return newPaymentFull;
    } catch (err: any) {
      console.error("Failed to make payment:", err);
      const errorMessage = err.response?.data?.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const payment = await httpClient(`/welding/payments/${id}`, { headers });
      return payment;
    } catch (err: any) {
      console.error("Failed to fetch payment:", err);
      setError("Failed to fetch payment details.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const deletePayment = useCallback(async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`/welding/payments/${id}`, {
        method: "DELETE",
        headers,
      });
      toast.success("Payment deleted successfully");
      // Refetch the current page of payments to reflect the deletion
      if (currentBranchId) {
        await fetchPayments(currentBranchId, { page: pagination.page, limit: pagination.limit });
      }
      return true;
    } catch (err: any) {
      console.error("Failed to delete payment:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete payment.";
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, currentBranchId, fetchPayments, pagination.page, pagination.limit]);

  const value = {
    payments,
    pagination,
    loading,
    error,
    fetchPayments,
    makePayment,
    getPaymentById,
    deletePayment,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
