/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Stethoscope,
  Pill,
  DollarSign,
  Eye,
  Plus,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { patients, getPatientVisits, updatePatient } = useClinic();

  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const patientId = params.id as string;

  useEffect(() => {
    let mounted = true;

    const loadPatient = async () => {
      try {
        const foundPatient = patients.find((p) => p.id === patientId);
        if (foundPatient) {
          if (mounted) setPatient(foundPatient);
          const patientVisits = await getPatientVisits(patientId);
          if (mounted) setVisits(patientVisits);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadPatient();

    return () => {
      mounted = false;
    };
  }, [patientId, patients, getPatientVisits]);

  const formatDate = (date: Date | string) => {
    // Handle both Date objects and string dates safely
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  const formatDateTime = (date: Date | string) => {
    // Handle both Date objects and string dates safely
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-UG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Female":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "Billed":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculatePatientStats = () => {
    const totalVisits = visits.length;
    const completedVisits = visits.filter(
      (v) => v.status === "Completed"
    ).length;
    const totalSpent = visits.reduce((sum, visit) => sum + visit.total, 0);

    // Safely handle last visit date calculation
    let lastVisit = null;
    if (visits.length > 0) {
      const validDates = visits
        .map((v) => {
          const date =
            typeof v.createdAt === "string"
              ? new Date(v.createdAt)
              : v.createdAt;
          return isNaN(date.getTime()) ? null : date;
        })
        .filter((date) => date !== null);

      if (validDates.length > 0) {
        lastVisit = new Date(Math.max(...validDates.map((d) => d.getTime())));
      }
    }

    return {
      totalVisits,
      completedVisits,
      totalSpent,
      lastVisit,
      averageSpent: totalVisits > 0 ? totalSpent / totalVisits : 0,
    };
  };

  const stats = calculatePatientStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
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
              <AlertCircle className="h-8 w-8 text-red-600" />
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/clinic/patients")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Details
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive patient information and visit history
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/clinic/visits/new?patientId=${patient.id}`)
              }
              className="border-gray-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Visit
            </Button>
            <Button
              onClick={() => router.push(`/clinic/patients/${patient.id}/edit`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {getInitials(patient.name)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {patient.name}
                  </h2>
                  <p className="text-gray-500 mb-3">ID: {patient.patientId}</p>

                  <div className="flex justify-center mb-4">
                    <Badge
                      variant="outline"
                      className={getGenderColor(patient.gender)}
                    >
                      {patient.gender}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{patient.age} years old</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{patient.phone}</span>
                    </div>

                    {patient.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}

                    {patient.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{patient.address}</span>
                      </div>
                    )}

                    {patient.emergencyContact && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Emergency: </span>
                          <span className="font-medium">
                            {patient.emergencyContact}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Registered: </span>
                        <span>{formatDate(patient.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Patient Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalVisits}
                  </div>
                  <div className="text-sm text-green-700">Total Visits</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.completedVisits}
                    </div>
                    <div className="text-xs text-blue-600">Completed</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {formatCurrency(stats.totalSpent)}
                    </div>
                    <div className="text-xs text-purple-600">Total Spent</div>
                  </div>
                </div>

                {stats.lastVisit && (
                  <div className="text-center pt-2 border-t border-green-200">
                    <div className="text-xs text-green-700">Last Visit</div>
                    <div className="text-sm font-semibold text-green-900">
                      {formatDate(stats.lastVisit)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`/clinic/visits/new?patientId=${patient.id}`)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Visit
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`tel:${patient.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                {patient.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${patient.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`/clinic/patients/${patient.id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("visits")}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "visits"
                        ? "border-blue-500 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    }`}
                  >
                    <Stethoscope className="h-4 w-4 inline mr-2" />
                    Visit History ({visits.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("medical")}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "medical"
                        ? "border-blue-500 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Medical History
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Recent Activity */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Recent Activity
                        </h3>
                        {visits.length > 0 ? (
                          <div className="space-y-3">
                            {visits.slice(0, 3).map((visit) => (
                              <div
                                key={visit.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Stethoscope className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {visit.services?.length || 0} service(s)
                                      {(visit.medicines?.length || 0) > 0 &&
                                        `, ${visit.medicines?.length || 0} medicine(s)`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatDateTime(visit.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    className={getStatusColor(visit.status)}
                                  >
                                    {visit.status}
                                  </Badge>
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(visit.total || 0)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/clinic/visits/${visit.id}`)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              No visits recorded yet
                            </p>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/clinic/visits/new?patientId=${patient.id}`
                                )
                              }
                              className="mt-3 bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start First Visit
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Financial Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="border-0 bg-blue-50 border-l-4 border-l-blue-400">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-blue-600">
                                    Total Spent
                                  </p>
                                  <p className="text-2xl font-bold text-blue-800">
                                    {formatCurrency(stats.totalSpent)}
                                  </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-400" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 bg-green-50 border-l-4 border-l-green-400">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-600">
                                    Average per Visit
                                  </p>
                                  <p className="text-2xl font-bold text-green-800">
                                    {formatCurrency(stats.averageSpent)}
                                  </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-400" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 bg-purple-50 border-l-4 border-l-purple-400">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-purple-600">
                                    Visit Frequency
                                  </p>
                                  <p className="text-2xl font-bold text-purple-800">
                                    {stats.totalVisits}
                                  </p>
                                  <p className="text-xs text-purple-600">
                                    total visits
                                  </p>
                                </div>
                                <Activity className="h-8 w-8 text-purple-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "visits" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Visit History
                        </h3>
                        <Button
                          onClick={() =>
                            router.push(
                              `/clinic/visits/new?patientId=${patient.id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Visit
                        </Button>
                      </div>

                      {visits.length > 0 ? (
                        <div className="space-y-4">
                          {visits.map((visit) => (
                            <Card
                              key={visit.id}
                              className="border-0 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Stethoscope className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        Visit on {formatDate(visit.createdAt)}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {formatDateTime(visit.createdAt)}
                                        {visit.attendingStaff &&
                                          ` • ${visit.attendingStaff}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      className={getStatusColor(visit.status)}
                                    >
                                      {visit.status}
                                    </Badge>
                                    <p className="font-bold text-green-600 text-lg">
                                      {formatCurrency(visit.total || 0)}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                      <Stethoscope className="h-4 w-4 text-blue-600" />
                                      Services ({visit.services?.length || 0})
                                    </h5>
                                    <div className="space-y-1">
                                      {visit.services?.map((service: any) => (
                                        <div
                                          key={service.id}
                                          className="flex justify-between text-sm"
                                        >
                                          <span>
                                            {service.service?.name ||
                                              `Service ${service.serviceId}`}
                                          </span>
                                          <span className="font-medium">
                                            {formatCurrency(
                                              service.totalPrice || 0
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {(visit.medicines?.length || 0) > 0 && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-green-600" />
                                        Medicines (
                                        {visit.medicines?.length || 0})
                                      </h5>
                                      <div className="space-y-1">
                                        {visit.medicines?.map(
                                          (medicine: any) => (
                                            <div
                                              key={medicine.id}
                                              className="flex justify-between text-sm"
                                            >
                                              <span>
                                                {medicine.medicine?.name ||
                                                  `Medicine ${medicine.medicineId}`}
                                              </span>
                                              <span className="font-medium">
                                                {formatCurrency(
                                                  medicine.totalPrice || 0
                                                )}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {visit.diagnosisNotes && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h5 className="font-medium text-gray-900 mb-1">
                                      Diagnosis Notes
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {visit.diagnosisNotes}
                                    </p>
                                  </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                  <div className="text-sm text-gray-500">
                                    Payment:{" "}
                                    {visit.paymentMethod || "Not specified"}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/clinic/visits/${visit.id}`)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            No Visits Recorded
                          </h4>
                          <p className="text-gray-600 mb-6">
                            This patient hasn&apos;t had any visits yet.
                          </p>
                          <Button
                            onClick={() =>
                              router.push(
                                `/clinic/visits/new?patientId=${patient.id}`
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Start First Visit
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "medical" && (
                    <div className="space-y-6">
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Medical History
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Comprehensive medical history and records will be
                          displayed here.
                        </p>
                        <div className="text-sm text-gray-500">
                          Features coming soon: Medical conditions, allergies,
                          medications, and more.
                        </div>
                      </div>

                      {/* Placeholder for future medical history features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-0 bg-orange-50 border-l-4 border-l-orange-400">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-orange-900 mb-2">
                              Medical Conditions
                            </h5>
                            <p className="text-sm text-orange-700">
                              No conditions recorded
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-red-50 border-l-4 border-l-red-400">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-red-900 mb-2">
                              Allergies
                            </h5>
                            <p className="text-sm text-red-700">
                              No allergies recorded
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-purple-50 border-l-4 border-l-purple-400">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-purple-900 mb-2">
                              Current Medications
                            </h5>
                            <p className="text-sm text-purple-700">
                              No medications recorded
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-cyan-50 border-l-4 border-l-cyan-400">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-cyan-900 mb-2">
                              Lab Results
                            </h5>
                            <p className="text-sm text-cyan-700">
                              No lab results available
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
