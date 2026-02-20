"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, Save, UserPlus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useCRM } from "@/context/CRMContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export default function AddProfessionalCustomerPage() {
  const router = useRouter()
  const { addCustomer } = useCRM()
  const { currentBranchId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    customerType: "Regular" as "Regular" | "VIP" | "Wholesale",
    notes: "",
  })
  const [birthday, setBirthday] = useState<Date>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please correct the errors in the form")
      return
    }

    if (!currentBranchId) {
      toast.error("Branch session not found. Please reload.")
      return
    }

    setLoading(true)
    try {
      const customerData = {
        ...formData,
        birthday: birthday ? birthday.toISOString().split("T")[0] : undefined,
      }

      await addCustomer(customerData)
      toast.success("Customer profile created successfully")
      router.push("/professional-hub/crm")
    } catch (error) {
      toast.error("Failed to add customer. Please try again.")
      console.error("Add customer error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/professional-hub/crm">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Register New Customer</h1>
          <p className="text-gray-500 mt-1">Establish a new professional relationship</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-primary" />
                <div>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                    <CardDescription>Primary identification and contact information</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name <span className="text-red-500">*</span></Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. John Doe"
                    className={cn(
                        "h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary",
                        errors.name && "border-red-500 bg-red-50/30"
                    )}
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g. +256..."
                    className={cn(
                        "h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary",
                        errors.phone && "border-red-500 bg-red-50/30"
                    )}
                />
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="e.g. john@example.com"
                    className={cn(
                        "h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary",
                        errors.email && "border-red-500 bg-red-50/30"
                    )}
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                <Label className="text-sm font-semibold">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary">
                    <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 {/* Birthday */}
                <div className="space-y-2">
                <Label className="text-sm font-semibold">Birthday</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal h-11 border-gray-200 hover:bg-gray-50",
                            !birthday && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary" />
                        {birthday ? format(birthday, "PPP") : "Select date"}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={birthday}
                        onSelect={setBirthday}
                        disabled={(date) => date > new Date()}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                </div>

                {/* Customer Type */}
                <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Customer Classification</Label>
                <Select value={formData.customerType} onValueChange={(value) => handleInputChange("customerType", value)}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Regular">Regular Customer</SelectItem>
                    <SelectItem value="VIP">VIP Client</SelectItem>
                    <SelectItem value="Wholesale">Wholesale Partner</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
           <CardHeader className="bg-gray-50/50 border-b border-gray-100">
             <CardTitle className="text-lg">Additional Information</CardTitle>
             <CardDescription>Internal notes and preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Notes & Special Requirements</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter any specific preferences, background info or special requirements..."
                className="min-h-[120px] border-gray-200 focus:border-brand-primary focus:ring-brand-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Link href="/professional-hub/crm" className="w-full sm:w-auto">
                <Button variant="ghost" type="button" className="w-full sm:w-auto text-gray-500 hover:text-gray-700">
                    Discard Changes
                </Button>
            </Link>
            <Button
                type="submit"
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white px-8 h-11 font-semibold transition-all shadow-sm"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        <span>Register Customer</span>
                    </div>
                )}
            </Button>
        </div>
      </form>
    </div>
  )
}
