"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

const materialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  unit: z.string().min(1, "Unit is required."),
  quantityInStock: z.coerce.number().min(0, "Quantity must be a positive number."),
  lowStockThreshold: z.coerce.number().min(0, "Threshold must be a positive number.").optional(),
  supplierInfo: z.string().optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  materials: z.array(materialSchema),
});

type BulkMaterialStockFormValues = z.infer<typeof formSchema>;

interface BulkMaterialStockFormProps {
  onSubmit: (values: BulkMaterialStockFormValues) => void;
  isSubmitting: boolean;
}

export function BulkMaterialStockForm({
  onSubmit,
  isSubmitting,
}: BulkMaterialStockFormProps) {
  const form = useForm<BulkMaterialStockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: [
        {
          name: "",
          unit: "",
          quantityInStock: 0,
          lowStockThreshold: 0,
          supplierInfo: "",
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Material #{index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mild Steel Rod" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`materials.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., kg, meters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`materials.${index}.quantityInStock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity in Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`materials.${index}.lowStockThreshold`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`materials.${index}.supplierInfo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Information</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ABC Hardware, Kampala"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`materials.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about this material"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    name: "",
                    unit: "",
                    quantityInStock: 0,
                    lowStockThreshold: 0,
                    supplierInfo: "",
                    notes: "",
                  })
                }
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Material
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Add Materials"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
