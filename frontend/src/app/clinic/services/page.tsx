"use client";

import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Stethoscope,
  Clock,
  DollarSign,
  Filter,
  RotateCcw,
  TrendingUp,
  Download,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  const { services, deleteService, visits } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categories = [
    "Consultation",
    "Lab",
    "ANC",
    "Procedure",
    "Vaccination",
    "Other",
  ];

  // Calculate service usage statistics with proper null checks
  const getServiceUsage = (serviceId: string) => {
    return visits.reduce((count, visit) => {
      // Check if visit.services exists and is an array
      if (!visit.services || !Array.isArray(visit.services)) {
        return count;
      }
      const serviceUsed = visit.services.some(
        (vs) => vs.serviceId === serviceId
      );
      return count + (serviceUsed ? 1 : 0);
    }, 0);
  };

  const getServiceRevenue = (serviceId: string) => {
    return visits.reduce((revenue, visit) => {
      // Check if visit.services exists and is an array
      if (!visit.services || !Array.isArray(visit.services)) {
        return revenue;
      }
      const service = visit.services.find((vs) => vs.serviceId === serviceId);
      return revenue + (service ? service.totalPrice || 0 : 0);
    }, 0);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-UG").format(num);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Consultation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Lab":
        return "bg-green-100 text-green-800 border-green-200";
      case "ANC":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "Procedure":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Vaccination":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleDeleteService = (serviceId: string) => {
    deleteService(serviceId);
  };

  // Calculate statistics
  const totalRevenue = services.reduce(
    (sum, service) => sum + getServiceRevenue(service.id),
    0
  );
  const totalServices = services.length;
  const activeServices = services.filter((service) => service.isActive).length;

  // Find popular service safely
  const popularService =
    services.length > 0
      ? services.reduce((popular, service) => {
          const usage = getServiceUsage(service.id);
          return usage > getServiceUsage(popular.id) ? service : popular;
        }, services[0])
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Medical Services
              </h1>
              <p className="text-gray-600 mt-1">
                Manage {filteredServices.length} services with total revenue of{" "}
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href="/clinic/services/new">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Service
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
                      Total Services
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatNumber(totalServices)}
                    </p>
                  </div>
                  <Stethoscope className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-green-50 border-l-4 border-l-green-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Active Services
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatNumber(activeServices)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-purple-50 border-l-4 border-l-purple-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-orange-50 border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      Most Popular
                    </p>
                    <p className="text-lg font-bold text-orange-800 truncate">
                      {popularService?.name || "N/A"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 h-11 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 border-gray-300">
                  <Activity className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery ||
                categoryFilter !== "all" ||
                statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
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

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery ||
                categoryFilter !== "all" ||
                statusFilter !== "all"
                  ? "No services found"
                  : "No services yet"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery ||
                categoryFilter !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Start by adding your first medical service to offer to patients."}
              </p>
              {!searchQuery &&
                categoryFilter === "all" &&
                statusFilter === "all" && (
                  <Link href="/clinic/services/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Service
                    </Button>
                  </Link>
                )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const usageCount = getServiceUsage(service.id);
              const revenue = getServiceRevenue(service.id);

              return (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-all duration-200 border border-gray-200 group"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(service.category)}
                          >
                            {service.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Link href={`/clinic/services/${service.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Service
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {service.name}&quot;? This action cannot be
                                undone and will remove this service from all
                                future visits.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteService(service.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Service
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Service Fee:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(service.fee)}
                        </span>
                      </div>

                      {service.duration && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Duration:
                          </span>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{service.duration} minutes</span>
                          </div>
                        </div>
                      )}

                      {service.description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                      )}

                      {/* Usage Statistics */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatNumber(usageCount)}
                          </p>
                          <p className="text-xs text-gray-500">Times Used</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(revenue)}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                        className={
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <div className="flex gap-2">
                        <Link href={`/clinic/services/${service.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {filteredServices.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="border-gray-300">
              Load More Services
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
