"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWelding } from "@/context/WeldingContext";
import { WeldingMaterialStock } from "@/src/types/weldingMaterial";
import { TrendingUp } from "lucide-react";

const formSchema = z.object({
  quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
  supplierInfo: z.string().optional(),
});

type RestockFormValues = z.infer<typeof formSchema>;

interface RestockDialogProps {
  material: WeldingMaterialStock;
}

export function RestockDialog({ material }: RestockDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { restockMaterialItem } = useWelding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RestockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 0,
      supplierInfo: material.supplierInfo || "",
    },
  });

  const handleSubmit = async (values: RestockFormValues) => {
    setIsSubmitting(true);
    const success = await restockMaterialItem(
      material.id,
      values.quantity,
      values.supplierInfo
    );
    setIsSubmitting(false);
    if (success) {
      setIsOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          Restock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restock: {material.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Add</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Hardware" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Restocking..." : "Restock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
