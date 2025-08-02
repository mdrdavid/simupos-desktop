"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Stethoscope, AlertTriangle, TrendingUp, Calendar, Activity, Plus } from "lucide-react"
import { useClinic } from "@/context/ClinicContext"
import Link from "next/link"

export default function ClinicDashboard() {
  const { stats, getLowStockMedicines } = useClinic()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const lowStockMedicines = getLowStockMedicines()

  const quickActions = [
    {
      title: "New Patient",
      href: "/clinic/patients/new",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Start Visit",
      href: "/clinic/visits/new",
      icon: Activity,
      color: "bg-green-500",
    },
    {
      title: "Add Medicine",
      href: "/clinic/pharmacy/stock-entry",
      icon: Plus,
      color: "bg-purple-500",
    },
    {
      title: "View Reports",
      href: "/clinic/reports",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinic Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s your clinic overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedPeriod === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("today")}
            >
              Today
            </Button>
            <Button
              variant={selectedPeriod === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant={selectedPeriod === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("month")}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Patients
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedPeriod === "today"
                      ? stats.todayPatients
                      : selectedPeriod === "week"
                        ? Math.floor(stats.monthlyPatients * 0.25)
                        : stats.monthlyPatients}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedPeriod === "today"
                      ? "Today's"
                      : selectedPeriod === "week"
                        ? "This Week's"
                        : "This Month's"}{" "}
                    Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      selectedPeriod === "today"
                        ? stats.todayRevenue
                        : selectedPeriod === "week"
                          ? Math.floor(stats.monthlyRevenue * 0.25)
                          : stats.monthlyRevenue,
                    )}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Visits</p>
                  <p className="text-2xl font-bold">{stats.activeVisits}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStockMedicines}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.title} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-2 hover:bg-gray-50 bg-transparent"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.title}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Services</CardTitle>
              <Link href="/clinic/reports">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topServices.slice(0, 5).map((service, index) => (
                <div key={service.service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{service.service.name}</p>
                      <p className="text-sm text-gray-600">{service.count} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {service.service.category}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.topServices.length === 0 && (
                <p className="text-center text-gray-500 py-4">No service data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockMedicines.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg text-red-800">Low Stock Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockMedicines.slice(0, 3).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {medicine.quantity} {medicine.unit || "units"}
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
                {lowStockMedicines.length > 3 && (
                  <Link href="/clinic/pharmacy/low-stock">
                    <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                      View All ({lowStockMedicines.length - 3} more)
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Link href="/clinic/visits">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New consultation completed</p>
                  <p className="text-sm text-gray-600">Patient: Sarah Nakato • 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New patient registered</p>
                  <p className="text-sm text-gray-600">Patient: John Mukasa • 4 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Medicine stock updated</p>
                  <p className="text-sm text-gray-600">Paracetamol restocked • 6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
