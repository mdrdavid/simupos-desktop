/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CreditCard, Printer, Trash2, Receipt } from "lucide-react"
import Link from "next/link"
import { useWelding } from "@/context/WeldingContext"
import { useWeldingFinancials } from "@/context/WeldingFinancialContext"
import { InvoicePaymentStatus } from "@/src/types/welding"

export default function WeldingInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const { getWeldingJobById } = useWelding()
  const { getInvoiceById, recordPaymentForInvoice, deleteInvoice } = useWeldingFinancials()

  const [invoice, setInvoice] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const invoiceData = getInvoiceById(invoiceId)
    if (invoiceData) {
      setInvoice(invoiceData)

      const jobData = getWeldingJobById(invoiceData.weldingJobId)
      if (jobData) {
        setJob(jobData)
      }
    }
  }, [invoiceId, getInvoiceById, getWeldingJobById])

  const handleRecordPayment = async () => {
    if (!invoice) return

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount")
      return
    }

    const balanceDue = calculateBalanceDue()
    if (amount > balanceDue) {
      alert("Payment amount cannot exceed the balance due")
      return
    }

    setIsSubmittingPayment(true)
    try {
      const payment = {
        amount,
        method: paymentMethod,
        reference: paymentReference,
        date: new Date().toISOString(),
      }

      const newPayment = await recordPaymentForInvoice(invoiceId, payment)
      if (newPayment) {
        setIsPaymentDialogOpen(false)
        // Reset form
        setPaymentAmount("")
        setPaymentMethod("Cash")
        setPaymentReference("")
        // Refresh invoice data
        const updatedInvoice = getInvoiceById(invoiceId)
        if (updatedInvoice) setInvoice(updatedInvoice)
        // Navigate to receipt
        router.push(`/welding/receipts/${invoiceId}?paymentId=${newPayment.id}`)
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
      alert("Failed to record payment")
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInvoice(invoiceId)
      router.push(`/welding/jobs/${job.id}`)
    } catch (error) {
      console.error("Failed to delete invoice:", error)
      alert("Failed to delete invoice")
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: InvoicePaymentStatus) => {
    switch (status) {
      case InvoicePaymentStatus.PAID:
        return "bg-green-500"
      case InvoicePaymentStatus.PARTIALLY_PAID:
        return "bg-yellow-500"
      case InvoicePaymentStatus.UNPAID:
        return "bg-red-500"
      case InvoicePaymentStatus.OVERDUE:
        return "bg-red-700"
      default:
        return "bg-gray-500"
    }
  }

  const calculateTotals = () => {
    if (!invoice?.lineItems) return { subTotal: 0, taxAmount: 0, totalAmount: 0 }

    const subTotal = invoice.lineItems.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = invoice.includeTax ? subTotal * 0.18 : 0
    const totalAmount = subTotal + taxAmount

    return { subTotal, taxAmount, totalAmount }
  }

  const calculateBalanceDue = () => {
    const { totalAmount } = calculateTotals()
    const amountPaid = invoice?.amountPaid || 0
    return totalAmount - amountPaid
  }

  if (!invoice || !job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { subTotal, taxAmount, totalAmount } = calculateTotals()
  const balanceDue = calculateBalanceDue()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/welding/jobs/${job.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">
              Job: {job.jobType} - {job.description.substring(0, 50)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(invoice.paymentStatus)}>{invoice.paymentStatus.replace("_", " ")}</Badge>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {invoice.paymentStatus !== InvoicePaymentStatus.PAID && (
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      max={balanceDue}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Balance Due: UGX {balanceDue.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Input
                      id="reference"
                      placeholder="Transaction ID, Check number, etc."
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRecordPayment} disabled={isSubmittingPayment}>
                      {isSubmittingPayment ? "Recording..." : "Record Payment"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this invoice? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={printRef} className="print:shadow-none">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">SimuPOS Welding Services</CardTitle>
                <p className="text-muted-foreground">Professional Welding Solutions</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
                {invoice.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Details */}
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm">
                <p className="font-medium">{invoice.customerDetails.name}</p>
                <p className="text-muted-foreground">{invoice.customerDetails.contact}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="font-semibold mb-4">Services & Materials</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Description</th>
                      <th className="text-center p-3">Qty</th>
                      <th className="text-right p-3">Unit Price</th>
                      <th className="text-right p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="text-center p-3">{item.quantity}</td>
                        <td className="text-right p-3">UGX {item.unitPrice.toLocaleString()}</td>
                        <td className="text-right p-3 font-medium">
                          UGX {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {subTotal.toLocaleString()}</span>
                </div>
                {invoice.includeTax && (
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span>UGX {taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>UGX {(invoice.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div
                  className={`flex justify-between font-semibold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  <span>Balance Due:</span>
                  <span>UGX {balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {invoice.paymentsMade && invoice.paymentsMade.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.paymentsMade.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">UGX {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      {payment.reference && ` • Ref: ${payment.reference}`}
                    </p>
                  </div>
                  <Link href={`/professional-hub/receipts/${invoiceId}?paymentId=${payment.id}`}>
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
