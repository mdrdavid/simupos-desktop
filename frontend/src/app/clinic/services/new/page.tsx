/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClinic } from "@/context/ClinicContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Service } from "@/src/types/clinic"

export default function NewServicePage() {
  const router = useRouter()
  const { addService } = useClinic()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    fee: "",
    category: "" as Service["category"] | "",
    description: "",
    duration: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories: Service["category"][] = ["Consultation", "Lab", "ANC", "Procedure", "Vaccination", "Other"]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.fee || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const serviceData = {
        name: formData.name,
        fee: Number.parseFloat(formData.fee),
        category: formData.category as Service["category"],
        description: formData.description || undefined,
        duration: formData.duration ? Number.parseInt(formData.duration) : undefined,
        isActive: true,
      }

      addService(serviceData)

      toast({
        title: "Success",
        description: "Service added successfully",
      })

      router.push("/clinic/services")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-600">Create a new service for your clinic</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                placeholder="e.g., General Consultation"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Fee */}
            <div className="space-y-2">
              <Label htmlFor="fee">Fee (UGX) *</Label>
              <Input
                id="fee"
                type="number"
                placeholder="e.g., 50000"
                value={formData.fee}
                onChange={(e) => handleInputChange("fee", e.target.value)}
                required
                min="0"
                step="1000"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                min="1"
                max="480"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the service..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Service"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
