import { AgroProductSaleItem } from "./agroProduct"; // Assuming agroProduct.ts is in the same directory

export interface AgroCustomerDetails {
  id?: string; // Optional: If you have a separate customer entity
  name: string;
  phoneNumber?: string;
  address?: string;
  creditLimit?: number;
  outstandingBalance?: number;
}

export interface AgroSale {
  id: string; // Unique ID for the sale
  saleDate: string; // ISO date string
  items: AgroProductSaleItem[]; // List of agro products sold
  totalAmount: number;
  currency: string; // Currency of the totalAmount and sale prices

  isCreditSale: boolean;
  amountPaid: number; // If partial payment on a credit sale, or full for non-credit
  balanceDue: number; // totalAmount - amountPaid

  isDeliveryPending: boolean;
  deliveryDate?: string; // Optional: Expected or actual delivery date (ISO string)
  deliveryAddress?: string; // If different from customer's default

  customerDetails?: AgroCustomerDetails; // Required if isCreditSale is true

  paymentMethod?:
    | "cash"
    | "mobile_money"
    | "mtn_momo"
    | "airtel_money"
    | "bank_transfer"
    | "other"; // Can be extended

  notes?: string;
  branchId: string;
  userId: string; // User who made the sale

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SaleItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
}