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
  Edit,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/src/types/clinic";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getService, visits } = useClinic();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  const serviceId = params.id as string;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);
        const serviceData = await getService(serviceId);
        setService(serviceData);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          title: "Service Not Found",
          description: "The requested service could not be found.",
          variant: "destructive",
        });
        router.push("/clinic/services");
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId, getService, router, toast]);

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

  // Calculate service usage statistics
  const getServiceUsage = () => {
    return visits.reduce((count, visit) => {
      if (!visit.services || !Array.isArray(visit.services)) {
        return count;
      }
      const serviceUsed = visit.services.some(
        (vs) => vs.serviceId === serviceId
      );
      return count + (serviceUsed ? 1 : 0);
    }, 0);
  };

  const getServiceRevenue = () => {
    return visits.reduce((revenue, visit) => {
      if (!visit.services || !Array.isArray(visit.services)) {
        return revenue;
      }
      const service = visit.services.find((vs) => vs.serviceId === serviceId);
      return revenue + (service ? service.totalPrice || 0 : 0);
    }, 0);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Service Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested service could not be found.
            </p>
            <Button onClick={() => router.push("/clinic/services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usageCount = getServiceUsage();
  const revenue = getServiceRevenue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-gray-600 mt-1">Service ID: {service.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/clinic/services/${service.id}/edit`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Service
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <FileText className="h-6 w-6 mr-3" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl mb-2">
                        {service.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(service.category)}
                      >
                        <span className="text-lg mr-2">
                          {getCategoryIcon(service.category)}
                        </span>
                        {service.category}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Service Fee:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(service.fee)}
                        </span>
                      </div>

                      {service.duration && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Duration:
                          </span>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{service.duration} minutes</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Status:
                        </span>
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
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Description
                      </h4>
                      {service.description ? (
                        <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                          {service.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No description provided
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(service.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Usage */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900">
                  <Activity className="h-6 w-6 mr-3" />
                  Service Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-blue-600">
                        {usageCount}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Times Used</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-50 rounded-lg p-6">
                      <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(revenue)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Revenue
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/clinic/services/${service.id}/edit`}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Service
                  </Button>
                </Link>
                <Link href="/clinic/services">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-blue-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Statistics */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Times Used:</span>
                  <span className="font-semibold">{usageCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Revenue:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Average per Use:
                  </span>
                  <span className="font-semibold">
                    {usageCount > 0
                      ? formatCurrency(revenue / usageCount)
                      : formatCurrency(0)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
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
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge
                    variant="outline"
                    className={getCategoryColor(service.category)}
                  >
                    {service.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
