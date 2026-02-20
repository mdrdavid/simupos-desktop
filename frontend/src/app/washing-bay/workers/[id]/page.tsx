/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  DollarSign,
  UserCheck,
  UserX,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import Link from "next/link";

export default function WorkerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;

  const {
    // workers,
    fetchWorkers,
    deleteWorker,
    getWorkerWithStatistics,
    loading,
  } = useWashingBay();

  const [worker, setWorker] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [periodFilter, setPeriodFilter] = useState("day");

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (workerId) {
      loadWorkerWithStatistics();
    }
  }, [workerId, periodFilter]);

  const loadWorkerWithStatistics = async () => {
    try {
      const workerData = await getWorkerWithStatistics(workerId, {
        period: periodFilter as "day" | "week" | "month" | "custom",
      });
      setWorker(workerData);
      setStatistics(workerData.statistics);
    } catch (error) {
      console.error("Failed to load worker statistics:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const handleDeleteWorker = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this worker? This action cannot be undone."
      )
    ) {
      try {
        await deleteWorker(workerId);
        router.push("/washing-bay/workers");
      } catch (error) {
        console.error("Failed to delete worker:", error);
        alert("Failed to delete worker");
      }
    }
  };

  const handleToggleStatus = async () => {
    // This would require an updateWorker method to toggle isActive status
    console.log("Toggle worker status - implement updateWorker method");
  };

  if (loading && !worker) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading worker details...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Worker Not Found
        </h3>
        <p className="text-gray-600 mb-4">
          The worker you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/washing-bay/workers">
          <Button>Back to Workers</Button>
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
            onClick={() => router.push("/washing-bay/workers")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{worker.name}</h1>
            <p className="text-gray-600 mt-1">Worker details and information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/washing-bay/workers/${worker.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Worker
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteWorker}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Worker Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {worker.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {worker.name}
                    </h2>
                    <Badge variant={worker.isActive ? "default" : "secondary"}>
                      {worker.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {worker.employeeId && (
                    <p className="text-gray-600">
                      Employee ID: {worker.employeeId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worker.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{worker.phone}</p>
                    </div>
                  </div>
                )}
                {worker.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{worker.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Commission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <label className="text-sm font-medium text-blue-600">
                    Commission Type
                  </label>
                  <p className="text-lg font-bold text-blue-900 capitalize">
                    {worker.commissionType}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <label className="text-sm font-medium text-green-600">
                    Commission Value
                  </label>
                  <p className="text-lg font-bold text-green-900">
                    {worker.commissionType === "percentage"
                      ? `${worker.commissionValue}%`
                      : formatCurrency(worker.commissionValue)}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {worker.commissionType === "percentage"
                    ? `This worker earns ${worker.commissionValue}% of each completed wash order they work on.`
                    : `This worker earns ${formatCurrency(worker.commissionValue)} for each completed wash order they work on.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Account Information */}
          {worker.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  System Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{worker.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">
                      {worker.user.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Worker Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Worker Statistics</span>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-900">
                    {statistics?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-blue-600">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-900">
                    {statistics?.completedOrders || 0}
                  </p>
                  <p className="text-xs text-green-600">Completed Orders</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Commission:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(statistics?.totalCommission || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Commission:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(statistics?.pendingCommission || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium">
                    {statistics?.completionRate
                      ? statistics.completionRate.toFixed(1) + "%"
                      : "0%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Worker Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Worker ID:</span>
                <span className="font-medium text-gray-900">{worker.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Branch ID:</span>
                <span className="font-medium text-gray-900">
                  {worker.branchId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(worker.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(worker.updatedAt)}
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
                href={`/washing-bay/workers/${worker.id}/edit`}
                className="w-full"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Worker Details
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteWorker}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Worker
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleStatus}
              >
                {worker.isActive ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate Worker
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate Worker
                  </>
                )}
              </Button>
              {!worker.user && (
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User Account
                </Button>
              )}
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
                  <span className="text-sm text-gray-600">Worker Status:</span>
                  <Badge variant={worker.isActive ? "default" : "secondary"}>
                    {worker.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {worker.isActive
                    ? "Active workers can be assigned to new orders"
                    : "Inactive workers cannot be assigned to new orders"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
