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
  BankAccount,
  BankTransaction,
  BankReconciliation,
  BankAccountType,
} from "@/src/types/banking";
import { useAuth } from "./AuthContext";

interface BankingContextType {
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;

  // Account Management
  createBankAccount: (
    accountData: Omit<BankAccount, "id" | "createdAt" | "updatedAt" | "branchId" | "currentBalance" | "availableBalance" | "isActive">
  ) => Promise<BankAccount>;

  getBankAccounts: () => Promise<BankAccount[]>;

  // Transaction Management
  importBankStatement: (
    bankAccountId: string,
    transactions: any[]
  ) => Promise<BankTransaction[]>;

  getBankTransactions: (
    bankAccountId: string,
    filters?: { startDate?: string; endDate?: string }
  ) => Promise<BankTransaction[]>;

  // Reconciliation
  reconcileBankAccount: (
    bankAccountId: string,
    statementDate: string,
    statementBalance: number,
    reconciledTransactionIds: string[]
  ) => Promise<BankReconciliation>;

  // Utility
  fetchBankAccounts: () => Promise<void>;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const useBanking = (): BankingContextType => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error("useBanking must be used within a BankingProvider");
  }
  return context;
};

interface BankingProviderProps {
  children: ReactNode;
}

export const BankingProvider = ({ children }: BankingProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      // Wait, there's no direct "get bank accounts by branch" in ExtendedAccountingController but there should be.
      // Assuming it exists at /extended-accounting/bank/accounts?branchId=...
      const response = await httpClient(
        `/extended-accounting/bank/accounts?branchId=${currentBranchId}`,
        { headers }
      );
      setBankAccounts(response.data || response || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch bank accounts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const createBankAccount = useCallback(
    async (accountData: any) => {
      if (!currentBranchId) {
        throw new Error("No branch selected");
      }

      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/extended-accounting/bank/accounts", {
          method: "POST",
          body: JSON.stringify({
            ...accountData,
            branchId: currentBranchId,
          }),
          headers,
        });
        const newAccount = response.data || response;
        setBankAccounts((prev) => [newAccount, ...prev]);
        setError(null);
        return newAccount;
      } catch (err) {
        setError("Failed to create bank account");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const importBankStatement = useCallback(
    async (bankAccountId: string, transactions: any[]) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/extended-accounting/bank/accounts/${bankAccountId}/import`,
          {
            method: "POST",
            body: JSON.stringify({ transactions }),
            headers,
          }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to import bank statement");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getBankTransactions = useCallback(
    async (bankAccountId: string, filters?: { startDate?: string; endDate?: string }) => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            const queryParams = new URLSearchParams();
            if (filters?.startDate) queryParams.append("startDate", filters.startDate);
            if (filters?.endDate) queryParams.append("endDate", filters.endDate);

            const response = await httpClient(
                `/extended-accounting/bank/accounts/${bankAccountId}/transactions?${queryParams.toString()}`,
                { headers }
            );
            setError(null);
            return response.data || response;
        } catch (err) {
            setError("Failed to fetch bank transactions");
            throw err;
        } finally {
            setLoading(false);
        }
    },
    [getAuthHeaders]
  );

  const reconcileBankAccount = useCallback(
    async (
      bankAccountId: string,
      statementDate: string,
      statementBalance: number,
      reconciledTransactionIds: string[]
    ) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/extended-accounting/bank/accounts/${bankAccountId}/reconcile`,
          {
            method: "POST",
            body: JSON.stringify({
              statementDate,
              statementBalance,
              reconciledTransactionIds,
            }),
            headers,
          }
        );
        setError(null);
        return response.data || response;
      } catch (err) {
        setError("Failed to reconcile bank account");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getBankAccounts = useCallback(async () => {
      await fetchBankAccounts();
      return bankAccounts;
  }, [fetchBankAccounts, bankAccounts]);

  const contextValue: BankingContextType = {
    bankAccounts,
    loading,
    error,
    createBankAccount,
    getBankAccounts,
    importBankStatement,
    getBankTransactions,
    reconcileBankAccount,
    fetchBankAccounts,
  };

  return (
    <BankingContext.Provider value={contextValue}>
      {children}
    </BankingContext.Provider>
  );
};
