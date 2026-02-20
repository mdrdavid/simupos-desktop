/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Calendar,
  User,
  DollarSign,
  Filter,
  RotateCcw,
  Clock,
  Stethoscope,
  Pill,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Download,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import type { Visit } from "@/src/types/clinic";

export default function VisitsPage() {
  const { visits, patients } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const statuses: Visit["status"][] = [
    "Open",
    "Billed",
    "Completed",
    "Cancelled",
  ];

  const filteredVisits = visits.filter((visit) => {
    // Add null check for patient
    if (!visit.patient) return false;
    const matchesSearch =
      visit.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.patient.patientId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      visit.attendingStaff?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || visit.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const today = new Date();
      const visitDate = new Date(visit.createdAt);

      switch (dateFilter) {
        case "today":
          matchesDate = visitDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = visitDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = visitDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return "N/A";
    }

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }

      return new Intl.DateTimeFormat("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getStatusColor = (status: Visit["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Billed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Visit["status"]) => {
    switch (status) {
      case "Open":
        return <Clock className="h-4 w-4" />;
      case "Billed":
        return <DollarSign className="h-4 w-4" />;
      case "Completed":
        return <FileText className="h-4 w-4" />;
      case "Cancelled":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (date: Date | string) => {
    // Ensure we have a valid Date object
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // Calculate statistics
  const todayVisits = visits.filter((visit) => {
    const today = new Date();
    return new Date(visit.createdAt).toDateString() === today.toDateString();
  }).length;

  const totalRevenue = visits.reduce(
    (sum, visit) => sum + (visit.total || 0),
    0
  );
  const openVisits = visits.filter((visit) => visit.status === "Open").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Patient Visits
              </h1>
              <p className="text-gray-600 mt-1">
                Manage {filteredVisits.length} visits with comprehensive patient
                care tracking
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href="/clinic/visits/new">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Visit
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 bg-blue-50 border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Today&apos;s Visits
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {todayVisits}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-green-50 border-l-4 border-l-green-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-orange-50 border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      Open Visits
                    </p>
                    <p className="text-2xl font-bold text-orange-800">
                      {openVisits}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-purple-50 border-l-4 border-l-purple-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      All Time
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
                      {visits.length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name, ID, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40 h-11 border-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery ||
                statusFilter !== "all" ||
                dateFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="h-11 border-gray-300"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Visits Grid */}
        {filteredVisits.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "No visits found"
                  : "No visits yet"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Start providing patient care by creating your first visit record."}
              </p>
              {!searchQuery &&
                statusFilter === "all" &&
                dateFilter === "all" && (
                  <Link href="/clinic/visits/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Visit
                    </Button>
                  </Link>
                )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVisits
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((visit) => {
                // Skip visits without patients
                if (!visit.patient) return null;

                // Ensure services and medicines arrays exist
                const servicesCount = visit.services?.length || 0;
                const medicinesCount = visit.medicines?.length || 0;

                return (
                  <Card
                    key={visit.id}
                    className="hover:shadow-lg transition-all duration-200 border border-gray-200 group cursor-pointer"
                    onClick={() =>
                      window.open(`/clinic/visits/${visit.id}`, "_self")
                    }
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {visit.patient.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ID: {visit.patient.patientId}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getStatusColor(visit.status)}
                        >
                          {getStatusIcon(visit.status)}
                          <span className="ml-1">{visit.status}</span>
                        </Badge>
                      </div>

                      {/* Visit Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Visit Date:</span>
                          <span className="font-semibold">
                            {formatDate(visit.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold">
                            {getTimeAgo(visit.createdAt)}
                          </span>
                        </div>

                        {visit.attendingStaff && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Stethoscope className="h-4 w-4" />
                            <span>Staff: {visit.attendingStaff}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{servicesCount} services</span>
                          </div>
                          {medicinesCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Pill className="h-4 w-4" />
                              <span>{medicinesCount} meds</span>
                            </div>
                          )}
                        </div>

                        {visit.diagnosisNotes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {visit.diagnosisNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(visit.total || 0)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/clinic/visits/${visit.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {visit.status === "Open" && (
                            <Link href={`/clinic/visits/${visit.id}/edit`}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Load More */}
        {filteredVisits.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="border-gray-300">
              Load More Visits
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
