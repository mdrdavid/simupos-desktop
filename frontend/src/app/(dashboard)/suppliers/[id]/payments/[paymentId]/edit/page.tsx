"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSupplier } from "@/context/SupplierContext";
import { RecordPaymentData } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";


export default function EditSupplierPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { getPaymentById, updatePayment } = useSupplier();
  const paymentId = params.paymentId as string;
  const supplierId = params.id as string;

  const { register, handleSubmit, reset, setValue } = useForm<RecordPaymentData>();

  useEffect(() => {
    if (paymentId) {
      const fetchPayment = async () => {
        const payment = await getPaymentById(paymentId);
        if (payment) {
          reset(payment);
        }
      };
      fetchPayment();
    }
  }, [paymentId, getPaymentById, reset]);

  const onSubmit = async (data: RecordPaymentData) => {
    if (!paymentId) {
      alert("Payment ID is missing");
      return;
    }
    await updatePayment(paymentId, data);
    router.push(`/suppliers/${supplierId}/payments`);
  };

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Edit Payment</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input type="date" {...register("date", { required: true })} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" {...register("amount", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select onValueChange={(value) => setValue("paymentMethod", value)}>
                <SelectTrigger>
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
            </div>
            <div>
              <Label>Reference</Label>
              <Input {...register("reference")} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Update Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
