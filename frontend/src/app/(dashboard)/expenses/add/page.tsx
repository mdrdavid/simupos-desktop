"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ExpenseForm, { type ExpenseFormValues } from "@/components/expenses/ExpenseForm"
import { useToast } from "@/hooks/use-toast"
import { useExpenses } from "@/context/ExpenseContext"

export default function AddExpensePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addExpense, loading } = useExpenses()

  const handleSubmit = async (form: ExpenseFormValues) => {
    if (!form.amount.trim() || !form.description.trim() || !form.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    if (isNaN(Number.parseFloat(form.amount))) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" })
      return
    }
    try {
      await addExpense({
        amount: Number.parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category,
        vendor: form.vendor.trim() || undefined,
        receiptNumber: form.receiptNumber.trim() || undefined,
        paymentMethod: form.paymentMethod,
        isRecurring: form.isRecurring,
        date: new Date().toISOString(),
        branchId: "",
      })
      toast({ title: "Success", description: "Expense added successfully" })
      router.push("/expenses")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Add Expense</h1>
          <div className="w-8" />
        </div>
        <ExpenseForm
          title="Expense Details"
          onSubmit={handleSubmit}
          submitting={loading}
          submitLabel="Add Expense"
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}
