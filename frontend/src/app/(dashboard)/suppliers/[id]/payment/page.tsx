/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { useSupplier } from "@/context/SupplierContext";
import { toast } from "sonner";
import Link from "next/link";

export default function SupplierPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { getSupplierById, recordPayment } = useSupplier();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const supplierId = params.id as string;
        const supplierData = await getSupplierById(supplierId);
        setSupplier(supplierData);

        // Pre-fill amount with outstanding balance
        if (
          supplierData?.outstandingBalance &&
          supplierData.outstandingBalance > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            amount: supplierData.outstandingBalance!.toString(),
          }));
        }
      } catch (error) {
        console.error("Error loading supplier:", error);
        router.push("/suppliers");
      } finally {
        setLoading(false);
      }
    };

    loadSupplier();
  }, [params.id, getSupplierById, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount.trim()) {
      newErrors.amount = "Payment amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Payment reference is required";
    }

    if (!formData.date) {
      newErrors.date = "Payment date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    try {
      await recordPayment(supplier.id, {
        ...formData,
        amount: Number(formData.amount),
      });

      toast.success("Payment recorded successfully!");
      router.push(`/suppliers/${supplier.id}`);
    } catch (error) {
      toast.error("Failed to record payment. Please try again.");
      console.error("Error recording payment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Supplier Not Found
          </h1>
          <Link href="/suppliers">
            <Button>Back to Suppliers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/suppliers/${supplier.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Supplier
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600 mt-1">
            Record a payment for {supplier.name}
          </p>
        </div>
      </div>

      {/* Supplier Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(supplier.outstandingBalance)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Credit Limit</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(supplier.creditLimit)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  supplier.creditLimit - supplier.outstandingBalance
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Payment Amount (UGX) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="Enter payment amount"
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Payment Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`pl-10 ${errors.date ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleInputChange("paymentMethod", value)
                }
              >
                <SelectTrigger
                  className={errors.paymentMethod ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reference">Payment Reference *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    handleInputChange("reference", e.target.value)
                  }
                  placeholder="Enter payment reference (receipt number, transaction ID, etc.)"
                  className={`pl-10 ${errors.reference ? "border-red-500" : ""}`}
                />
              </div>
              {errors.reference && (
                <p className="text-sm text-red-500 mt-1">{errors.reference}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter any additional notes about this payment"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Impact */}
        {/* {formData.amount && !isNaN(Number(formData.amount)) && ( */}
        {formData.amount && !isNaN(Number(formData.amount)) && supplier && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Current Outstanding</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(supplier.outstandingBalance)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">After Payment</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(
                      Math.max(
                        0,
                        supplier.outstandingBalance - Number(formData.amount)
                      )
                    )}
                  </p>
                </div>
              </div>

              {Number(formData.amount) > supplier.outstandingBalance && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Payment amount exceeds outstanding
                    balance. Excess amount:{" "}
                    {formatCurrency(
                      Number(formData.amount) - supplier.outstandingBalance
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/suppliers/${supplier.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording Payment...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
