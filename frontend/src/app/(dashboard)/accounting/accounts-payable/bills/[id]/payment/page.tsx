/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/accounts-payable/bills/[id]/payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, DollarSign, Calendar, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { AccountsPayable } from "@/src/types/accountsPayable";

interface RecordPaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RecordPaymentPage({ params }: RecordPaymentPageProps) {
  const router = useRouter();
  const { getBillById, recordPayment, loading } = useAccountsPayable();
  const [bill, setBill] = useState<AccountsPayable | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: 0,
    paymentMethod: "bank" as "cash" | "bank" | "mobile_money" | "check",
    referenceNumber: "",
    notes: "",
  });

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
      loadBill();
    }
  }, [resolvedParams]);

  const loadBill = async () => {
    if (!resolvedParams) return;

    try {
      const billData = await getBillById(resolvedParams.id);
      setBill(billData);
      setFormData((prev) => ({
        ...prev,
        amount: billData.balanceDue,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill details",
        variant: "destructive",
      });
      router.push("/accounting/accounts-payable/bills");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolvedParams) return;

    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount > (bill?.balanceDue || 0)) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed the balance due",
        variant: "destructive",
      });
      return;
    }

    try {
      await recordPayment({
        billId: resolvedParams.id,
        branchId: bill?.branchId || "",
        userId: bill?.userId || "",
        ...formData,
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      router.push(`/accounting/accounts-payable/bills/${resolvedParams.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!bill || !resolvedParams) {
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
            onClick={() =>
              router.push(
                `/accounting/accounts-payable/bills/${resolvedParams.id}`
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Record Payment</h1>
            <p className="text-muted-foreground">
              Record payment for {bill.billNumber}
            </p>
          </div>
        </div>
        <Button type="submit" form="payment-form" disabled={loading}>
          <DollarSign className="h-4 w-4 mr-2" />
          {loading ? "Processing..." : "Record Payment"}
        </Button>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentDate: e.target.value,
                          })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        max={bill.balanceDue}
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="referenceNumber"
                      placeholder="Enter reference number..."
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceNumber: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bill Information</Label>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">{bill.billNumber}</p>
                    <p className="text-muted-foreground">
                      {bill.supplier?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span>{formatCurrency(bill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Already Paid</span>
                    <span className="text-green-600">
                      {formatCurrency(bill.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance Due</span>
                    <span className="font-semibold">
                      {formatCurrency(bill.balanceDue)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>This Payment</span>
                      <span className="text-blue-600">
                        {formatCurrency(formData.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Remaining Balance</span>
                      <span
                        className={
                          bill.balanceDue - formData.amount === 0
                            ? "text-green-600"
                            : "text-orange-600"
                        }
                      >
                        {formatCurrency(bill.balanceDue - formData.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {bill.balanceDue - formData.amount === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium text-center">
                      This payment will fully settle the bill
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Amounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    setFormData({ ...formData, amount: bill.balanceDue })
                  }
                >
                  Pay Full Balance ({formatCurrency(bill.balanceDue)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    setFormData({ ...formData, amount: bill.balanceDue / 2 })
                  }
                >
                  Pay Half ({formatCurrency(bill.balanceDue / 2)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    setFormData({ ...formData, amount: bill.balanceDue / 4 })
                  }
                >
                  Pay Quarter ({formatCurrency(bill.balanceDue / 4)})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
