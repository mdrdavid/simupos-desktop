"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  issueDate: z.date({ required_error: 'Issue date is required' }),
  dueDate: z.date({ required_error: 'Due date is required' }),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0.01, 'Unit price is required'),
  })).min(1, 'At least one line item is required'),
});

type NewBillFormValues = z.infer<typeof formSchema>;

export function NewBillForm() {
  const { createBill } = useAccountsPayable();
  const router = useRouter();
  const form = useForm<NewBillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const onSubmit = async (data: NewBillFormValues) => {
    try {
      const totalAmount = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      await createBill({
        ...data,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        totalAmount,
        lineItems: data.lineItems.map(item => ({ ...item, amount: item.quantity * item.unitPrice })),
        branchId: '',
        businessId: '',
        userId: '',
      });
      toast({ title: "Bill Created", description: "The bill has been created successfully." });
      router.push('/accounting/payables');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create bill.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <Label htmlFor="supplierId">Supplier</Label>
        <Input id="supplierId" {...form.register('supplierId')} />
        {form.formState.errors.supplierId && <p className="text-red-500">{form.formState.errors.supplierId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Issue Date</Label>
          <DatePicker
            date={form.watch('issueDate')}
            onDateChange={(date: Date | undefined) => form.setValue('issueDate', date as Date)}
          />
        </div>
        <div>
          <Label>Due Date</Label>
          <DatePicker
            date={form.watch('dueDate')}
            onDateChange={(date: Date | undefined) => form.setValue('dueDate', date as Date)}
          />
        </div>
      </div>

      <div>
        <Label>Line Items</Label>
        {form.watch('lineItems').map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input {...form.register(`lineItems.${index}.description`)} placeholder="Description" />
            <Input type="number" {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} placeholder="Quantity" />
            <Input type="number" {...form.register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} placeholder="Unit Price" />
          </div>
        ))}
      </div>

      <Button type="submit">Create Bill</Button>
    </form>
  );
}