/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Phone, Calendar, Clock, CreditCard, RefreshCw, AlertCircle, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreditEntry {
  id: string
  customerName: string
  customerPhone?: string
  totalAmount: number
  amountPaid: number
  balance: number
  status: "paid" | "partially_paid" | "unpaid"
  dateTaken: string
  dueDate?: string
  items: OrderItem[]
  payments?: CreditPayment[]
}

interface OrderItem {
  itemId: string
  itemName: string
  quantity: number
  price: number
  total: number
}

interface CreditPayment {
  id: string
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  notes?: string
}

export default function CreditDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [creditEntry, setCreditEntry] = useState<CreditEntry | null>(null)
  const [payments, setPayments] = useState<CreditPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "",
    notes: "",
  })
  const [recordingPayment, setRecordingPayment] = useState(false)

  const mockPayments: CreditPayment[] = [
    {
      id: "1",
      amountPaid: 50000,
      paymentDate: "2024-01-20T14:30:00Z",
      paymentMethod: "cash",
      notes: "Partial payment",
    },
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!params.id) {
        setError("Invalid Credit ID")
        return
      }

      const mockCreditEntry: CreditEntry = {
        id: params.id as string,
        customerName: "John Doe",
        customerPhone: "+256712345678",
        totalAmount: 150000,
        amountPaid: 50000,
        balance: 100000,
        status: "partially_paid",
        dateTaken: "2024-01-15T10:00:00Z",
        dueDate: "2024-02-15T10:00:00Z",
        items: [
          { itemId: "1", itemName: "Rice 5kg", quantity: 2, price: 25000, total: 50000 },
          { itemId: "2", itemName: "Sugar 2kg", quantity: 4, price: 25000, total: 100000 },
        ],
      }

      setCreditEntry(mockCreditEntry)
      setPayments(mockPayments)
    } catch (e: any) {
      setError(e.message || "Failed to fetch credit details")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || !paymentForm.method) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      })
      return
    }

    if (creditEntry && amount > creditEntry.balance) {
      toast({
        title: "Amount Too High",
        description: "Payment amount cannot exceed the balance due.",
        variant: "destructive",
      })
      return
    }

    setRecordingPayment(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newPayment: CreditPayment = {
        id: `payment-${Date.now()}`,
        amountPaid: amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentForm.method,
        notes: paymentForm.notes,
      }

      setPayments((prev) => [newPayment, ...prev])

      if (creditEntry) {
        const newAmountPaid = creditEntry.amountPaid + amount
        const newBalance = creditEntry.totalAmount - newAmountPaid
        const newStatus = newBalance === 0 ? "paid" : "partially_paid"

        setCreditEntry({
          ...creditEntry,
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newStatus,
        })
      }

      setPaymentForm({ amount: "", method: "", notes: "" })
      setShowPaymentDialog(false)

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive",
      })
    } finally {
      setRecordingPayment(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString?: string, includeTime = false) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return includeTime ? date.toLocaleString() : date.toLocaleDateString()
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
          <p>Loading credit details...</p>
        </div>
      </div>
    )
  }

  if (error && !creditEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Credit</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!creditEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Credit Entry Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested credit entry could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{creditEntry.customerName}</h1>
            <p className="text-muted-foreground">Credit Account Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Badge className={getStatusColor(creditEntry.status)}>
            {creditEntry.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {creditEntry.customerPhone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{creditEntry.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Credit taken on {formatDate(creditEntry.dateTaken)}</span>
          </div>
          {creditEntry.dueDate && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due date: {formatDate(creditEntry.dueDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(creditEntry.totalAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(creditEntry.amountPaid)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(creditEntry.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Button */}
      {creditEntry.status !== "paid" && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (UGX) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  max={creditEntry.balance}
                />
                <p className="text-xs text-muted-foreground">Maximum: {formatCurrency(creditEntry.balance)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) => setPaymentForm((prev) => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this payment"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={recordingPayment}>
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment} disabled={recordingPayment}>
                  {recordingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Items on Credit */}
      <Card>
        <CardHeader>
          <CardTitle>Items on Credit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {creditEntry.items.map((item) => (
              <div key={item.itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-start p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amountPaid)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate, true)} • {payment.paymentMethod.replace("_", " ").toUpperCase()}
                    </p>
                    {payment.notes && <p className="text-xs text-muted-foreground italic mt-1">{payment.notes}</p>}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Paid
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
