export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  category: string
  taxId?: string
  paymentTerms: number // days
  creditLimit: number
  outstandingBalance?: number
  status: "active" | "inactive" | "suspended"
  bankName?: string
  accountNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  lastOrderDate: string
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "paid" | "partial" | "pending";
  amountPaid: number;
  items: SupplierOrderItem[];
  payments: SupplierPayment[];
  notes?: string;
}

export interface SupplierOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // Fields for creating a new item
  sellingPrice?: number;
  category?: string;
  unit?: string;
  barcode?: string;
  description?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  date: string;
  status: "completed" | "pending" | "failed";
  notes?: string;
  createdAt: string;
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  totalOutstanding: number
  avgPaymentDays: number
}

export interface CreateSupplierData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  category: string
  taxId?: string
  paymentTerms: number
  creditLimit: number
  bankName?: string
  accountNumber?: string
  notes?: string
  businessId?: string
  branchId?: string
}

export interface RecordPaymentData {
  orderId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  date: string;
  notes?: string;
}

export interface CreateOrderItemData {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // Fields for creating a new item
  sellingPrice?: number;
  category?: string;
  unit?: string;
  barcode?: string;
  description?: string;
  isNewItem?: boolean;
}

export interface CreateOrderData {
  supplierId: string;
  orderNumber?: string;
  date: string;
  items: CreateOrderItemData[];
  notes?: string;
}

export interface SupplierReport {
  supplier: Supplier;
  summary: {
    totalPurchases: number;
    totalPaid: number;
    outstandingBalance: number;
    totalOrders: number;
    totalPayments: number;
  };
  orders: SupplierOrder[];
  payments: SupplierPayment[];
}
