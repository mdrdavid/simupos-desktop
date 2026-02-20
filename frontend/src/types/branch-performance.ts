export interface PerformanceMetrics {
  totalTransactions: number;
  totalRevenue: number;
  totalItemsSold: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  averageTransactionValue: number;
  profitMargin: number;
}

export interface BranchPerformance extends PerformanceMetrics {
  branchId: string;
  branchName: string;
  period: string;
}

export interface BranchPerformanceComparison {
  business: {
    id: string;
    name: string;
  };
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  branches: BranchPerformance[];
  summary: {
    bestPerforming: {
      branchId: string;
      branchName: string;
      metric: string;
      value: number;
    }[];
    totals: PerformanceMetrics;
  };
}

export interface PerformanceTrends {
  business: {
    id: string;
    name: string;
  };
  period: "monthly" | "quarterly" | "yearly";
  dateRange: {
    start: string;
    end: string;
  };
  trends: {
    branchId: string;
    branchName: string;
    performance: BranchPerformance;
    period: string;
  }[];
}