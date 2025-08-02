// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WeldingJobStatus, WeldingMaterial } from "./weldingJob"; // Assuming WeldingMaterial might be used in line items

// Customer details, could be a snapshot from WeldingJob or more detailed if needed
export interface CustomerSnapshot {
  name: string;
  contact: string;
  location?: string;
}

export enum QuoteStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  ACCEPTED = "Accepted",
  DECLINED = "Declined",
  INVOICED = "Invoiced", // When an invoice has been created from this quote
}

export enum InvoicePaymentStatus {
  UNPAID = "Unpaid",
  PARTIALLY_PAID = "Partially Paid",
  PAID = "Paid",
  OVERDUE = "Overdue",
}

export interface LineItem {
  id: string;
  description: string; // e.g., "Steel fabrication for main gate", "Material: MS Rod 10mm", "Labor charges"
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
  materialDetails?: WeldingMaterial; // Optional: if line item directly refers to a specific inventoried/custom material
}

export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO date string
  method: string; // e.g., "Cash", "Bank Transfer", "Mobile Money"
  reference?: string; // Optional payment reference
  notes?: string;
}

export interface WeldingQuote {
  id: string; // Unique identifier for the quote
  weldingJobId: string; // Link to the WeldingJob
  quoteNumber: string; // User-friendly or auto-generated quote number
  customerDetails: CustomerSnapshot;
  lineItems: LineItem[];
  subTotal: number; // Sum of all lineItem.total
  taxRate?: number; // Optional: e.g., 0.18 for 18%
  taxAmount?: number; // Optional: subTotal * taxRate
  totalAmount: number; // subTotal + taxAmount (if applicable)
  validUntil?: string; // ISO date string, optional
  notes?: string; // Any additional notes for the customer
  status: QuoteStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}


export interface WeldingInvoice {
  id: string; // Unique identifier for the invoice
  weldingJobId: string; // Link to the WeldingJob
  quoteId?: string; // Optional: if this invoice was generated from a quote
  invoiceNumber: string; // User-friendly or auto-generated invoice number
  customerDetails: CustomerSnapshot;
  lineItems: LineItem[];
  subTotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  amountPaid: number; // Sum of all paymentsMade
  balanceDue: number; // totalAmount - amountPaid
  issueDate: string; // ISO date string, when the invoice was created/sent
  dueDate?: string; // ISO date string, optional
  paymentsMade: Payment[];
  paymentStatus: InvoicePaymentStatus;
  notes?: string; // e.g., payment terms, bank details
  createdAt: string;
  updatedAt: string;
  includeTax?:boolean
}
