"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type {
  Supplier,
  SupplierOrder,
  SupplierPayment,
  SupplierStats,
  CreateSupplierData,
  RecordPaymentData,
} from "@/src/types/supplier";

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (data: CreateSupplierData) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Promise<Supplier | null>;
  getSupplierOrders: (supplierId: string) => Promise<SupplierOrder[]>;
  getSupplierPayments: (supplierId: string) => Promise<SupplierPayment[]>;
  recordPayment: (supplierId: string, data: RecordPaymentData) => Promise<void>;
  getSupplierStats: () => SupplierStats;
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Tech Solutions Ltd",
    contactPerson: "John Doe",
    email: "john@techsolutions.com",
    phone: "+256701234567",
    address: "123 Tech Street, Kampala",
    city: "Kampala",
    country: "Uganda",
    category: "electronics",
    taxId: "UG123456789",
    paymentTerms: 30,
    creditLimit: 5000000,
    outstandingBalance: 1500000,
    status: "active",
    bankName: "Stanbic Bank",
    accountNumber: "9040012345678",
    notes: "Reliable supplier for electronics and accessories",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
    lastOrderDate: "2024-01-18T14:20:00Z",
  },
  {
    id: "2",
    name: "Fashion Hub Uganda",
    contactPerson: "Sarah Nakato",
    email: "sarah@fashionhub.ug",
    phone: "+256702345678",
    address: "456 Fashion Avenue, Entebbe",
    city: "Entebbe",
    country: "Uganda",
    category: "clothing",
    taxId: "UG987654321",
    paymentTerms: 15,
    creditLimit: 3000000,
    outstandingBalance: 800000,
    status: "active",
    bankName: "Centenary Bank",
    accountNumber: "3210012345678",
    notes: "Quality clothing supplier with fast delivery",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
    lastOrderDate: "2024-01-20T11:30:00Z",
  },
  {
    id: "3",
    name: "Fresh Foods Distributors",
    contactPerson: "Peter Mukasa",
    email: "peter@freshfoods.ug",
    phone: "+256703456789",
    address: "789 Market Street, Jinja",
    city: "Jinja",
    country: "Uganda",
    category: "food",
    paymentTerms: 7,
    creditLimit: 2000000,
    outstandingBalance: 0,
    status: "active",
    bankName: "DFCU Bank",
    accountNumber: "1230012345678",
    notes: "Fresh produce and beverages supplier",
    createdAt: "2024-01-05T07:30:00Z",
    updatedAt: "2024-01-25T13:20:00Z",
    lastOrderDate: "2024-01-24T09:15:00Z",
  },
  {
    id: "4",
    name: "Office Supplies Co.",
    contactPerson: "Mary Achieng",
    email: "mary@officesupplies.com",
    phone: "+256704567890",
    address: "321 Business Park, Mbarara",
    city: "Mbarara",
    country: "Uganda",
    category: "office",
    paymentTerms: 45,
    creditLimit: 1500000,
    outstandingBalance: 500000,
    status: "inactive",
    notes: "Office equipment and stationery supplier",
    createdAt: "2024-01-12T10:45:00Z",
    updatedAt: "2024-01-23T14:10:00Z",
    lastOrderDate: "2024-01-15T16:30:00Z",
  },
];

const mockOrders: SupplierOrder[] = [
  {
    id: "1",
    supplierId: "1",
    orderNumber: "PO-2024-001",
    date: "2024-01-18T14:20:00Z",
    amount: 2500000,
    status: "completed",
    items: [
      {
        id: "1",
        productId: "p1",
        productName: "Laptop Dell Inspiron",
        quantity: 5,
        unitPrice: 400000,
        totalPrice: 2000000,
      },
      {
        id: "2",
        productId: "p2",
        productName: "Wireless Mouse",
        quantity: 10,
        unitPrice: 50000,
        totalPrice: 500000,
      },
    ],
    notes: "Urgent order for new office setup",
  },
  {
    id: "2",
    supplierId: "2",
    orderNumber: "PO-2024-002",
    date: "2024-01-20T11:30:00Z",
    amount: 1200000,
    status: "completed",
    items: [
      {
        id: "3",
        productId: "p3",
        productName: "Business Shirts",
        quantity: 20,
        unitPrice: 45000,
        totalPrice: 900000,
      },
      {
        id: "4",
        productId: "p4",
        productName: "Formal Trousers",
        quantity: 15,
        unitPrice: 20000,
        totalPrice: 300000,
      },
    ],
  },
];

