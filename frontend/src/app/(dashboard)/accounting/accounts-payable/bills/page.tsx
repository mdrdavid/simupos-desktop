/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/accounts-payable/bills/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  Filter,
  Download,
  MoreHorizontal
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAccountsPayable } from "@/context/AccountsPayableContext"
import { AccountsPayable, BillStatus } from "@/src/types/accountsPayable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BillsListPage() {
  const router = useRouter()
  const { getBills, loading } = useAccountsPayable()
  const [bills, setBills] = useState<AccountsPayable[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all")
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState<any>(null)

  const loadData = useCallback(
    async (
      { page = 1, limit = 20 } = {},
      search = searchTerm,
      status = statusFilter
    ) => {
      try {
        const response = await getBills({
          page,
          limit,
          status: status === "all" ? undefined : status,
        })
        setBills(response.bills)
        setPagination(response.pagination)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bills.",
          variant: "destructive",
        })
      }
    },
    [getBills, searchTerm, statusFilter]
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "received":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "void":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your bills data is being prepared for download.",
    })
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading bills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/accounting/accounts-payable")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bills</h1>
            <p className="text-muted-foreground">Manage all accounts payable bills</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => router.push("/accounting/accounts-payable/bills/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by bill number or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as BillStatus | "all")
              }
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="partially_paid">Partial</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      {bills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No bills found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first bill"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => router.push("/accounting/accounts-payable/bills/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Bill
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/accounting/accounts-payable/bills/${bill.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{bill.billNumber}</CardTitle>
                    <Badge className={getStatusColor(bill.status)}>
                      {bill.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/accounting/accounts-payable/bills/${bill.id}/payment`)
                      }}>
                        Record Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground">
                  {bill.supplier?.name || 'Unknown Supplier'} • {bill.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-c-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold text-green-600">{formatCurrency(bill.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance Due</p>
                    <p className={`font-semibold ${
                      bill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(bill.balanceDue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{formatDate(bill.dueDate)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Issued on {formatDate(bill.issueDate)} • 
                    {bill.lineItems?.length || 0} line item(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}