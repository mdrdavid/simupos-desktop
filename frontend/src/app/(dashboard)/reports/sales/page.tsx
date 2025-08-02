/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Download,
  Share,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  RefreshCw,
  Loader2,
} from "lucide-react"

interface Transaction {
  id: string
  customerName?: string
  timestamp: string
  amount: number
  paymentMethod: "cash" | "mtn_momo" | "airtel_money"
  items: Array<{
    name: string
    quantity: number
    price: number
    productType?: string
  }>
}

interface ProfitData {
  revenue: {
    totalRevenue: number
    totalSales: number
  }
  costs: {
    totalExpenses: number
    totalCOGS: number
  }
  profit: {
    grossProfit: number
    netProfit: number
    grossProfitMargin: number
    netProfitMargin: number
    profitGrowth?: number
  }
  breakdown: {
    topProfitableItems: Array<{
      item: { id: string; name: string }
      quantitySold: number
      revenue: number
      profit: number
      margin: number
    }>
  }
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    customerName: "John Doe",
    timestamp: new Date().toISOString(),
    amount: 25000,
    paymentMethod: "cash",
    items: [{ name: "Rice 5kg", quantity: 2, price: 12500, productType: "retail" }],
  },
  {
    id: "2",
    customerName: "Jane Smith",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    amount: 45000,
    paymentMethod: "mtn_momo",
    items: [{ name: "Cooking Oil 2L", quantity: 3, price: 15000, productType: "retail" }],
  },
]

const mockProfitData: ProfitData = {
  revenue: {
    totalRevenue: 150000,
    totalSales: 12,
  },
  costs: {
    totalExpenses: 25000,
    totalCOGS: 80000,
  },
  profit: {
    grossProfit: 70000,
    netProfit: 45000,
    grossProfitMargin: 46.7,
    netProfitMargin: 30.0,
    profitGrowth: 15.5,
  },
  breakdown: {
    topProfitableItems: [
      {
        item: { id: "1", name: "Rice 5kg" },
        quantitySold: 25,
        revenue: 62500,
        profit: 12500,
        margin: 20.0,
      },
      {
        item: { id: "2", name: "Cooking Oil 2L" },
        quantitySold: 15,
        revenue: 45000,
        profit: 9000,
        margin: 20.0,
      },
    ],
  },
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "quarter" | "year">("today")
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [profitData] = useState<ProfitData>(mockProfitData)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const periods = [
    { key: "today", label: "Today", icon: Calendar },
    { key: "week", label: "Week", icon: Calendar },
    { key: "month", label: "Month", icon: Calendar },
    { key: "quarter", label: "Quarter", icon: TrendingUp },
    { key: "year", label: "Year", icon: TrendingUp },
  ]

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date >= today) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } else if (date >= yesterday) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  const getPaymentBreakdown = () => {
    const breakdown = { cash: 0, mtn_momo: 0, airtel_money: 0 }
    transactions.forEach((transaction) => {
      breakdown[transaction.paymentMethod] += transaction.amount
    })
    return breakdown
  }

  const getSalesByTypeBreakdown = () => {
    const breakdown = { productSales: 0, serviceSales: 0 }
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const itemTotal = item.price * item.quantity
        if (item.productType === "service") {
          breakdown.serviceSales += itemTotal
        } else {
          breakdown.productSales += itemTotal
        }
      })
    })
    return breakdown
  }

  const paymentBreakdown = getPaymentBreakdown()
  const salesByTypeBreakdown = getSalesByTypeBreakdown()
  const totalSales = transactions.reduce((sum, t) => sum + t.amount, 0)

  const handleDownloadReport = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShareReport = () => {
    toast({
      title: "Share Report",
      description: "Share functionality will be implemented soon",
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Refreshed",
        description: "Data has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600">Analyze your business performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="bg-transparent">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleDownloadReport} disabled={loading} className="bg-transparent">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download
          </Button>
          <Button variant="outline" onClick={handleShareReport} className="bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key as any)}
                className={selectedPeriod !== period.key ? "bg-transparent" : ""}
              >
                <period.icon className="h-4 w-4 mr-2" />
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-100">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitData.profit.netProfit)}</div>
            <div className="flex items-center text-sm text-teal-100 mt-1">
              {profitData.profit.profitGrowth && profitData.profit.profitGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {profitData.profit.profitGrowth?.toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(profitData.revenue.totalRevenue)}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              {profitData.revenue.totalSales} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(profitData.costs.totalExpenses)}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Receipt className="h-3 w-3 mr-1" />
              Operating costs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{profitData.profit.netProfitMargin.toFixed(1)}%</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Net margin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">Gross Profit</span>
            </div>
            <span className="font-bold text-green-600">{formatCurrency(profitData.profit.grossProfit)}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-3" />
              <span className="font-medium">Total Expenses</span>
            </div>
            <span className="font-bold text-red-600">{formatCurrency(profitData.costs.totalExpenses)}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Net Profit</span>
            </div>
            <span className="font-bold text-blue-600">{formatCurrency(profitData.profit.netProfit)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Profitable Items */}
      {profitData.breakdown.topProfitableItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Profitable Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profitData.breakdown.topProfitableItems.slice(0, 3).map((item) => (
                <div key={item.item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{item.item.name}</h4>
                    <Badge variant="secondary">{item.margin.toFixed(1)}% margin</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sold:</span>
                      <p className="font-medium">{item.quantitySold}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue:</span>
                      <p className="font-medium">{formatCurrency(item.revenue)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit:</span>
                      <p className="font-medium text-green-600">{formatCurrency(item.profit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Cash</span>
              </div>
              <span className="font-semibold">{formatCurrency(paymentBreakdown.cash)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${totalSales > 0 ? (paymentBreakdown.cash / totalSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span>MTN MoMo</span>
              </div>
              <span className="font-semibold">{formatCurrency(paymentBreakdown.mtn_momo)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${totalSales > 0 ? (paymentBreakdown.mtn_momo / totalSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span>Airtel Money</span>
              </div>
              <span className="font-semibold">{formatCurrency(paymentBreakdown.airtel_money)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${totalSales > 0 ? (paymentBreakdown.airtel_money / totalSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span>Product Sales</span>
              </div>
              <span className="font-semibold">{formatCurrency(salesByTypeBreakdown.productSales)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${totalSales > 0 ? (salesByTypeBreakdown.productSales / totalSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                <span>Service Sales</span>
              </div>
              <span className="font-semibold">{formatCurrency(salesByTypeBreakdown.serviceSales)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{
                  width: `${totalSales > 0 ? (salesByTypeBreakdown.serviceSales / totalSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
              <p className="text-gray-500 text-sm">No sales recorded for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      {transaction.paymentMethod === "cash" ? (
                        <DollarSign className="h-5 w-5 text-teal-600" />
                      ) : (
                        <Users className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.customerName || "Walk-in Customer"}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.timestamp)}</p>
                      <p className="text-sm text-teal-600 capitalize">{transaction.paymentMethod.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">{formatCurrency(transaction.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
