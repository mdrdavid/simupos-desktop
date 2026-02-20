/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  DollarSign,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useInvoiceContext } from "@/context/InvoiceContext";
import { useBusiness } from "@/context/BusinessContext";
import jsPDF from "jspdf";
import type { Invoice } from "@/src/types/invoice";

export default function InvoiceDetailPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { getInvoiceById, updateInvoiceStatus } = useInvoiceContext();
  const { currentBusiness } = useBusiness();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      if (params.id) {
        const invoiceData = await getInvoiceById(params.id as string);
        setInvoice(invoiceData);
      }
      setLoading(false);
    };

    loadInvoice();
  }, [params.id, getInvoiceById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (
    newStatus: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  ) => {
    if (invoice) {
      await updateInvoiceStatus(invoice.id, newStatus);
      setInvoice({ ...invoice, status: newStatus });
    }
  };

  const handleDownload = () => {
    if (!invoice || !currentBusiness) return;
    
    try {
      const doc = new jsPDF();
      
      // Add logo if available
      if (currentBusiness.logo) {
        try {
          doc.addImage(currentBusiness.logo, 'PNG', 20, 20, 30, 20);
        } catch (error) {
          // Logo failed to load, continue without it
        }
      }
      
      // Business Details
      const businessY = currentBusiness.logo ? 50 : 30;
      doc.setFontSize(16);
      doc.text(currentBusiness.name || "Business Name", 20, businessY);
      doc.setFontSize(10);
      if (currentBusiness.address) {
        doc.text(currentBusiness.address, 20, businessY + 8);
      }
      if (currentBusiness.phone) {
        doc.text(`Tel: ${currentBusiness.phone}`, 20, businessY + 16);
      }
      
      // Invoice Title
      doc.setFontSize(20);
      doc.text("INVOICE", 20, businessY + 30);
      
      // Invoice Details
      doc.setFontSize(10);
      const detailsY = businessY + 40;
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, detailsY);
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, detailsY + 8);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, detailsY + 16);
      
      // Customer Details
      const customerY = detailsY + 30;
      doc.text("Bill To:", 20, customerY);
      doc.text(invoice.customerName, 20, customerY + 8);
      if (invoice.customerEmail) {
        doc.text(invoice.customerEmail, 20, customerY + 16);
      }
      if (invoice.customerPhone) {
        doc.text(invoice.customerPhone, 20, customerY + 24);
      }
      if (invoice.customerAddress) {
        const addressLines = invoice.customerAddress.split('\n');
        addressLines.forEach((line, index) => {
          doc.text(line, 20, customerY + 32 + (index * 8));
        });
      }
      
      // Items Table
      const tableY = customerY + 60;
      doc.setFontSize(12);
      doc.text("Items", 20, tableY);
      
      // Table headers
      doc.setFontSize(10);
      doc.text("Description", 20, tableY + 10);
      doc.text("Qty", 120, tableY + 10);
      doc.text("Unit Price", 140, tableY + 10);
      doc.text("Total", 170, tableY + 10);
      
      // Table rows
      let currentY = tableY + 20;
      invoice.items.forEach((item, index) => {
        doc.text(item.description, 20, currentY);
        doc.text(item.quantity.toString(), 120, currentY);
        doc.text(`UGX ${item.unitPrice.toLocaleString()}`, 140, currentY);
        doc.text(`UGX ${item.total.toLocaleString()}`, 170, currentY);
        currentY += 8;
      });
      
      // Totals
      const totalsY = currentY + 10;
      doc.text(`Subtotal: UGX ${invoice.subtotal.toLocaleString()}`, 140, totalsY);
      doc.text(`Tax (${invoice.taxRate}%): UGX ${invoice.taxAmount.toLocaleString()}`, 140, totalsY + 8);
      doc.setFont("bold");
      doc.text(`Total: UGX ${invoice.totalAmount.toLocaleString()}`, 140, totalsY + 16);
      doc.setFont("normal");
      
      // Status
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, totalsY + 30);
      
      // Notes
      if (invoice.notes) {
        doc.text("Notes:", 20, totalsY + 45);
        const notesLines = invoice.notes.split('\n');
        notesLines.forEach((line, index) => {
          doc.text(line, 20, totalsY + 55 + (index * 8));
        });
      }
      
      // Save the PDF
      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleSend = () => {
    // Implement email sending functionality
    console.log("Send invoice via email");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/invoices">
          <Button className="mt-4">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600">View and manage invoice details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {currentBusiness?.logo && (
                    <div className="mb-4 flex justify-start">
                      <img 
                        src={currentBusiness.logo} 
                        alt="Business Logo" 
                        className="max-w-[80px] max-h-[80px] object-contain rounded-lg invoice-logo"
                        onError={(e) => {
                          // Hide the image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                  {currentBusiness?.name && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900">{currentBusiness.name}</p>
                      {currentBusiness.address && (
                        <p className="text-sm text-gray-600">{currentBusiness.address}</p>
                      )}
                      {currentBusiness.phone && (
                        <p className="text-sm text-gray-600">{currentBusiness.phone}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-medium">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Due Date</p>
                  <p className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Bill To:</h3>
                <div className="space-y-1">
                  <p className="font-medium">{invoice.customerName}</p>
                  {invoice.customerEmail && (
                    <p className="text-gray-600">{invoice.customerEmail}</p>
                  )}
                  {invoice.customerPhone && (
                    <p className="text-gray-600">{invoice.customerPhone}</p>
                  )}
                  {invoice.customerAddress && (
                    <p className="text-gray-600 whitespace-pre-line">
                      {invoice.customerAddress}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-900">
                        Description
                      </th>
                      <th className="text-right py-2 font-medium text-gray-900">
                        Qty
                      </th>
                      <th className="text-right py-2 font-medium text-gray-900">
                        Unit Price
                      </th>
                      <th className="text-right py-2 font-medium text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">
                          UGX {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-medium">
                          UGX {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>UGX {invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>UGX {invoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>UGX {invoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.status === "draft" && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate("sent")}
                >
                  Mark as Sent
                </Button>
              )}
              {(invoice.status === "sent" || invoice.status === "overdue") && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate("paid")}
                >
                  Mark as Paid
                </Button>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                <Link
                  href={`/invoices/${invoice.id}/payments`}
                  className="flex items-center"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">
                    UGX {invoice.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{invoice.customerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
