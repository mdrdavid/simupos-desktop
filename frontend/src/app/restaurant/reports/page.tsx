/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useRestaurant } from "@/context/RestaurantContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, DollarSign, Download, Share, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RestaurantReports() {
  const { orders, menuItems, tables, generateReport } = useRestaurant()
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [activeTab, setActiveTab] = useState("sales")

  const periods = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
  ]

  const completedOrders = orders.filter((order) => order.status === "Completed")
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = completedOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Top selling items
  const itemSales = new Map()
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.menuItem.id
      if (itemSales.has(key)) {
        const existing = itemSales.get(key)
        itemSales.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price,
        })
      } else {
        itemSales.set(key, {
          item: item.menuItem,
          quantity: item.quantity,
          revenue: item.price,
        })
      }
    })
  })

  const topItems = Array.from(itemSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Table utilization
  const tableStats = tables
    .map((table) => {
      const tableOrders = completedOrders.filter((order) => order.tableId === table.id)
      const tableRevenue = tableOrders.reduce((sum, order) => sum + order.total, 0)
      return {
        table,
        ordersCount: tableOrders.length,
        revenue: tableRevenue,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting report...")
  }

  const handleShare = () => {
    // Share functionality would be implemented here
    console.log("Sharing report...")
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analyze your restaurant performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Report Period:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold">UGX {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-xl font-bold">UGX {averageOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tables Served</p>
                <p className="text-xl font-bold">{tableStats.filter((t) => t.ordersCount > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="tables">Table Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        UGX {completedOrders.reduce((sum, order) => sum + order.subtotal, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="font-medium">
                        UGX {completedOrders.reduce((sum, order) => sum + order.tax, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="font-medium">
                        UGX {completedOrders.reduce((sum, order) => sum + order.serviceCharge, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total Revenue</span>
                      <span className="font-bold">UGX {totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Order Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Orders</span>
                      <span className="font-medium">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelled Orders</span>
                      <span className="font-medium">{orders.filter((o) => o.status === "Cancelled").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-medium">UGX {averageOrderValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items per Order</span>
                      <span className="font-medium">
                        {totalOrders > 0
                          ? (completedOrders.reduce((sum, order) => sum + order.items.length, 0) / totalOrders).toFixed(
                              1,
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sales data available</p>
                ) : (
                  topItems.map((item, index) => (
                    <div key={item.item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.item.name}</h4>
                          <p className="text-sm text-gray-600">{item.item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantity} sold</p>
                        <p className="text-sm text-gray-600">UGX {item.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tableStats.map((stat) => (
                  <div key={stat.table.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Table {stat.table.number}</h4>
                        <p className="text-sm text-gray-600">
                          {stat.table.zone} • {stat.table.capacity} seats
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stat.ordersCount} orders</p>
                      <p className="text-sm text-gray-600">UGX {stat.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
