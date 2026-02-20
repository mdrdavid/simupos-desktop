"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupplier } from "@/context/SupplierContext";
import { Supplier, SupplierPayment } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SupplierPaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const { getSupplierById, getSupplierPayments, deletePayment } = useSupplier();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const supplierId = params.id as string;

  useEffect(() => {
    if (supplierId) {
      const fetchSupplierDetails = async () => {
        setLoading(true);
        const [supplierData, paymentsData] = await Promise.all([
          getSupplierById(supplierId),
          getSupplierPayments(supplierId),
        ]);
        setSupplier(supplierData);
        setPayments(paymentsData);
        setLoading(false);
      };
      fetchSupplierDetails();
    }
  }, [supplierId, getSupplierById, getSupplierPayments]);

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(paymentId);
      setPayments(payments.filter((p) => p.id !== paymentId));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Supplier
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments for {supplier.name}</h1>
        <Link href={`/suppliers/${supplierId}/payment`}>
          <Button>
            Record Payment
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Payment {payment.reference}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/suppliers/${supplierId}/payments/${payment.id}/edit`}
                    >
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
              <p>Amount: {payment.amount}</p>
              <p>Method: {payment.paymentMethod}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
