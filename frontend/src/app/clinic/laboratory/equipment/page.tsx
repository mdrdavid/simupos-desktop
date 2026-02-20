/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  Activity,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Edit,
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
} from "@/components/ui/dropdown-menu";
import { useClinic } from "@/context/ClinicContext";

export default function EquipmentPage() {
  const router = useRouter();
  const { labEquipment } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEquipment = labEquipment.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || equipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "out-of-service":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return CheckCircle;
      case "maintenance":
        return Wrench;
      case "out-of-service":
        return XCircle;
      default:
        return Activity;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isMaintenanceDue = (equipment: any) => {
    return new Date(equipment.nextMaintenance) <= new Date();
  };

  const stats = {
    operational: labEquipment.filter((eq) => eq.status === "operational")
      .length,
    maintenance: labEquipment.filter((eq) => eq.status === "maintenance")
      .length,
    outOfService: labEquipment.filter((eq) => eq.status === "out-of-service")
      .length,
    maintenanceDue: labEquipment.filter(isMaintenanceDue).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Equipment
              </h1>
              <p className="text-gray-600 mt-1">
                Manage laboratory equipment and maintenance
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/clinic/laboratory/equipment/new")}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Operational
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.operational}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Maintenance
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.maintenance}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-red-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Out of Service
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.outOfService}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Maintenance Due
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.maintenanceDue}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search equipment by name, category, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-orange-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Status
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-orange-100 text-orange-800"
                  >
                    {statusFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg ${statusFilter === "all" ? "bg-orange-50 text-orange-700" : ""}`}
              >
                All Equipment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("operational")}
                className={`rounded-lg ${statusFilter === "operational" ? "bg-orange-50 text-orange-700" : ""}`}
              >
                Operational
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("maintenance")}
                className={`rounded-lg ${statusFilter === "maintenance" ? "bg-orange-50 text-orange-700" : ""}`}
              >
                Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("out-of-service")}
                className={`rounded-lg ${statusFilter === "out-of-service" ? "bg-orange-50 text-orange-700" : ""}`}
              >
                Out of Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => {
              const StatusIcon = getStatusIcon(equipment.status);
              const maintenanceDue = isMaintenanceDue(equipment);

              return (
                <Card
                  key={equipment.id}
                  className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-orange-300 bg-white/80 backdrop-blur-sm overflow-hidden group"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      equipment.status === "operational"
                        ? "bg-gradient-to-r from-green-500 to-teal-600"
                        : equipment.status === "maintenance"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                          : "bg-gradient-to-r from-red-500 to-pink-600"
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  <CardContent className="p-6">
                    {/* Equipment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Activity className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {equipment.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {equipment.category}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(equipment.status)}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {equipment.status.replace("-", " ")}
                      </Badge>
                    </div>

                    {/* Equipment Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Serial Number</span>
                        <span className="font-medium text-gray-900">
                          {equipment.serialNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Manufacturer</span>
                        <span className="font-medium text-gray-900">
                          {equipment.manufacturer}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Model</span>
                        <span className="font-medium text-gray-900">
                          {equipment.model}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-900 font-medium">
                          {equipment.location}
                        </span>
                      </div>
                    </div>

                    {/* Maintenance Information */}
                    <div className="space-y-2 pt-4 border-t border-gray-100/60">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Maintenance</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(equipment.lastMaintenance)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next Maintenance</span>
                        <span
                          className={`font-medium ${
                            maintenanceDue ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {formatDate(equipment.nextMaintenance)}
                          {maintenanceDue && (
                            <AlertTriangle className="h-3 w-3 inline ml-1" />
                          )}
                        </span>
                      </div>

                      {maintenanceDue && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                              Maintenance overdue
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100/60">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-300 hover:border-orange-300 bg-white/80 hover:bg-white"
                        onClick={() =>
                          router.push(
                            `/clinic/laboratory/equipment/${equipment.id}`
                          )
                        }
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        Maintain
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-orange-300 bg-white/80 hover:bg-white"
                        onClick={() =>
                          router.push(
                            `/clinic/laboratory/equipment/${equipment.id}`
                          )
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600"></div>
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Activity className="h-16 w-16 text-orange-500" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                No equipment found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Get started by adding your first piece of laboratory equipment."}
              </p>
              <Button
                onClick={() => router.push("/clinic/laboratory/equipment/new")}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 px-8 py-3 text-lg rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Equipment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
