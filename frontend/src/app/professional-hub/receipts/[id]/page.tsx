/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
import { useBusiness } from "@/context/BusinessContext"
import { generateReceiptPDF } from "@/src/utils/exportUtils"

export default function WeldingReceiptPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  const invoiceId = params.id as string
  const paymentId = searchParams.get("paymentId")

  const { getWeldingJobById } = useWelding()
  const { getInvoiceById } = useWeldingFinancials()
  const { currentBusiness } = useBusiness()

  const [invoice, setInvoice] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)

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

  const handleDownloadPDF = () => {
    if (invoice && payment && currentBusiness) {
      generateReceiptPDF(invoice, payment, currentBusiness, job)
    }
  }

  const calculateTotals = () => {
    if (!invoice?.lineItems) return { subTotal: 0, taxAmount: 0, totalAmount: 0 }

    const subTotal = invoice.lineItems.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = invoice.includeTax ? subTotal * 0.18 : 0
    const totalAmount = subTotal + taxAmount

    return { subTotal, taxAmount, totalAmount }
  }

  if (!invoice || !payment) {
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
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .printable {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .receipt-container {
            box-shadow: none !important;
            border: none !important;
          }
          .receipt-logo-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-bottom: 1rem !important;
            height: 80px !important;
          }
          .receipt-logo {
            max-width: 80px !important;
            max-height: 80px !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
          }
          .receipt-header {
            text-align: center !important;
            margin-bottom: 1.5rem !important;
          }
        }
        
        @media screen {
          .receipt-logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 1rem;
            height: 80px;
          }
          .receipt-logo {
            max-width: 80px;
            max-height: 80px;
            width: auto;
            height: auto;
            object-fit: contain;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between no-print">
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
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div ref={printRef} className="print:shadow-none printable">
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-8 md:p-12 space-y-12">
            {/* Header section */}
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight">Receipt</h1>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Invoice number</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                  <span className="text-muted-foreground">Receipt number</span>
                  <span className="font-medium">{payment.id.substring(0, 8).toUpperCase()}</span>
                  <span className="text-muted-foreground">Date paid</span>
                  <span>{new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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

            {/* Summary sentence. */}
            <div className="text-2xl font-bold pt-4">
              UGX {payment.amount.toLocaleString()} paid on {new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
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
                    <div className="col-span-2 text-right text-muted-foreground">{item.unitPrice.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-medium">{(item.quantity * item.unitPrice).toLocaleString()}</div>
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
                  <span>Amount paid</span>
                  <span>UGX {payment.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment history section (mimic Vercel) */}
            <div className="pt-12 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Payment history</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-12 pb-2 border-b border-black text-sm text-muted-foreground">
                  <div className="col-span-3">Payment method</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-3 text-right">Amount paid</div>
                  <div className="col-span-3 text-right">Receipt number</div>
                </div>
                <div className="grid grid-cols-12 text-sm py-1">
                  <div className="col-span-3 font-medium">{payment.method} - {payment.reference || "No ref"}</div>
                  <div className="col-span-3 text-muted-foreground">{new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className="col-span-3 text-right text-muted-foreground">UGX {payment.amount.toLocaleString()}</div>
                  <div className="col-span-3 text-right font-medium">{payment.id.substring(0, 8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}