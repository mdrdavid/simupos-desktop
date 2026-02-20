"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { usePayments } from "@/context/PaymentContext";
import type { UserProfile } from "@/context/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/src/types/payment";

interface ArtisanJob {
  jobId: string;
  assignmentId: string;
  jobTitle: string;
  jobStatus: string;
  wage: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artisan?: UserProfile;
  job?: ArtisanJob;
}

export function PaymentDialog({
  isOpen,
  onClose,
  artisan,
  job,
}: PaymentDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { makePayment, loading } = usePayments();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );

  if (!artisan || !job) return null;

  const balance = job.balance;

  const handlePayment = async () => {
    if (!user) {
      toast.error("You must be logged in to make a payment.");
      return;
    }
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }
    if (paymentAmount > balance) {
      toast.error(
        "Payment amount cannot be greater than the outstanding balance."
      );
      return;
    }

    const paymentData = {
      assignmentId: job.assignmentId,
      amount: paymentAmount,
      method: paymentMethod,
    };

    const newPayment = await makePayment(paymentData);

    if (newPayment) {
      toast.success("Redirecting to voucher...");
      onClose(); // Close the dialog
      router.push(`/professional-hub/vouchers/${newPayment.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <>
          <DialogHeader>
            <DialogTitle>Pay Artisan for: {job.jobTitle}</DialogTitle>
            <DialogDescription>
              Agreed Wage: UGX {job.wage.toLocaleString()} | Already Paid: UGX{" "}
              {job.amountPaid.toLocaleString()} | Balance: UGX{" "}
              {balance.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (UGX)</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="Enter amount to pay"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.MOBILE_MONEY}>
                    Mobile Money
                  </SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                    Bank Transfer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={loading}>
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
}
