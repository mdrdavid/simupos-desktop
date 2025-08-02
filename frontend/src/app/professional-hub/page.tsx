"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, FileText, Receipt, BarChart3, Package, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useWelding } from "@/context/WeldingContext"
import { useWeldingFinancials } from "@/context/WeldingFinancialContext"
import { InvoicePaymentStatus } from "@/src/types/weldingFinancials"

export default function WeldingDashboard() {
  const { weldingJobs, materialStock } = useWelding()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { quotes, invoices } = useWeldingFinancials()

  const quickActions = [
    {
      id: "new-job",
      title: "New Work Order",
      description: "Create a new welding job",
      icon: Plus,
      color: "bg-orange-500 hover:bg-orange-600",
      href: "/professional-hub/jobs/create",
    },
    {
      id: "view-jobs",
      title: "View Work Orders",
      description: "Manage all welding jobs",
      icon: Wrench,
      color: "bg-blue-500 hover:bg-blue-600",
      href: "/professional-hub/jobs",
    },
    {
      id: "quotes",
      title: "Quotes & Estimates",
      description: "Manage customer quotes",
      icon: FileText,
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/professional-hub/quotes",
    },
    {
      id: "invoices",
      title: "Invoices & Billing",
      description: "Handle billing and payments",
      icon: Receipt,
      color: "bg-green-500 hover:bg-green-600",
      href: "/professional-hub/invoices",
    },
    {
      id: "reports",
      title: "Service Reports",
      description: "View analytics and reports",
      icon: BarChart3,
      color: "bg-emerald-500 hover:bg-emerald-600",
      href: "/professional-hub/reports",
    },
    {
      id: "materials",
      title: "Materials Stock",
      description: "Manage inventory",
      icon: Package,
      color: "bg-violet-500 hover:bg-violet-600",
      href: "/professional-hub/materials",
    },
  ]

  const stats = [
    {
      title: "Active Jobs",
      value: weldingJobs.filter((job) => job.status === "IN_PROGRESS" || job.status === "PENDING").length,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completed Jobs",
      value: weldingJobs.filter((job) => job.status === "COMPLETED").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `UGX ${invoices
        .filter((inv) => inv.paymentStatus === InvoicePaymentStatus.PAID)
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: materialStock.filter((item) => item.lowStockThreshold && item.quantityInStock <= item.lowStockThreshold)
        .length,
      icon: Package,
      color: "text-red-600",
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Workshop</h1>
          <p className="text-gray-600 mt-2">Manage your welding operations and projects</p>
        </div>
        <Link href="/professional-hub/jobs/create">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.id} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weldingJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.jobType}</p>
                    <p className="text-sm text-gray-600">{job.customerName}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === "COMPLETED" ? "default" : job.status === "IN_PROGRESS" ? "secondary" : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
              {weldingJobs.length === 0 && <p className="text-gray-500 text-center py-4">No jobs yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Materials running low</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materialStock
                .filter((item) => item.lowStockThreshold && item.quantityInStock <= item.lowStockThreshold)
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantityInStock} {item.unit} remaining
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
              {materialStock.filter((item) => item.lowStockThreshold && item.quantityInStock <= item.lowStockThreshold)
                .length === 0 && <p className="text-gray-500 text-center py-4">All materials well stocked</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
