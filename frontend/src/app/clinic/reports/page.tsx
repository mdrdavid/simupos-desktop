/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Link from "next/link"
import { useClinic } from "@/context/ClinicContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Stethoscope,
  Pill,
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  Download,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

export default function ReportsPage() {
  const { stats, generateReport } = useClinic()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "custom">("monthly")

  const reportTypes = [
    {
      id: "revenue",
      title: "Revenue Reports",
      description: "Financial performance and payment analysis",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/clinic/reports/revenue",
      metrics: [
        { label: "Today's Revenue", value: `UGX ${stats.todayRevenue.toLocaleString()}` },
        { label: "Monthly Revenue", value: `UGX ${stats.monthlyRevenue.toLocaleString()}` },
      ],
    },
    {
      id: "services",
      title: "Service Reports",
      description: "Most popular services and performance metrics",
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/clinic/reports/services",
      metrics: [
        { label: "Top Service", value: stats.topServices[0]?.service.name || "N/A" },
        { label: "Service Revenue", value: `UGX ${stats.topServices[0]?.revenue.toLocaleString() || 0}` },
      ],
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      description: "Medicine usage, stock levels, and expiry tracking",
      icon: Pill,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/clinic/reports/inventory",
      metrics: [
        { label: "Low Stock Items", value: stats.lowStockMedicines.toString() },
        { label: "Active Visits", value: stats.activeVisits.toString() },
      ],
    },
    {
      id: "staff",
      title: "Staff Performance",
      description: "Individual staff metrics and productivity",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/clinic/reports/staff",
      metrics: [
        { label: "Today's Patients", value: stats.todayPatients.toString() },
        { label: "Monthly Patients", value: stats.monthlyPatients.toString() },
      ],
    },
  ]

  const quickStats = [
    {
      title: "Today's Revenue",
      value: `UGX ${stats.todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active Visits",
      value: stats.activeVisits.toString(),
      icon: Activity,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockMedicines.toString(),
      icon: Pill,
      change: stats.lowStockMedicines > 0 ? "Action needed" : "All good",
      changeType: stats.lowStockMedicines > 0 ? "negative" : ("positive" as const),
    },
    {
      title: "Monthly Patients",
      value: stats.monthlyPatients.toString(),
      icon: Users,
      change: "+8%",
      changeType: "positive" as const,
    },
  ]

  const handleGenerateReport = (type: "revenue" | "services" | "inventory" | "staff") => {
    const report = generateReport(type, selectedPeriod, dateRange?.from, dateRange?.to)
    // In a real app, this would trigger a download or display the report
    console.log("Generated report:", report)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into your clinic&apos;s performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Date Range and Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
          <CardDescription>Select date range and period for detailed reports</CardDescription>
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
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Reports</h2>

        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {report.metrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-xs text-gray-500">{metric.label}</p>
                          <p className="text-sm font-medium">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={report.href}>
                          <BarChart3 className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateReport(report.id as any)}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            Generate Monthly Summary
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Automated Reports
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
