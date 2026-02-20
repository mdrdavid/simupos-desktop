export interface IncomeRecord {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  source: string;
  paymentMethod: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  recipient: string;
  paymentMethod: string;
}

export type FinancialPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';
