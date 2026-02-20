/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Deal, DealStage } from '@/src/types/salesPipeline';
import { createSalesPipelineApi } from '@/src/data/api/sales-pipeline-http-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface SalesPipelineContextType {
  deals: Deal[];
  isLoading: boolean;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  moveDeal: (id: string, newStage: DealStage) => Promise<void>;
  refreshDeals: () => Promise<void>;
}

const SalesPipelineContext = createContext<SalesPipelineContextType | undefined>(undefined);

export const useSalesPipeline = () => {
  const context = useContext(SalesPipelineContext);
  if (!context) {
    throw new Error('useSalesPipeline must be used within a SalesPipelineProvider');
  }
  return context;
};

export const SalesPipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAuthHeaders, currentBranchId } = useAuth();

  const api = useMemo(() => createSalesPipelineApi(getAuthHeaders), [getAuthHeaders]);

  const refreshDeals = useCallback(async () => {
    if (!currentBranchId) {
      setDeals([]);
      return;
    }

    setIsLoading(true);
    try {
      const fetchedDeals = await api.getDeals(currentBranchId);
      setDeals(fetchedDeals);
    } catch (error: any) {
      console.error("Failed to fetch deals:", error);
      toast({
        title: "Error",
        description: "Failed to load sales pipeline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, currentBranchId]);

  useEffect(() => {
    refreshDeals();
  }, [refreshDeals]);

  const addDeal = useCallback(async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentBranchId) return;
    try {
      const newDeal = await api.createDeal({ ...deal, branchId: currentBranchId });
      setDeals((prev) => [newDeal, ...prev]);
      toast({
        title: "Success",
        description: "Deal added to pipeline successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add deal",
        variant: "destructive",
      });
    }
  }, [api, currentBranchId]);

  const updateDeal = useCallback(async (id: string, updatedDeal: Partial<Deal>) => {
    try {
      const result = await api.updateDeal(id, updatedDeal);
      setDeals((prev) => prev.map((d) => (d.id === id ? result : d)));
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update deal",
        variant: "destructive",
      });
    }
  }, [api]);

  const deleteDeal = useCallback(async (id: string) => {
    try {
      await api.deleteDeal(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Success",
        description: "Deal removed from pipeline",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete deal",
        variant: "destructive",
      });
    }
  }, [api]);

  const moveDeal = useCallback(async (id: string, newStage: DealStage) => {
    try {
      const result = await api.moveDeal(id, newStage);
      setDeals((prev) => prev.map((d) => (d.id === id ? result : d)));
      toast({
        title: "Deal Moved",
        description: `Deal moved to ${newStage.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move deal",
        variant: "destructive",
      });
    }
  }, [api]);

  return (
    <SalesPipelineContext.Provider
      value={{
        deals,
        isLoading,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDeal,
        refreshDeals,
      }}
    >
      {children}
    </SalesPipelineContext.Provider>
  );
};
