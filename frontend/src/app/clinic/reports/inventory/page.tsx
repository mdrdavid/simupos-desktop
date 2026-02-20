/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useClinic } from "@/context/ClinicContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Download, AlertTriangle, Package, DollarSign, Calendar } from "lucide-react"
import { addDays, format, differenceInDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"

export default function InventoryReportsPage() {
  const { medicines, generateReport } = useClinic()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")

  // Generate inventory report (load async report and store data in state)
    const [inventoryData, setInventoryData] = useState<any>({
      totalValue: 0,
      totalMedicines: medicines.length,
      lowStockMedicines: [],
      expiredMedicines: [],
    })
  
    useEffect(() => {
      let mounted = true
  
      async function loadReport() {
        try {
          const report = await generateReport("inventory", selectedPeriod, dateRange?.from, dateRange?.to)
          if (!mounted) return
          // prefer report.data when present, otherwise use report itself
          setInventoryData(report?.data ?? report)
        } catch (err) {
          // fail silently; keep default inventoryData
          // console.error(err)
        }
      }
  
      loadReport()
      return () => {
        mounted = false
      }
    }, [generateReport, selectedPeriod, dateRange?.from, dateRange?.to, medicines.length])

  // Medicine categories distribution
  const categoryStats = medicines.reduce(
    (acc, medicine) => {
      const category = medicine.category || "Other"
      acc[category] = (acc[category] || 0) + medicine.quantity
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categoryStats).map(([category, quantity]) => ({
    name: category,
    value: quantity,
    percentage: ((quantity / medicines.reduce((sum, med) => sum + med.quantity, 0)) * 100).toFixed(1),
  }))

  // Stock level analysis
  const stockLevels = medicines.map((medicine) => {
    const stockRatio = medicine.quantity / medicine.minStock
    let status = "Good"
    if (medicine.quantity === 0) status = "Out of Stock"
    else if (medicine.quantity <= medicine.minStock) status = "Low Stock"
    else if (stockRatio < 2) status = "Moderate"

    return {
      ...medicine,
      stockRatio,
      status,
      daysToExpiry: differenceInDays(medicine.expiryDate, new Date()),
      value: medicine.quantity * medicine.unitPrice,
    }
  })

  const stockStatusData = stockLevels.reduce(
    (acc, medicine) => {
      acc[medicine.status] = (acc[medicine.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const stockStatusChartData = Object.entries(stockStatusData).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: ((count / medicines.length) * 100).toFixed(1),
  }))

  // Top value medicines
  const topValueMedicines = stockLevels
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((medicine) => ({
      name: medicine.name.length > 15 ? medicine.name.substring(0, 15) + "..." : medicine.name,
      value: medicine.value,
      quantity: medicine.quantity,
      unitPrice: medicine.unitPrice,
    }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]
  const STATUS_COLORS = {
    Good: "#00C49F",
    Moderate: "#FFBB28",
    "Low Stock": "#FF8042",
    "Out of Stock": "#FF4444",
  }

  const totalInventoryValue = inventoryData.totalValue
  const lowStockCount = inventoryData.lowStockMedicines.length
  const expiredCount = inventoryData.expiredMedicines.length

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clinic/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
          <p className="text-gray-600">Medicine stock levels, usage, and expiry tracking</p>
        </div>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-green-600">UGX {totalInventoryValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-lg font-bold text-blue-600">{inventoryData.totalMedicines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-lg font-bold text-orange-600">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-lg font-bold text-red-600">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
            <CardDescription>Current stock levels across all medicines</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medicine Categories</CardTitle>
            <CardDescription>Inventory distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Quantity",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Value Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Highest Value Medicines</CardTitle>
          <CardDescription>Medicines with the highest inventory value</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Value",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topValueMedicines} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Low Stock Alerts</span>
            </CardTitle>
            <CardDescription>Medicines requiring immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {inventoryData.lowStockMedicines.map((medicine: any) => (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-800">{medicine.name}</p>
                    <p className="text-sm text-orange-600">
                      Current: {medicine.quantity} | Min: {medicine.minStock}
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
              {inventoryData.lowStockMedicines.length === 0 && (
                <p className="text-center text-gray-500 py-4">No low stock items</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <span>Expiry Alerts</span>
            </CardTitle>
            <CardDescription>Medicines that have expired or expiring soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {inventoryData.expiredMedicines.map((medicine: any) => (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">{medicine.name}</p>
                    <p className="text-sm text-red-600">
                      Expires: {format(new Date(medicine.expiryDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge variant="destructive">Expired</Badge>
                </div>
              ))}
              {inventoryData.expiredMedicines.length === 0 && (
                <p className="text-center text-gray-500 py-4">No expired items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Insights</CardTitle>
          <CardDescription>Key recommendations and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Inventory Health</h4>
              </div>
              <p className="text-sm text-blue-700">
                {(((medicines.length - lowStockCount - expiredCount) / medicines.length) * 100).toFixed(1)}% of
                inventory is in good condition
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Average Medicine Value</h4>
              </div>
              <p className="text-sm text-green-700">
                UGX {Math.round(totalInventoryValue / medicines.length).toLocaleString()} per medicine
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Recommendations</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Reorder {lowStockCount} medicines that are below minimum stock levels</li>
              <li>• Remove or discount {expiredCount} expired medicines</li>
              <li>• Implement FIFO (First In, First Out) system for better rotation</li>
              <li>• Set up automated alerts for medicines expiring within 30 days</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
