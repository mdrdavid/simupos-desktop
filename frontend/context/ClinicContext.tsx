/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  LabTest,
  LabTestOrder,
  LabEquipment,
  LabResult,
} from "@/src/types/clinic";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Default settings
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
};

const sampleRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    permissions: [
      {
        id: "1",
        name: "manage_all",
        description: "Full system access",
        module: "settings",
      },
    ],
  },
  {
    id: "2",
    name: "Receptionist",
    permissions: [
      {
        id: "2",
        name: "manage_patients",
        description: "Add and view patients",
        module: "patients",
      },
      {
        id: "3",
        name: "start_visits",
        description: "Initiate patient visits",
        module: "visits",
      },
    ],
  },
  {
    id: "3",
    name: "Nurse",
    permissions: [
      {
        id: "2",
        name: "manage_patients",
        description: "Add and view patients",
        module: "patients",
      },
      {
        id: "3",
        name: "start_visits",
        description: "Initiate patient visits",
        module: "visits",
      },
      {
        id: "4",
        name: "add_services",
        description: "Add services to visits",
        module: "services",
      },
      {
        id: "5",
        name: "dispense_medicine",
        description: "Dispense medicines",
        module: "pharmacy",
      },
    ],
  },
  {
    id: "4",
    name: "Pharmacist",
    permissions: [
      {
        id: "6",
        name: "manage_pharmacy",
        description: "Full pharmacy management",
        module: "pharmacy",
      },
      {
        id: "5",
        name: "dispense_medicine",
        description: "Dispense medicines",
        module: "pharmacy",
      },
    ],
  },
];

interface ClinicProviderProps {
  children: React.ReactNode;
}

