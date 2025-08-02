/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Patient {
  id: string
  name: string
  gender: "Male" | "Female" | "Other"
  age: number
  phone: string
  patientId: string
  address?: string
  emergencyContact?: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  fee: number
  category: "Consultation" | "Lab" | "ANC" | "Procedure" | "Vaccination" | "Other"
  description?: string
  duration?: number
  isActive: boolean
  createdAt: Date
}

export interface Medicine {
  id: string
  name: string
  batch: string
  expiryDate: Date
  unitPrice: number
  quantity: number
  minStock: number
  unit: string
  supplier?: string
  category?: string
  dosage?: string
  createdAt: Date
  updatedAt: Date
}

export interface VisitService {
  id: string
  service: Service
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export interface VisitMedicine {
  id: string
  medicine: Medicine
  quantity: number
  unitPrice: number
  totalPrice: number
  dosage?: string
  instructions?: string
}

export interface Visit {
  id: string
  patient: Patient
  services: VisitService[]
  medicines: VisitMedicine[]
  status: "Open" | "Billed" | "Completed" | "Cancelled"
  attendingStaff?: string
  diagnosisNotes?: string
  subtotal: number
  tax: number
  total: number
  paymentMethod?: "Cash" | "Mobile Money" | "Insurance" | "Credit"
  receiptSent?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  isActive: boolean
  createdAt: Date
}

export interface Role {
  id: string
  name: "Receptionist" | "Nurse" | "Pharmacist" | "Manager" | "Admin"
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description: string
  module: "patients" | "services" | "pharmacy" | "visits" | "reports" | "settings"
}

export interface ClinicSettings {
  clinicName: string
  address: string
  phone: string
  email: string
  logo?: string
  currency: string
  taxRate: number
  receiptFooter?: string
  smsEnabled: boolean
  whatsappEnabled: boolean
}

export interface ClinicStats {
  todayPatients: number
  todayRevenue: number
  monthlyPatients: number
  monthlyRevenue: number
  lowStockMedicines: number
  activeVisits: number
  topServices: Array<{
    service: Service
    count: number
    revenue: number
  }>
}

export interface Report {
  id: string
  type: "revenue" | "services" | "inventory" | "staff"
  period: "daily" | "weekly" | "monthly" | "custom"
  startDate: Date
  endDate: Date
  data: any
  generatedAt: Date
  generatedBy: string
}

export interface ClinicContextType {
  // Patients
  patients: Patient[]
  addPatient: (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  searchPatients: (query: string) => Patient[]

  // Services
  services: Service[]
  addService: (service: Omit<Service, "id" | "createdAt">) => void
  updateService: (id: string, updates: Partial<Service>) => void
  deleteService: (id: string) => void

  // Medicines
  medicines: Medicine[]
  addMedicine: (medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">) => void
  updateMedicine: (id: string, updates: Partial<Medicine>) => void
  deleteMedicine: (id: string) => void
  dispenseMedicine: (medicineId: string, quantity: number) => void
  getLowStockMedicines: () => Medicine[]
  getExpiredMedicines: () => Medicine[]

  // Visits
  visits: Visit[]
  addVisit: (visit: Omit<Visit, "id" | "createdAt" | "updatedAt">) => void
  updateVisit: (id: string, updates: Partial<Visit>) => void
  deleteVisit: (id: string) => void
  getPatientVisits: (patientId: string) => Visit[]

  // Staff
  staff: StaffMember[]
  roles: Role[]
  addStaffMember: (staff: Omit<StaffMember, "id" | "createdAt">) => void
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void

  // Settings
  settings: ClinicSettings
  updateSettings: (settings: Partial<ClinicSettings>) => void

  // Stats
  stats: ClinicStats
  refreshStats: () => void

  // Reports
  generateReport: (type: Report["type"], period: Report["period"], startDate?: Date, endDate?: Date) => Report
}
