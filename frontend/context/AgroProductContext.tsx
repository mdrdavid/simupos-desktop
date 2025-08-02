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
    quantityChange: number // Can be positive (add) or negative (deduct).
  ) => Promise<void>;
  fetchProductsByBranch: (branchId: string) => Promise<void>;
  fetchProductDetails: (productId: string) => Promise<AgroProduct>;
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
  const { getAuthHeaders,currentBranchId } = useAuth();
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
      const response = await httpClient(`/agro/${productId}`, { headers });
      return response.data;
    } catch (err) {
      console.error("Error fetching product details:", err);
      throw err;
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
  const createProduct = useCallback(async (productData: any) => {
  setLoading(true);
  try {
    console.log("Creating product with data:", productData);
    console.log("Current branch ID:", currentBranchId);
    const headers = await getAuthHeaders();
    const response = await httpClient("/agro/web", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...productData,
        branchId: currentBranchId // Ensure branchId is included
      }),
    });
    
    setAgroProducts(prev => [...prev, response.data]);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  } finally {
    setLoading(false);
  }
}, [getAuthHeaders]);

const createVariant = useCallback(async (productId: string, variantData: any) => {
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

    setAgroProducts(prev => prev.map(product => 
      product.id === productId
        ? { ...product, variants: [...(product.variants || []), response.data] }
        : product
    ));

    return response.data;
  } catch (error) {
    console.error("Error creating variant:", error);
    throw error;
  } finally {
    setLoading(false);
  }
}, [getAuthHeaders]);

  //   const createProduct = useCallback(async (productData: any) => {
  //   setLoading(true);
  //   try {
  //     console.log("Creating product with data:", productData);
  //     const headers = await getAuthHeaders();
  //     const response = await httpClient("/agro/web", {
  //       method: "POST",
  //       headers,
  //       body: JSON.stringify(productData),
  //     });
  //     setAgroProducts(prev => [...prev, response.data]);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error creating product:", error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [getAuthHeaders]);
  // const createVariant = useCallback(
  //   async (productId: string, variantData: any) => {
  //     setLoading(true);
  //     try {
  //       const headers = await getAuthHeaders();
  //       const response = await httpClient(`/agro/${productId}/variants`, {
  //         method: "POST",
  //         headers,
  //         body: JSON.stringify(variantData),
  //       });

  //       // Update the product in state to include the new variant
  //       setAgroProducts((prev) =>
  //         prev.map((product) =>
  //           product.id === productId
  //             ? {
  //                 ...product,
  //                 variants: [...(product.variants || []), response.data],
  //               }
  //             : product
  //         )
  //       );

  //       return response.data;
  //     } catch (error) {
  //       console.error("Error creating variant:", error);
  //       throw error;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [getAuthHeaders]
  // );

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
          : `/agro/${productId}/shipments/web`;

        const response = await httpClient(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(shipmentData),
        });

        // Update state with the new stock levels
        setAgroProducts((prev) =>
          prev.map((product) => {
            if (product.id !== productId) return product;

            if (variantId) {
              // Update variant stock
              return {
                ...product,
                variants: product.variants?.map((variant) =>
                  variant.id === variantId
                    ? { ...variant, ...response.data.variant }
                    : variant
                ),
              };
            } else {
              // Update product stock
              return { ...product, ...response.data.product };
            }
          })
        );

        return response.data;
      } catch (error) {
        console.error("Error adding stock shipment:", error);
        throw error;
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
    async (productId: string, quantityChange: number) => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/agro/${productId}/stock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ quantityChange }),
        });

        setAgroProducts((prev) =>
          prev.map((p) => (p.id === productId ? response.data : p))
        );
      } catch (err) {
        console.error("Error updating product stock:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load initial data if branchId is provided
  useEffect(() => {
    if (initialBranchId) {
      fetchProductsByBranch(initialBranchId);
    }
  }, [initialBranchId, fetchProductsByBranch]);

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
      }}
    >
      {children}
    </AgroProductContext.Provider>
  );
};
