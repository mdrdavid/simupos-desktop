export interface PayableLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  expenseCategory?: string;
}

export type BillStatus =
  | "draft"
  | "received"
  | "overdue"
  | "partially_paid"
  | "paid"
  | "void";

export type PayablePaymentMethod = "cash" | "bank" | "mobile_money" | "check";

export interface AccountsPayable {
  id: string;
  billNumber: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: BillStatus;
  description?: string;
  terms?: string;
  lineItems?: PayableLineItem[];
  branchId: string;
  businessId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  payments?: PayablePayment[];
}

export interface PayablePayment {
  id: string;
  billId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PayablePaymentMethod;
  referenceNumber?: string;
  notes?: string;
  branchId: string;
  businessId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgedPayables {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
  agedBills: Array<{
    bill: AccountsPayable;
    age: number;
    ageCategory: string;
  }>;
}

export interface PayableSummary {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  statusCounts: Record<BillStatus, number>;
}

export interface SupplierPayableSummary {
  supplierId: string;
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  overdueAmount: number;
  bills: AccountsPayable[];
}
