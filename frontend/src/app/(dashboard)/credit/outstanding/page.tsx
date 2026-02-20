/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, FileText } from "lucide-react"
import { useCredit } from "@/context/CreditContext"
import { CreditEntry } from "@/src/types/credit"
import { toast } from "@/hooks/use-toast"
import { capitalizeWords } from "@/src/utils"

export default function OutstandingCreditsPage() {
  const router = useRouter()
  const { getOutstandingCreditEntries, loading } = useCredit()
  const [outstandingEntries, setOutstandingEntries] = useState<CreditEntry[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const response = await getOutstandingCreditEntries()
      setOutstandingEntries(response.creditEntries)
      setPagination(response.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load outstanding credit entries.",
        variant: "destructive",
      })
    }
  }, [getOutstandingCreditEntries])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "unpaid":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

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
          <p>Loading outstanding credits...</p>
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
            <h1 className="text-2xl font-bold">Outstanding Credits</h1>
            <p className="text-muted-foreground">
              View all credits that are not fully paid
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Outstanding Credits List */}
      {outstandingEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No outstanding credits</h3>
            <p className="text-muted-foreground mb-4">
              All credit accounts are settled.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {outstandingEntries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/credit/${entry.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{capitalizeWords(entry.customerName)}</CardTitle>
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                {entry.customerPhone && (
                  <p className="text-sm text-muted-foreground">
                    {entry.customerPhone}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">
                      {formatCurrency(entry.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(entry.amountPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(entry.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{formatDate(entry.dueDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
