/* eslint-disable @typescript-eslint/no-explicit-any */
// Pricing Types
export interface NightParkingPricing {
  id: string;
  vehicleType: string;
  name: string;
  description?: string;
  priceType: "nightly" | "hourly" | "monthly" | "weekly";
  basePrice: number;
  hourlyRate: number;
  minHours: number;
  discountPercentage: number;
  discountAfterDays: number;
  commissionValue: number;
  commissionType: "fixed" | "percentage";
  isActive: boolean;
  branchId: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Slot Types
export interface NightParkingSlot {
  id: string;
  slotNumber: string;
  name: string;
  description?: string;
  vehicleType: "car" | "suv" | "truck" | "boda" | "van" | "any";
  status: "available" | "occupied" | "reserved" | "maintenance";
  isActive: boolean;
  premiumCharge?: number;
  features?: Record<string, any>;
  branchId: string;
  lastOccupiedAt?: string;
  lastMaintenanceAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Record Types
export type ParkingStatus =
  | "parked"
  | "checked_out"
  | "extended"
  | "overdue"
  | "cancelled";
export type PaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "credit"
  | "refunded";
export type PaymentMethod =
  | "cash"
  | "mobile_money"
  | "credit_card"
  | "bank_transfer";

export interface NightParkingRecord {
  id: string;
  ticketNumber: string;
  vehicleType: string;
  licensePlate: string;
  vehicleModel?: string;
  vehicleColor?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  pricingId?: string;
  slotId?: string;
  checkInTime: string;
  checkOutTime?: string;
  expectedCheckOut?: string;
  status: ParkingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  amountPaid: number;
  discountAmount: number;
  commissionAmount: number;
  premiumCharge: number;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  checkInNotes?: string;
  checkOutNotes?: string;
  metadata?: Record<string, any>;
  branchId: string;
  checkInByUserId?: string;
  checkOutByUserId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  pricing?: NightParkingPricing;
  slot?: NightParkingSlot;
  customer?: any; // Customer type from your existing types
  checkInBy?: any; // User type
  checkOutBy?: any; // User type
}

// Commission Types
export interface NightParkingWorkerCommission {
  id: string;
  commissionAmount: number;
  commissionDate: string;
  isPaid: boolean;
  paidAt?: string;
  commissionType: "check_in" | "check_out" | "extension" | "override";
  notes?: string;
  branchId: string;
  recordId: string;
  workerId: string;
  paidByUserId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  worker?: any; // User type
  record?: NightParkingRecord;
}

// Damage Record Types
export type DamageSeverity = "minor" | "moderate" | "major" | "critical";

export interface NightParkingDamageRecord {
  id: string;
  description: string;
  severity: DamageSeverity;
  location?: string;
  notes?: string;
  photoUrls?: string[];
  acknowledgedByCustomer: boolean;
  acknowledgedAt?: string;
  branchId: string;
  recordId: string;
  reportedByUserId: string;
  acknowledgedByUserId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  reportedBy?: any; // User type
  acknowledgedBy?: any; // User type
}

// Daily Summary Types
export interface NightParkingDailySummary {
  id: string;
  summaryDate: string;
  totalVehicles: number;
  vehiclesCheckedIn: number;
  vehiclesCheckedOut: number;
  vehiclesExtended: number;
  vehiclesOverdue: number;
  totalRevenue: number;
  cashRevenue: number;
  mobileMoneyRevenue: number;
  creditRevenue: number;
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  occupancyRate: number;
  averageStayHours: number;
  vehicleTypeBreakdown?: Record<string, { count: number; revenue: number }>;
  paymentMethodBreakdown?: Record<string, { count: number; amount: number }>;
  branchId: string;
  generatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreatePricingRequest {
  vehicleType: string;
  name: string;
  description?: string;
  priceType: "nightly" | "hourly" | "monthly" | "weekly";
  basePrice: number;
  hourlyRate?: number;
  minHours?: number;
  discountPercentage?: number;
  discountAfterDays?: number;
  commissionValue?: number;
  commissionType?: "fixed" | "percentage";
  isActive?: boolean;
  branchId: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateSlotRequest {
  slotNumber: string;
  name: string;
  description?: string;
  vehicleType?: "car" | "suv" | "truck" | "boda" | "van" | "any";
  status?: "available" | "occupied" | "reserved" | "maintenance";
  isActive?: boolean;
  premiumCharge?: number;
  features?: Record<string, any>;
  branchId: string;
}

export interface CheckInVehicleRequest {
  vehicleType: string;
  licensePlate: string;
  vehicleModel?: string;
  vehicleColor?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  pricingId?: string;
  slotId?: string;
  checkInNotes?: string;
  expectedCheckOut?: string;
  checkInPhotos?: string[];
  workerId?: string;
  branchId: string;
  overridePricing?: {
    basePrice?: number;
    hourlyRate?: number;
    commissionValue?: number;
    commissionType?: "fixed" | "percentage";
  };
}

export interface CheckOutVehicleRequest {
  recordId: string;
  checkOutNotes?: string;
  checkOutPhotos?: string[];
  paymentMethod: PaymentMethod;
  amountPaid: number;
  workerId?: string;
  applyDiscount?: number;
  overrideTotal?: number;
}

export interface ExtendStayRequest {
  recordId: string;
  additionalHours: number;
  workerId?: string;
  notes?: string;
}

export interface RecordDamageRequest {
  recordId: string;
  description: string;
  severity: DamageSeverity;
  location?: string;
  notes?: string;
  photoUrls?: string[];
  branchId: string;
}

export interface MarkCommissionsPaidRequest {
  commissionIds: string[];
  branchId: string;
  paymentDate?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

// Analytics Types
export interface WorkerPerformanceAnalytics {
  worker: {
    id: string;
    name: string;
    role: string;
  };
  period: {
    startDate?: string;
    endDate?: string;
  };
  statistics: {
    totalCheckIns: number;
    totalCheckOuts: number;
    totalTransactions: number;
    totalRevenue: number;
    totalCommission: number;
    paidCommission: number;
    pendingCommission: number;
    averageTransactionValue: number;
  };
}

export interface ParkingDashboardStats {
  summary: {
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    maintenanceSlots: number;
    occupancyRate: number;
    parkedVehicles: number;
    checkedOutToday: number;
    overdueVehicles: number;
    totalRevenueToday: number;
    pendingCommissions: number;
    averageRevenuePerVehicle: number;
  };
  recentActivity: Array<{
    id: string;
    ticketNumber: string;
    licensePlate: string;
    vehicleType: string;
    customerName?: string;
    checkInTime: string;
    status: ParkingStatus;
    totalAmount: number;
    workerName?: string;
  }>;
  vehicleTypeStats: Array<{
    vehicleType: string;
    count: number;
    revenue: number;
  }>;
  timestamp: string;
}

export interface MonthlyRevenueReport {
  period: {
    year: number;
    month: number;
    monthName: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalVehicles: number;
    totalRevenue: number;
    averageStayHours: number;
    averageRevenuePerVehicle: number;
  };
  dailyBreakdown: Array<{
    date: string;
    vehicles: number;
    revenue: number;
    averageStayHours: number;
  }>;
  vehicleTypeStats: Record<
    string,
    {
      count: number;
      revenue: number;
      averageStayHours: number;
    }
  >;
}

export interface WorkerShiftSummary {
  shiftPeriod: {
    startTime: string;
    endTime: string;
  };
  worker: {
    id: string;
  };
  statistics: {
    checkInsCount: number;
    checkOutsCount: number;
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    totalCommission: number;
    paidCommission: number;
    pendingCommission: number;
  };
  details: {
    checkIns: Array<{
      ticketNumber: string;
      licensePlate: string;
      time: string;
      amount: number;
    }>;
    checkOuts: Array<{
      ticketNumber: string;
      licensePlate: string;
      time: string;
      amount: number;
      amountPaid: number;
    }>;
    commissions: Array<{
      amount: number;
      type: string;
      isPaid: boolean;
      recordId: string;
    }>;
  };
}

export interface SlotOccupancy {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  maintenanceSlots: number;
  occupancyRate: number;
}
