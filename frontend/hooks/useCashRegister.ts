"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface CashRegisterSession {
  id: string
  openingFloat: number
  totalCashSales: number
  cashIn: number
  cashOut: number
  expectedBalance: number
  openedAt: string
  status: "OPEN" | "CLOSED"
  closingBalance?: number
  discrepancy?: number
  notes?: string
}

interface CashRegisterLog {
  id: string
  type: "CASH_IN" | "CASH_OUT" | "SALE" | "OPENING_FLOAT" | "CLOSING_BALANCE"
  amount: number
  reason?: string
  createdAt: string
}

export function useCashRegister() {
  const [currentSession, setCurrentSession] = useState<CashRegisterSession | null>(null)
  const [logs, setLogs] = useState<CashRegisterLog[]>([])
  const [loading, setLoading] = useState(false)

  const loadCurrentSession = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cash-register/current")
      const data = await response.json()

      if (data.success && data.data) {
        setCurrentSession(data.data)
      } else {
        setCurrentSession(null)
      }
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "Failed to load current session",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const openRegister = useCallback(async (openingFloat: number, branchId: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/cash-register/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingFloat, branchId }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentSession(data.data)
        toast({
          title: "Register Opened",
          description: `Cash register opened with UGX ${openingFloat.toLocaleString()} float`,
        })
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open register",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const closeRegister = useCallback(
    async (closingBalance: number, notes?: string) => {
      if (!currentSession) throw new Error("No active session")

      try {
        setLoading(true)
        const response = await fetch("/api/cash-register/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSession.id,
            closingBalance,
            notes,
          }),
        })

        const data = await response.json()

        if (data.success) {
          const discrepancy = closingBalance - currentSession.expectedBalance
          setCurrentSession(null)
          toast({
            title: "Register Closed",
            description: `Register closed with ${
              discrepancy === 0
                ? "no discrepancy"
                : `UGX ${Math.abs(discrepancy).toLocaleString()} ${discrepancy > 0 ? "over" : "short"}`
            }`,
          })
          return data.data
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to close register",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [currentSession],
  )

  const addCash = useCallback(
    async (amount: number, reason: string) => {
      if (!currentSession) throw new Error("No active session")

      try {
        setLoading(true)
        const response = await fetch("/api/cash-register/cash-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSession.id,
            amount,
            reason,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentSession((prev) => ({
            ...prev!,
            cashIn: prev!.cashIn + amount,
            expectedBalance: prev!.expectedBalance + amount,
          }))
          toast({
            title: "Cash Added",
            description: `UGX ${amount.toLocaleString()} added to register`,
          })
          return data.data
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add cash",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [currentSession],
  )

  const removeCash = useCallback(
    async (amount: number, reason: string) => {
      if (!currentSession) throw new Error("No active session")

      if (amount > currentSession.expectedBalance) {
        throw new Error("Insufficient cash in register")
      }

      try {
        setLoading(true)
        const response = await fetch("/api/cash-register/cash-out", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSession.id,
            amount,
            reason,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentSession((prev) => ({
            ...prev!,
            cashOut: prev!.cashOut + amount,
            expectedBalance: prev!.expectedBalance - amount,
          }))
          toast({
            title: "Cash Removed",
            description: `UGX ${amount.toLocaleString()} removed from register`,
          })
          return data.data
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to remove cash",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [currentSession],
  )

  const recordSale = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (amount: number, transactionId: string) => {
      if (!currentSession) return

      try {
        // This would typically be called automatically when a cash sale is made
        setCurrentSession((prev) => ({
          ...prev!,
          totalCashSales: prev!.totalCashSales + amount,
          expectedBalance: prev!.expectedBalance + amount,
        }))
      } catch (error) {
        console.error("Error recording sale:", error)
      }
    },
    [currentSession],
  )

  const loadLogs = useCallback(async () => {
    if (!currentSession) return

    try {
      const response = await fetch(`/api/cash-register/sessions/${currentSession.id}/logs`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error("Error loading logs:", error)
    }
  }, [currentSession])

  useEffect(() => {
    loadCurrentSession()
  }, [loadCurrentSession])

  return {
    currentSession,
    logs,
    loading,
    openRegister,
    closeRegister,
    addCash,
    removeCash,
    recordSale,
    loadLogs,
    refreshSession: loadCurrentSession,
  }
}
