"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, Filter, RefreshCw, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData, type Item } from "@/context/DataContext"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function InventoryPage() {
  const { items } = useData()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [restockModalOpen, setRestockModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalItemsCount = items.length
  const filteredItemsCount = filteredItems.length
  const lowStockItems = items.filter((item) => item.stockQuantity !== undefined && item.stockQuantity < 10)
  const outOfStockItems = items.filter((item) => item.stockQuantity === 0)

  const handleDeleteItem = async (id: string, name: string) => {
    try {
      // Implement delete logic here
      toast({
        title: "Item Deleted",
        description: `${name} has been deleted successfully`,
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleRestock = async () => {
    if (!selectedItem || !restockQuantity.trim() || isNaN(Number(restockQuantity))) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    const quantity = Number(restockQuantity)
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      })
      return
    }

    try {
      // Implement restock logic here
      toast({
        title: "Stock Updated",
        description: `Added ${quantity} units to ${selectedItem.name}`,
      })
      setRestockModalOpen(false)
      setRestockQuantity("")
      setSelectedItem(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Inventory has been updated",
    })
  }

  const getStockStatus = (item: Item) => {
    if (item.productType === "service") return null
    if (!item.stockQuantity && item.stockQuantity !== 0) return null

    if (item.stockQuantity === 0) {
      return { status: "Out of Stock", color: "bg-red-100 text-red-800", icon: AlertTriangle }
    }
    if (item.stockQuantity < 10) {
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    }
    return { status: "In Stock", color: "bg-green-100 text-green-800", icon: Package }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/analysis">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis
            </Button>
          </Link>
          <Link href="/inventory/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsCount}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below 10 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items with 0 stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(items.map((item) => item.category).filter(Boolean)).size}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items by name or category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing: <span className="font-semibold text-primary">{filteredItemsCount}</span> of{" "}
              <span className="font-semibold text-primary">{totalItemsCount}</span> items
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 text-center">
                  {searchQuery ? "Try adjusting your search" : "Add your first item to get started"}
                </p>
                {!searchQuery && (
                  <Link href="/inventory/add">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getStockStatus(item)
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{formatCurrency(item.sellingPrice)}</p>
                      {item.purchasePrice && (
                        <p className="text-sm text-gray-600 mb-2">Cost: {formatCurrency(item.purchasePrice)}</p>
                      )}
                    </div>
                    <Package className="w-6 h-6 text-primary" />
                  </div>

                  <div className="space-y-2 mb-4">
                    {stockStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <Badge className={stockStatus.color}>
                          <stockStatus.icon className="w-3 h-3 mr-1" />
                          {item.stockQuantity !== undefined
                            ? `${item.stockQuantity} ${item.unit || ""}`
                            : "Not tracked"}
                        </Badge>
                      </div>
                    )}
                    {item.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge variant="secondary">
                        {item.productType.charAt(0).toUpperCase() + item.productType.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/inventory/edit/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    {item.productType !== "service" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item)
                          setRestockModalOpen(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{item.name}&ldquo;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Restock Modal */}
      <Dialog open={restockModalOpen} onOpenChange={setRestockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>Add stock to {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold">{selectedItem.name}</h4>
                <p className="text-sm text-gray-600">Current Stock: {selectedItem.stockQuantity || 0} units</p>
                <p className="text-sm text-gray-600">Selling Price: {formatCurrency(selectedItem.sellingPrice)}</p>
                {selectedItem.purchasePrice && (
                  <p className="text-sm text-gray-600">Cost Price: {formatCurrency(selectedItem.purchasePrice)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">Quantity to Add</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity to add"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                />
              </div>
              {restockQuantity && !isNaN(Number(restockQuantity)) && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">
                    New Total: {(selectedItem.stockQuantity || 0) + Number(restockQuantity)} units
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestock}>Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
