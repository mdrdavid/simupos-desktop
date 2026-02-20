"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";

interface Business {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  applyVAT: boolean;
  vatRate?: number;
  currency: string;
  logo?: string | null;
  hasLogo?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any> | null;
  receiptFooter?: string;
  businessType?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  businesses: Business[];
  loading: boolean;
  error: string | null;
  selectBusiness: (businessId: string) => Promise<void>;
  createBusiness: (
    businessData: Omit<Business, "id" | "createdAt" | "updatedAt" | "isDeleted">
  ) => Promise<Business>;
  updateBusiness: (
    id: string,
    updateData: Partial<Business>
  ) => Promise<Business>;
  deleteBusiness: (id: string) => Promise<void>;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider = ({ children }: BusinessProviderProps) => {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentBusinessId, businessData, getAuthHeaders, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadBusinesses = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const storedBusiness = businessData;
        const storedBusinessId = currentBusinessId;

        if (storedBusiness && storedBusinessId) {
          setCurrentBusiness(storedBusiness);
          setLoading(false);
          return;
        }

        // Only make API call if we don't have stored business data
        const headers = await getAuthHeaders();
        const data = await httpClient("/businesses", { headers });

        if (data && data.businesses) {
            setBusinesses(data.businesses);

            if (!storedBusinessId && data.businesses.length > 0) {
                setCurrentBusiness(data.businesses[0]);
                localStorage.setItem("currentBusinessId", data.businesses[0].id);
                localStorage.setItem("businessData", JSON.stringify(data.businesses[0]));
            }
        }

      } catch (err) {
        // If it's an auth error, don't set error state as httpClient will handle redirect
        if (err instanceof Error && err.message.includes("No authentication token")) {
          setLoading(false);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load businesses");
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [isAuthenticated, currentBusinessId, businessData, getAuthHeaders]);
  const selectBusiness = async (businessId: string) => {
    try {
      setLoading(true);
      const business = businesses.find((b) => b.id === businessId);
      if (!business) {
        throw new Error("Business not found");
      }

      setCurrentBusiness(business);
      localStorage.setItem("currentBusinessId", businessId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to select business"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (
  businessData: Omit<Business, "id" | "createdAt" | "updatedAt" | "isDeleted">
) => {
  try {
    setLoading(true);
    const headers = await getAuthHeaders();
    const newBusiness = await httpClient("/businesses", {
      method: "POST",
      body: JSON.stringify(businessData),
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
    });

    setBusinesses((prev) => [...prev, newBusiness.business]);
    setCurrentBusiness(newBusiness.business);
    localStorage.setItem("currentBusinessId", newBusiness.business.id);

    return newBusiness.business;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create business");
    throw err;
  } finally {
    setLoading(false);
  }
};
  const updateBusiness = async (id: string, updateData: Partial<Business>) => {
  try {
    setLoading(true);
    const headers = await getAuthHeaders();
    const updatedBusiness = await httpClient(`/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
      headers,
    });

    // Update businesses list
    setBusinesses(prev => 
      prev.map(business => 
        business.id === id ? { ...business, ...updatedBusiness } : business
      )
    );

    // Update current business if it's the one being updated
    if (currentBusiness?.id === id) {
      const newCurrentBusiness = { ...currentBusiness, ...updatedBusiness };
      setCurrentBusiness(newCurrentBusiness);
      
      // Update AsyncStorage
      localStorage.setItem("businessData", JSON.stringify(newCurrentBusiness));
    }

    return updatedBusiness;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update business");
    throw err;
  } finally {
    setLoading(false);
  }
};

  const deleteBusiness = async (id: string) => {
    try {
      setLoading(true);
      await httpClient(`/businesses/${id}`, {
        method: "DELETE",
      });

      setBusinesses((prev) => prev.filter((business) => business.id !== id));

      // If deleting current business, select another one if available
      if (currentBusiness?.id === id) {
        const remainingBusinesses = businesses.filter((b) => b.id !== id);
        if (remainingBusinesses.length > 0) {
          setCurrentBusiness(remainingBusinesses[0]);
          localStorage.setItem(
            "currentBusinessId",
            remainingBusinesses[0].id
          );
        } else {
          setCurrentBusiness(null);
          localStorage.removeItem("currentBusinessId");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete business"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshBusinesses = async () => {
  try {
    setLoading(true);
    const headers = await getAuthHeaders();
    const data = await httpClient("/businesses", { headers });
    setBusinesses(data.businesses);

    if (currentBusiness) {
      const business = data.businesses.find(
        (b: Business) => b.id === currentBusiness.id
      );
      if (business) setCurrentBusiness(business);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to refresh businesses");
  } finally {
    setLoading(false);
  }
};

  const value: BusinessContextType = {
    currentBusiness,
    businesses,
    loading,
    error,
    selectBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    refreshBusinesses,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
