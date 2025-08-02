/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Mail, Printer, Share, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  transactionId: string
  timestamp: string
  amount: number
  customerName?: string
  customerPhone?: string
  paymentMethod: "cash" | "mtn_momo" | "airtel_money"
  items?: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  isCustomAmount?: boolean
  customItemName?: string
}

interface BusinessData {
  name: string
  address: string
  phone: string
  logo?: string
}

// Mock data
const mockBusinessData: BusinessData = {
  name: "SimuPOS Demo Store",
  address: "Kampala, Uganda",
  phone: "+256 700 123 456",
}

const mockTransaction: Transaction = {
  id: "1",
  transactionId: "TXN001",
  timestamp: new Date().toISOString(),
  amount: 25000,
  customerName: "John Doe",
  customerPhone: "+256701234567",
  paymentMethod: "cash",
  items: [
    { id: "1", name: "Rice 5kg", quantity: 2, price: 12500 },
    { id: "2", name: "Cooking Oil 2L", quantity: 1, price: 15000 },
  ],
}

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [businessData] = useState<BusinessData>(mockBusinessData)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTransaction(mockTransaction)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load receipt details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTransaction()
    }
  }, [params.id, toast])

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getPaymentMethodName = (paymentType: string) => {
    switch (paymentType) {
      case "cash":
        return "Cash Payment"
      case "mtn_momo":
        return "MTN Mobile Money"
      case "airtel_money":
        return "Airtel Money"
      default:
        return "Unknown Payment Method"
    }
  }

  const calculateSubtotal = () => {
    if (!transaction) return 0
    if (transaction.isCustomAmount) {
      return transaction.amount
    }
    if (transaction.items && transaction.items.length > 0) {
      return transaction.items.reduce((total, item) => total + item.price * item.quantity, 0)
    }
    return transaction.amount
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    return Math.round(subtotal * 0.18) // 18% VAT
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Success",
        description: "Receipt downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleShare = async () => {
    if (!transaction) return

    const receiptText = generateReceiptText()
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Receipt",
          text: receiptText,
        })
      } else {
        await navigator.clipboard.writeText(receiptText)
        toast({
          title: "Copied",
          description: "Receipt text copied to clipboard",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share receipt",
        variant: "destructive",
      })
    }
  }

  const handleEmail = () => {
    toast({
      title: "Email Receipt",
      description: "Email functionality will be implemented soon",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const generateReceiptText = () => {
    if (!transaction) return ""

    let receiptText = `🧾 RECEIPT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${businessData.name}\n${businessData.address}\n📞 ${businessData.phone}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nReceipt #: ${transaction.transactionId}\nDate: ${formatDate(transaction.timestamp)}\nCustomer: ${transaction.customerName || "Walk-in Customer"}\n${transaction.customerPhone ? `Phone: ${transaction.customerPhone}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nITEMS:\n`

    if (transaction.isCustomAmount) {
      receiptText += `${transaction.customItemName || "Custom Sale"}: ${formatCurrency(transaction.amount)}\n`
    } else if (transaction.items && transaction.items.length > 0) {
      transaction.items.forEach((item) => {
        const itemTotal = item.price * item.quantity
        receiptText += `${item.quantity}x ${item.name}\n   ${formatCurrency(item.price)} each = ${formatCurrency(itemTotal)}\n`
      })
    } else {
      receiptText += `Sale Amount: ${formatCurrency(transaction.amount)}\n`
    }

    receiptText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTAL: ${formatCurrency(transaction.amount)}\nPayment: ${getPaymentMethodName(transaction.paymentMethod)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThank you for your business!\nPowered by SimuPOS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

    return receiptText
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Generating receipt...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load receipt</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 print:hidden">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-teal-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Receipt</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Receipt */}
        <Card className="mb-6 print:shadow-none print:border-none">
          <CardContent className="p-8">
            {/* Business Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">SP</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{businessData.name}</h2>
              <p className="text-gray-600">{businessData.address}</p>
              <p className="text-gray-600">{businessData.phone}</p>
            </div>

            <div className="border-t border-gray-200 my-6" />

            {/* Transaction Info */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-semibold">{transaction.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{formatDate(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{transaction.customerName || "Walk-in Customer"}</span>
              </div>
              {transaction.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{transaction.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold">{getPaymentMethodName(transaction.paymentMethod)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6" />

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center mb-4">ITEMS</h3>
              {transaction.isCustomAmount ? (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-semibold">{transaction.customItemName || "Custom Sale"}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
              ) : transaction.items && transaction.items.length > 0 ? (
                transaction.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-semibold">Sale Amount</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-6" />

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (18%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span className="text-teal-600">{formatCurrency(transaction.amount)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6" />

            {/* Footer */}
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Thank you for your support!</p>
              <p className="text-sm text-gray-500 italic">Powered by SimuPOS</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4 print:hidden">
          <Button variant="outline" onClick={handleShare} className="bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-transparent">
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 print:hidden">
          <Button variant="outline" onClick={handleEmail} className="bg-transparent">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={handlePrint} className="bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <Button onClick={() => router.back()} className="w-full bg-teal-600 hover:bg-teal-700 print:hidden">
          Done
        </Button>
      </div>
    </div>
  )
}
