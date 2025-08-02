"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useWelding } from "@/context/WeldingContext"

export default function WeldingMaterialsPage() {
  const { materialStock, deleteMaterialStockItem } = useWelding()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMaterials = materialStock.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplierInfo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockItems = materialStock.filter(
    (item) => item.lowStockThreshold && item.quantityInStock <= item.lowStockThreshold,
  )

  const handleDelete = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      deleteMaterialStockItem(itemId)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materials Stock</h1>
          <p className="text-gray-600 mt-2">Manage welding materials inventory</p>
        </div>
        <Link href="/welding/materials/create">
          <Button className="bg-violet-500 hover:bg-violet-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900">{materialStock.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">UGX 2.5M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search materials by name or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">
                      Only {item.quantityInStock} {item.unit} remaining
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <div className="grid gap-6">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first material"}
              </p>
              {!searchTerm && (
                <Link href="/welding/materials/create">
                  <Button className="bg-violet-500 hover:bg-violet-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Material
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                      {material.lowStockThreshold && material.quantityInStock <= material.lowStockThreshold && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">In Stock</p>
                        <p className="font-medium">
                          {material.quantityInStock} {material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Low Stock Threshold</p>
                        <p className="font-medium">
                          {material.lowStockThreshold ? `${material.lowStockThreshold} ${material.unit}` : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Supplier</p>
                        <p className="font-medium">{material.supplierInfo || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Restocked</p>
                        <p className="font-medium">
                          {material.lastRestockDate ? new Date(material.lastRestockDate).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>

                    {material.notes && <p className="text-gray-600 mb-4">{material.notes}</p>}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                      <Link href={`/welding/materials/${material.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
