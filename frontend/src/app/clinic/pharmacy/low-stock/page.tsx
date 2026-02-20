/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  Calendar,
  Truck,
  Plus,
  BarChart3,
  Download,
  Filter,
  RotateCcw,
  Clock,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LowStockPage() {
  const router = useRouter();
  const { getLowStockMedicines, medicines } = useClinic();
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const lowStockMedicines = getLowStockMedicines();

  // Categorize low stock by urgency
  const categorizedMedicines = lowStockMedicines.map((medicine) => {
    const stockDeficit = medicine.minStock - medicine.quantity;
    const deficitPercentage = (stockDeficit / medicine.minStock) * 100;

    let urgency = "medium";
    let color = "yellow";

    if (medicine.quantity === 0) {
      urgency = "critical";
      color = "red";
    } else if (deficitPercentage > 75) {
      urgency = "high";
      color = "orange";
    } else if (deficitPercentage <= 25) {
      urgency = "low";
      color = "blue";
    }

    return {
      ...medicine,
      urgency,
      color,
      stockDeficit,
      deficitPercentage,
    };
  });

  // Filter medicines by urgency
  const filteredMedicines =
    urgencyFilter === "all"
      ? categorizedMedicines
      : categorizedMedicines.filter((med) => med.urgency === urgencyFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    // Handle both Date objects and string dates safely
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "Out of Stock";
      case "high":
        return "Very Low";
      case "medium":
        return "Low Stock";
      case "low":
        return "Below Minimum";
      default:
        return "Low Stock";
    }
  };

  const getTotalReorderCost = () => {
    return filteredMedicines.reduce((total, medicine) => {
      const reorderQuantity = Math.max(
        0,
        medicine.minStock * 2 - medicine.quantity
      ); // Suggest ordering 2x min stock
      return total + reorderQuantity * medicine.unitPrice;
    }, 0);
  };

  const getTotalReorderUnits = () => {
    return filteredMedicines.reduce((total, medicine) => {
      const reorderQuantity = Math.max(
        0,
        medicine.minStock * 2 - medicine.quantity
      );
      return total + reorderQuantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 px-6 py-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="border-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  Low Stock Alert
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredMedicines.length} of {lowStockMedicines.length}{" "}
                  medicines need immediate attention
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Link href="/clinic/pharmacy/stock-entry">
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Restock Items
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 bg-red-50 border-l-4 border-l-red-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Critical</p>
                    <p className="text-2xl font-bold text-red-800">
                      {
                        categorizedMedicines.filter(
                          (m) => m.urgency === "critical"
                        ).length
                      }
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-orange-50 border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      High Priority
                    </p>
                    <p className="text-2xl font-bold text-orange-800">
                      {
                        categorizedMedicines.filter((m) => m.urgency === "high")
                          .length
                      }
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-yellow-50 border-l-4 border-l-yellow-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">
                      Medium Priority
                    </p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {
                        categorizedMedicines.filter(
                          (m) => m.urgency === "medium"
                        ).length
                      }
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-blue-50 border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Low Priority
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {
                        categorizedMedicines.filter((m) => m.urgency === "low")
                          .length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter by urgency:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "critical", "high", "medium", "low"].map((filter) => (
                <Button
                  key={filter}
                  variant={urgencyFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUrgencyFilter(filter)}
                  className={`
                    ${
                      urgencyFilter === filter
                        ? filter === "critical"
                          ? "bg-red-600 hover:bg-red-700"
                          : filter === "high"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : filter === "medium"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : filter === "low"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-600 hover:bg-gray-700"
                        : "border-gray-300"
                    }
                  `}
                >
                  {filter === "all"
                    ? "All Items"
                    : filter === "critical"
                      ? "Critical"
                      : filter === "high"
                        ? "High Priority"
                        : filter === "medium"
                          ? "Medium Priority"
                          : "Low Priority"}
                </Button>
              ))}
              {urgencyFilter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUrgencyFilter("all")}
                  className="border-gray-300"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reorder Summary */}
        {filteredMedicines.length > 0 && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-green-400 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Recommended Reorder
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">
                        Total Items to Reorder:
                      </span>
                      <span className="font-semibold ml-2">
                        {filteredMedicines.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Units Needed:</span>
                      <span className="font-semibold ml-2">
                        {getTotalReorderUnits().toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold text-green-600 ml-2">
                        {formatCurrency(getTotalReorderCost())}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href="/clinic/pharmacy/stock-entry">
                  <Button className="bg-green-600 hover:bg-green-700 shadow-sm">
                    <Truck className="h-4 w-4 mr-2" />
                    Bulk Restock
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Stock List */}
        <div className="space-y-4">
          {filteredMedicines.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {urgencyFilter !== "all"
                    ? "No items match this filter"
                    : "All medicines are well stocked!"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {urgencyFilter !== "all"
                    ? "Try selecting a different urgency level to see items that need attention."
                    : "No medicines are currently below their minimum stock level. Great job managing your inventory!"}
                </p>
                <div className="flex gap-3 justify-center">
                  {urgencyFilter !== "all" ? (
                    <Button
                      onClick={() => setUrgencyFilter("all")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Show All Items
                    </Button>
                  ) : (
                    <Link href="/clinic/pharmacy">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Full Inventory
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMedicines.map((medicine) => (
                <Card
                  key={medicine.id}
                  className={`border-l-4 ${
                    medicine.urgency === "critical"
                      ? "border-l-red-400 bg-red-50"
                      : medicine.urgency === "high"
                        ? "border-l-orange-400 bg-orange-50"
                        : medicine.urgency === "medium"
                          ? "border-l-yellow-400 bg-yellow-50"
                          : "border-l-blue-400 bg-blue-50"
                  } hover:shadow-lg transition-all duration-200`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            medicine.urgency === "critical"
                              ? "bg-red-100"
                              : medicine.urgency === "high"
                                ? "bg-orange-100"
                                : medicine.urgency === "medium"
                                  ? "bg-yellow-100"
                                  : "bg-blue-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              medicine.urgency === "critical"
                                ? "text-red-600"
                                : medicine.urgency === "high"
                                  ? "text-orange-600"
                                  : medicine.urgency === "medium"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {medicine.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                              variant="outline"
                              className={getUrgencyColor(medicine.urgency)}
                            >
                              {getUrgencyLabel(medicine.urgency)}
                            </Badge>
                            {medicine.category && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700"
                              >
                                {medicine.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Current Stock:
                        </span>
                        <span className="font-semibold">
                          {medicine.quantity} {medicine.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Minimum Required:
                        </span>
                        <span className="font-semibold">
                          {medicine.minStock} {medicine.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            medicine.urgency === "critical"
                              ? "bg-red-500"
                              : medicine.urgency === "high"
                                ? "bg-orange-500"
                                : medicine.urgency === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (medicine.quantity / medicine.minStock) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Batch: {medicine.batch}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {formatDate(medicine.expiryDate)}</span>
                      </div>
                      {medicine.supplier && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>Supplier: {medicine.supplier}</span>
                        </div>
                      )}
                    </div>

                    {/* Reorder Information */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">
                          Recommended reorder:
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          {Math.max(
                            medicine.minStock * 2 - medicine.quantity,
                            medicine.minStock
                          )}{" "}
                          units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Cost to restock:
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            Math.max(
                              medicine.minStock * 2 - medicine.quantity,
                              medicine.minStock
                            ) * medicine.unitPrice
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2 pt-4">
                      <Link
                        href={`/clinic/pharmacy/stock-entry?medicine=${medicine.id}`}
                        className="flex-1"
                      >
                        <Button
                          className={`w-full ${
                            medicine.urgency === "critical"
                              ? "bg-red-600 hover:bg-red-700"
                              : medicine.urgency === "high"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : medicine.urgency === "medium"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Restock Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
