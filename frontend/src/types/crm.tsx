export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  gender?: "Male" | "Female" | "Other"
  birthday?: string
  customerType?: "Regular" | "VIP" | "Wholesale"
  notes?: string
  totalSpend: number
  lastVisit?: string
  loyaltyPoints?: number
  branchId: string
  createdAt: string
  updatedAt: string
  purchases?: Purchase[]
}

export interface Purchase {
  id: string
  date: string
  amount: number
  items: string[]
  customerId: string
}

export interface CustomerStats {
  totalCustomers: number
  newThisMonth: number
  totalSpend: number
  averageSpend: number
}

export interface CreateCustomerData {
  name: string
  phone: string
  email?: string
  gender?: string
  birthday?: string
  customerType?: string
  notes?: string
  branchId: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id?: string
}
