/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  FileText,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Visit, Service, Medicine } from "@/src/types/clinic";

interface VisitServiceForm {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface VisitMedicineForm {
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dosage?: string;
  instructions?: string;
}

export default function EditVisitPage() {
  const params = useParams();
  const router = useRouter();
  const { getVisit, updateVisit, services, medicines, patients } = useClinic();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    diagnosisNotes: "",
    attendingStaff: "",
    paymentMethod: "Cash" as "Cash" | "Insurance" | "Credit" | "Mobile Money",
  });
  const [visitServices, setVisitServices] = useState<VisitServiceForm[]>([]);
  const [visitMedicines, setVisitMedicines] = useState<VisitMedicineForm[]>([]);

  const visitId = params.id as string;

  useEffect(() => {
    const fetchVisitDetails = async () => {
      try {
        setIsLoading(true);
        const visitData = await getVisit(visitId);
        setVisit(visitData);

        // Initialize form data
        setFormData({
          diagnosisNotes: visitData.diagnosisNotes || "",
          attendingStaff: visitData.attendingStaff || "",
          paymentMethod: visitData.paymentMethod || "Cash",
        });

        // Initialize services
        const servicesData =
          (visitData as any).visitServices || visitData.services || [];
        setVisitServices(
          servicesData.map((service: any) => ({
            serviceId: service.serviceId || service.service?.id,
            quantity: service.quantity || 1,
            unitPrice: service.unitPrice || service.service?.fee || 0,
            totalPrice:
              service.totalPrice || service.unitPrice * service.quantity || 0,
            notes: service.notes || "",
          }))
        );

        // Initialize medicines
        const medicinesData =
          (visitData as any).visitMedicines || visitData.medicines || [];
        setVisitMedicines(
          medicinesData.map((medicine: any) => ({
            medicineId: medicine.medicineId || medicine.medicine?.id,
            quantity: medicine.quantity || 1,
            unitPrice: medicine.unitPrice || medicine.medicine?.unitPrice || 0,
            totalPrice:
              medicine.totalPrice ||
              medicine.unitPrice * medicine.quantity ||
              0,
            dosage: medicine.dosage || "",
            instructions: medicine.instructions || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching visit:", error);
        toast({
          title: "Visit Not Found",
          description: "The requested visit could not be found.",
          variant: "destructive",
        });
        router.push("/clinic/visits");
      } finally {
        setIsLoading(false);
      }
    };

    if (visitId) {
      fetchVisitDetails();
    }
  }, [visitId, getVisit, router, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || `Service ${serviceId}`;
  };

  const getMedicineName = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    return medicine?.name || `Medicine ${medicineId}`;
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || `Patient ${patientId}`;
  };

  const handleAddService = () => {
    setVisitServices([
      ...visitServices,
      {
        serviceId: services[0]?.id || "",
        quantity: 1,
        unitPrice: services[0]?.fee || 0,
        totalPrice: services[0]?.fee || 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    setVisitServices(visitServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...visitServices];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    // Recalculate total price if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const service = updatedServices[index];
      updatedServices[index].totalPrice = service.quantity * service.unitPrice;
    }

    setVisitServices(updatedServices);
  };

  const handleAddMedicine = () => {
    setVisitMedicines([
      ...visitMedicines,
      {
        medicineId: medicines[0]?.id || "",
        quantity: 1,
        unitPrice: medicines[0]?.unitPrice || 0,
        totalPrice: medicines[0]?.unitPrice || 0,
        dosage: "",
        instructions: "",
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setVisitMedicines(visitMedicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const updatedMedicines = [...visitMedicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };

    // Recalculate total price if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const medicine = updatedMedicines[index];
      updatedMedicines[index].totalPrice =
        medicine.quantity * medicine.unitPrice;
    }

    setVisitMedicines(updatedMedicines);
  };

  const calculateTotals = () => {
    const servicesTotal = visitServices.reduce(
      (sum, service) => sum + service.totalPrice,
      0
    );
    const medicinesTotal = visitMedicines.reduce(
      (sum, medicine) => sum + medicine.totalPrice,
      0
    );
    const subtotal = servicesTotal + medicinesTotal;
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;

    return { servicesTotal, medicinesTotal, subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visit) return;

    try {
      setIsSaving(true);

      const { subtotal, tax, total } = calculateTotals();

      const updateData: Partial<Visit> = {
        diagnosisNotes: formData.diagnosisNotes,
        attendingStaff: formData.attendingStaff,
        paymentMethod: formData.paymentMethod,
        subtotal,
        tax,
        total,
        services: visitServices.map((service) => ({
          serviceId: service.serviceId,
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          totalPrice: service.totalPrice,
          notes: service.notes,
        })),
        medicines: visitMedicines.map((medicine) => ({
          medicineId: medicine.medicineId,
          quantity: medicine.quantity,
          unitPrice: medicine.unitPrice,
          totalPrice: medicine.totalPrice,
          dosage: medicine.dosage,
          instructions: medicine.instructions,
        })),
      };

      await updateVisit(visit.id, updateData);

      toast({
        title: "Visit Updated",
        description: "The visit has been successfully updated.",
      });

      router.push(`/clinic/visits/${visit.id}`);
    } catch (error) {
      console.error("Error updating visit:", error);
      toast({
        title: "Error",
        description: "Failed to update visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Visit Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested visit could not be found.
            </p>
            <Button onClick={() => router.push("/clinic/visits")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Visits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { servicesTotal, medicinesTotal, subtotal, tax, total } =
    calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clinic/visits/${visit.id}`)}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Edit Visit</h1>
            <p className="text-gray-600 mt-1">
              Visit ID: {visit.id} • Patient: {getPatientName(visit.patientId)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                  <CardTitle className="flex items-center text-blue-900">
                    <User className="h-6 w-6 mr-3" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {getPatientName(visit.patientId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Patient ID: {visit.patientId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Visit Date: {formatDate(visit.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services & Procedures */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-green-900">
                      <Stethoscope className="h-6 w-6 mr-3" />
                      Services & Procedures
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddService}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {visitServices.length > 0 ? (
                    <div className="space-y-4">
                      {visitServices.map((service, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border border-gray-200 rounded-lg space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              Service #{index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveService(index)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service
                              </label>
                              <select
                                value={service.serviceId}
                                onChange={(e) =>
                                  handleServiceChange(
                                    index,
                                    "serviceId",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select a service</option>
                                {services.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} - {formatCurrency(s.fee)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={service.quantity}
                                onChange={(e) =>
                                  handleServiceChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price (UGX)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={service.unitPrice}
                                onChange={(e) =>
                                  handleServiceChange(
                                    index,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Price
                              </label>
                              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(service.totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={service.notes}
                              onChange={(e) =>
                                handleServiceChange(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Additional notes about this service..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No services added</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddService}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Service
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medicines & Prescriptions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-purple-900">
                      <Pill className="h-6 w-6 mr-3" />
                      Medicines & Prescriptions
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMedicine}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medicine
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {visitMedicines.length > 0 ? (
                    <div className="space-y-4">
                      {visitMedicines.map((medicine, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border border-gray-200 rounded-lg space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              Medicine #{index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMedicine(index)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medicine
                              </label>
                              <select
                                value={medicine.medicineId}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "medicineId",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select a medicine</option>
                                {medicines.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} - {formatCurrency(m.unitPrice)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={medicine.quantity}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price (UGX)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={medicine.unitPrice}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Price
                              </label>
                              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(medicine.totalPrice)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage
                              </label>
                              <input
                                type="text"
                                value={medicine.dosage}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "dosage",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 500mg twice daily"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instructions
                              </label>
                              <input
                                type="text"
                                value={medicine.instructions}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "instructions",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Take after meals"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No medicines added</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddMedicine}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Medicine
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Notes */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-100">
                  <CardTitle className="flex items-center text-orange-900">
                    <FileText className="h-6 w-6 mr-3" />
                    Clinical Notes & Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis Notes
                    </label>
                    <textarea
                      value={formData.diagnosisNotes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diagnosisNotes: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter clinical notes, diagnosis, treatment plan, and any other relevant medical information..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Visit Information */}
              <Card className="border-0 shadow-sm bg-white sticky top-6">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <FileText className="h-6 w-6 mr-3" />
                    Visit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Attending Staff */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attending Staff
                      </label>
                      <input
                        type="text"
                        value={formData.attendingStaff}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attendingStaff: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter staff name"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value as
                              | "Cash"
                              | "Insurance"
                              | "Credit"
                              | "Mobile Money",
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Credit">Credit</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                    </div>

                    <Separator />

                    {/* Bill Summary */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Bill Summary
                      </h4>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Services:</span>
                        <span className="font-semibold">
                          {formatCurrency(servicesTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Medicines:</span>
                        <span className="font-semibold">
                          {formatCurrency(medicinesTotal)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tax (18%):</span>
                        <span className="font-semibold">
                          {formatCurrency(tax)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-green-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          router.push(`/clinic/visits/${visit.id}`)
                        }
                        className="w-full border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
