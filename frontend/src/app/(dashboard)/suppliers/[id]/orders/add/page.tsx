/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useSupplier } from "@/context/SupplierContext";
import { CreateOrderData } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AddSupplierOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { createOrder } = useSupplier();
  const supplierId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<CreateOrderData>({
    defaultValues: {
      supplierId: supplierId || "",
      items: [{ productName: "", quantity: 0, unitPrice: 0, totalPrice: 0 }],
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

    setIsLoading(true);
    
    try {
      const orderData = { ...data, supplierId };
      await createOrder(orderData);
      
      toast({
        title: "Success",
        description: "Order created successfully.",
      });
      
      router.push(`/suppliers/${supplierId}/orders`);
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!supplierId) {
    return <div>Supplier ID not found in URL. Please go back and select a supplier.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => router.back()} 
        className="mb-4"
        disabled={isLoading}
      >
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
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input 
                type="date" 
                {...register("date", { required: true })} 
                disabled={isLoading}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">Date is required</p>}
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
                <Input 
                  placeholder="Product Name" 
                  {...register(`items.${index}.productName`, { required: true })} 
                  className="col-span-2" 
                  disabled={isLoading}
                />
                <Input 
                  type="number" 
                  placeholder="Quantity" 
                  {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true, min: 0 })} 
                  disabled={isLoading}
                />
                <Input 
                  type="number" 
                  placeholder="Unit Price" 
                  {...register(`items.${index}.unitPrice`, { required: true, valueAsNumber: true, min: 0 })} 
                  disabled={isLoading}
                />
                <Input 
                  readOnly 
                  placeholder="Total Price" 
                  {...register(`items.${index}.totalPrice`)} 
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => remove(index)}
                  disabled={isLoading || fields.length === 1}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {errors.items && (
              <p className="text-red-500 text-sm mb-4">
                Please fill in all required fields for order items
              </p>
            )}
            
            <Button
              type="button"
              onClick={() => append({ productName: "", quantity: 0, unitPrice: 0, totalPrice: 0 })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}