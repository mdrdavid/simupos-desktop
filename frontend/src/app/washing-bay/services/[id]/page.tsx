/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Car,
  Clock,
  DollarSign,
  Wrench,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const { serviceTypes, fetchServiceTypes, loading } = useWashingBay();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    if (serviceTypes.length > 0 && serviceId) {
      const foundService = serviceTypes.find((s) => s.id === serviceId);
      setService(foundService);
    }
  }, [serviceTypes, serviceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getVehicleTypeColor = (type: string) => {
    const colors = {
      car: "bg-blue-100 text-blue-700",
      suv: "bg-green-100 text-green-700",
      truck: "bg-orange-100 text-orange-700",
      motorcycle: "bg-purple-100 text-purple-700",
      van: "bg-red-100 text-red-700",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getWashTypeColor = (type: string) => {
    const colors = {
      basic: "bg-gray-100 text-gray-700",
      premium: "bg-yellow-100 text-yellow-700",
      deluxe: "bg-purple-100 text-purple-700",
      interior: "bg-green-100 text-green-700",
      exterior: "bg-blue-100 text-blue-700",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Service Not Found
        </h3>
        <p className="text-gray-600 mb-4">
          The service you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/washing-bay/services">
          <Button>Back to Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/washing-bay/services")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-gray-600 mt-1">
              Service details and information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/washing-bay/services/${service.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Service
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Service Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Service Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {service.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-gray-900 mt-1">{service.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Badge className={getVehicleTypeColor(service.vehicleType)}>
                  <Car className="h-3 w-3 mr-1" />
                  {service.vehicleType.charAt(0).toUpperCase() +
                    service.vehicleType.slice(1)}
                </Badge>
                <Badge className={getWashTypeColor(service.washType)}>
                  {service.washType.charAt(0).toUpperCase() +
                    service.washType.slice(1)}{" "}
                  Wash
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <label className="text-sm font-medium text-blue-600">
                    Price
                  </label>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(service.price)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <label className="text-sm font-medium text-green-600">
                    Estimated Duration
                  </label>
                  <p className="text-2xl font-bold text-green-900">
                    {service.estimatedDuration} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Service Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Service Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service ID:</span>
                <span className="font-medium text-gray-900">{service.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Branch ID:</span>
                <span className="font-medium text-gray-900">
                  {service.branchId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(service.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(service.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/washing-bay/services/${service.id}/edit`}
                className="w-full"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service Details
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                View Usage Statistics
              </Button>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Service Status:</span>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Toggle service status
                    console.log("Toggle service status");
                  }}
                >
                  {service.isActive ? "Deactivate Service" : "Activate Service"}
                </Button>
                <p className="text-xs text-gray-500">
                  {service.isActive
                    ? "Active services are available for new orders"
                    : "Inactive services are hidden from new orders"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
