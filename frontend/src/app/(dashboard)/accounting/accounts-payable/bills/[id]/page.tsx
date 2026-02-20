/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { AccountsPayable, PayablePayment } from "@/src/types/accountsPayable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BillDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BillDetailsPage({ params }: BillDetailsPageProps) {
  const router = useRouter();
  const {
    getBillById,
    getPaymentHistory,
    updateBillStatus,
    voidBill,
    loading,
  } = useAccountsPayable();
  const [bill, setBill] = useState<AccountsPayable | null>(null);
  const [payments, setPayments] = useState<PayablePayment[]>([]);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    // Resolve the async params
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      loadBillData();
    }
  }, [resolvedParams]);

  const loadBillData = async () => {
    if (!resolvedParams) return;

    try {
      const [billData, paymentData] = await Promise.all([
        getBillById(resolvedParams.id),
        getPaymentHistory(resolvedParams.id),
      ]);
      setBill(billData);
      setPayments(paymentData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill details",
        variant: "destructive",
      });
      router.push("/accounting/accounts-payable/bills");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "received":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRecordPayment = () => {
    if (!resolvedParams) return;
    router.push(
      `/accounting/accounts-payable/bills/${resolvedParams.id}/payment`
    );
  };

  const handleVoidBill = async () => {
    if (!resolvedParams) return;

    if (
      !confirm(
        "Are you sure you want to void this bill? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await voidBill(resolvedParams.id, "Voided by user");
      toast({
        title: "Success",
        description: "Bill has been voided",
      });
      loadBillData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to void bill",
        variant: "destructive",
      });
    }
  };

  if (loading || !bill || !resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading bill details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/accounting/accounts-payable/bills")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{bill.billNumber}</h1>
              <Badge className={getStatusColor(bill.status)}>
                {bill.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Bill details and payment history
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {bill.balanceDue > 0 && bill.status !== "void" && (
            <Button onClick={handleRecordPayment}>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleVoidBill}
                className="text-red-600"
                disabled={bill.status === "void"}
              >
                <FileText className="h-4 w-4 mr-2" />
                Void Bill
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supplier and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Supplier</span>
                  </div>
                  <p className="font-semibold">
                    {bill.supplier?.name || "Unknown Supplier"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Issue Date</span>
                  </div>
                  <p className="font-semibold">{formatDate(bill.issueDate)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <p className="font-semibold">{formatDate(bill.dueDate)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {bill.description && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm">{bill.description}</p>
                </div>
              )}

              {/* Line Items */}
              <div className="space-y-4">
                <Label>Line Items</Label>
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b font-semibold text-sm">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {bill.lineItems?.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                    >
                      <div className="col-span-6">{item.description}</div>
                      <div className="col-span-2 text-right">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="col-span-2 text-right font-semibold">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                  <div className="p-4 border-t bg-muted/50">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(bill.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.paymentDate)} •{" "}
                          {payment.paymentMethod}
                          {payment.referenceNumber &&
                            ` • Ref: ${payment.referenceNumber}`}
                        </p>
                        {payment.notes && (
                          <p className="text-sm">{payment.notes}</p>
                        )}
                      </div>
                      <Badge variant="outline">Paid</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Amount Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">
                  {formatCurrency(bill.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(bill.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-semibold">Balance Due</span>
                <span
                  className={`font-bold text-lg ${
                    bill.balanceDue > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(bill.balanceDue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          {bill.balanceDue > 0 && bill.status !== "void" && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleRecordPayment}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Label component for consistency
function Label({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      {...props}
    >
      {children}
    </label>
  );
}
