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
import { httpClient } from "../src/data/api/httpClient";
import { useAuth } from "./AuthContext";
import { httpClientWithBlob } from "@/src/data/api/httpClientWithBlob";

export enum CabStoreTransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  BALANCE_FORWARD = "balance_forward",
}

export enum CabStoreTransactionCategory {
  GRADE_1 = "Grade 1",
  GRADE_2 = "Grade 2",
  GRADE_3 = "Grade 3",
  SUPER_KAISO = "Super kaiso",
  BANK = "BANK",
  LABOUR = "Labour",
  CASH = "CASH",
  OTHER = "Other",
}

export interface CabStoreRecord {
  id: string;
  transactionDate: string;
  type: CabStoreTransactionType;
  amount: number;
  details?: string;
  category: CabStoreTransactionCategory;
  reference?: string;
  balance: number;
  notes?: string;
  branchId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CabStoreRecordData {
  transactionDate: string;
  type: CabStoreTransactionType;
  amount: number;
  details?: string;
  category: CabStoreTransactionCategory;
  reference?: string;
  notes?: string;
  branchId: string;
}

export interface BalanceSummary {
  currentBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  openingBalance: number;
}

export interface CabStoreFilters {
  startDate?: string;
  endDate?: string;
  type?: CabStoreTransactionType;
  category?: CabStoreTransactionCategory;
  reference?: string;
  page?: number;
  limit?: number;
}

interface CabStoreContextType {
  records: CabStoreRecord[];
  loading: boolean;
  error: string | null;
  balanceSummary: BalanceSummary | null;
  currentBalance: number;

  // CRUD Operations
  createRecord: (recordData: CabStoreRecordData) => Promise<CabStoreRecord>;
  bulkImportRecords: (
    recordsData: CabStoreRecordData[]
  ) => Promise<CabStoreRecord[]>;
  getRecords: (
    branchId: string,
    filters?: CabStoreFilters
  ) => Promise<{
    records: CabStoreRecord[];
    pagination: any;
    currentBalance: number;
  }>;
  getRecordById: (id: string) => Promise<CabStoreRecord>;
  updateRecord: (
    id: string,
    updateData: Partial<CabStoreRecordData>
  ) => Promise<CabStoreRecord>;
  deleteRecord: (id: string) => Promise<void>;

  // Balance Operations
  getBalanceSummary: (
    branchId: string,
    asOfDate?: string
  ) => Promise<BalanceSummary>;

  // Reports
  generateYearlyReport: (branchId: string, year: number) => Promise<Blob>;
  generatingReport: boolean;

  // Utility
  refetchRecords: (
    branchId: string,
    filters?: CabStoreFilters
  ) => Promise<void>;
  clearError: () => void;
}

const CabStoreContext = createContext<CabStoreContextType | undefined>(
  undefined
);

export const useCabStore = () => {
  const context = useContext(CabStoreContext);
  if (!context) {
    throw new Error("useCabStore must be used within a CabStoreProvider");
  }
  return context;
};

interface CabStoreProviderProps {
  children: ReactNode;
}

export const CabStoreProvider = ({ children }: CabStoreProviderProps) => {
  const { getAuthHeaders, currentBranchId } = useAuth();
  const [records, setRecords] = useState<CabStoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary | null>(
    null
  );
  const [currentBalance, setCurrentBalance] = useState(0);
  const [generatingReport, setGeneratingReport] = useState(false);
  const clearError = useCallback(() => setError(null), []);

  const createRecord = useCallback(
    async (recordData: CabStoreRecordData): Promise<CabStoreRecord> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient("/cab-store/records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(recordData),
        });

        const newRecord = await response;
        setRecords((prev) => [...prev, newRecord]);
        setCurrentBalance(newRecord.balance);
        return newRecord;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to create record";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const bulkImportRecords = useCallback(
    async (recordsData: CabStoreRecordData[]): Promise<CabStoreRecord[]> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient("/cab-store/records/bulk-import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(recordsData),
        });

