/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, FileText, Receipt, BarChart3, Package, Plus, TrendingUp, TrendingDown, Clock, CheckCircle, Star, Users, Settings } from "lucide-react"
import Link from "next/link"
import { useWelding } from "@/context/WeldingContext"
import { useWeldingFinancials } from "@/context/WeldingFinancialContext"
import { useProfessionalHubFinancials } from "@/context/ProfessionalHubFinancialContext"
import { RevenueAnalysis } from "@/components/professional-hub/RevenueAnalysis"
import { useAuth } from "@/context/AuthContext"

export default function WeldingDashboard() {
  const { user } = useAuth()
  const isAuthorized = user?.role === "owner" || user?.role === "manager" || user?.role === "admin"
  const { weldingJobs, materialStock } = useWelding()
  const { incomes, expenses } = useProfessionalHubFinancials()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { quotes, invoices } = useWeldingFinancials()

  const jobRevenue = weldingJobs.map((job) => {
    const jobInvoices = invoices.filter((inv) => inv.weldingJobId === job.id)
    const revenueCollected = jobInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0)
    return {
      job,
      revenueCollected,
    }
  })

  const topPerformingJob = jobRevenue.sort((a, b) => b.revenueCollected - a.revenueCollected)[0]

  const actionCategories = [
    {
      title: "Core Operations",
      actions: [
        {
          id: "new-job",
          title: "New Work Order",
          description: "Create a new job",
          icon: Plus,
          color: "bg-brand-primary text-white",
          href: "/professional-hub/jobs/create",
        },
        {
          id: "view-jobs",
          title: "View Work Orders",
          description: "Manage all Workshop jobs",
          icon: Wrench,
          color: "bg-blue-50 text-blue-600",
          href: "/professional-hub/jobs",
        },
        {
          id: "materials",
          title: "Materials Stock",
          description: "Manage inventory",
          icon: Package,
          color: "bg-violet-50 text-violet-600",
          href: "/professional-hub/materials",
        },
        {
          id: "pipeline",
          title: "Sales Pipeline",
          description: "Manage leads & deals",
          icon: TrendingUp,
          color: "bg-blue-50 text-blue-600",
          href: "/professional-hub/pipeline",
        },
      ],
    },
    {
      title: "Customer Relations",
      actions: [
        {
          id: "crm",
          title: "Customer Directory",
          description: "Manage customer profiles",
          icon: Users,
          color: "bg-orange-50 text-orange-600",
          href: "/professional-hub/crm",
        },
      ],
    },
    {
      title: "Financial Management",
      actions: [
        {
          id: "quotes",
          title: "Quotes & Estimates",
          description: "Manage customer quotes",
          icon: FileText,
          color: "bg-purple-50 text-purple-600",
          href: "/professional-hub/quotes",
        },
        {
          id: "invoices",
          title: "Invoices & Billing",
          description: "Handle billing and payments",
          icon: Receipt,
          color: "bg-green-50 text-green-600",
          href: "/professional-hub/invoices",
        },
        {
          id: "income",
          title: "Income Tracking",
          description: "Manage business income",
          icon: TrendingUp,
          color: "bg-teal-50 text-teal-600",
          href: "/professional-hub/income",
        },
        {
          id: "expenses",
          title: "Expense Tracker",
          description: "Manage business costs",
          icon: TrendingDown,
          color: "bg-rose-50 text-rose-600",
          href: "/professional-hub/expenses",
        },
      ],
    },
    {
      title: "Analytics & Reports",
      actions: [
        {
          id: "reports",
          title: "Financial & Service Reports",
          description: "View analytics and reports",
          icon: BarChart3,
          color: "bg-emerald-50 text-emerald-600",
          href: "/professional-hub/reports",
        },
      ],
    },
    {
      title: "Settings & Management",
      actions: [
        {
          id: "settings",
          title: "Hub Settings",
          description: "Configure your workspace",
          icon: Settings,
          color: "bg-gray-100 text-gray-600",
          href: "/professional-hub/settings",
        },
        {
          id: "users",
          title: "Team Management",
          description: "Manage team access",
          icon: Users,
          color: "bg-brand-primary/10 text-brand-primary",
          href: "/professional-hub/settings/users",
        },
      ],
    },
  ]

  const filteredActionCategories = isAuthorized
    ? actionCategories
    : actionCategories.map(cat => ({
        ...cat,
        actions: cat.actions.filter(action => action.id === "pipeline")
      })).filter(cat => cat.actions.length > 0)

  const stats = [
    {
      title: "Active Jobs",
      value: weldingJobs.filter((job) => job.status === "In Progress" || job.status === "Pending").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Jobs",
      value: weldingJobs.filter((job) => job.status === "Completed").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenue Collected",
      value: `UGX ${(
        invoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0) +
        incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0)
      ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "text-brand-primary",
      bgColor: "bg-brand-primary/10",
    },
    {
      title: "Top Performing Job",
      value: topPerformingJob ? `${topPerformingJob.job.jobType}` : "N/A",
      subValue: topPerformingJob ? topPerformingJob.job.customerName : "",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Professional Hub</h1>
            <p className="text-gray-500 mt-1">Workspace overview and operational metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/professional-hub/jobs/create" className="w-full md:w-auto">
              <Button className="w-full bg-brand-primary hover:bg-brand-secondary text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Work Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 flex items-center justify-between overflow-hidden">
                  <div className="space-y-1 min-w-0 flex-1 mr-2">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p
                      className="text-xl md:text-2xl font-bold text-gray-900 truncate"
                      title={String(stat.value)}
                    >
                      {stat.value}
                    </p>
                    {stat.subValue && (
                      <p className="text-xs text-gray-400 truncate" title={stat.subValue}>
                        {stat.subValue}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Sections */}
        <div className="space-y-6">
          {filteredActionCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
                {category.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.actions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all cursor-pointer group">
                      <CardContent className="p-5 flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${action.color} transition-colors group-hover:bg-brand-primary group-hover:text-white`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Analysis - Occupies 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
              Revenue Performance
            </h2>
            <RevenueAnalysis jobs={weldingJobs} invoices={invoices} />
          </div>

          {/* Recent Jobs - Occupies 1 column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
              Recent Activity
            </h2>
            <Card className="border-none shadow-sm h-[calc(100%-2rem)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Latest Work Orders</CardTitle>
                <CardDescription className="text-xs">Quick view of recent jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weldingJobs.slice(0, 6).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-xl hover:border-brand-primary/20 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{job.jobType}</span>
                        <span className="text-xs text-gray-500">{job.customerName}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : job.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-orange-50 text-orange-700 border-orange-100"
                        }`}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                  {weldingJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <div className="p-3 bg-gray-50 rounded-full">
                        <Clock className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 italic">No recent activity</p>
                    </div>
                  )}
                </div>
                {weldingJobs.length > 0 && (
                  <Link href="/professional-hub/jobs">
                    <Button variant="ghost" className="w-full mt-4 text-xs text-brand-primary hover:text-brand-secondary hover:bg-brand-primary/5">
                      View All Jobs
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
