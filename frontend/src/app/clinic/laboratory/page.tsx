"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Activity,
  Download,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClinic } from "@/context/ClinicContext";

export default function LaboratoryPage() {
  const router = useRouter();
  const {
    labOrders,
    getPendingLabOrders,
    getCompletedLabOrders,
    labTests,
    labEquipment,
  } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const pendingOrders = getPendingLabOrders();
  const completedOrders = getCompletedLabOrders();

  const stats = {
    totalTests: labTests.length,
    pendingOrders: pendingOrders.length,
    completedToday: completedOrders.filter(
      (order) =>
        order.completedDate &&
        new Date(order.completedDate).toDateString() ===
          new Date().toDateString()
    ).length,
    equipmentOperational: labEquipment.filter(
      (eq) => eq.status === "operational"
    ).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Laboratory
              </h1>
              <p className="text-gray-600 mt-1">
                Manage lab tests, orders, and results
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
              onClick={() => router.push("/clinic/laboratory/new-order")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lab Order
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTests}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TestTube className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedToday}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Equipment Ready
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.equipmentOperational}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
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
              placeholder="Search by patient name, test name, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-purple-500 rounded-xl bg-white/80 backdrop-blur-sm"
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
                    className="ml-2 bg-purple-100 text-purple-800"
                  >
                    {statusFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg ${statusFilter === "all" ? "bg-purple-50 text-purple-700" : ""}`}
              >
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("pending")}
                className={`rounded-lg ${statusFilter === "pending" ? "bg-purple-50 text-purple-700" : ""}`}
              >
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("in-progress")}
                className={`rounded-lg ${statusFilter === "in-progress" ? "bg-purple-50 text-purple-700" : ""}`}
              >
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("completed")}
                className={`rounded-lg ${statusFilter === "completed" ? "bg-purple-50 text-purple-700" : ""}`}
              >
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            className="border-0 shadow-sm bg-gradient-to-br from-white to-purple-50/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => router.push("/clinic/laboratory/tests")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <TestTube className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Test Catalog</h3>
              <p className="text-sm text-gray-600 mt-1">Manage lab tests</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => router.push("/clinic/laboratory/pending")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Pending Tests</h3>
              <p className="text-sm text-gray-600 mt-1">
                {pendingOrders.length} orders
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => router.push("/clinic/laboratory/results")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Results</h3>
              <p className="text-sm text-gray-600 mt-1">View all results</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm bg-gradient-to-br from-white to-orange-50/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => router.push("/clinic/laboratory/equipment")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Equipment</h3>
              <p className="text-sm text-gray-600 mt-1">Manage lab equipment</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lab Orders */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Recent Lab Orders
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/clinic/laboratory/orders")}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {labOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-purple-50/50 transition-all duration-200 group border border-transparent hover:border-purple-100 cursor-pointer"
                  onClick={() =>
                    router.push(`/clinic/laboratory/orders/${order.id}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {order.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {order.patient.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.tests.length} test(s) •{" "}
                        {formatDate(order.orderDate)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(order.status)}
                        >
                          {order.status.replace("-", " ")}
                        </Badge>
                        {order.tests.some(
                          (test) => test.priority === "urgent"
                        ) && (
                          <Badge
                            variant="secondary"
                            className={getPriorityColor("urgent")}
                          >
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat("en-UG", {
                        style: "currency",
                        currency: "UGX",
                        minimumFractionDigits: 0,
                      }).format(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Dr. {order.referringDoctor}
                    </p>
                  </div>
                </div>
              ))}
              {labOrders.length === 0 && (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No lab orders
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first lab order
                  </p>
                  <Button
                    onClick={() => router.push("/clinic/laboratory/new-order")}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lab Order
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
