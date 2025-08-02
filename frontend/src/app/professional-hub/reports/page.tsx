"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, DollarSign, Package, Users, AlertCircle } from "lucide-react"
import { useWelding } from "@/context/WeldingContext"
import { useWeldingFinancials } from "@/context/WeldingFinancialContext"
import type { WeldingJobStatus } from "@/src/types/welding"
import { InvoicePaymentStatus } from "@/src/types/weldingFinancials"

export default function WeldingReportsPage() {
  const { weldingJobs, materialStock } = useWelding()
  const { quotes, invoices } = useWeldingFinancials()

  const reportsData = useMemo(() => {
    // Job statistics
    const jobsByStatus = weldingJobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
      },
      {} as Record<WeldingJobStatus, number>,
    )

    // Financial calculations
    const totalIncome = invoices
      .filter((inv) => inv.paymentStatus === InvoicePaymentStatus.PAID)
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const totalReceivables = invoices
   .filter((inv) => inv.paymentStatus === InvoicePaymentStatus.PAID)
      .reduce((sum, inv) => sum + inv.balanceDue, 0)

    const totalExpenses = weldingJobs.reduce(
      (sum, job) => sum + (job.expenses?.reduce((expSum, exp) => expSum + exp.amount, 0) || 0),
      0,
    )

    // Material stock analysis
    const lowStockItems = materialStock.filter(
      (item) => item.lowStockThreshold && item.quantityInStock <= item.lowStockThreshold,
    )

    // Recent activity
    const recentJobs = weldingJobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return {
      jobsByStatus,
      totalJobs: weldingJobs.length,
      totalQuotes: quotes.length,
      totalInvoices: invoices.length,
      totalIncome,
      totalReceivables,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      lowStockItems,
      recentJobs,
    }
  }, [weldingJobs, quotes, invoices, materialStock])

  const getStatusColor = (status: WeldingJobStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800"
      case "QUOTED":
        return "bg-blue-100 text-blue-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800"
      case "DELIVERED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workshop Reports</h1>
        <p className="text-gray-600 mt-2">Analytics and insights for your welding business</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.totalJobs}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.totalQuotes}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.totalInvoices}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{reportsData.lowStockItems.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Income</p>
              <p className="text-2xl font-bold text-green-600">UGX {reportsData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Outstanding Receivables</p>
              <p className="text-2xl font-bold text-orange-600">UGX {reportsData.totalReceivables.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">UGX {reportsData.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Net Profit</p>
              <p className={`text-2xl font-bold ${reportsData.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                UGX {reportsData.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportsData.jobsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(status as WeldingJobStatus)}>{status}</Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.jobType}</p>
                    <p className="text-sm text-gray-600">{job.customerName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                    <p className="text-sm text-gray-600 mt-1">UGX {job.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {reportsData.recentJobs.length === 0 && <p className="text-gray-500 text-center py-4">No recent jobs</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {reportsData.lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Low Stock Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {reportsData.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">
                      {item.quantityInStock} {item.unit} remaining
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
