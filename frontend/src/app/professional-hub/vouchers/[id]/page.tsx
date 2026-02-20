"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentContext";
import { PaymentVoucher } from "@/components/professional-hub/PaymentVoucher";
import type { Payment } from "@/src/types/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VoucherPage() {
  const params = useParams();
  const { businessData } = useAuth();
  const { getPaymentById, loading, error } = usePayments();
  const [payment, setPayment] = useState<Payment | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && getPaymentById) {
      getPaymentById(id)
        .then((data) => {
          if (data) {
            setPayment(data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch payment:", err);
        });
    }
  }, [id, getPaymentById]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Voucher...</p>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Voucher not found.</p>
      </div>
    );
  }

  // Transform the Payment object into the shape expected by PaymentVoucher
  const voucherData = {
    voucherNumber: payment.voucherNumber,
    artisanName: `${payment.artisan.firstName} ${payment.artisan.lastName}`,
    artisanId: payment.artisanId,
    jobId: payment.jobId,
    jobDescription: payment.job.description,
    wageAmount: parseFloat(payment.assignment.agreedWage),
    amountPaidThisVoucher: payment.amount,
    totalAmountPaid: parseFloat(payment.assignment.amountPaid),
    balanceRemaining:
      parseFloat(payment.assignment.agreedWage) -
      parseFloat(payment.assignment.amountPaid),
    paymentDate: payment.paymentDate,
    authorizedBy: `${payment.authorizedBy.firstName} ${payment.authorizedBy.lastName}`,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Voucher</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentVoucher voucher={voucherData} businessDetails={businessData} />
        </CardContent>
      </Card>
    </div>
  );
}
