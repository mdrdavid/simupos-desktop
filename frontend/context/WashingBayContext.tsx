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
import { useAuth } from "./AuthContext";
import {
  WashingBayServiceType,
  WashingBayWorker,
  WashingBayWashOrder,
  WashingBayMaterialUsage,
  WashingBayWorkerCommission,
  WashingBayDailySummary,
  ProfitAnalytics,
  BulkCreateUsersResult,
  CreateServiceTypeRequest,
  CreateWorkerRequest,
  CreateWashOrderRequest,
  AddMaterialUsageRequest,
  MarkCommissionsPaidRequest,
  BulkCreateUsersRequest,
  VehicleType,
  WashType,
  WashOrderStatus,
  PaymentStatus,
  WorkerPerformanceAnalytics,
} from "@/src/types/washingBay";

interface WashingBayContextType {
  // State
  serviceTypes: WashingBayServiceType[];
  workers: WashingBayWorker[];
  washOrders: WashingBayWashOrder[];
  materialUsages: WashingBayMaterialUsage[];
  commissions: WashingBayWorkerCommission[];
  dailySummaries: WashingBayDailySummary[];
  loading: boolean;
  error: string | null;

  // Service Type Methods
  createServiceType: (
    data: CreateServiceTypeRequest
  ) => Promise<WashingBayServiceType>;
  getServiceTypes: (filters?: {
    vehicleType?: VehicleType;
    washType?: WashType;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<{ serviceTypes: WashingBayServiceType[]; pagination: any }>;
  updateServiceType: (
    id: string,
    data: Partial<WashingBayServiceType>
  ) => Promise<WashingBayServiceType>;

  // Worker Methods
  createWorker: (data: CreateWorkerRequest) => Promise<WashingBayWorker>;
  getWorkers: (filters?: {
    isActive?: boolean;
    withUser?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<{ workers: WashingBayWorker[]; pagination: any }>;
  updateWorker: (
    id: string,
    data: Partial<WashingBayWorker>
  ) => Promise<WashingBayWorker>;
  getWorkerWithUser: (id: string) => Promise<WashingBayWorker>;
  createUserForWorker: (workerId: string) => Promise<WashingBayWorker>;
  deactivateWorkerWithUser: (workerId: string) => Promise<WashingBayWorker>;
  getWorkersWithoutUserAccounts: () => Promise<WashingBayWorker[]>;
  bulkCreateUserAccounts: (
    data: BulkCreateUsersRequest
  ) => Promise<BulkCreateUsersResult>;
  deleteWorker: (id: string) => Promise<void>;
  // Wash Order Methods
  createWashOrder: (
    data: CreateWashOrderRequest
  ) => Promise<WashingBayWashOrder>;
  getWashOrders: (filters?: {
    status?: WashOrderStatus;
    paymentStatus?: PaymentStatus;
    period?: "day" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<{
    orders: WashingBayWashOrder[];
    pagination: any;
    summary?: {
      period: {
        type: string;
        startDate: string;
        endDate: string;
      };
      totalOrders: number;
      totalRevenue: number;
      completedOrders: number;
    };
  }>;
  updateWashOrder: (
    id: string,
    data: Partial<WashingBayWashOrder>
  ) => Promise<WashingBayWashOrder>;

  updateWashOrderStatus: (
    id: string,
    status: WashOrderStatus
  ) => Promise<WashingBayWashOrder>;

  updateWashOrderPaymentStatus: (
    id: string,
    paymentStatus: PaymentStatus
  ) => Promise<WashingBayWashOrder>;

  deleteWashOrder: (id: string) => Promise<void>;
  addMaterialUsage: (
    data: AddMaterialUsageRequest
  ) => Promise<WashingBayMaterialUsage>;

  // Commission Methods
  markCommissionAsPaid: (
    commissionId: string
  ) => Promise<WashingBayWorkerCommission>;
  markCommissionsAsPaid: (
    data: MarkCommissionsPaidRequest
  ) => Promise<WashingBayWorkerCommission[]>;

  getWorkerCommissions: (filters?: {
    workerId?: string;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
    period?: "day" | "week" | "month" | "custom";
    page?: number;
    limit?: number;
  }) => Promise<{
    commissions: WashingBayWorkerCommission[];
    pagination: any;
    summary?: {
      // Make summary optional
      totalCommission?: number;
      paidCommission?: number;
      unpaidCommission?: number;
      totalCount?: number;
      paidCount?: number;
      unpaidCount?: number;
    };
  }>;

  markAllCommissionsAsPaidForWorker: (
    workerId: string,
    filters: {
      period?: "day" | "week" | "month" | "custom";
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<any>;

  deleteCommission: (id: string) => Promise<void>;

  bulkDeleteCommissions: (commissionIds: string[]) => Promise<void>;

  // Reporting Methods
  getDailySummary: (date?: string) => Promise<any>;
  generateDailySummary: (date?: string) => Promise<WashingBayDailySummary>;
  getProfitAnalytics: (filters: {
    period: "day" | "week" | "month" | "year";
    startDate: string;
    endDate: string;
  }) => Promise<ProfitAnalytics>;

  // Data Fetching
  fetchServiceTypes: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
  fetchWashOrders: (filters?: {
    status?: WashOrderStatus;
    paymentStatus?: PaymentStatus;
    period?: "day" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;

  // Worker Performance Analytics
  workerPerformanceAnalytics: WorkerPerformanceAnalytics | null;
  getWorkerPerformanceAnalytics: (filters?: {
    period?: "day" | "week" | "month" | "custom";
    startDate?: string;
    endDate?: string;
    workerId?: string;
  }) => Promise<WorkerPerformanceAnalytics>;
  fetchWorkerPerformanceAnalytics: (filters?: {
    period?: "day" | "week" | "month" | "custom";
    startDate?: string;
    endDate?: string;
    workerId?: string;
  }) => Promise<void>;

  // Worker Statistics Methods
  getWorkerStatistics: (
    workerId: string,
    filters?: {
      period?: "day" | "week" | "month" | "custom";
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<any>;

  getWorkerWithStatistics: (
    workerId: string,
    filters?: {
      period?: "day" | "week" | "month" | "custom";
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<any>;
}

const WashingBayContext = createContext<WashingBayContextType | undefined>(
  undefined
);

export const useWashingBay = (): WashingBayContextType => {
  const context = useContext(WashingBayContext);
  if (!context) {
    throw new Error("useWashingBay must be used within a WashingBayProvider");
  }
  return context;
};

interface WashingBayProviderProps {
  children: ReactNode;
}

export const WashingBayProvider = ({ children }: WashingBayProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [serviceTypes, setServiceTypes] = useState<WashingBayServiceType[]>([]);
  const [workers, setWorkers] = useState<WashingBayWorker[]>([]);
  const [washOrders, setWashOrders] = useState<WashingBayWashOrder[]>([]);
  const [materialUsages, setMaterialUsages] = useState<
    WashingBayMaterialUsage[]
  >([]);
  const [commissions, setCommissions] = useState<WashingBayWorkerCommission[]>(
    []
  );
  const [dailySummaries, setDailySummaries] = useState<
    WashingBayDailySummary[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [workerPerformanceAnalytics, setWorkerPerformanceAnalytics] =
    useState<WorkerPerformanceAnalytics | null>(null);
  // Helper function to handle API calls
  const handleApiCall = async <T,>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    if (!currentBranchId) {
      throw new Error("No branch selected");
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Service Type Methods
  const createServiceType = useCallback(
    async (data: CreateServiceTypeRequest) => {
      console.log("data", data);
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/washing-bay/service-types", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setServiceTypes((prev) => [response, ...prev]);
        return response;
      }, "Failed to create service type");
    },
    [getAuthHeaders]
  );

  const getServiceTypes = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.vehicleType)
          queryParams.append("vehicleType", filters.vehicleType);
        if (filters?.washType) queryParams.append("washType", filters.washType);
        if (filters?.isActive !== undefined)
          queryParams.append("isActive", filters.isActive.toString());
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/washing-bay/service-types/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch service types");
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateServiceType = useCallback(
    async (id: string, data: Partial<WashingBayServiceType>) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/washing-bay/service-types/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
          headers,
        });
        setServiceTypes((prev) =>
          prev.map((st) => (st.id === id ? response : st))
        );
        return response;
      }, "Failed to update service type");
    },
    [getAuthHeaders]
  );

  const fetchServiceTypes = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const response = await getServiceTypes();
      setServiceTypes(response.serviceTypes);
    } catch (err) {
      setError("Failed to fetch service types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getServiceTypes]);

  // Worker Methods
  const createWorker = useCallback(
    async (data: CreateWorkerRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/washing-bay/workers", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setWorkers((prev) => [response, ...prev]);
        return response;
      }, "Failed to create worker");
    },
    [getAuthHeaders]
  );

  const getWorkers = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.isActive !== undefined)
          queryParams.append("isActive", filters.isActive.toString());
        if (filters?.withUser !== undefined)
          queryParams.append("withUser", filters.withUser.toString());
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/washing-bay/workers/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch workers");
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateWorker = useCallback(
    async (id: string, data: Partial<WashingBayWorker>) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/washing-bay/workers/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
          headers,
        });
        setWorkers((prev) =>
          prev.map((worker) => (worker.id === id ? response : worker))
        );
        return response;
      }, "Failed to update worker");
    },
    [getAuthHeaders]
  );

  const getWorkerWithUser = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/workers/${id}/with-user`,
          {
            headers,
          }
        );
        return response;
      }, "Failed to fetch worker with user");
    },
    [getAuthHeaders]
  );

  const createUserForWorker = useCallback(
    async (workerId: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/workers/${workerId}/create-user`,
          {
            method: "POST",
            headers,
          }
        );
        setWorkers((prev) =>
          prev.map((worker) => (worker.id === workerId ? response : worker))
        );
        return response;
      }, "Failed to create user for worker");
    },
    [getAuthHeaders]
  );

  const deactivateWorkerWithUser = useCallback(
    async (workerId: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/workers/${workerId}/deactivate`,
          {
            method: "PATCH",
            headers,
          }
        );
        setWorkers((prev) =>
          prev.map((worker) => (worker.id === workerId ? response : worker))
        );
        return response;
      }, "Failed to deactivate worker");
    },
    [getAuthHeaders]
  );

  const getWorkersWithoutUserAccounts = useCallback(async () => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/washing-bay/workers/branch/${currentBranchId}/without-users`,
        { headers }
      );
      return response;
    }, "Failed to fetch workers without user accounts");
  }, [currentBranchId, getAuthHeaders]);

  const bulkCreateUserAccounts = useCallback(
    async (data: BulkCreateUsersRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          "/washing-bay/workers/bulk-create-users",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers,
          }
        );

        // Update workers in state
        if (response.successful.length > 0) {
          setWorkers((prev) =>
            prev.map((worker) => {
              const updatedWorker = response.successful.find(
                (w: any) => w.id === worker.id
              );
              return updatedWorker || worker;
            })
          );
        }

        return response;
      }, "Failed to bulk create user accounts");
    },
    [getAuthHeaders]
  );

  const fetchWorkers = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const response = await getWorkers();
      setWorkers(response.workers);
    } catch (err) {
      setError("Failed to fetch workers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getWorkers]);

  const deleteWorker = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        await httpClient(`/washing-bay/workers/${id}`, {
          method: "DELETE",
          headers,
        });
        setWorkers((prev) => prev.filter((worker) => worker.id !== id));
      }, "Failed to delete worker");
    },
    [getAuthHeaders]
  );
  // Wash Order Methods
  const createWashOrder = useCallback(
    async (data: CreateWashOrderRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/washing-bay/wash-orders", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setWashOrders((prev) => [response, ...prev]);
        return response;
      }, "Failed to create wash order");
    },
    [getAuthHeaders]
  );

  const getWashOrders = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.paymentStatus)
          queryParams.append("paymentStatus", filters.paymentStatus);
        if (filters?.period) queryParams.append("period", filters.period); // Add this line
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/washing-bay/wash-orders/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );

        console.log("Wash Orders API Response:", response);
        return response;
      }, "Failed to fetch wash orders");
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateWashOrderStatus = useCallback(
    async (id: string, status: WashOrderStatus) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/wash-orders/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
          }
        );
        setWashOrders((prev) =>
          prev.map((order) => (order.id === id ? response : order))
        );
        return response;
      }, "Failed to update wash order status");
    },
    [getAuthHeaders]
  );

  const updateWashOrderPaymentStatus = useCallback(
    async (id: string, paymentStatus: PaymentStatus) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/wash-orders/${id}/payment-status`,
          {
            method: "PATCH",
            body: JSON.stringify({ paymentStatus }),
            headers,
          }
        );
        setWashOrders((prev) =>
          prev.map((order) => (order.id === id ? response : order))
        );
        return response;
      }, "Failed to update wash order payment status");
    },
    [getAuthHeaders]
  );

  const deleteWashOrder = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        await httpClient(`/washing-bay/wash-orders/${id}`, {
          method: "DELETE",
          headers,
        });
        setWashOrders((prev) => prev.filter((order) => order.id !== id));
      }, "Failed to delete wash order");
    },
    [getAuthHeaders]
  );
  const addMaterialUsage = useCallback(
    async (data: AddMaterialUsageRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/washing-bay/material-usage", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setMaterialUsages((prev) => [response, ...prev]);
        return response;
      }, "Failed to add material usage");
    },
    [getAuthHeaders]
  );

  const fetchWashOrders = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) return;

      try {
        setLoading(true);
        const response = await getWashOrders(filters);
        setWashOrders(response.orders || []);
      } catch (err) {
        setError("Failed to fetch wash orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getWashOrders]
  );

  const updateWashOrder = useCallback(
    async (id: string, data: Partial<WashingBayWashOrder>) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/washing-bay/wash-orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
          headers,
        });
        setWashOrders((prev) =>
          prev.map((order) => (order.id === id ? response : order))
        );
        return response;
      }, "Failed to update wash order");
    },
    [getAuthHeaders]
  );
  // Commission Methods
  const markCommissionsAsPaid = useCallback(
    async (data: MarkCommissionsPaidRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          "/washing-bay/commissions/mark-paid",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers,
          }
        );
        setCommissions((prev) =>
          prev.map((commission) =>
            data.commissionIds.includes(commission.id)
              ? {
                  ...commission,
                  isPaid: true,
                  paidAt: new Date().toISOString(),
                }
              : commission
          )
        );
        return response;
      }, "Failed to mark commissions as paid");
    },
    [getAuthHeaders]
  );
  const markCommissionAsPaid = useCallback(
    async (commissionId: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          "/washing-bay/commissions/mark-paid",
          {
            method: "POST",
            body: JSON.stringify({
              commissionIds: [commissionId],
              branchId: currentBranchId,
            }),
            headers,
          }
        );

        // Update the commission in state
        setCommissions((prev) =>
          prev.map((commission) =>
            commission.id === commissionId
              ? {
                  ...commission,
                  isPaid: true,
                  paidAt: new Date().toISOString(),
                }
              : commission
          )
        );

        return response[0]; // Return the first (and only) updated commission
      }, "Failed to mark commission as paid");
    },
    [currentBranchId, getAuthHeaders]
  );
  const getWorkerCommissions = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.workerId) queryParams.append("workerId", filters.workerId);
        if (filters?.isPaid !== undefined)
          queryParams.append("isPaid", filters.isPaid.toString());
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.period) queryParams.append("period", filters.period); // Add this line
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/washing-bay/commissions/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        console.log("API Response:", response);
        return response;
      }, "Failed to fetch worker commissions");
    },
    [currentBranchId, getAuthHeaders]
  );

  const markAllCommissionsAsPaidForWorker = useCallback(
    async (workerId: string, filters: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/commissions/worker/${workerId}/mark-all-paid`,
          {
            method: "POST",
            body: JSON.stringify(filters),
            headers,
          }
        );
        return response;
      }, "Failed to mark all commissions as paid");
    },
    [getAuthHeaders]
  );

  const deleteCommission = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        await httpClient(`/washing-bay/commissions/${id}`, {
          method: "DELETE",
          headers,
        });
        setCommissions((prev) =>
          prev.filter((commission) => commission.id !== id)
        );
      }, "Failed to delete commission");
    },
    [getAuthHeaders]
  );

  const bulkDeleteCommissions = useCallback(
    async (commissionIds: string[]) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        await httpClient("/washing-bay/commissions/bulk-delete", {
          method: "DELETE",
          body: JSON.stringify({ commissionIds }),
          headers,
        });
        setCommissions((prev) =>
          prev.filter((commission) => !commissionIds.includes(commission.id))
        );
      }, "Failed to bulk delete commissions");
    },
    [getAuthHeaders]
  );

  const getDailySummary = useCallback(
    async (date?: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (date) queryParams.append("date", date);

        const response = await httpClient(
          `/washing-bay/daily-summary/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch daily summary");
    },
    [currentBranchId, getAuthHeaders]
  );

  const generateDailySummary = useCallback(
    async (date?: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/washing-bay/daily-summary/branch/${currentBranchId}`,
          {
            method: "POST",
            body: JSON.stringify({
              date: date || new Date().toISOString().split("T")[0],
            }),
            headers,
          }
        );
        setDailySummaries((prev) => [response, ...prev]);
        return response;
      }, "Failed to generate daily summary");
    },
    [currentBranchId, getAuthHeaders]
  );

  const getProfitAnalytics = useCallback(
    async (filters: {
      period: "day" | "week" | "month" | "year";
      startDate: string;
      endDate: string;
    }) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        queryParams.append("period", filters.period);
        queryParams.append("startDate", filters.startDate);
        queryParams.append("endDate", filters.endDate);

        const response = await httpClient(
          `/washing-bay/profit-analytics/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch profit analytics");
    },
    [currentBranchId, getAuthHeaders]
  );

  // Worker Performance Analytics Methods
  const getWorkerPerformanceAnalytics = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.period) queryParams.append("period", filters.period);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.workerId) queryParams.append("workerId", filters.workerId);

        const response = await httpClient(
          `/washing-bay/worker-performance/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch worker performance analytics");
    },
    [currentBranchId, getAuthHeaders]
  );

  const fetchWorkerPerformanceAnalytics = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) return;

      try {
        setLoading(true);
        const response = await getWorkerPerformanceAnalytics(filters);
        setWorkerPerformanceAnalytics(response);
      } catch (err) {
        setError("Failed to fetch worker performance analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getWorkerPerformanceAnalytics]
  );

  // Worker Statistics Methods
  const getWorkerStatistics = useCallback(
    async (workerId: string, filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.period) queryParams.append("period", filters.period);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);

        const response = await httpClient(
          `/washing-bay/workers/${workerId}/statistics?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch worker statistics");
    },
    [getAuthHeaders]
  );

  const getWorkerWithStatistics = useCallback(
    async (workerId: string, filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.period) queryParams.append("period", filters.period);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);

        const response = await httpClient(
          `/washing-bay/workers/${workerId}/with-statistics?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch worker with statistics");
    },
    [getAuthHeaders]
  );
  const value: WashingBayContextType = {
    // State
    serviceTypes,
    workers,
    washOrders,
    materialUsages,
    commissions,
    dailySummaries,
    loading,
    error,

    // Service Type Methods
    createServiceType,
    getServiceTypes,
    updateServiceType,
    fetchServiceTypes,

    // Worker Methods
    createWorker,
    getWorkers,
    updateWorker,
    getWorkerWithUser,
    createUserForWorker,
    deactivateWorkerWithUser,
    getWorkersWithoutUserAccounts,
    bulkCreateUserAccounts,
    fetchWorkers,
    deleteWorker,
    // Wash Order Methods
    createWashOrder,
    getWashOrders,
    updateWashOrderStatus,
    updateWashOrderPaymentStatus,
    addMaterialUsage,
    fetchWashOrders,
    deleteWashOrder,
    updateWashOrder,
    // Commission Methods
    markCommissionsAsPaid,
    markCommissionAsPaid,
    getWorkerCommissions,
    markAllCommissionsAsPaidForWorker,
    deleteCommission,
    bulkDeleteCommissions,

    // Reporting Methods
    getDailySummary,
    generateDailySummary,
    getProfitAnalytics,

    // Worker Performance Analytics
    workerPerformanceAnalytics,
    getWorkerPerformanceAnalytics,
    fetchWorkerPerformanceAnalytics,
    // Worker Statistics Methods
    getWorkerStatistics,
    getWorkerWithStatistics,
  };

  return (
    <WashingBayContext.Provider value={value}>
      {children}
    </WashingBayContext.Provider>
  );
};
