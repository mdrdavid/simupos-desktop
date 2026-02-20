"use client";

import { useForm } from "react-hook-form";
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
import { WeldingMaterialStock } from "@/src/types/weldingMaterial";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  unit: z.string().min(1, "Unit is required."),
  quantityInStock: z.coerce.number().min(0, "Quantity must be a positive number."),
  lowStockThreshold: z.coerce.number().min(0, "Threshold must be a positive number.").optional(),
  supplierInfo: z.string().optional(),
  notes: z.string().optional(),
});

type MaterialStockFormValues = z.infer<typeof formSchema>;

interface MaterialStockFormProps {
  initialData?: WeldingMaterialStock;
  onSubmit: (values: MaterialStockFormValues) => void;
  isSubmitting: boolean;
}

export function MaterialStockForm({
  initialData,
  onSubmit,
  isSubmitting,
}: MaterialStockFormProps) {
  const form = useForm<MaterialStockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      unit: "",
      quantityInStock: 0,
      lowStockThreshold: 0,
      supplierInfo: "",
      notes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Material" : "Add New Material"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., kg, meters, pieces" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantityInStock"
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
                name="lowStockThreshold"
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
              name="supplierInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Information</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Hardware, Kampala" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (initialData ? "Save Changes" : "Add Material")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
