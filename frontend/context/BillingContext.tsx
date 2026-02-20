/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  Invoice,
  Payment,
  InsuranceProvider,
  InsuranceClaim,
  BillingAnalytics,
  BillingSettings,
  BillingContextType,
} from "@/src/types/billing";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Default billing settings
const defaultBillingSettings: BillingSettings = {
  currency: "UGX",
  taxRate: 18,
  invoicePrefix: "INV",
  receiptFooter: "Thank you for choosing our services",
  dueDays: 30,
  lateFeePercentage: 2,
  autoGenerateInvoice: true,
  sendInvoiceReminders: true,
};

interface BillingProviderProps {
  children: React.ReactNode;
}

export function BillingProvider({ children }: BillingProviderProps) {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<
    InsuranceProvider[]
  >([]);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [analytics, setAnalytics] = useState<BillingAnalytics>({
    todayRevenue: 0,
    monthlyRevenue: 0,
    outstandingAmount: 0,
    collectedAmount: 0,
    paymentMethods: {
      cash: 0,
      mobile_money: 0,
      insurance: 0,
      credit: 0,
      bank_transfer: 0,
    },
    topPayers: [],
    revenueTrend: [],
  });
  const [settings, setSettings] = useState<BillingSettings>(
    defaultBillingSettings
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      loadInitialData();
    }
  }, [currentBranchId]);

  const loadInitialData = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      setError(null);

      // Load all billing data in parallel
      await Promise.all([
        fetchInvoices(),
        fetchPayments(),
        fetchInsuranceProviders(),
        fetchInsuranceClaims(),
        fetchAnalytics(),
        fetchBillingSettings(),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load billing data");
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId]);

  // Data fetching functions
  const fetchInvoices = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/invoices/branch/${currentBranchId}`,
        { headers }
      );
      setInvoices(response.invoices || []);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchPayments = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/payments/branch/${currentBranchId}`,
        { headers }
      );
      setPayments(response.payments || []);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchInsuranceProviders = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/insurance/providers/branch/${currentBranchId}`,
        { headers }
      );
      setInsuranceProviders(response || []);
    } catch (err: any) {
      console.error("Error fetching insurance providers:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchInsuranceClaims = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/insurance/claims/branch/${currentBranchId}`,
        { headers }
      );
      setInsuranceClaims(response.claims || []);
    } catch (err: any) {
      console.error("Error fetching insurance claims:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchAnalytics = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/analytics/branch/${currentBranchId}`,
        { headers }
      );
      setAnalytics(response);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchBillingSettings = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/billing/settings/branch/${currentBranchId}`,
        { headers }
      );
      setSettings(response);
    } catch (err: any) {
      console.error("Error fetching billing settings:", err);
      // Use default settings if fetch fails
    }
  }, [currentBranchId, getAuthHeaders]);

  // Invoice functions
  const createInvoice = useCallback(
    async (
      invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
    ) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/billing/invoices", {
          method: "POST",
          body: JSON.stringify(invoice),
          headers,
        });
        setInvoices((prev) => [...prev, response]);

        // Refresh analytics after creating invoice
        await fetchAnalytics();

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to create invoice");
        console.error("Error creating invoice:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const getInvoice = useCallback(
    async (id: string): Promise<Invoice> => {
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/billing/invoices/${id}`, {
          headers,
        });
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoice");
        console.error("Error fetching invoice:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const updateInvoice = useCallback(
    async (id: string, updates: Partial<Invoice>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/billing/invoices/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setInvoices((prev) =>
          prev.map((invoice) =>
            invoice.id === id ? { ...invoice, ...response } : invoice
          )
        );

        // Refresh analytics after updating invoice
        await fetchAnalytics();

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update invoice");
        console.error("Error updating invoice:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/billing/invoices/${id}`, {
          method: "DELETE",
          headers,
        });
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));

        // Refresh analytics after deleting invoice
        await fetchAnalytics();

        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete invoice");
        console.error("Error deleting invoice:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const applyDiscount = useCallback(
    async (
      invoiceId: string,
      discount: { type: "percentage" | "fixed"; value: number; reason?: string }
    ) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/billing/invoices/${invoiceId}/discount`,
          {
            method: "PATCH",
            body: JSON.stringify(discount),
            headers,
          }
        );
        setInvoices((prev) =>
          prev.map((invoice) => (invoice.id === invoiceId ? response : invoice))
        );

        // Refresh analytics after applying discount
        await fetchAnalytics();

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to apply discount");
        console.error("Error applying discount:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const sendInvoice = useCallback(
    async (invoiceId: string, method: "email" | "sms" | "whatsapp") => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/billing/invoices/${invoiceId}/send`,
          {
            method: "POST",
            body: JSON.stringify({ method }),
            headers,
          }
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to send invoice");
        console.error("Error sending invoice:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Payment functions
  const recordPayment = useCallback(
    async (payment: Omit<Payment, "id" | "createdAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/billing/payments", {
          method: "POST",
          body: JSON.stringify(payment),
          headers,
        });
        setPayments((prev) => [...prev, response]);

        // Update invoice status if fully paid
        if (payment.invoiceId) {
          setInvoices((prev) =>
            prev.map((invoice) =>
              invoice.id === payment.invoiceId
                ? {
                    ...invoice,
                    status: "paid",
                    paidAmount: (invoice.paidAmount || 0) + payment.amount,
                  }
                : invoice
            )
          );
        }

        // Refresh analytics after recording payment
        await fetchAnalytics();

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to record payment");
        console.error("Error recording payment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const updatePayment = useCallback(
    async (id: string, updates: Partial<Payment>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/billing/payments/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === id ? { ...payment, ...response } : payment
          )
        );

        // Refresh analytics after updating payment
        await fetchAnalytics();

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update payment");
        console.error("Error updating payment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchAnalytics]
  );

  const deletePayment = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const payment = payments.find((p) => p.id === id);
        await httpClient(`/billing/payments/${id}`, {
          method: "DELETE",
          headers,
        });
        setPayments((prev) => prev.filter((payment) => payment.id !== id));

        // Update invoice status if payment was deleted
        if (payment?.invoiceId) {
          setInvoices((prev) =>
            prev.map((invoice) =>
              invoice.id === payment.invoiceId
                ? {
                    ...invoice,
                    paidAmount: Math.max(
                      0,
                      (invoice.paidAmount || 0) - payment.amount
                    ),
                    status:
                      (invoice.paidAmount || 0) - payment.amount > 0
                        ? "partial"
                        : "pending",
                  }
                : invoice
            )
          );
        }

        // Refresh analytics after deleting payment
        await fetchAnalytics();

        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete payment");
        console.error("Error deleting payment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, payments, fetchAnalytics]
  );

  // Insurance Provider functions
  const createInsuranceProvider = useCallback(
    async (provider: Omit<InsuranceProvider, "id" | "createdAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/billing/insurance/providers", {
          method: "POST",
          body: JSON.stringify(provider),
          headers,
        });
        setInsuranceProviders((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to create insurance provider");
        console.error("Error creating insurance provider:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateInsuranceProvider = useCallback(
    async (id: string, updates: Partial<InsuranceProvider>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/billing/insurance/providers/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );
        setInsuranceProviders((prev) =>
          prev.map((provider) =>
            provider.id === id ? { ...provider, ...response } : provider
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update insurance provider");
        console.error("Error updating insurance provider:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteInsuranceProvider = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/billing/insurance/providers/${id}`, {
          method: "DELETE",
          headers,
        });
        setInsuranceProviders((prev) =>
          prev.filter((provider) => provider.id !== id)
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete insurance provider");
        console.error("Error deleting insurance provider:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Insurance Claim functions
  const createInsuranceClaim = useCallback(
    async (
      claim: Omit<
        InsuranceClaim,
        "id" | "claimNumber" | "createdAt" | "updatedAt"
      >
    ) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/billing/insurance/claims", {
          method: "POST",
          body: JSON.stringify(claim),
          headers,
        });
        setInsuranceClaims((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to create insurance claim");
        console.error("Error creating insurance claim:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateInsuranceClaim = useCallback(
    async (id: string, updates: Partial<InsuranceClaim>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/billing/insurance/claims/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setInsuranceClaims((prev) =>
          prev.map((claim) =>
            claim.id === id ? { ...claim, ...response } : claim
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update insurance claim");
        console.error("Error updating insurance claim:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const submitInsuranceClaim = useCallback(
    async (claimId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/billing/insurance/claims/${claimId}/submit`,
          {
            method: "POST",
            headers,
          }
        );
        setInsuranceClaims((prev) =>
          prev.map((claim) => (claim.id === claimId ? response : claim))
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to submit insurance claim");
        console.error("Error submitting insurance claim:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Analytics functions
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const getOutstandingInvoices = useCallback((): Invoice[] => {
    return invoices.filter(
      (invoice) => invoice.status === "pending" || invoice.status === "partial"
    );
  }, [invoices]);

  const getOverdueInvoices = useCallback((): Invoice[] => {
    const today = new Date();
    return invoices.filter(
      (invoice) =>
        (invoice.status === "pending" || invoice.status === "partial") &&
        new Date(invoice.dueDate) < today
    );
  }, [invoices]);

  const getPaymentsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Payment[] => {
      return payments.filter(
        (payment) =>
          new Date(payment.createdAt) >= startDate &&
          new Date(payment.createdAt) <= endDate
      );
    },
    [payments]
  );

  // Settings functions
  const updateBillingSettings = useCallback(
    async (newSettings: Partial<BillingSettings>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/billing/settings/branch/${currentBranchId}`,
          {
            method: "PUT",
            body: JSON.stringify(newSettings),
            headers,
          }
        );
        setSettings(response);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update billing settings");
        console.error("Error updating billing settings:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const value: BillingContextType = {
    // State
    invoices,
    payments,
    insuranceProviders,
    insuranceClaims,
    analytics,
    settings,
    loading,
    error,

    // Invoices
    createInvoice,
    getInvoice,
    updateInvoice,
    deleteInvoice,
    applyDiscount,
    sendInvoice,
    getOutstandingInvoices,
    getOverdueInvoices,

    // Payments
    recordPayment,
    updatePayment,
    deletePayment,
    getPaymentsByDateRange,

    // Insurance Providers
    createInsuranceProvider,
    updateInsuranceProvider,
    deleteInsuranceProvider,

    // Insurance Claims
    createInsuranceClaim,
    updateInsuranceClaim,
    submitInsuranceClaim,

    // Analytics
    refreshAnalytics,

    // Settings
    updateBillingSettings,

    // Utility
    reloadData: loadInitialData,
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}
