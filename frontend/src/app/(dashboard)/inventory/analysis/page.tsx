/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, TrendingUp, AlertTriangle, FileText, FileSpreadsheet, Calendar, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Item, StockMovement } from "@/context/DataContext"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { generateExcelFile, generatePdfFile } from "@/src/utils/exportUtils"
import { useBranch } from "@/context/BranchContext"

export default function InventoryAnalysisPage() {
  const {
    items,
    stockMovements,
    getStockMovements,
    stockSummary,
    getLowStockItems,
    getOutOfStockItems,
    getStockValue,
    getAllBranchItems,
    loading
  } = useData()
  const { currentBranch } = useBranch()
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "quarter" | "year">("week")
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<"excel" | "pdf" | null>(null)

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const result = await getStockMovements({
          itemId: selectedItem,
          // You can add more filters here based on selectedPeriod if your backend supports it
        });
        setMovements(result);
      } catch (error) {
        console.error("Error fetching movements:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stock movements.",
          variant: "destructive",
        });
      }
    };

    fetchMovements();
  }, [selectedItem, selectedPeriod, getStockMovements]);

  const periods = [
    { key: "day", label: "Today", icon: Calendar },
    { key: "week", label: "Week", icon: Calendar },
    { key: "month", label: "Month", icon: Calendar },
    { key: "quarter", label: "Quarter", icon: Calendar },
    { key: "year", label: "Year", icon: Calendar },
  ]

  const lowStockItems = getLowStockItems()
  const outOfStockItems = getOutOfStockItems()
  const stockValue = getStockValue()

  const handleExport = async (type: "excel" | "pdf") => {
    setIsExporting(true)
    setExportType(type)

    try {
      const allItems = await getAllBranchItems()
      if (type === 'excel') {
        await generateExcelFile(movements, allItems, selectedPeriod, selectedItem, currentBranch || undefined)
      } else {
        await generatePdfFile(movements, allItems, selectedPeriod, selectedItem, currentBranch || undefined)
      }
      toast({
        title: "Export Successful",
        description: `Your inventory report has been generated as a ${type.toUpperCase()} file.`,
      })
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error)
      toast({
        title: "Export Failed",
        description: `There was an error generating your ${type.toUpperCase()} file.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
      case "production_output":
      case "initial":
        return "↗️"
      case "out":
      case "production_input":
        return "↘️"
      case "adjustment":
        return "🔄"
      default:
        return "❓"
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in":
      case "production_output":
      case "initial":
        return "text-green-600"
      case "out":
      case "production_input":
        return "text-red-600"
      case "adjustment":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStockStatus = (item: Item) => {
    if (item.productType === "service") return null
    if (!item.stockQuantity && item.stockQuantity !== 0) return null

    if (item.stockQuantity === 0) {
      return { status: "Out of Stock", color: "bg-red-100 text-red-800" }
    }
    if (item.stockQuantity < 10) {
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    }
    return { status: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const filteredMovements = selectedItem ? movements.filter((m) => m.item?.id === selectedItem) : movements

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Analysis</h1>
          <p className="text-gray-600">Detailed insights into your inventory performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.totalItems}</div>
            <p className="text-xs text-muted-foreground">Tracked items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value (Selling)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockValue.selling)}</div>
            <p className="text-xs text-muted-foreground">Total selling value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockValue.profit)}</div>
            <p className="text-xs text-muted-foreground">If all stock sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Inventory Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => handleExport("excel")} disabled={isExporting} className="flex-1">
              {isExporting && exportType === "excel" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export to Excel
            </Button>
            <Button onClick={() => handleExport("pdf")} disabled={isExporting} variant="outline" className="flex-1">
              {isExporting && exportType === "pdf" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Export to PDF
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {selectedItem
              ? `Exporting data for selected item only`
              : `Exporting all ${movements.length} movements for ${selectedPeriod} period`}
          </p>
        </CardContent>
      </Card>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setSelectedPeriod(period.key as any)}
              >
                <period.icon className="w-4 h-4 mr-2" />
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Item {selectedItem && "(Filtered)"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedItem || "all-items"} onValueChange={(value) => setSelectedItem(value === "all-items" ? undefined : value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select an item to filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-items">All Items</SelectItem>
                {items
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <Button variant="outline" onClick={() => setSelectedItem(undefined)}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements ({filteredMovements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No movements found</h3>
              <p className="text-gray-600">No stock movements for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map((movement) => (
                <div key={movement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMovementIcon(movement.type)}</span>
                      <div>
                        <h4 className="font-semibold">{movement.item?.name || "Unknown Item"}</h4>
                        <p className="text-sm text-gray-600">{movement.reason || "Stock movement"}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getMovementColor(movement.type)}`}>
                      {movement.type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDate(movement.createdAt)}</span>
                    <span>
                      Stock: {movement.previousStock} → {movement.newStock} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">Only {item.stockQuantity} units left</p>
                    {item.purchasePrice && (
                      <p className="text-sm text-green-600">
                        Profit: {formatCurrency(item.sellingPrice - item.purchasePrice)}/unit
                      </p>
                    )}
                  </div>
                  <Link href={`/inventory/edit/${item.id}`}>
                    <Button size="sm">Restock</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock Alert */}
      {outOfStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Out of Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outOfStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">Out of stock</p>
                    {item.purchasePrice && (
                      <p className="text-sm text-red-600">
                        Lost profit: {formatCurrency(item.sellingPrice - item.purchasePrice)}/unit
                      </p>
                    )}
                  </div>
                  <Link href={`/inventory/edit/${item.id}`}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Urgent Restock
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
