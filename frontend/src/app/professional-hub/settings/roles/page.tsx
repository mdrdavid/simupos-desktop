"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, UserCheck, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function RolesAndPermissionsPage() {
  const router = useRouter()

  const roles = [
    {
      role: "Owner",
      icon: Shield,
      description: "Full access to all features, settings, and team management.",
      permissions: ["Manage Team", "Manage Financials", "Configure Settings", "View All Reports"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      role: "Manager",
      icon: UserCheck,
      description: "High-level access to operations, team, and financial tracking.",
      permissions: ["Manage Team", "Manage Financials", "View All Reports", "Create Invoices"],
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      role: "Sales Rep",
      icon: Users,
      description: "Access to sales pipeline and basic customer management.",
      permissions: ["View Pipeline", "Manage Leads", "View Own Tasks"],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
            <p className="text-gray-500 mt-1">View access levels for your team members</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((item) => (
            <Card key={item.role} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{item.role}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Permissions</h4>
                <ul className="space-y-2">
                  {item.permissions.map((permission) => (
                    <li key={permission} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-brand-primary/20 bg-brand-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full text-brand-primary shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Custom Permissions</h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Custom role configuration is available for Enterprise Elite customers.
                  Contact support to learn more about advanced access control.
                </p>
              </div>
            </div>
            <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
