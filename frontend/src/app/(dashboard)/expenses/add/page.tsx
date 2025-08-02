"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function AddExpensePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    vendor: "",
    receiptNumber: "",
    paymentMethod: "cash" as "cash" | "bank" | "mobile_money",
    isRecurring: false,
  })
  const [loading, setLoading] = useState(false)

  const categories = [
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

  const paymentMethods = [
    { key: "cash", label: "Cash", color: "bg-green-100 text-green-800" },
    { key: "bank", label: "Bank Transfer", color: "bg-blue-100 text-blue-800" },
    { key: "mobile_money", label: "Mobile Money", color: "bg-purple-100 text-purple-800" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number.parseFloat(formData.amount))) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const expense = {
        amount: Number.parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        vendor: formData.vendor.trim() || undefined,
        receiptNumber: formData.receiptNumber.trim() || undefined,
        paymentMethod: formData.paymentMethod,
        isRecurring: formData.isRecurring,
        date: new Date().toISOString(),
      }

      console.log("Creating expense:", expense)

      toast({
        title: "Success",
        description: "Expense added successfully",
      })

      router.push("/expenses")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-teal-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Expense</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (UGX) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Supplier (Optional)</Label>
                <Input
                  id="vendor"
                  placeholder="Who did you pay?"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number (Optional)</Label>
                <Input
                  id="receiptNumber"
                  placeholder="Receipt or invoice number"
                  value={formData.receiptNumber}
                  onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                  maxLength={20}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.key}
                    type="button"
                    variant={formData.paymentMethod === method.key ? "default" : "outline"}
                    className={`h-16 ${formData.paymentMethod !== method.key ? "bg-transparent" : ""}`}
                    onClick={() => handleInputChange("paymentMethod", method.key)}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{method.label}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="recurring">Recurring Expense</Label>
                  <p className="text-sm text-gray-600">This expense occurs regularly (monthly, weekly, etc.)</p>
                </div>
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
