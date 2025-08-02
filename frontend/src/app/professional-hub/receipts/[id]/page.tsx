/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Link from "next/link"
import { useWelding } from "@/context/WeldingContext"
import { useWeldingFinancials } from "@/context/WeldingFinancialContext"

export default function WeldingReceiptPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  const invoiceId = params.id as string
  const paymentId = searchParams.get("paymentId")

  const { getWeldingJobById } = useWelding()
  const { getInvoiceById } = useWeldingFinancials()

  const [invoice, setInvoice] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)

  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const invoiceData = getInvoiceById(invoiceId)
    if (invoiceData) {
      setInvoice(invoiceData)

      const jobData = getWeldingJobById(invoiceData.weldingJobId)
      if (jobData) {
        setJob(jobData)
      }

      if (paymentId) {
        const paymentData = invoiceData.paymentsMade?.find((p: any) => p.id === paymentId)
        if (paymentData) {
          setPayment(paymentData)
        }
      }
    }
  }, [invoiceId, paymentId, getInvoiceById, getWeldingJobById])

  const handlePrint = () => {
    window.print()
  }

  const calculateTotals = () => {
    if (!invoice?.lineItems) return { subTotal: 0, taxAmount: 0, totalAmount: 0 }

    const subTotal = invoice.lineItems.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = invoice.includeTax ? subTotal * 0.18 : 0
    const totalAmount = subTotal + taxAmount

    return { subTotal, taxAmount, totalAmount }
  }

  if (!invoice || !job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { subTotal, taxAmount, totalAmount } = calculateTotals()
  const paymentAmount = payment?.amount || 0
  const balanceDue = totalAmount - (invoice.amountPaid || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/professional-hub/invoices/${invoiceId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payment Receipt</h1>
            <p className="text-muted-foreground">
              Invoice #{invoice.invoiceNumber}
              {payment && ` • Receipt #${payment.id.substring(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div ref={printRef} className="print:shadow-none">
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl">SimuPOS Welding Services</CardTitle>
              <p className="text-muted-foreground">Professional Welding Solutions</p>
              <div className="border-t border-b py-2 my-4">
                <h2 className="text-xl font-semibold">PAYMENT RECEIPT</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Receipt Details</h3>
                <div className="text-sm space-y-1">
                  {payment && (
                    <>
                      <p>
                        <span className="font-medium">Receipt #:</span> {payment.id.substring(0, 8)}
                      </p>
                      <p>
                        <span className="font-medium">Payment Date:</span> {new Date(payment.date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Payment Method:</span> {payment.method}
                      </p>
                      {payment.reference && (
                        <p>
                          <span className="font-medium">Reference:</span> {payment.reference}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Invoice Details</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}
                  </p>
                  <p>
                    <span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                  {invoice.dueDate && (
                    <p>
                      <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="font-semibold mb-2">Customer Details</h3>
              <div className="text-sm">
                <p className="font-medium">{invoice.customerDetails.name}</p>
                <p className="text-muted-foreground">{invoice.customerDetails.contact}</p>
              </div>
            </div>

            {/* Service Summary */}
            <div>
              <h3 className="font-semibold mb-2">Service Summary</h3>
              <p className="text-sm text-muted-foreground">
                {job.jobType} - {job.description.substring(0, 100)}...
              </p>
            </div>

            {/* Payment Summary */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Invoice Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Amount Paid:</span>
                  <span>UGX {paymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Remaining Balance:</span>
                  <span className={`font-semibold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    UGX {balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items (Summary) */}
            <div>
              <h3 className="font-semibold mb-4">Items & Services</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
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
                        <td className="text-right p-3">UGX {(item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
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
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Thank you for your business!</p>
              <p>For any queries, please contact us with your receipt number.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
