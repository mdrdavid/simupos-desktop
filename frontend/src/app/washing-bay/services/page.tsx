"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Wrench,
  DollarSign,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";

export default function ServicesPage() {
  const { serviceTypes, fetchServiceTypes } = useWashingBay();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [washTypeFilter, setWashTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const filteredServices = serviceTypes.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVehicle =
      vehicleFilter === "all" || service.vehicleType === vehicleFilter;
    const matchesWashType =
      washTypeFilter === "all" || service.washType === washTypeFilter;

    return matchesSearch && matchesVehicle && matchesWashType;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Types</h1>
          <p className="text-gray-600 mt-1">
            Manage washing services and pricing
          </p>
        </div>
        <Link href="/washing-bay/services/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicles</option>
                <option value="car">Car</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="van">Van</option>
              </select>
              <select
                value={washTypeFilter}
                onChange={(e) => setWashTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="deluxe">Deluxe</option>
                <option value="interior">Interior</option>
                <option value="exterior">Exterior</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {service.description || "No description"}
                    </p>
                  </div>
                </div>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getVehicleTypeColor(service.vehicleType)}>
                    {service.vehicleType}
                  </Badge>
                  <Badge className={getWashTypeColor(service.washType)}>
                    {service.washType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.estimatedDuration} min</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/washing-bay/services/${service.id}`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </Link>
                <Link href={`/washing-bay/services/${service.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ||
                  vehicleFilter !== "all" ||
                  washTypeFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first service"}
                </p>
                <Link href="/washing-bay/services/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Service
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
