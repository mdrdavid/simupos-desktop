export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  EQUITY = "equity",
  REVENUE = "revenue",
  EXPENSE = "expense",
}

export enum AccountSubType {
  // Assets
  CURRENT_ASSET = "current_asset",
  FIXED_ASSET = "fixed_asset",
  BANK_ACCOUNT = "bank_account",
  CASH = "cash",
  ACCOUNTS_RECEIVABLE = "accounts_receivable",
  INVENTORY = "inventory",

  // Liabilities
  CURRENT_LIABILITY = "current_liability",
  LONG_TERM_LIABILITY = "long_term_liability",
  ACCOUNTS_PAYABLE = "accounts_payable",

  // Equity
  OWNERS_EQUITY = "owners_equity",
  RETAINED_EARNINGS = "retained_earnings",

  // Revenue
  SALES_REVENUE = "sales_revenue",
  SERVICE_REVENUE = "service_revenue",
  OTHER_REVENUE = "other_revenue",

  // Expenses
  COST_OF_GOODS_SOLD = "cost_of_goods_sold",
  OPERATING_EXPENSE = "operating_expense",
  PAYROLL_EXPENSE = "payroll_expense",
  SUPPLIES_EXPENSE = "supplies_expense",
  UTILITIES_EXPENSE = "utilities_expense",
}

export interface ChartOfAccounts {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountSubType: AccountSubType;
  description?: string;
  openingBalance: number;
  isActive: boolean;
  isSystemAccount: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export enum EntryType {
  DEBIT = "debit",
  CREDIT = "credit",
}

export interface GeneralLedger {
  id: string;
  entryDate: string;
  description: string;
  entryType: EntryType;
  amount: number;
  runningBalance: number;
  reference?: string;
  sourceDocument?: string;
  branchId: string;
  accountId: string;
  account: ChartOfAccounts;
  transactionId?: string;
  expenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrialBalanceAccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface TrialBalance {
  asOfDate: string;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  isBalanced: boolean;
  accountBalances: TrialBalanceAccountBalance[];
}

export interface ProfitAndLossItem {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ProfitAndLossSection {
  items: ProfitAndLossItem[];
  total: number;
}

export interface ProfitAndLoss {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: ProfitAndLossSection;
  expenses: ProfitAndLossSection;
  netIncome: number;
  netLoss: number;
}

export interface BalanceSheetItem {
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetSection {
  items: BalanceSheetItem[];
  total: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  isBalanced: boolean;
}

export interface CashFlowActivitySection {
  items: Array<{ description: string; amount: number }>;
  netCashFlow: number;
}

export interface CashFlowStatement {
  operatingActivities: CashFlowActivitySection;
  investingActivities: CashFlowActivitySection;
  financingActivities: CashFlowActivitySection;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}