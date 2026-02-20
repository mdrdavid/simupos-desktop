// export type VehicleType = "car" | "suv" | "truck" | "motorcycle" | "van";
export type VehicleType =
  | "car"
  | "suv"
  | "truck"
  | "motorcycle"
  | "van"
  | "taxi"
  | "coster"
  | "bus"
  | "carpet";
export type WashType = "basic" | "premium" | "deluxe" | "interior" | "exterior";
export type WashOrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "credit";
export type CommissionType = "percentage" | "fixed";

export interface WashingBayServiceType {
  id: string;
  name: string;
  vehicleType: VehicleType;
  washType: WashType;
  price: number;
  description?: string;
  isActive: boolean;
  estimatedDuration: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WashingBayWorker {
  id: string;
  name: string;
  employeeId?: string;
  phone?: string;
  email?: string;
  commissionType: CommissionType;
  commissionValue: number;
  isActive: boolean;
  branchId: string;
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WashingBayMaterialUsage {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
  branchId: string;
  washOrderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WashingBayWorkerCommission {
  id: string;
  commissionAmount: number;
  commissionDate: string;
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
  branchId: string;
  workerId: string;
  washOrderId: string;
  worker?: WashingBayWorker;
  washOrder?: WashingBayWashOrder;
  createdAt: string;
  updatedAt: string;
}

export interface WashingBayWashOrder {
  id: string;
  orderNumber: string;
  status: WashOrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  completedAt?: string;
  vehicleType: VehicleType;
  licensePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  servicePrice: number;
  materialCost: number;
  commissionAmount: number;
  netProfit: number;
  amountPaid: number;
  notes?: string;
  branchId: string;
  customerId?: string;
  userId: string;
  serviceTypeId: string;
  workerId?: string;
  customerName?: string;
  customerPhone?: string;
  // New fields
  customServicePrice?: number;
  customCommissionAmount?: number;
  overrideCommission?: boolean;
  // Relations
  serviceType?: WashingBayServiceType;
  worker?: WashingBayWorker;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  materialUsages?: WashingBayMaterialUsage[];
  commissions?: WashingBayWorkerCommission[];

  createdAt: string;
  updatedAt: string;
}
export interface WashingBayDailySummary {
  id: string;
  summaryDate: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalMaterialCost: number;
  totalCommission: number;
  totalNetProfit: number;
  creditOrders: number;
  creditAmount: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfitAnalytics {
  summary: {
    totalRevenue: number;
    totalMaterialCost: number;
    totalCommission: number;
    totalNetProfit: number;
    orderCount: number;
  };
  breakdown: Array<{
    date: string;
    orderCount: number;
    revenue: number;
    materialCost: number;
    commission: number;
    netProfit: number;
  }>;
}

export interface BulkCreateUsersResult {
  successful: WashingBayWorker[];
  failed: Array<{
    workerId: string;
    error: string;
  }>;
}

// Request DTOs
export interface CreateServiceTypeRequest {
  name: string;
  vehicleType: VehicleType;
  washType: WashType;
  price: number;
  description?: string;
  estimatedDuration?: number;
  branchId: string;
}

export interface CreateWorkerRequest {
  name: string;
  employeeId?: string;
  phone?: string;
  email?: string;
  commissionType: CommissionType;
  commissionValue: number;
  branchId: string;
  createUserAccount?: boolean;
}

export interface CreateWashOrderRequest {
  vehicleType: VehicleType;
  licensePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  serviceTypeId: string;
  workerId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  notes?: string;
  branchId: string;
  // New fields
  customServicePrice?: number;
  customCommissionAmount?: number;
  overrideCommission?: boolean;
}

export interface AddMaterialUsageRequest {
  washOrderId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  notes?: string;
  branchId: string;
}

export interface MarkCommissionsPaidRequest {
  commissionIds: string[];
  branchId: string;
}

export interface BulkCreateUsersRequest {
  workerIds: string[];
  branchId: string;
}

export interface WorkerPerformanceAnalytics {
  summary: {
    period: {
      type: "day" | "week" | "month" | "custom";
      startDate: string;
      endDate: string;
    };
    branchStatistics: {
      totalWorkers: number;
      totalOrders: number;
      completedOrders: number;
      totalRevenue: number;
      totalProfit: number;
      completionRate: number;
      averageRevenuePerWorker: number;
    };
  };
  workerAnalytics: WorkerAnalytics[];
}

export interface WorkerAnalytics {
  worker: {
    id: string;
    name: string;
    employeeId?: string;
    phone?: string;
    commissionType: CommissionType;
    commissionValue: number;
    isActive: boolean;
  };
  period: {
    type: "day" | "week" | "month" | "custom";
    startDate: string;
    endDate: string;
  };
  statistics: {
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    totalCommission: number;
    paidCommission: number;
    pendingCommission: number;
    commissionEfficiency: number;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    orderDate: string;
    status: WashOrderStatus;
    servicePrice: number;
    commissionAmount: number;
    netProfit: number;
    vehicleType: VehicleType;
  }>;
}
