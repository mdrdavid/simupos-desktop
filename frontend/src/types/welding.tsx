export enum WeldingJobStatus {
  PENDING = "PENDING",
  QUOTED = "QUOTED",
  APPROVED = "APPROVED",
  IN_PROGRESS = "IN_PROGRESS",
  AWAITING_MATERIALS = "AWAITING_MATERIALS",
  READY_FOR_PAINTING = "READY_FOR_PAINTING",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
}

export interface WeldingMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit?: number;
  isCustom: boolean;
}

export interface WeldingJob {
  id: string;
  branchId: string;
  customerName: string;
  customerContact: string;
  customerLocation?: string;
  jobType: string;
  description: string;
  materialsNeeded: WeldingMaterial[];
  estimatedCost: number;
  requiredDeliveryDate: string;
  status: WeldingJobStatus;
  activeQuoteId?: string;
  activeInvoiceId?: string;
  assignedArtisans?: string[];
  imageUploads?: { stage: string; uri: string; timestamp: string }[];
  deliveryConfirmed?: boolean;
  customerRating?: number;
  customerFeedback?: string;
  paymentsReceived?: { amount: number; date: string; method: string }[];
  expenses?: {
    id: string;
    description: string;
    amount: number;
    date: string;
    weldingJobId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface WeldingMaterialStockItem {
  id: string;
  name: string;
  unit: string;
  quantityInStock: number;
  lowStockThreshold?: number;
  supplierInfo?: string;
  lastRestockDate?: string;
  notes?: string;
}

export interface CustomerSnapshot {
  name: string;
  contact: string;
  location?: string;
}

export enum QuoteStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  INVOICED = "INVOICED",
}

export enum InvoicePaymentStatus {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  materialDetails?: WeldingMaterial;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
}

export interface WeldingQuote {
  id: string;
  weldingJobId: string;
  quoteNumber: string;
  customerDetails: CustomerSnapshot;
  lineItems: LineItem[];
  subTotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  validUntil?: string;
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WeldingInvoice {
  id: string;
  weldingJobId: string;
  quoteId?: string;
  invoiceNumber: string;
  customerDetails: CustomerSnapshot;
  lineItems: LineItem[];
  subTotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  issueDate: string;
  dueDate?: string;
  paymentsMade: Payment[];
  paymentStatus: InvoicePaymentStatus;
  notes?: string;
  includeTax?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Context type definitions
export interface WeldingContextType {
  weldingJobs: WeldingJob[];
  materialStock: WeldingMaterialStockItem[];
  loadingJobs: boolean;
  loadingMaterialStock: boolean;
  errorMaterialStock: string | null;
  error: string | null;
  addWeldingJob: (
    job: Omit<WeldingJob, "id" | "createdAt" | "updatedAt" | "status">
  ) => Promise<WeldingJob | null>;
  updateWeldingJob: (
    jobId: string,
    updates: Partial<WeldingJob>
  ) => Promise<void>;
  deleteWeldingJob: (jobId: string) => Promise<void>;
  getWeldingJobById: (jobId: string) => WeldingJob | undefined;
  fetchWeldingJobs: () => Promise<void>;
  syncJobsWithBackend: () => Promise<void>;
  addMaterialStockItem: (
    item: Omit<WeldingMaterialStockItem, "id">
  ) => Promise<WeldingMaterialStockItem | null>;
  updateMaterialStockItem: (
    itemId: string,
    updates: Partial<WeldingMaterialStockItem>
  ) => Promise<void>;
  getMaterialStockItemById: (
    itemId: string
  ) => WeldingMaterialStockItem | undefined;
  deleteMaterialStockItem: (itemId: string) => Promise<void>;
  fetchMaterialStock: () => Promise<void>;
  syncMaterialStockWithBackend: () => Promise<void>;
  consumeMaterialFromStock: (
    materialName: string,
    quantity: number
  ) => Promise<boolean>;
  restockMaterialItem: (
    materialName: string,
    quantity: number,
    supplierInfo?: string
  ) => Promise<boolean>;
  // Sync status
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export interface WeldingFinancialContextType {
  quotes: WeldingQuote[];
  invoices: WeldingInvoice[];
  loadingQuotes: boolean;
  loadingInvoices: boolean;
  errorQuotes: string | null;
  errorInvoices: string | null;
  createQuote: (
    job: WeldingJob,
    lineItems: LineItem[],
    notes?: string,
    validUntil?: Date
  ) => Promise<WeldingQuote | null>;
  getQuoteById: (quoteId: string) => WeldingQuote | undefined;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<void>;
  updateQuote: (
    quoteId: string,
    updates: {
      lineItems: LineItem[];
      notes?: string;
      validUntil?: Date;
      status?: QuoteStatus;
    }
  ) => Promise<WeldingQuote | null>;
  deleteQuote: (quoteId: string) => Promise<void>;

  createInvoiceFromQuote: (
    quote: WeldingQuote,
    issueDate?: Date,
    dueDate?: Date,
    includeTax?: boolean
  ) => Promise<WeldingInvoice | null>;
  createStandaloneInvoice: (
    job: WeldingJob,
    lineItems: LineItem[],
    issueDate?: Date,
    dueDate?: Date,
    notes?: string,
    includeTax?: boolean
  ) => Promise<WeldingInvoice | null>;
  getInvoiceById: (invoiceId: string) => WeldingInvoice | undefined;
  recordPaymentForInvoice: (
    invoiceId: string,
    payment: Omit<Payment, "id">
  ) => Promise<Payment | null>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  fetchQuotes: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  syncQuotesWithBackend: () => Promise<void>;
  syncInvoicesWithBackend: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

// export interface WeldingFinancialContextType {
//   quotes: WeldingQuote[];
//   invoices: WeldingInvoice[];
//   loadingQuotes: boolean;
//   loadingInvoices: boolean;
//   getQuoteById: (quoteId: string) => WeldingQuote | undefined;
//   createQuote: (
//     jobId: string,
//     lineItems: LineItem[],
//     notes?: string,
//     validUntil?: Date
//   ) => Promise<WeldingQuote | null>;
//   updateQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<void>;
//   updateQuote: (
//     quoteId: string,
//     updates: {
//       lineItems: LineItem[];
//       notes?: string;
//       validUntil?: Date;
//       status?: QuoteStatus;
//     }
//   ) => Promise<WeldingQuote | null>;
//   deleteQuote: (quoteId: string) => Promise<void>;
//   getInvoiceById: (invoiceId: string) => WeldingInvoice | undefined;
//   createInvoiceFromQuote: (
//     quote: WeldingQuote,
//     issueDate?: Date,
//     dueDate?: Date,
//     includeTax?: boolean
//   ) => Promise<WeldingInvoice | null>;
//   createStandaloneInvoice: (
//     jobId: string,
//     lineItems: LineItem[],
//     issueDate?: Date,
//     dueDate?: Date,
//     notes?: string,
//     includeTax?: boolean
//   ) => Promise<WeldingInvoice | null>;
//   recordPaymentForInvoice: (
//     invoiceId: string,
//     payment: Omit<Payment, "id">
//   ) => Promise<Payment | null>;
//   deleteInvoice: (invoiceId: string) => Promise<void>;
//   fetchQuotes: () => Promise<void>;
//   fetchInvoices: () => Promise<void>;
// }
