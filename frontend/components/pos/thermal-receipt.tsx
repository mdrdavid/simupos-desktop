/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Download, Printer, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Transaction {
  id: string;
  transactionId: string;
  timestamp: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod:
    | "cash"
    | "mtn_momo"
    | "airtel_money"
    | "bank_transfer"
    | "credit_card";
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  isCustomAmount?: boolean;
  customItemName?: string;
  // CREDIT SALE FIELDS
  isCreditSale?: boolean;
  amountPaid?: number;
  balanceDue?: number;
  creditEntryId?: string;
  // CREDIT PAYMENT FIELDS
  isCreditPayment?: boolean;
  previousBalance?: number;
  newBalance?: number;
  paymentAmount?: number;
}

interface BusinessData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  applyVAT: boolean;
  vatRate?: number;
  currency: string;
  logo?: string;
  receiptFooter?: string;
  businessType?: string;
}

interface ThermalReceiptProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ThermalReceipt({
  transaction,
  open,
  onOpenChange,
}: ThermalReceiptProps) {
  const { toast } = useToast();
  const { businessData } = useAuth();
  const { currentBusiness } = useBusiness();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Use currentBusiness if available, otherwise fall back to businessData
  const businessInfo = currentBusiness || businessData;

  // Preload logo to ensure it's available for printing
  useEffect(() => {
    if (businessInfo?.logo) {
      const img = new Image();
      img.onload = () => {
        setLogoLoaded(true);
      };
      img.onerror = () => {
        setLogoLoaded(false);
      };
      img.src = businessInfo.logo;
    } else {
      setLogoLoaded(false);
    }
  }, [businessInfo?.logo]);

  const formatCurrency = (amount: number | string) => {
    // Convert to number first to ensure proper formatting
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    // Ensure it's a valid number and not NaN
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      return "0";
    }
    return numAmount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getPaymentMethodName = (paymentType: string) => {
    switch (paymentType) {
      case "cash":
        return "Cash";
      case "mtn_momo":
        return "MTN MoMo";
      case "airtel_money":
        return "Airtel Money";
      case "bank_transfer":
        return "Bank Transfer";
      case "credit_card":
        return "Credit Card";
      default:
        return "Unknown";
    }
  };

  const calculateSubtotal = () => {
    if (transaction.isCustomAmount) {
      const amount = Number(transaction.amount);
      return isNaN(amount) ? 0 : amount;
    }
    if (transaction.items && transaction.items.length > 0) {
      const subtotal = transaction.items.reduce(
        (total, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return total + price * quantity;
        },
        0
      );
      return isNaN(subtotal) ? 0 : subtotal;
    }
    const amount = Number(transaction.amount);
    return isNaN(amount) ? 0 : amount;
  };

  const calculateTax = () => {
    if (!businessInfo?.applyVAT || !businessInfo?.vatRate) return 0;
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * (businessInfo.vatRate / 100));
  };

  // UPDATE: Function to generate credit information section for both sale and payment
  const generateCreditInfoHTML = () => {
    if (transaction.isCreditSale) {
      const amountPaid = transaction.amountPaid || 0;
      const balanceDue = transaction.balanceDue || transaction.amount;

      return `
        <div class="border-t border-dashed border-gray-400 mt-2 pt-2">
          <div class="text-center font-bold">CREDIT SALE</div>
          <div class="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span>${formatCurrency(transaction.amount)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Amount Paid:</span>
            <span>${formatCurrency(amountPaid)}</span>
          </div>
          <div class="flex justify-between text-sm font-bold">
            <span>Balance Due:</span>
            <span>${formatCurrency(balanceDue)}</span>
          </div>
          ${
            transaction.creditEntryId
              ? `
          <div class="text-center text-xs mt-1">
            Credit ID: ${transaction.creditEntryId}
          </div>
          `
              : ""
          }
        </div>
      `;
    }

    if (transaction.isCreditPayment) {
      const paymentAmount = transaction.paymentAmount || transaction.amount;
      const previousBalance = transaction.previousBalance || 0;
      const newBalance = transaction.newBalance || 0;

      return `
        <div class="border-t border-dashed border-gray-400 mt-2 pt-2">
          <div class="text-center font-bold">CREDIT PAYMENT</div>
          <div class="flex justify-between text-sm">
            <span>Payment Amount:</span>
            <span>${formatCurrency(paymentAmount)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Previous Balance:</span>
            <span>${formatCurrency(previousBalance)}</span>
          </div>
          <div class="flex justify-between text-sm font-bold">
            <span>New Balance:</span>
            <span>${formatCurrency(newBalance)}</span>
          </div>
          ${
            transaction.creditEntryId
              ? `
          <div class="text-center text-xs mt-1">
            Credit ID: ${transaction.creditEntryId}
          </div>
          `
              : ""
          }
        </div>
      `;
    }

    return "";
  };

  // UPDATE: Function to generate receipt title based on type
  const getReceiptTitle = () => {
    if (transaction.isCreditPayment) {
      return "CREDIT PAYMENT RECEIPT";
    }
    if (transaction.isCreditSale) {
      return "CREDIT SALE RECEIPT";
    }
    return "SALES RECEIPT";
  };

  // UPDATE: Function to get appropriate icon
  const getReceiptIcon = () => {
    if (transaction.isCreditPayment) {
      return <DollarSign className="h-5 w-5 text-green-600" />;
    }
    if (transaction.isCreditSale) {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    }
    return null;
  };

  // NEW: Function to get customer display information
  const getCustomerDisplayInfo = () => {
    const hasName =
      transaction.customerName && transaction.customerName.trim() !== "";
    const hasPhone =
      transaction.customerPhone && transaction.customerPhone.trim() !== "";

    if (!hasName && !hasPhone) {
      return {
        displayName: "Walk-in Customer",
        showPhone: false,
      };
    }

    if (hasName && !hasPhone) {
      return {
        displayName: transaction.customerName,
        showPhone: false,
      };
    }

    if (!hasName && hasPhone) {
      return {
        displayName: "Customer",
        showPhone: true,
      };
    }

    // Both name and phone are available
    return {
      displayName: transaction.customerName,
      showPhone: true,
    };
  };

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${transaction.transactionId}</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    width: 227px;
                    max-width: 227px;
                    min-height: 100vh;
                  }
                }
                body {
                  margin: 0;
                  padding: 8px;
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  width: 227px;
                  max-width: 227px;
                  min-height: 100vh;
                  overflow-y: auto;
                }
                .receipt {
                  width: 100%;
                  text-align: center;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 8px 0;
                }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .text-sm { font-size: 10px; }
                .text-xs { font-size: 9px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mt-2 { margin-top: 8px; }
                .py-1 { padding: 4px 0; }
                .py-2 { padding: 8px 0; }
                .py-0\.5 { padding: 2px 0; }
                .space-y-1 > * + * { margin-top: 4px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .w-full { width: 100%; }
                .break-words { word-break: break-word; }
                .logo { max-width: 60px; max-height: 60px; object-fit: contain; }
                .credit-payment {
                  border-top: 1px dashed #000;
                  margin-top: 8px;
                  padding-top: 8px;
                  background-color: #f0f9f0;
                }
                .credit-sale {
                  border-top: 1px dashed #000;
                  margin-top: 8px;
                  padding-top: 8px;
                  background-color: #f0f8ff;
                }
              </style>
            </head>
            <body>
              ${generateReceiptHTML()}
            </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for images to load before printing
        if (businessInfo?.logo && logoLoaded) {
          // Logo is already preloaded, print immediately
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 100);
        } else if (businessInfo?.logo && !logoLoaded) {
          // Logo exists but not loaded yet, wait for it
          const img = new Image();
          img.onload = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            }, 100);
          };
          img.onerror = () => {
            // If image fails to load, still print without it
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            }, 100);
          };
          img.src = businessInfo.logo;
        } else {
          // No logo, print immediately
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 100);
        }
      }
      toast({
        title: "Printing",
        description: "Receipt sent to printer",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print receipt",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      // Create a new window for downloading the visual receipt
      const downloadWindow = window.open("", "_blank");
      if (downloadWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${transaction.transactionId}</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    width: 227px;
                    max-width: 227px;
                    min-height: 100vh;
                  }
                }
                body {
                  margin: 0;
                  padding: 8px;
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  width: 227px;
                  max-width: 227px;
                  min-height: 100vh;
                  overflow-y: auto;
                }
                .receipt {
                  width: 100%;
                  text-align: center;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 8px 0;
                }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .text-sm { font-size: 10px; }
                .text-xs { font-size: 9px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mt-2 { margin-top: 8px; }
                .py-1 { padding: 4px 0; }
                .py-2 { padding: 8px 0; }
                .py-0\.5 { padding: 2px 0; }
                .space-y-1 > * + * { margin-top: 4px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .w-full { width: 100%; }
                .break-words { word-break: break-word; }
                .logo { max-width: 60px; max-height: 60px; object-fit: contain; }
                .credit-payment {
                  border-top: 1px dashed #000;
                  margin-top: 8px;
                  padding-top: 8px;
                  background-color: #f0f9f0;
                }
                .credit-sale {
                  border-top: 1px dashed #000;
                  margin-top: 8px;
                  padding-top: 8px;
                  background-color: #f0f8ff;
                }
              </style>
            </head>
            <body>
              ${generateReceiptHTML()}
            </body>
          </html>
        `;

        downloadWindow.document.write(htmlContent);
        downloadWindow.document.close();

        // Wait for images to load before downloading
        if (businessInfo?.logo && logoLoaded) {
          // Logo is already preloaded, download immediately
          setTimeout(() => {
            downloadWindow.print();
            downloadWindow.close();
          }, 100);
        } else if (businessInfo?.logo && !logoLoaded) {
          // Logo exists but not loaded yet, wait for it
          const img = new Image();
          img.onload = () => {
            setTimeout(() => {
              downloadWindow.print();
              downloadWindow.close();
            }, 100);
          };
          img.onerror = () => {
            // If image fails to load, still download without it
            setTimeout(() => {
              downloadWindow.print();
              downloadWindow.close();
            }, 100);
          };
          img.src = businessInfo.logo;
        } else {
          // No logo, download immediately
          setTimeout(() => {
            downloadWindow.print();
            downloadWindow.close();
          }, 100);
        }
      }

      toast({
        title: "Downloaded",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const generateReceiptHTML = () => {
    const receiptTitle = getReceiptTitle();
    const customerInfo = getCustomerDisplayInfo();

    return `
      <div class="receipt">
        <div class="text-center mb-2">
          ${businessInfo?.logo ? `<div class="mb-2"><img src="${businessInfo.logo}" alt="Logo" class="logo" /></div>` : ""}
          <div class="font-bold text-sm">${businessInfo?.name || "Business Name"}</div>
          ${businessInfo?.address ? `<div class="text-xs">${businessInfo.address}</div>` : ""}
          ${businessInfo?.phone ? `<div class="text-xs">Tel: ${businessInfo.phone}</div>` : ""}
        </div>
        
        <div class="divider"></div>
        
        <div class="text-center mb-2">
          <div class="font-bold">${receiptTitle}</div>
        </div>
        
        <div class="text-left mb-2">
          <div>Receipt #: ${transaction.transactionId}</div>
          <div>Date: ${formatDate(transaction.timestamp)}</div>
          <div>Customer: ${customerInfo.displayName}</div>
          ${customerInfo.showPhone ? `<div>Phone: ${transaction.customerPhone}</div>` : ""}
        </div>
        
        <div class="divider"></div>
        
        <div class="text-left mb-2">
          ${
            transaction.isCreditPayment
              ? `
            <div class="font-bold text-center mb-1">PAYMENT DETAILS</div>
            <div class="break-words">Credit Account Payment</div>
            <div class="text-right">${formatCurrency(transaction.amount)}</div>
          `
              : transaction.isCustomAmount
                ? `
            <div class="font-bold text-center mb-1">ITEMS:</div>
            <div class="break-words">${transaction.customItemName || "Custom Sale"}</div>
            <div class="text-right">${formatCurrency(transaction.amount)}</div>
          `
                : transaction.items && transaction.items.length > 0
                  ? `
            <div class="font-bold text-center mb-1">ITEMS:</div>
            ${transaction.items
              .map(
                (item) => `
              <div class="py-1">
                <div class="break-words text-xs">${item.name}</div>
                <div class="flex justify-between text-xs">
                  <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            `
              )
              .join("")}
          `
                  : `
            <div class="font-bold text-center mb-1">SALE AMOUNT</div>
            <div class="break-words">Sale Amount</div>
            <div class="text-right">${formatCurrency(transaction.amount)}</div>
          `
          }
        </div>
        
        <div class="divider"></div>
        
        <div class="text-left mb-2">
          ${
            !transaction.isCreditPayment
              ? `
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>${formatCurrency(calculateSubtotal())}</span>
            </div>
            ${
              businessInfo?.applyVAT && businessInfo?.vatRate
                ? `
            <div class="flex justify-between">
              <span>VAT (${businessInfo.vatRate}%):</span>
              <span>${formatCurrency(calculateTax())}</span>
            </div>
            `
                : ""
            }
            <div class="flex justify-between font-bold mt-2">
              <span>TOTAL:</span>
              <span>${formatCurrency(
                businessInfo?.applyVAT && businessInfo?.vatRate
                  ? calculateSubtotal() + calculateTax()
                  : transaction.amount
              )}</span>
            </div>
          `
              : ""
          }
          
          ${generateCreditInfoHTML()}
          
          <div class="flex justify-between mt-2">
            <span>Payment Method:</span>
            <span>${getPaymentMethodName(transaction.paymentMethod)}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="text-center">
          <div class="mb-1">Thank you for your business!</div>
          <div class="text-xs">${businessInfo?.receiptFooter || "Thank you for your support!"}
          <p class="font-bold">Powered by SimuPOS</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            {getReceiptTitle()}
            {getReceiptIcon()}
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div
            className="bg-white border-2 border-dashed border-gray-300 p-4 mx-auto"
            style={{ width: "227px", maxWidth: "227px" }}
          >
            <div className="text-center text-xs font-mono leading-tight">
              {businessInfo?.logo && (
                <div className="mb-2 flex justify-center">
                  <img
                    src={businessInfo.logo}
                    alt="Business Logo"
                    className="max-w-[60px] max-h-[60px] object-contain"
                    onError={(e) => {
                      // Hide the image if it fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="font-bold text-sm mb-1">
                {businessInfo?.name || "Business Name"}
              </div>
              {businessInfo?.address && (
                <div className="text-xs mb-1">{businessInfo.address}</div>
              )}
              {businessInfo?.phone && (
                <div className="text-xs mb-2">Tel: {businessInfo.phone}</div>
              )}
              <div className="border-t border-dashed border-gray-400 my-2"></div>

              {/* Receipt Title */}
              <div className="text-center mb-2">
                <div className="font-bold">{getReceiptTitle()}</div>
              </div>

              {/* Customer Information - FIXED */}
              <div className="text-left mb-2">
                <div>Receipt #: {transaction.transactionId}</div>
                <div>Date: {formatDate(transaction.timestamp)}</div>
                <div>Customer: {getCustomerDisplayInfo().displayName}</div>
                {getCustomerDisplayInfo().showPhone && (
                  <div>Phone: {transaction.customerPhone}</div>
                )}
              </div>

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="text-left mb-2">
                {transaction.isCreditPayment ? (
                  <>
                    <div className="font-bold text-center mb-1">
                      PAYMENT DETAILS
                    </div>
                    <div className="break-words">Credit Account Payment</div>
                    <div className="text-right">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </>
                ) : transaction.isCustomAmount ? (
                  <>
                    <div className="font-bold text-center mb-1">ITEMS:</div>
                    <div className="break-words">
                      {transaction.customItemName || "Custom Sale"}
                    </div>
                    <div className="text-right">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </>
                ) : transaction.items && transaction.items.length > 0 ? (
                  <>
                    <div className="font-bold text-center mb-1">ITEMS:</div>
                    <div className="space-y-1">
                      {transaction.items.map((item) => (
                        <div key={item.id} className="py-0.5">
                          <div className="break-words text-xs">{item.name}</div>
                          <div className="flex justify-between text-xs">
                            <span>
                              {item.quantity} x {formatCurrency(item.price)}
                            </span>
                            <span>
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-center mb-1">
                      SALE AMOUNT
                    </div>
                    <div className="break-words">Sale Amount</div>
                    <div className="text-right">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="text-left mb-2">
                {!transaction.isCreditPayment && (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {businessInfo?.applyVAT && businessInfo?.vatRate && (
                      <div className="flex justify-between">
                        <span>VAT ({businessInfo.vatRate}%):</span>
                        <span>{formatCurrency(calculateTax())}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-1">
                      <span>TOTAL:</span>
                      <span>
                        {formatCurrency(
                          businessInfo?.applyVAT && businessInfo?.vatRate
                            ? calculateSubtotal() + calculateTax()
                            : transaction.amount
                        )}
                      </span>
                    </div>
                  </>
                )}

                {/* Credit Information Section */}
                {(transaction.isCreditSale || transaction.isCreditPayment) && (
                  <div
                    className={`border-t border-dashed border-gray-400 mt-2 pt-2 ${
                      transaction.isCreditPayment
                        ? "bg-green-50 rounded p-2"
                        : transaction.isCreditSale
                          ? "bg-blue-50 rounded p-2"
                          : ""
                    }`}
                  >
                    {transaction.isCreditSale && (
                      <>
                        <div className="text-center font-bold text-blue-600">
                          CREDIT SALE
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Amount:</span>
                          <span>{formatCurrency(transaction.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Amount Paid:</span>
                          <span>
                            {formatCurrency(transaction.amountPaid || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span>Balance Due:</span>
                          <span>
                            {formatCurrency(
                              transaction.balanceDue || transaction.amount
                            )}
                          </span>
                        </div>
                      </>
                    )}

                    {transaction.isCreditPayment && (
                      <>
                        <div className="text-center font-bold text-green-600">
                          CREDIT PAYMENT
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Payment Amount:</span>
                          <span>
                            {formatCurrency(
                              transaction.paymentAmount || transaction.amount
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Previous Balance:</span>
                          <span>
                            {formatCurrency(transaction.previousBalance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span>New Balance:</span>
                          <span>
                            {formatCurrency(transaction.newBalance || 0)}
                          </span>
                        </div>
                      </>
                    )}

                    {transaction.creditEntryId && (
                      <div className="text-center text-xs mt-1">
                        Credit ID: {transaction.creditEntryId}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <span>Payment Method:</span>
                  <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="text-center">
                <div className="mb-1">Thank you for your business!</div>
                {businessInfo?.receiptFooter ? (
                  <div className="text-xs">
                    {businessInfo.receiptFooter}
                    <p className="font-bold">Powered by SimuPOS</p>
                  </div>
                ) : (
                  <div className="text-xs">Powered by SimuPOS</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-4 border-t">
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Printing...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            className="flex-1"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
