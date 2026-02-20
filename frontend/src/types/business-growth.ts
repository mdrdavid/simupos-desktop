export type CapitalTransactionType = "injection" | "withdrawal";

export interface CapitalTransaction {
  id: string;
  type: CapitalTransactionType;
  amount: number;
  date: string;
  source?: string;
  reason?: string;
  notes?: string;
  branchId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessGrowthSettings {
  id: string;
  openingCapital: number;
  financialYearStart: string;
  financialYearEnd: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthMetrics {
  period: string;
  openingCapital: number;
  capitalInjections: number;
  capitalWithdrawals: number;
  netCapital: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  businessValue: number;
  growthPercentage: number;
  previousPeriodValue?: number;
}

export interface GrowthReport {
  metrics: GrowthMetrics;
  comparison?: {
    previousPeriod: GrowthMetrics;
    growth: {
      capital: number;
      sales: number;
      profit: number;
      businessValue: number;
    };
  };
}

export interface DashboardData {
  kpis: {
    netCapital: number;
    netProfit: number;
    businessValue: number;
    growthPercentage: number;
  };
  comparison: {
    capital: number;
    profit: number;
    businessValue: number;
  };
  bestWorstPeriods: {
    bestByValue: { period: string; businessValue: number; netProfit: number };
    worstByValue: { period: string; businessValue: number; netProfit: number };
    bestByProfit: { period: string; businessValue: number; netProfit: number };
    worstByProfit: { period: string; businessValue: number; netProfit: number };
  };
}