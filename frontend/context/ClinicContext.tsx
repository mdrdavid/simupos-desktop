/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type {
  Patient,
  Service,
  Medicine,
  Visit,
  StaffMember,
  Role,
  ClinicSettings,
  ClinicStats,
  Report,
  ClinicContextType,
} from "@/src/types/clinic"

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

// Sample data
const samplePatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Nakato",
    gender: "Female",
    age: 28,
    phone: "0701234567",
    patientId: "PAT001",
    address: "Kampala, Uganda",
    emergencyContact: "0709876543",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "John Mukasa",
    gender: "Male",
    age: 35,
    phone: "0702345678",
    patientId: "PAT002",
    address: "Entebbe, Uganda",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Mary Namuli",
    gender: "Female",
    age: 42,
    phone: "0703456789",
    patientId: "PAT003",
    address: "Jinja, Uganda",
    emergencyContact: "0708765432",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
]

const sampleServices: Service[] = [
  {
    id: "1",
    name: "General Consultation",
    fee: 50000,
    category: "Consultation",
    description: "General medical consultation and examination",
    duration: 30,
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Blood Test",
    fee: 25000,
    category: "Lab",
    description: "Complete blood count and analysis",
    duration: 15,
    isActive: true,
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "ANC Check-up",
    fee: 75000,
    category: "ANC",
    description: "Antenatal care consultation and monitoring",
    duration: 45,
    isActive: true,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "Vaccination",
    fee: 30000,
    category: "Vaccination",
    description: "Routine immunization services",
    duration: 10,
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    name: "Minor Surgery",
    fee: 200000,
    category: "Procedure",
    description: "Minor surgical procedures",
    duration: 90,
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
]

const sampleMedicines: Medicine[] = [
  {
      id: "1",
      name: "Paracetamol 500mg",
      batch: "PAR2024001",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      unitPrice: 500,
      quantity: 150,
      minStock: 50,
      supplier: "Pharma Plus Ltd",
      category: "Analgesic",
      dosage: "500mg",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      unit: ""
  },
  {
      id: "2",
      name: "Amoxicillin 250mg",
      batch: "AMX2024002",
      expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      unitPrice: 1200,
      quantity: 25,
      minStock: 30,
      supplier: "Medical Supplies Co",
      category: "Antibiotic",
      dosage: "250mg",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      unit: ""
  },
  {
      id: "3",
      name: "Vitamin B Complex",
      batch: "VIT2024003",
      expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
      unitPrice: 800,
      quantity: 80,
      minStock: 20,
      supplier: "Health Vitamins Ltd",
      category: "Vitamin",
      dosage: "1 tablet",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      unit: ""
  },
  {
      id: "4",
      name: "Malaria Test Kit",
      batch: "MAL2024004",
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      unitPrice: 5000,
      quantity: 5,
      minStock: 10,
      supplier: "Diagnostic Tools Inc",
      category: "Test Kit",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      unit: ""
  },
  {
      id: "5",
      name: "Cough Syrup",
      batch: "COU2024005",
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      unitPrice: 3500,
      quantity: 0,
      minStock: 15,
      supplier: "Pharma Plus Ltd",
      category: "Cough Medicine",
      dosage: "10ml",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      unit: ""
  },
]

const sampleVisits: Visit[] = [
  {
    id: "1",
    patient: samplePatients[0],
    services: [
      {
        id: "1",
        service: sampleServices[0],
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
        notes: "General check-up",
      },
    ],
    medicines: [
      {
        id: "1",
        medicine: sampleMedicines[0],
        quantity: 10,
        unitPrice: 500,
        totalPrice: 5000,
        dosage: "1 tablet twice daily",
        instructions: "Take after meals",
      },
    ],
    status: "Completed",
    attendingStaff: "Dr. Jane Smith",
    diagnosisNotes: "Mild headache, prescribed paracetamol",
    subtotal: 55000,
    tax: 9900,
    total: 64900,
    paymentMethod: "Cash",
    receiptSent: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    patient: samplePatients[1],
    services: [
      {
        id: "2",
        service: sampleServices[1],
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
      },
    ],
    medicines: [],
    status: "Open",
    attendingStaff: "Nurse Mary",
    subtotal: 25000,
    tax: 4500,
    total: 29500,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
]

const sampleRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    permissions: [{ id: "1", name: "manage_all", description: "Full system access", module: "settings" }],
  },
  {
    id: "2",
    name: "Receptionist",
    permissions: [
      { id: "2", name: "manage_patients", description: "Add and view patients", module: "patients" },
      { id: "3", name: "start_visits", description: "Initiate patient visits", module: "visits" },
    ],
  },
  {
    id: "3",
    name: "Nurse",
    permissions: [
      { id: "2", name: "manage_patients", description: "Add and view patients", module: "patients" },
      { id: "3", name: "start_visits", description: "Initiate patient visits", module: "visits" },
      { id: "4", name: "add_services", description: "Add services to visits", module: "services" },
      { id: "5", name: "dispense_medicine", description: "Dispense medicines", module: "pharmacy" },
    ],
  },
  {
    id: "4",
    name: "Pharmacist",
    permissions: [
      { id: "6", name: "manage_pharmacy", description: "Full pharmacy management", module: "pharmacy" },
      { id: "5", name: "dispense_medicine", description: "Dispense medicines", module: "pharmacy" },
    ],
  },
]

