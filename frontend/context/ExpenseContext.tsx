"use client";
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuth } from "./AuthContext";
import { useBranch } from "./BranchContext";
import { httpClient } from "@/src/data/api/httpClient";
import { RecurringExpenseItem } from "@/src/types/recurring-expense-item";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: "cash" | "bank" | "mobile_money";
  receiptNumber?: string;
  vendor?: string;
  isRecurring: boolean;
  branchId: string;
  userId: string;
  createdAt: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  totalExpenses: number;
  totalPages: number;
  currentPage: number;
  recurringExpenseItems: RecurringExpenseItem[];
  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "userId">
  ) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByPeriod: (
    period: "day" | "week" | "month" | "year" | "quarter"
  ) => Promise<Expense[]>;
  getTotalExpenses: (
    period: "day" | "week" | "month" | "year" | "quarter"
  ) => Promise<number>;
  getExpensesByCategory: (
    period: "day" | "week" | "month" | "year" | "quarter"
  ) => Promise<Record<string, number>>;
  fetchExpenses: (page?: number, limit?: number, period?: string, category?: string) => Promise<void>;
  fetchRecurringExpenseItems: () => Promise<void>;
  addRecurringExpenseItem: (item: Omit<RecurringExpenseItem, 'id'>) => Promise<RecurringExpenseItem | undefined>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recurringExpenseItems, setRecurringExpenseItems] = useState<RecurringExpenseItem[]>([]);
  const { currentBranch } = useBranch();
  const { currentBranchId, getAuthHeaders } = useAuth();

  const fetchExpenses = useCallback(async (page = 1, limit = 10, period = "all", category = "all") => {
    if (!currentBranch) {
      // Branch not ready yet; keep loading to avoid empty-state flash
      setLoading(true);
      console.log("No current branch selected");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (period !== "all") {
        params.append("period", period);
      }
      if (category !== "all") {
        params.append("category", category);
      }

      const response = await httpClient(
        `/expenses/branch/${currentBranchId}?${params.toString()}`,
        {
          headers,
        }
      );

      // Handle both possible response structures
      const expensesData =
        response.expenses || (Array.isArray(response) ? response : []);

      if (!Array.isArray(expensesData)) {
        throw new Error("Invalid expenses data format");
      }
      setExpenses(expensesData);
      setTotalExpenses(response.totalExpenses || 0);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch expenses";
      console.error("Fetch error:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentBranch, currentBranchId, getAuthHeaders]);

  const fetchRecurringExpenseItems = useCallback(async () => {
    if (!currentBranchId) return;
    // In a real app, you would fetch this from your API
    // For now, we'll use mock data
    const mockItems: RecurringExpenseItem[] = [
      { id: '1', name: 'Rent', category: 'Rent', defaultAmount: 2000000 },
      { id: '2', name: 'Salaries', category: 'Staff', defaultAmount: 5000000 },
      { id: '3', name: 'Electricity', category: 'Utilities', defaultAmount: 250000 },
    ];
    setRecurringExpenseItems(mockItems);
  }, [currentBranchId]);

  const addRecurringExpenseItem = async (item: Omit<RecurringExpenseItem, 'id'>): Promise<RecurringExpenseItem | undefined> => {
    if (!currentBranchId) return;
    // In a real app, you would post this to your API
    const newItem: RecurringExpenseItem = {
      id: new Date().toISOString(), // mock id
      ...item,
    };
    setRecurringExpenseItems(prev => [...prev, newItem]);
    return newItem;
  };

  // Auto-fetch whenever current branch context becomes available or changes
  // Ensures data is loaded after page refresh without manual triggers
  useEffect(() => {
    if (currentBranchId) {
      fetchExpenses();
      fetchRecurringExpenseItems();
    }
  }, [currentBranchId, fetchExpenses, fetchRecurringExpenseItems]);

  const addExpense = useCallback(async (
    expense: Omit<Expense, "id" | "createdAt" | "userId">
  ) => {
    if (!currentBranch) return;

    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient("/expenses", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...expense,
          branchId: currentBranchId,
        }),
      });

      const newExpense = await response;
      setExpenses((prev) => [newExpense, ...prev]);
      fetchExpenses(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  }, [currentBranch, currentBranchId, getAuthHeaders, fetchExpenses]);

  const updateExpense = useCallback(async (
    id: string,
    updatedExpense: Partial<Expense>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(`/expenses/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedExpense),
      });

      const data = await response;
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? data : expense))
      );
      fetchExpenses(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await httpClient(`/expenses/${id}`, {
        method: "DELETE",
        headers,
      });

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      fetchExpenses(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, fetchExpenses]);

  const getExpensesByPeriod = async (
    period: "day" | "week" | "month" | "year" | "quarter"
  ) => {
    if (!currentBranch) return [];

    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "day":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "quarter":
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
          startDate = new Date(0);
      }

      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/expenses/branch/${currentBranchId}?startDate=${startDate.toISOString()}`,
        { headers }
      );

      return response.expenses;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch expenses by period"
      );
      return [];
    }
  };

  const getTotalExpenses = async (
    period: "day" | "week" | "month" | "year" | "quarter"
  ): Promise<number> => {
    try {
      const periodExpenses = (await getExpensesByPeriod(period)) || [];

      return periodExpenses.reduce((total: number, expense: Expense) => {
        // Ensure amount is a valid number
        const amount = Number(expense.amount);
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      console.error("Error calculating total expenses:", error);
      return 0; // Return 0 if there's an error
    }
  };

  const getExpensesByCategory = async (
    period: "day" | "week" | "month" | "year" | "quarter"
  ) => {
    const periodExpenses = await getExpensesByPeriod(period);
    return periodExpenses.reduce(
      (acc: Record<string, number>, expense: Expense) => {
        // Ensure both values are treated as numbers
        const currentAmount = Number(acc[expense.category] || 0);
        const expenseAmount = Number(expense.amount);

        // Only add if both are valid numbers
        if (!isNaN(currentAmount) && !isNaN(expenseAmount)) {
          acc[expense.category] = currentAmount + expenseAmount;
        } else {
          // Handle invalid numbers (optional)
          console.warn(
            `Invalid amount for ${expense.category}:`,
            expense.amount
          );
          acc[expense.category] = currentAmount; // Keep existing value
        }
        return acc;
      },
      {}
    );
  };

  const value: ExpenseContextType = useMemo(() => ({
    expenses,
    loading,
    error,
    totalExpenses,
    totalPages,
    currentPage,
    recurringExpenseItems,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByPeriod,
    getTotalExpenses,
    getExpensesByCategory,
    fetchExpenses,
    fetchRecurringExpenseItems,
    addRecurringExpenseItem,
  }), [
    expenses,
    loading,
    error,
    totalExpenses,
    totalPages,
    currentPage,
    recurringExpenseItems,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByPeriod,
    getTotalExpenses,
    getExpensesByCategory,
    fetchExpenses,
    fetchRecurringExpenseItems,
  ]);

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};
