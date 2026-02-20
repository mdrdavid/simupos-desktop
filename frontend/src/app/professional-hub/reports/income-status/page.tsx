"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Printer, TrendingUp, TrendingDown, Wallet, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useProfessionalHubFinancials } from "@/context/ProfessionalHubFinancialContext"
import { useBusiness } from "@/context/BusinessContext"
import { generateFinancialReportPDF, generateFinancialReportExcel } from "@/src/utils/exportUtils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IncomeStatusReport() {
  const { incomes, expenses, isLoading } = useProfessionalHubFinancials()
  const { currentBusiness } = useBusiness()
  const [period, setPeriod] = useState("month")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const reportData = useMemo(() => {
    const now = new Date()
    const filteredIncomes = incomes.filter(inc => {
      const d = new Date(inc.date)
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (period === "year") return d.getFullYear() === now.getFullYear()
      return true
    })

    const filteredExpenses = expenses.filter(exp => {
      const d = new Date(exp.date)
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (period === "year") return d.getFullYear() === now.getFullYear()
      return true
    })

    const totalIncome = filteredIncomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0)
    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
    const balance = totalIncome - totalExpense

    // Group by category for breakdown
    const incomeByCategory = filteredIncomes.reduce((acc, inc) => {
      acc[inc.category] = (acc[inc.category] || 0) + (Number(inc.amount) || 0)
      return acc
    }, {} as Record<string, number>)

    const expenseByCategory = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (Number(exp.amount) || 0)
      return acc
    }, {} as Record<string, number>)

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeByCategory,
      expenseByCategory,
      filteredIncomes,
      filteredExpenses
    }
  }, [incomes, expenses, period])

  const handlePrint = () => {
    window.print()
  }

  if (!isMounted || (isLoading && incomes.length === 0 && expenses.length === 0)) {
    return <div className="container mx-auto p-6 text-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading report...</p>
    </div>
  }

  return (
    <div className="container mx-auto p-6 space-y-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/professional-hub/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Income Status</h1>
            <p className="text-gray-600 mt-1">Financial health overview and balance sheet</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => generateFinancialReportExcel("Income Status", [...reportData.filteredIncomes, ...reportData.filteredExpenses], period)}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            className="bg-brand-primary"
            onClick={() => generateFinancialReportPDF("Income Status", [...reportData.filteredIncomes, ...reportData.filteredExpenses], period, { totalIncome: reportData.totalIncome, totalExpense: reportData.totalExpense, balance: reportData.balance }, currentBusiness)}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Header for Print */}
      <div className="hidden print:block mb-8 border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Income Status Report</h1>
            <p className="text-gray-600">Period: {period.toUpperCase()}</p>
            <p className="text-sm text-gray-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
          </div>
          {currentBusiness && (
            <div className="text-right">
              <h2 className="font-bold text-lg">{currentBusiness.name}</h2>
              <p className="text-sm text-gray-600">{currentBusiness.address}</p>
              <p className="text-sm text-gray-600">{currentBusiness.phone}</p>
              <p className="text-sm text-gray-600">{currentBusiness.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">UGX {reportData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenditure</p>
                <p className="text-2xl font-bold text-red-600">UGX {reportData.totalExpense.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${reportData.balance >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${reportData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  UGX {reportData.balance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Income by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold">UGX {amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(reportData.incomeByCategory).length === 0 && (
                <p className="text-center text-gray-500 py-4">No income data for this period</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Expenditure by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.expenseByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold">UGX {amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(reportData.expenseByCategory).length === 0 && (
                <p className="text-center text-gray-500 py-4">No expenditure data for this period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Transaction List for Report */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Type</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Category</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Description</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...reportData.filteredIncomes, ...reportData.filteredExpenses]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 20)
                  .map((tx, idx) => {
                    const isIncome = 'source' in tx
                    return (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-3 text-sm">
                          <Badge variant={isIncome ? "default" : "outline"} className={isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isIncome ? "Income" : "Expense"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{tx.category}</td>
                        <td className="p-3 text-sm text-gray-600 truncate max-w-[200px]">{tx.description}</td>
                        <td className={`p-3 text-sm text-right font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                          {isIncome ? "+" : "-"} UGX {Number(tx.amount).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
