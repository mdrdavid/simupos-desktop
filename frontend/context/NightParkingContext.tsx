/* eslint-disable @typescript-eslint/no-unused-vars */
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
  NightParkingPricing,
  NightParkingSlot,
  NightParkingRecord,
  NightParkingWorkerCommission,
  NightParkingDamageRecord,
  NightParkingDailySummary,
  CreatePricingRequest,
  CreateSlotRequest,
  CheckInVehicleRequest,
  CheckOutVehicleRequest,
  ExtendStayRequest,
  RecordDamageRequest,
  MarkCommissionsPaidRequest,
  UpdatePaymentRequest,
  ParkingStatus,
  PaymentStatus,
  PaymentMethod,
  ParkingDashboardStats,
  MonthlyRevenueReport,
  WorkerShiftSummary,
  WorkerPerformanceAnalytics,
  SlotOccupancy,
} from "@/src/types/nightParking";

interface NightParkingContextType {
  // State
  pricings: NightParkingPricing[];
  slots: NightParkingSlot[];
  records: NightParkingRecord[];
  commissions: NightParkingWorkerCommission[];
  damages: NightParkingDamageRecord[];
  dailySummaries: NightParkingDailySummary[];
  loading: boolean;
  error: string | null;

  // Pricing Methods
  createPricing: (data: CreatePricingRequest) => Promise<NightParkingPricing>;
  getPricings: (filters?: {
    vehicleType?: string;
    priceType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<{ pricings: NightParkingPricing[]; pagination: any }>;
  updatePricing: (
    id: string,
    data: Partial<NightParkingPricing>
  ) => Promise<NightParkingPricing>;
  getPricingByVehicleType: (
    vehicleType: string,
    priceType?: string
  ) => Promise<NightParkingPricing[]>;

  // Slot Methods
  createSlot: (data: CreateSlotRequest) => Promise<NightParkingSlot>;
  getAvailableSlots: (vehicleType?: string) => Promise<NightParkingSlot[]>;
  updateSlotStatus: (
    id: string,
    status: string,
    userId: string
  ) => Promise<NightParkingSlot>;
  getSlotOccupancy: () => Promise<SlotOccupancy>;

  // Parking Operations
  checkInVehicle: (data: CheckInVehicleRequest) => Promise<NightParkingRecord>;
  checkOutVehicle: (
    data: CheckOutVehicleRequest
  ) => Promise<NightParkingRecord>;
  extendStay: (data: ExtendStayRequest) => Promise<any>;
  recordDamage: (
    data: RecordDamageRequest
  ) => Promise<NightParkingDamageRecord>;

  // Record Management
  getRecords: (filters?: {
    status?: ParkingStatus;
    paymentStatus?: PaymentStatus;
    vehicleType?: string;
    period?: "day" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
    workerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) => Promise<{
    records: NightParkingRecord[];
    pagination: any;
    summary: any;
  }>;
  searchRecords: (searchTerm: string) => Promise<NightParkingRecord[]>;
  getOverdueVehicles: () => Promise<NightParkingRecord[]>;
  getActiveRecordByLicensePlate: (
    licensePlate: string
  ) => Promise<NightParkingRecord | null>;
  getRecordByTicketNumber: (
    ticketNumber: string
  ) => Promise<NightParkingRecord | null>;
  updateRecordPayment: (
    recordId: string,
    data: UpdatePaymentRequest
  ) => Promise<NightParkingRecord>;

  // Commission Methods
  getCommissions: (filters?: {
    workerId?: string;
    isPaid?: boolean;
    period?: "day" | "week" | "month" | "custom";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<{
    commissions: NightParkingWorkerCommission[];
    pagination: any;
    summary: any;
  }>;
  markCommissionsAsPaid: (data: MarkCommissionsPaidRequest) => Promise<any>;

  // Reporting
  getDailySummary: (date?: string) => Promise<any>;
  generateDailySummary: (date?: string) => Promise<NightParkingDailySummary>;
  getMonthlyRevenueReport: (
    year: number,
    month: number
  ) => Promise<MonthlyRevenueReport>;
  getWorkerShiftSummary: (
    workerId: string,
    startTime: string,
    endTime: string
  ) => Promise<WorkerShiftSummary>;

  // Dashboard & Analytics
  getParkingDashboardStats: () => Promise<ParkingDashboardStats>;
  getWorkerPerformanceAnalytics: (filters?: {
    period?: "day" | "week" | "month" | "custom";
    startDate?: string;
    endDate?: string;
    workerId?: string;
  }) => Promise<WorkerPerformanceAnalytics[]>;

  // Bulk Operations
  bulkCheckOutShiftVehicles: (workerId: string) => Promise<any>;

  // Data Fetching
  fetchPricings: () => Promise<void>;
  fetchSlots: () => Promise<void>;
  getAllSlots: () => Promise<NightParkingSlot[]>;
  fetchRecords: (filters?: any) => Promise<void>;
  fetchCommissions: (filters?: any) => Promise<void>;
}

const NightParkingContext = createContext<NightParkingContextType | undefined>(
  undefined
);

export const useNightParking = (): NightParkingContextType => {
  const context = useContext(NightParkingContext);
  if (!context) {
    throw new Error(
      "useNightParking must be used within a NightParkingProvider"
    );
  }
  return context;
};

interface NightParkingProviderProps {
  children: ReactNode;
}

export const NightParkingProvider = ({
  children,
}: NightParkingProviderProps) => {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [pricings, setPricings] = useState<NightParkingPricing[]>([]);
  const [slots, setSlots] = useState<NightParkingSlot[]>([]);
  const [records, setRecords] = useState<NightParkingRecord[]>([]);
  const [commissions, setCommissions] = useState<
    NightParkingWorkerCommission[]
  >([]);
  const [damages, setDamages] = useState<NightParkingDamageRecord[]>([]);
  const [dailySummaries, setDailySummaries] = useState<
    NightParkingDailySummary[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

  // Pricing Methods
  const createPricing = useCallback(
    async (data: CreatePricingRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/pricings", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setPricings((prev) => [response, ...prev]);
        return response;
      }, "Failed to create pricing");
    },
    [getAuthHeaders]
  );

  const getPricings = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.vehicleType)
          queryParams.append("vehicleType", filters.vehicleType);
        if (filters?.priceType)
          queryParams.append("priceType", filters.priceType);
        if (filters?.isActive !== undefined)
          queryParams.append("isActive", filters.isActive.toString());
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/night-parking/pricings/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch pricings");
    },
    [currentBranchId, getAuthHeaders]
  );

  const updatePricing = useCallback(
    async (id: string, data: Partial<NightParkingPricing>) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/night-parking/pricings/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
          headers,
        });
        setPricings((prev) =>
          prev.map((pricing) => (pricing.id === id ? response : pricing))
        );
        return response;
      }, "Failed to update pricing");
    },
    [getAuthHeaders]
  );

  const getPricingByVehicleType = useCallback(
    async (vehicleType: string, priceType?: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (priceType) queryParams.append("priceType", priceType);

        const response = await httpClient(
          `/night-parking/pricings/branch/${currentBranchId}/vehicle/${vehicleType}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch pricing by vehicle type");
    },
    [currentBranchId, getAuthHeaders]
  );

  // Slot Methods
  const createSlot = useCallback(
    async (data: CreateSlotRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/slots", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setSlots((prev) => [response, ...prev]);
        return response;
      }, "Failed to create slot");
    },
    [getAuthHeaders]
  );

const getAvailableSlots = useCallback(
  async (vehicleType?: string) => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      // Only add vehicleType filter if it's specified AND not "any"
      if (vehicleType && vehicleType !== "any") {
        queryParams.append("vehicleType", vehicleType);
      }
      // If vehicleType is "any" or undefined, don't filter by vehicle type

      const response = await httpClient(
        `/night-parking/slots/branch/${currentBranchId}/available?${queryParams.toString()}`,
        { headers }
      );
      console.log("Available slots response:", response);
      return response;
    }, "Failed to fetch available slots");
  },
  [currentBranchId, getAuthHeaders]
);

  const updateSlotStatus = useCallback(
    async (id: string, status: string, userId: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/night-parking/slots/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
          headers,
        });
        setSlots((prev) =>
          prev.map((slot) => (slot.id === id ? response : slot))
        );
        return response;
      }, "Failed to update slot status");
    },
    [getAuthHeaders]
  );

  const getSlotOccupancy = useCallback(async () => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/night-parking/analytics/occupancy/branch/${currentBranchId}`,
        { headers }
      );
      return response;
    }, "Failed to fetch slot occupancy");
  }, [currentBranchId, getAuthHeaders]);

  // Parking Operations
  const checkInVehicle = useCallback(
    async (data: CheckInVehicleRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/check-in", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setRecords((prev) => [response, ...prev]);
        return response;
      }, "Failed to check in vehicle");
    },
    [getAuthHeaders]
  );

  const checkOutVehicle = useCallback(
    async (data: CheckOutVehicleRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/check-out", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setRecords((prev) =>
          prev.map((record) =>
            record.id === data.recordId ? response : record
          )
        );
        return response;
      }, "Failed to check out vehicle");
    },
    [getAuthHeaders]
  );

  const extendStay = useCallback(
    async (data: ExtendStayRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/extend-stay", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setRecords((prev) =>
          prev.map((record) =>
            record.id === data.recordId ? response : record
          )
        );
        return response;
      }, "Failed to extend stay");
    },
    [getAuthHeaders]
  );

  const recordDamage = useCallback(
    async (data: RecordDamageRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient("/night-parking/damages", {
          method: "POST",
          body: JSON.stringify(data),
          headers,
        });
        setDamages((prev) => [response, ...prev]);
        return response;
      }, "Failed to record damage");
    },
    [getAuthHeaders]
  );

  // Record Management
  const getRecords = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.paymentStatus)
          queryParams.append("paymentStatus", filters.paymentStatus);
        if (filters?.vehicleType)
          queryParams.append("vehicleType", filters.vehicleType);
        if (filters?.period) queryParams.append("period", filters.period);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.workerId) queryParams.append("workerId", filters.workerId);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());
        if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
        if (filters?.sortOrder)
          queryParams.append("sortOrder", filters.sortOrder);

        const response = await httpClient(
          `/night-parking/records/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch records");
    },
    [currentBranchId, getAuthHeaders]
  );

  const searchRecords = useCallback(
    async (searchTerm: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/night-parking/records/branch/${currentBranchId}/search?q=${encodeURIComponent(searchTerm)}`,
          { headers }
        );
        return response;
      }, "Failed to search records");
    },
    [currentBranchId, getAuthHeaders]
  );

  const getOverdueVehicles = useCallback(async () => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/night-parking/records/branch/${currentBranchId}/overdue`,
        { headers }
      );
      return response;
    }, "Failed to fetch overdue vehicles");
  }, [currentBranchId, getAuthHeaders]);

  const getActiveRecordByLicensePlate = useCallback(
    async (licensePlate: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        try {
          const response = await httpClient(
            `/night-parking/records/branch/${currentBranchId}/vehicle/${licensePlate}/active`,
            { headers }
          );
          return response;
        } catch (error: any) {
          if (error.status === 404) {
            return null;
          }
          throw error;
        }
      }, "Failed to fetch active record");
    },
    [currentBranchId, getAuthHeaders]
  );

  const getRecordByTicketNumber = useCallback(
    async (ticketNumber: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        try {
          const response = await httpClient(
            `/night-parking/records/branch/${currentBranchId}/ticket/${ticketNumber}`,
            { headers }
          );
          return response;
        } catch (error: any) {
          if (error.status === 404) {
            return null;
          }
          throw error;
        }
      }, "Failed to fetch record by ticket number");
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateRecordPayment = useCallback(
    async (recordId: string, data: UpdatePaymentRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/night-parking/records/${recordId}/payment`,
          {
            method: "POST",
            body: JSON.stringify(data),
            headers,
          }
        );
        setRecords((prev) =>
          prev.map((record) => (record.id === recordId ? response : record))
        );
        return response;
      }, "Failed to update record payment");
    },
    [getAuthHeaders]
  );

  // Commission Methods
  const getCommissions = useCallback(
    async (filters?: any) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();

        if (filters?.workerId) queryParams.append("workerId", filters.workerId);
        if (filters?.isPaid !== undefined)
          queryParams.append("isPaid", filters.isPaid.toString());
        if (filters?.period) queryParams.append("period", filters.period);
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await httpClient(
          `/night-parking/commissions/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch commissions");
    },
    [currentBranchId, getAuthHeaders]
  );

  const markCommissionsAsPaid = useCallback(
    async (data: MarkCommissionsPaidRequest) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          "/night-parking/commissions/mark-paid",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers,
          }
        );
        // Update commissions in state
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

  // Reporting
  const getDailySummary = useCallback(
    async (date?: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (date) queryParams.append("date", date);

        const response = await httpClient(
          `/night-parking/daily-summary/branch/${currentBranchId}?${queryParams.toString()}`,
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
          `/night-parking/daily-summary/branch/${currentBranchId}`,
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

  const getMonthlyRevenueReport = useCallback(
    async (year: number, month: number) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/night-parking/reports/monthly/branch/${currentBranchId}/year/${year}/month/${month}`,
          { headers }
        );
        return response;
      }, "Failed to fetch monthly revenue report");
    },
    [currentBranchId, getAuthHeaders]
  );

  const getWorkerShiftSummary = useCallback(
    async (workerId: string, startTime: string, endTime: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        queryParams.append("startTime", startTime);
        queryParams.append("endTime", endTime);

        const response = await httpClient(
          `/night-parking/shifts/branch/${currentBranchId}/worker/${workerId}/summary?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch worker shift summary");
    },
    [currentBranchId, getAuthHeaders]
  );

  // Dashboard & Analytics
  const getParkingDashboardStats = useCallback(async () => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/night-parking/dashboard/branch/${currentBranchId}`,
        { headers }
      );
      return response;
    }, "Failed to fetch parking dashboard stats");
  }, [currentBranchId, getAuthHeaders]);

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
          `/night-parking/analytics/worker-performance/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        return response;
      }, "Failed to fetch worker performance analytics");
    },
    [currentBranchId, getAuthHeaders]
  );

  // Bulk Operations
  const bulkCheckOutShiftVehicles = useCallback(
    async (workerId: string) => {
      return handleApiCall(async () => {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/night-parking/shifts/branch/${currentBranchId}/worker/${workerId}/bulk-checkout`,
          {
            method: "POST",
            headers,
          }
        );
        return response;
      }, "Failed to bulk check out vehicles");
    },
    [currentBranchId, getAuthHeaders]
  );

  // Data Fetching
  const fetchPricings = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      const response = await getPricings();
      setPricings(response.pricings || []);
    } catch (err) {
      setError("Failed to fetch pricings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId, getPricings]);

  const getAllSlots = useCallback(async () => {
    return handleApiCall(async () => {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/night-parking/slots/branch/${currentBranchId}/all`,
        { headers }
      );
      return response;
    }, "Failed to fetch all slots");
  }, [currentBranchId, getAuthHeaders]);

const fetchSlots = useCallback(async () => {
  if (!currentBranchId) return;

  try {
    setLoading(true);
    const response = await getAllSlots();
    setSlots(response);
  } catch (err) {
    setError("Failed to fetch slots");
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [currentBranchId, getAllSlots]); 
  const fetchRecords = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) return;

      try {
        setLoading(true);
        const response = await getRecords(filters);
        setRecords(response.records || []);
      } catch (err) {
        setError("Failed to fetch records");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getRecords]
  );

  const fetchCommissions = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) return;

      try {
        setLoading(true);
        const response = await getCommissions(filters);
        setCommissions(response.commissions || []);
      } catch (err) {
        setError("Failed to fetch commissions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getCommissions]
  );

  const value: NightParkingContextType = {
    // State
    pricings,
    slots,
    records,
    commissions,
    damages,
    dailySummaries,
    loading,
    error,

    // Pricing Methods
    createPricing,
    getPricings,
    updatePricing,
    getPricingByVehicleType,

    // Slot Methods
    createSlot,
    getAvailableSlots,
    updateSlotStatus,
    getSlotOccupancy,

    // Parking Operations
    checkInVehicle,
    checkOutVehicle,
    extendStay,
    recordDamage,

    // Record Management
    getRecords,
    searchRecords,
    getOverdueVehicles,
    getActiveRecordByLicensePlate,
    getRecordByTicketNumber,
    updateRecordPayment,

    // Commission Methods
    getCommissions,
    markCommissionsAsPaid,

    // Reporting
    getDailySummary,
    generateDailySummary,
    getMonthlyRevenueReport,
    getWorkerShiftSummary,

    // Dashboard & Analytics
    getParkingDashboardStats,
    getWorkerPerformanceAnalytics,

    // Bulk Operations
    bulkCheckOutShiftVehicles,

    // Data Fetching
    fetchPricings,
    getAllSlots,
    fetchSlots,
    fetchRecords,
    fetchCommissions,
  };

  return (
    <NightParkingContext.Provider value={value}>
      {children}
    </NightParkingContext.Provider>
  );
};
