"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookkeeping } from '@/context/BookkeepingContext';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type NewExpenseCategoryFormValues = z.infer<typeof formSchema>;

export function NewExpenseCategoryForm() {
  const { createExpenseCategory } = useBookkeeping();
  const router = useRouter();
  const form = useForm<NewExpenseCategoryFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: NewExpenseCategoryFormValues) => {
    try {
      await createExpenseCategory(data);
      toast({ title: "Category Created", description: "The expense category has been created successfully." });
      router.push('/accounting/expenses');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create category.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && <p className="text-red-500">{form.formState.errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register('description')} />
      </div>
      <Button type="submit">Create Category</Button>
    </form>
  );
}