import { httpClient } from "./httpClient";

export enum TransferStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  IN_TRANSIT = "in_transit",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface StockTransferItem {
  itemId: string;
  name: string;
  quantity: number;
  unitCost?: number;
  sellingPrice?: number;
  totalCost?: number;
}

export interface StockTransfer {
  id: string;
  referenceNumber: string;
  fromBranchId: string;
  toBranchId: string;
  fromBranch?: { id: string; name: string };
  toBranch?: { id: string; name: string };
  status: TransferStatus;
  items: StockTransferItem[];
  totalValue?: number;
  notes?: string;
  rejectionReason?: string;
  requestedById?: string;
  requestedBy?: { id: string; firstName: string; lastName: string };
  approvedById?: string;
  approvedBy?: { id: string; firstName: string; lastName: string };
  receivedById?: string;
  receivedBy?: { id: string; firstName: string; lastName: string };
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  vehicleDetails?: string;
  driverDetails?: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface StockTransferFilters {
  status?: TransferStatus;
  type?: "incoming" | "outgoing" | "all";
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export const createStockTransferApi = (getAuthHeaders: () => Promise<Record<string, string>>) => {
  return {
    createTransfer: async (data: {
      fromBranchId: string;
      toBranchId: string;
      items: Array<{ itemId: string; quantity: number }>;
      notes?: string;
      expectedDeliveryDate?: Date;
    }) => {
      const headers = await getAuthHeaders();
      return httpClient("/stock-transfers", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      });
    },

    getTransfers: async (branchId: string, filters: StockTransferFilters = {}) => {
      const query = new URLSearchParams();
      if (filters.status) query.append("status", filters.status);
      if (filters.type) query.append("type", filters.type);
      if (filters.startDate) query.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) query.append("endDate", filters.endDate.toISOString());
      if (filters.page) query.append("page", filters.page.toString());
      if (filters.limit) query.append("limit", filters.limit.toString());

      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/branch/${branchId}?${query.toString()}`, {
        headers,
      });
    },

    getTransfer: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/${id}`, {
        headers,
      });
    },

    approveTransfer: async (id: string, notes?: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes }),
        headers,
      });
    },

    completeTransfer: async (id: string, actualDeliveryDate?: Date) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ actualDeliveryDate }),
        headers,
      });
    },

    rejectTransfer: async (id: string, rejectionReason: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
        headers,
      });
    },

    cancelTransfer: async (id: string, cancellationReason: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancellationReason }),
        headers,
      });
    },

    getTransferStatistics: async (branchId: string, startDate?: Date, endDate?: Date) => {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate.toISOString());
      if (endDate) query.append("endDate", endDate.toISOString());

      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/statistics/${branchId}?${query.toString()}`, {
        headers,
      });
    },

    getAvailableItemsForTransfer: async (branchId: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/stock-transfers/available-items/${branchId}`, {
        headers,
      });
    },
  };
};
