/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Stethoscope,
  DollarSign,
  Clock,
  FileText,
  Tag,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/src/types/clinic";
import { Badge } from "@/components/ui/badge";

export default function NewServicePage() {
  const router = useRouter();
  const { addService, services } = useClinic();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    fee: "",
    category: "" as Service["category"] | "",
    description: "",
    duration: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories: Service["category"][] = [
    "Consultation",
    "Lab",
    "ANC",
    "Procedure",
    "Vaccination",
    "Other",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.fee || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const fee = Number.parseFloat(formData.fee);
    if (fee < 0) {
      toast({
        title: "Invalid Fee",
        description: "Service fee cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        name: formData.name,
        fee: fee,
        category: formData.category as Service["category"],
        description: formData.description || undefined,
        duration: formData.duration
          ? Number.parseInt(formData.duration)
          : undefined,
        isActive: true,
      };

      addService(serviceData);

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/clinic/services");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Consultation":
        return "🩺";
      case "Lab":
        return "🧪";
      case "ANC":
        return "🤰";
      case "Procedure":
        return "🔧";
      case "Vaccination":
        return "💉";
      default:
        return "📋";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Consultation":
        return "border-blue-400 bg-blue-50";
      case "Lab":
        return "border-green-400 bg-green-50";
      case "ANC":
        return "border-pink-400 bg-pink-50";
      case "Procedure":
        return "border-purple-400 bg-purple-50";
      case "Vaccination":
        return "border-orange-400 bg-orange-50";
      default:
        return "border-gray-400 bg-gray-50";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate suggested fee based on similar services
  const getSuggestedFee = () => {
    if (!formData.category) return null;

    const similarServices = services.filter(
      (s) => s.category === formData.category
    );
    if (similarServices.length === 0) return null;

    const averageFee =
      similarServices.reduce((sum, service) => sum + service.fee, 0) /
      similarServices.length;
    return Math.round(averageFee / 1000) * 1000; // Round to nearest 1000
  };

  const suggestedFee = getSuggestedFee();

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Service Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Your new service has been added successfully and is now available
              for patient visits.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to services...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Service
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new medical service to your clinic&apos;s offerings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <Stethoscope className="h-6 w-6 mr-3" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Service Name */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Service Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., General Consultation, Laboratory Test, Ultrasound"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Choose a clear, descriptive name that patients will
                        understand
                      </p>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                        required
                      >
                        <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                          <SelectValue placeholder="Select service category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getCategoryIcon(category)}
                                </span>
                                <span>{category}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Categorizing helps organize services and generate better
                        reports
                      </p>
                    </div>

                    {/* Fee */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="fee"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Service Fee (UGX) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="fee"
                          type="number"
                          placeholder="0"
                          value={formData.fee}
                          onChange={(e) =>
                            handleInputChange("fee", e.target.value)
                          }
                          className="h-11 border-gray-300 focus:border-blue-500 pl-12"
                          required
                          min="0"
                          step="1000"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          UGX
                        </span>
                      </div>
                      {suggestedFee && formData.category && !formData.fee && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                          <Lightbulb className="h-4 w-4" />
                          <span>
                            Suggested fee for {formData.category}:{" "}
                            {formatCurrency(suggestedFee)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleInputChange("fee", suggestedFee.toString())
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Use
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Set a competitive price that reflects the value of your
                        service
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="duration"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 30"
                        value={formData.duration}
                        onChange={(e) =>
                          handleInputChange("duration", e.target.value)
                        }
                        className="h-11 border-gray-300 focus:border-blue-500"
                        min="1"
                        max="480"
                      />
                      <p className="text-xs text-gray-500">
                        Estimated time required to complete this service. Helps
                        with scheduling.
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this service includes, any preparation required, or specific details patients should know..."
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        className="border-gray-300 focus:border-blue-500 resize-none"
                      />
                      <p className="text-xs text-gray-500">
                        Clear descriptions help patients understand what to
                        expect from this service
                      </p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Service
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Preview */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900 text-lg">
                  <Eye className="h-5 w-5 mr-2" />
                  Service Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {formData.name ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {formData.category
                            ? getCategoryIcon(formData.category)
                            : "📋"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {formData.name}
                          </h3>
                          {formData.category && (
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(formData.category)}`}
                            >
                              {formData.category}
                            </div>
                          )}
                        </div>
                      </div>

                      {formData.fee && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Fee:</span>
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(Number.parseFloat(formData.fee))}
                          </span>
                        </div>
                      )}

                      {formData.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duration:</span>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formData.duration} minutes</span>
                          </div>
                        </div>
                      )}

                      {formData.description && (
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {formData.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        Start filling the form to see a preview of your service
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  <Lightbulb className="h-5 w-5 mr-2 inline" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Research competitor pricing for similar services in your
                    area
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Include realistic duration estimates for better scheduling
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Clear descriptions reduce patient confusion and questions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Consistent categorization helps with reporting and analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900 text-lg">
                  Clinic Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">
                    Total Services:
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    {services.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">Categories:</span>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    {new Set(services.map((s) => s.category)).size}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-700">
                    Adding diverse services helps attract more patients to your
                    clinic.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
