"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Printer, Send, Download, Share } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptData {
  id: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  amountReceived?: number
  change?: number
  paymentMethod: string
  customerName?: string
  cashier: string
  timestamp: Date
  storeName: string
  storeAddress?: string
}

interface ReceiptPrinterProps {
  receipt: ReceiptData
  onPrint: () => void
  onSend: () => void
  onDownload: () => void
  onShare: () => void
}

export function ReceiptPrinter({ receipt, onPrint, onSend, onDownload, onShare }: ReceiptPrinterProps) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">{receipt.storeName}</CardTitle>
        {receipt.storeAddress && <p className="text-sm text-gray-500">{receipt.storeAddress}</p>}
        <p className="text-xs text-gray-500">{receipt.timestamp.toLocaleString()}</p>
        <p className="text-xs text-gray-500">Receipt: {receipt.id}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-2">
          {receipt.items.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm">UGX {formatNumber(item.total)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                {item.quantity} x UGX {formatNumber(item.price)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>UGX {formatNumber(receipt.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (18%):</span>
            <span>UGX {formatNumber(receipt.tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>UGX {formatNumber(receipt.total)}</span>
          </div>

          {receipt.amountReceived && (
            <>
              <div className="flex justify-between text-sm">
                <span>Amount Received:</span>
                <span>UGX {formatNumber(receipt.amountReceived)}</span>
              </div>
              {receipt.change && receipt.change > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Change:</span>
                  <span>UGX {formatNumber(receipt.change)}</span>
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Payment Method: {receipt.paymentMethod}</p>
          {receipt.customerName && <p>Customer: {receipt.customerName}</p>}
          <p>Cashier: {receipt.cashier}</p>
          <p className="mt-2">Thank you for your business!</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onSend}>
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
