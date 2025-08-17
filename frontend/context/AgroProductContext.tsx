/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  AgroProduct,
  AgroProductVariant,
  StockShipment,
} from "../src/types/agroProduct";
import { httpClient } from "../src/data/api/httpClient";
import { useAuth } from "./AuthContext";

interface AgroProductContextType {
  agroProducts: AgroProduct[];
  loading: boolean;
  error: string | null;
  addAgroProduct: (
    productData: Omit<
      AgroProduct,
      | "id"
      | "stockShipments"
      | "currentAverageCostPrice"
      | "totalStockQuantity"
      | "createdAt"
      | "updatedAt"
    >,
    branchId: string
  ) => Promise<AgroProduct>;
  createAgroProduct: (
    productData: {
      name: string;
      category?: string;
      unitOfMeasure: string;
      branchId: string;
      baseCurrency?: string;
      minStockLevel?: number;
      description?: string;
      productCode?: string;
    },
    initialStock: {
      costPrice: number;
      quantity: number;
      currency?: string;
      receivedDate?: string;
      supplierInfo?: string;
    }
  ) => Promise<AgroProduct>;
  createProduct: (productData: any) => Promise<AgroProduct>;
  createVariant: (
    productId: string,
    variantData: any
  ) => Promise<AgroProductVariant>;
  addStockShipment: (
    productId: string,
    variantId: string | null,
    shipmentData: Omit<StockShipment, "id" | "createdAt">,
    branchId: string
  ) => Promise<AgroProduct>;
  getAgroProductById: (id: string) => AgroProduct | undefined;
  updateProductStock: (
    productId: string,
    quantityChange: number, // Can be positive (add) or negative (deduct).
      reason?: string
  ) => Promise<void>;
  fetchProductsByBranch: (branchId: string) => Promise<void>;
  fetchProductDetails: (productId: string) => Promise<AgroProduct>;
  fetchVariantStockHistory: (
    productId: string,
    variantId: string
  ) => Promise<StockShipment[]>;
}

const AgroProductContext = createContext<AgroProductContextType | undefined>(
  undefined
);

export const useAgroProduct = () => {
  const context = useContext(AgroProductContext);
  if (!context) {
    throw new Error(
      "useAgroProduct must be used within an AgroProductProvider"
    );
  }
  return context;
};

interface AgroProductProviderProps {
  children: ReactNode;
  initialBranchId?: string;
}

