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
  ChartOfAccounts,
  GeneralLedger,
  TrialBalance,
  ProfitAndLoss,
  BalanceSheet,
  CashFlowStatement,
} from "@/src/types/accounting";
import { useAuth } from "./AuthContext";

interface BookkeepingContextType {
  accounts: ChartOfAccounts[];
  loading: boolean;
  error: string | null;

  // Chart of Accounts
  initializeAccounts: () => Promise<void>;
  createAccount: (accountData: any) => Promise<ChartOfAccounts>;
  getAccounts: (filters?: any) => Promise<{ accounts: ChartOfAccounts[]; pagination: any }>;

  // General Ledger
  getGeneralLedger: (filters?: any) => Promise<{ entries: GeneralLedger[]; pagination: any }>;
  createJournalEntry: (entryData: any) => Promise<GeneralLedger[]>;

  // Financial Statements
  getTrialBalance: (asOfDate?: string) => Promise<TrialBalance>;
  getProfitAndLoss: (startDate: string, endDate: string) => Promise<ProfitAndLoss>;
  getBalanceSheet: (asOfDate?: string) => Promise<BalanceSheet>;
  getCashFlowStatement: (startDate: string, endDate: string) => Promise<CashFlowStatement>;

  // Expense Categories
  getExpenseCategories: (filters?: any) => Promise<any>;
  createExpenseCategory: (categoryData: any) => Promise<any>;
  initializeDefaultCategories: () => Promise<void>;

  // Utility
  fetchAccounts: () => Promise<void>;
}

const BookkeepingContext = createContext<BookkeepingContextType | undefined>(
  undefined
);

export const useBookkeeping = (): BookkeepingContextType => {
  const context = useContext(BookkeepingContext);
  if (!context) {
    throw new Error("useBookkeeping must be used within a BookkeepingProvider");
  }
  return context;
};

interface BookkeepingProviderProps {
  children: ReactNode;
}

export const BookkeepingProvider = ({ children }: BookkeepingProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/bookkeeping/coa/accounts/${currentBranchId}`,
        { headers }
      );
      setAccounts(response.accounts || response.data?.accounts || response || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch accounts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const initializeAccounts = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      await httpClient(`/bookkeeping/coa/initialize/${currentBranchId}`, {
        method: "POST",
        headers,
      });
      await fetchAccounts();
      setError(null);
    } catch (err) {
      setError("Failed to initialize accounts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders, fetchAccounts]);

  const createAccount = useCallback(
    async (accountData: any) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/bookkeeping/coa/accounts", {
          method: "POST",
          body: JSON.stringify({ ...accountData, branchId: currentBranchId }),
          headers,
        });
        const newAccount = response.data || response;
        setAccounts((prev) => [...prev, newAccount]);
        setError(null);
        return newAccount;
      } catch (err) {
        setError("Failed to create account");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getAccounts = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const params = new URLSearchParams(filters);
        const response = await httpClient(
          `/bookkeeping/coa/accounts/${currentBranchId}?${params.toString()}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch accounts");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getGeneralLedger = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const params = new URLSearchParams(filters);
        const response = await httpClient(
          `/bookkeeping/general-ledger/${currentBranchId}?${params.toString()}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch general ledger");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const createJournalEntry = useCallback(
    async (entryData: any) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/bookkeeping/general-ledger/journal-entry/${currentBranchId}`,
          {
            method: "POST",
            body: JSON.stringify(entryData),
            headers,
          }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to create journal entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getTrialBalance = useCallback(
    async (asOfDate?: string) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const url = asOfDate
            ? `/bookkeeping/trial-balance/${currentBranchId}?asOfDate=${asOfDate}`
            : `/bookkeeping/trial-balance/${currentBranchId}`;
        const response = await httpClient(url, { headers });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch trial balance");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getProfitAndLoss = useCallback(
    async (startDate: string, endDate: string) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/bookkeeping/profit-loss/${currentBranchId}?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch P&L statement");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getBalanceSheet = useCallback(
    async (asOfDate?: string) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const url = asOfDate
            ? `/bookkeeping/balance-sheet/${currentBranchId}?asOfDate=${asOfDate}`
            : `/bookkeeping/balance-sheet/${currentBranchId}`;
        const response = await httpClient(url, { headers });
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch balance sheet");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getCashFlowStatement = useCallback(
    async (startDate: string, endDate: string) => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/extended-accounting/cash-flow/${currentBranchId}?startDate=${startDate}&endDate=${endDate}`,
          { headers }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to fetch cash flow statement");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getExpenseCategories = useCallback(async (filters?: any) => {
    if (!currentBranchId) throw new Error("No branch selected");
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const params = new URLSearchParams(filters);
      const response = await httpClient(
        `/extended-accounting/expense-categories/${currentBranchId}?${params.toString()}`,
        { headers }
      );
      setError(null);
      return response.data || response;
    } catch (err) {
      setError("Failed to fetch expense categories");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const createExpenseCategory = useCallback(async (categoryData: any) => {
    if (!currentBranchId) throw new Error("No branch selected");
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient("/extended-accounting/expense-categories", {
        method: "POST",
        body: JSON.stringify({ ...categoryData, branchId: currentBranchId }),
        headers,
      });
      setError(null);
      return response.data || response;
    } catch (err) {
      setError("Failed to create expense category");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const initializeDefaultCategories = useCallback(async () => {
    if (!currentBranchId) throw new Error("No branch selected");
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      await httpClient(`/extended-accounting/expense-categories/initialize/${currentBranchId}`, {
        method: "POST",
        headers,
      });
      setError(null);
    } catch (err) {
      setError("Failed to initialize default categories");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const contextValue: BookkeepingContextType = {
    accounts,
    loading,
    error,
    initializeAccounts,
    createAccount,
    getAccounts,
    getGeneralLedger,
    createJournalEntry,
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
    getCashFlowStatement,
    getExpenseCategories,
    createExpenseCategory,
    initializeDefaultCategories,
    fetchAccounts,
  };

  return (
    <BookkeepingContext.Provider value={contextValue}>
      {children}
    </BookkeepingContext.Provider>
  );
};
