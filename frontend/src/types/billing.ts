/* eslint-disable @typescript-eslint/no-explicit-any */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxAmount: number;
  serviceType?: "consultation" | "lab" | "procedure" | "medicine" | "other";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  visitId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    reason?: string;
  };
  discountAmount: number;
  total: number;
  paidAmount: number;
  dueDate: Date;
  status: "draft" | "pending" | "partial" | "paid" | "cancelled" | "overdue";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  method: "cash" | "mobile_money" | "insurance" | "credit" | "bank_transfer";
  reference?: string;
  receivedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  tariff: Record<string, number>; // Service code to coverage percentage
  isActive: boolean;
  createdAt: Date;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  insuranceProviderId: string;
  patientId: string;
  totalAmount: number;
  coveredAmount: number;
  patientAmount: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  submissionDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingAnalytics {
  todayRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  collectedAmount: number;
  paymentMethods: {
    cash: number;
    mobile_money: number;
    insurance: number;
    credit: number;
    bank_transfer: number;
  };
  topPayers: Array<{
    patientId: string;
    patientName: string;
    totalPaid: number;
    visitCount: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
    invoices: number;
  }>;
}

export interface BillingSettings {
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  receiptFooter: string;
  dueDays: number;
  lateFeePercentage: number;
  autoGenerateInvoice: boolean;
  sendInvoiceReminders: boolean;
}

export interface BillingContextType {
  // State
  invoices: Invoice[];
  payments: Payment[];
  insuranceProviders: InsuranceProvider[];
  insuranceClaims: InsuranceClaim[];
  analytics: BillingAnalytics;
  settings: BillingSettings;
  loading: boolean;
  error: string | null;

  // Invoices
  createInvoice: (
    invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
  ) => Promise<Invoice>;
  getInvoice: (id: string) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  applyDiscount: (
    invoiceId: string,
    discount: { type: "percentage" | "fixed"; value: number; reason?: string }
  ) => Promise<Invoice>;
  sendInvoice: (
    invoiceId: string,
    method: "email" | "sms" | "whatsapp"
  ) => Promise<any>;
  getOutstandingInvoices: () => Invoice[];
  getOverdueInvoices: () => Invoice[];

  // Payments
  recordPayment: (
    payment: Omit<Payment, "id" | "createdAt">
  ) => Promise<Payment>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<Payment>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => Payment[];

  // Insurance Providers
  createInsuranceProvider: (
    provider: Omit<InsuranceProvider, "id" | "createdAt">
  ) => Promise<InsuranceProvider>;
  updateInsuranceProvider: (
    id: string,
    updates: Partial<InsuranceProvider>
  ) => Promise<InsuranceProvider>;
  deleteInsuranceProvider: (id: string) => Promise<void>;

  // Insurance Claims
  createInsuranceClaim: (
    claim: Omit<
      InsuranceClaim,
      "id" | "claimNumber" | "createdAt" | "updatedAt"
    >
  ) => Promise<InsuranceClaim>;
  updateInsuranceClaim: (
    id: string,
    updates: Partial<InsuranceClaim>
  ) => Promise<InsuranceClaim>;
  submitInsuranceClaim: (claimId: string) => Promise<InsuranceClaim>;

  // Analytics
  refreshAnalytics: () => Promise<void>;

  // Settings
  updateBillingSettings: (
    settings: Partial<BillingSettings>
  ) => Promise<BillingSettings>;

  // Utility
  reloadData: () => Promise<void>;
}
