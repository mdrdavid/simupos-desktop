/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "lucide-react"
import Link from "next/link"
import { useCRM } from "@/context/CRMContext"
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

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  const { getCustomerById, deleteCustomer } = useCRM()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const loadCustomer = async () => {
    setLoading(true)
    try {
      const customerData = await getCustomerById(customerId)
      setCustomer(customerData)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to load customer details")
    } finally {
      setLoading(false)
    }
  }

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
      toast.success("Customer deleted successfully")
      router.push("/crm")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
        return "bg-purple-100 text-purple-800"
      case "Wholesale":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2">Loading customer details...</span>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
        <p className="text-gray-600 mb-4">The customer you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/crm">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/crm">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer Details</p>
          </div>
        </div>
      </div>

      {/* Customer Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-teal-100 text-teal-600 text-2xl">
                  {customer.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <Badge className={`${getCustomerTypeColor(customer.customerType || "Regular")} mt-2`}>
                  {customer.customerType || "Regular"} Customer
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCall} className="bg-green-600 hover:bg-green-700">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button onClick={handleSendSMS} className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS
              </Button>
              <Link href={`/crm/${customer.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{customer.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{customer.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-lg">{customer.gender || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Birthday</label>
                  <p className="text-lg">
                    {customer.birthday ? new Date(customer.birthday).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Purchase History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.purchases && customer.purchases.length > 0 ? (
                <div className="space-y-4">
                  {customer.purchases.map((purchase: any) => (
                    <div key={purchase.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">{new Date(purchase.date).toLocaleDateString()}</p>
                          <p className="font-semibold text-lg">{purchase.amount.toLocaleString()} UGX</p>
                          <p className="text-sm text-gray-600">Items: {purchase.items.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No purchase history available.</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Spend</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpend || 0)} UGX</p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500">Last Visit</label>
                <p className="text-lg">
                  {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500">Loyalty Points</label>
                <p className="text-lg font-semibold">{customer.loyaltyPoints || 0} points</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/crm/${customer.id}/edit`}>
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Customer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {customer.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
