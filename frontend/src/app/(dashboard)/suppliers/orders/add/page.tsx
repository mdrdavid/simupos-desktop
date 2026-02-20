"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useSupplier } from "@/context/SupplierContext";
import { CreateOrderData } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AddSupplierOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createOrder } = useSupplier();
  const supplierId = searchParams.get("supplierId");

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<CreateOrderData>({
    defaultValues: {
      supplierId: supplierId || "",
      items: [{ productName: "", quantity: 0, unitPrice: 0, totalPrice: 0, isNewItem: false }],
    },
  });

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
    if (!supplierId) {
      alert("Supplier ID is missing");
      return;
    }

    const processedItems = data.items.map(item => {
      if (item.isNewItem) {
        return {
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sellingPrice: item.sellingPrice,
          category: item.category,
          unit: item.unit,
          barcode: item.barcode,
          description: item.description,
          isNewItem: true,
        };
      }
      return {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      };
    });

    const orderData = {
      ...data,
      supplierId,
      items: processedItems,
    };

    await createOrder(orderData);
    router.push(`/suppliers/${supplierId}/orders`);
  };

  if (!supplierId) {
    return <div>Supplier ID not found in URL. Please go back and select a supplier.</div>;
  }

  return (
    <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
      <h1 className="text-3xl font-bold mb-6">Create New Order</h1>
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
              <div key={item.id} className="p-4 border rounded-lg mb-4">
                <div className="grid grid-cols-5 gap-4 items-center mb-4">
                  <Input placeholder="Product Name" {...register(`items.${index}.productName`, { required: true })} className="col-span-2" />
                  <Input type="number" placeholder="Quantity" {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true })} />
                  <Input type="number" placeholder="Unit Price" {...register(`items.${index}.unitPrice`, { required: true, valueAsNumber: true })} />
                  <Input readOnly placeholder="Total Price" {...register(`items.${index}.totalPrice`)} />
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id={`items.${index}.isNewItem`}
                    {...register(`items.${index}.isNewItem`)}
                    onCheckedChange={(checked) => {
                      setValue(`items.${index}.isNewItem`, !!checked);
                    }}
                  />
                  <Label htmlFor={`items.${index}.isNewItem`}>This is a new item</Label>
                </div>
                {watch(`items.${index}.isNewItem`) && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input placeholder="Selling Price" {...register(`items.${index}.sellingPrice`, { valueAsNumber: true })} />
                    <Input placeholder="Category" {...register(`items.${index}.category`)} />
                    <Input placeholder="Unit (e.g., kg, pcs)" {...register(`items.${index}.unit`)} />
                    <Input placeholder="Barcode" {...register(`items.${index}.barcode`)} />
                    <Input placeholder="Description" {...register(`items.${index}.description`)} className="col-span-2" />
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={() => append({ productName: "", quantity: 0, unitPrice: 0, totalPrice: 0, isNewItem: false })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
            <Button type="submit">Create Order</Button>
        </div>
      </form>
    </div>
  );
}
