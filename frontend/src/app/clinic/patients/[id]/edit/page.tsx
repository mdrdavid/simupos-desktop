/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { patients, updatePatient, deletePatient } = useClinic();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "Male" | "Female" | "Other",
    age: "",
    phone: "",
    email: "",
    patientId: "",
    address: "",
    emergencyContact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patientId = params.id as string;

  useEffect(() => {
    const foundPatient = patients.find((p) => p.id === patientId);
    if (foundPatient) {
      setPatient(foundPatient);
      setFormData({
        name: foundPatient.name || "",
        gender: foundPatient.gender || "Male",
        age: foundPatient.age?.toString() || "",
        phone: foundPatient.phone || "",
        email: foundPatient.email || "",
        patientId: foundPatient.patientId || "",
        address: foundPatient.address || "",
        emergencyContact: foundPatient.emergencyContact || "",
      });
    }
    setIsLoading(false);
  }, [patientId, patients]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Patient name is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        newErrors.age = "Please enter a valid age (0-150)";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId = "Patient ID is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    setIsSaving(true);
    try {
      const updates = {
        name: formData.name.trim(),
        gender: formData.gender,
        age: parseInt(formData.age),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        patientId: formData.patientId.trim(),
        address: formData.address.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
      };

      await updatePatient(patientId, updates);

      toast({
        title: "Patient Updated",
        description: "Patient information has been successfully updated",
      });

      // Redirect to patient details page
      router.push(`/clinic/patients/${patientId}`);
    } catch (error: any) {
      console.error("Error updating patient:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update patient information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async () => {
    try {
      await deletePatient(patientId);
      toast({
        title: "Patient Deleted",
        description: "Patient has been successfully deleted",
      });
      router.push("/clinic/patients");
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Patient Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The patient you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/clinic/patients")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
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
            onClick={() => router.push(`/clinic/patients/${patientId}`)}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-gray-600 mt-1">
              Update patient information and details
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/clinic/patients/${patientId}`}>
              <Button variant="outline" className="border-gray-300">
                <Eye className="h-4 w-4 mr-2" />
                View Patient
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <User className="h-6 w-6 mr-3" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter patient's full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="patientId"
                        className="text-sm font-medium"
                      >
                        Patient ID *
                      </Label>
                      <Input
                        id="patientId"
                        value={formData.patientId}
                        onChange={(e) =>
                          handleInputChange("patientId", e.target.value)
                        }
                        placeholder="Enter unique patient ID"
                        className={errors.patientId ? "border-red-500" : ""}
                      />
                      {errors.patientId && (
                        <p className="text-red-500 text-sm">
                          {errors.patientId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Gender *
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: "Male" | "Female" | "Other") =>
                          handleInputChange("gender", value)
                        }
                      >
                        <SelectTrigger
                          className={errors.gender ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-red-500 text-sm">{errors.gender}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="150"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        placeholder="Enter age in years"
                        className={errors.age ? "border-red-500" : ""}
                      />
                      {errors.age && (
                        <p className="text-red-500 text-sm">{errors.age}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+256 XXX XXX XXX"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="patient@example.com"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Enter patient's full address"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContact"
                      className="text-sm font-medium"
                    >
                      Emergency Contact
                    </Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleInputChange("emergencyContact", e.target.value)
                      }
                      placeholder="Emergency contact name and phone"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push(`/clinic/patients/${patientId}`)
                      }
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg">
                  Patient Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registered:</span>
                  <span className="text-sm font-medium">
                    {formatDate(patient.createdAt)}
                  </span>
                </div>

                {patient.lastVisit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Visit:</span>
                    <span className="text-sm font-medium">
                      {formatDate(patient.lastVisit)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Link href={`/clinic/visits/new?patientId=${patientId}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Visit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/clinic/patients/${patientId}`}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Patient
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white hover:bg-blue-100"
                  onClick={() => window.open(`tel:${patient.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                {patient.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                    onClick={() => window.open(`mailto:${patient.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-0 shadow-sm bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900 text-lg">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete a patient, there is no going back. Please be
                  certain.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Patient
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{patient.name}
                        &quot;? This action cannot be undone and will
                        permanently remove all patient data including visit
                        history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeletePatient}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Patient
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
