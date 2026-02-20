export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  OVERDUE = "overdue",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  VOID = "void",
}

export interface ReceivableLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface AccountsReceivable {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  lineItems?: ReceivableLineItem[];
  branchId: string;
  createdAt: string;
  updatedAt: string;
  payments?: ReceivablePayment[];
}

export interface ReceivablePayment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "mobile_money" | "check";
  referenceNumber?: string;
  notes?: string;
  branchId: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgedReceivables {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
  agedInvoices: Array<{
    invoice: AccountsReceivable;
    age: number;
    ageCategory: string;
  }>;
}

export interface ReceivableSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  statusCounts: Record<InvoiceStatus, number>;
}
