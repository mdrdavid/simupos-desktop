/* eslint-disable @typescript-eslint/no-explicit-any */
export enum BankAccountType {
  CHECKING = "checking",
  SAVINGS = "savings",
  CREDIT_CARD = "credit_card",
  MOBILE_MONEY = "mobile_money",
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: BankAccountType;
  currentBalance: number;
  availableBalance: number;
  isActive: boolean;
  description?: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  transactionType: "debit" | "credit";
  runningBalance: number;
  referenceNumber?: string;
  checkNumber?: string;
  isReconciled: boolean;
  metadata?: Record<string, any>;
  bankAccountId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankReconciliation {
  id: string;
  statementDate: string;
  statementBalance: number;
  systemBalance: number;
  difference: number;
  isReconciled: boolean;
  reconciledTransactions: Array<{
    transactionId: string;
    amount: number;
    description: string;
    date: string;
  }>;
  unreconciledTransactions?: Array<{
    transactionId: string;
    amount: number;
    description: string;
    date: string;
  }>;
  bankAccountId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}
