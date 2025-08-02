"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, ArrowLeft, RefreshCw, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreditEntry {
  id: string
  customerName: string
  customerPhone?: string
  totalAmount: number
  amountPaid: number
  balance: number
  status: "paid" | "partially_paid" | "unpaid"
  dateTaken: string
  dueDate?: string
  items: OrderItem[]
}

interface OrderItem {
  itemId: string
  itemName: string
  quantity: number
  price: number
  total: number
}

export default function CreditListPage() {
  const router = useRouter()
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<CreditEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data - replace with actual API calls
  const mockCreditEntries: CreditEntry[] = [
    {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+256712345678",
      totalAmount: 150000,
      amountPaid: 50000,
      balance: 100000,
      status: "partially_paid",
      dateTaken: "2024-01-15T10:00:00Z",
      dueDate: "2024-02-15T10:00:00Z",
      items: [
        { itemId: "1", itemName: "Rice 5kg", quantity: 2, price: 25000, total: 50000 },
        { itemId: "2", itemName: "Sugar 2kg", quantity: 4, price: 25000, total: 100000 },
      ],
    },
    {
      id: "2",
      customerName: "Jane Smith",
      customerPhone: "+256787654321",
      totalAmount: 75000,
      amountPaid: 75000,
      balance: 0,
      status: "paid",
      dateTaken: "2024-01-10T14:30:00Z",
      dueDate: "2024-02-10T14:30:00Z",
      items: [{ itemId: "3", itemName: "Cooking Oil 1L", quantity: 3, price: 25000, total: 75000 }],
    },
    {
      id: "3",
      customerName: "Bob Johnson",
      customerPhone: "+256701234567",
      totalAmount: 200000,
      amountPaid: 0,
      balance: 200000,
      status: "unpaid",
      dateTaken: "2024-01-20T09:15:00Z",
      dueDate: "2024-02-20T09:15:00Z",
      items: [{ itemId: "4", itemName: "Maize Flour 10kg", quantity: 4, price: 50000, total: 200000 }],
    },
  ]

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCreditEntries(mockCreditEntries)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load credit entries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = [...creditEntries]

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((entry) => entry.status === statusFilter)
    }

    setFilteredEntries(filtered)
  }, [creditEntries, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "unpaid":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading credit entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Credit Management</h1>
            <p className="text-muted-foreground">Manage customer credit accounts</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => router.push("/credit/add")}>
            <Plus className="h-4 w-4 mr-2" />
            New Credit
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
                  placeholder="Search by customer name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="partially_paid">Partial</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Credit Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No credit entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first credit entry"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => router.push("/credit/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Credit Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/credit/${entry.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{entry.customerName}</CardTitle>
                  <Badge className={getStatusColor(entry.status)}>{entry.status.replace("_", " ").toUpperCase()}</Badge>
                </div>
                {entry.customerPhone && <p className="text-sm text-muted-foreground">{entry.customerPhone}</p>}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">{formatCurrency(entry.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold text-green-600">{formatCurrency(entry.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-semibold text-red-600">{formatCurrency(entry.balance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{formatDate(entry.dueDate)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created on {formatDate(entry.dateTaken)} • {entry.items.length} item(s)
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
