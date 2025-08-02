

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

import { v4 as uuidv4 } from 'uuid';
import { httpClient } from "@/src/data/api/httpClient";
import { toast } from "@/components/ui/use-toast"; 
import { WeldingContextType,  WeldingJob,
  WeldingJobStatus,
  WeldingMaterialStockItem, WeldingMaterial} from "@/src/types/welding";

const WeldingContext = createContext<WeldingContextType | undefined>(undefined);

const WELDING_JOBS_STORAGE_KEY = "@SimuPOS_WeldingJobs";
const WELDING_MATERIAL_STOCK_STORAGE_KEY = "@SimuPOS_WeldingMaterialStock";
const WELDING_PENDING_OPERATIONS = "@SimuPOS_WeldingPendingOps";

// Helper functions for localStorage
const getLocalStorageItem = async (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setLocalStorageItem = async (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const removeLocalStorageItem = async (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const WeldingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, currentBranchId, getAuthHeaders } = useAuth();
  const [weldingJobs, setWeldingJobs] = useState<WeldingJob[]>([]);
  const [materialStock, setMaterialStock] = useState<WeldingMaterialStockItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [loadingMaterialStock, setLoadingMaterialStock] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMaterialStock, setErrorMaterialStock] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const branchId = currentBranchId;

  // Job operations
  const fetchWeldingJobs = useCallback(async () => {
    if (!branchId) return;
    setLoadingJobs(true);
    setError(null);
    try {
      // Try to fetch from backend first
      const headers = await getAuthHeaders();
      const response = await httpClient(`/welding/jobs/branch/${branchId}`, {
        headers,
      });

      if (response?.jobs) {
        setWeldingJobs(response.jobs);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch welding jobs from backend:", err);
      setError("Failed to fetch jobs from server. Using local data.");
      // Fallback to local storage if API fails
      const storedJobs = await getLocalStorageItem(WELDING_JOBS_STORAGE_KEY);
      if (storedJobs) {
        setWeldingJobs(storedJobs);
      }
    } finally {
      setLoadingJobs(false);
    }
  }, [branchId, getAuthHeaders]);

  // Material stock operations
  const fetchMaterialStock = useCallback(async () => {
    if (!branchId) return;

    setLoadingMaterialStock(true);
    setErrorMaterialStock(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/welding/materials/branch/${branchId}`,
        { headers }
      );

      if (response?.stockItems) {
        setMaterialStock(response.stockItems);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch material stock from backend:", err);
      setErrorMaterialStock(
        "Failed to fetch stock from server. Using local data."
      );
      const storedMaterialStock = await getLocalStorageItem(
        WELDING_MATERIAL_STOCK_STORAGE_KEY
      );
      if (storedMaterialStock) {
        setMaterialStock(storedMaterialStock);
      }
    } finally {
      setLoadingMaterialStock(false);
    }
  }, [branchId, getAuthHeaders]);

  // Load initial data from local storage
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingJobs(true);
      setLoadingMaterialStock(true);

      // Load jobs from local storage
      const storedJobs = await getLocalStorageItem(WELDING_JOBS_STORAGE_KEY);
      if (storedJobs) {
        setWeldingJobs(storedJobs);
      }

      // Load material stock from local storage
      const storedMaterialStock = await getLocalStorageItem(
        WELDING_MATERIAL_STOCK_STORAGE_KEY
      );
      if (storedMaterialStock) {
        setMaterialStock(storedMaterialStock);
      }

      // Try to sync with backend if online
      if (user && branchId) {
        await Promise.all([fetchWeldingJobs(), fetchMaterialStock()]);
      }
    } catch (err) {
      console.error("Failed to load initial welding data:", err);
      setError("Failed to load welding data");
      setErrorMaterialStock("Failed to load material stock");
    } finally {
      setLoadingJobs(false);
      setLoadingMaterialStock(false);
    }
  }, [user, branchId, fetchWeldingJobs, fetchMaterialStock]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Save jobs to local storage whenever they change
  useEffect(() => {
    const saveJobs = async () => {
      try {
        await setLocalStorageItem(WELDING_JOBS_STORAGE_KEY, weldingJobs);
      } catch (err) {
        console.error("Failed to save welding jobs locally:", err);
      }
    };
    saveJobs();
  }, [weldingJobs]);

  // Save material stock to local storage whenever it changes
  useEffect(() => {
    const saveMaterialStock = async () => {
      try {
        await setLocalStorageItem(WELDING_MATERIAL_STOCK_STORAGE_KEY, materialStock);
      } catch (err) {
        console.error("Failed to save material stock locally:", err);
      }
    };
    saveMaterialStock();
  }, [materialStock]);

  const addWeldingJob = async (
    jobData: Omit<WeldingJob, "id" | "createdAt" | "updatedAt" | "status">
  ) => {
    if (!branchId) {
      toast({
        title: "Error",
        description: "Branch ID is required",
        variant: "destructive",
      });
      return null;
    }

    const newJob: WeldingJob = {
      ...jobData,
      id: uuidv4(),
      status: WeldingJobStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchId: branchId,
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const payload = {
          job: {
            ...jobData,
            branchId: branchId,
          },
          materials: jobData.materialsNeeded || [],
        };

        const response = await httpClient("/welding/jobs", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        setWeldingJobs((prev) => [...prev, response]);
        return response;
      } else {
        setWeldingJobs((prev) => [...prev, newJob]);
        return newJob;
      }
    } catch (err) {
      console.error("Failed to create job:", err);
      toast({
        title: "Error",
        description: "Failed to create welding job",
        variant: "destructive",
      });
      setWeldingJobs((prev) => [...prev, newJob]);
      return newJob;
    }
  };

  const updateWeldingJob = async (
    jobId: string,
    updates: Partial<WeldingJob>
  ) => {
    // Get current job first
    const currentJob = weldingJobs.find((job) => job.id === jobId);
    if (!currentJob) {
      toast({
        title: "Error",
        description: "Job not found",
        variant: "destructive",
      });
      return;
    }

    // Create update payload - exclude fields that shouldn't be updated
    const updatePayload = {
      ...updates,
      assignedArtisans: updates.assignedArtisans || [], // Ensure array format
    };

    // Remove fields that should never be updated via this endpoint
    delete updatePayload.id;
    delete updatePayload.branchId;
    delete updatePayload.createdAt;

    // Update local state
    const updatedJobs = weldingJobs.map((job) =>
      job.id === jobId ? { ...job, ...updatePayload } : job
    );
    setWeldingJobs(updatedJobs);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/jobs/${jobId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatePayload),
        });
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      }
    } catch (err) {
      console.error("Failed to update job on server:", err);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    }
  };

  const deleteWeldingJob = async (jobId: string) => {
    setWeldingJobs((prev) => prev.filter((job) => job.id !== jobId));

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/jobs/${jobId}`, {
          method: "DELETE",
          headers,
        });
      }
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (err) {
      console.error("Failed to delete job on server:", err);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const getWeldingJobById = (jobId: string) => {
    return weldingJobs.find((job) => job.id === jobId);
  };

  // Material stock operations
  // const fetchMaterialStock = useCallback(async () => {
  //   if (!branchId) return;

  //   setLoadingMaterialStock(true);
  //   setErrorMaterialStock(null);
  //   try {
  //     const headers = await getAuthHeaders();
  //     const response = await httpClient(
  //       `/welding/materials/branch/${branchId}`,
  //       { headers }
  //     );

  //     if (response?.stockItems) {
  //       setMaterialStock(response.stockItems);
  //       setLastSyncTime(new Date());
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch material stock from backend:", err);
  //     setErrorMaterialStock(
  //       "Failed to fetch stock from server. Using local data."
  //     );
  //     const storedMaterialStock = await getLocalStorageItem(
  //       WELDING_MATERIAL_STOCK_STORAGE_KEY
  //     );
  //     if (storedMaterialStock) {
  //       setMaterialStock(storedMaterialStock);
  //     }
  //   } finally {
  //     setLoadingMaterialStock(false);
  //   }
  // }, [branchId, getAuthHeaders]);

  const addMaterialStockItem = async (
    itemData: Omit<WeldingMaterialStockItem, "id">
  ) => {
    const newItem: WeldingMaterialStockItem = {
      ...itemData,
      id: uuidv4(),
      lastRestockDate: new Date().toISOString(),
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const response = await httpClient("/welding/materials", {
          method: "POST",
          headers,
          body: JSON.stringify(itemData),
        });

        setMaterialStock((prev) => [...prev, response]);
        toast({
          title: "Success",
          description: "Material added to stock",
        });
        return response;
      } else {
        setMaterialStock((prev) => [...prev, newItem]);
        return newItem;
      }
    } catch (err) {
      console.error("Failed to create stock item on server:", err);
      toast({
        title: "Error",
        description: "Failed to add material to stock",
        variant: "destructive",
      });
      setMaterialStock((prev) => [...prev, newItem]);
      return newItem;
    }
  };

  const updateMaterialStockItem = async (
    itemId: string,
    updates: Partial<WeldingMaterialStockItem>
  ) => {
    const updatedStock = materialStock.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    setMaterialStock(updatedStock);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/materials/${itemId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updates),
        });
        toast({
          title: "Success",
          description: "Material stock updated",
        });
      }
    } catch (err) {
      console.error("Failed to update stock item on server:", err);
      toast({
        title: "Error",
        description: "Failed to update material stock",
        variant: "destructive",
      });
    }
  };

  const deleteMaterialStockItem = async (itemId: string) => {
    setMaterialStock((prev) => prev.filter((item) => item.id !== itemId));

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/materials/${itemId}`, {
          method: "DELETE",
          headers,
        });
      }
      toast({
        title: "Success",
        description: "Material removed from stock",
      });
    } catch (err) {
      console.error("Failed to delete stock item on server:", err);
      toast({
        title: "Error",
        description: "Failed to remove material from stock",
        variant: "destructive",
      });
    }
  };

  const getMaterialStockItemById = (itemId: string) => {
    return materialStock.find((item) => item.id === itemId);
  };

  const consumeMaterialFromStock = async (
    materialName: string,
    quantityToConsume: number
  ) => {
    const itemIndex = materialStock.findIndex(
      (item) => item.name.toLowerCase() === materialName.toLowerCase()
    );
    if (itemIndex === -1) {
      toast({
        title: "Error",
        description: `Material "${materialName}" not found in stock`,
        variant: "destructive",
      });
      return false;
    }

    const item = materialStock[itemIndex];
    if (item.quantityInStock < quantityToConsume) {
      toast({
        title: "Error",
        description: `Insufficient stock for "${materialName}"`,
        variant: "destructive",
      });
      return false;
    }

    const updatedStock = [...materialStock];
    updatedStock[itemIndex] = {
      ...item,
      quantityInStock: item.quantityInStock - quantityToConsume,
    };
    setMaterialStock(updatedStock);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/materials/${item.id}/consume`, {
          method: "POST",
          headers,
          body: JSON.stringify({ quantity: quantityToConsume }),
        });
      }
    } catch (err) {
      console.error("Failed to consume material on server:", err);
      toast({
        title: "Error",
        description: "Failed to record material consumption",
        variant: "destructive",
      });
    }

    return true;
  };

  const restockMaterialItem = async (
    materialName: string,
    quantityToRestock: number,
    supplierInfo?: string
  ) => {
    const itemIndex = materialStock.findIndex(
      (item) => item.name.toLowerCase() === materialName.toLowerCase()
    );
    if (itemIndex === -1) {
      toast({
        title: "Error",
        description: `Material "${materialName}" not found for restocking`,
        variant: "destructive",
      });
      return false;
    }

    const item = materialStock[itemIndex];
    const updatedStock = [...materialStock];
    updatedStock[itemIndex] = {
      ...item,
      quantityInStock: item.quantityInStock + quantityToRestock,
      lastRestockDate: new Date().toISOString(),
      supplierInfo: supplierInfo || item.supplierInfo,
    };
    setMaterialStock(updatedStock);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/materials/${item.id}/restock`, {
          method: "POST",
          headers,
          body: JSON.stringify({ quantity: quantityToRestock, supplierInfo }),
        });
      }
      toast({
        title: "Success",
        description: "Material restocked successfully",
      });
    } catch (err) {
      console.error("Failed to restock material on server:", err);
      toast({
        title: "Error",
        description: "Failed to record material restock",
        variant: "destructive",
      });
    }

    return true;
  };

  // Sync operations
  const syncJobsWithBackend = async () => {
    if (!user || !branchId) return;

    setIsSyncing(true);
    try {
      await fetchWeldingJobs();
      setLastSyncTime(new Date());
      toast({
        title: "Success",
        description: "Jobs synced successfully",
      });
    } catch (err) {
      console.error("Failed to sync jobs:", err);
      toast({
        title: "Error",
        description: "Failed to sync jobs",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncMaterialStockWithBackend = async () => {
    if (!user || !branchId) return;

    setIsSyncing(true);
    try {
      await fetchMaterialStock();
      setLastSyncTime(new Date());
      toast({
        title: "Success",
        description: "Material stock synced successfully",
      });
    } catch (err) {
      console.error("Failed to sync material stock:", err);
      toast({
        title: "Error",
        description: "Failed to sync material stock",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <WeldingContext.Provider
      value={{
        // Jobs
        weldingJobs,
        loadingJobs,
        error,
        addWeldingJob,
        updateWeldingJob,
        deleteWeldingJob,
        getWeldingJobById,
        fetchWeldingJobs,
        syncJobsWithBackend,

        // Material Stock
        materialStock,
        loadingMaterialStock,
        errorMaterialStock,
        fetchMaterialStock,
        addMaterialStockItem,
        updateMaterialStockItem,
        deleteMaterialStockItem,
        getMaterialStockItemById,
        consumeMaterialFromStock,
        restockMaterialItem,
        syncMaterialStockWithBackend,

        // Sync status
        isSyncing,
        lastSyncTime,
      }}
    >
      {children}
    </WeldingContext.Provider>
  );
};

export const useWelding = (): WeldingContextType => {
  const context = useContext(WeldingContext);
  if (!context) {
    throw new Error("useWelding must be used within a WeldingProvider");
  }
  return context;
};







// "use client"

// import type React from "react"
// import { createContext, useContext, useState } from "react"
// import { type WeldingJob, WeldingJobStatus, type WeldingMaterialStockItem } from "@/src/types/welding"

// interface WeldingContextType {
//   weldingJobs: WeldingJob[]
//   materialStock: WeldingMaterialStockItem[]
//   loadingJobs: boolean
//   loadingMaterialStock: boolean
//   error: string | null

//   // Job operations
//   addWeldingJob: (
//     job: Omit<WeldingJob, "id" | "createdAt" | "updatedAt" | "status" | "branchId">,
//   ) => Promise<WeldingJob | null>
//   updateWeldingJob: (jobId: string, updates: Partial<WeldingJob>) => Promise<void>
//   deleteWeldingJob: (jobId: string) => Promise<void>
//   getWeldingJobById: (jobId: string) => WeldingJob | undefined
//   fetchWeldingJobs: () => Promise<void>

//   // Material stock operations
//   fetchMaterialStock: () => Promise<void>
//   addMaterialStockItem: (item: Omit<WeldingMaterialStockItem, "id">) => Promise<WeldingMaterialStockItem | null>
//   updateMaterialStockItem: (itemId: string, updates: Partial<WeldingMaterialStockItem>) => Promise<void>
//   deleteMaterialStockItem: (itemId: string) => Promise<void>
//   consumeMaterialFromStock: (materialName: string, quantityToConsume: number) => Promise<boolean>
//   restockMaterialItem: (materialName: string, quantityToRestock: number, supplierInfo?: string) => Promise<boolean>
// }

// const WeldingContext = createContext<WeldingContextType | undefined>(undefined)

// // Mock data for development
// const mockJobs: WeldingJob[] = [
//   {
//     id: "1",
//     branchId: "branch1",
//     customerName: "John Doe",
//     customerContact: "+256700123456",
//     customerLocation: "Kampala",
//     jobType: "Main Gate",
//     description: "Steel main gate with decorative patterns, 4m x 2m",
//     materialsNeeded: [
//       {
//         id: "1",
//         name: "Steel Bars 20mm",
//         quantity: 10,
//         unit: "pieces",
//         costPerUnit: 15000,
//         isCustom: false,
//       },
//     ],
//     estimatedCost: 500000,
//     requiredDeliveryDate: "2024-02-15",
//     status: WeldingJobStatus.IN_PROGRESS,
//     assignedArtisans: [],
//     createdAt: "2024-01-15T10:00:00Z",
//     updatedAt: "2024-01-15T10:00:00Z",
//   },
//   {
//     id: "2",
//     branchId: "branch1",
//     customerName: "Jane Smith",
//     customerContact: "+256700654321",
//     customerLocation: "Entebbe",
//     jobType: "Window Grills",
//     description: "Security grills for 6 windows, standard size",
//     materialsNeeded: [],
//     estimatedCost: 300000,
//     requiredDeliveryDate: "2024-02-20",
//     status: WeldingJobStatus.PENDING,
//     assignedArtisans: [],
//     createdAt: "2024-01-16T14:30:00Z",
//     updatedAt: "2024-01-16T14:30:00Z",
//   },
// ]

// const mockMaterialStock: WeldingMaterialStockItem[] = [
//   {
//     id: "1",
//     name: "Steel Bars 20mm",
//     unit: "pieces",
//     quantityInStock: 50,
//     lowStockThreshold: 10,
//     supplierInfo: "Steel Works Ltd",
//     lastRestockDate: "2024-01-10T00:00:00Z",
//   },
//   {
//     id: "2",
//     name: "Welding Rods 3.2mm",
//     unit: "kg",
//     quantityInStock: 25,
//     lowStockThreshold: 5,
//     supplierInfo: "Welding Supplies Co",
//     lastRestockDate: "2024-01-12T00:00:00Z",
//   },
// ]

// export function WeldingProvider({ children }: { children: React.ReactNode }) {
//   const [weldingJobs, setWeldingJobs] = useState<WeldingJob[]>(mockJobs)
//   const [materialStock, setMaterialStock] = useState<WeldingMaterialStockItem[]>(mockMaterialStock)
//   const [loadingJobs, setLoadingJobs] = useState(false)
//   const [loadingMaterialStock, setLoadingMaterialStock] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Job operations
//   const addWeldingJob = async (
//     jobData: Omit<WeldingJob, "id" | "createdAt" | "updatedAt" | "status" | "branchId">,
//   ): Promise<WeldingJob | null> => {
//     try {
//       const newJob: WeldingJob = {
//         ...jobData,
//         id: Date.now().toString(),
//         branchId: "branch1",
//         status: WeldingJobStatus.PENDING,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       }

//       setWeldingJobs((prev) => [...prev, newJob])
//       return newJob
//     } catch (error) {
//       console.error("Failed to add welding job:", error)
//       setError("Failed to add welding job")
//       return null
//     }
//   }

//   const updateWeldingJob = async (jobId: string, updates: Partial<WeldingJob>): Promise<void> => {
//     try {
//       setWeldingJobs((prev) =>
//         prev.map((job) => (job.id === jobId ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job)),
//       )
//     } catch (error) {
//       console.error("Failed to update welding job:", error)
//       setError("Failed to update welding job")
//     }
//   }

//   const deleteWeldingJob = async (jobId: string): Promise<void> => {
//     try {
//       setWeldingJobs((prev) => prev.filter((job) => job.id !== jobId))
//     } catch (error) {
//       console.error("Failed to delete welding job:", error)
//       setError("Failed to delete welding job")
//     }
//   }

//   const getWeldingJobById = (jobId: string): WeldingJob | undefined => {
//     return weldingJobs.find((job) => job.id === jobId)
//   }

//   const fetchWeldingJobs = async (): Promise<void> => {
//     setLoadingJobs(true)
//     try {
//       // In a real app, this would fetch from an API
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       setError(null)
//     } catch (error) {
//       console.error("Failed to fetch welding jobs:", error)
//       setError("Failed to fetch welding jobs")
//     } finally {
//       setLoadingJobs(false)
//     }
//   }

//   // Material stock operations
//   const fetchMaterialStock = async (): Promise<void> => {
//     setLoadingMaterialStock(true)
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       setError(null)
//     } catch (error) {
//       console.error("Failed to fetch material stock:", error)
//       setError("Failed to fetch material stock")
//     } finally {
//       setLoadingMaterialStock(false)
//     }
//   }

//   const addMaterialStockItem = async (
//     itemData: Omit<WeldingMaterialStockItem, "id">,
//   ): Promise<WeldingMaterialStockItem | null> => {
//     try {
//       const newItem: WeldingMaterialStockItem = {
//         ...itemData,
//         id: Date.now().toString(),
//         lastRestockDate: new Date().toISOString(),
//       }

//       setMaterialStock((prev) => [...prev, newItem])
//       return newItem
//     } catch (error) {
//       console.error("Failed to add material stock item:", error)
//       setError("Failed to add material stock item")
//       return null
//     }
//   }

//   const updateMaterialStockItem = async (itemId: string, updates: Partial<WeldingMaterialStockItem>): Promise<void> => {
//     try {
//       setMaterialStock((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)))
//     } catch (error) {
//       console.error("Failed to update material stock item:", error)
//       setError("Failed to update material stock item")
//     }
//   }

//   const deleteMaterialStockItem = async (itemId: string): Promise<void> => {
//     try {
//       setMaterialStock((prev) => prev.filter((item) => item.id !== itemId))
//     } catch (error) {
//       console.error("Failed to delete material stock item:", error)
//       setError("Failed to delete material stock item")
//     }
//   }

//   const consumeMaterialFromStock = async (materialName: string, quantityToConsume: number): Promise<boolean> => {
//     try {
//       const itemIndex = materialStock.findIndex((item) => item.name.toLowerCase() === materialName.toLowerCase())

//       if (itemIndex === -1) {
//         setError(`Material "${materialName}" not found in stock`)
//         return false
//       }

//       const item = materialStock[itemIndex]
//       if (item.quantityInStock < quantityToConsume) {
//         setError(`Insufficient stock for "${materialName}"`)
//         return false
//       }

//       const updatedStock = [...materialStock]
//       updatedStock[itemIndex] = {
//         ...item,
//         quantityInStock: item.quantityInStock - quantityToConsume,
//       }

//       setMaterialStock(updatedStock)
//       return true
//     } catch (error) {
//       console.error("Failed to consume material from stock:", error)
//       setError("Failed to consume material from stock")
//       return false
//     }
//   }

//   const restockMaterialItem = async (
//     materialName: string,
//     quantityToRestock: number,
//     supplierInfo?: string,
//   ): Promise<boolean> => {
//     try {
//       const itemIndex = materialStock.findIndex((item) => item.name.toLowerCase() === materialName.toLowerCase())

//       if (itemIndex === -1) {
//         setError(`Material "${materialName}" not found for restocking`)
//         return false
//       }

//       const item = materialStock[itemIndex]
//       const updatedStock = [...materialStock]
//       updatedStock[itemIndex] = {
//         ...item,
//         quantityInStock: item.quantityInStock + quantityToRestock,
//         lastRestockDate: new Date().toISOString(),
//         supplierInfo: supplierInfo || item.supplierInfo,
//       }

//       setMaterialStock(updatedStock)
//       return true
//     } catch (error) {
//       console.error("Failed to restock material:", error)
//       setError("Failed to restock material")
//       return false
//     }
//   }

//   return (
//     <WeldingContext.Provider
//       value={{
//         weldingJobs,
//         materialStock,
//         loadingJobs,
//         loadingMaterialStock,
//         error,
//         addWeldingJob,
//         updateWeldingJob,
//         deleteWeldingJob,
//         getWeldingJobById,
//         fetchWeldingJobs,
//         fetchMaterialStock,
//         addMaterialStockItem,
//         updateMaterialStockItem,
//         deleteMaterialStockItem,
//         consumeMaterialFromStock,
//         restockMaterialItem,
//       }}
//     >
//       {children}
//     </WeldingContext.Provider>
//   )
// }

// export function useWelding() {
//   const context = useContext(WeldingContext)
//   if (context === undefined) {
//     throw new Error("useWelding must be used within a WeldingProvider")
//   }
//   return context
// }