/* eslint-disable @typescript-eslint/no-unused-vars */
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
  updateAgroProduct: (
    productId: string,
    productData: Partial<AgroProduct>
  ) => Promise<AgroProduct>;
  deleteAgroProduct: (productId: string) => Promise<void>;
  updateAgroProductVariant: (
    productId: string,
    variantId: string,
    variantData: Partial<AgroProductVariant>
  ) => Promise<AgroProductVariant>;
  deleteAgroProductVariant: (
    productId: string,
    variantId: string
  ) => Promise<void>;
  fetchAgroDashboardStats: (branchId: string) => Promise<any>;
  refetchProducts: () => void;
  deleteAllProductShipments: (productId: string) => Promise<any>;
  deleteAllVariantShipments: (
    productId: string,
    variantId: string
  ) => Promise<any>;
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
}

export const AgroProductProvider = ({ children }: AgroProductProviderProps) => {
  const { getAuthHeaders, currentBranchId } = useAuth();
  const [agroProducts, setAgroProducts] = useState<AgroProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByBranch = useCallback(
    async (branchId: string) => {
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
    },
    [getAuthHeaders]
  );

  const refetchProducts = useCallback(() => {
    if (currentBranchId) {
      // Re-run the main data fetch function
      fetchProductsByBranch(currentBranchId);
    }
  }, [currentBranchId, fetchProductsByBranch]);

  useEffect(() => {
    if (currentBranchId) {
      fetchProductsByBranch(currentBranchId);
    }
  }, [currentBranchId, fetchProductsByBranch]);

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

        // Prepare the request body according to backend schema.
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
        const cleanedData = {
          name: variantData.name?.trim(),
          description: variantData.description?.trim() || "",
          unitOfMeasure: variantData.unitOfMeasure?.trim(),
          minStockLevel: Number(variantData.minStockLevel) || 0,
          productCode: variantData.productCode?.trim() || "",
          isActive:
            variantData.isActive === undefined
              ? true
              : Boolean(variantData.isActive),
          currentAverageCostPrice:
            Number(variantData.currentAverageCostPrice) || 0,
          totalStockQuantity: Number(variantData.totalStockQuantity) || 0,
        };

        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}/variants`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedData),
        });

        return response.data;
      } catch (error: any) {
        console.error("Error creating variant:", error);
        if (error.response) {
          console.error("Server validation errors:", error.response.data);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

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
    async (
      productId: string,
      variantId: string | null,
      shipmentData: any,
      branchId: string
    ) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const endpoint = variantId
          ? `/agro/${productId}/variants/${variantId}/shipments/web`
          : `/agro/${productId}/shipments`;

        // Ensure required fields are present
        const completeShipmentData = {
          ...shipmentData,
          type: shipmentData.type || "PURCHASE",
          notes: shipmentData.notes || "",
          currency: shipmentData.currency || "UGX",
          branchId: branchId, // Use the passed branchId
        };

        const response = await httpClient(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(completeShipmentData),
        });

        const responseData = await response;
        // Handle different response structures safely
        let updatedProductData;

        if (variantId) {
          // For variant shipments
          const variantData =
            responseData.data?.variant || responseData.variant || responseData;
          updatedProductData = {
            ...variantData,
            totalStockQuantity: variantData.totalStockQuantity || 0,
            currentAverageCostPrice: variantData.currentAverageCostPrice || 0,
          };
        } else {
          // For product shipments
          const productData =
            responseData.data?.product || responseData.product || responseData;
          updatedProductData = {
            ...productData,
            totalStockQuantity: productData.totalStockQuantity || 0,
            currentAverageCostPrice: productData.currentAverageCostPrice || 0,
          };
        }

        // Update state with the new stock levels
        setAgroProducts((prev) =>
          prev.map((product) => {
            if (product.id !== productId) return product;

            if (variantId) {
              return {
                ...product,
                variants: product.variants?.map((variant) =>
                  variant.id === variantId
                    ? {
                        ...variant,
                        totalStockQuantity:
                          updatedProductData.totalStockQuantity,
                        currentAverageCostPrice:
                          updatedProductData.currentAverageCostPrice,
                      }
                    : variant
                ),
              };
            }

            // For main product
            return {
              ...product,
              totalStockQuantity: updatedProductData.totalStockQuantity,
              currentAverageCostPrice:
                updatedProductData.currentAverageCostPrice,
            };
          })
        );

        return updatedProductData;
      } catch (error: any) {
        console.error("Detailed error adding stock:", error);
        console.error("Error response:", error.response?.data); // More detailed logging
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
  // const addStockShipment = useCallback(
  //   async (productId: string, variantId: string | null, shipmentData: any) => {
  //     setLoading(true);
  //     try {
  //       const headers = await getAuthHeaders();
  //       const endpoint = variantId
  //         ? `/agro/${productId}/variants/${variantId}/shipments/web`
  //         : `/agro/${productId}/shipments`;

  //       // Ensure required fields are present
  //       const completeShipmentData = {
  //         ...shipmentData,
  //         type: shipmentData.type || "PURCHASE",
  //         notes: shipmentData.notes || "",
  //         currency: shipmentData.currency || "UGX",
  //       };

  //       const response = await httpClient(endpoint, {
  //         method: "POST",
  //         headers,
  //         body: JSON.stringify(completeShipmentData),
  //       });

  //       const responseData = await response;

  //       // Update state with the new stock levels
  //       setAgroProducts((prev) =>
  //         prev.map((product) => {
  //           if (product.id !== productId) return product;

  //           if (variantId) {
  //             return {
  //               ...product,
  //               variants: product.variants?.map((variant) =>
  //                 variant.id === variantId
  //                   ? {
  //                       ...variant,
  //                       totalStockQuantity:
  //                         responseData.data.variant.totalStockQuantity,
  //                       currentAverageCostPrice:
  //                         responseData.data.variant.currentAverageCostPrice,
  //                     }
  //                   : variant
  //               ),
  //             };
  //           }
  //           return {
  //             ...product,
  //             totalStockQuantity: responseData.data.product.totalStockQuantity,
  //             currentAverageCostPrice:
  //               responseData.data.product.currentAverageCostPrice,
  //           };
  //         })
  //       );

  //       return responseData;
  //     } catch (error: any) {
  //       console.error("Detailed error:", error);
  //       throw new Error(
  //         error.response?.data?.message ||
  //           error.message ||
  //           "Failed to add stock shipment"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [getAuthHeaders]
  // );

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
          variantId: variantId || undefined,
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
  const updateAgroProduct = useCallback(
    async (productId: string, productData: Partial<AgroProduct>) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(productData),
        });
        const updatedProduct = response.data;
        setAgroProducts((prev) =>
          prev.map((p) => (p.id === productId ? updatedProduct : p))
        );
        return updatedProduct;
      } catch (err: any) {
        console.error("Error updating product:", err);
        throw new Error(
          err.response?.data?.message || "Failed to update product"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteAgroProduct = useCallback(
    async (productId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        await httpClient(`/agro/${productId}`, {
          method: "DELETE",
          headers,
        });
        setAgroProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (err: any) {
        console.error("Error deleting product:", err);
        throw new Error(
          err.response?.data?.message || "Failed to delete product"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateAgroProductVariant = useCallback(
    async (
      productId: string,
      variantId: string,
      variantData: Partial<AgroProductVariant>
    ) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/agro/${productId}/variants/${variantId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(variantData),
          }
        );
        const updatedVariant = response.data;
        setAgroProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  variants: p.variants?.map((v) =>
                    v.id === variantId ? updatedVariant : v
                  ),
                }
              : p
          )
        );
        return updatedVariant;
      } catch (err: any) {
        console.error("Error updating variant:", err);
        throw new Error(
          err.response?.data?.message || "Failed to update variant"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteAgroProductVariant = useCallback(
    async (productId: string, variantId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        await httpClient(`/agro/${productId}/variants/${variantId}`, {
          method: "DELETE",
          headers,
        });
        setAgroProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  variants: p.variants?.filter((v) => v.id !== variantId),
                }
              : p
          )
        );
      } catch (err: any) {
        console.error("Error deleting variant:", err);
        throw new Error(
          err.response?.data?.message || "Failed to delete variant"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const fetchAgroDashboardStats = useCallback(
    async (branchId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/stats/${branchId}`, {
          headers,
        });
        return response.data;
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        // Returning mock data on error for now
        return {
          totalProducts: agroProducts.length,
          totalSales: 0,
          totalTransactions: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, agroProducts.length]
  );

  const deleteAllProductShipments = useCallback(
    async (productId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}/shipments`, {
          method: "DELETE",
          headers,
        });

        // Update local state to reflect zero stock
        setAgroProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  totalStockQuantity: 0,
                  currentAverageCostPrice: 0,
                  variants: p.variants?.map((v) => ({
                    ...v,
                    totalStockQuantity: 0,
                    currentAverageCostPrice: 0,
                  })),
                }
              : p
          )
        );

        return response;
      } catch (error: any) {
        console.error("Error deleting product shipments:", error);
        throw new Error(
          error.response?.data?.message || "Failed to delete product shipments"
        );
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteAllVariantShipments = useCallback(
    async (productId: string, variantId: string) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/agro/${productId}/variants/${variantId}/shipments`,
          {
            method: "DELETE",
            headers,
          }
        );

        // Update local state to reflect zero stock for the variant
        setAgroProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  variants: p.variants?.map((v) =>
                    v.id === variantId
                      ? {
                          ...v,
                          totalStockQuantity: 0,
                          currentAverageCostPrice: 0,
                        }
                      : v
                  ),
                }
              : p
          )
        );

        return response;
      } catch (error: any) {
        console.error("Error deleting variant shipments:", error);
        throw new Error(
          error.response?.data?.message || "Failed to delete variant shipments"
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
        updateAgroProduct,
        deleteAgroProduct,
        updateAgroProductVariant,
        deleteAgroProductVariant,
        fetchAgroDashboardStats,
        refetchProducts,
        deleteAllProductShipments,
        deleteAllVariantShipments,
      }}
    >
      {children}
    </AgroProductContext.Provider>
  );
};
