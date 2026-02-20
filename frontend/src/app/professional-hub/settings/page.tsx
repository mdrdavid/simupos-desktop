"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings as SettingsIcon, ChevronRight, Store, Shield, Bell, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function ProfessionalHubSettings() {
  const { user } = useAuth()
  const isAuthorized = user?.role === "owner" || user?.role === "manager" || user?.role === "admin"

  const settingsSections = [
    {
      title: "Team & Access",
      description: "Manage your team and permissions",
      icon: Users,
      items: [
        {
          title: "User Management",
          description: "Add, edit, and manage team members",
          icon: Users,
          href: "/professional-hub/settings/users",
          authorizedOnly: true,
        },
        {
          title: "Roles & Permissions",
          description: "View and configure access levels",
          icon: Shield,
          href: "/professional-hub/settings/roles",
          authorizedOnly: true,
        },
      ],
    },
    {
      title: "Business Settings",
      description: "Configure your business profile",
      icon: Store,
      items: [
        {
          title: "Business Profile",
          description: "Update your business name, logo, and contact info",
          icon: Store,
          href: "/settings/shop?from=professional-hub",
          authorizedOnly: true,
        },
      ],
    },
    {
      title: "General",
      description: "App preferences and support",
      icon: SettingsIcon,
      items: [
        {
          title: "Notifications",
          description: "Configure how you receive updates",
          icon: Bell,
          href: "#",
          authorizedOnly: false,
        },
        {
          title: "Help & Support",
          description: "Get assistance and view tutorials",
          icon: HelpCircle,
          href: "#",
          authorizedOnly: false,
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your workspace and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {settingsSections.map((section) => {
              const visibleItems = section.items.filter(item => !item.authorizedOnly || isAuthorized)

              if (visibleItems.length === 0) return null

              return (
                <div key={section.title} className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                      <section.icon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {visibleItems.map((item) => (
                      <Link key={item.title} href={item.href}>
                        <Card className="hover:shadow-md hover:border-brand-primary/20 transition-all cursor-pointer group">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-brand-primary/5 transition-colors">
                                <item.icon className="w-5 h-5 text-gray-600 group-hover:text-brand-primary transition-colors" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-6">
            <Card className="bg-brand-primary text-white border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <SettingsIcon className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Account Info</CardTitle>
                <CardDescription className="text-brand-primary-foreground/80">
                  Currently logged in as
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm opacity-80 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <Link href="/profile">
                    <button className="w-full py-2 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                      View Profile
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
