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
    getAuthHeaders 
  } = useAuth();
  
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBusinessId) {
        setBranches([]);
        setCurrentBranch(null);
        return;
      }

      const data = await httpClient(`/branches/business/${currentBusinessId}`, {
        headers: await getAuthHeaders(),
      });

      const branchesWithBusiness = data.branches?.map((branch: Branch) => ({
        ...branch,
        business: businessData,
      })) || [];

      setBranches(branchesWithBusiness);

      // Determine current branch
      let selectedBranch: Branch | null = null;
      
      // 1. Check if there's a stored branch ID that exists in the new branches
      if (currentBranchId) {
        selectedBranch = branchesWithBusiness.find(
          (b: Branch) => b.id === currentBranchId
        ) || null;
      }
      
      // 2. Fallback to main branch if no selection or selected branch not found
      if (!selectedBranch) {
        selectedBranch = branchesWithBusiness.find((b: Branch) => b.isMain) || null;
      }
      
      // 3. Fallback to first branch if no main branch
      if (!selectedBranch && branchesWithBusiness.length > 0) {
        selectedBranch = branchesWithBusiness[0];
      }

      if (selectedBranch) {
        setCurrentBranch(selectedBranch);
        if (selectedBranch.id !== currentBranchId) {
          localStorage.setItem("currentBranchId", selectedBranch.id);
          setCurrentBranchId(selectedBranch.id);
        }
      } else {
        setCurrentBranch(null);
        localStorage.removeItem("currentBranchId");
        setCurrentBranchId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load branches"
      );
      console.error("Branch loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBusinessId, businessData, currentBranchId, getAuthHeaders, setCurrentBranchId]);

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
      localStorage.setItem("currentBranchId", branchId);
      setCurrentBranchId(branchId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select branch");
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
      const newBranch = await httpClient(`/branches`, {
        method: "POST",
        body: JSON.stringify({
          ...branchData,
          businessId: currentBusinessId,
        }),
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
      setError(err instanceof Error ? err.message : "Failed to create branch");
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
        prev.map((branch) =>
          branch.id === id ? completeBranch : branch
        )
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
          const mainBranch = remainingBranches.find((b) => b.isMain) || remainingBranches[0];
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
      await httpClient("/branches/switch", {
        method: "POST",
        body: JSON.stringify({ branchId }),
        headers: await getAuthHeaders(),
      });

      await selectBranch(branchId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch branch");
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