const sampleStaff: StaffMember[] = [
  {
    id: "1",
    name: "Dr. Jane Smith",
    email: "jane@clinic.com",
    phone: "0701111111",
    role: sampleRoles[0],
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Nurse Mary",
    email: "mary@clinic.com",
    phone: "0702222222",
    role: sampleRoles[2],
    isActive: true,
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Receptionist Alice",
    email: "alice@clinic.com",
    phone: "0703333333",
    role: sampleRoles[1],
    isActive: true,
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "Pharmacist Bob",
    email: "bob@clinic.com",
    phone: "0704444444",
    role: sampleRoles[3],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
]

const defaultSettings: ClinicSettings = {
  clinicName: "SimuPOS Health Clinic",
  address: "123 Health Street, Kampala, Uganda",
  phone: "0700000000",
  email: "info@simuposclinic.com",
  currency: "UGX",
  taxRate: 18,
  receiptFooter: "Thank you for choosing SimuPOS Health Clinic",
  smsEnabled: true,
  whatsappEnabled: true,
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(samplePatients)
  const [services, setServices] = useState<Service[]>(sampleServices)
  const [medicines, setMedicines] = useState<Medicine[]>(sampleMedicines)
  const [visits, setVisits] = useState<Visit[]>(sampleVisits)
  const [staff, setStaff] = useState<StaffMember[]>(sampleStaff)
  const [roles] = useState<Role[]>(sampleRoles)
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings)
  const [stats, setStats] = useState<ClinicStats>({
    todayPatients: 0,
    todayRevenue: 0,
    monthlyPatients: 0,
    monthlyRevenue: 0,
    lowStockMedicines: 0,
    activeVisits: 0,
    topServices: [],
  })

  // Calculate stats
  useEffect(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const todayVisits = visits.filter((visit) => visit.createdAt >= startOfDay)
    const monthlyVisits = visits.filter((visit) => visit.createdAt >= startOfMonth)
    const completedVisits = visits.filter((visit) => visit.status === "Completed")

    const todayRevenue = todayVisits.reduce((sum, visit) => sum + visit.total, 0)
    const monthlyRevenue = monthlyVisits.reduce((sum, visit) => sum + visit.total, 0)

    const lowStockMedicines = medicines.filter((med) => med.quantity <= med.minStock).length
    const activeVisits = visits.filter((visit) => visit.status === "Open").length

    // Calculate top services
    const serviceStats = new Map()
    completedVisits.forEach((visit) => {
      visit.services.forEach((visitService:any) => {
        const serviceId = visitService.service.id
        if (serviceStats.has(serviceId)) {
          const existing = serviceStats.get(serviceId)
          serviceStats.set(serviceId, {
            ...existing,
            count: existing.count + visitService.quantity,
            revenue: existing.revenue + visitService.totalPrice,
          })
        } else {
          serviceStats.set(serviceId, {
            service: visitService.service,
            count: visitService.quantity,
            revenue: visitService.totalPrice,
          })
        }
      })
    })

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    setStats({
      todayPatients: todayVisits.length,
      todayRevenue,
      monthlyPatients: monthlyVisits.length,
      monthlyRevenue,
      lowStockMedicines,
      activeVisits,
      topServices,
    })
  }, [visits, medicines])

  // Patient functions
  const addPatient = (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">) => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPatients((prev) => [...prev, newPatient])
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((patient) => (patient.id === id ? { ...patient, ...updates, updatedAt: new Date() } : patient)),
    )
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((patient) => patient.id !== id))
  }

  const searchPatients = (query: string): Patient[] => {
    if (!query.trim()) return patients

    const lowercaseQuery = query.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowercaseQuery) ||
        patient.phone.includes(query) ||
        patient.patientId.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Service functions
  const addService = (service: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setServices((prev) => [...prev, newService])
  }

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((service) => (service.id === id ? { ...service, ...updates } : service)))
  }

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((service) => service.id !== id))
  }

  // Medicine functions
  const addMedicine = (medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setMedicines((prev) => [...prev, newMedicine])
  }

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((medicine) => (medicine.id === id ? { ...medicine, ...updates, updatedAt: new Date() } : medicine)),
    )
  }

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((medicine) => medicine.id !== id))
  }

  const dispenseMedicine = (medicineId: string, quantity: number) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === medicineId
          ? {
              ...medicine,
              quantity: Math.max(0, medicine.quantity - quantity),
              updatedAt: new Date(),
            }
          : medicine,
      ),
    )
  }

  const getLowStockMedicines = (): Medicine[] => {
    return medicines.filter((medicine) => medicine.quantity <= medicine.minStock)
  }

  const getExpiredMedicines = (): Medicine[] => {
    const today = new Date()
    return medicines.filter((medicine) => medicine.expiryDate <= today)
  }

  // Visit functions
  const addVisit = (visit: Omit<Visit, "id" | "createdAt" | "updatedAt">) => {
    const newVisit: Visit = {
      ...visit,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setVisits((prev) => [...prev, newVisit])

    // Dispense medicines
    visit.medicines.forEach((visitMedicine:any) => {
      dispenseMedicine(visitMedicine.medicine.id, visitMedicine.quantity)
    })
  }

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    setVisits((prev) =>
      prev.map((visit) => (visit.id === id ? { ...visit, ...updates, updatedAt: new Date() } : visit)),
    )
  }

  const deleteVisit = (id: string) => {
    setVisits((prev) => prev.filter((visit) => visit.id !== id))
  }

  const getPatientVisits = (patientId: string): Visit[] => {
    return visits.filter((visit) => visit.patient.id === patientId)
  }

  // Staff functions
  const addStaffMember = (staffMember: Omit<StaffMember, "id" | "createdAt">) => {
    const newStaffMember: StaffMember = {
      ...staffMember,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setStaff((prev) => [...prev, newStaffMember])
  }

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((member) => (member.id === id ? { ...member, ...updates } : member)))
  }

  // Settings functions
  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings((prev:any) => ({ ...prev, ...newSettings }))
  }

  // Stats functions
  const refreshStats = () => {
    // Stats are automatically refreshed via useEffect
  }

  // Reports function
  const generateReport = (type: Report["type"], period: Report["period"], startDate?: Date, endDate?: Date): Report => {
    const now = new Date()
    let reportStartDate = startDate || now
    let reportEndDate = endDate || now

    if (!startDate || !endDate) {
      switch (period) {
        case "daily":
          reportStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          reportEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          break
        case "weekly":
          reportStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          reportEndDate = now
          break
        case "monthly":
          reportStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
          reportEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
      }
    }

    const filteredVisits = visits.filter(
      (visit) => visit.createdAt >= reportStartDate && visit.createdAt <= reportEndDate,
    )

    let reportData: any = {}

    switch (type) {
      case "revenue":
        reportData = {
          totalRevenue: filteredVisits.reduce((sum, visit) => sum + visit.total, 0),
          totalVisits: filteredVisits.length,
          averagePerVisit:
            filteredVisits.length > 0
              ? filteredVisits.reduce((sum, visit) => sum + visit.total, 0) / filteredVisits.length
              : 0,
          paymentMethods: filteredVisits.reduce(
            (acc, visit) => {
              if (visit.paymentMethod) {
                acc[visit.paymentMethod] = (acc[visit.paymentMethod] || 0) + visit.total
              }
              return acc
            },
            {} as Record<string, number>,
          ),
        }
        break
      case "services":
        const serviceStats = new Map()
        filteredVisits.forEach((visit) => {
          visit.services.forEach((visitService:any) => {
            const serviceId = visitService.service.id
            if (serviceStats.has(serviceId)) {
              const existing = serviceStats.get(serviceId)
              serviceStats.set(serviceId, {
                ...existing,
                count: existing.count + visitService.quantity,
                revenue: existing.revenue + visitService.totalPrice,
              })
            } else {
              serviceStats.set(serviceId, {
                service: visitService.service,
                count: visitService.quantity,
                revenue: visitService.totalPrice,
              })
            }
          })
        })
        reportData = {
          services: Array.from(serviceStats.values()).sort((a, b) => b.revenue - a.revenue),
        }
        break
      case "inventory":
        reportData = {
          lowStockMedicines: getLowStockMedicines(),
          expiredMedicines: getExpiredMedicines(),
          totalMedicines: medicines.length,
          totalValue: medicines.reduce((sum, med) => sum + med.quantity * med.unitPrice, 0),
        }
        break
      case "staff":
        const staffStats = new Map()
        filteredVisits.forEach((visit) => {
          if (visit.attendingStaff) {
            if (staffStats.has(visit.attendingStaff)) {
              const existing = staffStats.get(visit.attendingStaff)
              staffStats.set(visit.attendingStaff, {
                ...existing,
                visits: existing.visits + 1,
                revenue: existing.revenue + visit.total,
              })
            } else {
              staffStats.set(visit.attendingStaff, {
                name: visit.attendingStaff,
                visits: 1,
                revenue: visit.total,
              })
            }
          }
        })
        reportData = {
          staff: Array.from(staffStats.values()).sort((a, b) => b.revenue - a.revenue),
        }
        break
    }

    return {
      id: Date.now().toString(),
      type,
      period,
      startDate: reportStartDate,
      endDate: reportEndDate,
      data: reportData,
      generatedAt: new Date(),
      generatedBy: "System", // In real app, this would be the current user
    }
  }

  const value: ClinicContextType = {
    // Patients
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,

    // Services
    services,
    addService,
    updateService,
    deleteService,

    // Medicines
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    dispenseMedicine,
    getLowStockMedicines,
    getExpiredMedicines,

    // Visits
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
    getPatientVisits,

    // Staff
    staff,
    roles,
    addStaffMember,
    updateStaffMember,

    // Settings
    settings,
    updateSettings,

    // Stats
    stats,
    refreshStats,

    // Reports
    generateReport,
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (context === undefined) {
    throw new Error("useClinic must be used within a ClinicProvider")
  }
  return context
}
