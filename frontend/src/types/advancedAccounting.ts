export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  rate: number;
  effectiveDate: string;
  source: string;
}

export interface FixedAsset {
  id: string;
  assetName: string;
  assetCode: string;
  purchaseDate: string;
  purchaseValue: number;
  salvageValue: number;
  usefulLifeMonths: number;
  depreciationMethod: "straight_line" | "double_declining_balance";
  accumulatedDepreciation: number;
  bookValue: number;
  status: "active" | "disposed" | "fully_depreciated";
  branchId: string;
}

export interface PayrollRun {
  id: string;
  branchId: string;
  payPeriod: string;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  status: "draft" | "processed" | "paid";
  processedAt?: string;
}

export interface Budget {
  id: string;
  branchId: string;
  accountId: string;
  fiscalYear: number;
  periodType: "monthly" | "quarterly" | "annually";
  amount: number;
  alertThreshold: number; // percentage
}

export interface BudgetAlert {
  budgetId: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  isOverBudget: boolean;
}