export function ClinicProvider({ children }: ClinicProviderProps) {
  const { currentBranchId, getAuthHeaders } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles] = useState<Role[]>(sampleRoles);
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);
  const [stats, setStats] = useState<ClinicStats>({
    todayPatients: 0,
    todayRevenue: 0,
    monthlyPatients: 0,
    monthlyRevenue: 0,
    lowStockMedicines: 0,
    activeVisits: 0,
    topServices: [],
  });
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labOrders, setLabOrders] = useState<LabTestOrder[]>([]);
  const [labEquipment, setLabEquipment] = useState<LabEquipment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      loadInitialData();
    }
  }, [currentBranchId]);

  const loadInitialData = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      await Promise.all([
        fetchPatients(),
        fetchServices(),
        fetchMedicines(),
        fetchVisits(),
        fetchStaff(),
        fetchLabTests(),
        fetchLabOrders(),
        fetchLabEquipment(),
        fetchStats(),
        fetchSettings(),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load clinic data");
      console.error("Error loading clinic data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId]);

  // Data fetching functions
  const fetchPatients = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/patients/branch/${currentBranchId}`,
        { headers }
      );
      setPatients(response.patients || []);
    } catch (err: any) {
      console.error("Error fetching patients:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchServices = useCallback(async () => {
    if (!currentBranchId) {
      console.log("🔍 FRONTEND - No branchId, skipping services fetch");
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/services/branch/${currentBranchId}`,
        { headers }
      );

      setServices(response || []);
    } catch (err: any) {
      console.error("❌ FRONTEND - Error fetching services:", err);
      // Don't throw here, just log the error
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchMedicines = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/medicines/branch/${currentBranchId}`,
        { headers }
      );
      setMedicines(response || []);
    } catch (err: any) {
      console.error("Error fetching medicines:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchVisits = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/visits/branch/${currentBranchId}`,
        { headers }
      );
      setVisits(response.visits || []);
    } catch (err: any) {
      console.error("Error fetching visits:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchStaff = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/staff/branch/${currentBranchId}`,
        { headers }
      );
      setStaff(response || []);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchLabTests = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/lab/tests/branch/${currentBranchId}`,
        { headers }
      );
      setLabTests(response || []);
    } catch (err: any) {
      console.error("Error fetching lab tests:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchLabOrders = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/lab/orders/branch/${currentBranchId}`,
        { headers }
      );
      setLabOrders(response.orders || []);
    } catch (err: any) {
      console.error("Error fetching lab orders:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchLabEquipment = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/lab/equipment/branch/${currentBranchId}`,
        { headers }
      );
      setLabEquipment(response || []);
    } catch (err: any) {
      console.error("Error fetching lab equipment:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchStats = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/dashboard-stats/${currentBranchId}`,
        { headers }
      );

      // Ensure all values are numbers and topServices is an array
      const safeStats = {
        todayPatients: Number(response.todayPatients) || 0,
        todayRevenue: Number(response.todayRevenue) || 0,
        monthlyPatients: Number(response.monthlyPatients) || 0,
        monthlyRevenue: Number(response.monthlyRevenue) || 0,
        lowStockMedicines: Number(response.lowStockMedicines) || 0,
        activeVisits: Number(response.activeVisits) || 0,
        topServices: Array.isArray(response.topServices)
          ? response.topServices
          : [],
      };

      setStats(safeStats);
    } catch (err: any) {
      console.error("❌ Frontend - Error fetching stats:", err);
      // Set safe defaults
      setStats({
        todayPatients: 0,
        todayRevenue: 0,
        monthlyPatients: 0,
        monthlyRevenue: 0,
        lowStockMedicines: 0,
        activeVisits: 0,
        topServices: [],
      });
    }
  }, [currentBranchId, getAuthHeaders]);

  const fetchSettings = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/clinic/settings/branch/${currentBranchId}`,
        { headers }
      );
      setSettings(response);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      // Use default settings if fetch fails
    }
  }, [currentBranchId, getAuthHeaders]);

  // Patient functions
  const addPatient = useCallback(
    async (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        // Add branchId to patient data
        const patientWithBranch = {
          ...patient,
          branchId: currentBranchId, // Make sure this is set
        };

        console.log("Sending patient data:", patientWithBranch);

        const response = await httpClient("/clinic/patients", {
          method: "POST",
          body: JSON.stringify(patientWithBranch),
          headers,
        });
        setPatients((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add patient");
        console.error("Error adding patient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBranchId]
  );

  const updatePatient = useCallback(
    async (id: string, updates: Partial<Patient>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/patients/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setPatients((prev) =>
          prev.map((patient) =>
            patient.id === id ? { ...patient, ...response } : patient
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update patient");
        console.error("Error updating patient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deletePatient = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/patients/${id}`, {
          method: "DELETE",
          headers,
        });
        setPatients((prev) => prev.filter((patient) => patient.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete patient");
        console.error("Error deleting patient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const searchPatients = useCallback(
    async (query: string): Promise<Patient[]> => {
      if (!query.trim()) return patients;

      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/clinic/patients/branch/${currentBranchId}?search=${encodeURIComponent(query)}`,
          { headers }
        );
        return response.patients || [];
      } catch (err: any) {
        console.error("Error searching patients:", err);
        return [];
      }
    },
    [currentBranchId, patients, getAuthHeaders]
  );

  // Service functions
  const addService = useCallback(
    async (service: Omit<Service, "id" | "createdAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        const serviceWithBranch = {
          ...service,
          branchId: currentBranchId,
        };

        const response = await httpClient("/clinic/services", {
          method: "POST",
          body: JSON.stringify(serviceWithBranch),
          headers,
        });

        // Refresh the services list
        console.log("🔄 FRONTEND - Refreshing services list...");
        await fetchServices();

        setServices((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        console.error("❌ FRONTEND - Error adding service:", err);
        setError(err.message || "Failed to add service");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBranchId, fetchServices]
  );

  const getService = useCallback(
    async (id: string): Promise<Service> => {
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/services/${id}`, {
          headers,
        });
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to get service");
        console.error("Error getting service:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const updateService = useCallback(
    async (id: string, updates: Partial<Service>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/services/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setServices((prev) =>
          prev.map((service) =>
            service.id === id ? { ...service, ...response } : service
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update service");
        console.error("Error updating service:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteService = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/services/${id}`, {
          method: "DELETE",
          headers,
        });
        setServices((prev) => prev.filter((service) => service.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete service");
        console.error("Error deleting service:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Medicine functions
  const addMedicine = useCallback(
    async (medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        const medicineWithBranch = {
          ...medicine,
          branchId: currentBranchId,
        };

        const response = await httpClient("/clinic/medicines", {
          method: "POST",
          body: JSON.stringify(medicineWithBranch),
          headers,
        });
        setMedicines((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add medicine");
        console.error("Error adding medicine:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBranchId]
  );

  const updateMedicine = useCallback(
    async (id: string, updates: Partial<Medicine>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/medicines/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setMedicines((prev) =>
          prev.map((medicine) =>
            medicine.id === id ? { ...medicine, ...response } : medicine
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update medicine");
        console.error("Error updating medicine:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteMedicine = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/medicines/${id}`, {
          method: "DELETE",
          headers,
        });
        setMedicines((prev) => prev.filter((medicine) => medicine.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete medicine");
        console.error("Error deleting medicine:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const dispenseMedicine = useCallback(
    async (medicineId: string, quantity: number) => {
      try {
        const medicine = medicines.find((m) => m.id === medicineId);
        if (medicine) {
          const newQuantity = Math.max(0, medicine.quantity - quantity);
          await updateMedicine(medicineId, { quantity: newQuantity });
        }
      } catch (err: any) {
        setError(err.message || "Failed to dispense medicine");
        console.error("Error dispensing medicine:", err);
        throw err;
      }
    },
    [medicines, updateMedicine]
  );

  const getLowStockMedicines = useCallback((): Medicine[] => {
    return medicines.filter(
      (medicine) => medicine.quantity <= medicine.minStock
    );
  }, [medicines]);

  const getExpiredMedicines = useCallback((): Medicine[] => {
    const today = new Date();
    return medicines.filter(
      (medicine) => new Date(medicine.expiryDate) <= today
    );
  }, [medicines]);

  // Visit functions
  const addVisit = useCallback(
    async (
      visit: Omit<Visit, "id" | "createdAt" | "updatedAt" | "branchId">
    ) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        const visitWithBranch = {
          ...visit,
          branchId: currentBranchId,
        };

        const response = await httpClient("/clinic/visits", {
          method: "POST",
          body: JSON.stringify(visitWithBranch),
          headers,
        });
        setVisits((prev) => [...prev, response]);
        await Promise.all([fetchMedicines(), fetchStats()]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add visit");
        console.error("Error adding visit:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentBranchId, fetchMedicines, fetchStats]
  );

  const getVisit = useCallback(
    async (id: string): Promise<Visit> => {
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/visits/${id}`, { headers });
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to get visit");
        console.error("Error getting visit:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );
  const updateVisit = useCallback(
    async (id: string, updates: Partial<Visit>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/visits/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setVisits((prev) =>
          prev.map((visit) =>
            visit.id === id ? { ...visit, ...response } : visit
          )
        );

        // Refresh stats if status changed
        if (updates.status) {
          await fetchStats();
        }

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update visit");
        console.error("Error updating visit:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchStats]
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/visits/${id}`, {
          method: "DELETE",
          headers,
        });
        setVisits((prev) => prev.filter((visit) => visit.id !== id));
        await fetchStats(); // Refresh stats after deletion
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete visit");
        console.error("Error deleting visit:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, fetchStats]
  );

  const getPatientVisits = useCallback(
    async (patientId: string): Promise<Visit[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/clinic/visits/branch/${currentBranchId}?patientId=${patientId}`,
          { headers }
        );
        return response.visits || [];
      } catch (err: any) {
        console.error("Error getting patient visits:", err);
        return [];
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // Staff functions
  const addStaffMember = useCallback(
    async (staffMember: Omit<StaffMember, "id" | "createdAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/clinic/staff", {
          method: "POST",
          body: JSON.stringify(staffMember),
          headers,
        });
        setStaff((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add staff member");
        console.error("Error adding staff member:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateStaffMember = useCallback(
    async (id: string, updates: Partial<StaffMember>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/staff/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setStaff((prev) =>
          prev.map((member) =>
            member.id === id ? { ...member, ...response } : member
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update staff member");
        console.error("Error updating staff member:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Settings functions
  const updateSettings = useCallback(
    async (newSettings: Partial<ClinicSettings>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/clinic/settings/branch/${currentBranchId}`,
          {
            method: "PUT",
            body: JSON.stringify(newSettings),
            headers,
          }
        );
        setSettings(response);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update settings");
        console.error("Error updating settings:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // Stats functions
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Reports function
  const generateReport = useCallback(
    async (
      type: Report["type"],
      period: Report["period"],
      startDate?: Date,
      endDate?: Date
    ): Promise<Report> => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();

        const queryParams = new URLSearchParams();
        queryParams.append("type", type);
        queryParams.append("period", period);
        if (startDate) queryParams.append("startDate", startDate.toISOString());
        if (endDate) queryParams.append("endDate", endDate.toISOString());

        const response = await httpClient(
          `/clinic/reports/branch/${currentBranchId}?${queryParams.toString()}`,
          { headers }
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to generate report");
        console.error("Error generating report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // Laboratory functions
  const addLabTest = useCallback(
    async (test: Omit<LabTest, "id" | "createdAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/clinic/lab/tests", {
          method: "POST",
          body: JSON.stringify(test),
          headers,
        });
        setLabTests((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add lab test");
        console.error("Error adding lab test:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateLabTest = useCallback(
    async (id: string, updates: Partial<LabTest>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/lab/tests/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setLabTests((prev) =>
          prev.map((test) => (test.id === id ? { ...test, ...response } : test))
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update lab test");
        console.error("Error updating lab test:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteLabTest = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/lab/tests/${id}`, {
          method: "DELETE",
          headers,
        });
        setLabTests((prev) => prev.filter((test) => test.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete lab test");
        console.error("Error deleting lab test:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const addLabOrder = useCallback(
    async (order: Omit<LabTestOrder, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/clinic/lab/orders", {
          method: "POST",
          body: JSON.stringify(order),
          headers,
        });
        setLabOrders((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add lab order");
        console.error("Error adding lab order:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateLabOrder = useCallback(
    async (id: string, updates: Partial<LabTestOrder>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/lab/orders/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setLabOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, ...response } : order
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update lab order");
        console.error("Error updating lab order:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const addLabResult = useCallback(
    async (orderId: string, result: Omit<LabResult, "id" | "completedAt">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/clinic/lab/orders/${orderId}/results`,
          {
            method: "POST",
            body: JSON.stringify(result),
            headers,
          }
        );

        // Update the order in state
        setLabOrders((prev) =>
          prev.map((order) => (order.id === orderId ? response : order))
        );

        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add lab result");
        console.error("Error adding lab result:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getPendingLabOrders = useCallback((): LabTestOrder[] => {
    return labOrders.filter(
      (order) => order.status === "pending" || order.status === "in-progress"
    );
  }, [labOrders]);

  const getCompletedLabOrders = useCallback(
    (startDate?: Date, endDate?: Date): LabTestOrder[] => {
      let filtered = labOrders.filter((order) => order.status === "completed");

      if (startDate && endDate) {
        filtered = filtered.filter(
          (order) =>
            order.completedDate &&
            new Date(order.completedDate) >= startDate &&
            new Date(order.completedDate) <= endDate
        );
      }

      return filtered;
    },
    [labOrders]
  );

  // Laboratory Equipment functions
  const addLabEquipment = useCallback(
    async (equipment: Omit<LabEquipment, "id">) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient("/clinic/lab/equipment", {
          method: "POST",
          body: JSON.stringify(equipment),
          headers,
        });
        setLabEquipment((prev) => [...prev, response]);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to add lab equipment");
        console.error("Error adding lab equipment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateLabEquipment = useCallback(
    async (id: string, updates: Partial<LabEquipment>) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(`/clinic/lab/equipment/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
          headers,
        });
        setLabEquipment((prev) =>
          prev.map((equipment) =>
            equipment.id === id ? { ...equipment, ...response } : equipment
          )
        );
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to update lab equipment");
        console.error("Error updating lab equipment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const deleteLabEquipment = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(`/clinic/lab/equipment/${id}`, {
          method: "DELETE",
          headers,
        });
        setLabEquipment((prev) =>
          prev.filter((equipment) => equipment.id !== id)
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete lab equipment");
        console.error("Error deleting lab equipment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const value: ClinicContextType = {
    // State
    patients,
    services,
    medicines,
    visits,
    staff,
    roles,
    settings,
    stats,
    labTests,
    labOrders,
    labEquipment,
    loading,
    error,

    // Patients
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,

    // Services
    addService,
    updateService,
    deleteService,
    getService,

    // Medicines
    addMedicine,
    updateMedicine,
    deleteMedicine,
    dispenseMedicine,
    getLowStockMedicines,
    getExpiredMedicines,

    // Visits
    addVisit,
    getVisit,
    updateVisit,
    deleteVisit,
    getPatientVisits,

    // Staff
    addStaffMember,
    updateStaffMember,

    // Settings
    updateSettings,

    // Stats
    refreshStats,

    // Reports
    generateReport,

    // Laboratory
    addLabTest,
    updateLabTest,
    deleteLabTest,
    addLabOrder,
    updateLabOrder,
    addLabResult,
    getPendingLabOrders,
    getCompletedLabOrders,

    // Laboratory Equipment
    addLabEquipment,
    updateLabEquipment,
    deleteLabEquipment,

    // Utility
    reloadData: loadInitialData,
  };

  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
}
