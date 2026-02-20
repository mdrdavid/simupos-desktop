/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useExpenses } from "@/context/ExpenseContext"
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
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Receipt,
  Calendar,
  DollarSign,
  CreditCard,
  Smartphone,
  Repeat,
} from "lucide-react"

// Using the Expense interface from ExpenseContext instead of defining a local one

export default function ExpensesPage() {
  const { toast } = useToast()
  const { expenses, loading, error, deleteExpense, fetchExpenses, totalExpenses, totalPages, currentPage } = useExpenses()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState<"all" | "day" | "week" | "month" | "year">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch expenses on component mount
  useEffect(() => {
    // Only fetch if not already loading
    if (!loading) {
      fetchExpenses(page, limit, filterPeriod, filterCategory)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filterPeriod, filterCategory])

  // Show error toast if there's an error
  useEffect(() => {
    if (error && error.trim() !== "") {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]) 

  const categories = [
    "all",
    "Inventory",
    "Utilities",
    "Rent",
    "Transport",
    "Marketing",
    "Equipment",
    "Staff",
    "Insurance",
    "Maintenance",
    "Other",
  ]

  const periods = [
    { key: "all", label: "All Time" },
    { key: "day", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ]

  const getFilteredExpenses = () => {
    let filtered = expenses

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredExpenses = getFilteredExpenses()

  const formatCurrency = (amount: number | string) => {
    const parsed =
      typeof amount === "string"
        ? Number(amount.replace(/[^0-9.-]/g, ""))
        : Number(amount)
    const safeAmount = isNaN(parsed) ? 0 : parsed
    return `UGX ${safeAmount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date >= today) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } else if (date >= yesterday) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "inventory":
        return "📦"
      case "utilities":
        return "⚡"
      case "transport":
        return "🚗"
      case "rent":
        return "🏠"
      case "marketing":
        return "📢"
      case "equipment":
        return "🔧"
      case "staff":
        return "👥"
      case "insurance":
        return "🛡️"
      case "maintenance":
        return "🔨"
      default:
        return "📄"
    }
  }

  const getPaymentIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "bank":
        return <CreditCard className="h-4 w-4" />
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentColor = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return "text-green-600"
      case "bank":
        return "text-blue-600"
      case "mobile_money":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getPaymentLabel = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return "Cash"
      case "bank":
        return "Bank"
      case "mobile_money":
        return "Mobile Money"
      default:
        return "Unknown"
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const getExpenseTotals = () => {
    return filteredExpenses.reduce(
      (totals, expense) => {
        const rawAmount = (expense as any).amount
        const parsed =
          typeof rawAmount === "string"
            ? Number(rawAmount.replace(/[^0-9.-]/g, ""))
            : Number(rawAmount)
        const safeAmount = isNaN(parsed) ? 0 : parsed

        if (expense.isRecurring) {
          totals.recurring += safeAmount
        } else {
          totals.other += safeAmount
        }
        return totals
      },
      { recurring: 0, other: 0 }
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterPeriod("all")
    setFilterCategory("all")
    setShowFilterModal(false)
  }

  // Match the loader used on the Users page
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage your business expenses</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/expenses/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(filterPeriod !== "all" || filterCategory !== "all") && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Expenses</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Time Period</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {periods.map((period) => (
                        <Button
                          key={period.key}
                          variant={filterPeriod === period.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterPeriod(period.key as any)}
                          className={filterPeriod !== period.key ? "bg-transparent" : ""}
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={filterCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterCategory(category)}
                          className={filterCategory !== category ? "bg-transparent" : ""}
                        >
                          {category === "all" ? "All Categories" : category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                      Clear All
                    </Button>
                    <Button onClick={() => setShowFilterModal(false)} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recurring Expenses</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(getExpenseTotals().recurring)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Other Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(getExpenseTotals().other)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getExpenseTotals().recurring + getExpenseTotals().other)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <div className="space-y-8">
        <ExpenseList
          title="Recurring Expenses"
          expenses={filteredExpenses.filter((e) => e.isRecurring)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getCategoryIcon={getCategoryIcon}
          getPaymentColor={getPaymentColor}
          getPaymentIcon={getPaymentIcon}
          getPaymentLabel={getPaymentLabel}
          handleDeleteExpense={handleDeleteExpense}
        />
        <ExpenseList
          title="Other Expenses"
          expenses={filteredExpenses.filter((e) => !e.isRecurring)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getCategoryIcon={getCategoryIcon}
          getPaymentColor={getPaymentColor}
          getPaymentIcon={getPaymentIcon}
          getPaymentLabel={getPaymentLabel}
          handleDeleteExpense={handleDeleteExpense}
        />
      </div>

      {filteredExpenses.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchQuery || filterPeriod !== "all" || filterCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Start tracking expenses to see them here"}
            </p>
            {!searchQuery && filterPeriod === "all" && filterCategory === "all" && (
              <Button asChild>
                <Link href="/expenses/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Expense
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Extracted ExpenseList component
function ExpenseList({
  title,
  expenses,
  formatCurrency,
  formatDate,
  getCategoryIcon,
  getPaymentColor,
  getPaymentIcon,
  getPaymentLabel,
  handleDeleteExpense,
}: {
  title: string;
  expenses: any[];
  formatCurrency: (amount: number | string) => string;
  formatDate: (dateString: string) => string;
  getCategoryIcon: (category: string) => string;
  getPaymentColor: (paymentMethod: string) => string;
  getPaymentIcon: (paymentMethod: string) => JSX.Element;
  getPaymentLabel: (paymentMethod: string) => string;
  handleDeleteExpense: (id: string) => Promise<void>;
}) {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{expense.category}</h3>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        {expense.vendor && <span>Vendor: {expense.vendor}</span>}
                        {expense.receiptNumber && <span>Receipt: #{expense.receiptNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getPaymentColor(expense.paymentMethod)}`}>
                      {getPaymentIcon(expense.paymentMethod)}
                      <span>{getPaymentLabel(expense.paymentMethod)}</span>
                    </div>
                    {expense.isRecurring && (
                      <div className="flex items-center gap-1 text-teal-600">
                        <Repeat className="h-4 w-4" />
                        <span>Recurring</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(expense.amount)}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="bg-transparent">
                      <Link href={`/expenses/edit/${expense.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{expense.description}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
