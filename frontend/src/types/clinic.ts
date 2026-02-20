/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Patient {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  phone: string;
  email?: string;
  patientId: string;
  address?: string;
  emergencyContact?: string;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  fee: number;
  category:
    | "Consultation"
    | "Lab"
    | "ANC"
    | "Procedure"
    | "Vaccination"
    | "Other";
  description?: string;
  duration?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  batch: string;
  expiryDate: Date;
  unitPrice: number;
  quantity: number;
  minStock: number;
  unit: string;
  supplier?: string;
  category?: string;
  dosage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitService {
  id: string;
  service: Service;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface VisitMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dosage?: string;
  instructions?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  services: Array<{
    serviceId: string;
    quantity: number;
    notes?: string;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  medicines: Array<{
    medicineId: string;
    quantity: number;
    dosage?: string;
    instructions?: string;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  status: "Open" | "Billed" | "Completed" | "Cancelled";
  attendingStaff?: string;
  diagnosisNotes?: string;
  paymentMethod?: "Cash" | "Mobile Money" | "Insurance" | "Credit";
  subtotal: number;
  tax: number;
  total: number;
  receiptSent: boolean;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
}
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: "Receptionist" | "Nurse" | "Pharmacist" | "Manager" | "Admin";
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module:
    | "patients"
    | "services"
    | "pharmacy"
    | "visits"
    | "reports"
    | "settings";
}

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  currency: string;
  taxRate: number;
  receiptFooter?: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface ClinicStats {
  todayPatients: number;
  todayRevenue: number;
  monthlyPatients: number;
  monthlyRevenue: number;
  lowStockMedicines: number;
  activeVisits: number;
  topServices: Array<{
    service: Service;
    count: number;
    revenue: number;
  }>;
}

export interface Report {
  id: string;
  type: "revenue" | "services" | "inventory" | "staff";
  period: "daily" | "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  sampleType: string;
  normalRange: string;
  isActive: boolean;
  createdAt: Date;
}

export interface LabTestOrder {
  id: string;
  patient: Patient;
  tests: LabTestOrderItem[];
  status: "pending" | "in-progress" | "completed" | "cancelled";
  referringDoctor?: string;
  clinicalNotes?: string;
  orderDate: Date;
  completedDate?: Date;
  results?: LabResult[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "partial";
  createdAt: Date;
  updatedAt: Date;
}

export interface LabTestOrderItem {
  id: string;
  test: LabTest;
  priority: "routine" | "urgent";
  notes?: string;
}

export interface LabResult {
  id: string;
  test: LabTest;
  value: string;
  unit: string;
  normalRange: string;
  flag?: "normal" | "low" | "high";
  notes?: string;
  completedBy: string;
  completedAt: Date;
}

export interface LabEquipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  status: "operational" | "maintenance" | "out-of-service";
  location: string;
}
export interface ClinicContextType {
  // State
  loading: boolean;
  error: string | null;

  // Patients
  patients: Patient[];
  addPatient: (
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  searchPatients: (query: string) => Promise<Patient[]>;

  // Services
  services: Service[];
  addService: (service: Omit<Service, "id" | "createdAt">) => Promise<Service>;
  updateService: (id: string, updates: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
   getService: (id: string) => Promise<Service>; 

  // Medicines
  medicines: Medicine[];
  addMedicine: (
    medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">
  ) => Promise<Medicine>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<Medicine>;
  deleteMedicine: (id: string) => Promise<void>;
  dispenseMedicine: (medicineId: string, quantity: number) => Promise<void>;
  getLowStockMedicines: () => Medicine[];
  getExpiredMedicines: () => Medicine[];

  // Visits
  visits: Visit[];
  addVisit: (
    visit: Omit<Visit, "id" | "createdAt" | "updatedAt" | "branchId">
  ) => Promise<Visit>;
  getVisit: (id: string) => Promise<Visit>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<Visit>;
  deleteVisit: (id: string) => Promise<void>;
  getPatientVisits: (patientId: string) => Promise<Visit[]>;

  // Staff
  staff: StaffMember[];
  roles: Role[];
  addStaffMember: (
    staff: Omit<StaffMember, "id" | "createdAt">
  ) => Promise<StaffMember>;
  updateStaffMember: (
    id: string,
    updates: Partial<StaffMember>
  ) => Promise<StaffMember>;

  // Settings
  settings: ClinicSettings;
  updateSettings: (
    settings: Partial<ClinicSettings>
  ) => Promise<ClinicSettings>;

  // Stats
  stats: ClinicStats;
  refreshStats: () => Promise<void>;

  // Reports
  generateReport: (
    type: Report["type"],
    period: Report["period"],
    startDate?: Date,
    endDate?: Date
  ) => Promise<Report>;

  // Laboratory
  labTests: LabTest[];
  labOrders: LabTestOrder[];
  addLabTest: (test: Omit<LabTest, "id" | "createdAt">) => Promise<LabTest>;
  updateLabTest: (id: string, updates: Partial<LabTest>) => Promise<LabTest>;
  deleteLabTest: (id: string) => Promise<void>;
  addLabOrder: (
    order: Omit<LabTestOrder, "id" | "createdAt" | "updatedAt">
  ) => Promise<LabTestOrder>;
  updateLabOrder: (
    id: string,
    updates: Partial<LabTestOrder>
  ) => Promise<LabTestOrder>;
  addLabResult: (
    orderId: string,
    result: Omit<LabResult, "id" | "completedAt">
  ) => Promise<LabTestOrder>;
  getPendingLabOrders: () => LabTestOrder[];
  getCompletedLabOrders: (startDate?: Date, endDate?: Date) => LabTestOrder[];

  // Laboratory Equipment
  labEquipment: LabEquipment[];
  addLabEquipment: (
    equipment: Omit<LabEquipment, "id">
  ) => Promise<LabEquipment>;
  updateLabEquipment: (
    id: string,
    updates: Partial<LabEquipment>
  ) => Promise<LabEquipment>;
  deleteLabEquipment: (id: string) => Promise<void>;

  // Utility
  reloadData: () => Promise<void>;
}
