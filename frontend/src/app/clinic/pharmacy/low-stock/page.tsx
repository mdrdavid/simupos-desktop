"use client";

import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Package, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LowStockPage() {
  const router = useRouter();
  const { getLowStockMedicines } = useClinic();

  const lowStockMedicines = getLowStockMedicines();

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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Low Stock Alert</h1>
          <p className="text-gray-600">
            {lowStockMedicines.length} medicines need restocking
          </p>
        </div>
      </div>

      {/* Low Stock List */}
      <div className="space-y-3">
        {lowStockMedicines.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All medicines are well stocked!
              </h3>
              <p className="text-gray-600 mb-4">
                No medicines are currently below their minimum stock level.
              </p>
              <Link href="/clinic/pharmacy">
                <Button>View All Medicines</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          lowStockMedicines.map((medicine) => (
            <Card key={medicine.id} className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-900">
                        {medicine.name}
                      </h3>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Low Stock
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        <span>
                          Current Stock: {medicine.quantity} / Minimum:{" "}
                          {medicine.minStock}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Batch: {medicine.batch} • Expires:{" "}
                          {formatDate(medicine.expiryDate)}
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

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">
                      Need to reorder:
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      {Math.max(0, medicine.minStock - medicine.quantity)} units
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Button */}
      {lowStockMedicines.length > 0 && (
        <div className="flex justify-center">
          <Link href="/clinic/pharmacy/stock-entry">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Package className="h-4 w-4 mr-2" />
              Add Stock Entry
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
