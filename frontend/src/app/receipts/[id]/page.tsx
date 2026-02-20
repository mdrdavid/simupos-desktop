/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Mail, Printer, Share, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useBusiness } from "@/context/BusinessContext"
import jsPDF from "jspdf"

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
  const { currentBusiness } = useBusiness()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
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
    if (!transaction) return;
    
    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF();
      
      // Add logo if available
      if (currentBusiness?.logo) {
        try {
          doc.addImage(currentBusiness.logo, 'PNG', 20, 20, 30, 20);
        } catch (error) {
          // Logo failed to load, continue without it
        }
      }
      
      // Business Details
      const businessY = currentBusiness?.logo ? 50 : 30;
      doc.setFontSize(16);
      doc.text(currentBusiness?.name || "Business Name", 20, businessY);
      doc.setFontSize(10);
      if (currentBusiness?.address) {
        doc.text(currentBusiness.address, 20, businessY + 8);
      }
      if (currentBusiness?.phone) {
        doc.text(`Tel: ${currentBusiness.phone}`, 20, businessY + 16);
      }
      
      // Receipt Title
      doc.setFontSize(14);
      doc.text("RECEIPT", 20, businessY + 30);
      
      // Receipt Details
      doc.setFontSize(10);
      const detailsY = businessY + 40;
      doc.text(`Receipt #: ${transaction.transactionId}`, 20, detailsY);
      doc.text(`Date: ${formatDate(transaction.timestamp)}`, 20, detailsY + 8);
      doc.text(`Customer: ${transaction.customerName || "Walk-in Customer"}`, 20, detailsY + 16);
      if (transaction.customerPhone) {
        doc.text(`Phone: ${transaction.customerPhone}`, 20, detailsY + 24);
      }
      doc.text(`Payment: ${getPaymentMethodName(transaction.paymentMethod)}`, 20, detailsY + 32);
      
      // Items
      const itemsY = detailsY + 45;
      doc.setFontSize(12);
      doc.text("ITEMS", 20, itemsY);
      doc.setFontSize(10);
      
      let currentY = itemsY + 10;
      
      if (transaction.isCustomAmount) {
        doc.text(transaction.customItemName || "Custom Sale", 20, currentY);
        doc.text(formatCurrency(transaction.amount), 150, currentY);
        currentY += 8;
      } else if (transaction.items && transaction.items.length > 0) {
        transaction.items.forEach((item) => {
          doc.text(item.name, 20, currentY);
          doc.text(`${item.quantity} x ${formatCurrency(item.price)}`, 20, currentY + 6);
          doc.text(formatCurrency(item.price * item.quantity), 150, currentY);
          currentY += 12;
        });
      } else {
        doc.text("Sale Amount", 20, currentY);
        doc.text(formatCurrency(transaction.amount), 150, currentY);
        currentY += 8;
      }
      
      // Totals
      currentY += 10;
      doc.text("Subtotal:", 20, currentY);
      doc.text(formatCurrency(calculateSubtotal()), 150, currentY);
      currentY += 8;
      
      doc.text("VAT (18%):", 20, currentY);
      doc.text(formatCurrency(calculateTax()), 150, currentY);
      currentY += 8;
      
      doc.setFont("bold");
      doc.text("TOTAL:", 20, currentY);
      doc.text(formatCurrency(transaction.amount), 150, currentY);
      doc.setFont("normal");
      
      // Footer
      currentY += 20;
      doc.setFontSize(10);
      doc.text("Thank you for your business!", 20, currentY);
      doc.text("Powered by SimuPOS", 20, currentY + 8);
      
      // Save the PDF
      const filename = `receipt-${transaction.transactionId}.pdf`;
      doc.save(filename);
      
      toast({
        title: "Success",
        description: "Receipt downloaded successfully!",
      })
    } catch (error) {
      console.error("PDF generation error:", error);
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

    let receiptText = `🧾 RECEIPT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${currentBusiness?.name || "Business Name"}\n${currentBusiness?.address || ""}\n📞 ${currentBusiness?.phone || ""}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nReceipt #: ${transaction.transactionId}\nDate: ${formatDate(transaction.timestamp)}\nCustomer: ${transaction.customerName || "Walk-in Customer"}\n${transaction.customerPhone ? `Phone: ${transaction.customerPhone}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nITEMS:\n`

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
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          body {
            background: white !important;
          }
          .receipt-logo {
            max-width: 80px !important;
            max-height: 80px !important;
            object-fit: contain !important;
          }
        }
      `}</style>
      
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
              {currentBusiness?.logo ? (
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <img 
                    src={currentBusiness.logo} 
                    alt="Business Logo" 
                    className="max-w-full max-h-full object-contain rounded-lg receipt-logo"
                    onError={(e) => {
                      // Fallback to default icon if logo fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center hidden">
                    <span className="text-2xl font-bold text-teal-600">SP</span>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-600">SP</span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentBusiness?.name || "Business Name"}</h2>
              <p className="text-gray-600">{currentBusiness?.address || ""}</p>
              <p className="text-gray-600">{currentBusiness?.phone || ""}</p>
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
