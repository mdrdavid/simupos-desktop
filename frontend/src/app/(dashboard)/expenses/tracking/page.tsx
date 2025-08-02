/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, TrendingDown, Receipt, CheckCircle, XCircle, BarChart3 } from "lucide-react"

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  vendor?: string
  paymentMethod: "cash" | "bank" | "mobile_money"
  isRecurring: boolean
  date: string
}

interface ProfitData {
  revenue: {
    totalRevenue: number
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
  }
}

// Mock data
const mockExpenses: Expense[] = [
  {
    id: "1",
    amount: 50000,
    description: "Office rent payment",
    category: "Rent",
    vendor: "Property Manager",
    paymentMethod: "bank",
    isRecurring: true,
    date: new Date().toISOString(),
  },
  {
    id: "2",
    amount: 25000,
    description: "Electricity bill",
    category: "Utilities",
    vendor: "UMEME",
    paymentMethod: "mobile_money",
    isRecurring: false,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    amount: 15000,
    description: "Office supplies",
    category: "Equipment",
    paymentMethod: "cash",
    isRecurring: false,
    date: new Date(Date.now() - 172800000).toISOString(),
  },
]

const mockProfitData: ProfitData = {
  revenue: {
    totalRevenue: 200000,
  },
  costs: {
    totalExpenses: 90000,
    totalCOGS: 60000,
  },
  profit: {
    grossProfit: 140000,
    netProfit: 50000,
    grossProfitMargin: 70.0,
    netProfitMargin: 25.0,
  },
}

export default function ExpenseTrackingPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("month")
  const [expenses] = useState<Expense[]>(mockExpenses)
  const [profitData] = useState<ProfitData>(mockProfitData)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false)

  const periods = [
    { key: "day", label: "Today", icon: Calendar },
    { key: "week", label: "Week", icon: Calendar },
    { key: "month", label: "Month", icon: Calendar },
    { key: "year", label: "Year", icon: BarChart3 },
  ]

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "inventory":
        return "📦"
      case "utilities":
        return "⚡"
      case "transport":
        return "🚗"
      case "rent":
        return "🏠"
      case "marketing":
        return "📢"
      case "equipment":
        return "🔧"
      case "staff":
        return "👥"
      case "insurance":
        return "🛡️"
      case "maintenance":
        return "🔨"
      default:
        return "📄"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      inventory: "#FF6B6B",
      utilities: "#4ECDC4",
      transport: "#45B7D1",
      rent: "#96CEB4",
      marketing: "#FFEAA7",
      equipment: "#DDA0DD",
      staff: "#98D8C8",
      insurance: "#74B9FF",
      maintenance: "#FD79A8",
    }
    return colors[category.toLowerCase() as keyof typeof colors] || "#95A5A6"
  }

  const getExpensesByCategory = () => {
    const breakdown: Record<string, number> = {}
    expenses.forEach((expense) => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount
    })
    return breakdown
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const expensesByCategory = getExpensesByCategory()
  const recentExpenses = expenses.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-teal-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Expense Tracking</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/expenses/add")}
            className="text-white hover:bg-teal-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
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

        {/* Business Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Gross Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profitData.profit.grossProfit)}</div>
              <div className="flex items-center text-sm text-green-100 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                {profitData.profit.grossProfitMargin.toFixed(2)}% margin
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <div className="flex items-center text-sm text-red-100 mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                Operating costs
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-r ${profitData.profit.netProfit >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"} text-white`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profitData.profit.netProfit)}</div>
              <div className="flex items-center text-sm text-white/80 mt-1">
                {profitData.profit.netProfit >= 0 ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {profitData.profit.netProfitMargin.toFixed(2)}% margin
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Health Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Business Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(profitData.revenue.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Expenses</span>
                <span className="font-bold text-red-600">-{formatCurrency(profitData.costs.totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Cost of Goods</span>
                <span className="font-bold text-red-600">-{formatCurrency(profitData.costs.totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border-t-2 border-teal-500">
                <span className="font-bold">Net Profit</span>
                <span
                  className={`font-bold text-xl ${profitData.profit.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(profitData.profit.netProfit)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${profitData.profit.netProfit >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  style={{
                    width: `${Math.min(Math.max((profitData.profit.netProfitMargin + 50) / 100, 0), 1) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {profitData.profit.netProfit >= 0 ? "Profitable Business" : "Review Expenses"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(expensesByCategory).length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No expenses recorded</p>
                <p className="text-gray-500 text-sm">Add your first expense to see breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : "0"
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getCategoryIcon(category)}</div>
                            <div>
                              <p className="font-semibold">{category}</p>
                              <p className="text-sm text-gray-600">{percentage}% of total</p>
                            </div>
                          </div>
                          <p className="font-bold">{formatCurrency(amount)}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getCategoryColor(category),
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Expenses</CardTitle>
              <Button variant="outline" onClick={() => router.push("/expenses")} className="bg-transparent">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent expenses</p>
                <Button onClick={() => router.push("/expenses/add")} className="mt-4">
                  Add First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-gray-600">{expense.category}</p>
                        <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
