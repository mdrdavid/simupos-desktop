"use client";

import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Pill,
  AlertTriangle,
  Calendar,
  Package,
  Filter,
  BarChart3,
  Download,
  MoreVertical,
  Eye,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { Medicine } from "@/src/types/clinic";

export default function PharmacyPage() {
  const {
    medicines,
    deleteMedicine,
    getLowStockMedicines,
    getExpiredMedicines,
  } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const lowStockMedicines = getLowStockMedicines();
  const expiredMedicines = getExpiredMedicines();

  const categories = [
    ...new Set(medicines.map((med) => med.category).filter(Boolean)),
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.supplier?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || medicine.category === categoryFilter;

    // Convert expiryDate to Date object for comparison
    const expiryDate =
      typeof medicine.expiryDate === "string"
        ? new Date(medicine.expiryDate)
        : medicine.expiryDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesStock = true;
    switch (stockFilter) {
      case "in-stock":
        matchesStock = medicine.quantity > medicine.minStock;
        break;
      case "low-stock":
        matchesStock =
          medicine.quantity <= medicine.minStock && medicine.quantity > 0;
        break;
      case "out-of-stock":
        matchesStock = medicine.quantity === 0;
        break;
      case "expired":
        matchesStock = expiryDate <= today;
        break;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800 border-red-200",
        textColor: "text-red-600",
      };
    } else if (medicine.quantity <= medicine.minStock) {
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        textColor: "text-yellow-600",
      };
    } else {
      return {
        label: "In Stock",
        color: "bg-green-100 text-green-800 border-green-200",
        textColor: "text-green-600",
      };
    }
  };

  const getExpiryStatus = (expiryDate: Date | string) => {
    // Convert to Date object if it's a string
    const expiry =
      typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
    const today = new Date();

    // Reset time parts for accurate day calculation
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        label: "Expired",
        color: "bg-red-100 text-red-800 border-red-200",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        label: "Expires Soon",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    } else {
      return null;
    }
  };

  const handleDeleteMedicine = (medicineId: string) => {
    deleteMedicine(medicineId);
  };

  const getStockPercentage = (medicine: Medicine) => {
    const maxReasonableStock = medicine.minStock * 3; // Assume max stock is 3x min stock
    return Math.min((medicine.quantity / maxReasonableStock) * 100, 100);
  };

  const totalInventoryValue = medicines.reduce(
    (total, med) => total + med.quantity * med.unitPrice,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pharmacy Inventory
            </h1>
            <p className="text-gray-600 mt-1">
              Manage {filteredMedicines.length} medicines with total value of{" "}
              {formatCurrency(totalInventoryValue)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/clinic/pharmacy/stock-entry">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Stock Entry
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medicines, batch, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-11 border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-40 h-11 border-gray-300">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery ||
              categoryFilter !== "all" ||
              stockFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
                className="h-11 border-gray-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {lowStockMedicines.length > 0 && (
          <Card className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-yellow-800">
                      Low Stock Alert
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {lowStockMedicines.length}
                    </Badge>
                  </div>
                  <p className="text-yellow-700 mb-4">
                    {lowStockMedicines.length} medicine(s) need immediate
                    restocking to avoid shortages
                  </p>
                  <Link href="/clinic/pharmacy/low-stock">
                    <Button
                      variant="outline"
                      className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                    >
                      View Low Stock Items
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {expiredMedicines.length > 0 && (
          <Card className="border-l-4 border-l-red-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-red-800">Expired Items</h3>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      {expiredMedicines.length}
                    </Badge>
                  </div>
                  <p className="text-red-700 mb-4">
                    {expiredMedicines.length} medicine(s) have expired and need
                    attention
                  </p>
                  <Button
                    variant="outline"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    Manage Expired Items
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                ? "No medicines found"
                : "No medicines in inventory"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Start building your pharmacy inventory by adding your first medicine."}
            </p>
            {!searchQuery &&
              categoryFilter === "all" &&
              stockFilter === "all" && (
                <Link href="/clinic/pharmacy/stock-entry">
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Medicine
                  </Button>
                </Link>
              )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine);
            const expiryStatus = getExpiryStatus(medicine.expiryDate);
            const stockPercentage = getStockPercentage(medicine);

            return (
              <Card
                key={medicine.id}
                className="hover:shadow-lg transition-all duration-200 border border-gray-200 group"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {medicine.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Batch: {medicine.batch}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Medicine
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={stockStatus.color}>
                      {stockStatus.label}
                    </Badge>
                    {expiryStatus && (
                      <Badge variant="outline" className={expiryStatus.color}>
                        {expiryStatus.label}
                      </Badge>
                    )}
                    {medicine.category && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700"
                      >
                        {medicine.category}
                      </Badge>
                    )}
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Stock Level</span>
                      <span className={stockStatus.textColor}>
                        {medicine.quantity} units
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stockStatus.label === "Out of Stock"
                            ? "bg-red-500"
                            : stockStatus.label === "Low Stock"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: {medicine.minStock}</span>
                      <span>Optimal</span>
                    </div>
                  </div>

                  {/* Medicine Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Expires: {formatDate(medicine.expiryDate)}
                      </span>
                    </div>

                    {medicine.supplier && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {medicine.supplier}
                        </span>
                      </div>
                    )}

                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(medicine.unitPrice)} / unit
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/clinic/pharmacy/${medicine.id}/edit`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {medicine.name}&quot;? This action cannot be undone
                            and will remove this medicine from your inventory.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMedicine(medicine.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Medicine
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {filteredMedicines.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="border-gray-300">
            Load More Medicines
          </Button>
        </div>
      )}
    </div>
  );
}
