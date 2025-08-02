// src/types/credit.ts

export interface OrderItem {
  itemId: string; // Corresponds to Item.id in DataContext
  itemName: string;
  quantity: number;
  price: number; // Price at the time of credit sale
  total: number; // quantity * price
}

export type CreditStatus = "unpaid" | "partially_paid" | "paid";

export interface CreditEntry {
  id: string; // Unique ID for the credit entry
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number; // Sum of all OrderItem.total
  amountPaid: number;
  balance: number; // totalAmount - amountPaid
  dateTaken: string; // ISO date string
  dueDate?: string; // ISO date string (optional)
  status: CreditStatus;
  branchId: string; // To associate with a specific branch
  userId: string; // To associate with the user who created the entry
  // eslint-disable-next-line @typescript-eslint/array-type
  payments?: Array<{
    // Add this field as optional
    amountPaid: string;
    branchId: string;
    createdAt: string;
    creditEntryId: string;
    id: string;
    notes?: string;
    paymentDate: string;
    paymentMethod: string;
    userId: string;
  }>;
}

export interface CreditPayment {
  id: string; // Unique ID for the payment
  creditEntryId: string; // Foreign key to CreditEntry
  amountPaid: number;
  paymentDate: string; // ISO date string
  paymentMethod:
    | "cash"
    | "mtn_momo"
    | "airtel_money"
    | "bank_transfer"
    | "other"; // Extend as needed
  notes?: string;
  branchId: string;
  userId: string; // User who recorded the payment
}


export type PaymentMethod = "cash" | "mtn_momo" |   "airtel_money"  | "bank_transfer" | "other"