/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanking } from '@/context/BankingContext';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  currentBalance: z.number().min(0, 'Opening balance cannot be negative'),
});

type NewBankAccountFormValues = z.infer<typeof formSchema>;

export function NewBankAccountForm() {
  const { createBankAccount } = useBanking();
  const router = useRouter();
  const form = useForm<NewBankAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: 0,
    },
  });

  const onSubmit = async (data: NewBankAccountFormValues) => {
    try {
      await createBankAccount({
        ...data,
        accountType: data.accountType as any,
      });
      toast({ title: "Account Created", description: "The bank account has been created successfully." });
      router.push('/accounting/banking');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create bank account.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <Label htmlFor="accountName">Account Name</Label>
        <Input id="accountName" {...form.register('accountName')} />
        {form.formState.errors.accountName && <p className="text-red-500">{form.formState.errors.accountName.message}</p>}
      </div>
      <div>
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input id="accountNumber" {...form.register('accountNumber')} />
        {form.formState.errors.accountNumber && <p className="text-red-500">{form.formState.errors.accountNumber.message}</p>}
      </div>
      <div>
        <Label htmlFor="bankName">Bank Name</Label>
        <Input id="bankName" {...form.register('bankName')} />
        {form.formState.errors.bankName && <p className="text-red-500">{form.formState.errors.bankName.message}</p>}
      </div>
      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Select onValueChange={(value) => form.setValue('accountType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Checking</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.accountType && <p className="text-red-500">{form.formState.errors.accountType.message}</p>}
      </div>
      <div>
        <Label htmlFor="currentBalance">Opening Balance</Label>
        <Input id="currentBalance" type="number" {...form.register('currentBalance', { valueAsNumber: true })} />
        {form.formState.errors.currentBalance && <p className="text-red-500">{form.formState.errors.currentBalance.message}</p>}
      </div>
      <Button type="submit">Create Account</Button>
    </form>
  );
}