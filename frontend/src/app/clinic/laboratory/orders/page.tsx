"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Calendar,
  User,
  Plus,
  TestTube,
  FileText,
  Activity,
  FlaskConical,
  ArrowRight,
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

export default function LabOrdersPage() {
  const router = useRouter();
  const { labOrders, getPendingLabOrders, labTests, labEquipment } =
    useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.referringDoctor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      matchesDate = new Date(order.orderDate).toDateString() === today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(order.orderDate) >= weekAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const pendingOrders = getPendingLabOrders();
  const completedOrders = labOrders.filter(
    (order) => order.status === "completed"
  );

  const quickLinks = [
    {
      title: "New Lab Order",
      description: "Create new test order",
      href: "/clinic/laboratory/new-order",
      icon: Plus,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      bgColor: "bg-green-50",
      count: null,
    },
    {
      title: "Pending Tests",
      description: "Awaiting processing",
      href: "/clinic/laboratory/pending",
      icon: Clock,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      count: pendingOrders.length,
    },
    {
      title: "Test Catalog",
      description: "Manage lab tests",
      href: "/clinic/laboratory/tests",
      icon: TestTube,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      count: labTests.length,
    },
    {
      title: "Results",
      description: "View test results",
      href: "/clinic/laboratory/results",
      icon: FileText,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      count: completedOrders.length,
    },
    {
      title: "Equipment",
      description: "Manage lab equipment",
      href: "/clinic/laboratory/equipment",
      icon: Activity,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      bgColor: "bg-red-50",
      count: labEquipment.length,
    },
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "in-progress":
        return AlertCircle;
      case "completed":
        return CheckCircle;
      default:
        return Clock;
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Lab Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all laboratory test orders
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
              New Order
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-500" />
              Quick Access
            </h3>
            <span className="text-sm text-gray-500">Laboratory Module</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.title}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-white/80 backdrop-blur-sm"
                  onClick={() => router.push(link.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${link.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {link.description}
                        </p>
                      </div>
                      {link.count !== null && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 text-xs"
                        >
                          {link.count}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Click to open
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-purple-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="flex gap-3">
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
                  All Status
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                  {dateFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-purple-100 text-purple-800"
                    >
                      {dateFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setDateFilter("all")}
                  className={`rounded-lg ${dateFilter === "all" ? "bg-purple-50 text-purple-700" : ""}`}
                >
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateFilter("today")}
                  className={`rounded-lg ${dateFilter === "today" ? "bg-purple-50 text-purple-700" : ""}`}
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateFilter("week")}
                  className={`rounded-lg ${dateFilter === "week" ? "bg-purple-50 text-purple-700" : ""}`}
                >
                  This Week
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labOrders.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingOrders.length}
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedOrders.length}
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
                    Available Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labTests.length}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TestTube className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  All Lab Orders ({filteredOrders.length})
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-6 rounded-xl hover:bg-purple-50/50 transition-all duration-200 group border border-transparent hover:border-purple-100 cursor-pointer"
                    onClick={() =>
                      router.push(`/clinic/laboratory/orders/${order.id}`)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                          {order.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {order.tests.length} test(s) • Ordered{" "}
                          {formatDate(order.orderDate)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getStatusColor(order.status)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status.replace("-", " ")}
                          </Badge>
                          {order.referringDoctor && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              Dr. {order.referringDoctor}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          order.paymentStatus === "paid"
                            ? "text-green-600"
                            : order.paymentStatus === "partial"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </p>
                      {order.completedDate && (
                        <p className="text-sm text-gray-600">
                          Completed {formatDate(order.completedDate)}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/80 hover:bg-white border-gray-300 hover:border-purple-300 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clinic/laboratory/orders/${order.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    dateFilter !== "all"
                      ? "Try adjusting your search terms or filters to find what you're looking for."
                      : "No lab orders have been created yet."}
                  </p>
                  <Button
                    onClick={() => router.push("/clinic/laboratory/new-order")}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    Create First Order
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
