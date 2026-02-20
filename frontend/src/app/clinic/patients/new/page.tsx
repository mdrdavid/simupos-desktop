"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { useToast } from "@/hooks/use-toast";
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
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient, patients } = useClinic();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    age: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatePatientId = () => {
    const prefix = "PAT";
    const existingIds = patients.map((p) => p.patientId);
    let newId = "";
    let counter = patients.length + 1;

    do {
      newId = `${prefix}${counter.toString().padStart(4, "0")}`;
      counter++;
    } while (existingIds.includes(newId));

    return newId;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Patient name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        newErrors.age = "Please enter a valid age (0-150)";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^07\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone =
        "Please enter a valid Ugandan phone number (07XXXXXXXX)";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.emergencyContact &&
      !/^07\d{8}$/.test(formData.emergencyContact.replace(/\s/g, ""))
    ) {
      newErrors.emergencyContact = "Please enter a valid Ugandan phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (value: string, field: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.startsWith("07") && cleaned.length <= 10) {
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
      }
    }

    handleInputChange(field, formatted.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        name: formData.name.trim(),
        gender: formData.gender as "Male" | "Female" | "Other",
        age: parseInt(formData.age),
        phone: formData.phone.replace(/\s/g, ""),
        email: formData.email.trim() || undefined,
        patientId: generatePatientId(),
        address: formData.address.trim() || undefined,
        emergencyContact:
          formData.emergencyContact.replace(/\s/g, "") || undefined,
      };

      addPatient(patientData);

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/clinic/patients");
      }, 2000);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      gender: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      notes: "",
    });
    setErrors({});
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Patient Added Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              The patient has been registered in the system and is now ready for
              visits.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to patients list...
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
              Register New Patient
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new patient to your clinic database
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <UserPlus className="h-6 w-6 mr-3" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Name */}
                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter patient's full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`h-11 border-gray-300 focus:border-blue-500 ${
                          errors.name
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        required
                      />
                      {errors.name && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label htmlFor="gender" className="text-sm font-semibold">
                        Gender *
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                        required
                      >
                        <SelectTrigger
                          className={`h-11 border-gray-300 focus:border-blue-500 ${
                            errors.gender
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">👨 Male</SelectItem>
                          <SelectItem value="Female">👩 Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.gender}
                        </div>
                      )}
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="age"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age in years"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        min="0"
                        max="150"
                        className={`h-11 border-gray-300 focus:border-blue-500 ${
                          errors.age
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        required
                      />
                      {errors.age && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.age}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="07X XXX XXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          handlePhoneChange(e.target.value, "phone")
                        }
                        className={`h-11 border-gray-300 focus:border-blue-500 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        required
                      />
                      {errors.phone && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="patient@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`h-11 border-gray-300 focus:border-blue-500 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.email && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="emergencyContact"
                        className="text-sm font-semibold"
                      >
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        placeholder="07X XXX XXXX"
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          handlePhoneChange(e.target.value, "emergencyContact")
                        }
                        className={`h-11 border-gray-300 focus:border-blue-500 ${
                          errors.emergencyContact
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.emergencyContact && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.emergencyContact}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter patient's physical address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="notes" className="text-sm font-semibold">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional medical notes or information..."
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 resize-none"
                      />
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
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="border-gray-300"
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registering...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Register Patient
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
            {/* Patient Preview */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900 text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Patient Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {formData.name ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {formData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {formData.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {generatePatientId()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {formData.gender && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-semibold">
                              {formData.gender}
                            </span>
                          </div>
                        )}

                        {formData.age && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-semibold">
                              {formData.age} years
                            </span>
                          </div>
                        )}

                        {formData.phone && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-semibold">
                              {formData.phone}
                            </span>
                          </div>
                        )}

                        {formData.email && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-semibold text-sm truncate">
                              {formData.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        Start filling the form to see a preview of the patient
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  📝 Registration Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Use the patient&apos;s full legal name for accurate records
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Verify phone numbers for SMS appointment reminders
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Complete addresses help with emergency situations
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Emergency contacts are crucial for critical situations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-sm bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900 text-lg">
                  📊 Clinic Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">
                    Total Patients:
                  </span>
                  <span className="font-semibold text-purple-900">
                    {patients.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800">
                    New This Month:
                  </span>
                  <span className="font-semibold text-purple-900">
                    {
                      patients.filter((p) => {
                        const monthAgo = new Date();
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return p.createdAt >= monthAgo;
                      }).length
                    }
                  </span>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-700">
                    Complete patient profiles improve care quality and record
                    keeping.
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