export const AgroProductProvider = ({
  children,
  initialBranchId,
}: AgroProductProviderProps) => {
  const { getAuthHeaders, currentBranchId } = useAuth();
  const [agroProducts, setAgroProducts] = useState<AgroProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByBranch = useCallback(async (branchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(`/agro/branch/${branchId}`, {
        headers,
      });
      setAgroProducts(response.products);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as any).response === "object"
      ) {
        setError(
          (err as any).response?.data?.message || "Failed to fetch products"
        );
      } else {
        setError("Failed to fetch products");
      }
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductDetails = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/agro/${productId}?includeVariants=true`,
        {
          headers,
        }
      );
      console.log("Product details response:", response);
      if (!response) {
        throw new Error("Product not found");
      }

      // Ensure variants exists even if empty
      if (!response.variants) {
        response.variants = [];
      }

      return response;
    } catch (err: any) {
      console.error("Detailed product fetch error:", err);
      throw new Error(
        err.response?.data?.message || "Failed to fetch product details"
      );
    } finally {
      setLoading(false);
    }
  }, []);
  const addAgroProduct = useCallback(
    async (
      productData: Omit<
        AgroProduct,
        | "id"
        | "stockShipments"
        | "currentAverageCostPrice"
        | "totalStockQuantity"
        | "createdAt"
        | "updatedAt"
      >,
      branchId: string
    ) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient("/agro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            ...productData,
            branchId,
          }),
        });
        setAgroProducts((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        console.error("Error adding product:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createAgroProduct = useCallback(
    async (
      productData: {
        name: string;
        category?: string;
        unitOfMeasure: string;
        branchId: string;
        baseCurrency?: string;
        minStockLevel?: number;
        description?: string;
        productCode?: string;
      },
      initialStock: {
        costPrice: number;
        quantity: number;
        currency?: string;
        receivedDate?: string;
        supplierInfo?: string;
      }
    ) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();

        // Prepare the request body according to backend schema
        const requestBody = {
          ...productData,
          currentAverageCostPrice: initialStock.costPrice,
          totalStockQuantity: initialStock.quantity,
          // Remove undefined values
          description: productData.description || undefined,
          productCode: productData.productCode || undefined,
          minStockLevel: productData.minStockLevel || undefined,
          baseCurrency: productData.baseCurrency || "UGX",
        };

        // Remove undefined fields
        Object.keys(requestBody).forEach(
          (key) =>
            (requestBody as any)[key] === undefined &&
            delete (requestBody as any)[key]
        );

        const response = await httpClient("/agro", {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });
        // Handle different possible response structures
        const createdProduct =
          response?.data?.product || response?.data || response;
        if (!createdProduct) {
          throw new Error("Failed to create product - no data returned");
        }

        // Update local state
        setAgroProducts((prev) => [...prev, createdProduct]);

        return createdProduct;
      } catch (error) {
        console.error("Error creating agro product:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const createProduct = useCallback(
    async (productData: any) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient("/agro/web", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...productData,
            branchId: currentBranchId, // Ensure branchId is included
          }),
        });

        setAgroProducts((prev) => [...prev, response.data]);
        return response.data;
      } catch (error) {
        console.error("Error creating product:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const createVariant = useCallback(
    async (productId: string, variantData: any) => {
      setLoading(true);
      try {
        console.log("Creating variant with data:", variantData);
        console.log("productId data:", productId);
        console.log("Current branch ID:", currentBranchId);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}/variants`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...variantData,
          }),
        });

        setAgroProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  variants: [...(product.variants || []), response.data],
                }
              : product
          )
        );

        return response.data;
      } catch (error) {
        console.error("Error creating variant:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addStockShipmentMobile = useCallback(
    async (
      productId: string,
      shipmentData: Omit<StockShipment, "id" | "createdAt">,
      branchId: string
    ) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}/shipments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            ...shipmentData,
            branchId,
          }),
        });

        // Update local state with the updated product
        // Check the actual response structure from your backend
        const updatedProduct = response.data || response.product || response;

        setAgroProducts((prev) =>
          prev.map((p) => (p.id === productId ? updatedProduct : p))
        );

        return updatedProduct;
      } catch (err) {
        console.error("Error adding stock shipment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addStockShipment = useCallback(
  async (productId: string, variantId: string | null, shipmentData: any) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const endpoint = variantId
        ? `/agro/${productId}/variants/${variantId}/shipments/web`
        : `/agro/${productId}/shipments`;

      // Ensure required fields are present
      const completeShipmentData = {
        ...shipmentData,
        type: shipmentData.type || 'PURCHASE',
        notes: shipmentData.notes || '',
      };

      const response = await httpClient(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(completeShipmentData),
      });


      const responseData = await response;

      // Update state with the new stock levels.
      setAgroProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product;

          if (variantId) {
            return {
              ...product,
              variants: product.variants?.map((variant) =>
                variant.id === variantId
                  ? { ...variant, ...responseData.variant }
                  : variant
              ),
            };
          }
          return { ...product, ...responseData.product };
        })
      );

      return responseData;
    } catch (error:any) {
      console.error("Detailed error:", error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to add stock shipment"
      );
    } finally {
      setLoading(false);
    }
  },
  [getAuthHeaders]
);

  const getAgroProductById = useCallback(
    (id: string) => {
      return agroProducts.find((p) => p.id === id);
    },
    [agroProducts]
  );

  const updateProductStock = useCallback(
  async (
    productId: string,
    quantityChange: number,
    reason?: string,
    variantId?: string
  ) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const payload = {
        quantityChange,
        reason: reason || `Stock adjustment from sale`,
        currency: "UGX",
        variantId: variantId || undefined 
      };
      const response = await httpClient(`/agro/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      const updatedProduct = await response;
      
      setAgroProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      console.error("Error updating product stock:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  []
);

  useEffect(() => {
    if (initialBranchId) {
      fetchProductsByBranch(initialBranchId);
    }
  }, [initialBranchId, fetchProductsByBranch]);

  const fetchVariantStockHistory = useCallback(
    async (productId: string, variantId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/agro/${productId}/variants/${variantId}/shipments`,
          { headers }
        );
        return response.data;
      } catch (err: any) {
        console.error("Detailed error:", err.response?.data || err.message);
        throw new Error(
          err.response?.data?.message || "Failed to fetch stock history"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );
  return (
    <AgroProductContext.Provider
      value={{
        agroProducts,
        loading,
        error,
        createProduct,
        createAgroProduct,
        addAgroProduct,
        createVariant,
        addStockShipment,
        getAgroProductById,
        updateProductStock,
        fetchProductsByBranch,
        fetchProductDetails,
        fetchVariantStockHistory,
      }}
    >
      {children}
    </AgroProductContext.Provider>
  );
};
