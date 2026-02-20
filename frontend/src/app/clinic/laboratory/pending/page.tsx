/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  User,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClinic } from "@/context/ClinicContext";

export default function PendingOrdersPage() {
  const router = useRouter();
  const { getPendingLabOrders, updateLabOrder } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");

  const pendingOrders = getPendingLabOrders();

  const filteredOrders = pendingOrders.filter(
    (order) =>
      order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.referringDoctor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartTest = (orderId: string) => {
    updateLabOrder(orderId, { status: "in-progress" });
  };

  const handleCompleteOrder = (orderId: string) => {
    updateLabOrder(orderId, {
      status: "completed",
      completedDate: new Date(),
    });
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

  const getUrgentTests = (order: any) => {
    return order.tests.filter((test: any) => test.priority === "urgent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Pending Tests
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredOrders.length} orders awaiting processing
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pending orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-orange-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Pending Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const urgentTests = getUrgentTests(order);
            return (
              <Card
                key={order.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-orange-300 bg-white/80 backdrop-blur-sm overflow-hidden group"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    urgentTests.length > 0
                      ? "bg-gradient-to-r from-red-500 to-orange-600"
                      : "bg-gradient-to-r from-orange-500 to-yellow-600"
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-6">
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {order.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.patient.age} years • {order.patient.gender}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {order.status === "pending" ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {order.status.replace("-", " ")}
                    </Badge>
                  </div>

                  {/* Tests List */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-purple-500" />
                      Tests Ordered ({order.tests.length})
                    </h4>
                    {order.tests.map((testItem: any) => (
                      <div
                        key={testItem.id}
                        className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {testItem.test.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={
                                testItem.priority === "urgent"
                                  ? "bg-red-100 text-red-800 border-red-200 text-xs"
                                  : "bg-gray-100 text-gray-800 border-gray-200 text-xs"
                              }
                            >
                              {testItem.priority}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {testItem.test.sampleType} •{" "}
                              {testItem.test.duration} mins
                            </span>
                          </div>
                        </div>
                        {testItem.notes && (
                          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                            {testItem.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {order.referringDoctor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Dr. {order.referringDoctor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Ordered {formatDate(order.orderDate)}</span>
                    </div>
                    {order.clinicalNotes && (
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200/50">
                        <p className="text-sm text-blue-800">
                          {order.clinicalNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100/60">
                    {order.status === "pending" && (
                      <Button
                        onClick={() => handleStartTest(order.id)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Tests
                      </Button>
                    )}
                    {order.status === "in-progress" && (
                      <Button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete All
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/clinic/laboratory/orders/${order.id}`)
                      }
                      className="flex-1 border-gray-300 hover:border-orange-300 bg-white/80 hover:bg-white"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle className="h-16 w-16 text-orange-500" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                No pending tests
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {searchQuery
                  ? "No pending orders match your search criteria."
                  : "All laboratory tests are completed and up to date!"}
              </p>
              {!searchQuery && (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/clinic/laboratory/new-order")}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25"
                  >
                    Create New Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/clinic/laboratory/orders")}
                    className="border-gray-300 hover:border-orange-300"
                  >
                    View All Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
