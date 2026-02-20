"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  User,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  AlertTriangle,
  Mail,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useCRM } from "@/context/CRMContext"
import { Customer } from "@/src/types/crm"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfessionalHubCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  const { fetchCustomerById, deleteCustomer } = useCRM()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true)
      try {
          const customerData = await fetchCustomerById(customerId)
          setCustomer(customerData as Customer | null)
      } catch (error) {
        console.error("Failed to load customer details:", error)
        toast.error("Failed to load customer details")
      } finally {
        setLoading(false)
      }
    }
    loadCustomer()
  }, [customerId, fetchCustomerById])


  const handleCall = () => {
    if (customer?.phone) {
      window.open(`tel:${customer.phone}`, "_self")
    } else {
      toast.error("No phone number available")
    }
  }

  const handleSendSMS = () => {
    if (customer?.phone) {
      window.open(`sms:${customer.phone}`, "_self")
    } else {
      toast.error("No phone number available")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId)
      toast.success("Customer profile removed")
      router.push("/professional-hub/crm")
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value
    return num.toLocaleString()
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "bg-purple-50 text-purple-700 border-purple-100"
      case "Wholesale":
        return "bg-blue-50 text-blue-700 border-blue-100"
      default:
        return "bg-gray-50 text-gray-700 border-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 bg-orange-50 rounded-full mb-4 text-orange-500">
            <AlertTriangle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
        <p className="text-gray-500 text-center max-w-sm mb-8">
            The profile you are looking for might have been deleted or moved.
        </p>
        <Link href="/professional-hub/crm">
          <Button className="bg-brand-primary hover:bg-brand-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Directory
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/professional-hub/crm">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Profile Details</h1>
            <p className="text-gray-500 mt-1">{customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer Profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove <strong>{customer.name}</strong> from your directory. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete Profile
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Link href={`/professional-hub/crm/${customer.id}/edit`}>
                <Button className="bg-brand-primary hover:bg-brand-secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Info */}
        <div className="lg:col-span-2 space-y-8">
            {/* Summary Card */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-md">
                            <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-3xl font-bold">
                            {customer.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                                <Badge variant="outline" className={`${getCustomerTypeColor(customer.customerType || "Regular")} border-none`}>
                                    {customer.customerType || "Regular"}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm font-medium">{customer.phone}</span>
                                </div>
                                {customer.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-medium">{customer.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm font-medium">Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Recently'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 justify-center md:justify-start">
                                <Button size="sm" onClick={handleCall} className="bg-green-600 hover:bg-green-700 h-9">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Now
                                </Button>
                                <Button size="sm" onClick={handleSendSMS} className="bg-blue-600 hover:bg-blue-700 h-9">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Send SMS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Tabs Mock-up (Info & Purchases) */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
                    Detailed Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                                <User className="w-4 h-4 text-brand-primary" />
                                Identity Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Gender</span>
                                <span className="text-sm font-semibold">{customer.gender || "Not specified"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Birthday</span>
                                <span className="text-sm font-semibold">
                                    {customer.birthday ? new Date(customer.birthday).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'}) : "Not set"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Customer ID</span>
                                <span className="text-sm font-mono text-gray-400">{customer.id.substring(0, 8)}...</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-brand-primary" />
                                Activity Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Last Visit</span>
                                <span className="text-sm font-semibold">
                                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "Never"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Total Loyalty Points</span>
                                <span className="text-sm font-bold text-orange-600">{customer.loyaltyPoints || 0} PTS</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Profile Updated</span>
                                <span className="text-sm font-semibold">
                                    {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : "Initial Setup"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase History Section */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
                        Recent Transactions
                    </h3>
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            {customer.purchases && customer.purchases.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {customer.purchases.map((purchase) => (
                                        <div key={purchase.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{purchase.amount.toLocaleString()} UGX</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(purchase.date).toLocaleDateString()} • {purchase.items.length} item(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-gray-400">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center space-y-3">
                                    <ShoppingBag className="w-10 h-10 text-gray-200" />
                                    <p className="text-gray-500 font-medium text-sm">No transaction history found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* Right Column: Financial Highlights & Notes */}
        <div className="space-y-8">
            <Card className="border-none shadow-sm bg-brand-primary text-white">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 opacity-90">
                        <DollarSign className="w-4 h-4" />
                        Financial Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-brand-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Lifetime Value</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-bold">{formatCurrency(customer.totalSpend || 0)}</span>
                            <span className="text-xs opacity-80">UGX</span>
                        </div>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-brand-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider">Average Bill</p>
                            <p className="font-bold">{formatCurrency((customer.totalSpend || 0) / (customer.purchases?.length || 1))} <span className="text-[10px] opacity-80 font-normal">UGX</span></p>
                        </div>
                        <div>
                            <p className="text-brand-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider">Orders</p>
                            <p className="font-bold">{customer.purchases?.length || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                        <Edit className="w-4 h-4 text-brand-primary" />
                        Internal Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customer.notes ? (
                        <p className="text-sm text-gray-600 leading-relaxed italic bg-gray-50 p-4 rounded-xl border-l-4 border-brand-primary">
                            &quot;{customer.notes}&quot;
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No notes added for this customer.</p>
                    )}
                </CardContent>
            </Card>

            <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-orange-800">Account Status</p>
                    <p className="text-xs text-orange-700 leading-relaxed">
                        This customer is currently in good standing. Loyalty points are being accrued on every transaction.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
