"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";
import { CustomerStats } from "@/src/types/crm";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  birthday?: string;
  customerType: "Regular" | "VIP" | "Wholesale";
  notes?: string;
  totalSpend: number;
  lastVisit?: string;
  loyaltyPoints: number;
  branchId: string;
  createdAt?: string;
  purchases?: Array<{
    id: string;
    date: string;
    amount: number;
    items: string[];
  }>;
}

interface CRMContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  addCustomer: (
    customer: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints" | "branchId">
  ) => Promise<Customer | undefined>;
  updateCustomer: (
    id: string,
    customerData: Partial<Customer>
  ) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  deleteCustomer: (id: string) => Promise<void>;
  searchCustomers: (searchTerm: string) => Promise<void>;
  fetchCustomers: () => Promise<Customer[]>;
  fetchCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerAnalytics: () => Promise<unknown>;
  getCustomerStats: () => Promise<CustomerStats>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      return [];
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/customers/branch/${currentBranchId}`,
        { headers }
      );

      // Handle both array and object responses
      const customerData = Array.isArray(response) ? response : (response.customers || []);

      setCustomers(customerData);
      setError(null);
      return customerData;
    } catch (err) {
      setError("Failed to fetch customers");
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchCustomerById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(`/customers/${id}`, { headers });

      // Update the customer in our local state if it exists
      setCustomers(prev => {
        const index = prev.findIndex(c => c.id === id);
        if (index !== -1) {
          const newCustomers = [...prev];
          newCustomers[index] = response;
          return newCustomers;
        }
        return [...prev, response];
      });

      setError(null);
      return response;
    } catch (err) {
      setError("Failed to fetch customer details");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const addCustomer = useCallback(async (
    customerData: Omit<
      Customer,
      "id" | "totalSpend" | "loyaltyPoints" | "branchId"
    > // Remove branchId
  ): Promise<Customer | undefined> => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      // Transform the data before sending - add branchId here
      const payload = {
        ...customerData,
        branchId: currentBranchId, // Add branchId from context
        // Convert ISO string to date-only format (YYYY-MM-DD)
        birthday: customerData.birthday
          ? customerData.birthday.split("T")[0]
          : undefined,
        // Ensure phone is string and meets length requirements
        phone: String(customerData.phone).trim(),
      };
      const response = await httpClient("/customers", {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });
      setCustomers((prev) => [...prev, response]);
      setError(null);
      return response;
    } catch (err: unknown) {
      setError("Failed to add customer");
      if (err instanceof Error) {
        const errorWithResponse = err as Error & { response?: { data?: unknown } };
        console.error("Detailed error:", errorWithResponse.response?.data || err.message);
      }
      console.error("Full error object:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const updateCustomer = useCallback(async (
    id: string,
    customerData: Partial<Customer>
  ) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(customerData),
        headers,
      });
      setCustomers((prev) =>
        prev.map((cust) => (cust.id === id ? response : cust))
      );
      setError(null);
    } catch (err) {
      setError("Failed to update customer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find((customer) => customer.id === id);
  }, [customers]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      await httpClient(`/customers/${id}`, {
        method: "DELETE",
        headers,
      });
      setCustomers((prev) => prev.filter((cust) => cust.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete customer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/customers/branch/${currentBranchId}?search=${encodeURIComponent(searchTerm)}`,
        { headers }
      );
      setCustomers(response.customers);
      setError(null);
    } catch (err) {
      setError("Failed to search customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const getCustomerAnalytics = useCallback(async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/api/v1/customers/branch/${currentBranchId}/analytics`,
        { headers }
      );
      return response;
    } catch (err) {
      setError("Failed to get customer analytics");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);

  const getCustomerStats = useCallback(async (): Promise<CustomerStats> => {
    if (!currentBranchId) {
      setError("No branch selected");
      return {
        totalCustomers: 0,
        newThisMonth: 0,
        totalSpend: 0,
        averageSpend: 0,
      };
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      // Fetch customers for the current branch
      const response = await httpClient(
        `/customers/branch/${currentBranchId}`,
        { headers }
      );

      const customers = response.customers || [];
      const totalCustomers = customers.length;

      // Calculate new customers this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const newThisMonth = customers.filter((customer: Customer) => {
        const createdDate = new Date(
          customer.createdAt || customer.lastVisit || new Date()
        );
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      }).length;

      // Calculate total and average spend
      const totalSpend = customers.reduce((sum: number, customer: Customer) => {
        // Ensure totalSpend is a number (it might come as string from API)
        const spend =
          typeof customer.totalSpend === "string"
            ? parseFloat(customer.totalSpend)
            : customer.totalSpend || 0;
        return sum + spend;
      }, 0);

      const averageSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0;

      return {
        totalCustomers,
        newThisMonth,
        totalSpend,
        averageSpend,
      };
    } catch (err) {
      setError("Failed to get customer stats");
      console.error("Get stats error:", err);
      return {
        totalCustomers: 0,
        newThisMonth: 0,
        totalSpend: 0,
        averageSpend: 0,
      };
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getAuthHeaders]);
  return (
    <CRMContext.Provider
      value={{
        customers,
        loading,
        error,
        addCustomer,
        updateCustomer,
        getCustomerById,
        deleteCustomer,
        searchCustomers,
        fetchCustomers,
        fetchCustomerById,
        getCustomerAnalytics,
        getCustomerStats,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
