

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { createContext, useState, useContext, ReactNode } from "react";
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
  totalSpend:  number;
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
    customer: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">
  ) => Promise<void>;
  updateCustomer: (
    id: string,
    customerData: Partial<Customer>
  ) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  deleteCustomer: (id: string) => Promise<void>;
  searchCustomers: (searchTerm: string) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  getCustomerAnalytics: () => Promise<any>;
  getCustomerStats: () => Promise<CustomerStats>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/customers/branch/${currentBranchId}`,
        { headers }
      );
      setCustomers(response.customers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (
    customerData: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">
  ) => {
    if (!currentBranchId) {
      setError("No branch selected");
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      // Transform the data before sending
      const payload = {
        ...customerData,
        branchId: currentBranchId,
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
    } catch (err: any) {
      setError("Failed to add customer");
      console.error("Detailed error:", err.response?.data || err.message);
      throw err; // Re-throw to handle in calling component
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (
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
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find((customer) => customer.id === id);
  };

  const deleteCustomer = async (id: string) => {
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
  };

  const searchCustomers = async (searchTerm: string) => {
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
  };

  const getCustomerAnalytics = async () => {
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
  };

 const getCustomerStats = async (): Promise<CustomerStats> => {
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
      const createdDate = new Date(customer.createdAt || customer.lastVisit || new Date());
      return (
        createdDate.getMonth() === currentMonth && 
        createdDate.getFullYear() === currentYear
      );
    }).length;
    
    // Calculate total and average spend
    const totalSpend = customers.reduce((sum: number, customer: Customer) => {
      // Ensure totalSpend is a number (it might come as string from API)
      const spend = typeof customer.totalSpend === 'string' 
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
};
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


// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"
// import type { Customer, CustomerStats, CreateCustomerData, UpdateCustomerData } from "@/src/types/crm"

// interface CRMContextType {
//   customers: Customer[]
//   loading: boolean
//   error: string | null
//   searchCustomers: (query: string) => Promise<void>
//   getCustomerById: (id: string) => Promise<Customer | null>
//   addCustomer: (data: CreateCustomerData) => Promise<Customer>
//   updateCustomer: (id: string, data: UpdateCustomerData) => Promise<Customer>
//   deleteCustomer: (id: string) => Promise<void>
//   getCustomerStats: () => Promise<CustomerStats>
// }

// const CRMContext = createContext<CRMContextType | undefined>(undefined)

// // Mock data for demonstration
// const mockCustomers: Customer[] = [
//   {
//     id: "1",
//     name: "John Doe",
//     phone: "+256701234567",
//     email: "john.doe@email.com",
//     gender: "Male",
//     birthday: "1990-05-15",
//     customerType: "VIP",
//     notes: "Frequent customer, prefers organic products",
//     totalSpend: 2500000,
//     lastVisit: "2024-01-15",
//     loyaltyPoints: 250,
//     branchId: "branch-1",
//     createdAt: "2023-12-01",
//     updatedAt: "2024-01-15",
//     purchases: [
//       {
//         id: "p1",
//         date: "2024-01-15",
//         amount: 150000,
//         items: ["Rice 5kg", "Cooking Oil 2L", "Sugar 1kg"],
//         customerId: "1",
//       },
//       {
//         id: "p2",
//         date: "2024-01-10",
//         amount: 85000,
//         items: ["Bread", "Milk 1L", "Eggs 12pcs"],
//         customerId: "1",
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     phone: "+256702345678",
//     email: "jane.smith@email.com",
//     gender: "Female",
//     birthday: "1985-08-22",
//     customerType: "Regular",
//     notes: "Prefers evening shopping",
//     totalSpend: 1800000,
//     lastVisit: "2024-01-12",
//     loyaltyPoints: 180,
//     branchId: "branch-1",
//     createdAt: "2023-11-15",
//     updatedAt: "2024-01-12",
//     purchases: [
//       {
//         id: "p3",
//         date: "2024-01-12",
//         amount: 120000,
//         items: ["Chicken 1kg", "Tomatoes 2kg", "Onions 1kg"],
//         customerId: "2",
//       },
//     ],
//   },
//   {
//     id: "3",
//     name: "Robert Johnson",
//     phone: "+256703456789",
//     email: "robert.j@email.com",
//     gender: "Male",
//     customerType: "Wholesale",
//     notes: "Bulk buyer for restaurant",
//     totalSpend: 5200000,
//     lastVisit: "2024-01-14",
//     loyaltyPoints: 520,
//     branchId: "branch-1",
//     createdAt: "2023-10-20",
//     updatedAt: "2024-01-14",
//     purchases: [
//       {
//         id: "p4",
//         date: "2024-01-14",
//         amount: 850000,
//         items: ["Rice 25kg", "Cooking Oil 10L", "Flour 10kg"],
//         customerId: "3",
//       },
//     ],
//   },
//   {
//     id: "4",
//     name: "Mary Williams",
//     phone: "+256704567890",
//     email: "mary.w@email.com",
//     gender: "Female",
//     birthday: "1992-03-10",
//     customerType: "Regular",
//     totalSpend: 950000,
//     lastVisit: "2024-01-11",
//     loyaltyPoints: 95,
//     branchId: "branch-1",
//     createdAt: "2023-12-10",
//     updatedAt: "2024-01-11",
//     purchases: [],
//   },
//   {
//     id: "5",
//     name: "David Brown",
//     phone: "+256705678901",
//     customerType: "VIP",
//     notes: "Corporate account",
//     totalSpend: 3200000,
//     lastVisit: "2024-01-13",
//     loyaltyPoints: 320,
//     branchId: "branch-1",
//     createdAt: "2023-11-05",
//     updatedAt: "2024-01-13",
//     purchases: [
//       {
//         id: "p5",
//         date: "2024-01-13",
//         amount: 450000,
//         items: ["Office Supplies", "Beverages", "Snacks"],
//         customerId: "5",
//       },
//     ],
//   },
// ]

// export function CRMProvider({ children }: { children: React.ReactNode }) {
//   const [customers, setCustomers] = useState<Customer[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     // Initialize with mock data
//     setCustomers(mockCustomers)
//   }, [])

//   const searchCustomers = async (query: string) => {
//     setLoading(true)
//     setError(null)

//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 500))

//       if (!query.trim()) {
//         setCustomers(mockCustomers)
//       } else {
//         const filtered = mockCustomers.filter(
//           (customer) =>
//             customer.name.toLowerCase().includes(query.toLowerCase()) ||
//             customer.phone.includes(query) ||
//             (customer.email && customer.email.toLowerCase().includes(query.toLowerCase())),
//         )
//         setCustomers(filtered)
//       }
//     } catch (err) {
//       setError("Failed to search customers")
//       console.error("Search error:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getCustomerById = async (id: string): Promise<Customer | null> => {
//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 300))

//       const customer = mockCustomers.find((c) => c.id === id)
//       return customer || null
//     } catch (err) {
//       setError("Failed to get customer")
//       console.error("Get customer error:", err)
//       return null
//     }
//   }

//   const addCustomer = async (data: CreateCustomerData): Promise<Customer> => {
//     setLoading(true)
//     setError(null)

//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       const newCustomer: Customer = {
//         id: Date.now().toString(),
//         ...data,
//         totalSpend: 0,
//         loyaltyPoints: 0,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         purchases: [],
//       }

//       mockCustomers.push(newCustomer)
//       setCustomers([...mockCustomers])

//       return newCustomer
//     } catch (err) {
//       setError("Failed to add customer")
//       console.error("Add customer error:", err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateCustomer = async (id: string, data: UpdateCustomerData): Promise<Customer> => {
//     setLoading(true)
//     setError(null)

//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       const index = mockCustomers.findIndex((c) => c.id === id)
//       if (index === -1) {
//         throw new Error("Customer not found")
//       }

//       const updatedCustomer = {
//         ...mockCustomers[index],
//         ...data,
//         updatedAt: new Date().toISOString(),
//       }

//       mockCustomers[index] = updatedCustomer
//       setCustomers([...mockCustomers])

//       return updatedCustomer
//     } catch (err) {
//       setError("Failed to update customer")
//       console.error("Update customer error:", err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const deleteCustomer = async (id: string): Promise<void> => {
//     setLoading(true)
//     setError(null)

//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       const index = mockCustomers.findIndex((c) => c.id === id)
//       if (index === -1) {
//         throw new Error("Customer not found")
//       }

//       mockCustomers.splice(index, 1)
//       setCustomers([...mockCustomers])
//     } catch (err) {
//       setError("Failed to delete customer")
//       console.error("Delete customer error:", err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getCustomerStats = async (): Promise<CustomerStats> => {
//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 300))

//       const totalCustomers = mockCustomers.length
//       const currentMonth = new Date().getMonth()
//       const currentYear = new Date().getFullYear()

//       const newThisMonth = mockCustomers.filter((customer) => {
//         const createdDate = new Date(customer.createdAt)
//         return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
//       }).length

//       const totalSpend = mockCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0)
//       const averageSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0

//       return {
//         totalCustomers,
//         newThisMonth,
//         totalSpend,
//         averageSpend,
//       }
//     } catch (err) {
//       console.error("Get stats error:", err)
//       return {
//         totalCustomers: 0,
//         newThisMonth: 0,
//         totalSpend: 0,
//         averageSpend: 0,
//       }
//     }
//   }

//   const value: CRMContextType = {
//     customers,
//     loading,
//     error,
//     searchCustomers,
//     getCustomerById,
//     addCustomer,
//     updateCustomer,
//     deleteCustomer,
//     getCustomerStats,
//   }

//   return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>
// }

// export function useCRM() {
//   const context = useContext(CRMContext)
//   if (context === undefined) {
//     throw new Error("useCRM must be used within a CRMProvider")
//   }
//   return context
// }