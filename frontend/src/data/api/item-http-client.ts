/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAGINATION_CONFIG } from "@/constants/pagination";
import { Item } from "@/context/DataContext";
import { httpClient } from "./httpClient";

export const getItems = async (
  branchId: string,
  filters: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    page?: number;
    limit?: number;
  } = {},
  getAuthHeaders: () => Promise<Record<string, string>>
) => {
  try {
    if (!branchId) {
      throw new Error("No branch selected");
    }

    const query = new URLSearchParams();

    // Add filters to query parameters
    if (filters.search) query.append("search", filters.search);
    if (filters.category) query.append("category", filters.category);
    if (filters.lowStock) query.append("lowStock", String(filters.lowStock));
    if (filters.outOfStock)
      query.append("outOfStock", String(filters.outOfStock));
    if (filters.page) query.append("page", filters.page.toString());
    if (filters.limit) query.append("limit", filters.limit.toString());
    else query.append("limit", PAGINATION_CONFIG.DEFAULT_ITEM_LIMIT.toString());

    const url = `/items/branch/${branchId}?${query.toString()}`;

    // Get auth headers with token
    const headers = await getAuthHeaders();

    // Pass headers to httpClient
    const response = await httpClient(url, { headers });
    return response;
  } catch (err) {
    console.error("Detailed error:", err);
    throw err;
  }
};

export const getItemByBarcode = async (
  barcode: string,
  branchId: string,
  getAuthHeaders: () => Promise<Record<string, string>>
): Promise<Item> => {
  try {
    const headers = await getAuthHeaders();
    const item = await httpClient(
      `/items/barcode/${barcode}?branchId=${branchId}`,
      { headers }
    );
    return item;
  } catch (err) {
    console.error("Detailed error:", err);
    throw err;
  }
};
export const getInventoryReport = async (
  branchId: string,
  startDate: Date,
  endDate: Date,
  getAuthHeaders: () => Promise<Record<string, string>>,
  productId?: string
) => {
  try {
    if (!branchId) {
      throw new Error("No branch selected");
    }

    const query = new URLSearchParams();
    query.append("startDate", startDate.toISOString());
    query.append("endDate", endDate.toISOString());
    if (productId) {
      query.append("productId", productId);
    }

    const url = `/items/inventory-report/${branchId}?${query.toString()}`;
    const headers = await getAuthHeaders();
    const response = await httpClient(url, { headers });
    return response;
  } catch (err) {
    console.error("Detailed error:", err);
    throw err;
  }
};

export const getItem = async (
  itemId: string,
  getAuthHeaders: () => Promise<Record<string, string>>
): Promise<Item> => {
  try {
    const headers = await getAuthHeaders();
    const item = await httpClient(`/items/${itemId}`, { headers });
    return item;
  } catch (err) {
    console.error("Detailed error:", err);
    throw err;
  }
};

// FIXED: Single bulkUploadItems function with better error handling
export const bulkUploadItems = async (
  file: File,
  branchId: string,
  getAuthHeaders: () => Promise<Record<string, string>>
) => {
  try {
    if (!file) {
      throw new Error("File is required");
    }
    if (!branchId) {
      throw new Error("Branch ID is required");
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isAllowedType =
      allowedTypes.includes(file.type) ||
      ["xlsx", "xls", "csv"].includes(fileExtension || "");

    if (!isAllowedType) {
      throw new Error("File must be Excel (.xlsx, .xls) or CSV (.csv) format");
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("branchId", branchId);

    const headers = await getAuthHeaders();

    // Remove Content-Type header to let browser set it automatically for FormData
    // delete headers["Content-Type"];

    const { "Content-Type": _, ...formDataHeaders } = headers;

    const response = await httpClient("/items/bulk-upload", {
      method: "POST",
      body: formData,
      headers: formDataHeaders,
    });

    return response;
  } catch (error: any) {
    console.error("Bulk upload error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Provide more specific error messages
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to upload items. Please try again.");
    }
  }
};

export const downloadItemTemplate = async (
  getAuthHeaders: () => Promise<Record<string, string>>
) => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API}/items/template`,
    { headers }
  );

  if (!response.ok) {
    throw new Error("Failed to download template");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "items_template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadBulkUploadTemplate = async (
  getAuthHeaders: () => Promise<Record<string, string>>
) => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API}/items/bulk-upload/template`,
    { headers }
  );

  if (!response.ok) {
    throw new Error("Failed to download template");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk_items_template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
export const createItem = async (
  item: Omit<
    Item,
    "id" | "branchId" | "profitPerUnit" | "profitMargin" | "isActive"
  > & { supplierId?: string },
  branchId: string,
  getAuthHeaders: () => Promise<Record<string, string>>
): Promise<Item> => {
  try {
    if (!branchId) {
      throw new Error("No branch selected");
    }

    const headers = await getAuthHeaders();

    // Prepare the request body according to backend expectations
    const requestBody = {
      name: item.name,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.purchasePrice,
      stockQuantity: item.stockQuantity ?? 0, // Default to 0 if undefined
      minStockLevel: item.minStockLevel ?? 0, // Default to 0 if undefined
      category: item.category,
      branchId: branchId,
      barcode: item.barcode,
      // isActive: item.isActive !== false, // Default to true
      productType: item.productType ?? "retail", // Default to retail
      unit: item.unit,
      subUnit: item.subUnit,
      conversionFactor: item.conversionFactor,
      rawMaterials: item.rawMaterials,
      supplierId: item.supplierId,
    };
    const newItem = await httpClient("/items/with-supplier", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers,
    });

    // Transform backend response to frontend format
    const transformedItem = {
      id: newItem.id,
      name: newItem.name,
      sellingPrice: newItem.sellingPrice,
      purchasePrice: newItem.purchasePrice,
      stockQuantity: newItem.stockQuantity,
      minStockLevel: newItem.minStockLevel,
      category: newItem.category,
      branchId: newItem.branchId,
      barcode: newItem.barcode,
      isActive: newItem.isActive,
      productType: newItem.productType,
      unit: newItem.unit,
      subUnit: newItem.subUnit,
      conversionFactor: newItem.conversionFactor,
      rawMaterials: newItem.rawMaterials,
      profitPerUnit: newItem.profitPerUnit ?? 0, // Backend will calculate
      profitMargin: newItem.profitMargin ?? 0, // Backend will calculate
      createdAt: newItem.createdAt,
      updatedAt: newItem.updatedAt,
    };

    return transformedItem;
  } catch (err) {
    console.error("Item creation error:", err);
    throw err;
  }
};

// DELETE ITEM FUNCTION
export const deleteItem = async (
  itemId: string,
  getAuthHeaders: () => Promise<Record<string, string>>
): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await httpClient(`/items/${itemId}`, {
      method: "DELETE",
      headers,
    });
  } catch (err) {
    console.error("Delete item error:", err);
    throw err;
  }
};
