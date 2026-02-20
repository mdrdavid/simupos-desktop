/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useContext,
} from "react";
import { useAuth } from "./AuthContext";
import { httpClient } from "@/src/data/api/httpClient";
import {
  CashRegisterSession,
  CashRegisterLog,
} from "@/src/types/cash-register";
import { toast } from "@/components/ui/use-toast";

interface CashRegisterContextState {
  session: CashRegisterSession | null;
  sessions: CashRegisterSession[];
  logs: CashRegisterLog[];
  loading: boolean;
  error: string | null;
  openRegister: (openingFloat: number) => Promise<void>;
  closeRegister: (closingBalance: number, notes: string) => Promise<void>;
  cashIn: (amount: number, reason: string) => Promise<void>;
  cashOut: (amount: number, reason: string) => Promise<void>;
  loadSessionLogs: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getSessions: (filters: {
    branchId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: "OPEN" | "CLOSED";
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getSessionLogs: (sessionId: string) => Promise<void>;
  getDailySummary: (branchId: string, date: string) => Promise<any>;
}

export const CashRegisterContext = createContext<
  CashRegisterContextState | undefined
>(undefined);

export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const { getAuthHeaders, currentBranchId, isAuthenticated } = useAuth();
  const [session, setSession] = useState<CashRegisterSession | null>(null);
  const [sessions, setSessions] = useState<CashRegisterSession[]>([]);
  const [logs, setLogs] = useState<CashRegisterLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentSession = useCallback(async () => {
    if (!isAuthenticated || !currentBranchId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const { data } = await httpClient(
        `/cash-register/current?branchId=${currentBranchId}`,
        {
          headers,
        }
      );
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, currentBranchId, isAuthenticated]);

  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);

  const openRegister = async (openingFloat: number) => {
    if (!currentBranchId) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient("/cash-register/open", {
        method: "POST",
        body: JSON.stringify({ openingFloat, branchId: currentBranchId }),
        headers,
      });
      setSession(data);
      toast({
        title: "Success",
        description: "Cash register opened successfully",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeRegister = async (closingBalance: number, notes: string) => {
    if (!session) return;
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      await httpClient("/cash-register/close", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session.id,
          closingBalance,
          notes,
        }),
        headers,
      });
      setSession(null);
      setLogs([]);
      toast({
        title: "Success",
        description: "Cash register closed successfully",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cashIn = async (amount: number, reason: string) => {
    if (!session) return;
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient("/cash-register/cash-in", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.id, amount, reason }),
        headers,
      });
      setSession(data);
      toast({ title: "Success", description: "Cash in successful" });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async (amount: number, reason: string) => {
    if (!session) return;
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient("/cash-register/cash-out", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.id, amount, reason }),
        headers,
      });
      setSession(data);
      toast({ title: "Success", description: "Cash out successful" });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSessionLogs = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient(
        `/cash-register/sessions/${session.id}/logs`,
        {
          headers,
        }
      );
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load logs: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessions = async (filters: {
    branchId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: "OPEN" | "CLOSED";
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (filters.branchId) query.append("branchId", filters.branchId);
    if (filters.userId) query.append("userId", filters.userId);
    if (filters.startDate) query.append("startDate", filters.startDate);
    if (filters.endDate) query.append("endDate", filters.endDate);
    if (filters.status) query.append("status", filters.status);
    if (filters.page) query.append("page", filters.page.toString());
    if (filters.limit) query.append("limit", filters.limit.toString());

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient(
        `/cash-register/sessions?${query.toString()}`,
        {
          headers,
        }
      );
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load sessions: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionLogs = async (sessionId: string) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient(
        `/cash-register/sessions/${sessionId}/logs`,
        {
          headers,
        }
      );
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load logs: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDailySummary = async (branchId: string, date: string) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const { data } = await httpClient(
        `/cash-register/daily-summary?branchId=${branchId}&date=${date}`,
        { headers }
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load daily summary: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    sessions,
    logs,
    loading,
    error,
    openRegister,
    closeRegister,
    cashIn,
    cashOut,
    loadSessionLogs,
    refreshSession: loadCurrentSession,
    getSessions,
    getSessionLogs,
    getDailySummary,
  };

  return (
    <CashRegisterContext.Provider value={value}>
      {children}
    </CashRegisterContext.Provider>
  );
};

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (context === undefined) {
    throw new Error("useCashRegister must be used within a CashRegisterProvider");
  }
  return context;
};
