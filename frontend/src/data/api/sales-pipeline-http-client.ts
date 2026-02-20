import { httpClient } from "./httpClient";
import { Deal, DealStage } from "@/src/types/salesPipeline";

export const createSalesPipelineApi = (getAuthHeaders: () => Promise<Record<string, string>>) => {
  return {
    createDeal: async (data: Omit<Deal, "id" | "createdAt" | "updatedAt"> & { branchId: string }) => {
      const headers = await getAuthHeaders();
      return httpClient("/professional-hub/sales-pipeline", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      });
    },

    getDeals: async (branchId: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/sales-pipeline/${branchId}`, {
        headers,
      });
    },

    getDeal: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/sales-pipeline/deal/${id}`, {
        headers,
      });
    },

    updateDeal: async (id: string, data: Partial<Deal>) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/sales-pipeline/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers,
      });
    },

    moveDeal: async (id: string, stage: DealStage) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/sales-pipeline/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
        headers,
      });
    },

    deleteDeal: async (id: string) => {
      const headers = await getAuthHeaders();
      return httpClient(`/professional-hub/sales-pipeline/${id}`, {
        method: "DELETE",
        headers,
      });
    },
  };
};
