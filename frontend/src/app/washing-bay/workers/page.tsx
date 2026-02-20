"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Users,
  Phone,
  Mail,
  DollarSign,
  Trash2,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";

export default function WorkersPage() {
  const { workers, fetchWorkers, deleteWorker } = useWashingBay();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && worker.isActive) ||
      (statusFilter === "inactive" && !worker.isActive);

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-600 mt-1">
            Manage washing bay staff and commissions
          </p>
        </div>
        <Link href="/washing-bay/workers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workers by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkers.map((worker) => (
          <Card
            key={worker.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {worker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {worker.name}
                    </h3>
                    {worker.employeeId && (
                      <p className="text-sm text-gray-600">
                        ID: {worker.employeeId}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={worker.isActive ? "default" : "secondary"}>
                  {worker.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {worker.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{worker.phone}</span>
                  </div>
                )}
                {worker.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  <span>
                    {worker.commissionType === "percentage"
                      ? `${worker.commissionValue}% commission`
                      : `${formatCurrency(worker.commissionValue)} fixed`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/washing-bay/workers/${worker.id}`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </Link>
                <Link href={`/washing-bay/workers/${worker.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this worker?"
                      )
                    ) {
                      try {
                        await deleteWorker(worker.id);
                      } catch (error) {
                        console.error("Failed to delete worker:", error);
                        alert("Failed to delete worker");
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredWorkers.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No workers found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first worker"}
                </p>
                <Link href="/washing-bay/workers/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Worker
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
