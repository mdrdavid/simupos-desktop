"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useSupplier } from "@/context/SupplierContext";
import { CreateOrderData } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ArrowLeft } from "lucide-react";

export default function EditSupplierOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { getOrderById, updateOrder } = useSupplier();
  const orderId = params.id as string;

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<CreateOrderData>();

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        const order = await getOrderById(orderId);
        if (order) {
          reset(order);
        }
      };
      fetchOrder();
    }
  }, [orderId, getOrderById, reset]);

  const items = watch("items");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    items.forEach((item, index) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const totalPrice = quantity * unitPrice;
      setValue(`items.${index}.totalPrice`, totalPrice, { shouldValidate: true });
    });
  }, [items, setValue]);

  const onSubmit = async (data: CreateOrderData) => {
    if (!orderId) {
      alert("Order ID is missing");
      return;
    }
    await updateOrder(orderId, data);
    router.push(`/suppliers/${data.supplierId}/orders`);
  };

  return (
    <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
      <h1 className="text-3xl font-bold mb-6">Edit Order</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Date</label>
              <Input type="date" {...register("date", { required: true })} />
              {errors.date && <p className="text-red-500">Date is required</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 items-center mb-4">
                <Input placeholder="Product Name" {...register(`items.${index}.productName`, { required: true })} className="col-span-2" />
                <Input type="number" placeholder="Quantity" {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true })} />
                <Input type="number" placeholder="Unit Price" {...register(`items.${index}.unitPrice`, { required: true, valueAsNumber: true })} />
                <Input readOnly placeholder="Total Price" {...register(`items.${index}.totalPrice`)} />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => append({ productName: "", quantity: 0, unitPrice: 0, totalPrice: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
            <Button type="submit">Update Order</Button>
        </div>
      </form>
    </div>
  );
}
