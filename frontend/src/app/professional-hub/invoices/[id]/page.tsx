/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useBusiness } from "@/context/BusinessContext"
import { generateInvoicePDF } from "@/src/utils/exportUtils"
import { capitalizeWords } from "@/src/utils"

export default function WeldingInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const { getWeldingJobById } = useWelding()
  const { getInvoiceById, recordPaymentForInvoice, deleteInvoice } = useWeldingFinancials()
  const { currentBusiness } = useBusiness();

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
      if (invoiceData.weldingJobId) {
        const jobData = getWeldingJobById(invoiceData.weldingJobId)
        if (jobData) {
          setJob(jobData)
        }
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
        router.push(`/professional-hub/receipts/${invoiceId}?paymentId=${newPayment.id}`)
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
      router.push(`/professional-hub/jobs/${job.id}`)
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

  const handleDownload = () => {
    if (!invoice || !currentBusiness) return;
    generateInvoicePDF(invoice, currentBusiness);
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

  if (!invoice) {
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
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .printable {
            background: white !important;
          }
          .invoice-logo {
            max-width: 80px !important;
            max-height: 80px !important;
            object-fit: contain !important;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link href={job ? `/professional-hub/jobs/${job.id}` : "/professional-hub/invoices"}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
            <Badge className={`${getStatusColor(invoice.paymentStatus)}`}>
              {capitalizeWords(invoice.paymentStatus.replace("_", " "))}
            </Badge>
            </div>
            {job && (
              <p className="text-muted-foreground mt-1">
                Job: {job.jobType} - {job.description.substring(0, 50)}...
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Receipt className="h-4 w-4 mr-2" />
            Download PDF
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
      <div ref={printRef} className="print:shadow-none printable">
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-8 md:p-12 space-y-12">
            {/* Header section */}
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight">Invoice</h1>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Invoice number</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                  <span className="text-muted-foreground">Date of issue</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-muted-foreground">Date due</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {currentBusiness?.logo ? (
                  <img
                    src={currentBusiness.logo}
                    alt="Logo"
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="w-0 h-0 border-l-[15px] border-l-transparent border-b-[26px] border-b-black border-r-[15px] border-r-transparent" />
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-12 text-sm">
              <div className="space-y-2">
                <p className="font-bold">{currentBusiness?.name}</p>
                <div className="text-muted-foreground space-y-1">
                  <p className="whitespace-pre-line">{currentBusiness?.address}</p>
                  <p>{currentBusiness?.phone}</p>
                  <p>{currentBusiness?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-bold">Bill to</p>
                <div className="space-y-1">
                  <p>{invoice.customerDetails.name}</p>
                  <div className="text-muted-foreground">
                    <p>{invoice.customerDetails.contact}</p>
                    <p>{invoice.customerDetails.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary sentence */}
            <div className="text-2xl font-bold pt-4">
              UGX {totalAmount.toLocaleString()} due {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Table */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 pb-2 border-b border-black text-sm text-muted-foreground">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit price</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              <div className="space-y-4">
                {(invoice.lineItems || []).map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 text-sm py-1">
                    <div className="col-span-6 font-medium">{item.description}</div>
                    <div className="col-span-2 text-right text-muted-foreground">{item.quantity}</div>
                    <div className="col-span-2 text-right text-muted-foreground">UGX {item.unitPrice.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-medium">UGX {(item.quantity * item.unitPrice).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">UGX {subTotal.toLocaleString()}</span>
                </div>
                {invoice.includeTax && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (18%)</span>
                    <span className="text-foreground">UGX {taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground border-t pt-3">
                  <span>Total</span>
                  <span className="text-foreground">UGX {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Amount due</span>
                  <span>UGX {balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="pt-8 border-t text-sm">
                <p className="font-bold mb-2">Notes</p>
                <p className="text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {invoice.paymentsMade && invoice.paymentsMade.length > 0 && (
        <Card className="no-print">
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
