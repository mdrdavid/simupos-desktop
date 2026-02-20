/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { IncomeRecord, ExpenseRecord } from '@/src/types/professionalHubFinancials';
import { createProfessionalHubFinancialApi } from '@/src/data/api/professional-hub-financial-http-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ProfessionalHubFinancialContextType {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  isLoading: boolean;
  addIncome: (income: Omit<IncomeRecord, 'id'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<IncomeRecord>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ProfessionalHubFinancialContext = createContext<ProfessionalHubFinancialContextType | undefined>(undefined);

export const useProfessionalHubFinancials = () => {
  const context = useContext(ProfessionalHubFinancialContext);
  if (!context) {
    throw new Error('useProfessionalHubFinancials must be used within a ProfessionalHubFinancialProvider');
  }
  return context;
};

export const ProfessionalHubFinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAuthHeaders, currentBranchId } = useAuth();

  const api = useMemo(() => createProfessionalHubFinancialApi(getAuthHeaders), [getAuthHeaders]);

  const refreshData = useCallback(async () => {
    if (!currentBranchId) {
      setIncomes([]);
      setExpenses([]);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedIncomes, fetchedExpenses] = await Promise.all([
        api.getIncomes(currentBranchId),
        api.getExpenses(currentBranchId)
      ]);
      setIncomes(fetchedIncomes);
      setExpenses(fetchedExpenses);
    } catch (error: any) {
      console.error("Failed to fetch financial data:", error);
      toast({
        title: "Error",
        description: "Failed to load financial records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, currentBranchId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addIncome = useCallback(async (income: Omit<IncomeRecord, 'id'>) => {
    if (!currentBranchId) return;
    try {
      const newIncome = await api.createIncome({ ...income, branchId: currentBranchId });
      setIncomes((prev) => [newIncome, ...prev]);
      toast({
        title: "Success",
        description: "Income record added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add income record",
        variant: "destructive",
      });
    }
  }, [api, currentBranchId]);

  const updateIncome = useCallback(async (id: string, updatedIncome: Partial<IncomeRecord>) => {
    try {
      const result = await api.updateIncome(id, updatedIncome);
      setIncomes((prev) => prev.map((inc) => (inc.id === id ? result : inc)));
      toast({
        title: "Success",
        description: "Income record updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update income record",
        variant: "destructive",
      });
    }
  }, [api]);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      await api.deleteIncome(id);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
      toast({
        title: "Success",
        description: "Income record deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete income record",
        variant: "destructive",
      });
    }
  }, [api]);

  const addExpense = useCallback(async (expense: Omit<ExpenseRecord, 'id'>) => {
    if (!currentBranchId) return;
    try {
      const newExpense = await api.createExpense({ ...expense, branchId: currentBranchId });
      setExpenses((prev) => [newExpense, ...prev]);
      toast({
        title: "Success",
        description: "Expense record added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense record",
        variant: "destructive",
      });
    }
  }, [api, currentBranchId]);

  const updateExpense = useCallback(async (id: string, updatedExpense: Partial<ExpenseRecord>) => {
    try {
      const result = await api.updateExpense(id, updatedExpense);
      setExpenses((prev) => prev.map((exp) => (exp.id === id ? result : exp)));
      toast({
        title: "Success",
        description: "Expense record updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense record",
        variant: "destructive",
      });
    }
  }, [api]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      toast({
        title: "Success",
        description: "Expense record deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense record",
        variant: "destructive",
      });
    }
  }, [api]);

  return (
    <ProfessionalHubFinancialContext.Provider
      value={{
        incomes,
        expenses,
        isLoading,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshData,
      }}
    >
      {children}
    </ProfessionalHubFinancialContext.Provider>
  );
};
