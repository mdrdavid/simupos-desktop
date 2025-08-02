"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Invoice, InvoiceStats, CreateInvoiceData, UpdateInvoiceData } from "@/src/types/invoice"

interface InvoiceContextType {
  invoices: Invoice[]
  loading: boolean
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice>
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice>
  deleteInvoice: (id: string) => Promise<void>
  getInvoiceById: (id: string) => Promise<Invoice | null>
  updateInvoiceStatus: (id: string, status: string) => Promise<void>
  getInvoiceStats: () => InvoiceStats
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockInvoices: Invoice[] = [
        {
          id: "1",
          invoiceNumber: "INV-001",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+256 700 123456",
          customerAddress: "Kampala, Uganda",
          issueDate: "2024-01-15",
          dueDate: "2024-02-15",
          items: [
            {
              id: "1",
              description: "Web Development Services",
              quantity: 1,
              unitPrice: 500000,
              total: 500000,
            },
          ],
          subtotal: 500000,
          taxAmount: 90000,
          totalAmount: 590000,
          status: "sent",
          notes: "Payment due within 30 days",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          invoiceNumber: "INV-002",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+256 700 654321",
          customerAddress: "Entebbe, Uganda",
          issueDate: "2024-01-20",
          dueDate: "2024-02-20",
          items: [
            {
              id: "1",
              description: "Mobile App Development",
              quantity: 1,
              unitPrice: 800000,
              total: 800000,
            },
          ],
          subtotal: 800000,
          taxAmount: 144000,
          totalAmount: 944000,
          status: "paid",
          notes: "Thank you for your business",
          createdAt: "2024-01-20T10:00:00Z",
          updatedAt: "2024-01-20T10:00:00Z",
        },
      ]

      setInvoices(mockInvoices)
      setLoading(false)
    }

    loadInvoices()
  }, [])

  const createInvoice = async (data: CreateInvoiceData): Promise<Invoice> => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setInvoices((prev) => [...prev, newInvoice])
    return newInvoice
  }

  const updateInvoice = async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
    const updatedInvoice = invoices.find((inv) => inv.id === id)
    if (!updatedInvoice) {
      throw new Error("Invoice not found")
    }

    const updated = {
      ...updatedInvoice,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)))
    return updated
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
  }

  const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    return invoices.find((inv) => inv.id === id) || null
  }

  const updateInvoiceStatus = async (id: string, status: string): Promise<void> => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: status as Invoice["status"], updatedAt: new Date().toISOString() } : inv,
      ),
    )
  }

  const getInvoiceStats = (): InvoiceStats => {
    const total = invoices.length
    const paid = invoices.filter((inv) => inv.status === "paid").length
    const pending = invoices.filter((inv) => inv.status === "sent").length
    const overdue = invoices.filter((inv) => inv.status === "overdue").length
    const totalRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.totalAmount, 0)
    const outstanding = invoices
      .filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    return {
      total,
      paid,
      pending,
      overdue,
      totalRevenue,
      outstanding,
    }
  }

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        updateInvoiceStatus,
        getInvoiceStats,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoiceContext() {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error("useInvoiceContext must be used within an InvoiceProvider")
  }
  return context
}
