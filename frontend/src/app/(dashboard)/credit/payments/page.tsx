/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCredit } from "@/context/CreditContext"
import { CreditPayment } from "@/src/types/credit"
import { toast } from "@/hooks/use-toast"

export default function CreditPaymentsPage() {
  const router = useRouter()
  const { getAllCreditPayments, loading } = useCredit()
  const [payments, setPayments] = useState<CreditPayment[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const response = await getAllCreditPayments()
      setPayments(response.payments)
      setPagination(response.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load credit payments.",
        variant: "destructive",
      })
    }
  }, [getAllCreditPayments])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading credit payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Credit Payments</h1>
            <p className="text-muted-foreground">View all credit payments</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-muted-foreground mb-4">
              There are no credit payments to display.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{formatCurrency(payment.amountPaid)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.paymentMethod}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
