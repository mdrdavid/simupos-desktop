/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Save,
  CalendarIcon,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCredit } from "@/context/CreditContext";
import { toast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/src/types/credit";

export default function RecordPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { recordPayment, getCreditEntryById, loading } = useCredit();
  const [creditEntry, setCreditEntry] = useState<any>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [formData, setFormData] = useState({
    amountPaid: "",
    paymentMethod: "" as PaymentMethod | "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentBalance = Number.parseFloat(searchParams.get("balance") || "0");
  const customerName = searchParams.get("customerName") || "";

  // Load credit entry details
  useEffect(() => {
    const loadCreditEntry = async () => {
      try {
        setLoadingEntry(true);
        const entry = await getCreditEntryById(params.id as string);
        if (!entry) {
          toast({
            title: "Error",
            description: "Credit entry not found.",
            variant: "destructive",
          });
          router.back();
          return;
        }
        setCreditEntry(entry);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load credit entry.",
          variant: "destructive",
        });
        router.back();
      } finally {
        setLoadingEntry(false);
      }
    };

    if (params.id) {
      loadCreditEntry();
    }
  }, [params.id, getCreditEntryById, router]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const paidAmount = Number.parseFloat(formData.amountPaid);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      newErrors.amountPaid = "Please enter a valid amount";
    } else if (paidAmount > (creditEntry?.balance || currentBalance)) {
      newErrors.amountPaid = `Amount cannot exceed balance of ${formatCurrency(creditEntry?.balance || currentBalance)}`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (!paymentDate) {
      newErrors.paymentDate = "Please select a payment date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePayment = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await recordPayment({
        creditEntryId: params.id as string,
        amountPaid: Number.parseFloat(formData.amountPaid),
        paymentDate: paymentDate.toISOString(),
        paymentMethod: formData.paymentMethod as PaymentMethod,
        notes: formData.notes,
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });

      router.push(`/credit/${params.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "mtn_momo", label: "MTN Mobile Money" },
    { value: "airtel_money", label: "Airtel Money" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Card Payment" },
  ];

  if (loadingEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading credit details...</p>
        </div>
      </div>
    );
  }

  if (!creditEntry && !currentBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Missing Information</h2>
          <p className="text-muted-foreground mb-4">
            Essential information for recording payment is missing.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const displayBalance = creditEntry?.balance || currentBalance;
  const displayCustomerName = creditEntry?.customerName || customerName;

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Record Payment</h1>
          <p className="text-muted-foreground">
            Record a payment for this credit account
          </p>
        </div>
      </div>

      {/* Customer Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Payment Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Customer:</span>
              <span className="font-semibold text-blue-900">
                {displayCustomerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Current Balance:</span>
              <span className="font-bold text-red-600 text-lg">
                {formatCurrency(displayBalance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Payment Amount (UGX) *</Label>
            <Input
              id="amountPaid"
              type="number"
              placeholder="Enter payment amount"
              value={formData.amountPaid}
              onChange={(e) => handleInputChange("amountPaid", e.target.value)}
              max={displayBalance}
              min="0"
              step="0.01"
              className={errors.amountPaid ? "border-red-500" : ""}
            />
            {errors.amountPaid && (
              <p className="text-sm text-red-500">{errors.amountPaid}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum: {formatCurrency(displayBalance)}
            </p>
          </div>

          <div className="space-y-2">
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
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground",
                    errors.paymentDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate
                    ? format(paymentDate, "PPP")
                    : "Select payment date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => {
                    if (date) {
                      setPaymentDate(date);
                      setShowCalendar(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.paymentDate && (
              <p className="text-sm text-red-500">{errors.paymentDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this payment..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Preview */}
      {formData.amountPaid && !errors.amountPaid && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-green-900 mb-3">
              Payment Preview
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Payment Amount:</span>
                <span className="font-semibold text-green-900">
                  {formatCurrency(Number.parseFloat(formData.amountPaid))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Remaining Balance:</span>
                <span className="font-semibold text-green-900">
                  {formatCurrency(
                    displayBalance - Number.parseFloat(formData.amountPaid)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">New Status:</span>
                <span className="font-semibold text-green-900">
                  {displayBalance - Number.parseFloat(formData.amountPaid) === 0
                    ? "Paid"
                    : "Partially Paid"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSavePayment} disabled={saving || loading}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Recording...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Record Payment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
