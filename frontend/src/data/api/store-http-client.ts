export interface Store {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  isWarehouse: boolean;
  branchId: string;
  managerId?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreItem {
  id: string;
  storeId: string;
  itemId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  item?: {
    id: string;
    name: string;
    sellingPrice: number;
    purchasePrice?: number;
    barcode?: string;
    category?: string;
    productType: string;
    unit?: string;
  };
  store?: {
    id: string;
    name: string;
  };
}

export interface StockTransferRequest {
  fromStoreId: string;
  toStoreId: string;
  itemId: string;
  quantity: number;
  reason?: string;
}

export interface StoreStockSummary {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface ItemStockAcrossStores {
  totalStock: number;
  storeStocks: Array<{
    storeId: string;
    storeName: string;
    quantity: number;
  }>;
}

// Export the factory function
export const createStoreApi = (getAuthHeaders: () => Promise<HeadersInit>) => ({
  // Store Management
  getStoresByBranch: async (
    branchId: string,
    filters?: {
      isActive?: boolean;
      isWarehouse?: boolean;
    }
  ): Promise<Store[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.isActive !== undefined)
      queryParams.append("isActive", filters.isActive.toString());
    if (filters?.isWarehouse !== undefined)
      queryParams.append("isWarehouse", filters.isWarehouse.toString());

    const url = `/stores/branch/${branchId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}${url}`,
      { headers }
    );
    const data = await response.json();
    return data.data || [];
  },

  getStore: async (id: string): Promise<Store> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${id}`,
      { headers }
    );
    const data = await response.json();
    return data.data;
  },

  createStore: async (storeData: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    branchId: string;
    managerId?: string;
    isWarehouse?: boolean;
  }): Promise<Store> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(storeData),
      }
    );
    const data = await response.json();
    return data.data;
  },

  updateStore: async (
    id: string,
    storeData: Partial<Store>
  ): Promise<Store> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(storeData),
      }
    );
    const data = await response.json();
    return data.data;
  },

  deleteStore: async (id: string): Promise<{ message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );
    const data = await response.json();
    return data;
  },

  // Store Items Management
  getStoreItems: async (
    storeId: string,
    filters?: {
      lowStock?: boolean;
      outOfStock?: boolean;
    }
  ): Promise<StoreItem[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.lowStock) queryParams.append("lowStock", "true");
    if (filters?.outOfStock) queryParams.append("outOfStock", "true");

    const url = `/stores/${storeId}/items${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}${url}`,
      { headers }
    );
    const data = await response.json();
    return data.data || [];
  },

  addItemToStore: async (
    storeId: string,
    itemId: string,
    quantity: number = 0,
    minStockLevel: number = 0,
    maxStockLevel: number = 0
  ): Promise<StoreItem> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${storeId}/items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          itemId,
          quantity,
          minStockLevel,
          maxStockLevel,
        }),
      }
    );
    const data = await response.json();
    return data.data;
  },

  updateStoreItemQuantity: async (
    storeId: string,
    itemId: string,
    quantity: number
  ): Promise<StoreItem> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${storeId}/items/${itemId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({ quantity }),
      }
    );
    const data = await response.json();
    return data.data;
  },

  // Stock Operations
  transferStock: async (
    transferData: StockTransferRequest
  ): Promise<{
    fromStoreItem: StoreItem;
    toStoreItem: StoreItem;
  }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/transfer-stock`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(transferData),
      }
    );
    const data = await response.json();
    return data.data;
  },

  // Reports and Analytics
  getStoreStockSummary: async (storeId: string): Promise<StoreStockSummary> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/${storeId}/stock-summary`,
      { headers }
    );
    const data = await response.json();
    return data.data;
  },

  getItemStockAcrossStores: async (
    itemId: string,
    branchId: string
  ): Promise<ItemStockAcrossStores> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/stores/items/${itemId}/branch/${branchId}/stock`,
      { headers }
    );
    const data = await response.json();
    return data.data;
  },
});
