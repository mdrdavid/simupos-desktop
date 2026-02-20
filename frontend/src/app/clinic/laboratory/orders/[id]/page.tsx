/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  User,
  Calendar,
  TestTube,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClinic } from "@/context/ClinicContext";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { labOrders, updateLabOrder, addLabResult } = useClinic();

  const order = labOrders.find((o) => o.id === params.id);
  const [newResults, setNewResults] = useState<{
    [key: string]: { value: string; notes: string };
  }>({});

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The requested lab order could not be found.
            </p>
            <Button onClick={() => router.push("/clinic/laboratory")}>
              Back to Laboratory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleResultChange = (testId: string, field: string, value: string) => {
    setNewResults((prev) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      },
    }));
  };

  const submitResults = () => {
    Object.entries(newResults).forEach(([testId, result]) => {
      if (result.value.trim()) {
        const testItem = order.tests.find((t) => t.id === testId);
        if (testItem) {
          addLabResult(order.id, {
            test: testItem.test,
            value: result.value,
            unit: "units", // This should come from test definition
            normalRange: testItem.test.normalRange,
            flag: "normal", // This should be calculated based on value and normal range
            notes: result.notes,
            completedBy: "Lab Technician", // This should be the current user
          });
        }
      }
    });
    setNewResults({});
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Lab Order Details
              </h1>
              <p className="text-gray-600 mt-1">
                Order #{order.id} • {formatDate(order.orderDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient and Order Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {order.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {order.patient.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {order.patient.patientId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age</span>
                    <span className="font-medium text-gray-900">
                      {order.patient.age} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-medium text-gray-900">
                      {order.patient.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">
                      {order.patient.phone}
                    </span>
                  </div>
                  {order.patient.address && (
                    <div>
                      <span className="text-gray-600">Address</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {order.patient.address}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(order.status)}
                  >
                    {order.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order.orderDate)}
                  </span>
                </div>
                {order.completedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed Date</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(order.completedDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge
                    variant="secondary"
                    className={
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : order.paymentStatus === "partial"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.referringDoctor && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Referring Doctor</span>
                    <span className="font-medium text-gray-900">
                      Dr. {order.referringDoctor}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tests and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tests Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-orange-500" />
                  Ordered Tests ({order.tests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.tests.map((testItem) => (
                    <div
                      key={testItem.id}
                      className="p-4 border border-gray-200 rounded-xl bg-white/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {testItem.test.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {testItem.test.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              testItem.priority === "urgent"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {testItem.priority}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {testItem.test.sampleType}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Duration: </span>
                          <span className="font-medium text-gray-900">
                            {testItem.test.duration} mins
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price: </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(testItem.test.price)}
                          </span>
                        </div>
                      </div>
                      {testItem.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {testItem.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.status === "completed" &&
                order.results &&
                order.results.length > 0 ? (
                  <div className="space-y-4">
                    {order.results.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border border-green-200 rounded-xl bg-green-50/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {result.test.name}
                          </h4>
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
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Result: </span>
                            <span className="font-bold text-gray-900">
                              {result.value} {result.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Normal Range:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {result.normalRange}
                            </span>
                          </div>
                        </div>
                        {result.notes && (
                          <div className="p-2 bg-white rounded border">
                            <p className="text-sm text-gray-700">
                              {result.notes}
                            </p>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Completed by {result.completedBy} •{" "}
                          {formatDate(result.completedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : order.status === "in-progress" ? (
                  <div className="space-y-4">
                    {order.tests.map((testItem) => (
                      <div
                        key={testItem.id}
                        className="p-4 border border-orange-200 rounded-xl bg-orange-50/50"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {testItem.test.name}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Result Value
                            </label>
                            <input
                              type="text"
                              value={newResults[testItem.id]?.value || ""}
                              onChange={(e) =>
                                handleResultChange(
                                  testItem.id,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                              placeholder={`Enter result (${testItem.test.normalRange})`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={newResults[testItem.id]?.notes || ""}
                              onChange={(e) =>
                                handleResultChange(
                                  testItem.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                              placeholder="Add any notes or observations..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={submitResults}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit All Results
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Results pending</p>
                    <p className="text-sm">
                      Test results will appear here once completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            {order.clinicalNotes && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Clinical Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.clinicalNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
