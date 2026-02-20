/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  User,
  Phone,
  Calendar,
  Eye,
  Filter,
  MoreVertical,
  Mail,
  MapPin,
  Users,
  Sparkles,
  Download,
  SortAsc,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useClinic } from "@/context/ClinicContext";

export default function PatientsPage() {
  const router = useRouter();
  const { patients, searchPatients } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "recent">("recent");

  const [filteredPatients, setFilteredPatients] = useState<any[]>(
    patients || []
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchFiltered = async () => {
      if (!searchQuery.trim()) {
        // no query -> show original patients array
        if (mounted) setFilteredPatients(patients || []);
        return;
      }

      setSearching(true);
      try {
        // Handle both sync and async searchPatients
        const result = await Promise.resolve(searchPatients(searchQuery));
        if (mounted) setFilteredPatients(result || []);
      } catch (e) {
        if (mounted) setFilteredPatients([]);
      } finally {
        if (mounted) setSearching(false);
      }
    };

    fetchFiltered();
    return () => {
      mounted = false;
    };
  }, [searchQuery, patients, searchPatients]);

  // Apply gender filter if selected
  const finalPatients =
    genderFilter === "all"
      ? filteredPatients
      : filteredPatients.filter((patient) => patient.gender === genderFilter);

  // Apply sorting
  const sortedPatients = [...finalPatients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "recent":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

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
  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "Female":
        return "bg-gradient-to-r from-pink-500 to-pink-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getGenderLightColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Female":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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

  const getStatusColor = (lastVisit: Date | string | null | undefined) => {
    if (!lastVisit) {
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }

    try {
      const lastVisitDate =
        typeof lastVisit === "string" ? new Date(lastVisit) : lastVisit;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return lastVisitDate >= thirtyDaysAgo
        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
        : "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    } catch (error) {
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getStatusLightColor = (lastVisit: Date | string | null | undefined) => {
    if (!lastVisit) {
      return "bg-gray-50 text-gray-700 border-gray-200";
    }

    try {
      const lastVisitDate =
        typeof lastVisit === "string" ? new Date(lastVisit) : lastVisit;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return lastVisitDate >= thirtyDaysAgo
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-50 text-gray-700 border-gray-200";
    } catch (error) {
      return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGenderFilter("all");
  };

  const hasActiveFilters = searchQuery || genderFilter !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Patients
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  {sortedPatients.length}{" "}
                  {sortedPatients.length === 1 ? "patient" : "patients"}{" "}
                  registered
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50/80"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => router.push("/clinic/patients/new")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Gender
                  {genderFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-800"
                    >
                      {genderFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setGenderFilter("all")}
                  className={`rounded-lg ${genderFilter === "all" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  All Patients
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGenderFilter("Male")}
                  className={`rounded-lg ${genderFilter === "Male" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  Male
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setGenderFilter("Female")}
                  className={`rounded-lg ${genderFilter === "Female" ? "bg-pink-50 text-pink-700" : ""}`}
                >
                  Female
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setSortBy("recent")}
                  className={`rounded-lg ${sortBy === "recent" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("name")}
                  className={`rounded-lg ${sortBy === "name" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("date")}
                  className={`rounded-lg ${sortBy === "date" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  Registration Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Search: &quot;{searchQuery}&quot;
                  </Badge>
                )}
                {genderFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className={getGenderLightColor(genderFilter)}
                  >
                    Gender: {genderFilter}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Patients Grid */}
        {sortedPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPatients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-blue-300 cursor-pointer group bg-white/80 backdrop-blur-sm overflow-hidden"
                onClick={() => router.push(`/clinic/patients/${patient.id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {getInitials(patient.name)}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getGenderColor(patient.gender)} flex items-center justify-center`}
                        >
                          {patient.gender === "Male"
                            ? "M"
                            : patient.gender === "Female"
                              ? "F"
                              : "O"}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          ID: {patient.patientId}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-48"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/clinic/patients/${patient.id}`)
                          }
                          className="rounded-lg cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/clinic/visits/new?patientId=${patient.id}`
                            )
                          }
                          className="rounded-lg cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Start Visit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600">
                          <User className="h-4 w-4 mr-2" />
                          Archive Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Enhanced Patient Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${getGenderLightColor(patient.gender)} font-medium`}
                      >
                        {patient.gender} • {patient.age} years
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={getStatusLightColor(
                          patient.lastVisit || patient.createdAt
                        )}
                      >
                        {patient.lastVisit ? "Active" : "New"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{patient.phone}</span>
                      </div>

                      {patient.email && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                          <Mail className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}

                      {patient.address && (
                        <div className="flex items-start gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                          <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {patient.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Registered {formatDate(patient.createdAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clinic/patients/${patient.id}`);
                      }}
                      className="bg-white/80 hover:bg-white border-gray-300 hover:border-blue-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Enhanced Empty State */
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <User className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                {hasActiveFilters
                  ? "No patients found"
                  : "No patients registered"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {hasActiveFilters
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Start building your patient database by adding your first patient to the system."}
              </p>
              {!hasActiveFilters ? (
                <Button
                  onClick={() => router.push("/clinic/patients/new")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 px-8 py-3 text-lg rounded-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Patient
                </Button>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl px-6 py-3"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => router.push("/clinic/patients/new")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 px-6 py-3 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Load More */}
        {sortedPatients.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50/80 rounded-xl px-8 py-2"
            >
              Load More Patients
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
