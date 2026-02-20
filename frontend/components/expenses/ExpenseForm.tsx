/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Loader2, Plus } from "lucide-react"
import { useExpenses } from "@/context/ExpenseContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RecurringExpenseItem } from "@/src/types/recurring-expense-item"

type PaymentMethod = "cash" | "bank" | "mobile_money"

export type ExpenseFormValues = {
  amount: string
  description: string
  category: string
  vendor: string
  receiptNumber: string
  paymentMethod: PaymentMethod
  isRecurring: boolean
}

export type ExpenseFormProps = {
  title: string
  initialValues?: Partial<ExpenseFormValues>
  onSubmit: (values: ExpenseFormValues) => Promise<void> | void
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: string
}

const CATEGORIES = [
  "Inventory",
  "Utilities",
  "Rent",
  "Transport",
  "Marketing",
  "Equipment",
  "Staff",
  "Insurance",
  "Maintenance",
  "Other",
]

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "bank", label: "Bank Transfer" },
  { key: "mobile_money", label: "Mobile Money" },
]

export default function ExpenseForm({
  title,
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = "Save",
}: ExpenseFormProps) {
  const { recurringExpenseItems, addRecurringExpenseItem } = useExpenses();
  const [values, setValues] = useState<ExpenseFormValues>({
    amount: "",
    description: "",
    category: "",
    vendor: "",
    receiptNumber: "",
    paymentMethod: "cash",
    isRecurring: false,
  })
  const [isNewItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newRecurringItem, setNewRecurringItem] = useState({ name: '', category: '', defaultAmount: '' });

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      amount: initialValues?.amount ?? prev.amount,
      description: initialValues?.description ?? prev.description,
      category: initialValues?.category ?? prev.category,
      vendor: initialValues?.vendor ?? prev.vendor,
      receiptNumber: initialValues?.receiptNumber ?? prev.receiptNumber,
      paymentMethod: (initialValues?.paymentMethod as PaymentMethod) ?? prev.paymentMethod,
      isRecurring: initialValues?.isRecurring ?? prev.isRecurring,
    }))
  }, [initialValues])

  const setField = (field: keyof ExpenseFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value as never }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(values)
  }

  const handleAddNewRecurringItem = async () => {
    if (!newRecurringItem.name || !newRecurringItem.category || !newRecurringItem.defaultAmount) {
      // Basic validation
      return;
    }
    const newItem = await addRecurringExpenseItem({
      name: newRecurringItem.name,
      category: newRecurringItem.category,
      defaultAmount: parseFloat(newRecurringItem.defaultAmount),
    });
    if (newItem) {
      handleRecurringItemSelected(newItem.id);
    }
    setNewItemDialogOpen(false);
    setNewRecurringItem({ name: '', category: '', defaultAmount: '' });
  };

  const handleRecurringItemSelected = (itemId: string) => {
    const selected = recurringExpenseItems.find(it => it.id === itemId);
    if (selected) {
      setValues(prev => ({
        ...prev,
        description: selected.name,
        category: selected.category,
        amount: selected.defaultAmount.toString(),
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">UGX</span>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  className="pl-14"
                  value={values.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={values.category} onValueChange={(v) => setField("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor/Supplier (Optional)</Label>
              <Input
                id="vendor"
                placeholder="Who did you pay?"
                value={values.vendor}
                onChange={(e) => setField("vendor", e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number (Optional)</Label>
              <Input
                id="receiptNumber"
                placeholder="Receipt or invoice number"
                value={values.receiptNumber}
                onChange={(e) => setField("receiptNumber", e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment & Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {PAYMENT_METHODS.map((m) => (
              <Button
                key={m.key}
                type="button"
                variant={values.paymentMethod === m.key ? "default" : "outline"}
                className={`h-12 ${values.paymentMethod !== m.key ? "bg-transparent" : ""}`}
                onClick={() => setField("paymentMethod", m.key)}
              >
                {m.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="recurring">Recurring Expense</Label>
              <p className="text-sm text-gray-600">Occurs regularly (monthly, weekly, etc.)</p>
            </div>
            <Switch
              id="recurring"
              checked={values.isRecurring}
              onCheckedChange={(checked) => setField("isRecurring", checked)}
            />
          </div>

          {values.isRecurring && (
            <div className="mt-4">
              <Label>Select Recurring Expense</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={handleRecurringItemSelected}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recurring expense" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringExpenseItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isNewItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" /> New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Recurring Expense Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-item-name">Name</Label>
                        <Input
                          id="new-item-name"
                          value={newRecurringItem.name}
                          onChange={(e) => setNewRecurringItem({ ...newRecurringItem, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-item-category">Category</Label>
                        <Select
                          value={newRecurringItem.category}
                          onValueChange={(v) => setNewRecurringItem({ ...newRecurringItem, category: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-item-amount">Default Amount</Label>
                        <Input
                          id="new-item-amount"
                          type="number"
                          value={newRecurringItem.defaultAmount}
                          onChange={(e) => setNewRecurringItem({ ...newRecurringItem, defaultAmount: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddNewRecurringItem} className="w-full">Add Item</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent">
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}