const mockPayments: SupplierPayment[] = [
  {
    id: "1",
    supplierId: "1",
    amount: 1000000,
    paymentMethod: "bank_transfer",
    reference: "TXN-2024-001",
    date: "2024-01-19T10:00:00Z",
    status: "completed",
    notes: "Partial payment for PO-2024-001",
    createdAt: "2024-01-19T10:00:00Z",
  },
  {
    id: "2",
    supplierId: "2",
    amount: 400000,
    paymentMethod: "mobile_money",
    reference: "MM-2024-002",
    date: "2024-01-21T15:30:00Z",
    status: "completed",
    notes: "Payment for clothing order",
    createdAt: "2024-01-21T15:30:00Z",
  },
  {
    id: "3",
    supplierId: "3",
    amount: 750000,
    paymentMethod: "cash",
    reference: "CASH-2024-003",
    date: "2024-01-25T09:00:00Z",
    status: "completed",
    createdAt: "2024-01-25T09:00:00Z",
  },
];

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  const addSupplier = async (data: CreateSupplierData): Promise<void> => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      ...data,
      outstandingBalance: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOrderDate: new Date().toISOString(),
    };

    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = async (
    id: string,
    data: Partial<Supplier>
  ): Promise<void> => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === id
          ? { ...supplier, ...data, updatedAt: new Date().toISOString() }
          : supplier
      )
    );
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
  };

  const getSupplierById = async (id: string): Promise<Supplier | null> => {
    return suppliers.find((supplier) => supplier.id === id) || null;
  };

  const getSupplierOrders = async (
    supplierId: string
  ): Promise<SupplierOrder[]> => {
    return mockOrders.filter((order) => order.supplierId === supplierId);
  };

  const getSupplierPayments = async (
    supplierId: string
  ): Promise<SupplierPayment[]> => {
    return mockPayments.filter((payment) => payment.supplierId === supplierId);
  };

  const recordPayment = async (
    supplierId: string,
    data: RecordPaymentData
  ): Promise<void> => {
    const newPayment: SupplierPayment = {
      id: Date.now().toString(),
      supplierId,
      ...data,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    // Update supplier's outstanding balance
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === supplierId
          ? {
              ...supplier,
              outstandingBalance: Math.max(
                0,
                (supplier.outstandingBalance || 0) - data.amount
              ),
              updatedAt: new Date().toISOString(),
            }
          : supplier
      )
    );

    // In a real app, you would also save the payment record
    mockPayments.push(newPayment);
  };

  const getSupplierStats = (): SupplierStats => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(
      (s) => s.status === "active"
    ).length;
    const totalOutstanding = suppliers.reduce(
      (sum, s) => sum + (s.outstandingBalance || 0),
      0
    );
    const avgPaymentDays =
      suppliers.reduce((sum, s) => sum + s.paymentTerms, 0) / totalSuppliers ||
      0;

    return {
      totalSuppliers,
      activeSuppliers,
      totalOutstanding,
      avgPaymentDays: Math.round(avgPaymentDays),
    };
  };

  const value: SupplierContextType = {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getSupplierOrders,
    getSupplierPayments,
    recordPayment,
    getSupplierStats,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error("useSupplier must be used within a SupplierProvider");
  }
  return context;
}
