/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Download,
  Printer,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Mail as MailIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Visit } from "@/src/types/clinic";

export default function VisitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getVisit, updateVisit } = useClinic();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [visit, setVisit] = useState<Visit | null>(null);

  const visitId = params.id as string;

  useEffect(() => {
    const fetchVisitDetails = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching visit with ID:", visitId);

        const visitData = await getVisit(visitId);
        console.log("Fetched visit data:", visitData);

        setVisit(visitData);
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

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const getStatusColor = (status: Visit["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Billed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Visit["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Open":
        return <Clock className="h-4 w-4" />;
      case "Billed":
        return <DollarSign className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = async (newStatus: Visit["status"]) => {
    if (!visit) return;

    try {
      await updateVisit(visit.id, { status: newStatus });

      // Refresh the visit data after status update
      const updatedVisit = await getVisit(visit.id);
      setVisit(updatedVisit);

      toast({
        title: "Status Updated",
        description: `Visit status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating visit status:", error);
      toast({
        title: "Error",
        description: "Failed to update visit status",
        variant: "destructive",
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Helper function to get services array (handles both property names)
  const getServices = () => {
    if (!visit) return [];

    // Try visitServices first, then services as fallback
    return (visit as any).visitServices || visit.services || [];
  };

  // Helper function to get medicines array (handles both property names)
  const getMedicines = () => {
    if (!visit) return [];

    // Try visitMedicines first, then medicines as fallback
    return (visit as any).visitMedicines || visit.medicines || [];
  };

  // Calculate totals using the helper functions
  const servicesTotal = getServices().reduce(
    (sum: number, service: any) =>
      sum + (service.totalPrice || service.unitPrice * service.quantity || 0),
    0
  );

  const medicinesTotal = getMedicines().reduce(
    (sum: number, medicine: any) =>
      sum +
      (medicine.totalPrice || medicine.unitPrice * medicine.quantity || 0),
    0
  );

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
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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

  const services = getServices();
  const medicines = getMedicines();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300 no-print"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Visit Details</h1>
            <p className="text-gray-600 mt-1">Visit ID: {visit.id}</p>
          </div>
          <div className="flex items-center gap-3 no-print">
            <Link href={`/clinic/visits/${visit.id}/edit`}>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Visit
              </Button>
            </Link>
            <Button variant="outline" className="border-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              Email Receipt
            </Button>
            <Button variant="outline" className="border-gray-300">
              <MessageCircle className="h-4 w-4 mr-2" />
              SMS Receipt
            </Button>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handlePrintReceipt}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

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
                {visit.patient ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {visit.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Patient ID: {visit.patient.patientId}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {visit.patient.age} years old
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {visit.patient.gender}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {visit.patient.phone}
                          </span>
                        </div>
                        {visit.patient.email && (
                          <div className="flex items-center gap-3">
                            <MailIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {visit.patient.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {visit.patient.address && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Address
                            </p>
                            <p className="text-sm text-gray-600">
                              {visit.patient.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Patient information not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services & Procedures */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900">
                  <Stethoscope className="h-6 w-6 mr-3" />
                  Services & Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service: any, index: number) => (
                      <div
                        key={service.id || index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {service.service?.name ||
                                `Service ${service.serviceId}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {service.quantity} ×{" "}
                              {formatCurrency(service.unitPrice || 0)}
                            </p>
                            {service.notes && (
                              <p className="text-sm text-gray-500 mt-1">
                                {service.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(
                              service.totalPrice ||
                                service.unitPrice * service.quantity ||
                                0
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No services recorded for this visit</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medicines & Prescriptions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
                <CardTitle className="flex items-center text-purple-900">
                  <Pill className="h-6 w-6 mr-3" />
                  Medicines & Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {medicines.length > 0 ? (
                  <div className="space-y-4">
                    {medicines.map((medicine: any, index: number) => (
                      <div
                        key={medicine.id || index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Pill className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {medicine.medicine?.name ||
                                `Medicine ${medicine.medicineId}`}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Quantity: {medicine.quantity} ×{" "}
                                {formatCurrency(medicine.unitPrice || 0)}
                              </span>
                              {medicine.dosage && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-600">
                                    Dosage: {medicine.dosage}
                                  </span>
                                </>
                              )}
                            </div>
                            {medicine.instructions && (
                              <p className="text-sm text-gray-500 mt-1">
                                Instructions: {medicine.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(
                              medicine.totalPrice ||
                                medicine.unitPrice * medicine.quantity ||
                                0
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No medicines prescribed for this visit</p>
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
                {visit.diagnosisNotes ? (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {visit.diagnosisNotes}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No clinical notes recorded for this visit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Visit Summary */}
            <Card className="border-0 shadow-sm bg-white sticky top-6">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                <CardTitle className="flex items-center text-gray-900">
                  <FileText className="h-6 w-6 mr-3" />
                  Visit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <Badge
                      variant="outline"
                      className={getStatusColor(visit.status)}
                    >
                      {getStatusIcon(visit.status)}
                      <span className="ml-1">{visit.status}</span>
                    </Badge>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Visit Date:
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(visit.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Time:
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDateTime(visit.createdAt)}
                    </span>
                  </div>

                  {/* Attending Staff */}
                  {visit.attendingStaff && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Staff:
                      </span>
                      <span className="text-sm text-gray-900">
                        {visit.attendingStaff}
                      </span>
                    </div>
                  )}

                  {/* Payment Method */}
                  {visit.paymentMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Payment:
                      </span>
                      <span className="text-sm text-gray-900">
                        {visit.paymentMethod}
                      </span>
                    </div>
                  )}

                  <Separator />

                  {/* Bill Summary */}
                  <div className="space-y-2">
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
                        {formatCurrency(visit.subtotal || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">
                        {formatCurrency(visit.tax || 0)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-green-600">
                        {formatCurrency(visit.total || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="space-y-2 pt-4 no-print">
                    {visit.status === "Open" && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus("Billed")}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          Mark as Billed
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus("Completed")}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Complete Visit
                        </Button>
                      </>
                    )}
                    {visit.status === "Billed" && (
                      <Button
                        onClick={() => handleUpdateStatus("Completed")}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Complete Visit
                      </Button>
                    )}
                    {(visit.status === "Open" || visit.status === "Billed") && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus("Cancelled")}
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Cancel Visit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 no-print">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/clinic/visits/${visit.id}/edit`}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Visit
                  </Button>
                </Link>
                <Link href={`/clinic/patients/${visit.patientId}`}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Patient
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white hover:bg-blue-100"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Follow-up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          .bg-gradient-to-br {
            background: white !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}
