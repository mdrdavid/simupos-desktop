/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  isMain: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  business?: {
    id: string;
    name: string;
  };
}

interface BranchContextType {
  currentBranch: Branch | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
  selectBranch: (branchId: string) => Promise<void>;
  createBranch: (
    branchData: Omit<
      Branch,
      "id" | "createdAt" | "updatedAt" | "isDeleted" | "isMain" | "business"
    >
  ) => Promise<Branch>;
  updateBranch: (id: string, updateData: Partial<Branch>) => Promise<Branch>;
  deleteBranch: (id: string) => Promise<void>;
  refreshBranches: () => Promise<void>;
  switchBranch: (branchId: string) => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider = ({ children }: BranchProviderProps) => {
  const {
    currentBusinessId,
    businessData,
    currentBranchId,
    setCurrentBranchId,
    getAuthHeaders,
    isAuthenticated,
  } = useAuth();

  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current branch ID from localStorage
  const getStoredBranchId = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentBranchId");
    }
    return null;
  };

  // Set current branch ID in localStorage
  const setStoredBranchId = (branchId: string | null) => {
    if (typeof window !== "undefined") {
      if (branchId) {
        localStorage.setItem("currentBranchId", branchId);
      } else {
        localStorage.removeItem("currentBranchId");
      }
    }
  };

  const loadBranches = useCallback(async () => {
    if (!isAuthenticated || !currentBusinessId) {
      setBranches([]);
      setCurrentBranch(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await httpClient(`/branches/business/${currentBusinessId}`, {
        headers: await getAuthHeaders(),
      });

      // Handle both array and object response formats
      const branchesData = Array.isArray(data) ? data : data.branches || [];

      const branchesWithBusiness = branchesData.map((branch: Branch) => ({
        ...branch,
        business: businessData,
      }));

      setBranches(branchesWithBusiness);

      // Get stored branch ID
      const storedBranchId = getStoredBranchId();
      const effectiveBranchId = currentBranchId || storedBranchId;

      // Determine current branch
      let selectedBranch: Branch | null = null;

      // 1. Check if there's a stored branch ID that exists in the new branches
      if (effectiveBranchId) {
        selectedBranch =
          branchesWithBusiness.find(
            (b: Branch) => b.id === effectiveBranchId
          ) || null;
      }

      // 2. Fallback to main branch if no selection or selected branch not found
      if (!selectedBranch) {
        selectedBranch =
          branchesWithBusiness.find((b: Branch) => b.isMain) || null;
      }

      // 3. Fallback to first branch if no main branch
      if (!selectedBranch && branchesWithBusiness.length > 0) {
        selectedBranch = branchesWithBusiness[0];
      }

      if (selectedBranch) {
        setCurrentBranch(selectedBranch);
        const newBranchId = selectedBranch.id;

        // Update stored branch ID if different
        if (newBranchId !== effectiveBranchId) {
          setStoredBranchId(newBranchId);
          setCurrentBranchId(newBranchId);
        }
      } else {
        setCurrentBranch(null);
        setStoredBranchId(null);
        setCurrentBranchId(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load branches";
      setError(errorMessage);
      console.error("Branch loading error:", err);

      // Set empty state on error
      setBranches([]);
      setCurrentBranch(null);
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    currentBusinessId,
    businessData,
    currentBranchId,
    getAuthHeaders,
    setCurrentBranchId,
  ]);

  // Load branches when business changes or on initial load
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const selectBranch = async (branchId: string) => {
    try {
      setLoading(true);
      const branch = branches.find((b) => b.id === branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      setCurrentBranch(branch);
      setStoredBranchId(branchId);
      setCurrentBranchId(branchId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select branch";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const createBranch = async (
    branchData: Omit<
      Branch,
      "id" | "createdAt" | "updatedAt" | "isDeleted" | "isMain" | "business"
    >
  ) => {
    if (!currentBusinessId) {
      throw new Error("No business selected");
    }

    try {
      setLoading(true);

      // Filter out fields that are not in the validation schema
      const { isActive, ...validBranchData } = branchData;

      const newBranch = await httpClient(`/branches/${currentBusinessId}`, {
        method: "POST",
        body: JSON.stringify(validBranchData), // Only send validated fields
        headers: await getAuthHeaders(),
      });

      // Add business data to the new branch
      const completeBranch = {
        ...newBranch,
        business: businessData,
      };

      setBranches((prev) => [...prev, completeBranch]);
      await selectBranch(newBranch.id); // Automatically select new branch

      return completeBranch;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create branch";
      console.error("Create branch error:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBranch = async (id: string, updateData: Partial<Branch>) => {
    try {
      setLoading(true);
      const updatedBranch = await httpClient(`/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: await getAuthHeaders(),
      });

      // Preserve business data
      const completeBranch = {
        ...updatedBranch,
        business: businessData,
      };

      setBranches((prev) =>
        prev.map((branch) => (branch.id === id ? completeBranch : branch))
      );

      if (currentBranch?.id === id) {
        setCurrentBranch(completeBranch);
      }

      return completeBranch;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update branch");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      setLoading(true);
      await httpClient(`/branches/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      setBranches((prev) => prev.filter((branch) => branch.id !== id));

      if (currentBranch?.id === id) {
        const remainingBranches = branches.filter((b) => b.id !== id);
        if (remainingBranches.length > 0) {
          const mainBranch =
            remainingBranches.find((b) => b.isMain) || remainingBranches[0];
          await selectBranch(mainBranch.id);
        } else {
          setCurrentBranch(null);
          localStorage.removeItem("currentBranchId");
          setCurrentBranchId(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete branch");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshBranches = async () => {
    await loadBranches();
  };

  const switchBranch = async (branchId: string) => {
    try {
      setLoading(true);

      const authHeaders = await getAuthHeaders();

      // Make sure we're using the exact endpoint
      const response = await httpClient("/branches/users/current/branch", {
        method: "PUT",
        body: JSON.stringify({ branchId }),
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      });

      // Update local state
      await selectBranch(branchId);

      return response;
    } catch (err: any) {
      // Detailed error logging
      console.error("Switch branch error details:", {
        message: err.message,
        status: err.status,
        url: err.url,
        response: err.response,
      });

      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch branch";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: BranchContextType = {
    currentBranch,
    branches,
    loading,
    error,
    selectBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    refreshBranches,
    switchBranch,
  };

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
};
