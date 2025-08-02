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
        matchesStock = medicine.expiryDate <= new Date();
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (medicine.quantity <= medicine.minStock) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800" };
    }
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return { label: "Expired", color: "bg-red-100 text-red-800" };
    } else if (daysUntilExpiry <= 30) {
      return { label: "Expires Soon", color: "bg-orange-100 text-orange-800" };
    } else {
      return null;
    }
  };

  const handleDeleteMedicine = (medicineId: string) => {
    deleteMedicine(medicineId);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-600">
            {filteredMedicines.length} medicines in inventory
          </p>
        </div>
        <Link href="/clinic/pharmacy/stock-entry">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Stock Entry
          </Button>
        </Link>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lowStockMedicines.length > 0 && (
          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">
                    Low Stock Alert
                  </p>
                  <p className="text-sm text-yellow-600">
                    {lowStockMedicines.length} medicine(s) need restocking
                  </p>
                </div>
              </div>
              <Link href="/clinic/pharmacy/low-stock">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-transparent"
                >
                  View Low Stock Items
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {expiredMedicines.length > 0 && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Expired Items</p>
                  <p className="text-sm text-red-600">
                    {expiredMedicines.length} medicine(s) have expired
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 bg-transparent"
              >
                View Expired Items
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search medicines, batch, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
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
            <SelectTrigger>
              <SelectValue placeholder="Filter by stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Medicines List */}
      <div className="space-y-3">
        {filteredMedicines.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ||
                categoryFilter !== "all" ||
                stockFilter !== "all"
                  ? "No medicines found"
                  : "No medicines yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ||
                categoryFilter !== "all" ||
                stockFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first medicine to get started"}
              </p>
              {!searchQuery &&
                categoryFilter === "all" &&
                stockFilter === "all" && (
                  <Link href="/clinic/pharmacy/stock-entry">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medicine
                    </Button>
                  </Link>
                )}
            </CardContent>
          </Card>
        ) : (
          filteredMedicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine);
            const expiryStatus = getExpiryStatus(medicine.expiryDate);

            return (
              <Card
                key={medicine.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {medicine.name}
                        </h3>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                        {expiryStatus && (
                          <Badge className={expiryStatus.color}>
                            {expiryStatus.label}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="h-4 w-4 mr-2" />
                          <span>
                            Stock: {medicine.quantity} / Min:{" "}
                            {medicine.minStock} • Batch: {medicine.batch}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Expires: {formatDate(medicine.expiryDate)}
                          </span>
                        </div>

                        {medicine.supplier && (
                          <p className="text-sm text-gray-600">
                            Supplier: {medicine.supplier}
                          </p>
                        )}

                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(medicine.unitPrice)} per unit
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/clinic/pharmacy/${medicine.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {medicine.name}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMedicine(medicine.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
