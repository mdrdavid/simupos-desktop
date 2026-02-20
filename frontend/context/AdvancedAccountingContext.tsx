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
  Currency,
  ExchangeRate,
  FixedAsset,
  PayrollRun,
  Budget,
  BudgetAlert,
} from "@/src/types/advancedAccounting";
import { useAuth } from "./AuthContext";

interface AdvancedAccountingContextType {
  loading: boolean;
  error: string | null;

  // Multi-currency
  setBaseCurrency: (currencyCode: string) => Promise<Currency>;
  updateExchangeRate: (data: {
    currencyCode: string;
    rate: number;
    effectiveDate?: string;
    source?: string;
  }) => Promise<ExchangeRate>;

  // EFRIS
  submitToEFRIS: (transactionId: string) => Promise<any>;

  // Fixed Assets
  createAsset: (assetData: any) => Promise<FixedAsset>;
  postDepreciation: (assetId: string, scheduleDate: string) => Promise<void>;

  // Payroll
  processPayroll: (data: {
    branchId: string;
    payPeriod: string;
    employeeIds: string[];
  }) => Promise<PayrollRun[]>;
  generatePayslip: (payrollRunId: string) => Promise<any>;

  // Budgeting
  createBudget: (budgetData: any) => Promise<Budget>;
  getBudgetAlerts: () => Promise<BudgetAlert[]>;
}

const AdvancedAccountingContext = createContext<
  AdvancedAccountingContextType | undefined
>(undefined);

export const useAdvancedAccounting = (): AdvancedAccountingContextType => {
  const context = useContext(AdvancedAccountingContext);
  if (!context) {
    throw new Error(
      "useAdvancedAccounting must be used within an AdvancedAccountingProvider"
    );
  }
  return context;
};

interface AdvancedAccountingProviderProps {
  children: ReactNode;
}

export const AdvancedAccountingProvider = ({
  children,
}: AdvancedAccountingProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setBaseCurrency = useCallback(
    async (currencyCode: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/advanced-accounting/currencies/base", {
          method: "POST",
          body: JSON.stringify({ currencyCode }),
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to set base currency");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateExchangeRate = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/advanced-accounting/currencies/rates", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to update exchange rate");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const submitToEFRIS = useCallback(
    async (transactionId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/advanced-accounting/efris/submit/${transactionId}`,
          {
            method: "POST",
            headers,
          }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to submit to EFRIS");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const createAsset = useCallback(
    async (assetData: any) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/advanced-accounting/assets", {
          method: "POST",
          body: JSON.stringify(assetData),
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to create asset");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const postDepreciation = useCallback(
    async (assetId: string, scheduleDate: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/advanced-accounting/assets/${assetId}/depreciation`, {
          method: "POST",
          body: JSON.stringify({ scheduleDate }),
          headers,
        });
        setError(null);
      } catch (err) {
        setError("Failed to post depreciation");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const processPayroll = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/advanced-accounting/payroll/process", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to process payroll");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const generatePayslip = useCallback(
    async (payrollRunId: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/advanced-accounting/payroll/payslip/${payrollRunId}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to generate payslip");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const createBudget = useCallback(
    async (budgetData: any) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/advanced-accounting/budgets", {
          method: "POST",
          body: JSON.stringify(budgetData),
          headers,
        });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to create budget");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getBudgetAlerts = useCallback(async () => {
    if (!currentBranchId) return [];
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/advanced-accounting/budgets/alerts/${currentBranchId}`,
        { headers }
      );
      setError(null);
      return response.data || response;
    } catch (err) {
      setError("Failed to fetch budget alerts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const contextValue: AdvancedAccountingContextType = {
    loading,
    error,
    setBaseCurrency,
    updateExchangeRate,
    submitToEFRIS,
    createAsset,
    postDepreciation,
    processPayroll,
    generatePayslip,
    createBudget,
    getBudgetAlerts,
  };

  return (
    <AdvancedAccountingContext.Provider value={contextValue}>
      {children}
    </AdvancedAccountingContext.Provider>
  );
};
