/* eslint-disable @typescript-eslint/no-explicit-any */
export enum CashRegisterStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum CashRegisterLogType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  SALE = "SALE",
  OPENING_FLOAT = "OPENING_FLOAT",
  CLOSING_BALANCE = "CLOSING_BALANCE",
}

export interface CashRegisterSession {
  id: string;
  userId: string;
  branchId: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  totalCashSales: number;
  cashIn: number;
  cashOut: number;
  closingBalance?: number;
  expectedBalance?: number;
  discrepancy?: number;
  notes?: string;
  status: CashRegisterStatus;
  user?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  logs?: CashRegisterLog[];
}

export interface CashRegisterLog {
  id: string;
  sessionId: string;
  userId: string;
  type: CashRegisterLogType;
  amount: number;
  reason?: string;
  referenceId?: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}
