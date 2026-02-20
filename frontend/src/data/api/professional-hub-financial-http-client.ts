import { httpClient } from "./httpClient";
import { IncomeRecord, ExpenseRecord } from "@/src/types/professionalHubFinancials";

export interface FinancialFilters {
  startDate?: Date;
  endDate?: Date;
}

export const createProfessionalHubFinancialApi = (getAuthHeaders: () => Promise<Record<string, string>>) => {
  return {
    // Income operations
    createIncome: async (data: Omit<IncomeRecord, "id"> & { branchId: string }) => {
      const headers = await getAuthHeaders();
      return httpClient("/professional-hub/financials/income", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      });
    },

    getIncomes: async (branchId: string, filters: FinancialFilters = {}) => {
      const query = new URLSearchParams();
      if (filters.startDate) query.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) query.append("endDate", filters.endDate.toISOString());

      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/income/${branchId}?${query.toString()}`, {
        headers,
      });
    },

    getIncome: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/income/record/${id}`, {
        headers,
      });
    },

    updateIncome: async (id: string, data: Partial<IncomeRecord>) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/income/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers,
      });
    },

    deleteIncome: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/income/${id}`, {
        method: "DELETE",
        headers,
      });
    },

    // Expense operations
    createExpense: async (data: Omit<ExpenseRecord, "id"> & { branchId: string }) => {
      const headers = await getAuthHeaders();
      return httpClient("/professional-hub/financials/expense", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      });
    },

    getExpenses: async (branchId: string, filters: FinancialFilters = {}) => {
      const query = new URLSearchParams();
      if (filters.startDate) query.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) query.append("endDate", filters.endDate.toISOString());

      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/expense/${branchId}?${query.toString()}`, {
        headers,
      });
    },

    getExpense: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/expense/record/${id}`, {
        headers,
      });
    },

    updateExpense: async (id: string, data: Partial<ExpenseRecord>) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/expense/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers,
      });
    },

    deleteExpense: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/financials/expense/${id}`, {
        method: "DELETE",
        headers,
      });
    },
  };
};
