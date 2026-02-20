/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  TestTube,
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

export default function LabResultsPage() {
  const router = useRouter();
  const { getCompletedLabOrders } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("week");

  const completedOrders = getCompletedLabOrders();

  const filteredOrders = completedOrders.filter(
    (order) =>
      order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tests.some((test: any) =>
        test.test.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getAbnormalResults = (order: any) => {
    if (!order.results) return 0;
    return order.results.filter((result: any) => result.flag !== "normal")
      .length;
  };

  const printResults = (order: any) => {
    // In a real app, this would generate a PDF
    console.log("Printing results for order:", order.id);
    alert("Results printing feature would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Test Results
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage laboratory test results
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50/80"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Period
                {dateFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {dateFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() => setDateFilter("all")}
                className={`rounded-lg ${dateFilter === "all" ? "bg-green-50 text-green-700" : ""}`}
              >
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("today")}
                className={`rounded-lg ${dateFilter === "today" ? "bg-green-50 text-green-700" : ""}`}
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("week")}
                className={`rounded-lg ${dateFilter === "week" ? "bg-green-50 text-green-700" : ""}`}
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("month")}
                className={`rounded-lg ${dateFilter === "month" ? "bg-green-50 text-green-700" : ""}`}
              >
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => {
            const abnormalCount = getAbnormalResults(order);
            return (
              <Card
                key={order.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-green-300 bg-white/80 backdrop-blur-sm overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors text-lg">
                          {order.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {order.patient.age} years • {order.patient.gender} •{" "}
                          {order.patient.patientId}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {order.referringDoctor && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>Dr. {order.referringDoctor}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Completed {formatDateTime(order.completedDate!)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        {abnormalCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 border-red-200"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {abnormalCount} abnormal
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => printResults(order)}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg shadow-green-500/25"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Print Results
                      </Button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-purple-500" />
                      Test Results ({order.results?.length || 0})
                    </h4>

                    {order.results && order.results.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.results.map((result: any) => (
                          <div
                            key={result.id}
                            className={`p-4 rounded-lg border-2 ${
                              result.flag === "normal"
                                ? "bg-green-50 border-green-200"
                                : result.flag === "high"
                                  ? "bg-red-50 border-red-200"
                                  : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">
                                {result.test.name}
                              </h5>
                              <Badge
                                variant="secondary"
                                className={
                                  result.flag === "normal"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : result.flag === "high"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }
                              >
                                {result.flag || "normal"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Result:</span>
                                <span className="font-bold text-gray-900">
                                  {result.value} {result.unit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Normal Range:
                                </span>
                                <span className="text-gray-900">
                                  {result.normalRange}
                                </span>
                              </div>
                              {result.notes && (
                                <div className="mt-2 p-2 bg-white rounded border">
                                  <p className="text-xs text-gray-700">
                                    {result.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Completed by {result.completedBy} •{" "}
                              {formatDateTime(result.completedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-gray-200/50">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          No results available
                        </h4>
                        <p className="text-gray-600">
                          Test results are pending or not yet entered.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-600"></div>
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <FileText className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                No results found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {searchQuery || dateFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "No test results have been completed yet."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/clinic/laboratory/orders")}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg shadow-green-500/25"
                >
                  View All Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/clinic/laboratory/pending")}
                  className="border-gray-300 hover:border-green-300"
                >
                  Check Pending Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
