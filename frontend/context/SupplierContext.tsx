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
  Supplier,
  SupplierOrder,
  SupplierPayment,
  SupplierStats,
  CreateSupplierData,
  RecordPaymentData,
  CreateOrderData,
  SupplierReport,
} from "@/src/types/supplier";
import { httpClient } from "@/src/data/api/httpClient";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { useBranch } from "./BranchContext";
import { Item } from "./DataContext";

const BASE_URL = "/suppliers";

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  fetchSuppliers: (filters?: { branchId?: string }) => Promise<void>;
  refetchSuppliers: (filters?: { branchId?: string }) => Promise<void>;
  addSupplier: (data: CreateSupplierData) => Promise<Supplier | null>;
  updateSupplier: (
    id: string,
    data: Partial<Supplier>
  ) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Promise<Supplier | null>;
  getSupplierOrders: (supplierId: string) => Promise<SupplierOrder[]>;
  createOrder: (data: CreateOrderData) => Promise<SupplierOrder | null>;
  updateOrder: (
    orderId: string,
    data: Partial<CreateOrderData>
  ) => Promise<SupplierOrder | null>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Promise<SupplierOrder | null>;
  getSupplierPayments: (supplierId: string) => Promise<SupplierPayment[]>;
  recordPayment: (supplierId: string, data: RecordPaymentData) => Promise<void>;
  updatePayment: (
    paymentId: string,
    data: Partial<RecordPaymentData>
  ) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  getPaymentById: (paymentId: string) => Promise<SupplierPayment | null>;
  getSupplierStats: () => Promise<SupplierStats | null>;
  getSupplierReport: (supplierId: string) => Promise<SupplierReport | null>;
  exportSupplierReport: (
    supplierId: string,
    format: "csv" | "pdf" | "excel"
  ) => Promise<Blob>;
  bulkCreateSuppliers: (
    suppliers: CreateSupplierData[]
  ) => Promise<{ success: Supplier[]; errors: any[] } | null>;
  createOrderFromRestock: (
    supplierId: string,
    item: Item,
    quantity: number
  ) => Promise<SupplierOrder | null>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const { getAuthHeaders, currentBusinessId } = useAuth();
  const { currentBranch } = useBranch();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSuppliersGeneral = useCallback(
    async (filters: { branchId?: string } = {}) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams({
          businessId: currentBusinessId || "",
          ...filters,
        }).toString();
        const { suppliers: fetchedSuppliers } = await httpClient(
          `${BASE_URL}?${queryParams}`,
          { headers }
        );
        setSuppliers(fetchedSuppliers);
      } catch (error: any) {
        toast({
          title: "Error fetching suppliers",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBusinessId]
  );

  const fetchSuppliers = useCallback(
    async (filters: { branchId?: string } = {}) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        // Remove businessId from query params since it's already in the URL path
        const queryParams = new URLSearchParams();

        // Only add branchId to query params if it exists
        if (filters.branchId) {
          queryParams.append("branchId", filters.branchId);
        }

        const queryString = queryParams.toString();
        const url = `/businesses/business/${currentBusinessId}/suppliers${queryString ? `?${queryString}` : ""}`;

        const { suppliers: fetchedSuppliers } = await httpClient(url, {
          headers,
        });
        setSuppliers(fetchedSuppliers);
      } catch (error: any) {
        toast({
          title: "Error fetching suppliers",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBusinessId]
  );

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const addSupplier = async (
    data: CreateSupplierData
  ): Promise<Supplier | null> => {
    try {
      const headers = await getAuthHeaders();
      const payload = {
        ...data,
        businessId: currentBusinessId,
        branchId: data.branchId || currentBranch?.id,
      };
      const newSupplier = await httpClient(BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      await fetchSuppliers();
      toast({
        title: "Success",
        description: "Supplier added successfully.",
      });
      return newSupplier;
    } catch (error: any) {
      toast({
        title: "Error adding supplier",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrder = async (
    orderId: string,
    data: Partial<CreateOrderData>
  ): Promise<SupplierOrder | null> => {
    try {
      const headers = await getAuthHeaders();
      const updatedOrder = await httpClient(`${BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      await fetchSuppliers(); // Refetch suppliers to update outstanding balances
      toast({
        title: "Success",
        description: "Order updated successfully.",
      });
      return updatedOrder;
    } catch (error: any) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`${BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers,
      });
      await fetchSuppliers(); // Refetch suppliers to update outstanding balances
      toast({
        title: "Success",
        description: "Order deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPaymentById = async (
    paymentId: string
  ): Promise<SupplierPayment | null> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/payments/${paymentId}`, { headers });
    } catch (error: any) {
      toast({
        title: `Error fetching payment ${paymentId}`,
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePayment = async (
    paymentId: string,
    data: Partial<RecordPaymentData>
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`${BASE_URL}/payments/${paymentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      await fetchSuppliers(); // Refetch to update outstanding balances
      toast({
        title: "Success",
        description: "Payment updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePayment = async (paymentId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`${BASE_URL}/payments/${paymentId}`, {
        method: "DELETE",
        headers,
      });
      await fetchSuppliers(); // Refetch to update outstanding balances
      toast({
        title: "Success",
        description: "Payment deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getOrderById = async (
    orderId: string
  ): Promise<SupplierOrder | null> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/orders/${orderId}`, { headers });
    } catch (error: any) {
      toast({
        title: `Error fetching order ${orderId}`,
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`${BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });
      await fetchSuppliers(); // Refetch suppliers to update outstanding balances
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSupplier = async (
    id: string,
    data: Partial<CreateSupplierData>
  ): Promise<Supplier | null> => {
    try {
      const headers = await getAuthHeaders();
      const updatedSupplier = await httpClient(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      await fetchSuppliers();
      toast({
        title: "Success",
        description: "Supplier updated successfully.",
      });
      return updatedSupplier;
    } catch (error: any) {
      toast({
        title: "Error updating supplier",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      await httpClient(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers,
      });
      await fetchSuppliers();
      toast({
        title: "Success",
        description: "Supplier deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting supplier",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSupplierById = async (id: string): Promise<Supplier | null> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/${id}`, { headers });
    } catch (error: any) {
      toast({
        title: `Error fetching supplier ${id}`,
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getSupplierOrders = async (
    supplierId: string
  ): Promise<SupplierOrder[]> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/${supplierId}/orders`, { headers });
    } catch (error: any) {
      toast({
        title: `Error fetching orders for supplier ${supplierId}`,
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const createOrder = async (
    data: CreateOrderData
  ): Promise<SupplierOrder | null> => {
    try {
      const headers = await getAuthHeaders();

      // Add branchId to the order data
      const orderDataWithBranch = {
        ...data,
        branchId: currentBranch?.id,
        date: new Date(data.date),
      };
      const newOrder = await httpClient(`${BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderDataWithBranch),
      });

      await fetchSuppliers(); // Refetch suppliers to update outstanding balances
      toast({
        title: "Success",
        description: "Order created successfully.",
      });
      return newOrder;
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getSupplierPayments = async (
    supplierId: string
  ): Promise<SupplierPayment[]> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/supplier/${supplierId}/payments`, {
        headers,
      });
    } catch (error: any) {
      toast({
        title: `Error fetching payments for supplier ${supplierId}`,
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const recordPayment = async (
    supplierId: string,
    data: RecordPaymentData
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders();

      // Convert date string to Date object
      const payload = {
        ...data,
        supplierId,
        date: new Date(data.date), // Convert to Date object
        businessId: currentBusinessId,
        branchId: currentBranch?.id,
      };
      console.log("Recording payment with payload:", payload);
      await httpClient(`${BASE_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      await fetchSuppliers();
      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSupplierStats = async (): Promise<SupplierStats | null> => {
    try {
      if (!currentBusinessId) return null;
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `${BASE_URL}/stats/${currentBusinessId}`,
        {
          headers,
        }
      );
      return response;
    } catch (error: any) {
      toast({
        title: "Error fetching supplier stats",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getSupplierReport = async (
    supplierId: string
  ): Promise<SupplierReport | null> => {
    try {
      const headers = await getAuthHeaders();
      return await httpClient(`${BASE_URL}/supplier/${supplierId}/report`, {
        headers,
      });
    } catch (error: any) {
      toast({
        title: `Error fetching report for supplier ${supplierId}`,
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const exportSupplierReport = async (
    supplierId: string,
    format: "csv" | "pdf" | "excel"
  ): Promise<Blob> => {
    try {
      const headers = await getAuthHeaders();

      const response = await httpClient(
        `/suppliers/supplier/${supplierId}/report/export?format=${format}`,
        {
          headers,
        }
      );

      return response;
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  const bulkCreateSuppliers = async (
    suppliers: CreateSupplierData[]
  ): Promise<{ success: Supplier[]; errors: any[] } | null> => {
    try {
      const headers = await getAuthHeaders();
      const result = await httpClient(`${BASE_URL}/bulk`, {
        method: "POST",
        headers,
        body: JSON.stringify({ suppliers }),
      });
      await fetchSuppliers();
      toast({
        title: "Success",
        description: "Bulk supplier import completed.",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error during bulk import",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createOrderFromRestock = async (
    supplierId: string,
    item: any,
    quantity: number
  ): Promise<SupplierOrder | null> => {
    const orderData: CreateOrderData = {
      supplierId,
      date: new Date().toISOString(),
      items: [
        {
          productName: item.name,
          quantity,
          unitPrice: item.purchasePrice || 0,
          totalPrice: (item.purchasePrice || 0) * quantity,
        },
      ],
      notes: `Restock for item: ${item.name}`,
    };
    return createOrder(orderData);
  };

  const value: SupplierContextType = {
    suppliers,
    loading,
    fetchSuppliers,
    refetchSuppliers: fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getSupplierOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getOrderById,
    getSupplierPayments,
    recordPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    getSupplierStats,
    getSupplierReport,
    exportSupplierReport,
    bulkCreateSuppliers,
    createOrderFromRestock,
    completeOrder: async (orderId: string): Promise<void> => {
      try {
        const headers = await getAuthHeaders();
        await httpClient(`${BASE_URL}/orders/${orderId}/complete`, {
          method: "PUT",
          headers,
        });
        await fetchSuppliers(); // Refetch suppliers to update outstanding balances
        toast({
          title: "Success",
          description: "Order completed and inventory updated.",
        });
      } catch (error: any) {
        toast({
          title: "Error completing order",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error("useSupplier must be used within a SupplierProvider");
  }
  return context;
}
