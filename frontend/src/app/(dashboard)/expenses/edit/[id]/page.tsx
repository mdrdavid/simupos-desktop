/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpenseForm, {
  type ExpenseFormValues,
} from "@/components/expenses/ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/context/ExpenseContext";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { expenses, updateExpense, loading } = useExpenses();

  const [formData, setFormData] = useState<ExpenseFormValues>({
    amount: "",
    description: "",
    category: "",
    vendor: "",
    receiptNumber: "",
    paymentMethod: "cash",
    isRecurring: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Find the expense to edit
  const expenseId = params.id as string;
  const expense = expenses.find((exp) => exp.id === expenseId);

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        vendor: expense.vendor || "",
        receiptNumber: expense.receiptNumber || "",
        paymentMethod: expense.paymentMethod,
        isRecurring: expense.isRecurring,
      });
      setIsLoading(false);
    } else if (expenses.length > 0) {
      // If expenses are loaded but the specific expense is not found
      toast({
        title: "Error",
        description: "Expense not found",
        variant: "destructive",
      });
      router.push("/expenses");
    }
  }, [expense, expenses, toast, router]);

  const removeUndefined = (obj: any) => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach((key) =>
      cleaned[key] === undefined ? delete cleaned[key] : {}
    );
    return cleaned;
  };
  const handleSubmit = async (form: ExpenseFormValues) => {
    if (!form.amount.trim() || !form.description.trim() || !form.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(Number.parseFloat(form.amount))) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!expense) {
      toast({
        title: "Error",
        description: "Expense not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // const updatedExpenseData = {
      //   amount: Number.parseFloat(form.amount),
      //   description: form.description.trim(),
      //   category: form.category,
      //   vendor: form.vendor.trim() || undefined,
      //   receipt: form.receiptNumber.trim() || undefined,
      //   paymentMethod: form.paymentMethod,
      //   isRecurring: form.isRecurring,
      //   title: form.description.trim(),
      //   expenseDate: new Date().toISOString(),
      // };
      const updatedExpenseData = removeUndefined({
        amount: Number.parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category,
        vendor: form.vendor.trim() || undefined,
        receipt: form.receiptNumber.trim() || undefined,
        paymentMethod: form.paymentMethod,
        isRecurring: form.isRecurring,
        title: form.description.trim(),
        expenseDate: new Date().toISOString(),
      });
      await updateExpense(expenseId, updatedExpenseData);

      toast({
        title: "Success",
        description: "Expense updated successfully",
      });

      router.push("/expenses");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading expense...</span>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Expense not found
          </h2>
          <p className="text-gray-600 mb-4">
            The expense you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/expenses")}>
            Back to Expenses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Edit Expense</h1>
          <div className="w-8" />
        </div>
        <ExpenseForm
          title="Expense Details"
          initialValues={formData}
          onSubmit={handleSubmit}
          submitting={loading}
          submitLabel="Update Expense"
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
