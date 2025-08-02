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
  id: string
  supplierId: string
  orderNumber: string
  date: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  items: SupplierOrderItem[]
  notes?: string
}

export interface SupplierOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SupplierPayment {
  id: string
  supplierId: string
  amount: number
  paymentMethod: string
  reference: string
  date: string
  status: "completed" | "pending" | "failed"
  notes?: string
  createdAt: string
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
}

export interface RecordPaymentData {
  amount: number
  paymentMethod: string
  reference: string
  date: string
  notes?: string
}