        const result = await response;
        if (result.records && Array.isArray(result.records)) {
          setRecords(result.records);
          if (result.records.length > 0) {
            setCurrentBalance(
              result.records[result.records.length - 1].balance
            );
          }
        }
        return result.records || [];
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to import records";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getRecords = useCallback(
    async (branchId: string, filters?: CabStoreFilters) => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();

        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters?.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters?.endDate) queryParams.append("endDate", filters.endDate);
        if (filters?.type) queryParams.append("type", filters.type);
        if (filters?.category) queryParams.append("category", filters.category);
        if (filters?.reference)
          queryParams.append("reference", filters.reference);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit)
          queryParams.append("limit", filters.limit.toString());

        const queryString = queryParams.toString();
        const url = `/cab-store/records/branch/${branchId}${queryString ? `?${queryString}` : ""}`;

        const response = await httpClient(url, { headers });
        const result = await response;

        setRecords(result.records);
        setCurrentBalance(result.currentBalance);

        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch records";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getRecordById = useCallback(
    async (id: string): Promise<CabStoreRecord> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/cab-store/records/${id}`, {
          headers,
        });
        return await response;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch record";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateRecord = useCallback(
    async (
      id: string,
      updateData: Partial<CabStoreRecordData>
    ): Promise<CabStoreRecord> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/cab-store/records/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(updateData),
        });

        const updatedRecord = await response;
        setRecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record))
        );

        // Update current balance if this is the latest record
        if (records.length > 0 && records[records.length - 1].id === id) {
          setCurrentBalance(updatedRecord.balance);
        }

        return updatedRecord;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to update record";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, records]
  );

  const deleteRecord = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        await httpClient(`/cab-store/records/${id}`, {
          method: "DELETE",
          headers,
        });

        setRecords((prev) => prev.filter((record) => record.id !== id));

        // Recalculate current balance
        if (records.length > 0) {
          const remainingRecords = records.filter((record) => record.id !== id);
          if (remainingRecords.length > 0) {
            setCurrentBalance(
              remainingRecords[remainingRecords.length - 1].balance
            );
          } else {
            setCurrentBalance(0);
          }
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to delete record";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, records]
  );

  const getBalanceSummary = useCallback(
    async (branchId: string, asOfDate?: string): Promise<BalanceSummary> => {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const url = `/cab-store/balance-summary/${branchId}${asOfDate ? `?asOfDate=${asOfDate}` : ""}`;
        const response = await httpClient(url, { headers });
        const summary = await response;

        setBalanceSummary(summary);
        return summary;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch balance summary";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const refetchRecords = useCallback(
    async (branchId: string, filters?: CabStoreFilters) => {
      await getRecords(branchId, filters);
    },
    [getRecords]
  );
  const generateYearlyReport = useCallback(
    async (branchId: string, year: number): Promise<Blob> => {
      setGeneratingReport(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();

        const blob = await httpClientWithBlob(
          `/cab-store/reports/yearly/${branchId}/${year}`,
          { headers }
        );

        return blob;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to generate report";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setGeneratingReport(false);
      }
    },
    [getAuthHeaders]
  );
  // Auto-fetch records when branch changes
  useEffect(() => {
    if (currentBranchId) {
      getRecords(currentBranchId);
      getBalanceSummary(currentBranchId);
    }
  }, [currentBranchId, getRecords, getBalanceSummary]);

  const value: CabStoreContextType = {
    records,
    loading,
    error,
    balanceSummary,
    currentBalance,
    createRecord,
    bulkImportRecords,
    getRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    getBalanceSummary,
    refetchRecords,
    clearError,
    generateYearlyReport,
    generatingReport,
  };

  return (
    <CabStoreContext.Provider value={value}>
      {children}
    </CabStoreContext.Provider>
  );
};
